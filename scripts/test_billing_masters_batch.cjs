// scripts/test_billing_masters_batch.cjs
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
      if (el._valueTracker) {
        el._valueTracker.setValue('' + Math.random());
      }
      if (setter) {
        setter.call(el, val);
      } else {
        el.value = val;
      }
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
      return true;
    };
    window.__isValInTable = function(val) {
      const inputs = Array.from(document.querySelectorAll('table tbody tr input'));
      const foundInInput = inputs.some(i => i.value && i.value.trim() === val.trim());
      const foundInText = document.body.innerText.includes(val);
      return foundInInput || foundInText;
    };
    window.confirm = () => true;
  `;

  const results = {
    testedAt: new Date().toISOString(),
    batch: "Billing Masters Batch (4 Screens - Non-EMR)",
    screens: {}
  };

  // =========================================================================
  // SCREEN 1: SERVICE CATEGORIES (/servicecategories)
  // =========================================================================
  console.log('\n==========================================================');
  console.log('TESTING SCREEN 1: Service Categories (/servicecategories)');
  console.log('==========================================================');
  results.screens.serviceCategories = { passed: false, checks: {} };

  try {
    await client.navigate('http://localhost:5173/servicecategories', 3000);
    await client.eval(helperScript);
    const initialRows = await client.eval(`document.querySelectorAll("table tbody tr").length`);
    console.log('  [Direct Nav] Initial records/rows loaded:', initialRows);
    results.screens.serviceCategories.checks.directNav = initialRows > 0;

    await client.reload(2500);
    await client.eval(helperScript);
    const postReloadRows = await client.eval(`document.querySelectorAll("table tbody tr").length`);
    console.log('  [Reload] Rows loaded after refresh:', postReloadRows);
    results.screens.serviceCategories.checks.reload = postReloadRows > 0;

    // Validation: Click Add Row, then Save with empty fields
    console.log('  [Validation on Empty Save] Testing validation...');
    await client.eval(`document.getElementById("btnAddNewServiceCategory")?.click();`);
    await new Promise(r => setTimeout(r, 600));
    await client.eval(`document.getElementById("btnSaveServiceCategoriesTop")?.click();`);
    await new Promise(r => setTimeout(r, 800));
    const valErr = await client.eval(`
      document.body.innerText.includes("required") || 
      document.body.innerText.includes("Please enter at least one") ||
      document.body.innerText.includes("Failed") ||
      document.querySelectorAll("[class*='toast']").length > 0
    `);
    console.log('  [Validation on Empty Save] Validation/Toast triggered:', valErr);
    results.screens.serviceCategories.checks.validation = valErr;

    // Reload for a clean state before real add
    await client.reload(2500);
    await client.eval(helperScript);

    // Real Add: Fill bottom empty row
    const testCode = `SC${Date.now().toString().slice(-4)}`;
    const testName = `TestCat_${testCode}`;
    console.log('  [Real Add] Adding test record:', testCode, testName);
    await client.eval(`
      (async () => {
        const rows = document.querySelectorAll("table tbody tr");
        const lastRow = rows[rows.length - 1];
        if (lastRow) {
          const codeInput = lastRow.querySelector("input[placeholder='Code']");
          const nameInput = lastRow.querySelector("input[placeholder='Category Name']");
          if (codeInput) window.__setVal(codeInput, "${testCode}");
          if (nameInput) window.__setVal(nameInput, "${testName}");
        }
        await new Promise(r => setTimeout(r, 600));
        document.getElementById("btnSaveServiceCategoriesTop")?.click();
      })()
    `);
    await new Promise(r => setTimeout(r, 3000));

    // Reload and search
    await client.reload(2500);
    await client.eval(helperScript);
    await client.eval(`
      (() => {
        const inp = document.getElementById("inputSearchCategory");
        if (inp) window.__setVal(inp, "${testCode}");
        document.getElementById("btnFilterSearch")?.click();
      })()
    `);
    await new Promise(r => setTimeout(r, 2000));
    const foundAdded = await client.eval(`window.__isValInTable("${testCode}")`);
    console.log('  [Real Add Verification] Record found in table:', foundAdded);
    results.screens.serviceCategories.checks.realAdd = foundAdded;

    // Real Edit
    const updatedName = `${testName}_EDIT`;
    console.log('  [Real Edit] Updating category name to:', updatedName);
    await client.eval(`
      (async () => {
        const rows = document.querySelectorAll("table tbody tr");
        for (const row of rows) {
          const codeInput = row.querySelector("input[placeholder='Code']");
          if (codeInput && codeInput.value === "${testCode}") {
            const nameInput = row.querySelector("input[placeholder='Category Name']");
            if (nameInput) window.__setVal(nameInput, "${updatedName}");
            break;
          }
        }
        await new Promise(r => setTimeout(r, 600));
        document.getElementById("btnSaveServiceCategoriesTop")?.click();
      })()
    `);
    await new Promise(r => setTimeout(r, 3000));

    // Reload and verify edit
    await client.reload(2500);
    await client.eval(helperScript);
    await client.eval(`
      (() => {
        const inp = document.getElementById("inputSearchCategory");
        if (inp) window.__setVal(inp, "${testCode}");
        document.getElementById("btnFilterSearch")?.click();
      })()
    `);
    await new Promise(r => setTimeout(r, 2000));
    const foundEdited = await client.eval(`window.__isValInTable("${updatedName}")`);
    console.log('  [Real Edit Verification] Updated name found in table:', foundEdited);
    results.screens.serviceCategories.checks.realEdit = foundEdited;

    // Real Delete & Zero Residue Cleanup
    console.log('  [Real Delete] Cleaning up test record...');
    await client.eval(`
      (() => {
        const rows = document.querySelectorAll("table tbody tr");
        for (const row of rows) {
          const codeInput = row.querySelector("input[placeholder='Code']");
          if (codeInput && codeInput.value === "${testCode}") {
            const delBtn = row.querySelector("button[title='Delete Category']");
            if (delBtn) delBtn.click();
            break;
          }
        }
      })()
    `);
    await new Promise(r => setTimeout(r, 800));
    await client.eval(`document.getElementById("btnConfirmModalYes")?.click();`);
    await new Promise(r => setTimeout(r, 3000));

    // Reload and verify deleted
    await client.reload(2000);
    await client.eval(helperScript);
    await client.eval(`
      (() => {
        const inp = document.getElementById("inputSearchCategory");
        if (inp) window.__setVal(inp, "${testCode}");
        document.getElementById("btnFilterSearch")?.click();
      })()
    `);
    await new Promise(r => setTimeout(r, 1500));
    const stillPresent = await client.eval(`window.__isValInTable("${testCode}")`);
    console.log('  [Real Delete Verification] Clean zero-residue (not present):', !stillPresent);
    results.screens.serviceCategories.checks.realDeleteZeroResidue = !stillPresent;

    results.screens.serviceCategories.passed = Object.values(results.screens.serviceCategories.checks).every(Boolean);
    console.log('  >> Service Categories Result:', results.screens.serviceCategories.passed ? 'PASSED' : 'FAILED');
  } catch (err) {
    console.error('  >> Service Categories Exception:', err.message);
    results.screens.serviceCategories.error = err.message;
  }

  // =========================================================================
  // SCREEN 2: SERVICE RATE CATEGORIES (/serviceratecategories)
  // =========================================================================
  console.log('\n==========================================================');
  console.log('TESTING SCREEN 2: Service Rate Categories (/serviceratecategories)');
  console.log('==========================================================');
  results.screens.serviceRateCategories = { passed: false, checks: {} };

  try {
    await client.navigate('http://localhost:5173/serviceratecategories', 3000);
    await client.eval(helperScript);
    const initialRows = await client.eval(`document.querySelectorAll("table tbody tr").length`);
    console.log('  [Direct Nav] Initial records loaded:', initialRows);
    results.screens.serviceRateCategories.checks.directNav = initialRows > 0;

    await client.reload(2500);
    await client.eval(helperScript);
    const postReloadRows = await client.eval(`document.querySelectorAll("table tbody tr").length`);
    console.log('  [Reload] Records loaded after refresh:', postReloadRows);
    results.screens.serviceRateCategories.checks.reload = postReloadRows > 0;

    // Validation
    console.log('  [Validation on Empty Save] Testing validation...');
    await client.eval(`document.getElementById("btnAddServiceRateCategory")?.click();`);
    await new Promise(r => setTimeout(r, 600));
    await client.eval(`
      (() => {
        const inp = document.getElementById("inputModalRateCategory");
        if (inp) window.__setVal(inp, "");
        document.getElementById("btnSaveRateCategoryModal")?.click();
      })()
    `);
    await new Promise(r => setTimeout(r, 600));
    const valErr = await client.eval(`
      document.body.innerText.includes("required") || 
      document.body.innerText.includes("Service Rate Category name is required")
    `);
    console.log('  [Validation on Empty Save] Error message shown:', valErr);
    results.screens.serviceRateCategories.checks.validation = valErr;

    // Real Add
    const testCode = `SRC${Date.now().toString().slice(-4)}`;
    const testName = `TestRateCat_${testCode}`;
    const testDesc = `RateCategory Description ${testCode}`;
    console.log('  [Real Add] Adding test record:', testName);
    await client.eval(`
      (async () => {
        const nInp = document.getElementById("inputModalRateCategory");
        if (nInp) window.__setVal(nInp, "${testName}");
        const dInp = document.getElementById("inputModalDescription");
        if (dInp) window.__setVal(dInp, "${testDesc}");
        await new Promise(r => setTimeout(r, 600));
        document.getElementById("btnSaveRateCategoryModal")?.click();
      })()
    `);
    await new Promise(r => setTimeout(r, 3000));

    // Reload and search
    await client.reload(2500);
    await client.eval(helperScript);
    await client.eval(`
      (() => {
        const inp = document.getElementById("filterSearchName");
        if (inp) window.__setVal(inp, "${testName}");
        document.getElementById("btnFilterSearchRateCategory")?.click();
      })()
    `);
    await new Promise(r => setTimeout(r, 2000));
    const foundAdded = await client.eval(`window.__isValInTable("${testName}")`);
    console.log('  [Real Add Verification] Record found in table:', foundAdded);
    results.screens.serviceRateCategories.checks.realAdd = foundAdded;

    // Real Edit
    const updatedDesc = `${testDesc}_EDITED`;
    console.log('  [Real Edit] Updating description to:', updatedDesc);
    await client.eval(`
      (() => {
        const rows = document.querySelectorAll("table tbody tr");
        for (const row of rows) {
          if (row.innerText.includes("${testName}")) {
            const editBtn = row.querySelector("button[title='Edit Rate Category']");
            if (editBtn) editBtn.click();
            break;
          }
        }
      })()
    `);
    await new Promise(r => setTimeout(r, 1000));
    await client.eval(`
      (async () => {
        const dInp = document.getElementById("inputModalDescription");
        if (dInp) window.__setVal(dInp, "${updatedDesc}");
        await new Promise(r => setTimeout(r, 600));
        document.getElementById("btnSaveRateCategoryModal")?.click();
      })()
    `);
    await new Promise(r => setTimeout(r, 3000));

    // Reload and verify edit
    await client.reload(2500);
    await client.eval(helperScript);
    await client.eval(`
      (() => {
        const inp = document.getElementById("filterSearchName");
        if (inp) window.__setVal(inp, "${testName}");
        document.getElementById("btnFilterSearchRateCategory")?.click();
      })()
    `);
    await new Promise(r => setTimeout(r, 2000));
    const foundEdited = await client.eval(`window.__isValInTable("${testName}")`);
    console.log('  [Real Edit Verification] Record found post-edit:', foundEdited);
    results.screens.serviceRateCategories.checks.realEdit = foundEdited;

    // Real Delete & Zero Residue Cleanup
    console.log('  [Real Delete] Cleaning up test record...');
    await client.eval(`
      (() => {
        const rows = document.querySelectorAll("table tbody tr");
        for (const row of rows) {
          if (row.innerText.includes("${testName}")) {
            const delBtn = row.querySelector("button[title='Delete Rate Category']");
            if (delBtn) delBtn.click();
            break;
          }
        }
      })()
    `);
    await new Promise(r => setTimeout(r, 800));
    await client.eval(`document.getElementById("btnConfirmModalYes")?.click();`);
    await new Promise(r => setTimeout(r, 3000));

    // Reload and verify clean deletion
    await client.reload(2000);
    await client.eval(helperScript);
    await client.eval(`
      (() => {
        const inp = document.getElementById("filterSearchName");
        if (inp) window.__setVal(inp, "${testName}");
        document.getElementById("btnFilterSearchRateCategory")?.click();
      })()
    `);
    await new Promise(r => setTimeout(r, 1500));
    const stillPresent = await client.eval(`window.__isValInTable("${testName}")`);
    console.log('  [Real Delete Verification] Clean zero-residue (not present):', !stillPresent);
    results.screens.serviceRateCategories.checks.realDeleteZeroResidue = !stillPresent;

    results.screens.serviceRateCategories.passed = Object.values(results.screens.serviceRateCategories.checks).every(Boolean);
    console.log('  >> Service Rate Categories Result:', results.screens.serviceRateCategories.passed ? 'PASSED' : 'FAILED');
  } catch (err) {
    console.error('  >> Service Rate Categories Exception:', err.message);
    results.screens.serviceRateCategories.error = err.message;
  }

  // =========================================================================
  // SCREEN 3: SERVICE GROUPS (/servicegroups)
  // =========================================================================
  console.log('\n==========================================================');
  console.log('TESTING SCREEN 3: Service Groups (/servicegroups)');
  console.log('==========================================================');
  results.screens.serviceGroups = { passed: false, checks: {} };

  try {
    await client.navigate('http://localhost:5173/servicegroups', 3000);
    await client.eval(helperScript);
    const initialRows = await client.eval(`document.querySelectorAll("table tbody tr").length`);
    console.log('  [Direct Nav] Initial records/rows loaded:', initialRows);
    results.screens.serviceGroups.checks.directNav = initialRows > 0;

    await client.reload(2500);
    await client.eval(helperScript);
    const postReloadRows = await client.eval(`document.querySelectorAll("table tbody tr").length`);
    console.log('  [Reload] Rows loaded after refresh:', postReloadRows);
    results.screens.serviceGroups.checks.reload = postReloadRows > 0;

    // Validation
    console.log('  [Validation on Empty Save] Testing validation...');
    await client.eval(`document.getElementById("btnAddNewServiceGroup")?.click();`);
    await new Promise(r => setTimeout(r, 600));
    await client.eval(`document.getElementById("btnSaveServiceGroupsTop")?.click();`);
    await new Promise(r => setTimeout(r, 800));
    const valErr = await client.eval(`
      document.body.innerText.includes("required") || 
      document.body.innerText.includes("Please enter at least one") ||
      document.body.innerText.includes("Failed") ||
      document.querySelectorAll("[class*='toast']").length > 0
    `);
    console.log('  [Validation on Empty Save] Validation/Toast triggered:', valErr);
    results.screens.serviceGroups.checks.validation = valErr;

    // Reload for a clean state before real add
    await client.reload(2500);
    await client.eval(helperScript);

    // Real Add
    const testCode = `SG${Date.now().toString().slice(-4)}`;
    const testName = `TestGroup_${testCode}`;
    console.log('  [Real Add] Adding test record:', testCode, testName);
    await client.eval(`
      (async () => {
        const rows = document.querySelectorAll("table tbody tr");
        const lastRow = rows[rows.length - 1];
        if (lastRow) {
          const codeInput = lastRow.querySelector("input[placeholder='Code']");
          const nameInput = lastRow.querySelector("input[placeholder='Group Name']");
          if (codeInput) window.__setVal(codeInput, "${testCode}");
          if (nameInput) window.__setVal(nameInput, "${testName}");
        }
        await new Promise(r => setTimeout(r, 600));
        document.getElementById("btnSaveServiceGroupsTop")?.click();
      })()
    `);
    await new Promise(r => setTimeout(r, 3000));

    // Reload and search
    await client.reload(2500);
    await client.eval(helperScript);
    await client.eval(`
      (() => {
        const inp = document.getElementById("inputSearchGroup");
        if (inp) window.__setVal(inp, "${testCode}");
        document.getElementById("btnFilterSearchGroup")?.click();
      })()
    `);
    await new Promise(r => setTimeout(r, 2000));
    const foundAdded = await client.eval(`window.__isValInTable("${testCode}")`);
    console.log('  [Real Add Verification] Record found in table:', foundAdded);
    results.screens.serviceGroups.checks.realAdd = foundAdded;

    // Real Edit
    const updatedName = `${testName}_EDIT`;
    console.log('  [Real Edit] Updating group name to:', updatedName);
    await client.eval(`
      (async () => {
        const rows = document.querySelectorAll("table tbody tr");
        for (const row of rows) {
          const codeInput = row.querySelector("input[placeholder='Code']");
          if (codeInput && codeInput.value === "${testCode}") {
            const nameInput = row.querySelector("input[placeholder='Group Name']");
            if (nameInput) window.__setVal(nameInput, "${updatedName}");
            break;
          }
        }
        await new Promise(r => setTimeout(r, 600));
        document.getElementById("btnSaveServiceGroupsTop")?.click();
      })()
    `);
    await new Promise(r => setTimeout(r, 3000));

    // Reload and verify edit
    await client.reload(2500);
    await client.eval(helperScript);
    await client.eval(`
      (() => {
        const inp = document.getElementById("inputSearchGroup");
        if (inp) window.__setVal(inp, "${testCode}");
        document.getElementById("btnFilterSearchGroup")?.click();
      })()
    `);
    await new Promise(r => setTimeout(r, 2000));
    const foundEdited = await client.eval(`window.__isValInTable("${updatedName}")`);
    console.log('  [Real Edit Verification] Updated name found in table:', foundEdited);
    results.screens.serviceGroups.checks.realEdit = foundEdited;

    // Real Delete & Zero Residue Cleanup
    console.log('  [Real Delete] Cleaning up test record...');
    await client.eval(`
      (() => {
        const rows = document.querySelectorAll("table tbody tr");
        for (const row of rows) {
          const codeInput = row.querySelector("input[placeholder='Code']");
          if (codeInput && codeInput.value === "${testCode}") {
            const delBtn = row.querySelector("button[title='Delete Group']");
            if (delBtn) delBtn.click();
            break;
          }
        }
      })()
    `);
    await new Promise(r => setTimeout(r, 800));
    await client.eval(`document.getElementById("btnConfirmModalYes")?.click();`);
    await new Promise(r => setTimeout(r, 3000));

    // Reload and verify clean deletion
    await client.reload(2000);
    await client.eval(helperScript);
    await client.eval(`
      (() => {
        const inp = document.getElementById("inputSearchGroup");
        if (inp) window.__setVal(inp, "${testCode}");
        document.getElementById("btnFilterSearchGroup")?.click();
      })()
    `);
    await new Promise(r => setTimeout(r, 1500));
    const stillPresent = await client.eval(`window.__isValInTable("${testCode}")`);
    console.log('  [Real Delete Verification] Clean zero-residue (not present):', !stillPresent);
    results.screens.serviceGroups.checks.realDeleteZeroResidue = !stillPresent;

    results.screens.serviceGroups.passed = Object.values(results.screens.serviceGroups.checks).every(Boolean);
    console.log('  >> Service Groups Result:', results.screens.serviceGroups.passed ? 'PASSED' : 'FAILED');
  } catch (err) {
    console.error('  >> Service Groups Exception:', err.message);
    results.screens.serviceGroups.error = err.message;
  }

  // =========================================================================
  // SCREEN 4: SERVICE SUB CATEGORIES (/servicesubcategories)
  // =========================================================================
  console.log('\n==========================================================');
  console.log('TESTING SCREEN 4: Service Sub Categories (/servicesubcategories)');
  console.log('==========================================================');
  results.screens.serviceSubCategories = { passed: false, checks: {} };

  try {
    await client.navigate('http://localhost:5173/servicesubcategories', 3000);
    await client.eval(helperScript);
    const initialRows = await client.eval(`document.querySelectorAll("table tbody tr").length`);
    console.log('  [Direct Nav] Initial records/rows loaded:', initialRows);
    results.screens.serviceSubCategories.checks.directNav = initialRows > 0;

    await client.reload(2500);
    await client.eval(helperScript);
    const postReloadRows = await client.eval(`document.querySelectorAll("table tbody tr").length`);
    console.log('  [Reload] Rows loaded after refresh:', postReloadRows);
    results.screens.serviceSubCategories.checks.reload = postReloadRows > 0;

    // Validation
    console.log('  [Validation on Empty Save] Testing validation...');
    await client.eval(`document.getElementById("btnAddNewServiceSubCategory")?.click();`);
    await new Promise(r => setTimeout(r, 600));
    await client.eval(`document.getElementById("btnSaveServiceSubCategoriesTop")?.click();`);
    await new Promise(r => setTimeout(r, 800));
    const valErr = await client.eval(`
      document.body.innerText.includes("required") || 
      document.body.innerText.includes("Please enter at least one") ||
      document.body.innerText.includes("Failed") ||
      document.querySelectorAll("[class*='toast']").length > 0
    `);
    console.log('  [Validation on Empty Save] Validation/Toast triggered:', valErr);
    results.screens.serviceSubCategories.checks.validation = valErr;

    // Reload for a clean state before real add
    await client.reload(2500);
    await client.eval(helperScript);

    // Real Add
    const testCode = `SSC${Date.now().toString().slice(-4)}`;
    const testName = `TestSubCat_${testCode}`;
    console.log('  [Real Add] Adding test record:', testCode, testName);
    await client.eval(`
      (async () => {
        const rows = document.querySelectorAll("table tbody tr");
        const lastRow = rows[rows.length - 1];
        if (lastRow) {
          const codeInput = lastRow.querySelector("input[placeholder='Code']");
          const nameInput = lastRow.querySelector("input[placeholder='Sub Category']");
          if (codeInput) window.__setVal(codeInput, "${testCode}");
          if (nameInput) window.__setVal(nameInput, "${testName}");
          
          // Select first available valid parent category option if present
          const selects = lastRow.querySelectorAll("select");
          for (const s of selects) {
            const validOpt = Array.from(s.options).find(o => o.value && o.value !== "-1" && Number(o.value) > 0);
            if (validOpt) {
              window.__setVal(s, validOpt.value);
            }
          }
        }
        await new Promise(r => setTimeout(r, 600));
        document.getElementById("btnSaveServiceSubCategoriesTop")?.click();
      })()
    `);
    await new Promise(r => setTimeout(r, 3000));

    // Reload and search
    await client.reload(2500);
    await client.eval(helperScript);
    await client.eval(`
      (() => {
        const inp = document.getElementById("inputSearchSubCategory");
        if (inp) window.__setVal(inp, "${testCode}");
        document.getElementById("btnFilterSearchSubGroup")?.click();
      })()
    `);
    await new Promise(r => setTimeout(r, 2000));
    const foundAdded = await client.eval(`window.__isValInTable("${testCode}")`);
    console.log('  [Real Add Verification] Record found in table:', foundAdded);
    results.screens.serviceSubCategories.checks.realAdd = foundAdded;

    // Real Edit
    const updatedName = `${testName}_EDIT`;
    console.log('  [Real Edit] Updating sub category name to:', updatedName);
    await client.eval(`
      (async () => {
        const rows = document.querySelectorAll("table tbody tr");
        for (const row of rows) {
          const codeInput = row.querySelector("input[placeholder='Code']");
          if (codeInput && codeInput.value === "${testCode}") {
            const nameInput = row.querySelector("input[placeholder='Sub Category']");
            if (nameInput) window.__setVal(nameInput, "${updatedName}");
            break;
          }
        }
        await new Promise(r => setTimeout(r, 600));
        document.getElementById("btnSaveServiceSubCategoriesTop")?.click();
      })()
    `);
    await new Promise(r => setTimeout(r, 3000));

    // Reload and verify edit
    await client.reload(2500);
    await client.eval(helperScript);
    await client.eval(`
      (() => {
        const inp = document.getElementById("inputSearchSubCategory");
        if (inp) window.__setVal(inp, "${testCode}");
        document.getElementById("btnFilterSearchSubGroup")?.click();
      })()
    `);
    await new Promise(r => setTimeout(r, 2000));
    const foundEdited = await client.eval(`window.__isValInTable("${updatedName}")`);
    console.log('  [Real Edit Verification] Updated name found in table:', foundEdited);
    results.screens.serviceSubCategories.checks.realEdit = foundEdited;

    // Real Delete & Zero Residue Cleanup
    console.log('  [Real Delete] Cleaning up test record...');
    await client.eval(`
      (() => {
        const rows = document.querySelectorAll("table tbody tr");
        for (const row of rows) {
          const codeInput = row.querySelector("input[placeholder='Code']");
          if (codeInput && codeInput.value === "${testCode}") {
            const delBtn = row.querySelector("button[title='Delete Sub Category']");
            if (delBtn) delBtn.click();
            break;
          }
        }
      })()
    `);
    await new Promise(r => setTimeout(r, 800));
    await client.eval(`document.getElementById("btnConfirmModalYes")?.click();`);
    await new Promise(r => setTimeout(r, 3000));

    // Reload and verify clean deletion
    await client.reload(2000);
    await client.eval(helperScript);
    await client.eval(`
      (() => {
        const inp = document.getElementById("inputSearchSubCategory");
        if (inp) window.__setVal(inp, "${testCode}");
        document.getElementById("btnFilterSearchSubGroup")?.click();
      })()
    `);
    await new Promise(r => setTimeout(r, 1500));
    const stillPresent = await client.eval(`window.__isValInTable("${testCode}")`);
    console.log('  [Real Delete Verification] Clean zero-residue (not present):', !stillPresent);
    results.screens.serviceSubCategories.checks.realDeleteZeroResidue = !stillPresent;

    results.screens.serviceSubCategories.passed = Object.values(results.screens.serviceSubCategories.checks).every(Boolean);
    console.log('  >> Service Sub Categories Result:', results.screens.serviceSubCategories.passed ? 'PASSED' : 'FAILED');
  } catch (err) {
    console.error('  >> Service Sub Categories Exception:', err.message);
    results.screens.serviceSubCategories.error = err.message;
  }

  client.close();

  // Summary
  console.log('\n==========================================================');
  console.log('BATCH SUMMARY: Billing Masters Module');
  console.log('==========================================================');
  const allPassed = Object.values(results.screens).every(s => s.passed);
  console.log('Overall Status:', allPassed ? 'ALL SCREENS PASSED (100%)' : 'SOME CHECKS FAILED');
  for (const [k, v] of Object.entries(results.screens)) {
    console.log(` - ${k}: ${v.passed ? 'PASS' : 'FAIL'}`, v.checks);
  }

  fs.writeFileSync('billing_masters_batch_test_results.json', JSON.stringify(results, null, 2));
  console.log('Saved results to billing_masters_batch_test_results.json');
}

run().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
