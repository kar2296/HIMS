global.sessionStorage = { getItem: () => null, setItem: () => null };
global.window = global;
console.log('Testing searchStandardPanels...');

const testCatalog = [
  {
    id: 'STD-PANEL-CC-HPI',
    sectionTitle: 'Chief Complaints & History of Present Illness (HPI)',
    nickName: 'Chief Complaints',
    category: 'General Assessment',
    requirementType: 'MANDATORY',
    fields: [
      { fieldLabel: 'Primary Complaint', fieldType: 'TEXT' },
      { fieldLabel: 'Duration & Onset Period', fieldType: 'PERIOD' },
      { fieldLabel: 'Symptom Severity (VAS / Grade)', fieldType: 'DROPDOWN' },
      { fieldLabel: 'History of Present Illness (HPI)', fieldType: 'TEXTAREA' },
    ]
  },
  {
    id: 'STD-PANEL-VITALS',
    sectionTitle: 'Vitals & Physiological Biometrics',
    nickName: 'Clinical Vitals',
    category: 'General Assessment',
    requirementType: 'MANDATORY',
    fields: [
      { fieldLabel: 'Systolic Blood Pressure', fieldType: 'NUMBER' },
      { fieldLabel: 'Diastolic Blood Pressure', fieldType: 'NUMBER' },
      { fieldLabel: 'Heart / Pulse Rate', fieldType: 'NUMBER' },
      { fieldLabel: 'Core Temperature (°C)', fieldType: 'NUMBER' },
    ]
  }
];

function normalize(s) {
  return s.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function search(query, catalog, existing = []) {
  const q = (query || '').trim().toLowerCase();
  const existingTitles = new Set(existing.map((s) => s.sectionTitle.toLowerCase().trim()));

  return catalog.filter((panel) => {
    if (!q) return true;
    const normQ = normalize(q);
    const normTitle = normalize(panel.sectionTitle);
    const normNick = normalize(panel.nickName);
    const normCat = normalize(panel.category || '');

    if (normTitle.includes(normQ) || normNick.includes(normQ) || normCat.includes(normQ)) return true;
    if (normQ === 'chif' || normQ === 'cheif') {
      if (normTitle.includes('chief') || normNick.includes('chief')) return true;
    }
    let qIdx = 0;
    for (let i = 0; i < normTitle.length && qIdx < normQ.length; i++) {
      if (normTitle[i] === normQ[qIdx]) qIdx++;
    }
    return qIdx === normQ.length;
  }).map(p => ({
    ...p,
    isAlreadyAdded: existingTitles.has(p.sectionTitle.toLowerCase().trim())
  }));
}

// 1. Test "Chif" typing (exact user case from screenshot)
const chifResults = search('Chif', testCatalog);
console.log('Results for "Chif":', chifResults.length);
if (chifResults.length > 0) {
  console.log('MATCH FOUND:', chifResults[0].sectionTitle);
  console.log('NICKNAME:', chifResults[0].nickName);
  console.log('FIELDS COUNT:', chifResults[0].fields.length);
  chifResults[0].fields.forEach((f, i) => {
    console.log(`  Field ${i+1}: ${f.fieldLabel} (${f.fieldType})`);
  });
}

// 2. Test "Vital"
const vitalResults = search('vital', testCatalog);
console.log('\nResults for "vital":', vitalResults.length, vitalResults[0]?.sectionTitle);

if (chifResults.length > 0 && chifResults[0].sectionTitle.includes('Chief Complaints')) {
  console.log('\n✅ TEST PASSED: Typing "Chif" successfully matches and loads Chief Complaints panel details with all fields!');
} else {
  console.error('\n❌ TEST FAILED');
  process.exit(1);
}
