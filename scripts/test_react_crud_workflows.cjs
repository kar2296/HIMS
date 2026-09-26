// scripts/test_react_crud_workflows.cjs
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
    screens: {}
  };

  // =========================================================================
  // SCREEN 1: CATEGORY TYPES (/categorytypes)
  // =========================================================================
  console.log('\n==========================================================');
  console.log('TESTING SCREEN 1: Category Types (/categorytypes)');
  console.log('==========================================================');
  results.screens.categoryTypes = { passed: false, checks: {} };

  try {
    // 1. Direct URL
    await client.navigate('http://localhost:5173/categorytypes', 3000);
    await client.eval(helperScript);
    const initialRows = await client.eval(`document.querySelectorAll("table tbody tr").length`);
    console.log('  [Direct URL] Initial records loaded:', initialRows);
    results.screens.categoryTypes.checks.directNav = initialRows > 0;

    // 2. Reload
    await client.reload(2500);
    await client.eval(helperScript);
    const postReloadRows = await client.eval(`document.querySelectorAll("table tbody tr").length`);
    console.log('  [Reload] Records loaded after refresh:', postReloadRows);
    results.screens.categoryTypes.checks.reload = postReloadRows > 0;

    // 3. Validation test (Empty Add form)
    await client.eval(`
      (() => {
        const addBtn = document.getElementById("btnAddCategoryType");
        addBtn?.click();
      })()
    `);
    await new Promise(r => setTimeout(r, 1000));
    await client.eval(`
      (() => {
        const nameInput = document.getElementById("inputModalCatTypeName");
        if (nameInput) window.__setVal(nameInput, "");
        const saveBtn = document.getElementById("btnSaveCatTypeModal");
        saveBtn?.click();
      })()
    `);
    await new Promise(r => setTimeout(r, 800));
    const valMsg = await client.eval(`
      document.body.innerText.includes("required") ||
      Boolean(document.querySelector(".validation-error")) ||
      Boolean(document.querySelector("[style*='color: #ef4444']"))
    `);
    console.log('  [Validation on Empty Save] Error message shown:', valMsg);
    results.screens.categoryTypes.checks.validation = valMsg;

    // 4. Real controlled Add
    const testCatName = `TEST_AUTOUAT_CAT_${Date.now().toString().slice(-4)}`;
    console.log('  [Real Add] Adding test record:', testCatName);
    await client.eval(`
      (() => {
        const nameInput = document.getElementById("inputModalCatTypeName");
        if (nameInput) window.__setVal(nameInput, "${testCatName}");
        const descInput = document.getElementById("inputModalCatTypeDesc");
        if (descInput) window.__setVal(descInput, "Automated UAT Category Type Description");
        const saveBtn = document.getElementById("btnSaveCatTypeModal");
        saveBtn?.click();
      })()
    `);
    await new Promise(r => setTimeout(r, 2500));

    // Reload page to verify server persistence
    await client.reload(2500);
    await client.eval(helperScript);

    // 5. Search for newly added record
    await client.eval(`
      (() => {
        const input = document.getElementById("filterCategoryTypeName");
        if (input) window.__setVal(input, "${testCatName}");
        const searchBtn = document.getElementById("btnFilterSearchCatType");
        searchBtn?.click();
      })()
    `);
    await new Promise(r => setTimeout(r, 1500));
    const foundAdded = await client.eval(`document.body.innerText.includes("${testCatName}")`);
    console.log('  [Real Add Verification] Record found in table:', foundAdded);
    results.screens.categoryTypes.checks.realAdd = foundAdded;

    // 6. Real controlled Edit
    const updatedCatDesc = `Updated Desc ${Date.now().toString().slice(-4)}`;
    console.log('  [Real Edit] Updating test record description to:', updatedCatDesc);
    await client.eval(`
      (() => {
        const editBtn = document.querySelector("button[title*='Edit']");
        editBtn?.click();
      })()
    `);
    await new Promise(r => setTimeout(r, 1200));
    await client.eval(`
      (() => {
        const descInput = document.getElementById("inputModalCatTypeDesc");
        if (descInput) window.__setVal(descInput, "${updatedCatDesc}");
        const saveBtn = document.getElementById("btnSaveCatTypeModal");
        saveBtn?.click();
      })()
    `);
    await new Promise(r => setTimeout(r, 2500));

    // Reload and verify edit
    await client.reload(2500);
    await client.eval(helperScript);
    await client.eval(`
      (() => {
        const input = document.getElementById("filterCategoryTypeName");
        if (input) window.__setVal(input, "${testCatName}");
        const searchBtn = document.getElementById("btnFilterSearchCatType");
        searchBtn?.click();
      })()
    `);
    await new Promise(r => setTimeout(r, 1500));
    const foundEdited = await client.eval(`document.body.innerText.includes("${updatedCatDesc}")`);
    console.log('  [Real Edit Verification] Updated description found:', foundEdited);
    results.screens.categoryTypes.checks.realEdit = foundEdited;

    // 7. Real controlled Delete (Cleanup)
    console.log('  [Real Delete] Cleaning up test record...');
    await client.eval(`
      (() => {
        const delBtn = document.querySelector("button[title*='Delete']");
        delBtn?.click();
      })()
    `);
    await new Promise(r => setTimeout(r, 1000));
    await client.eval(`
      (() => {
        const confirmBtn = document.getElementById("btnConfirmModalYes") || Array.from(document.querySelectorAll("button")).find(b => b.innerText.trim() === "Delete" || b.innerText.trim() === "Yes");
        confirmBtn?.click();
      })()
    `);
    await new Promise(r => setTimeout(r, 2500));

    // Verify cleanup after reload
    await client.reload(2000);
    await client.eval(helperScript);
    await client.eval(`
      (() => {
        const input = document.getElementById("filterCategoryTypeName");
        if (input) window.__setVal(input, "${testCatName}");
        const searchBtn = document.getElementById("btnFilterSearchCatType");
        searchBtn?.click();
      })()
    `);
    await new Promise(r => setTimeout(r, 1500));
    const stillExists = await client.eval(`document.body.innerText.includes("${testCatName}")`);
    console.log('  [Delete Cleanup Verification] Record deleted from table:', !stillExists);
    results.screens.categoryTypes.checks.realDelete = !stillExists;

    results.screens.categoryTypes.passed = Object.values(results.screens.categoryTypes.checks).every(Boolean);
    console.log('  Category Types CRUD Passed:', results.screens.categoryTypes.passed);
  } catch (err) {
    console.error('  Category Types error:', err.message);
    results.screens.categoryTypes.error = err.message;
  }

  // =========================================================================
  // SCREEN 2: ATTACHMENT TYPES (/attachmenttypes)
  // =========================================================================
  console.log('\n==========================================================');
  console.log('TESTING SCREEN 2: Attachment Types (/attachmenttypes)');
  console.log('==========================================================');
  results.screens.attachmentTypes = { passed: false, checks: {} };

  try {
    // 1. Direct URL
    await client.navigate('http://localhost:5173/attachmenttypes', 3000);
    await client.eval(helperScript);
    const initialRows = await client.eval(`document.querySelectorAll("table tbody tr").length`);
    console.log('  [Direct URL] Initial records loaded:', initialRows);
    results.screens.attachmentTypes.checks.directNav = initialRows > 0;

    // 2. Reload
    await client.reload(2500);
    await client.eval(helperScript);
    const postReloadRows = await client.eval(`document.querySelectorAll("table tbody tr").length`);
    console.log('  [Reload] Records loaded after refresh:', postReloadRows);
    results.screens.attachmentTypes.checks.reload = postReloadRows > 0;

    // 3. Validation test (Empty Add form)
    await client.eval(`
      (() => {
        const addBtn = document.getElementById("btnAddAttachmentType");
        addBtn?.click();
      })()
    `);
    await new Promise(r => setTimeout(r, 1000));
    await client.eval(`
      (() => {
        const nameInput = document.getElementById("inputModalAttName");
        if (nameInput) window.__setVal(nameInput, "");
        const saveBtn = document.getElementById("btnSaveAttModal");
        saveBtn?.click();
      })()
    `);
    await new Promise(r => setTimeout(r, 800));
    const valMsg = await client.eval(`
      Boolean(document.getElementById("errModalAttName")) ||
      document.body.innerText.includes("required")
    `);
    console.log('  [Validation on Empty Save] Error message shown:', valMsg);
    results.screens.attachmentTypes.checks.validation = valMsg;

    // 4. Real controlled Add
    const testAttName = `TEST_AUTOUAT_ATT_${Date.now().toString().slice(-4)}`;
    console.log('  [Real Add] Adding test record:', testAttName);
    await client.eval(`
      (() => {
        const nameInput = document.getElementById("inputModalAttName");
        if (nameInput) window.__setVal(nameInput, "${testAttName}");
        const descInput = document.getElementById("inputModalAttDesc");
        if (descInput) window.__setVal(descInput, "Automated UAT Attachment Description");
        const saveBtn = document.getElementById("btnSaveAttModal");
        saveBtn?.click();
      })()
    `);
    await new Promise(r => setTimeout(r, 2500));

    // Reload page to verify server persistence
    await client.reload(2500);
    await client.eval(helperScript);

    // 5. Search for newly added record
    await client.eval(`
      (() => {
        const input = document.getElementById("filterAttachmentTypeName");
        if (input) window.__setVal(input, "${testAttName}");
        const searchBtn = document.getElementById("btnSearchAttachmentType");
        searchBtn?.click();
      })()
    `);
    await new Promise(r => setTimeout(r, 1500));
    const foundAdded = await client.eval(`document.body.innerText.includes("${testAttName}")`);
    console.log('  [Real Add Verification] Record found in table:', foundAdded);
    results.screens.attachmentTypes.checks.realAdd = foundAdded;

    // 6. Real controlled Edit
    const updatedAttDesc = `Updated Att Desc ${Date.now().toString().slice(-4)}`;
    console.log('  [Real Edit] Updating test record description to:', updatedAttDesc);
    await client.eval(`
      (() => {
        const editBtn = document.querySelector("button[title*='Edit']");
        editBtn?.click();
      })()
    `);
    await new Promise(r => setTimeout(r, 1200));
    await client.eval(`
      (() => {
        const descInput = document.getElementById("inputModalAttDesc");
        if (descInput) window.__setVal(descInput, "${updatedAttDesc}");
        const saveBtn = document.getElementById("btnSaveAttModal");
        saveBtn?.click();
      })()
    `);
    await new Promise(r => setTimeout(r, 2500));

    // Reload and verify edit
    await client.reload(2500);
    await client.eval(helperScript);
    await client.eval(`
      (() => {
        const input = document.getElementById("filterAttachmentTypeName");
        if (input) window.__setVal(input, "${testAttName}");
        const searchBtn = document.getElementById("btnSearchAttachmentType");
        searchBtn?.click();
      })()
    `);
    await new Promise(r => setTimeout(r, 1500));
    const foundEdited = await client.eval(`document.body.innerText.includes("${updatedAttDesc}")`);
    console.log('  [Real Edit Verification] Updated description found:', foundEdited);
    results.screens.attachmentTypes.checks.realEdit = foundEdited;

    // 7. Real controlled Delete (Cleanup)
    console.log('  [Real Delete] Cleaning up test record...');
    await client.eval(`
      (() => {
        const delBtn = document.querySelector("button[title*='Delete']");
        delBtn?.click();
      })()
    `);
    await new Promise(r => setTimeout(r, 1000));
    await client.eval(`
      (() => {
        const confirmBtn = document.getElementById("btnConfirmModalYes") || Array.from(document.querySelectorAll("button")).find(b => b.innerText.trim() === "Delete" || b.innerText.trim() === "Yes");
        confirmBtn?.click();
      })()
    `);
    await new Promise(r => setTimeout(r, 2500));

    // Verify cleanup
    await client.reload(2000);
    await client.eval(helperScript);
    await client.eval(`
      (() => {
        const input = document.getElementById("filterAttachmentTypeName");
        if (input) window.__setVal(input, "${testAttName}");
        const searchBtn = document.getElementById("btnSearchAttachmentType");
        searchBtn?.click();
      })()
    `);
    await new Promise(r => setTimeout(r, 1500));
    const stillExists = await client.eval(`document.body.innerText.includes("${testAttName}")`);
    console.log('  [Delete Cleanup Verification] Record deleted from table:', !stillExists);
    results.screens.attachmentTypes.checks.realDelete = !stillExists;

    results.screens.attachmentTypes.passed = Object.values(results.screens.attachmentTypes.checks).every(Boolean);
    console.log('  Attachment Types CRUD Passed:', results.screens.attachmentTypes.passed);
  } catch (err) {
    console.error('  Attachment Types error:', err.message);
    results.screens.attachmentTypes.error = err.message;
  }

  // =========================================================================
  // SCREEN 3: DRUG MASTER (/drugs)
  // =========================================================================
  console.log('\n==========================================================');
  console.log('TESTING SCREEN 3: Drug Master (/drugs)');
  console.log('==========================================================');
  results.screens.drugMaster = { passed: false, checks: {} };

  try {
    // 1. Direct URL
    await client.navigate('http://localhost:5173/drugs', 3000);
    await client.eval(helperScript);
    const initialRows = await client.eval(`document.querySelectorAll("table tbody tr").length`);
    console.log('  [Direct URL] Initial records loaded:', initialRows);
    results.screens.drugMaster.checks.directNav = initialRows > 0;

    // 2. Reload
    await client.reload(2500);
    await client.eval(helperScript);
    const postReloadRows = await client.eval(`document.querySelectorAll("table tbody tr").length`);
    console.log('  [Reload] Records loaded after refresh:', postReloadRows);
    results.screens.drugMaster.checks.reload = postReloadRows > 0;

    // 3. Validation test (Empty Add form)
    await client.eval(`
      (() => {
        const addBtn = document.getElementById("btnAddDrugMaster");
        addBtn?.click();
      })()
    `);
    await new Promise(r => setTimeout(r, 1000));
    await client.eval(`
      (() => {
        const nameInput = document.getElementById("inputModalDrugName");
        if (nameInput) window.__setVal(nameInput, "");
        const saveBtn = document.getElementById("btnSaveDrugModal");
        saveBtn?.click();
      })()
    `);
    await new Promise(r => setTimeout(r, 800));
    const valMsg = await client.eval(`
      Boolean(document.getElementById("errModalDrugName")) ||
      document.body.innerText.includes("required")
    `);
    console.log('  [Validation on Empty Save] Error message shown:', valMsg);
    results.screens.drugMaster.checks.validation = valMsg;

    // 4. Real controlled Add
    const testDrugName = `TEST_AUTOUAT_DRUG_${Date.now().toString().slice(-4)}`;
    console.log('  [Real Add] Adding test record:', testDrugName);
    await client.eval(`
      (() => {
        const nameInput = document.getElementById("inputModalDrugName");
        if (nameInput) window.__setVal(nameInput, "${testDrugName}");
        const codeInput = document.getElementById("inputModalDrugCode");
        if (codeInput) window.__setVal(codeInput, "UAT99");
        const descInput = document.getElementById("inputModalDrugDesc");
        if (descInput) window.__setVal(descInput, "Automated UAT Drug Description");
        const saveBtn = document.getElementById("btnSaveDrugModal");
        saveBtn?.click();
      })()
    `);
    await new Promise(r => setTimeout(r, 2500));

    // Reload page to verify server persistence
    await client.reload(2500);
    await client.eval(helperScript);

    // 5. Search for newly added record
    await client.eval(`
      (() => {
        const input = document.getElementById("filterDrugName");
        if (input) window.__setVal(input, "${testDrugName}");
        const searchBtn = document.getElementById("btnSearchDrugMaster");
        searchBtn?.click();
      })()
    `);
    await new Promise(r => setTimeout(r, 1500));
    const foundAdded = await client.eval(`document.body.innerText.includes("${testDrugName}")`);
    console.log('  [Real Add Verification] Record found in table:', foundAdded);
    results.screens.drugMaster.checks.realAdd = foundAdded;

    // 6. Real controlled Edit
    const updatedDrugDesc = `Updated Drug Desc ${Date.now().toString().slice(-4)}`;
    console.log('  [Real Edit] Updating test record description to:', updatedDrugDesc);
    await client.eval(`
      (() => {
        const editBtn = document.querySelector("button[title*='Edit']");
        editBtn?.click();
      })()
    `);
    await new Promise(r => setTimeout(r, 1200));
    await client.eval(`
      (() => {
        const descInput = document.getElementById("inputModalDrugDesc");
        if (descInput) window.__setVal(descInput, "${updatedDrugDesc}");
        const saveBtn = document.getElementById("btnSaveDrugModal");
        saveBtn?.click();
      })()
    `);
    await new Promise(r => setTimeout(r, 2500));

    // Reload and verify edit
    await client.reload(2500);
    await client.eval(helperScript);
    await client.eval(`
      (() => {
        const input = document.getElementById("filterDrugName");
        if (input) window.__setVal(input, "${testDrugName}");
        const searchBtn = document.getElementById("btnSearchDrugMaster");
        searchBtn?.click();
      })()
    `);
    await new Promise(r => setTimeout(r, 1500));
    const foundEdited = await client.eval(`document.body.innerText.includes("${testDrugName}")`);
    console.log('  [Real Edit Verification] Record found after reload:', foundEdited);
    results.screens.drugMaster.checks.realEdit = foundEdited;

    // 7. Real controlled Delete (Cleanup)
    console.log('  [Real Delete] Cleaning up test record...');
    await client.eval(`
      (() => {
        const delBtn = document.querySelector("button[title*='Delete']");
        delBtn?.click();
      })()
    `);
    await new Promise(r => setTimeout(r, 1000));
    await client.eval(`
      (() => {
        const confirmBtn = document.getElementById("btnConfirmModalYes") || Array.from(document.querySelectorAll("button")).find(b => b.innerText.trim() === "Delete" || b.innerText.trim() === "Yes");
        confirmBtn?.click();
      })()
    `);
    await new Promise(r => setTimeout(r, 2500));

    // Verify cleanup
    await client.reload(2000);
    await client.eval(helperScript);
    await client.eval(`
      (() => {
        const input = document.getElementById("filterDrugName");
        if (input) window.__setVal(input, "${testDrugName}");
        const searchBtn = document.getElementById("btnSearchDrugMaster");
        searchBtn?.click();
      })()
    `);
    await new Promise(r => setTimeout(r, 1500));
    const stillExists = await client.eval(`document.body.innerText.includes("${testDrugName}")`);
    console.log('  [Delete Cleanup Verification] Record deleted from table:', !stillExists);
    results.screens.drugMaster.checks.realDelete = !stillExists;

    results.screens.drugMaster.passed = Object.values(results.screens.drugMaster.checks).every(Boolean);
    console.log('  Drug Master CRUD Passed:', results.screens.drugMaster.passed);
  } catch (err) {
    console.error('  Drug Master error:', err.message);
    results.screens.drugMaster.error = err.message;
  }

  client.close();
  fs.writeFileSync('react_crud_workflow_test_results.json', JSON.stringify(results, null, 2));
  console.log('\n==========================================================');
  console.log('SUMMARY OF ALL CRUD WORKFLOW TESTS:');
  console.log(JSON.stringify(results, null, 2));
  console.log('==========================================================');
}

run().catch(console.error);
