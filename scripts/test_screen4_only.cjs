// scripts/test_screen4_only.cjs
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

  console.log('\n==========================================================');
  console.log('RERUNNING ONLY AFFECTED TEST: Screen 4 (Service Sub Categories)');
  console.log('==========================================================');
  const screenResults = { passed: false, checks: {} };

  try {
    await client.navigate('http://localhost:5173/servicesubcategories', 3000);
    await client.eval(helperScript);
    const initialRows = await client.eval(`document.querySelectorAll("table tbody tr").length`);
    console.log('  [Direct Nav] Initial records/rows loaded:', initialRows);
    screenResults.checks.directNav = initialRows > 0;

    await client.reload(2500);
    await client.eval(helperScript);
    const postReloadRows = await client.eval(`document.querySelectorAll("table tbody tr").length`);
    console.log('  [Reload] Rows loaded after refresh:', postReloadRows);
    screenResults.checks.reload = postReloadRows > 0;

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
    screenResults.checks.validation = valErr;

    // Reload for a clean state before real add
    await client.reload(2500);
    await client.eval(helperScript);

    // Real Add
    const testCode = `SSC${Date.now().toString().slice(-4)}`;
    const testName = `TestSubCat_${testCode}`;
    console.log('  [Real Add] Adding test record:', testCode, testName);
    const addResult = await client.eval(`
      (async () => {
        const rows = document.querySelectorAll("table tbody tr");
        const lastRow = rows[rows.length - 1];
        if (lastRow) {
          const codeInput = lastRow.querySelector("input[placeholder='Code']");
          const nameInput = lastRow.querySelector("input[placeholder='Sub Category']");
          if (codeInput) window.__setVal(codeInput, "${testCode}");
          if (nameInput) window.__setVal(nameInput, "${testName}");
          
          // Select first available valid parent category option
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
    screenResults.checks.realAdd = foundAdded;

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
    screenResults.checks.realEdit = foundEdited;

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
    screenResults.checks.realDeleteZeroResidue = !stillPresent;

    screenResults.passed = Object.values(screenResults.checks).every(Boolean);
    console.log('  >> Service Sub Categories Result:', screenResults.passed ? 'PASSED' : 'FAILED');
  } catch (err) {
    console.error('  >> Service Sub Categories Exception:', err.message);
    screenResults.error = err.message;
  }

  client.close();

  // Update billing_masters_batch_test_results.json
  const currentBatchResults = JSON.parse(fs.readFileSync('billing_masters_batch_test_results.json', 'utf8'));
  currentBatchResults.screens.serviceSubCategories = screenResults;
  currentBatchResults.testedAt = new Date().toISOString();
  fs.writeFileSync('billing_masters_batch_test_results.json', JSON.stringify(currentBatchResults, null, 2));
  console.log('Updated billing_masters_batch_test_results.json with Screen 4 result.');
}

run().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
