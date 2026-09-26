// scripts/test_clinical_masters_batch.cjs
const fs = require('fs');

async function getPageWs() {
  const res = await fetch('http://localhost:9222/json');
  const pages = await res.json();
  const page = pages.find(p => p.url && p.url.includes('5173')) || pages.find(p => p.type === 'page');
  return page?.webSocketDebuggerUrl;
}

class CDPClient {
  constructor(wsUrl) {
    this.wsUrl = wsUrl;
    this.id = 1;
    this.callbacks = new Map();
  }

  async connect() {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(this.wsUrl);
      this.ws.onopen = () => resolve();
      this.ws.onerror = (e) => reject(e);
      this.ws.onmessage = (msg) => {
        const data = JSON.parse(msg.data);
        if (data.id && this.callbacks.has(data.id)) {
          const { resolve, reject } = this.callbacks.get(data.id);
          this.callbacks.delete(data.id);
          if (data.error) reject(data.error);
          else resolve(data.result);
        }
      };
    });
  }

  async send(method, params = {}) {
    const id = this.id++;
    return new Promise((resolve, reject) => {
      this.callbacks.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  async eval(expression) {
    const res = await this.send('Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise: true
    });
    if (res.exceptionDetails) {
      throw new Error(res.exceptionDetails.exception?.description || res.exceptionDetails.text || 'Eval error');
    }
    return res.result?.value;
  }

  async navigate(url, waitMs = 2500) {
    await this.send('Page.navigate', { url });
    await new Promise(r => setTimeout(r, waitMs));
  }

  async reload(waitMs = 2500) {
    await this.send('Page.reload');
    await new Promise(r => setTimeout(r, waitMs));
  }

  close() {
    if (this.ws) this.ws.close();
  }
}

async function run() {
  const wsUrl = await getPageWs();
  if (!wsUrl) throw new Error('No Chrome CDP page found on port 9222');
  console.log('Connecting to Chrome CDP at:', wsUrl);
  const client = new CDPClient(wsUrl);
  await client.connect();

  const helperScript = `
    window.__setVal = function(el, val) {
      if (!el) return false;
      const proto = el instanceof HTMLSelectElement
        ? window.HTMLSelectElement.prototype
        : el instanceof HTMLTextAreaElement
        ? window.HTMLTextAreaElement.prototype
        : window.HTMLInputElement.prototype;
      const setter = Object.getOwnPropertyDescriptor(proto, 'value')?.set;
      if (setter) {
        setter.call(el, val);
      } else {
        el.value = val;
      }
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
      return true;
    };
  `;

  const results = {
    testedAt: new Date().toISOString(),
    batch: "Clinical Masters Batch (6 Screens)",
    screens: {}
  };

  // =========================================================================
  // SCREEN 1: ALLERGIES (/allergies)
  // =========================================================================
  console.log('\n==========================================================');
  console.log('TESTING SCREEN 1: Allergies (/allergies)');
  console.log('==========================================================');
  results.screens.allergies = { passed: false, checks: {} };
  try {
    await client.navigate('http://localhost:5173/allergies', 3000);
    await client.eval(helperScript);
    const initialRows = await client.eval(`document.querySelectorAll("table tbody tr").length`);
    console.log('  [Direct URL] Initial records loaded:', initialRows);
    results.screens.allergies.checks.directNav = initialRows > 0;

    await client.reload(2500);
    await client.eval(helperScript);
    const postReloadRows = await client.eval(`document.querySelectorAll("table tbody tr").length`);
    console.log('  [Reload] Records loaded after refresh:', postReloadRows);
    results.screens.allergies.checks.reload = postReloadRows > 0;

    // Validation
    await client.eval(`document.getElementById("btnAddNewAllergy")?.click();`);
    await new Promise(r => setTimeout(r, 800));
    await client.eval(`
      (() => {
        const inp = document.getElementById("txtAllergyName");
        if (inp) window.__setVal(inp, "");
        document.getElementById("btnSaveAllergy")?.click();
      })()
    `);
    await new Promise(r => setTimeout(r, 800));
    const valMsg = await client.eval(`Boolean(document.getElementById("allergyValidationAlert")) || document.body.innerText.includes("required")`);
    console.log('  [Validation on Empty Save] Error message shown:', valMsg);
    results.screens.allergies.checks.validation = valMsg;

    // Real Add
    const testAlgName = `TEST_ALG_${Date.now().toString().slice(-4)}`;
    console.log('  [Real Add] Adding test record:', testAlgName);
    await client.eval(`
      (() => {
        const nameInp = document.getElementById("txtAllergyName");
        if (nameInp) window.__setVal(nameInp, "${testAlgName}");
        const descInp = document.getElementById("txtAllergyDescription");
        if (descInp) window.__setVal(descInp, "Automated UAT Allergy Description");
        document.getElementById("btnSaveAllergy")?.click();
      })()
    `);
    await new Promise(r => setTimeout(r, 2500));

    // Reload and search
    await client.reload(2500);
    await client.eval(helperScript);
    await client.eval(`
      (() => {
        const inp = document.getElementById("filterAllergyName");
        if (inp) window.__setVal(inp, "${testAlgName}");
        inp?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
      })()
    `);
    await new Promise(r => setTimeout(r, 1500));
    const foundAdded = await client.eval(`document.body.innerText.includes("${testAlgName}")`);
    console.log('  [Real Add Verification] Record found in table:', foundAdded);
    results.screens.allergies.checks.realAdd = foundAdded;

    // Real Edit
    const updatedAlgDesc = `Updated Alg ${Date.now().toString().slice(-4)}`;
    console.log('  [Real Edit] Updating description to:', updatedAlgDesc);
    await client.eval(`document.querySelector(".btnEditAllergy")?.click();`);
    await new Promise(r => setTimeout(r, 1000));
    await client.eval(`
      (() => {
        const descInp = document.getElementById("txtAllergyDescription");
        if (descInp) window.__setVal(descInp, "${updatedAlgDesc}");
        document.getElementById("btnSaveAllergy")?.click();
      })()
    `);
    await new Promise(r => setTimeout(r, 2500));

    // Reload and verify edit
    await client.reload(2500);
    await client.eval(helperScript);
    await client.eval(`
      (() => {
        const inp = document.getElementById("filterAllergyName");
        if (inp) window.__setVal(inp, "${testAlgName}");
        inp?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
      })()
    `);
    await new Promise(r => setTimeout(r, 1500));
    const foundEdited = await client.eval(`document.body.innerText.includes("${updatedAlgDesc}")`);
    console.log('  [Real Edit Verification] Updated description found:', foundEdited);
    results.screens.allergies.checks.realEdit = foundEdited;

    // Real Delete & Cleanup
    console.log('  [Real Delete] Cleaning up test record...');
    await client.eval(`document.querySelector(".btnDeleteAllergy")?.click();`);
    await new Promise(r => setTimeout(r, 800));
    await client.eval(`document.getElementById("btnConfirmModalYes")?.click();`);
    await new Promise(r => setTimeout(r, 2500));

    await client.reload(2000);
    await client.eval(helperScript);
    await client.eval(`
      (() => {
        const inp = document.getElementById("filterAllergyName");
        if (inp) window.__setVal(inp, "${testAlgName}");
        inp?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
      })()
    `);
    await new Promise(r => setTimeout(r, 1500));
    const stillExists = await client.eval(`document.body.innerText.includes("${testAlgName}")`);
    console.log('  [Delete Cleanup Verification] Record deleted from table:', !stillExists);
    results.screens.allergies.checks.realDelete = !stillExists;

    results.screens.allergies.passed = Object.values(results.screens.allergies.checks).every(Boolean);
    console.log('  Allergies CRUD Passed:', results.screens.allergies.passed);
  } catch (err) {
    console.error('  Allergies error:', err.message);
    results.screens.allergies.error = err.message;
  }

  // =========================================================================
  // SCREEN 2: ALLERGY REACTIONS (/allergyreactions)
  // =========================================================================
  console.log('\n==========================================================');
  console.log('TESTING SCREEN 2: Allergy Reactions (/allergyreactions)');
  console.log('==========================================================');
  results.screens.allergyReactions = { passed: false, checks: {} };
  try {
    await client.navigate('http://localhost:5173/allergyreactions', 3000);
    await client.eval(helperScript);
    const initialRows = await client.eval(`document.querySelectorAll("table tbody tr").length`);
    console.log('  [Direct URL] Initial records loaded:', initialRows);
    results.screens.allergyReactions.checks.directNav = initialRows > 0;

    await client.reload(2500);
    await client.eval(helperScript);
    const postReloadRows = await client.eval(`document.querySelectorAll("table tbody tr").length`);
    console.log('  [Reload] Records loaded after refresh:', postReloadRows);
    results.screens.allergyReactions.checks.reload = postReloadRows > 0;

    // Validation
    await client.eval(`document.getElementById("btnAddNewReaction")?.click();`);
    await new Promise(r => setTimeout(r, 800));
    await client.eval(`
      (() => {
        const inp = document.getElementById("txtReactionName");
        if (inp) window.__setVal(inp, "");
        document.getElementById("btnSaveReaction")?.click();
      })()
    `);
    await new Promise(r => setTimeout(r, 800));
    const valMsg = await client.eval(`Boolean(document.getElementById("reactionValidationAlert")) || document.body.innerText.includes("required")`);
    console.log('  [Validation on Empty Save] Error message shown:', valMsg);
    results.screens.allergyReactions.checks.validation = valMsg;

    // Real Add
    // Real Add
    const testReacSuffix = Date.now().toString().slice(-4);
    const testReacName = `TEST_REAC_${testReacSuffix}`;
    const testReacDisp = `AR_${testReacSuffix}`;
    console.log('  [Real Add] Adding test record:', testReacName);
    await client.eval(`
      (() => {
        const dispInp = document.getElementById("txtReactionDisplayId");
        if (dispInp) window.__setVal(dispInp, "${testReacDisp}");
        const nameInp = document.getElementById("txtReactionName");
        if (nameInp) window.__setVal(nameInp, "${testReacName}");
        const descInp = document.getElementById("txtReactionDescription");
        if (descInp) window.__setVal(descInp, "Automated UAT Reaction Description");
        document.getElementById("btnSaveReaction")?.click();
      })()
    `);
    await new Promise(r => setTimeout(r, 2500));

    // Reload and search
    await client.reload(2500);
    await client.eval(helperScript);
    await client.eval(`
      (() => {
        const inp = document.getElementById("filterReactionName");
        if (inp) window.__setVal(inp, "${testReacName}");
        document.getElementById("btnSearchReaction")?.click();
      })()
    `);
    await new Promise(r => setTimeout(r, 1500));
    const foundAdded = await client.eval(`document.body.innerText.includes("${testReacName}")`);
    console.log('  [Real Add Verification] Record found in table:', foundAdded);
    results.screens.allergyReactions.checks.realAdd = foundAdded;

    // Real Edit
    const updatedReacDesc = `Updated Reac ${Date.now().toString().slice(-4)}`;
    console.log('  [Real Edit] Updating description to:', updatedReacDesc);
    await client.eval(`document.querySelector(".btnEditReaction")?.click();`);
    await new Promise(r => setTimeout(r, 1000));
    await client.eval(`
      (() => {
        const descInp = document.getElementById("txtReactionDescription");
        if (descInp) window.__setVal(descInp, "${updatedReacDesc}");
        document.getElementById("btnSaveReaction")?.click();
      })()
    `);
    await new Promise(r => setTimeout(r, 2500));

    // Reload and verify edit
    await client.reload(2500);
    await client.eval(helperScript);
    await client.eval(`
      (() => {
        const inp = document.getElementById("filterReactionName");
        if (inp) window.__setVal(inp, "${testReacName}");
        document.getElementById("btnSearchReaction")?.click();
      })()
    `);
    await new Promise(r => setTimeout(r, 1500));
    const foundEdited = await client.eval(`document.body.innerText.includes("${updatedReacDesc}")`);
    console.log('  [Real Edit Verification] Updated description found:', foundEdited);
    results.screens.allergyReactions.checks.realEdit = foundEdited;

    // Real Delete & Cleanup
    console.log('  [Real Delete] Cleaning up test record...');
    await client.eval(`document.querySelector(".btnDeleteReaction")?.click();`);
    await new Promise(r => setTimeout(r, 800));
    await client.eval(`document.getElementById("btnConfirmModalYes")?.click();`);
    await new Promise(r => setTimeout(r, 2500));

    await client.reload(2000);
    await client.eval(helperScript);
    await client.eval(`
      (() => {
        const inp = document.getElementById("filterReactionName");
        if (inp) window.__setVal(inp, "${testReacName}");
        inp?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
      })()
    `);
    await new Promise(r => setTimeout(r, 1500));
    const stillExists = await client.eval(`document.body.innerText.includes("${testReacName}")`);
    console.log('  [Delete Cleanup Verification] Record deleted from table:', !stillExists);
    results.screens.allergyReactions.checks.realDelete = !stillExists;

    results.screens.allergyReactions.passed = Object.values(results.screens.allergyReactions.checks).every(Boolean);
    console.log('  Allergy Reactions CRUD Passed:', results.screens.allergyReactions.passed);
  } catch (err) {
    console.error('  Allergy Reactions error:', err.message);
    results.screens.allergyReactions.error = err.message;
  }

  // =========================================================================
  // SCREEN 3: CHIEF COMPLAINTS (/chiefcomplaints)
  // =========================================================================
  console.log('\n==========================================================');
  console.log('TESTING SCREEN 3: Chief Complaints (/chiefcomplaints)');
  console.log('==========================================================');
  results.screens.chiefComplaints = { passed: false, checks: {} };
  try {
    await client.navigate('http://localhost:5173/chiefcomplaints', 3000);
    await client.eval(helperScript);
    const initialRows = await client.eval(`document.querySelectorAll("table tbody tr").length`);
    console.log('  [Direct URL] Initial records loaded:', initialRows);
    results.screens.chiefComplaints.checks.directNav = initialRows > 0;

    await client.reload(2500);
    await client.eval(helperScript);
    const postReloadRows = await client.eval(`document.querySelectorAll("table tbody tr").length`);
    console.log('  [Reload] Records loaded after refresh:', postReloadRows);
    results.screens.chiefComplaints.checks.reload = postReloadRows > 0;

    // Validation
    await client.eval(`document.getElementById("btnAddNewChiefComplaint")?.click();`);
    await new Promise(r => setTimeout(r, 800));
    await client.eval(`
      (() => {
        const inp = document.getElementById("txtComplaintName");
        if (inp) window.__setVal(inp, "");
        document.getElementById("btnSaveComplaint")?.click();
      })()
    `);
    await new Promise(r => setTimeout(r, 800));
    const valMsg = await client.eval(`Boolean(document.getElementById("complaintValidationAlert")) || document.body.innerText.includes("required")`);
    console.log('  [Validation on Empty Save] Error message shown:', valMsg);
    results.screens.chiefComplaints.checks.validation = valMsg;

    // Real Add
    const testCCName = `TEST_CC_${Date.now().toString().slice(-4)}`;
    console.log('  [Real Add] Adding test record:', testCCName);
    await client.eval(`
      (() => {
        const nameInp = document.getElementById("txtComplaintName");
        if (nameInp) window.__setVal(nameInp, "${testCCName}");
        const codeInp = document.getElementById("txtComplaintCode");
        if (codeInp) window.__setVal(codeInp, "CC99");
        const descInp = document.getElementById("txtComplaintDescription");
        if (descInp) window.__setVal(descInp, "Automated UAT Chief Complaint");
        document.getElementById("btnSaveComplaint")?.click();
      })()
    `);
    await new Promise(r => setTimeout(r, 2500));

    // Reload and search
    await client.reload(2500);
    await client.eval(helperScript);
    await client.eval(`
      (() => {
        const inp = document.getElementById("filterComplaintName");
        if (inp) window.__setVal(inp, "${testCCName}");
        inp?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
      })()
    `);
    await new Promise(r => setTimeout(r, 1500));
    const foundAdded = await client.eval(`document.body.innerText.includes("${testCCName}")`);
    console.log('  [Real Add Verification] Record found in table:', foundAdded);
    results.screens.chiefComplaints.checks.realAdd = foundAdded;

    // Real Edit
    const updatedCCDesc = `Updated CC ${Date.now().toString().slice(-4)}`;
    console.log('  [Real Edit] Updating description to:', updatedCCDesc);
    await client.eval(`document.querySelector(".btnEditComplaint")?.click();`);
    await new Promise(r => setTimeout(r, 1000));
    await client.eval(`
      (() => {
        const descInp = document.getElementById("txtComplaintDescription");
        if (descInp) window.__setVal(descInp, "${updatedCCDesc}");
        document.getElementById("btnSaveComplaint")?.click();
      })()
    `);
    await new Promise(r => setTimeout(r, 2500));

    // Reload and verify edit
    await client.reload(2500);
    await client.eval(helperScript);
    await client.eval(`
      (() => {
        const inp = document.getElementById("filterComplaintName");
        if (inp) window.__setVal(inp, "${testCCName}");
        inp?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
      })()
    `);
    await new Promise(r => setTimeout(r, 1500));
    const foundEdited = await client.eval(`document.body.innerText.includes("${updatedCCDesc}")`);
    console.log('  [Real Edit Verification] Updated description found:', foundEdited);
    results.screens.chiefComplaints.checks.realEdit = foundEdited;

    // Real Delete & Cleanup
    console.log('  [Real Delete] Cleaning up test record...');
    await client.eval(`document.querySelector(".btnDeleteComplaint")?.click();`);
    await new Promise(r => setTimeout(r, 800));
    await client.eval(`document.getElementById("btnConfirmModalYes")?.click();`);
    await new Promise(r => setTimeout(r, 2500));

    await client.reload(2000);
    await client.eval(helperScript);
    await client.eval(`
      (() => {
        const inp = document.getElementById("filterComplaintName");
        if (inp) window.__setVal(inp, "${testCCName}");
        inp?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
      })()
    `);
    await new Promise(r => setTimeout(r, 1500));
    const stillExists = await client.eval(`document.body.innerText.includes("${testCCName}")`);
    console.log('  [Delete Cleanup Verification] Record deleted from table:', !stillExists);
    results.screens.chiefComplaints.checks.realDelete = !stillExists;

    results.screens.chiefComplaints.passed = Object.values(results.screens.chiefComplaints.checks).every(Boolean);
    console.log('  Chief Complaints CRUD Passed:', results.screens.chiefComplaints.passed);
  } catch (err) {
    console.error('  Chief Complaints error:', err.message);
    results.screens.chiefComplaints.error = err.message;
  }

  // =========================================================================
  // SCREEN 4: DIAGNOSIS (/diagnosis)
  // =========================================================================
  console.log('\n==========================================================');
  console.log('TESTING SCREEN 4: Diagnosis (/diagnosis)');
  console.log('==========================================================');
  results.screens.diagnosis = { passed: false, checks: {} };
  try {
    await client.navigate('http://localhost:5173/diagnosis', 3000);
    await client.eval(helperScript);
    const initialRows = await client.eval(`document.querySelectorAll("table tbody tr").length`);
    console.log('  [Direct URL] Initial records loaded:', initialRows);
    results.screens.diagnosis.checks.directNav = initialRows > 0;

    await client.reload(2500);
    await client.eval(helperScript);
    const postReloadRows = await client.eval(`document.querySelectorAll("table tbody tr").length`);
    console.log('  [Reload] Records loaded after refresh:', postReloadRows);
    results.screens.diagnosis.checks.reload = postReloadRows > 0;

    // Validation
    await client.eval(`document.getElementById("btnAddNewDiagnosis")?.click();`);
    await new Promise(r => setTimeout(r, 800));
    await client.eval(`
      (() => {
        const inp = document.getElementById("txtDiagnosisName");
        if (inp) window.__setVal(inp, "");
        document.getElementById("btnSaveDiagnosis")?.click();
      })()
    `);
    await new Promise(r => setTimeout(r, 800));
    const valMsg = await client.eval(`Boolean(document.getElementById("diagnosisValidationAlert")) || document.body.innerText.includes("required")`);
    console.log('  [Validation on Empty Save] Error message shown:', valMsg);
    results.screens.diagnosis.checks.validation = valMsg;

    // Real Add
    // Real Add
    const testDiagSuffix = Date.now().toString().slice(-4);
    const testDiagName = `TEST_DIAG_${testDiagSuffix}`;
    const testDiagCode = `DG${testDiagSuffix}`;
    console.log('  [Real Add] Adding test record:', testDiagName);
    await client.eval(`
      (() => {
        const nameInp = document.getElementById("txtDiagnosisName");
        if (nameInp) window.__setVal(nameInp, "${testDiagName}");
        const codeInp = document.getElementById("txtDiagnosisCode");
        if (codeInp) window.__setVal(codeInp, "${testDiagCode}");
        const descInp = document.getElementById("txtDiagnosisDescription");
        if (descInp) window.__setVal(descInp, "Automated UAT Diagnosis");
        document.getElementById("btnSaveDiagnosis")?.click();
      })()
    `);
    await new Promise(r => setTimeout(r, 2500));

    // Reload and search
    await client.reload(2500);
    await client.eval(helperScript);
    await client.eval(`
      (() => {
        const inp = document.getElementById("filterDiagnosisSearch");
        if (inp) window.__setVal(inp, "${testDiagName}");
        document.getElementById("btnSearchDiagnosis")?.click();
      })()
    `);
    await new Promise(r => setTimeout(r, 1500));
    const foundAdded = await client.eval(`document.body.innerText.includes("${testDiagName}")`);
    console.log('  [Real Add Verification] Record found in table:', foundAdded);
    results.screens.diagnosis.checks.realAdd = foundAdded;

    // Real Edit
    const updatedDiagDesc = `Updated Diag ${Date.now().toString().slice(-4)}`;
    console.log('  [Real Edit] Updating description to:', updatedDiagDesc);
    await client.eval(`document.querySelector(".btnEditDiagnosis")?.click();`);
    await new Promise(r => setTimeout(r, 1000));
    await client.eval(`
      (() => {
        const descInp = document.getElementById("txtDiagnosisDescription");
        if (descInp) window.__setVal(descInp, "${updatedDiagDesc}");
        document.getElementById("btnSaveDiagnosis")?.click();
      })()
    `);
    await new Promise(r => setTimeout(r, 2500));

    // Reload and verify edit
    await client.reload(2500);
    await client.eval(helperScript);
    await client.eval(`
      (() => {
        const inp = document.getElementById("filterDiagnosisSearch");
        if (inp) window.__setVal(inp, "${testDiagName}");
        document.getElementById("btnSearchDiagnosis")?.click();
      })()
    `);
    await new Promise(r => setTimeout(r, 1500));
    const foundEdited = await client.eval(`document.body.innerText.includes("${updatedDiagDesc}")`);
    console.log('  [Real Edit Verification] Updated description found:', foundEdited);
    results.screens.diagnosis.checks.realEdit = foundEdited;

    // Real Delete & Cleanup
    console.log('  [Real Delete] Cleaning up test record...');
    await client.eval(`document.querySelector(".btnDeleteDiagnosis")?.click();`);
    await new Promise(r => setTimeout(r, 800));
    await client.eval(`document.getElementById("btnConfirmModalYes")?.click();`);
    await new Promise(r => setTimeout(r, 2500));

    await client.reload(2000);
    await client.eval(helperScript);
    await client.eval(`
      (() => {
        const inp = document.getElementById("filterDiagnosisSearch");
        if (inp) window.__setVal(inp, "${testDiagName}");
        inp?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
      })()
    `);
    await new Promise(r => setTimeout(r, 1500));
    const stillExists = await client.eval(`document.body.innerText.includes("${testDiagName}")`);
    console.log('  [Delete Cleanup Verification] Record deleted from table:', !stillExists);
    results.screens.diagnosis.checks.realDelete = !stillExists;

    results.screens.diagnosis.passed = Object.values(results.screens.diagnosis.checks).every(Boolean);
    console.log('  Diagnosis CRUD Passed:', results.screens.diagnosis.passed);
  } catch (err) {
    console.error('  Diagnosis error:', err.message);
    results.screens.diagnosis.error = err.message;
  }

  // =========================================================================
  // SCREEN 5: VITALS (/vitals)
  // =========================================================================
  console.log('\n==========================================================');
  console.log('TESTING SCREEN 5: Vitals (/vitals)');
  console.log('==========================================================');
  results.screens.vitals = { passed: false, checks: {} };
  try {
    await client.navigate('http://localhost:5173/vitals', 3000);
    await client.eval(helperScript);
    const initialRows = await client.eval(`document.querySelectorAll("table tbody tr").length`);
    console.log('  [Direct URL] Initial records loaded:', initialRows);
    results.screens.vitals.checks.directNav = initialRows > 0;

    await client.reload(2500);
    await client.eval(helperScript);
    const postReloadRows = await client.eval(`document.querySelectorAll("table tbody tr").length`);
    console.log('  [Reload] Records loaded after refresh:', postReloadRows);
    results.screens.vitals.checks.reload = postReloadRows > 0;

    // Validation
    await client.eval(`document.getElementById("btnAddVitalMaster")?.click();`);
    await new Promise(r => setTimeout(r, 800));
    await client.eval(`
      (() => {
        const inp = document.getElementById("inputModalVitalName");
        if (inp) window.__setVal(inp, "");
        document.getElementById("btnSaveVitalModal")?.click();
      })()
    `);
    await new Promise(r => setTimeout(r, 800));
    const valMsg = await client.eval(`Boolean(document.querySelector(".validation-error")) || document.body.innerText.includes("required")`);
    console.log('  [Validation on Empty Save] Error message shown:', valMsg);
    results.screens.vitals.checks.validation = valMsg;

    // Real Add
    const testVitalName = `TEST_VTL_${Date.now().toString().slice(-4)}`;
    console.log('  [Real Add] Adding test record:', testVitalName);
    await client.eval(`
      (() => {
        const nameInp = document.getElementById("inputModalVitalName");
        if (nameInp) window.__setVal(nameInp, "${testVitalName}");
        const uomInp = document.getElementById("inputModalVitalUOM");
        if (uomInp) window.__setVal(uomInp, "bpm");
        document.getElementById("btnSaveVitalModal")?.click();
      })()
    `);
    await new Promise(r => setTimeout(r, 2500));

    // Reload and search
    await client.reload(2500);
    await client.eval(helperScript);
    await client.eval(`
      (() => {
        const inp = document.getElementById("filterVitalName");
        if (inp) window.__setVal(inp, "${testVitalName}");
        document.getElementById("btnSearchVitalMaster")?.click();
      })()
    `);
    await new Promise(r => setTimeout(r, 1500));
    const foundAdded = await client.eval(`document.body.innerText.includes("${testVitalName}")`);
    console.log('  [Real Add Verification] Record found in table:', foundAdded);
    results.screens.vitals.checks.realAdd = foundAdded;

    // Real Edit
    const updatedVitalUOM = `uom${Date.now().toString().slice(-3)}`;
    console.log('  [Real Edit] Updating UOM to:', updatedVitalUOM);
    await client.eval(`document.querySelector("button[title*='Edit' i]")?.click();`);
    await new Promise(r => setTimeout(r, 1000));
    await client.eval(`
      (() => {
        const uomInp = document.getElementById("inputModalVitalUOM");
        if (uomInp) window.__setVal(uomInp, "${updatedVitalUOM}");
        document.getElementById("btnSaveVitalModal")?.click();
      })()
    `);
    await new Promise(r => setTimeout(r, 2500));

    // Reload and verify edit
    await client.reload(2500);
    await client.eval(helperScript);
    await client.eval(`
      (() => {
        const inp = document.getElementById("filterVitalName");
        if (inp) window.__setVal(inp, "${testVitalName}");
        document.getElementById("btnSearchVitalMaster")?.click();
      })()
    `);
    await new Promise(r => setTimeout(r, 1500));
    const foundEdited = await client.eval(`document.body.innerText.includes("${updatedVitalUOM}")`);
    console.log('  [Real Edit Verification] Updated value found:', foundEdited);
    results.screens.vitals.checks.realEdit = foundEdited;

    // Real Delete & Cleanup
    console.log('  [Real Delete] Cleaning up test record...');
    await client.eval(`document.querySelector("button[title*='Delete' i]")?.click();`);
    await new Promise(r => setTimeout(r, 800));
    await client.eval(`document.getElementById("btnConfirmModalYes")?.click();`);
    await new Promise(r => setTimeout(r, 2500));

    await client.reload(2000);
    await client.eval(helperScript);
    await client.eval(`
      (() => {
        const inp = document.getElementById("filterVitalName");
        if (inp) window.__setVal(inp, "${testVitalName}");
        document.getElementById("btnSearchVitalMaster")?.click();
      })()
    `);
    await new Promise(r => setTimeout(r, 1500));
    const stillExists = await client.eval(`document.body.innerText.includes("${testVitalName}")`);
    console.log('  [Delete Cleanup Verification] Record deleted from table:', !stillExists);
    results.screens.vitals.checks.realDelete = !stillExists;

    results.screens.vitals.passed = Object.values(results.screens.vitals.checks).every(Boolean);
    console.log('  Vitals CRUD Passed:', results.screens.vitals.passed);
  } catch (err) {
    console.error('  Vitals error:', err.message);
    results.screens.vitals.error = err.message;
  }

  // =========================================================================
  // SCREEN 6: GENERIC MASTER (/generics)
  // =========================================================================
  console.log('\n==========================================================');
  console.log('TESTING SCREEN 6: Generic Master (/generics)');
  console.log('==========================================================');
  results.screens.generics = { passed: false, checks: {} };
  try {
    await client.navigate('http://localhost:5173/generics', 3000);
    await client.eval(helperScript);
    const initialRows = await client.eval(`document.querySelectorAll("table tbody tr").length`);
    console.log('  [Direct URL] Initial records loaded:', initialRows);
    results.screens.generics.checks.directNav = initialRows > 0;

    await client.reload(2500);
    await client.eval(helperScript);
    const postReloadRows = await client.eval(`document.querySelectorAll("table tbody tr").length`);
    console.log('  [Reload] Records loaded after refresh:', postReloadRows);
    results.screens.generics.checks.reload = postReloadRows > 0;

    // Validation
    await client.eval(`document.getElementById("btnAddGenericMaster")?.click();`);
    await new Promise(r => setTimeout(r, 800));
    await client.eval(`
      (() => {
        const inp = document.getElementById("inputModalGenericName");
        if (inp) window.__setVal(inp, "");
        document.getElementById("btnSaveGenericModal")?.click();
      })()
    `);
    await new Promise(r => setTimeout(r, 800));
    const valMsg = await client.eval(`Boolean(document.querySelector(".validation-error")) || document.body.innerText.includes("required")`);
    console.log('  [Validation on Empty Save] Error message shown:', valMsg);
    results.screens.generics.checks.validation = valMsg;

    // Real Add
    const testGenSuffix = Date.now().toString().slice(-4);
    const testGenName = `TEST_GEN_${testGenSuffix}`;
    const testGenCode = `GN${testGenSuffix}`;
    console.log('  [Real Add] Adding test record:', testGenName);
    await client.eval(`
      (() => {
        const codeInp = document.getElementById("inputModalGenericCode");
        if (codeInp) window.__setVal(codeInp, "${testGenCode}");
        const nameInp = document.getElementById("inputModalGenericName");
        if (nameInp) window.__setVal(nameInp, "${testGenName}");
        document.getElementById("btnSaveGenericModal")?.click();
      })()
    `);
    await new Promise(r => setTimeout(r, 2500));

    // Reload and search
    await client.reload(2500);
    await client.eval(helperScript);
    await client.eval(`
      (() => {
        const inp = document.getElementById("filterGenericName");
        if (inp) window.__setVal(inp, "${testGenName}");
        document.getElementById("btnSearchGenericMaster")?.click();
      })()
    `);
    await new Promise(r => setTimeout(r, 1500));
    const foundAdded = await client.eval(`document.body.innerText.includes("${testGenName}")`);
    console.log('  [Real Add Verification] Record found in table:', foundAdded);
    results.screens.generics.checks.realAdd = foundAdded;

    // Real Edit
    const updatedGenDesc = `Updated Gen ${Date.now().toString().slice(-4)}`;
    console.log('  [Real Edit] Updating description to:', updatedGenDesc);
    await client.eval(`document.querySelector("button[title*='Edit' i]")?.click();`);
    await new Promise(r => setTimeout(r, 1000));
    await client.eval(`
      (() => {
        const descInp = document.getElementById("inputModalGenericDescription") || document.querySelector(".modal-content input[placeholder*='description' i]");
        if (descInp) window.__setVal(descInp, "${updatedGenDesc}");
        document.getElementById("btnSaveGenericModal")?.click();
      })()
    `);
    await new Promise(r => setTimeout(r, 2500));

    // Reload and verify edit
    await client.reload(2500);
    await client.eval(helperScript);
    await client.eval(`
      (() => {
        const inp = document.getElementById("filterGenericName");
        if (inp) window.__setVal(inp, "${testGenName}");
        document.getElementById("btnSearchGenericMaster")?.click();
      })()
    `);
    await new Promise(r => setTimeout(r, 1500));
    const foundEdited = await client.eval(`document.body.innerText.includes("${updatedGenDesc}")`);
    console.log('  [Real Edit Verification] Updated description found:', foundEdited);
    results.screens.generics.checks.realEdit = foundEdited;

    // Real Delete & Cleanup
    console.log('  [Real Delete] Cleaning up test record...');
    await client.eval(`document.querySelector("button[title*='Delete' i]")?.click();`);
    await new Promise(r => setTimeout(r, 800));
    await client.eval(`document.getElementById("btnConfirmModalYes")?.click();`);
    await new Promise(r => setTimeout(r, 2500));

    await client.reload(2000);
    await client.eval(helperScript);
    await client.eval(`
      (() => {
        const inp = document.getElementById("filterGenericName");
        if (inp) window.__setVal(inp, "${testGenName}");
        document.getElementById("btnSearchGenericMaster")?.click();
      })()
    `);
    await new Promise(r => setTimeout(r, 1500));
    const stillExists = await client.eval(`document.body.innerText.includes("${testGenName}")`);
    console.log('  [Delete Cleanup Verification] Record deleted from table:', !stillExists);
    results.screens.generics.checks.realDelete = !stillExists;

    results.screens.generics.passed = Object.values(results.screens.generics.checks).every(Boolean);
    console.log('  Generic Master CRUD Passed:', results.screens.generics.passed);
  } catch (err) {
    console.error('  Generic Master error:', err.message);
    results.screens.generics.error = err.message;
  }

  client.close();
  fs.writeFileSync('clinical_masters_batch_test_results.json', JSON.stringify(results, null, 2));
  console.log('\n==========================================================');
  console.log('SUMMARY OF CLINICAL MASTERS BATCH TESTS:');
  console.log(JSON.stringify(results, null, 2));
  console.log('==========================================================');
}

run().catch(console.error);
