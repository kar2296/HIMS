const fs = require('fs');
const path = require('path');

// Extract the catalog from the TS file without complicated regex
const tsContent = fs.readFileSync(path.join(__dirname, '../src/react-components/emr-workspace/standardPanelsCatalog.ts'), 'utf-8');

// Strip all TypeScript types cleanly
let js = tsContent
  .replace(/import type [^;]+;/g, '')
  .replace(/export interface [^}]+}/gs, '')
  .replace(/:\s*StandardPanelTemplate\[\]/g, '')
  .replace(/:\s*Array<[^>]+>/g, '')
  .replace(/:\s*FormAssemblySection\[\]\s*=\s*\[\]/g, ' = []')
  .replace(/:\s*\{\s*panel:\s*StandardPanelTemplate;\s*score:\s*number\s*\}\[\]/g, '')
  .replace(/:\s*RequirementType/g, '')
  .replace(/:\s*FormFieldDefinition\[\]/g, '')
  .replace(/:\s*EncounterScope/g, '')
  .replace(/:\s*string\[\]/g, '')
  .replace(/:\s*string/g, '')
  .replace(/:\s*number/g, '')
  .replace(/:\s*boolean/g, '')
  .replace(/export const /g, 'const ')
  .replace(/export function /g, 'function ');

const sandbox = {};
const runner = new Function('sandbox', `${js}\nsandbox.STANDARD_PANELS_CATALOG = STANDARD_PANELS_CATALOG;\nsandbox.searchStandardPanels = searchStandardPanels;`);
runner(sandbox);

const { STANDARD_PANELS_CATALOG, searchStandardPanels } = sandbox;

console.log(`\n========================================`);
console.log(`STANDARD PANELS CATALOG VERIFICATION`);
console.log(`Total Panels in Library: ${STANDARD_PANELS_CATALOG.length}`);
console.log(`========================================\n`);

// Test 1: User's exact query: "Chief Complaint-Normal"
const q1 = 'Chief Complaint-Normal';
const r1 = searchStandardPanels(q1);
console.log(`1. Testing Search: "${q1}"`);
console.log(`   Results count: ${r1.length}`);
if (r1.length === 0 || r1[0].sectionTitle !== 'Chief Complaint-Normal') {
  console.error(`   ❌ FAILED: Expected "Chief Complaint-Normal" at index 0, got:`, r1[0]?.sectionTitle);
  process.exit(1);
}
console.log(`   ✅ Top Match: "${r1[0].sectionTitle}"`);
console.log(`   Nickname: "${r1[0].nickName}"`);
console.log(`   Requirement: "${r1[0].requirementType}"`);
console.log(`   Fields Count: ${r1[0].fields.length}`);
r1[0].fields.forEach((f, idx) => {
  console.log(`     Field ${idx + 1}: ${f.fieldLabel} (${f.fieldType}, ${f.requirementType})`);
});

// Test 2: User typing "Chief Complaint"
const q2 = 'Chief Complaint';
const r2 = searchStandardPanels(q2);
console.log(`\n2. Testing Search: "${q2}"`);
console.log(`   Results count: ${r2.length}`);
console.log(`   Top 2: ${r2.slice(0, 2).map(p => `"${p.sectionTitle}"`).join(' and ')}`);
if (!r2.some(p => p.sectionTitle === 'Chief Complaint-Normal')) {
  console.error('   ❌ FAILED: Chief Complaint-Normal should match "Chief Complaint"');
  process.exit(1);
}
console.log('   ✅ Chief Complaint-Normal found in results!');

// Test 3: User typing "Chif" (typo)
const q3 = 'Chif';
const r3 = searchStandardPanels(q3);
console.log(`\n3. Testing Typo Search: "${q3}"`);
console.log(`   Results count: ${r3.length}`);
console.log(`   Top 2: ${r3.slice(0, 2).map(p => `"${p.sectionTitle}"`).join(' and ')}`);
if (r3.length === 0 || !r3.some(p => p.sectionTitle === 'Chief Complaint-Normal')) {
  console.error('   ❌ FAILED: Typo match failed!');
  process.exit(1);
}
console.log('   ✅ Typo "Chif" successfully matched Chief Complaint-Normal!');

// Test 4: User typing "Normal"
const q4 = 'Normal';
const r4 = searchStandardPanels(q4);
console.log(`\n4. Testing Search: "${q4}"`);
console.log(`   Results count with -Normal panels: ${r4.length}`);
console.log(`   List: ${r4.map(p => p.sectionTitle).join('\n         ')}`);

console.log('\n========================================');
console.log('🎉 ALL PANEL SEARCH TESTS PASSED 100%!');
console.log('========================================\n');
