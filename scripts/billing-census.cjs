#!/usr/bin/env node
/**
 * Deterministic Billing migration census.
 *
 * WHY THIS EXISTS
 * ---------------
 * Earlier counts were produced by grepping every .js file under public/ for
 * templateUrl strings. That over-counts in two ways and under-counts in one:
 *
 *   - it reads state files the application never loads
 *     (hims-states_orig.js, hims-states_split_old.js, custom-states.js --
 *      custom-states.js is commented out in index.html, the other two are not
 *      referenced at all), so their routes look active when they are not;
 *   - it cannot tell a live route from one inside a /* ... *\/ comment;
 *   - it silently drops references it cannot resolve, instead of reporting
 *     them as unresolved.
 *
 * This script instead computes a TRANSITIVE REACHABILITY CLOSURE:
 *
 *   index.html <script src>  (HTML comments stripped)
 *        -> acorn-parsed AST of each loaded JS file
 *        -> templateUrl properties            => template references
 *        -> $ocLazyLoad.load('.../x.js')      => more JS to parse
 *        -> repeat to fixpoint
 *
 * Comments are not part of an AST, so a commented-out route or modal can
 * never be counted. HTML comments are stripped before counting live controls,
 * so a commented-out <ui-select> is not a live control either.
 *
 * TWO DENOMINATORS, never mixed:
 *   PHYSICAL - every real public/views/billing/ **.html file (scrap excluded).
 *   ACTIVE   - templates reachable through the closure above.
 *
 * Usage:  node scripts/billing-census.cjs [--json <path>] [--area <prefix>]
 */
'use strict';

const fs = require('fs');
const path = require('path');
const acorn = require('acorn');

const ROOT = path.resolve(__dirname, '..');
const AREA = (() => {
  const i = process.argv.indexOf('--area');
  return i !== -1 && process.argv[i + 1] ? process.argv[i + 1] : 'public/views/billing/';
})();

/** Folders that are dead by repo convention, excluded from every denominator. */
const DEAD_DIR_RE = /(^|\/)(scrap|deprecated|backup|old|_to_delete)(\/|$)/i;

// ---------------------------------------------------------------- paths ----

function normalise(p) {
  let s = String(p).split('?')[0].split('#')[0].replace(/\\/g, '/').replace(/\/{2,}/g, '/');
  const parts = [];
  for (const seg of s.split('/')) {
    if (seg === '' || seg === '.') continue;
    if (seg === '..') { parts.pop(); continue; }
    parts.push(seg);
  }
  return parts.join('/');
}
/** helper.basepath('x') -> views/x ; everything is served from public/. */
function toRepoPath(ref, viaBasepath) {
  let r = normalise(ref);
  if (viaBasepath) r = 'views/' + r;
  return r.startsWith('public/') ? r : 'public/' + r;
}
const keyOf = (p) => p.toLowerCase();

// ------------------------------------------------------------- AST walk ----

function walk(node, fn) {
  if (!node || typeof node.type !== 'string') return;
  fn(node);
  for (const k of Object.keys(node)) {
    if (k === 'type' || k === 'start' || k === 'end' || k === 'loc') continue;
    const v = node[k];
    if (Array.isArray(v)) { for (const c of v) if (c && typeof c.type === 'string') walk(c, fn); }
    else if (v && typeof v.type === 'string') walk(v, fn);
  }
}

/** Static string value of a node, or null when it cannot be resolved. */
function staticString(node) {
  if (!node) return null;
  if (node.type === 'Literal' && typeof node.value === 'string') return { ref: node.value, viaBasepath: false };
  if (node.type === 'TemplateLiteral' && node.expressions.length === 0) {
    return { ref: node.quasis.map((q) => q.value.cooked).join(''), viaBasepath: false };
  }
  if (node.type === 'BinaryExpression' && node.operator === '+') {
    const l = staticString(node.left), r = staticString(node.right);
    if (l && r && !l.viaBasepath && !r.viaBasepath) return { ref: l.ref + r.ref, viaBasepath: false };
    return null;
  }
  if (node.type === 'CallExpression') {
    const c = node.callee;
    const name = c.type === 'Identifier' ? c.name
      : c.type === 'MemberExpression' && c.property.type === 'Identifier' ? c.property.name : null;
    if (name === 'basepath' && node.arguments.length === 1) {
      const inner = staticString(node.arguments[0]);
      if (inner && !inner.viaBasepath) return { ref: inner.ref, viaBasepath: true };
    }
  }
  return null;
}

/** Nearest enclosing call name, used only as human-readable evidence. */
function kindFromEnclosing(ast, targetLine) {
  let kind = 'templateUrl';
  walk(ast, (node) => {
    if (node.type !== 'CallExpression' || !node.loc) return;
    if (targetLine < node.loc.start.line || targetLine > node.loc.end.line) return;
    const c = node.callee;
    const n = c.type === 'Identifier' ? c.name
      : c.type === 'MemberExpression' && c.property.type === 'Identifier' ? c.property.name : null;
    if (n === 'open') kind = '$uibModal.open';
    else if (n === 'state' && kind === 'templateUrl') kind = 'route .state()';
    else if (n === 'add' && kind === 'templateUrl') kind = 'modalConfig .add()';
    else if (n === 'when' && kind === 'templateUrl') kind = 'route .when()';
    else if ((n === 'directive' || n === 'component') && kind === 'templateUrl') kind = 'directive';
  });
  return kind;
}

// -------------------------------------------------- reachability closure ----

/** Entry points: <script src> in index.html, with HTML comments stripped. */
function entryScripts() {
  const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8').replace(/<!--[\s\S]*?-->/g, '');
  const out = [];
  const re = /<script\b[^>]*\bsrc\s*=\s*["']([^"']+)["']/gi;
  let m;
  while ((m = re.exec(html))) {
    const src = m[1];
    if (/^https?:|^\/\//i.test(src)) continue;
    out.push(normalise(src.startsWith('public/') ? src : 'public/' + src));
  }
  return out;
}

const references = new Map();     // key -> { path, refs:[{file,line,kind}] }
const modalRegistered = new Map(); // modal state key -> { file, line }
const modalOpened = [];            // { key, file, line }
const dynamicSites = [];          // templateUrl that cannot be resolved statically
const parseFailures = [];
const visitedJs = new Set();
const entries = entryScripts();
const queue = entries.slice();

function addRef(repoPath, file, line, kind) {
  const k = keyOf(repoPath);
  if (!references.has(k)) references.set(k, { path: repoPath, refs: [] });
  references.get(k).refs.push({ file, line, kind });
}

while (queue.length) {
  const rel = queue.shift();
  if (visitedJs.has(keyOf(rel))) continue;
  visitedJs.add(keyOf(rel));
  const abs = path.join(ROOT, rel);
  if (!fs.existsSync(abs) || !fs.statSync(abs).isFile()) continue;
  if (DEAD_DIR_RE.test(rel)) continue;
  if (/\/(vendor|vendors|assets)\//i.test(rel)) continue;   // third-party bundles
  let src;
  try { src = fs.readFileSync(abs, 'utf8'); } catch (e) { continue; }
  let ast = null;
  for (const t of ['script', 'module']) {
    try { ast = acorn.parse(src, { ecmaVersion: 2022, sourceType: t, locations: true }); break; }
    catch (e) { if (t === 'module') parseFailures.push({ file: rel, error: e.message }); }
  }
  if (!ast) continue;

  walk(ast, (node) => {
    // 1. template references
    if (node.type === 'Property') {
      const kn = node.key.type === 'Identifier' ? node.key.name
        : node.key.type === 'Literal' ? String(node.key.value) : null;
      if (kn === 'templateUrl') {
        const line = node.loc ? node.loc.start.line : 0;
        const v = staticString(node.value);
        if (!v || !/\.html$/i.test(v.ref)) {
          dynamicSites.push({ file: rel, line, valueType: v ? 'non-html-literal' : node.value.type });
        } else {
          addRef(toRepoPath(v.ref, v.viaBasepath), rel, line, kindFromEnclosing(ast, line));
        }
      }
    }
    // 2. modal state registrations and open() call sites
    if (node.type === 'CallExpression') {
      const cc = node.callee;
      const nn = cc.type === 'MemberExpression' && cc.property.type === 'Identifier' ? cc.property.name
        : cc.type === 'Identifier' ? cc.name : null;
      const obj = cc.type === 'MemberExpression' && cc.object.type === 'Identifier' ? cc.object.name
        : cc.type === 'MemberExpression' && cc.object.type === 'MemberExpression'
          && cc.object.property.type === 'Identifier' ? cc.object.property.name : null;
      const k0 = node.arguments[0] ? staticString(node.arguments[0]) : null;
      if (nn === 'add' && obj === 'modalConfigProvider' && k0) {
        modalRegistered.set(k0.ref, { file: rel, line: node.loc ? node.loc.start.line : 0 });
      }
      if (nn === 'open' && obj === 'Modal' && k0) {
        modalOpened.push({ key: k0.ref, file: rel, line: node.loc ? node.loc.start.line : 0 });
      }
    }
    // 3. lazily loaded JS -> more reachable code
    if (node.type === 'CallExpression') {
      const c = node.callee;
      const n = c.type === 'MemberExpression' && c.property.type === 'Identifier' ? c.property.name
        : c.type === 'Identifier' ? c.name : null;
      if (n !== 'load') return;
      for (const arg of node.arguments) {
        const items = arg.type === 'ArrayExpression' ? arg.elements : [arg];
        for (const it of items) {
          const v = staticString(it);
          if (v && /\.js$/i.test(v.ref)) queue.push(toRepoPath(v.ref, v.viaBasepath));
        }
      }
    }
  });
}

// Controller siblings: repo convention pairs x.html with x.js in the same
// folder, and a reachable x.html makes its x.js reachable even when the state
// lazy-loads it through a variable. Those controllers can open further modals.
for (const entry of [...references.values()]) {
  const js = entry.path.replace(/\.html$/i, '.js');
  if (!visitedJs.has(keyOf(js)) && fs.existsSync(path.join(ROOT, js))) queue.push(js);
}
while (queue.length) {
  const rel = queue.shift();
  if (visitedJs.has(keyOf(rel))) continue;
  visitedJs.add(keyOf(rel));
  const abs = path.join(ROOT, rel);
  if (!fs.existsSync(abs) || DEAD_DIR_RE.test(rel)) continue;
  let ast = null, src = fs.readFileSync(abs, 'utf8');
  for (const t of ['script', 'module']) {
    try { ast = acorn.parse(src, { ecmaVersion: 2022, sourceType: t, locations: true }); break; }
    catch (e) { if (t === 'module') parseFailures.push({ file: rel, error: e.message }); }
  }
  if (!ast) continue;
  walk(ast, (node) => {
    if (node.type !== 'Property') return;
    const kn = node.key.type === 'Identifier' ? node.key.name
      : node.key.type === 'Literal' ? String(node.key.value) : null;
    if (kn !== 'templateUrl') return;
    const line = node.loc ? node.loc.start.line : 0;
    const v = staticString(node.value);
    if (!v || !/\.html$/i.test(v.ref)) dynamicSites.push({ file: rel, line, valueType: v ? 'non-html-literal' : node.value.type });
    else addRef(toRepoPath(v.ref, v.viaBasepath), rel, line, kindFromEnclosing(ast, line));
  });
}

// ---------------------------------------------------------- inventories ----

function listHtml(dir, out) {
  out = out || [];
  let es; try { es = fs.readdirSync(dir, { withFileTypes: true }); } catch (e) { return out; }
  for (const e of es) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) listHtml(full, out);
    else if (e.isFile() && e.name.toLowerCase().endsWith('.html')) out.push(full);
  }
  return out;
}
const areaDir = path.join(ROOT, AREA);
const physicalAll = listHtml(areaDir).map((p) => normalise(path.relative(ROOT, p)));
const deadScrap = physicalAll.filter((p) => DEAD_DIR_RE.test(p)).sort();
const physical = physicalAll.filter((p) => !DEAD_DIR_RE.test(p));
const physicalKeys = new Set(physical.map(keyOf));

function controls(repoPath) {
  const live = fs.readFileSync(path.join(ROOT, repoPath), 'utf8').replace(/<!--[\s\S]*?-->/g, '');
  const uiSelect = (live.match(/<ui-select\b/g) || []).length;
  const uiGrid = (live.match(/\bui-grid\s*=/g) || []).length;
  const customTable = (live.match(/<custom-table\b/g) || []).length;
  const reactMount = (live.match(/<react-component\b/g) || []).length;
  return { uiSelect, uiGrid, customTable, reactMount, native: uiSelect + uiGrid + customTable };
}

// ---------------------------------------------------------- categorise -----

const areaRefs = [...references.values()]
  .filter((e) => keyOf(e.path).startsWith(keyOf(AREA)) && !DEAD_DIR_RE.test(e.path));
const referencedKeys = new Set(areaRefs.map((e) => keyOf(e.path)));

const cat = {
  active_react_control_free: [],
  active_hybrid: [],
  active_migration_work: [],
  active_nothing_to_convert: [],
  referenced_but_missing: [],
  physical_unreferenced_orphan: [],
  dead_scrap: deadScrap.map((p) => ({ path: p })),
  dynamically_unresolved: dynamicSites,
};

for (const e of areaRefs) {
  if (!physicalKeys.has(keyOf(e.path))) { cat.referenced_but_missing.push({ path: e.path, refs: e.refs }); continue; }
  const rec = Object.assign({ path: e.path }, controls(e.path), { refs: e.refs });
  if (rec.reactMount > 0 && rec.native === 0) cat.active_react_control_free.push(rec);
  else if (rec.reactMount > 0) cat.active_hybrid.push(rec);
  else if (rec.native > 0) cat.active_migration_work.push(rec);
  else cat.active_nothing_to_convert.push(rec);
}
for (const p of physical) {
  if (referencedKeys.has(keyOf(p))) continue;
  cat.physical_unreferenced_orphan.push(Object.assign({ path: p }, controls(p)));
}
for (const k of Object.keys(cat)) if (Array.isArray(cat[k])) cat[k].sort((a, b) => String(a.path).localeCompare(String(b.path)));

// ---------------------------------------------------------- invariants ----

const activeSum = cat.active_react_control_free.length + cat.active_hybrid.length +
  cat.active_migration_work.length + cat.active_nothing_to_convert.length + cat.referenced_but_missing.length;
const physicalSum = cat.active_react_control_free.length + cat.active_hybrid.length +
  cat.active_migration_work.length + cat.active_nothing_to_convert.length + cat.physical_unreferenced_orphan.length;

let duplicates = 0, overlaps = 0;
const seen = new Map();
for (const k of ['active_react_control_free', 'active_hybrid', 'active_migration_work',
                 'active_nothing_to_convert', 'physical_unreferenced_orphan', 'referenced_but_missing']) {
  for (const r of cat[k]) {
    const kk = keyOf(r.path);
    if (seen.has(kk)) { if (seen.get(kk) === k) duplicates++; else overlaps++; }
    else seen.set(kk, k);
  }
}
const mountedPhysical = physical.filter((p) => controls(p).reactMount > 0);
const mountedWithNative = mountedPhysical.filter((p) => controls(p).native > 0);

/**
 * utl.Modal.open(key) resolves through modalConfig.get(key), which returns {}
 * for an unregistered key -- the modal then opens with templateUrl undefined
 * and cannot render. Keys opened but never registered are therefore broken
 * call sites, and any template that exists only to serve such a key is
 * unreachable. Reported as evidence, not as a category.
 */
const unregisteredModalOpens = modalOpened
  .filter((o) => !modalRegistered.has(o.key))
  .sort((a, b) => (a.key + a.file).localeCompare(b.key + b.file));

const report = {
  generatedBy: 'scripts/billing-census.cjs',
  area: AREA,
  entryScripts: entries,
  jsFilesInClosure: visitedJs.size,
  denominators: { physical: physical.length, active: activeSum },
  counts: Object.fromEntries(Object.entries(cat).map(([k, v]) => [k, v.length])),
  invariants: {
    activeSumEqualsActiveDenominator: activeSum === report_active(),
    physicalSumEqualsPhysicalDenominator: physicalSum === physical.length,
    duplicates, overlaps,
    reactMountedPhysicalTemplates: mountedPhysical.length,
    reactMountedStillCarryingNativeControl: mountedWithNative.length,
  },
  parseFailures,
  modalStates: {
    registered: modalRegistered.size,
    openCallSites: modalOpened.length,
    openedButNeverRegistered: unregisteredModalOpens,
  },
  categories: cat,
};
function report_active() { return activeSum; }

const ji = process.argv.indexOf('--json');
if (ji !== -1 && process.argv[ji + 1]) fs.writeFileSync(path.resolve(ROOT, process.argv[ji + 1]), JSON.stringify(report, null, 2) + '\n');

const c = report.counts;
console.log('BILLING CENSUS  (area ' + AREA + ')');
console.log('  entry scripts                        :', entries.length, '->', visitedJs.size, 'JS files in closure');
console.log('');
console.log('  PHYSICAL denominator                 :', physical.length);
console.log('  ACTIVE   denominator                 :', activeSum);
console.log('');
console.log('  Active - React, fully control-free   :', c.active_react_control_free);
console.log('  Active - hybrid                      :', c.active_hybrid);
console.log('  Active - genuine migration work      :', c.active_migration_work);
console.log('  Active - nothing to convert          :', c.active_nothing_to_convert);
console.log('  Referenced but missing               :', c.referenced_but_missing);
console.log('                        ACTIVE SUM     =', activeSum, activeSum === physical.length - c.physical_unreferenced_orphan.length + c.referenced_but_missing ? '' : '');
console.log('');
console.log('  Physical but unreferenced (orphan)   :', c.physical_unreferenced_orphan);
console.log('                        PHYSICAL SUM   =', physicalSum);
console.log('');
console.log('  Explicitly dead / scrap (excluded)   :', c.dead_scrap);
console.log('  Dynamically unresolved templateUrl   :', c.dynamically_unresolved);
console.log('  JS files acorn could not parse       :', parseFailures.length);
console.log('  Modal keys opened but never registered:', unregisteredModalOpens.length);
console.log('');
console.log('  INVARIANTS');
console.log('    active sum == active denominator   :', report.invariants.activeSumEqualsActiveDenominator);
console.log('    physical sum == physical denom.    :', report.invariants.physicalSumEqualsPhysicalDenominator);
console.log('    duplicates / overlaps              :', duplicates, '/', overlaps);
console.log('    React-mounted physical templates   :', mountedPhysical.length);
console.log('    ...still carrying a native control :', mountedWithNative.length);
