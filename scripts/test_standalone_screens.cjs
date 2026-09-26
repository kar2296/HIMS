// scripts/test_standalone_screens.cjs
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

  const testReport = {
    testedAt: new Date().toISOString(),
    screens: {}
  };

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

  // =========================================================================
  // 1. Category Types Master (/categorytypes)
  // =========================================================================
  console.log('\n--- TESTING SCREEN: Category Types Master (/categorytypes) ---');
  testReport.screens.categoryTypes = { passed: false, checks: {} };
  try {
    // 1. Direct navigation
    await client.navigate('http://localhost:5173/categorytypes', 3000);
    await client.eval(helperScript);
    const catPageTitle = await client.eval(`document.querySelector("h1, h2, h3, h4")?.innerText || document.body.innerText`);
    const initialRows = await client.eval(`document.querySelectorAll("table tbody tr").length`);
    console.log('  [Direct Nav] Initial rows loaded:', initialRows);
    testReport.screens.categoryTypes.checks.directNav = initialRows > 0;

    // 2. Refresh
    await client.reload(2500);
    await client.eval(helperScript);
    const postRefreshRows = await client.eval(`document.querySelectorAll("table tbody tr").length`);
    console.log('  [Page Refresh] Rows after reload:', postRefreshRows);
    testReport.screens.categoryTypes.checks.pageRefresh = postRefreshRows > 0;

    // 3. Search filter
    await client.eval(`
      (() => {
        const input = document.getElementById("inputCatTypeNameSearch") || document.querySelector("input[placeholder*='name' i]");
        window.__setVal(input, "CC");
        const btn = document.getElementById("btnCatTypeSearch") || Array.from(document.querySelectorAll("button")).find(b => b.innerText.includes("Search"));
        btn?.click();
      })()
    `);
    await new Promise(r => setTimeout(r, 1500));
    const searchRows = await client.eval(`document.querySelectorAll("table tbody tr").length`);
    const firstRowText = await client.eval(`document.querySelector("table tbody tr td")?.innerText`);
    console.log('  [Search Filter "CC"] Result rows:', searchRows, 'First row:', firstRowText);
    testReport.screens.categoryTypes.checks.searchFilter = searchRows > 0 && firstRowText?.includes('CC');

    // Reset filter
    await client.eval(`
      (() => {
        const btn = document.getElementById("btnCatTypeReset") || Array.from(document.querySelectorAll("button")).find(b => b.innerText.includes("Reset"));
        btn?.click();
      })()
    `);
    await new Promise(r => setTimeout(r, 1200));

    // 4. Add Modal & Validation
    await client.eval(`
      (() => {
        const btn = document.getElementById("btnAddCategoryType") || Array.from(document.querySelectorAll("button")).find(b => b.innerText.includes("Add"));
        btn?.click();
      })()
    `);
    await new Promise(r => setTimeout(r, 1000));
    const isModalOpen = await client.eval(`Boolean(document.querySelector(".modal-content, [role='dialog'], form"))`);
    console.log('  [Add Modal] Modal opened:', isModalOpen);
    testReport.screens.categoryTypes.checks.addModalOpen = isModalOpen;

    // Test Validation: click Save with empty name
    await client.eval(`
      (() => {
        const nameInput = document.getElementById("inputModalCatTypeName") || document.querySelector("input[placeholder*='name' i]");
        if (nameInput) window.__setVal(nameInput, "");
        const saveBtn = document.getElementById("btnSaveCatTypeModal") || Array.from(document.querySelectorAll("button")).find(b => b.innerText.includes("Save"));
        saveBtn?.click();
      })()
    `);
    await new Promise(r => setTimeout(r, 800));
    const validationShown = await client.eval(`document.body.innerText.includes("required") || document.body.innerText.includes("Enter") || Boolean(document.querySelector(".text-danger, span[style*='color']"))`);
    console.log('  [Validation Check] Required validation active:', validationShown);
    testReport.screens.categoryTypes.checks.validation = validationShown;

    // Close modal
    await client.eval(`
      (() => {
        const cancelBtn = Array.from(document.querySelectorAll("button")).find(b => b.innerText.includes("Cancel"));
        cancelBtn?.click();
      })()
    `);
    await new Promise(r => setTimeout(r, 800));

    testReport.screens.categoryTypes.passed = Object.values(testReport.screens.categoryTypes.checks).every(Boolean);
    console.log('  Category Types overall passed:', testReport.screens.categoryTypes.passed);
  } catch (err) {
    console.error('  Category Types error:', err.message);
    testReport.screens.categoryTypes.error = err.message;
  }

  // =========================================================================
  // 2. Attachment Types Master (/attachmenttypes)
  // =========================================================================
  console.log('\n--- TESTING SCREEN: Attachment Types Master (/attachmenttypes) ---');
  testReport.screens.attachmentTypes = { passed: false, checks: {} };
  try {
    // 1. Direct navigation
    await client.navigate('http://localhost:5173/attachmenttypes', 3000);
    await client.eval(helperScript);
    const initialRows = await client.eval(`document.querySelectorAll("table tbody tr").length`);
    console.log('  [Direct Nav] Initial rows loaded:', initialRows);
    testReport.screens.attachmentTypes.checks.directNav = initialRows > 0;

    // 2. Refresh
    await client.reload(2500);
    await client.eval(helperScript);
    const postRefreshRows = await client.eval(`document.querySelectorAll("table tbody tr").length`);
    console.log('  [Page Refresh] Rows after reload:', postRefreshRows);
    testReport.screens.attachmentTypes.checks.pageRefresh = postRefreshRows > 0;

    // 3. Search filter
    await client.eval(`
      (() => {
        const input = document.querySelector("input[placeholder*='search by name' i]") || document.querySelector("input[type='text']");
        window.__setVal(input, "INSURANCE");
        const btn = Array.from(document.querySelectorAll("button")).find(b => b.innerText.includes("Search"));
        btn?.click();
      })()
    `);
    await new Promise(r => setTimeout(r, 1500));
    const searchRows = await client.eval(`document.querySelectorAll("table tbody tr").length`);
    const firstRowText = await client.eval(`document.querySelector("table tbody tr td")?.innerText`);
    console.log('  [Search Filter "INSURANCE"] Result rows:', searchRows, 'First row:', firstRowText);
    testReport.screens.attachmentTypes.checks.searchFilter = searchRows > 0 && firstRowText?.includes('INSURANCE');

    // Reset filter
    await client.eval(`
      (() => {
        const btn = Array.from(document.querySelectorAll("button")).find(b => b.innerText.includes("Reset"));
        btn?.click();
      })()
    `);
    await new Promise(r => setTimeout(r, 1200));

    // 4. Add Modal & Validation
    await client.eval(`
      (() => {
        const btn = Array.from(document.querySelectorAll("button")).find(b => b.innerText.includes("Add New"));
        btn?.click();
      })()
    `);
    await new Promise(r => setTimeout(r, 1000));
    const isModalOpen = await client.eval(`Boolean(document.querySelector(".modal-content, [role='dialog'], form"))`);
    console.log('  [Add Modal] Modal opened:', isModalOpen);
    testReport.screens.attachmentTypes.checks.addModalOpen = isModalOpen;

    // Test Validation: click Save with empty name
    await client.eval(`
      (() => {
        const saveBtn = Array.from(document.querySelectorAll("button")).find(b => b.innerText.trim() === "Save");
        saveBtn?.click();
      })()
    `);
    await new Promise(r => setTimeout(r, 800));
    const validationShown = await client.eval(`document.body.innerText.includes("required") || Boolean(document.querySelector("span[style*='color']"))`);
    console.log('  [Validation Check] Required validation active:', validationShown);
    testReport.screens.attachmentTypes.checks.validation = validationShown;

    // Close modal
    await client.eval(`
      (() => {
        const cancelBtn = Array.from(document.querySelectorAll("button")).find(b => b.innerText.trim() === "Cancel");
        cancelBtn?.click();
      })()
    `);
    await new Promise(r => setTimeout(r, 800));

    testReport.screens.attachmentTypes.passed = Object.values(testReport.screens.attachmentTypes.checks).every(Boolean);
    console.log('  Attachment Types overall passed:', testReport.screens.attachmentTypes.passed);
  } catch (err) {
    console.error('  Attachment Types error:', err.message);
    testReport.screens.attachmentTypes.error = err.message;
  }

  // =========================================================================
  // 3. Drug Master (/drugs)
  // =========================================================================
  console.log('\n--- TESTING SCREEN: Drug Master (/drugs) ---');
  testReport.screens.drugMaster = { passed: false, checks: {} };
  try {
    // 1. Direct navigation
    await client.navigate('http://localhost:5173/drugs', 3000);
    await client.eval(helperScript);
    const initialRows = await client.eval(`document.querySelectorAll("table tbody tr").length`);
    console.log('  [Direct Nav] Initial rows loaded:', initialRows);
    testReport.screens.drugMaster.checks.directNav = initialRows > 0;

    // 2. Refresh
    await client.reload(2500);
    await client.eval(helperScript);
    const postRefreshRows = await client.eval(`document.querySelectorAll("table tbody tr").length`);
    console.log('  [Page Refresh] Rows after reload:', postRefreshRows);
    testReport.screens.drugMaster.checks.pageRefresh = postRefreshRows > 0;

    // 3. Search filter
    await client.eval(`
      (() => {
        const input = document.querySelector("input[placeholder*='search by drug name' i]") || document.querySelector("input[type='text']");
        window.__setVal(input, "DEXTROSE");
        const btn = Array.from(document.querySelectorAll("button")).find(b => b.innerText.includes("Search"));
        btn?.click();
      })()
    `);
    await new Promise(r => setTimeout(r, 1500));
    const searchRows = await client.eval(`document.querySelectorAll("table tbody tr").length`);
    const firstRowText = await client.eval(`document.querySelector("table tbody tr:first-child")?.innerText`);
    console.log('  [Search Filter "DEXTROSE"] Result rows:', searchRows, 'First row has DEXTROSE:', firstRowText?.includes('DEXTROSE'));
    testReport.screens.drugMaster.checks.searchFilter = searchRows > 0 && firstRowText?.includes('DEXTROSE');

    // Reset filter
    await client.eval(`
      (() => {
        const btn = Array.from(document.querySelectorAll("button")).find(b => b.innerText.includes("Reset"));
        btn?.click();
      })()
    `);
    await new Promise(r => setTimeout(r, 1200));

    // 4. Add Modal & Validation
    await client.eval(`
      (() => {
        const btn = Array.from(document.querySelectorAll("button")).find(b => b.innerText.includes("Add New Drug"));
        btn?.click();
      })()
    `);
    await new Promise(r => setTimeout(r, 1000));
    const isModalOpen = await client.eval(`Boolean(document.querySelector(".modal-content, [role='dialog'], form"))`);
    console.log('  [Add Modal] Modal opened:', isModalOpen);
    testReport.screens.drugMaster.checks.addModalOpen = isModalOpen;

    // Test Validation: click Save with empty drug name
    await client.eval(`
      (() => {
        const saveBtn = Array.from(document.querySelectorAll("button")).find(b => b.innerText.trim() === "Save");
        saveBtn?.click();
      })()
    `);
    await new Promise(r => setTimeout(r, 800));
    const validationShown = await client.eval(`document.body.innerText.includes("required") || Boolean(document.querySelector("span[style*='color']"))`);
    console.log('  [Validation Check] Required validation active:', validationShown);
    testReport.screens.drugMaster.checks.validation = validationShown;

    // Close modal
    await client.eval(`
      (() => {
        const cancelBtn = Array.from(document.querySelectorAll("button")).find(b => b.innerText.trim() === "Cancel");
        cancelBtn?.click();
      })()
    `);
    await new Promise(r => setTimeout(r, 800));

    testReport.screens.drugMaster.passed = Object.values(testReport.screens.drugMaster.checks).every(Boolean);
    console.log('  Drug Master overall passed:', testReport.screens.drugMaster.passed);
  } catch (err) {
    console.error('  Drug Master error:', err.message);
    testReport.screens.drugMaster.error = err.message;
  }

  client.close();
  fs.writeFileSync('standalone_workflow_test_results.json', JSON.stringify(testReport, null, 2));
  console.log('\n=== ALL WORKFLOW TESTS COMPLETED ===');
  console.log(JSON.stringify(testReport, null, 2));
}

run().catch(console.error);
