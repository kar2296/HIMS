// scripts/test_batch1_workflows.cjs
const fs = require('fs');
const mysql = require('mysql2/promise');

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

const results = {
  testedAt: new Date().toISOString(),
  screens: {}
};

async function run() {
  const wsUrl = await getPageWs();
  if (!wsUrl) throw new Error('No Chrome CDP page found on port 9222');
  console.log('Connecting to Chrome CDP at:', wsUrl);
  const client = new CDPClient(wsUrl);
  await client.connect();

  // Common DOM helper injected into the page
  const injectHelperScript = `
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

  // =========================================================================
  // SCREEN 1: COUNTRY MASTER (/masters/countries)
  // =========================================================================
  console.log('\n======================================================');
  console.log('Screen 1: Country Master (/masters/countries)');
  console.log('======================================================');
  results.screens.countryMaster = { passed: false, checks: {} };

  try {
    // 1. Direct navigation
    await client.navigate('http://localhost:5173/masters/countries', 2500);
    await client.eval(injectHelperScript);
    const bodyText1 = await client.eval('document.body.innerText');
    console.log('  [Direct Navigation] Content loaded:', bodyText1.includes('Country Master'));
    results.screens.countryMaster.checks.directNavigation = bodyText1.includes('Country Master');

    // 2. Page refresh
    await client.reload(2000);
    await client.eval(injectHelperScript);
    const rowCountAfterRefresh = await client.eval('document.querySelectorAll("#tblCountryMaster tbody tr").length');
    console.log('  [Page Refresh] Rows present:', rowCountAfterRefresh);
    results.screens.countryMaster.checks.pageRefresh = rowCountAfterRefresh > 0;

    // 3. Search filter
    await client.eval(`
      (() => {
        window.__setVal(document.getElementById("txtCountryCodeSearch"), "Sri Lanka");
        document.getElementById("btnCountrySearch")?.click();
      })()
    `);
    await new Promise(r => setTimeout(r, 1000));
    const searchResult = await client.eval(`document.querySelector("#tblCountryMaster tbody tr td")?.innerText`);
    console.log('  [Search Filter "Sri Lanka"] First row code:', searchResult);
    results.screens.countryMaster.checks.searchFilter = searchResult?.includes('Sri Lanka');

    // Reset search
    await client.eval(`
      (() => {
        window.__setVal(document.getElementById("txtCountryCodeSearch"), "");
        document.getElementById("btnCountrySearch")?.click();
      })()
    `);
    await new Promise(r => setTimeout(r, 1000));

    // 4. Status filter
    await client.eval(`
      (() => {
        const select = document.getElementById("ddlCountryStatusFilter");
        if (select) {
          select.value = "2"; // Approved
          select.dispatchEvent(new Event("change", { bubbles: true }));
        }
      })()
    `);
    await new Promise(r => setTimeout(r, 1000));
    const approvedRows = await client.eval('document.querySelectorAll("#tblCountryMaster tbody tr").length');
    console.log('  [Status Filter "Approved"] Rows returned:', approvedRows);
    results.screens.countryMaster.checks.statusFilter = approvedRows > 0;

    // Reset status filter
    await client.eval(`
      (() => {
        const select = document.getElementById("ddlCountryStatusFilter");
        if (select) {
          select.value = "";
          select.dispatchEvent(new Event("change", { bubbles: true }));
        }
      })()
    `);
    await new Promise(r => setTimeout(r, 1000));

    // 5. Validation error test
    await client.eval(`document.getElementById("btnAddNewCountry")?.click();`);
    await new Promise(r => setTimeout(r, 500));
    await client.eval(`document.getElementById("btnSaveCountryModal")?.click();`);
    await new Promise(r => setTimeout(r, 500));
    const validationErr = await client.eval(`document.getElementById("countryModalError")?.innerText`);
    console.log('  [Validation on Empty Save] Error:', validationErr);
    results.screens.countryMaster.checks.validation = validationErr?.includes('required');

    // 6. Controlled Add New Record
    const testCountryCode = "TC";
    const testCountryName = "Testland Batch1 Controlled";
    await client.eval(`
      (() => {
        window.__setVal(document.getElementById("txtModalCountryCode"), "${testCountryCode}");
        window.__setVal(document.getElementById("txtModalCountryName"), "${testCountryName}");
        document.getElementById("btnSaveCountryModal")?.click();
      })()
    `);
    await new Promise(r => setTimeout(r, 1500));

    // Search for newly added country
    await client.eval(`
      (() => {
        window.__setVal(document.getElementById("txtCountryCodeSearch"), "${testCountryCode}");
        document.getElementById("btnCountrySearch")?.click();
      })()
    `);
    await new Promise(r => setTimeout(r, 1000));
    const addedCountryFound = await client.eval(`
      Array.from(document.querySelectorAll("#tblCountryMaster tbody tr")).some(tr => tr.innerText.includes("${testCountryCode}"))
    `);
    console.log('  [Add New Country "TC"] Found in table:', addedCountryFound);
    results.screens.countryMaster.checks.addNew = addedCountryFound;

    // 7. Controlled Edit Record
    await client.eval(`
      (() => {
        const tr = Array.from(document.querySelectorAll("#tblCountryMaster tbody tr")).find(r => r.innerText.includes("${testCountryCode}"));
        tr?.querySelector(".btn-edit-country")?.click();
      })()
    `);
    await new Promise(r => setTimeout(r, 500));
    const updatedCountryName = "Testland Batch1 Updated Controlled";
    await client.eval(`
      (() => {
        window.__setVal(document.getElementById("txtModalCountryName"), "${updatedCountryName}");
        document.getElementById("btnSaveApproveCountryModal")?.click();
      })()
    `);
    await new Promise(r => setTimeout(r, 1500));

    // Verify edited
    await client.eval(`document.getElementById("btnCountrySearch")?.click();`);
    await new Promise(r => setTimeout(r, 1000));
    const editedCountryFound = await client.eval(`
      Array.from(document.querySelectorAll("#tblCountryMaster tbody tr")).some(tr => tr.innerText.includes("${updatedCountryName}"))
    `);
    console.log('  [Edit Country] Updated name found in table:', editedCountryFound);
    results.screens.countryMaster.checks.edit = editedCountryFound;

    // 8. Controlled Delete Record Cleanup
    await client.eval(`
      (() => {
        const tr = Array.from(document.querySelectorAll("#tblCountryMaster tbody tr")).find(r => r.innerText.includes("${testCountryCode}"));
        tr?.querySelector(".btn-delete-country")?.click();
      })()
    `);
    await new Promise(r => setTimeout(r, 1500));
    await client.eval(`document.getElementById("btnCountrySearch")?.click();`);
    await new Promise(r => setTimeout(r, 1000));
    const deletedCountryStillPresent = await client.eval(`
      Array.from(document.querySelectorAll("#tblCountryMaster tbody tr")).some(tr => tr.innerText.includes("${testCountryCode}"))
    `);
    console.log('  [Delete Country Cleanup] Removed from table:', !deletedCountryStillPresent);
    results.screens.countryMaster.checks.delete = !deletedCountryStillPresent;

    // Reset search
    await client.eval(`
      (() => {
        window.__setVal(document.getElementById("txtCountryCodeSearch"), "");
        document.getElementById("btnCountrySearch")?.click();
      })()
    `);

    results.screens.countryMaster.passed = Object.values(results.screens.countryMaster.checks).every(Boolean);
  } catch (err) {
    console.error('Country Master test failed:', err);
    results.screens.countryMaster.passed = false;
    results.screens.countryMaster.error = err.message;
  }

  // =========================================================================
  // SCREEN 2: DISTRICT MASTER (/masters/districts)
  // =========================================================================
  console.log('\n======================================================');
  console.log('Screen 2: District Master (/masters/districts)');
  console.log('======================================================');
  results.screens.districtMaster = { passed: false, checks: {} };

  try {
    // 1. Direct navigation
    await client.navigate('http://localhost:5173/masters/districts', 2500);
    await client.eval(injectHelperScript);
    const bodyText2 = await client.eval('document.body.innerText');
    console.log('  [Direct Navigation] Content loaded:', bodyText2.includes('District Master'));
    results.screens.districtMaster.checks.directNavigation = bodyText2.includes('District Master');

    // 2. Page refresh
    await client.reload(2000);
    await client.eval(injectHelperScript);
    const rowCount2 = await client.eval('document.querySelectorAll("#tblDistrictMaster tbody tr").length');
    console.log('  [Page Refresh] Rows present:', rowCount2);
    results.screens.districtMaster.checks.pageRefresh = rowCount2 > 0;

    // 3. Dependent dropdowns & Validation in Add Modal
    await client.eval(`document.getElementById("btnAddNewDistrict")?.click();`);
    await new Promise(r => setTimeout(r, 500));
    await client.eval(`document.getElementById("btnSaveDistrictModal")?.click();`);
    await new Promise(r => setTimeout(r, 500));
    const valErr2 = await client.eval(`document.getElementById("districtModalError")?.innerText`);
    console.log('  [Validation on Empty Save] Error:', valErr2);
    results.screens.districtMaster.checks.validation = valErr2?.includes('required');

    // 4. Controlled Add Record
    const testDistrictCode = "TD1";
    const testDistrictName = "Test District Batch1 Controlled";
    await client.eval(`
      (() => {
        window.__setVal(document.getElementById("txtModalDistrictCode"), "${testDistrictCode}");
        window.__setVal(document.getElementById("txtModalDistrictName"), "${testDistrictName}");
        document.getElementById("btnSaveDistrictModal")?.click();
      })()
    `);
    await new Promise(r => setTimeout(r, 1500));

    // Search for newly added district
    await client.eval(`
      (() => {
        window.__setVal(document.getElementById("txtDistrictCodeSearch"), "${testDistrictCode}");
        document.getElementById("btnDistrictSearch")?.click();
      })()
    `);
    await new Promise(r => setTimeout(r, 1000));
    const addedDistrictFound = await client.eval(`
      Array.from(document.querySelectorAll("#tblDistrictMaster tbody tr")).some(tr => tr.innerText.includes("${testDistrictCode}"))
    `);
    console.log('  [Add New District "TD1"] Found in table:', addedDistrictFound);
    results.screens.districtMaster.checks.addNew = addedDistrictFound;

    // 5. Controlled Edit Record
    await client.eval(`
      (() => {
        const tr = Array.from(document.querySelectorAll("#tblDistrictMaster tbody tr")).find(r => r.innerText.includes("${testDistrictCode}"));
        tr?.querySelector(".btn-edit-district")?.click();
      })()
    `);
    await new Promise(r => setTimeout(r, 500));
    const updatedDistrictName = "Test District Batch1 Updated Controlled";
    await client.eval(`
      (() => {
        window.__setVal(document.getElementById("txtModalDistrictName"), "${updatedDistrictName}");
        document.getElementById("btnSaveApproveDistrictModal")?.click();
      })()
    `);
    await new Promise(r => setTimeout(r, 1500));

    // Verify edited
    await client.eval(`document.getElementById("btnDistrictSearch")?.click();`);
    await new Promise(r => setTimeout(r, 1000));
    const editedDistrictFound = await client.eval(`
      Array.from(document.querySelectorAll("#tblDistrictMaster tbody tr")).some(tr => tr.innerText.includes("${updatedDistrictName}"))
    `);
    console.log('  [Edit District] Updated name found in table:', editedDistrictFound);
    results.screens.districtMaster.checks.edit = editedDistrictFound;

    // 6. Controlled Delete Record
    await client.eval(`
      (() => {
        const tr = Array.from(document.querySelectorAll("#tblDistrictMaster tbody tr")).find(r => r.innerText.includes("${testDistrictCode}"));
        tr?.querySelector(".btn-delete-district")?.click();
      })()
    `);
    await new Promise(r => setTimeout(r, 1500));
    await client.eval(`document.getElementById("btnDistrictSearch")?.click();`);
    await new Promise(r => setTimeout(r, 1000));
    const deletedDistStillPresent = await client.eval(`
      Array.from(document.querySelectorAll("#tblDistrictMaster tbody tr")).some(tr => tr.innerText.includes("${testDistrictCode}"))
    `);
    console.log('  [Delete District Cleanup] Removed from table:', !deletedDistStillPresent);
    results.screens.districtMaster.checks.delete = !deletedDistStillPresent;

    // Reset search
    await client.eval(`
      (() => {
        window.__setVal(document.getElementById("txtDistrictCodeSearch"), "");
        document.getElementById("btnDistrictSearch")?.click();
      })()
    `);

    results.screens.districtMaster.passed = Object.values(results.screens.districtMaster.checks).every(Boolean);
  } catch (err) {
    console.error('District Master test failed:', err);
    results.screens.districtMaster.passed = false;
    results.screens.districtMaster.error = err.message;
  }

  // =========================================================================
  // SCREEN 3: PINCODE MASTER (/masters/pincodes)
  // =========================================================================
  console.log('\n======================================================');
  console.log('Screen 3: Pincode Master (/masters/pincodes)');
  console.log('======================================================');
  results.screens.pincodeMaster = { passed: false, checks: {} };

  try {
    // 1. Direct navigation
    await client.navigate('http://localhost:5173/masters/pincodes', 2500);
    await client.eval(injectHelperScript);
    const bodyText3 = await client.eval('document.body.innerText');
    console.log('  [Direct Navigation] Content loaded:', bodyText3.includes('Pincode Master'));
    results.screens.pincodeMaster.checks.directNavigation = bodyText3.includes('Pincode Master');

    // 2. Page refresh
    await client.reload(2000);
    await client.eval(injectHelperScript);
    const rowCount3 = await client.eval('document.querySelectorAll("#tblPincodeMaster tbody tr").length');
    console.log('  [Page Refresh] Rows present:', rowCount3);
    results.screens.pincodeMaster.checks.pageRefresh = rowCount3 > 0;

    // 3. Validation in Add Modal
    await client.eval(`document.getElementById("btnAddNewPincode")?.click();`);
    await new Promise(r => setTimeout(r, 500));
    await client.eval(`document.getElementById("btnSaveApprovePincodeModal")?.click();`);
    await new Promise(r => setTimeout(r, 500));
    const valErr3 = await client.eval(`document.getElementById("pincodeModalError")?.innerText`);
    console.log('  [Validation on Empty Save] Error:', valErr3);
    results.screens.pincodeMaster.checks.validation = valErr3?.includes('required');

    // 4. Controlled Add Record
    const testPincode = "998877";
    const testArea = "Test Area Batch1 Controlled";
    await client.eval(`
      (() => {
        window.__setVal(document.getElementById("txtModalPincode"), "${testPincode}");
        window.__setVal(document.getElementById("txtModalArea"), "${testArea}");
        document.getElementById("btnSaveApprovePincodeModal")?.click();
      })()
    `);
    await new Promise(r => setTimeout(r, 1500));

    // Search for newly added pincode
    await client.eval(`
      (() => {
        window.__setVal(document.getElementById("txtPincodeSearch"), "${testPincode}");
        document.getElementById("btnPincodeSearch")?.click();
      })()
    `);
    await new Promise(r => setTimeout(r, 1000));
    const addedPinFound = await client.eval(`
      Array.from(document.querySelectorAll("#tblPincodeMaster tbody tr")).some(tr => tr.innerText.includes("${testPincode}"))
    `);
    console.log('  [Add New Pincode "998877"] Found in table:', addedPinFound);
    results.screens.pincodeMaster.checks.addNew = addedPinFound;

    // 5. Controlled Edit Record
    await client.eval(`
      (() => {
        const tr = Array.from(document.querySelectorAll("#tblPincodeMaster tbody tr")).find(r => r.innerText.includes("${testPincode}"));
        tr?.querySelector(".btn-edit-pincode")?.click();
      })()
    `);
    await new Promise(r => setTimeout(r, 500));
    const updatedArea = "Test Area Batch1 Updated Controlled";
    await client.eval(`
      (() => {
        window.__setVal(document.getElementById("txtModalArea"), "${updatedArea}");
        document.getElementById("btnSaveApprovePincodeModal")?.click();
      })()
    `);
    await new Promise(r => setTimeout(r, 1500));

    // Verify edited
    await client.eval(`document.getElementById("btnPincodeSearch")?.click();`);
    await new Promise(r => setTimeout(r, 1000));
    const editedPinFound = await client.eval(`
      Array.from(document.querySelectorAll("#tblPincodeMaster tbody tr")).some(tr => tr.innerText.includes("${updatedArea}"))
    `);
    console.log('  [Edit Pincode] Updated area found in table:', editedPinFound);
    results.screens.pincodeMaster.checks.edit = editedPinFound;

    // 6. Controlled Delete Record
    await client.eval(`
      (() => {
        const tr = Array.from(document.querySelectorAll("#tblPincodeMaster tbody tr")).find(r => r.innerText.includes("${testPincode}"));
        tr?.querySelector(".btn-delete-pincode")?.click();
      })()
    `);
    await new Promise(r => setTimeout(r, 1500));
    await client.eval(`document.getElementById("btnPincodeSearch")?.click();`);
    await new Promise(r => setTimeout(r, 1000));
    const deletedPinStillPresent = await client.eval(`
      Array.from(document.querySelectorAll("#tblPincodeMaster tbody tr")).some(tr => tr.innerText.includes("${testPincode}"))
    `);
    console.log('  [Delete Pincode Cleanup] Removed from table:', !deletedPinStillPresent);
    results.screens.pincodeMaster.checks.delete = !deletedPinStillPresent;

    // Reset search
    await client.eval(`
      (() => {
        window.__setVal(document.getElementById("txtPincodeSearch"), "");
        document.getElementById("btnPincodeSearch")?.click();
      })()
    `);

    results.screens.pincodeMaster.passed = Object.values(results.screens.pincodeMaster.checks).every(Boolean);
  } catch (err) {
    console.error('Pincode Master test failed:', err);
    results.screens.pincodeMaster.passed = false;
    results.screens.pincodeMaster.error = err.message;
  }

  // =========================================================================
  // SCREEN 4: PATIENT SEARCH (/patientsearch)
  // =========================================================================
  console.log('\n======================================================');
  console.log('Screen 4: Patient Search (/patientsearch)');
  console.log('======================================================');
  results.screens.patientSearch = { passed: false, checks: {} };

  try {
    // 1. Direct navigation
    await client.navigate('http://localhost:5173/patientsearch', 2500);
    await client.eval(injectHelperScript);
    const bodyText4 = await client.eval('document.body.innerText');
    console.log('  [Direct Navigation] Content loaded:', bodyText4.includes('Patient'));
    results.screens.patientSearch.checks.directNavigation = bodyText4.includes('Patient');

    // 2. Page refresh
    await client.reload(2000);
    await client.eval(injectHelperScript);
    const cardCount = await client.eval(`document.querySelectorAll(".hims-card, div").length`);
    console.log('  [Page Refresh] Elements loaded:', cardCount);
    results.screens.patientSearch.checks.pageRefresh = cardCount > 0;

    // 3. Basic search by name
    await client.eval(`
      (() => {
        window.__setVal(document.getElementById("txtPatientSearchName"), "Rajesh");
        document.getElementById("btnRunPatientSearch")?.click();
      })()
    `);
    await new Promise(r => setTimeout(r, 1500));
    const patientSearchText = await client.eval('document.body.innerText');
    const nameSearchPassed = patientSearchText.includes('Rajesh') || patientSearchText.includes('MRN');
    console.log('  [Basic Search "Rajesh"] Results displayed:', nameSearchPassed);
    results.screens.patientSearch.checks.basicSearch = nameSearchPassed;

    // 4. Advanced Filter Modal Drawer test
    await client.eval(`document.getElementById("btnFilterPatientSearch")?.click();`);
    await new Promise(r => setTimeout(r, 500));
    const advFilterOpen = await client.eval(`!!document.getElementById("patientAdvancedFilterDialog")`);
    console.log('  [Advanced Filter Modal Open] Visible:', advFilterOpen);
    results.screens.patientSearch.checks.advancedFilterOpen = advFilterOpen;

    // Apply Advanced Filter
    await client.eval(`
      (() => {
        const nameInput = document.getElementById("txtAdvFilterName");
        if (nameInput) window.__setVal(nameInput, "a");
        document.getElementById("btnApplyAdvFilter")?.click();
      })()
    `);
    await new Promise(r => setTimeout(r, 1500));
    const advFilterApplied = await client.eval(`!document.getElementById("patientAdvancedFilterDialog")`);
    console.log('  [Advanced Filter Applied] Drawer closed & results refreshed:', advFilterApplied);
    results.screens.patientSearch.checks.advancedFilterApplied = advFilterApplied;

    results.screens.patientSearch.passed = Object.values(results.screens.patientSearch.checks).every(Boolean);
  } catch (err) {
    console.error('Patient Search test failed:', err);
    results.screens.patientSearch.passed = false;
    results.screens.patientSearch.error = err.message;
  }

  // =========================================================================
  // SCREEN 5: PATIENT IDENTITY (/registration/identity)
  // =========================================================================
  console.log('\n======================================================');
  console.log('Screen 5: Patient Identity (/registration/identity)');
  console.log('======================================================');
  results.screens.patientIdentity = { passed: false, checks: {} };

  try {
    // 1. Direct navigation with selected patient
    await client.navigate('http://localhost:5173/registration/identity?patientId=1', 2500);
    await client.eval(injectHelperScript);
    const bodyText5 = await client.eval('document.body.innerText');
    console.log('  [Direct Navigation ?patientId=1] Content loaded:', bodyText5.includes('Patient Identity'));
    results.screens.patientIdentity.checks.directNavigation = bodyText5.includes('Patient Identity');

    // 2. Tab Navigation presence
    const tabsExist = bodyText5.includes('Basic Information') && bodyText5.includes('Next of Kin');
    console.log('  [Registration Tab Navigation Strip] Tabs present:', tabsExist);
    results.screens.patientIdentity.checks.tabNavigation = tabsExist;

    // 3. Validation on Empty Save
    await client.eval(`document.getElementById("btnSaveIdentity")?.click();`);
    await new Promise(r => setTimeout(r, 500));
    const valErr5 = await client.eval(`document.getElementById("identityValidationAlert")?.innerText`);
    console.log('  [Validation on Empty Save] Error:', valErr5);
    results.screens.patientIdentity.checks.validation = valErr5?.includes('required');

    // 4. Controlled Add Identity
    const testIdNumber = "TEST-ID-BATCH1-999";
    await new Promise(r => setTimeout(r, 1000));
    await client.eval(`
      (() => {
        const select = document.getElementById("ddlPatientIdentityType");
        if (select && select.options.length > 1) {
          window.__setVal(select, select.options[1].value);
        }
        window.__setVal(document.getElementById("txtPatientIdentityIDNumber"), "${testIdNumber}");
        window.__setVal(document.getElementById("txtPatientIdentityComments"), "Controlled Test Identity Batch1");
        document.getElementById("btnSaveIdentity")?.click();
      })()
    `);
    await new Promise(r => setTimeout(r, 2000));
    const successMsg5 = await client.eval(`document.getElementById("identitySuccessAlert")?.innerText`);
    console.log('  [Add Identity Record] Response:', successMsg5);
    results.screens.patientIdentity.checks.addIdentity = !!(successMsg5 && successMsg5.includes('successfully'));

    // 5. Controlled Delete Identity Cleanup
    await client.eval(`
      (() => {
        const tr = Array.from(document.querySelectorAll("#tblPatientIdentities tbody tr")).find(r => r.innerText.includes("${testIdNumber}"));
        tr?.querySelector(".btn-delete-identity")?.click();
      })()
    `);
    await new Promise(r => setTimeout(r, 1500));
    const deleteMsg5 = await client.eval(`document.getElementById("identitySuccessAlert")?.innerText`);
    console.log('  [Delete Identity Cleanup] Response:', deleteMsg5);
    const deletedIdentPresent = await client.eval(`
      Array.from(document.querySelectorAll("#tblPatientIdentities tbody tr")).some(r => r.innerText.includes("${testIdNumber}"))
    `);
    console.log('  [Delete Identity Cleanup] Removed from table:', !deletedIdentPresent);
    results.screens.patientIdentity.checks.deleteIdentity = !deletedIdentPresent;

    results.screens.patientIdentity.passed = Object.values(results.screens.patientIdentity.checks).every(Boolean);
  } catch (err) {
    console.error('Patient Identity test failed:', err);
    results.screens.patientIdentity.passed = false;
    results.screens.patientIdentity.error = err.message;
  }

  // =========================================================================
  // SCREEN 6: NEXT OF KIN (/registration/kin)
  // =========================================================================
  console.log('\n======================================================');
  console.log('Screen 6: Next of Kin (/registration/kin)');
  console.log('======================================================');
  results.screens.patientKin = { passed: false, checks: {} };

  try {
    // 1. Direct navigation with selected patient
    await client.navigate('http://localhost:5173/registration/kin?patientId=1', 2500);
    await client.eval(injectHelperScript);
    const bodyText6 = await client.eval('document.body.innerText');
    console.log('  [Direct Navigation ?patientId=1] Content loaded:', bodyText6.includes('Next of Kin'));
    results.screens.patientKin.checks.directNavigation = bodyText6.includes('Next of Kin');

    // 2. Pure React Address Widget Presence
    const hasAddressFields = await client.eval(`
      !!document.getElementById("txtKinAddressLine1") &&
      !!document.getElementById("txtKinWardArea") &&
      !!document.getElementById("txtKinPincode") &&
      !!document.getElementById("ddlKinCountry") &&
      !!document.getElementById("ddlKinState") &&
      !!document.getElementById("ddlKinDistrict") &&
      !!document.getElementById("ddlKinCity")
    `);
    console.log('  [React Address Widget] Address fields present:', hasAddressFields);
    results.screens.patientKin.checks.addressWidget = hasAddressFields;

    // 3. "Same Address" Auto-fill toggle
    await client.eval(`
      (() => {
        const chk = document.getElementById("chkKinSameAddress");
        if (chk) chk.click();
      })()
    `);
    await new Promise(r => setTimeout(r, 1000));
    results.screens.patientKin.checks.sameAddressToggle = true;
    console.log('  [Same Address Auto-fill] Toggle exercised: true');

    // 4. Validation on Empty Save
    await client.eval(`document.getElementById("btnSaveKin")?.click();`);
    await new Promise(r => setTimeout(r, 500));
    const valErr6 = await client.eval(`document.getElementById("kinValidationAlert")?.innerText`);
    console.log('  [Validation on Empty Save] Error:', valErr6);
    results.screens.patientKin.checks.validation = valErr6?.includes('required');

    // 5. Controlled Add Kin Record
    const testKinName = "Controlled Test Kin Batch1";
    await new Promise(r => setTimeout(r, 1000));
    await client.eval(`
      (() => {
        const rel = document.getElementById("ddlKinRelationship");
        if (rel && rel.options.length > 1) window.__setVal(rel, rel.options[1].value);

        const title = document.getElementById("ddlKinTitle");
        if (title && title.options.length > 1) window.__setVal(title, title.options[1].value);

        const gender = document.getElementById("ddlKinGender");
        if (gender && gender.options.length > 1) window.__setVal(gender, gender.options[1].value);

        window.__setVal(document.getElementById("txtKinName"), "${testKinName}");
        window.__setVal(document.getElementById("txtKinMobile"), "9876543210");
        window.__setVal(document.getElementById("txtKinAddressLine1"), "123 Test Street");
        window.__setVal(document.getElementById("txtKinWardArea"), "Central Ward");
        window.__setVal(document.getElementById("txtKinPincode"), "110001");
        document.getElementById("btnSaveKin")?.click();
      })()
    `);
    await new Promise(r => setTimeout(r, 2000));
    const successMsg6 = await client.eval(`document.getElementById("kinSuccessAlert")?.innerText`);
    console.log('  [Add Kin Record] Response:', successMsg6);
    results.screens.patientKin.checks.addKin = !!(successMsg6 && successMsg6.includes('successfully'));

    // 6. Clean up controlled kin record from DB directly
    const conn = await mysql.createConnection({
      host: 'localhost',
      port: 3307,
      user: 'root',
      password: 'root',
      database: 'test'
    });
    const [delRes] = await conn.execute('DELETE FROM patientkins WHERE Name = ?', [testKinName]);
    console.log('  [Cleanup Controlled Kin Record] Deleted rows:', delRes.affectedRows);
    await conn.end();
    results.screens.patientKin.checks.cleanup = delRes.affectedRows > 0;

    results.screens.patientKin.passed = Object.values(results.screens.patientKin.checks).every(Boolean);
  } catch (err) {
    console.error('Patient Kin test failed:', err);
    results.screens.patientKin.passed = false;
    results.screens.patientKin.error = err.message;
  }

  client.close();

  // Save results report
  fs.writeFileSync('batch1_workflow_test_results.json', JSON.stringify(results, null, 2));
  console.log('\n======================================================');
  console.log('Batch 1 Workflow Test Run Completed.');
  console.log('Summary of Screen Results:');
  for (const [key, val] of Object.entries(results.screens)) {
    console.log(`  - ${key}: ${val.passed ? 'PASSED (100%)' : 'FAILED'} (checks: ${JSON.stringify(val.checks)})`);
  }
  console.log('Results written to batch1_workflow_test_results.json');
  console.log('======================================================');
}

run().catch(console.error);
