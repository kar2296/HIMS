// scripts/test_general_masters_batch.cjs
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
    window.confirm = () => true;
  `;

  // Set mock token if needed to ensure ProtectedRoute allows access
  await client.eval(`
    if (!localStorage.getItem('token')) {
      localStorage.setItem('token', 'e2e-test-token-active-batch');
    }
    if (!sessionStorage.getItem('token')) {
      sessionStorage.setItem('token', 'e2e-test-token-active-batch');
    }
  `);

  const results = {
    testedAt: new Date().toISOString(),
    batch: "General Masters Batch (6 Screens - Non-EMR)",
    screens: {}
  };

  // =========================================================================
  // SCREEN 1: COUNTRY MASTER (/masters/countries & /countrymasters)
  // =========================================================================
  console.log('\n==========================================================');
  console.log('TESTING SCREEN 1: Country Master (/masters/countries)');
  console.log('==========================================================');
  results.screens.countryMaster = { passed: false, checks: {} };
  try {
    await client.navigate('http://localhost:5173/masters/countries', 3000);
    await client.eval(helperScript);
    const initialRows = await client.eval(`document.querySelectorAll("table tbody tr").length`);
    console.log('  [Direct Nav] Initial records loaded:', initialRows);
    results.screens.countryMaster.checks.directNav = initialRows > 0;

    await client.reload(2500);
    await client.eval(helperScript);
    const postReloadRows = await client.eval(`document.querySelectorAll("table tbody tr").length`);
    console.log('  [Reload] Records loaded after refresh:', postReloadRows);
    results.screens.countryMaster.checks.reload = postReloadRows > 0;

    // Validation
    await client.eval(`document.getElementById("btnAddNewCountry")?.click();`);
    await new Promise(r => setTimeout(r, 600));
    await client.eval(`
      (() => {
        const cInp = document.getElementById("txtModalCountryCode");
        if (cInp) window.__setVal(cInp, "");
        const nInp = document.getElementById("txtModalCountryName");
        if (nInp) window.__setVal(nInp, "");
        document.getElementById("btnSaveApproveCountryModal")?.click();
      })()
    `);
    await new Promise(r => setTimeout(r, 600));
    const valErr = await client.eval(`Boolean(document.getElementById("countryModalError")) || document.body.innerText.includes("required")`);
    console.log('  [Validation on Empty Save] Error message shown:', valErr);
    results.screens.countryMaster.checks.validation = valErr;

    // Real Add
    const testCode = `TC${Date.now().toString().slice(-4)}`;
    const testName = `TestCountry_${testCode}`;
    console.log('  [Real Add] Adding test record:', testCode, testName);
    await client.eval(`
      (() => {
        const cInp = document.getElementById("txtModalCountryCode");
        if (cInp) window.__setVal(cInp, "${testCode}");
        const nInp = document.getElementById("txtModalCountryName");
        if (nInp) window.__setVal(nInp, "${testName}");
        document.getElementById("btnSaveApproveCountryModal")?.click();
      })()
    `);
    await new Promise(r => setTimeout(r, 2500));

    // Reload and search
    await client.reload(2500);
    await client.eval(helperScript);
    await client.eval(`
      (() => {
        const inp = document.getElementById("txtCountryCodeSearch");
        if (inp) window.__setVal(inp, "${testCode}");
        document.getElementById("btnCountrySearch")?.click();
      })()
    `);
    await new Promise(r => setTimeout(r, 1500));
    const foundAdded = await client.eval(`document.body.innerText.includes("${testCode}")`);
    console.log('  [Real Add Verification] Record found in table:', foundAdded);
    results.screens.countryMaster.checks.realAdd = foundAdded;

    // Real Edit
    const updatedName = `${testName}_EDIT`;
    console.log('  [Real Edit] Updating name to:', updatedName);
    await client.eval(`document.querySelector(".btn-edit-country")?.click();`);
    await new Promise(r => setTimeout(r, 800));
    await client.eval(`
      (() => {
        const nInp = document.getElementById("txtModalCountryName");
        if (nInp) window.__setVal(nInp, "${updatedName}");
        document.getElementById("btnSaveApproveCountryModal")?.click();
      })()
    `);
    await new Promise(r => setTimeout(r, 2500));

    // Reload and verify edit
    await client.reload(2500);
    await client.eval(helperScript);
    await client.eval(`
      (() => {
        const inp = document.getElementById("txtCountryCodeSearch");
        if (inp) window.__setVal(inp, "${testCode}");
        document.getElementById("btnCountrySearch")?.click();
      })()
    `);
    await new Promise(r => setTimeout(r, 1500));
    const foundEdited = await client.eval(`document.body.innerText.includes("${updatedName}")`);
    console.log('  [Real Edit Verification] Updated name found:', foundEdited);
    results.screens.countryMaster.checks.realEdit = foundEdited;

    // Real Delete & Cleanup
    console.log('  [Real Delete] Cleaning up test record...');
    await client.eval(`document.querySelector(".btn-delete-country")?.click();`);
    await new Promise(r => setTimeout(r, 800));
    await client.eval(`document.getElementById("btnConfirmModalYes")?.click();`);
    await new Promise(r => setTimeout(r, 2500));

    await client.reload(2000);
    await client.eval(helperScript);
    await client.eval(`
      (() => {
        const inp = document.getElementById("txtCountryCodeSearch");
        if (inp) window.__setVal(inp, "${testCode}");
        document.getElementById("btnCountrySearch")?.click();
      })()
    `);
    await new Promise(r => setTimeout(r, 1500));
    const stillExists = await client.eval(`document.body.innerText.includes("${testCode}")`);
    console.log('  [Delete Cleanup Verification] Record deleted from table:', !stillExists);
    results.screens.countryMaster.checks.realDelete = !stillExists;

    results.screens.countryMaster.passed = Object.values(results.screens.countryMaster.checks).every(Boolean);
    console.log('  Country Master CRUD Passed:', results.screens.countryMaster.passed);
  } catch (err) {
    console.error('  Country Master error:', err.message);
    results.screens.countryMaster.error = err.message;
  }

  // =========================================================================
  // SCREEN 2: STATE MASTER (/masters/states & /statemasters)
  // =========================================================================
  console.log('\n==========================================================');
  console.log('TESTING SCREEN 2: State Master (/masters/states)');
  console.log('==========================================================');
  results.screens.stateMaster = { passed: false, checks: {} };
  try {
    await client.navigate('http://localhost:5173/masters/states', 3000);
    await client.eval(helperScript);
    const initialRows = await client.eval(`document.querySelectorAll("#tblStateMaster tbody tr").length`);
    console.log('  [Direct Nav] Initial records loaded:', initialRows);
    results.screens.stateMaster.checks.directNav = initialRows > 0;

    await client.reload(2500);
    await client.eval(helperScript);
    const postReloadRows = await client.eval(`document.querySelectorAll("#tblStateMaster tbody tr").length`);
    console.log('  [Reload] Records loaded after refresh:', postReloadRows);
    results.screens.stateMaster.checks.reload = postReloadRows > 0;

    // Validation
    await client.eval(`document.getElementById("btnAddState")?.click();`);
    await new Promise(r => setTimeout(r, 600));
    await client.eval(`
      (() => {
        const cInp = document.getElementById("txtModalStateCode");
        if (cInp) window.__setVal(cInp, "");
        const nInp = document.getElementById("txtModalStateName");
        if (nInp) window.__setVal(nInp, "");
        document.getElementById("btnSaveApproveStateModal")?.click();
      })()
    `);
    await new Promise(r => setTimeout(r, 600));
    const valErr = await client.eval(`Boolean(document.getElementById("stateModalError")) || document.body.innerText.includes("required")`);
    console.log('  [Validation on Empty Save] Error message shown:', valErr);
    results.screens.stateMaster.checks.validation = valErr;

    // Real Add
    const testCode = `TS${Date.now().toString().slice(-4)}`;
    const testName = `TestState_${testCode}`;
    console.log('  [Real Add] Adding test record:', testCode, testName);
    await client.eval(`
      (() => {
        const cInp = document.getElementById("txtModalStateCode");
        if (cInp) window.__setVal(cInp, "${testCode}");
        const nInp = document.getElementById("txtModalStateName");
        if (nInp) window.__setVal(nInp, "${testName}");
        document.getElementById("btnSaveApproveStateModal")?.click();
      })()
    `);
    await new Promise(r => setTimeout(r, 2500));

    // Reload and search
    await client.reload(2500);
    await client.eval(helperScript);
    await client.eval(`
      (() => {
        const inp = document.getElementById("txtStateCodeSearch");
        if (inp) window.__setVal(inp, "${testCode}");
        document.getElementById("btnStateSearch")?.click();
      })()
    `);
    await new Promise(r => setTimeout(r, 1500));
    const foundAdded = await client.eval(`document.body.innerText.includes("${testCode}")`);
    console.log('  [Real Add Verification] Record found in table:', foundAdded);
    results.screens.stateMaster.checks.realAdd = foundAdded;

    // Real Edit
    const updatedName = `${testName}_EDIT`;
    console.log('  [Real Edit] Updating name to:', updatedName);
    await client.eval(`document.querySelector("#tblStateMaster tbody tr .grid-action[title='Edit']")?.click();`);
    await new Promise(r => setTimeout(r, 800));
    await client.eval(`
      (() => {
        const nInp = document.getElementById("txtModalStateName");
        if (nInp) window.__setVal(nInp, "${updatedName}");
        document.getElementById("btnSaveApproveStateModal")?.click();
      })()
    `);
    await new Promise(r => setTimeout(r, 2500));

    // Reload and verify edit
    await client.reload(2500);
    await client.eval(helperScript);
    await client.eval(`
      (() => {
        const inp = document.getElementById("txtStateCodeSearch");
        if (inp) window.__setVal(inp, "${testCode}");
        document.getElementById("btnStateSearch")?.click();
      })()
    `);
    await new Promise(r => setTimeout(r, 1500));
    const foundEdited = await client.eval(`document.body.innerText.includes("${updatedName}")`);
    console.log('  [Real Edit Verification] Updated name found:', foundEdited);
    results.screens.stateMaster.checks.realEdit = foundEdited;

    // Real Delete & Cleanup
    console.log('  [Real Delete] Cleaning up test record...');
    await client.eval(`document.querySelector("#tblStateMaster tbody tr .grid-action[title='Delete']")?.click();`);
    await new Promise(r => setTimeout(r, 800));
    await client.eval(`document.getElementById("btnConfirmModalYes")?.click();`);
    await new Promise(r => setTimeout(r, 2500));

    await client.reload(2000);
    await client.eval(helperScript);
    await client.eval(`
      (() => {
        const inp = document.getElementById("txtStateCodeSearch");
        if (inp) window.__setVal(inp, "${testCode}");
        document.getElementById("btnStateSearch")?.click();
      })()
    `);
    await new Promise(r => setTimeout(r, 1500));
    const stillExists = await client.eval(`document.body.innerText.includes("${testCode}")`);
    console.log('  [Delete Cleanup Verification] Record deleted from table:', !stillExists);
    results.screens.stateMaster.checks.realDelete = !stillExists;

    results.screens.stateMaster.passed = Object.values(results.screens.stateMaster.checks).every(Boolean);
    console.log('  State Master CRUD Passed:', results.screens.stateMaster.passed);
  } catch (err) {
    console.error('  State Master error:', err.message);
    results.screens.stateMaster.error = err.message;
  }

  // =========================================================================
  // SCREEN 3: DISTRICT MASTER (/masters/districts & /districtmasters)
  // =========================================================================
  console.log('\n==========================================================');
  console.log('TESTING SCREEN 3: District Master (/masters/districts)');
  console.log('==========================================================');
  results.screens.districtMaster = { passed: false, checks: {} };
  try {
    await client.navigate('http://localhost:5173/masters/districts', 3000);
    await client.eval(helperScript);
    const initialRows = await client.eval(`document.querySelectorAll("#tblDistrictMaster tbody tr").length`);
    console.log('  [Direct Nav] Initial records loaded:', initialRows);
    results.screens.districtMaster.checks.directNav = initialRows > 0;

    await client.reload(2500);
    await client.eval(helperScript);
    const postReloadRows = await client.eval(`document.querySelectorAll("#tblDistrictMaster tbody tr").length`);
    console.log('  [Reload] Records loaded after refresh:', postReloadRows);
    results.screens.districtMaster.checks.reload = postReloadRows > 0;

    // Validation
    await client.eval(`document.getElementById("btnAddNewDistrict")?.click();`);
    await new Promise(r => setTimeout(r, 600));
    await client.eval(`
      (() => {
        const cInp = document.getElementById("txtModalDistrictCode");
        if (cInp) window.__setVal(cInp, "");
        const nInp = document.getElementById("txtModalDistrictName");
        if (nInp) window.__setVal(nInp, "");
        document.getElementById("btnSaveApproveDistrictModal")?.click();
      })()
    `);
    await new Promise(r => setTimeout(r, 600));
    const valErr = await client.eval(`Boolean(document.getElementById("districtModalError")) || document.body.innerText.includes("required")`);
    console.log('  [Validation on Empty Save] Error message shown:', valErr);
    results.screens.districtMaster.checks.validation = valErr;

    // Real Add
    const testCode = `TD${Date.now().toString().slice(-4)}`;
    const testName = `TestDistrict_${testCode}`;
    console.log('  [Real Add] Adding test record:', testCode, testName);
    await client.eval(`
      (() => {
        const cInp = document.getElementById("txtModalDistrictCode");
        if (cInp) window.__setVal(cInp, "${testCode}");
        const nInp = document.getElementById("txtModalDistrictName");
        if (nInp) window.__setVal(nInp, "${testName}");
        document.getElementById("btnSaveApproveDistrictModal")?.click();
      })()
    `);
    await new Promise(r => setTimeout(r, 2500));

    // Reload and search
    await client.reload(2500);
    await client.eval(helperScript);
    await client.eval(`
      (() => {
        const inp = document.getElementById("txtDistrictCodeSearch");
        if (inp) window.__setVal(inp, "${testCode}");
        document.getElementById("btnDistrictSearch")?.click();
      })()
    `);
    await new Promise(r => setTimeout(r, 1500));
    const foundAdded = await client.eval(`document.body.innerText.includes("${testCode}")`);
    console.log('  [Real Add Verification] Record found in table:', foundAdded);
    results.screens.districtMaster.checks.realAdd = foundAdded;

    // Real Edit
    const updatedName = `${testName}_EDIT`;
    console.log('  [Real Edit] Updating name to:', updatedName);
    await client.eval(`document.querySelector(".btn-edit-district")?.click();`);
    await new Promise(r => setTimeout(r, 800));
    await client.eval(`
      (() => {
        const nInp = document.getElementById("txtModalDistrictName");
        if (nInp) window.__setVal(nInp, "${updatedName}");
        document.getElementById("btnSaveApproveDistrictModal")?.click();
      })()
    `);
    await new Promise(r => setTimeout(r, 2500));

    // Reload and verify edit
    await client.reload(2500);
    await client.eval(helperScript);
    await client.eval(`
      (() => {
        const inp = document.getElementById("txtDistrictCodeSearch");
        if (inp) window.__setVal(inp, "${testCode}");
        document.getElementById("btnDistrictSearch")?.click();
      })()
    `);
    await new Promise(r => setTimeout(r, 1500));
    const foundEdited = await client.eval(`document.body.innerText.includes("${updatedName}")`);
    console.log('  [Real Edit Verification] Updated name found:', foundEdited);
    results.screens.districtMaster.checks.realEdit = foundEdited;

    // Real Delete & Cleanup
    console.log('  [Real Delete] Cleaning up test record...');
    await client.eval(`document.querySelector(".btn-delete-district")?.click();`);
    await new Promise(r => setTimeout(r, 800));
    await client.eval(`document.getElementById("btnConfirmModalYes")?.click();`);
    await new Promise(r => setTimeout(r, 2500));

    await client.reload(2000);
    await client.eval(helperScript);
    await client.eval(`
      (() => {
        const inp = document.getElementById("txtDistrictCodeSearch");
        if (inp) window.__setVal(inp, "${testCode}");
        document.getElementById("btnDistrictSearch")?.click();
      })()
    `);
    await new Promise(r => setTimeout(r, 1500));
    const stillExists = await client.eval(`document.body.innerText.includes("${testCode}")`);
    console.log('  [Delete Cleanup Verification] Record deleted from table:', !stillExists);
    results.screens.districtMaster.checks.realDelete = !stillExists;

    results.screens.districtMaster.passed = Object.values(results.screens.districtMaster.checks).every(Boolean);
    console.log('  District Master CRUD Passed:', results.screens.districtMaster.passed);
  } catch (err) {
    console.error('  District Master error:', err.message);
    results.screens.districtMaster.error = err.message;
  }

  // =========================================================================
  // SCREEN 4: CITY MASTER (/masters/cities & /citymasters)
  // =========================================================================
  console.log('\n==========================================================');
  console.log('TESTING SCREEN 4: City Master (/masters/cities)');
  console.log('==========================================================');
  results.screens.cityMaster = { passed: false, checks: {} };
  try {
    await client.navigate('http://localhost:5173/masters/cities', 3000);
    await client.eval(helperScript);
    const initialRows = await client.eval(`document.querySelectorAll("#tblCityMaster tbody tr").length`);
    console.log('  [Direct Nav] Initial records loaded:', initialRows);
    results.screens.cityMaster.checks.directNav = initialRows > 0;

    await client.reload(2500);
    await client.eval(helperScript);
    const postReloadRows = await client.eval(`document.querySelectorAll("#tblCityMaster tbody tr").length`);
    console.log('  [Reload] Records loaded after refresh:', postReloadRows);
    results.screens.cityMaster.checks.reload = postReloadRows > 0;

    // Validation
    await client.eval(`document.getElementById("btnAddCity")?.click();`);
    await new Promise(r => setTimeout(r, 600));
    await client.eval(`
      (() => {
        const cInp = document.getElementById("txtModalCityCode");
        if (cInp) window.__setVal(cInp, "");
        const nInp = document.getElementById("txtModalCityName");
        if (nInp) window.__setVal(nInp, "");
        document.getElementById("btnSaveApproveCityModal")?.click();
      })()
    `);
    await new Promise(r => setTimeout(r, 600));
    const valErr = await client.eval(`Boolean(document.getElementById("cityModalError")) || document.body.innerText.includes("required")`);
    console.log('  [Validation on Empty Save] Error message shown:', valErr);
    results.screens.cityMaster.checks.validation = valErr;

    // Real Add
    const testCode = `TC${Date.now().toString().slice(-4)}`;
    const testName = `TestCity_${testCode}`;
    console.log('  [Real Add] Adding test record:', testCode, testName);
    await client.eval(`
      (() => {
        const cInp = document.getElementById("txtModalCityCode");
        if (cInp) window.__setVal(cInp, "${testCode}");
        const nInp = document.getElementById("txtModalCityName");
        if (nInp) window.__setVal(nInp, "${testName}");
        document.getElementById("btnSaveApproveCityModal")?.click();
      })()
    `);
    await new Promise(r => setTimeout(r, 2500));

    // Reload and search
    await client.reload(2500);
    await client.eval(helperScript);
    await client.eval(`
      (() => {
        const inp = document.getElementById("txtCityCodeSearch");
        if (inp) window.__setVal(inp, "${testCode}");
        document.getElementById("btnCitySearch")?.click();
      })()
    `);
    await new Promise(r => setTimeout(r, 1500));
    const foundAdded = await client.eval(`document.body.innerText.includes("${testCode}")`);
    console.log('  [Real Add Verification] Record found in table:', foundAdded);
    results.screens.cityMaster.checks.realAdd = foundAdded;

    // Real Edit
    const updatedName = `${testName}_EDIT`;
    console.log('  [Real Edit] Updating name to:', updatedName);
    await client.eval(`document.querySelector("#tblCityMaster tbody tr .grid-action[title='Edit']")?.click();`);
    await new Promise(r => setTimeout(r, 800));
    await client.eval(`
      (() => {
        const nInp = document.getElementById("txtModalCityName");
        if (nInp) window.__setVal(nInp, "${updatedName}");
        document.getElementById("btnSaveApproveCityModal")?.click();
      })()
    `);
    await new Promise(r => setTimeout(r, 2500));

    // Reload and verify edit
    await client.reload(2500);
    await client.eval(helperScript);
    await client.eval(`
      (() => {
        const inp = document.getElementById("txtCityCodeSearch");
        if (inp) window.__setVal(inp, "${testCode}");
        document.getElementById("btnCitySearch")?.click();
      })()
    `);
    await new Promise(r => setTimeout(r, 1500));
    const foundEdited = await client.eval(`document.body.innerText.includes("${updatedName}")`);
    console.log('  [Real Edit Verification] Updated name found:', foundEdited);
    results.screens.cityMaster.checks.realEdit = foundEdited;

    // Real Delete & Cleanup
    console.log('  [Real Delete] Cleaning up test record...');
    await client.eval(`document.querySelector("#tblCityMaster tbody tr .grid-action[title='Delete']")?.click();`);
    await new Promise(r => setTimeout(r, 800));
    await client.eval(`document.getElementById("btnConfirmModalYes")?.click();`);
    await new Promise(r => setTimeout(r, 2500));

    await client.reload(2000);
    await client.eval(helperScript);
    await client.eval(`
      (() => {
        const inp = document.getElementById("txtCityCodeSearch");
        if (inp) window.__setVal(inp, "${testCode}");
        document.getElementById("btnCitySearch")?.click();
      })()
    `);
    await new Promise(r => setTimeout(r, 1500));
    const stillExists = await client.eval(`document.body.innerText.includes("${testCode}")`);
    console.log('  [Delete Cleanup Verification] Record deleted from table:', !stillExists);
    results.screens.cityMaster.checks.realDelete = !stillExists;

    results.screens.cityMaster.passed = Object.values(results.screens.cityMaster.checks).every(Boolean);
    console.log('  City Master CRUD Passed:', results.screens.cityMaster.passed);
  } catch (err) {
    console.error('  City Master error:', err.message);
    results.screens.cityMaster.error = err.message;
  }

  // =========================================================================
  // SCREEN 5: PINCODE MASTER (/masters/pincodes & /pincodes)
  // =========================================================================
  console.log('\n==========================================================');
  console.log('TESTING SCREEN 5: Pincode Master (/masters/pincodes)');
  console.log('==========================================================');
  results.screens.pincodeMaster = { passed: false, checks: {} };
  try {
    await client.navigate('http://localhost:5173/masters/pincodes', 3000);
    await client.eval(helperScript);
    const initialRows = await client.eval(`document.querySelectorAll("#tblPincodeMaster tbody tr").length`);
    console.log('  [Direct Nav] Initial records loaded:', initialRows);
    results.screens.pincodeMaster.checks.directNav = initialRows > 0;

    await client.reload(2500);
    await client.eval(helperScript);
    const postReloadRows = await client.eval(`document.querySelectorAll("#tblPincodeMaster tbody tr").length`);
    console.log('  [Reload] Records loaded after refresh:', postReloadRows);
    results.screens.pincodeMaster.checks.reload = postReloadRows > 0;

    // Validation
    await client.eval(`document.getElementById("btnAddNewPincode")?.click();`);
    await new Promise(r => setTimeout(r, 600));
    await client.eval(`
      (() => {
        const pInp = document.getElementById("txtModalPincode");
        if (pInp) window.__setVal(pInp, "");
        const aInp = document.getElementById("txtModalArea");
        if (aInp) window.__setVal(aInp, "");
        document.getElementById("btnSaveApprovePincodeModal")?.click();
      })()
    `);
    await new Promise(r => setTimeout(r, 600));
    const valErr = await client.eval(`Boolean(document.getElementById("pincodeModalError")) || document.body.innerText.includes("required")`);
    console.log('  [Validation on Empty Save] Error message shown:', valErr);
    results.screens.pincodeMaster.checks.validation = valErr;

    // Real Add
    const testPin = `99${Date.now().toString().slice(-4)}`;
    const testArea = `TestArea_${testPin}`;
    console.log('  [Real Add] Adding test record:', testPin, testArea);
    await client.eval(`
      (() => {
        const pInp = document.getElementById("txtModalPincode");
        if (pInp) window.__setVal(pInp, "${testPin}");
        const aInp = document.getElementById("txtModalArea");
        if (aInp) window.__setVal(aInp, "${testArea}");
        document.getElementById("btnSaveApprovePincodeModal")?.click();
      })()
    `);
    await new Promise(r => setTimeout(r, 2500));

    // Reload and search
    await client.reload(2500);
    await client.eval(helperScript);
    await client.eval(`
      (() => {
        const inp = document.getElementById("txtPincodeSearch");
        if (inp) window.__setVal(inp, "${testPin}");
        document.getElementById("btnPincodeSearch")?.click();
      })()
    `);
    await new Promise(r => setTimeout(r, 1500));
    const foundAdded = await client.eval(`document.body.innerText.includes("${testPin}")`);
    console.log('  [Real Add Verification] Record found in table:', foundAdded);
    results.screens.pincodeMaster.checks.realAdd = foundAdded;

    // Real Edit
    const updatedArea = `${testArea}_EDIT`;
    console.log('  [Real Edit] Updating area to:', updatedArea);
    await client.eval(`document.querySelector(".btn-edit-pincode")?.click();`);
    await new Promise(r => setTimeout(r, 800));
    await client.eval(`
      (() => {
        const aInp = document.getElementById("txtModalArea");
        if (aInp) window.__setVal(aInp, "${updatedArea}");
        document.getElementById("btnSaveApprovePincodeModal")?.click();
      })()
    `);
    await new Promise(r => setTimeout(r, 2500));

    // Reload and verify edit
    await client.reload(2500);
    await client.eval(helperScript);
    await client.eval(`
      (() => {
        const inp = document.getElementById("txtPincodeSearch");
        if (inp) window.__setVal(inp, "${testPin}");
        document.getElementById("btnPincodeSearch")?.click();
      })()
    `);
    await new Promise(r => setTimeout(r, 1500));
    const foundEdited = await client.eval(`document.body.innerText.includes("${updatedArea}")`);
    console.log('  [Real Edit Verification] Updated area found:', foundEdited);
    results.screens.pincodeMaster.checks.realEdit = foundEdited;

    // Real Delete & Cleanup
    console.log('  [Real Delete] Cleaning up test record...');
    await client.eval(`document.querySelector(".btn-delete-pincode")?.click();`);
    await new Promise(r => setTimeout(r, 800));
    await client.eval(`document.getElementById("btnConfirmModalYes")?.click();`);
    await new Promise(r => setTimeout(r, 2500));

    await client.reload(2000);
    await client.eval(helperScript);
    await client.eval(`
      (() => {
        const inp = document.getElementById("txtPincodeSearch");
        if (inp) window.__setVal(inp, "${testPin}");
        document.getElementById("btnPincodeSearch")?.click();
      })()
    `);
    await new Promise(r => setTimeout(r, 1500));
    const stillExists = await client.eval(`document.body.innerText.includes("${testPin}")`);
    console.log('  [Delete Cleanup Verification] Record deleted from table:', !stillExists);
    results.screens.pincodeMaster.checks.realDelete = !stillExists;

    results.screens.pincodeMaster.passed = Object.values(results.screens.pincodeMaster.checks).every(Boolean);
    console.log('  Pincode Master CRUD Passed:', results.screens.pincodeMaster.passed);
  } catch (err) {
    console.error('  Pincode Master error:', err.message);
    results.screens.pincodeMaster.error = err.message;
  }

  // =========================================================================
  // SCREEN 6: OCCUPATION MASTER (/masters/occupations & /occupationmasters)
  // =========================================================================
  console.log('\n==========================================================');
  console.log('TESTING SCREEN 6: Occupation Master (/masters/occupations)');
  console.log('==========================================================');
  results.screens.occupationMaster = { passed: false, checks: {} };
  try {
    await client.navigate('http://localhost:5173/masters/occupations', 3000);
    await client.eval(helperScript);
    const initialRows = await client.eval(`document.querySelectorAll("#tblOccupationMaster tbody tr").length`);
    console.log('  [Direct Nav] Initial records loaded:', initialRows);
    results.screens.occupationMaster.checks.directNav = initialRows > 0;

    await client.reload(2500);
    await client.eval(helperScript);
    const postReloadRows = await client.eval(`document.querySelectorAll("#tblOccupationMaster tbody tr").length`);
    console.log('  [Reload] Records loaded after refresh:', postReloadRows);
    results.screens.occupationMaster.checks.reload = postReloadRows > 0;

    // Validation
    await client.eval(`document.getElementById("btnAddOccupation")?.click();`);
    await new Promise(r => setTimeout(r, 600));
    await client.eval(`
      (() => {
        const cInp = document.getElementById("txtModalOccupationCode");
        if (cInp) window.__setVal(cInp, "");
        const nInp = document.getElementById("txtModalOccupationName");
        if (nInp) window.__setVal(nInp, "");
        document.getElementById("btnSaveApproveOccupationModal")?.click();
      })()
    `);
    await new Promise(r => setTimeout(r, 600));
    const valErr = await client.eval(`Boolean(document.getElementById("occupationModalError")) || document.body.innerText.includes("required")`);
    console.log('  [Validation on Empty Save] Error message shown:', valErr);
    results.screens.occupationMaster.checks.validation = valErr;

    // Real Add
    const testCode = `TO${Date.now().toString().slice(-4)}`;
    const testName = `TestOcc_${testCode}`;
    console.log('  [Real Add] Adding test record:', testCode, testName);
    await client.eval(`
      (() => {
        const cInp = document.getElementById("txtModalOccupationCode");
        if (cInp) window.__setVal(cInp, "${testCode}");
        const nInp = document.getElementById("txtModalOccupationName");
        if (nInp) window.__setVal(nInp, "${testName}");
        document.getElementById("btnSaveApproveOccupationModal")?.click();
      })()
    `);
    await new Promise(r => setTimeout(r, 2500));

    // Reload and search
    await client.reload(2500);
    await client.eval(helperScript);
    await client.eval(`
      (() => {
        const inp = document.getElementById("txtOccupationSearch");
        if (inp) {
          window.__setVal(inp, "${testName}");
          inp.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
        }
      })()
    `);
    await new Promise(r => setTimeout(r, 1500));
    const foundAdded = await client.eval(`document.body.innerText.includes("${testName}")`);
    console.log('  [Real Add Verification] Record found in table:', foundAdded);
    results.screens.occupationMaster.checks.realAdd = foundAdded;

    // Real Edit
    const updatedName = `${testName}_EDIT`;
    console.log('  [Real Edit] Updating name to:', updatedName);
    await client.eval(`document.querySelector("#tblOccupationMaster tbody tr .grid-action[title='Edit']")?.click();`);
    await new Promise(r => setTimeout(r, 800));
    await client.eval(`
      (() => {
        const nInp = document.getElementById("txtModalOccupationName");
        if (nInp) window.__setVal(nInp, "${updatedName}");
        document.getElementById("btnSaveApproveOccupationModal")?.click();
      })()
    `);
    await new Promise(r => setTimeout(r, 2500));

    // Reload and verify edit
    await client.reload(2500);
    await client.eval(helperScript);
    await client.eval(`
      (() => {
        const inp = document.getElementById("txtOccupationSearch");
        if (inp) {
          window.__setVal(inp, "${testCode}");
          inp.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
        }
      })()
    `);
    await new Promise(r => setTimeout(r, 1500));
    const foundEdited = await client.eval(`document.body.innerText.includes("${updatedName}")`);
    console.log('  [Real Edit Verification] Updated name found:', foundEdited);
    results.screens.occupationMaster.checks.realEdit = foundEdited;

    // Real Delete & Cleanup
    console.log('  [Real Delete] Cleaning up test record...');
    await client.eval(`document.querySelector("#tblOccupationMaster tbody tr .grid-action[title='Delete']")?.click();`);
    await new Promise(r => setTimeout(r, 800));
    await client.eval(`document.getElementById("btnConfirmModalYes")?.click();`);
    await new Promise(r => setTimeout(r, 2500));

    await client.reload(2000);
    await client.eval(helperScript);
    await client.eval(`
      (() => {
        const inp = document.getElementById("txtOccupationSearch");
        if (inp) {
          window.__setVal(inp, "${testCode}");
          inp.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
        }
      })()
    `);
    await new Promise(r => setTimeout(r, 1500));
    const stillExists = await client.eval(`document.body.innerText.includes("${testCode}")`);
    console.log('  [Delete Cleanup Verification] Record deleted from table:', !stillExists);
    results.screens.occupationMaster.checks.realDelete = !stillExists;

    results.screens.occupationMaster.passed = Object.values(results.screens.occupationMaster.checks).every(Boolean);
    console.log('  Occupation Master CRUD Passed:', results.screens.occupationMaster.passed);
  } catch (err) {
    console.error('  Occupation Master error:', err.message);
    results.screens.occupationMaster.error = err.message;
  }

  // Summary
  console.log('\n==========================================================');
  console.log('TEST SUMMARY FOR GENERAL MASTERS BATCH:');
  console.log('==========================================================');
  const totalScreens = Object.keys(results.screens).length;
  const passedScreens = Object.values(results.screens).filter(s => s.passed).length;
  console.log(`Passed: ${passedScreens} / ${totalScreens}`);

  fs.writeFileSync('general_masters_batch_test_results.json', JSON.stringify(results, null, 2));
  console.log('Results saved to general_masters_batch_test_results.json');

  client.close();
}

run().catch(err => {
  console.error('Fatal error running tests:', err);
  process.exit(1);
});
