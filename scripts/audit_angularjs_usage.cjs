// scripts/audit_angularjs_usage.cjs
const fs = require('fs');
const path = require('path');

function walkDir(dir, filterFn) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      results = results.concat(walkDir(filePath, filterFn));
    } else if (!filterFn || filterFn(filePath)) {
      results.push(filePath);
    }
  }
  return results;
}

console.log('=== RUNNING COMPREHENSIVE ANGULARJS AUDIT ===\n');

// 1. Dependencies in package.json and index.html
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const indexHtml = fs.readFileSync('index.html', 'utf8');

const angularScriptsInHtml = [];
const scriptRegex = /<script\s+[^>]*src=["']([^"']+)["'][^>]*>/gi;
let match;
while ((match = scriptRegex.exec(indexHtml)) !== null) {
  const src = match[1];
  if (
    src.includes('angular') ||
    src.includes('ui-router') ||
    src.includes('ocLazyLoad') ||
    src.includes('jqwidgets') ||
    src.includes('hims-states') ||
    src.includes('emr-states') ||
    src.includes('lis-states') ||
    src.includes('ngViewBuilder')
  ) {
    angularScriptsInHtml.push(src);
  }
}

// 2. State definitions across public/js/*.js
const stateFiles = [
  { file: 'public/js/hims-states.js', active: true },
  { file: 'public/js/emr-states.js', active: true },
  { file: 'public/js/lis-states.js', active: true },
  { file: 'public/js/linenandlaundry-states.js', active: true },
  { file: 'public/js/custom-states.js', active: false, note: 'Commented out in index.html' },
  { file: 'public/js/patientportal-states.js', active: false, note: 'Unreferenced in index.html' },
];

let totalActiveStates = 0;
let totalInactiveStates = 0;
const stateCountsByFile = {};

for (const sf of stateFiles) {
  if (fs.existsSync(sf.file)) {
    const content = fs.readFileSync(sf.file, 'utf8');
    const stateMatches = content.match(/\.state\s*\(\s*['"][^'"]+['"]/g) || [];
    stateCountsByFile[sf.file] = {
      count: stateMatches.length,
      active: sf.active,
      note: sf.note || 'Active in index.html'
    };
    if (sf.active) {
      totalActiveStates += stateMatches.length;
    } else {
      totalInactiveStates += stateMatches.length;
    }
  }
}

// 3. Controllers in JavaScript
const allJsFiles = walkDir('public', p => p.endsWith('.js'));
let totalControllersFound = 0;
const controllers = [];
const controllersWithBridge = [];

for (const jsFile of allJsFiles) {
  const content = fs.readFileSync(jsFile, 'utf8');
  const ctrlRegex = /\.controller\s*\(\s*['"]([^'"]+)['"]/g;
  let cMatch;
  while ((cMatch = ctrlRegex.exec(content)) !== null) {
    totalControllersFound++;
    controllers.push({ name: cMatch[1], file: jsFile });
  }
  if (content.includes('refreshReactProps') || content.includes('handleReactAction')) {
    controllersWithBridge.push(jsFile);
  }
}

// 4. Directives and Services
const directives = [];
const services = [];

for (const jsFile of allJsFiles) {
  const content = fs.readFileSync(jsFile, 'utf8');
  const dirRegex = /\.directive\s*\(\s*['"]([^'"]+)['"]/g;
  let dMatch;
  while ((dMatch = dirRegex.exec(content)) !== null) {
    directives.push({ name: dMatch[1], file: jsFile });
  }
  const srvRegex = /\.(?:factory|service)\s*\(\s*['"]([^'"]+)['"]/g;
  let sMatch;
  while ((sMatch = srvRegex.exec(content)) !== null) {
    services.push({ name: sMatch[1], file: jsFile });
  }
}

// 5. Partials (HTML templates) and React Component mounts
const allHtmlFiles = walkDir('public/views', p => p.endsWith('.html'));
const templatesWithReactComponent = [];
const templatesWithAngularDirectives = [];

for (const htmlFile of allHtmlFiles) {
  const content = fs.readFileSync(htmlFile, 'utf8');
  if (content.includes('<react-component')) {
    templatesWithReactComponent.push(htmlFile);
  }
  if (
    content.includes('ng-model') ||
    content.includes('ng-click') ||
    content.includes('ui-grid') ||
    content.includes('ui-select') ||
    content.includes('ng-repeat') ||
    content.includes('ng-show') ||
    content.includes('ng-if')
  ) {
    templatesWithAngularDirectives.push(htmlFile);
  }
}

// 6. React Routes in AppRoutes.tsx
const appRoutesContent = fs.readFileSync('src/routes/AppRoutes.tsx', 'utf8');
const routeMatches = appRoutesContent.match(/<Route\s+path=["']([^"']+)["']/g) || [];
const reactRoutesList = routeMatches.map(r => {
  const m = r.match(/path=["']([^"']+)["']/);
  return m ? m[1] : r;
});

// Output Summary
const auditReport = {
  dependencies: {
    packageJsonAngularDeps: Object.keys(pkg.dependencies || {}).concat(Object.keys(pkg.devDependencies || {})).filter(k => k.includes('angular')),
    htmlScriptTagsAngular: angularScriptsInHtml
  },
  states: {
    totalActiveRegisteredStates: totalActiveStates,
    totalInactiveStates: totalInactiveStates,
    stateFiles: stateCountsByFile
  },
  controllers: {
    totalFound: totalControllersFound,
    controllersWithReactBridge: controllersWithBridge.length,
    controllersWithBridgeSample: controllersWithBridge.slice(0, 15)
  },
  directives: {
    totalFound: directives.length,
    names: Array.from(new Set(directives.map(d => d.name)))
  },
  services: {
    totalFound: services.length,
    names: Array.from(new Set(services.map(s => s.name)))
  },
  templates: {
    totalViewsHtml: allHtmlFiles.length,
    mountedReactWidgets: templatesWithReactComponent.length,
    stillWithAngularDirectives: templatesWithAngularDirectives.length
  },
  reactRoutesInAppRoutes: {
    count: reactRoutesList.length,
    routes: reactRoutesList
  }
};

fs.writeFileSync('audit_results.json', JSON.stringify(auditReport, null, 2));
console.log(JSON.stringify(auditReport, null, 2));
