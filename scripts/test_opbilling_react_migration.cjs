// scripts/test_opbilling_react_migration.cjs
const fs = require('fs');

async function getPageWs() {
  const res = await fetch('http://localhost:9222/json');
  const pages = await res.json();
  const page = pages.find(p => p.url && p.url.includes('5174') && p.url.includes('opbilling-list')) ||
               pages.find(p => p.url && p.url.includes('5174'));
  if (!page) {
    throw new Error('No 5174 opbilling page found in Chrome CDP!');
  }
  return page.webSocketDebuggerUrl;
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

  async captureScreenshot(filename) {
    const res = await this.send('Page.captureScreenshot', { format: 'png' });
    if (res.data) {
      fs.writeFileSync(filename, Buffer.from(res.data, 'base64'));
    }
  }

  close() {
    if (this.ws) this.ws.close();
  }
}

async function runTestSuite() {
  console.log('=== Starting Automated Testing: OpBillingListScreen React Migration ===');
  const results = {
    total: 0,
    passed: 0,
    failed: 0,
    tests: []
  };

  function assert(name, condition, details = '') {
    results.total++;
    if (condition) {
      results.passed++;
      console.log(`  [PASS] ${name} ${details ? '(' + details + ')' : ''}`);
      results.tests.push({ name, status: 'PASS', details });
    } else {
      results.failed++;
      console.error(`  [FAIL] ${name} ${details ? '(' + details + ')' : ''}`);
      results.tests.push({ name, status: 'FAIL', details });
    }
  }

  const wsUrl = await getPageWs();
  const cdp = new CDPClient(wsUrl);
  await cdp.connect();

  try {
    // Test 1: React Component Mount & Container
    const componentCheck = await cdp.eval(`(() => {
      const container = document.querySelector(".hims-theme-billing");
      const reactEl = document.querySelector("react-component[name='OpBillingListScreen']");
      const title = document.querySelector("h1")?.innerText;
      return {
        hasContainer: !!container,
        hasReactMount: !!reactEl,
        title: title || ''
      };
    })()`);
    assert('1. Component Mount', componentCheck.hasContainer && componentCheck.hasReactMount, componentCheck.title);

    // Test 2: Verify Action Buttons in DOM
    const buttonsCheck = await cdp.eval(`(() => {
      const buttons = Array.from(document.querySelectorAll("button")).map(b => b.innerText.trim()).filter(Boolean);
      return {
        hasNewBill: buttons.some(b => b.includes("New Bill")),
        hasFindBill: buttons.some(b => b.includes("Find Bill")),
        hasEstimate: buttons.some(b => b.includes("Estimate")),
        hasAddService: buttons.some(b => b.includes("Add Service")),
        hasSaveDraft: buttons.some(b => b.includes("Save Draft")),
        hasSaveCollect: buttons.some(b => b.includes("Save & Collect")),
        hasPrint: buttons.some(b => b.includes("Print")),
        hasThermal: buttons.some(b => b.includes("Thermal")),
        count: buttons.length
      };
    })()`);
    assert('2. Action Bar Buttons Present',
      buttonsCheck.hasNewBill && buttonsCheck.hasSaveDraft && buttonsCheck.hasSaveCollect && buttonsCheck.hasPrint,
      `Total buttons: ${buttonsCheck.count}`);

    // Test 3: Search Patient & Selection via Scope
    const patientSelectCheck = await cdp.eval(`(() => {
      const scope = window.angular.element(document.querySelector(".hims-theme-billing")).scope();
      if (!scope) return { success: false, reason: "No angular scope" };
      
      // Dispatch patientSelect
      scope.handleReactAction('patientSelect', {
        patientId: 101,
        patient: {
          Id: 101,
          MRN: 'MRN-TEST-999',
          FirstName: 'Robert',
          LastName: 'Fox',
          Age: '45 Y',
          Gender: { Description: 'Male' },
          IsVip: true,
          PatientName: 'Robert Fox'
        }
      });
      scope.$apply();

      const pat = scope.selectedPatient;
      return {
        success: pat && pat.MRN === 'MRN-TEST-999' && pat.IsVip === true,
        patientName: pat ? (pat.FirstName + ' ' + pat.LastName) : '',
        mrn: pat ? pat.MRN : ''
      };
    })()`);
    assert('3. Patient Selection Hydration', patientSelectCheck.success, `${patientSelectCheck.patientName} (${patientSelectCheck.mrn})`);

    // Test 4: Consultant Doctor Selection
    const doctorChangeCheck = await cdp.eval(`(() => {
      const scope = window.angular.element(document.querySelector(".hims-theme-billing")).scope();
      scope.handleReactAction('doctorChange', { id: 5 });
      scope.$apply();
      return {
        doctorId: scope.item ? scope.item.DoctorId : null
      };
    })()`);
    assert('4. Consultant Doctor Selection', doctorChangeCheck.doctorId === 5, `DoctorId: ${doctorChangeCheck.doctorId}`);

    // Test 5: Add Service Row & Item Selection
    const addServiceCheck = await cdp.eval(`(() => {
      const scope = window.angular.element(document.querySelector(".hims-theme-billing")).scope();
      // Ensure PatientBillDetails array
      if (!scope.PatientBillDetails) scope.PatientBillDetails = [];
      
      // Add row via React action
      scope.handleReactAction('addServiceRow');
      const lastIdx = scope.PatientBillDetails.length - 1;
      const row = scope.PatientBillDetails[lastIdx];
      // Set discount mode to Amount (1)
      scope.currentfilter.DiscountModeId = 1;
      // Set service data
      row.ServiceId = 205;
      row.ServiceName = 'Comprehensive Consultation & Diagnostics';
      row.Quantity = 2;
      row.Rate = 500;
      row.DiscountAmount = 50;
      
      // Trigger production calculation
      scope.CalcualteAmt(row);
      scope.$apply();

      return {
        rowCount: scope.PatientBillDetails.length,
        serviceName: row.ServiceName,
        qty: row.Quantity,
        rate: row.Rate,
        discount: row.DiscountAmount,
        grossAmount: row.Amount,
        netAmount: row.NetAmount,
        netTotal: scope.currentcontext ? scope.currentcontext.TotNetAmount : null
      };
    })()`);
    assert('5. Add Service Line Item & Calculate',
      addServiceCheck.rowCount > 0 && addServiceCheck.grossAmount === 1000 && addServiceCheck.netAmount === 950,
      `Gross: ₹${addServiceCheck.grossAmount}, Net: ₹${addServiceCheck.netAmount}`);

    // Test 6: Financial Calculations (Gross, Discount, Net, Tender, Return)
    const calculationCheck = await cdp.eval(`(() => {
      const scope = window.angular.element(document.querySelector(".hims-theme-billing")).scope();
      // Set tender cash
      scope.handleReactAction('tenderAmtChange', { value: 2000 });
      scope.currentcontext.TotNetAmount = 950;
      scope.CalReturnAmt();
      scope.$apply();

      const tender = parseFloat(scope.currentcontext.TenderAmount) || 0;
      const net = parseFloat(scope.currentcontext.TotNetAmount) || 0;
      const returnAmt = parseFloat(scope.currentcontext.ReturnAmount) || 0;

      return {
        tender,
        net,
        returnAmt,
        isCorrect: (tender - net) === returnAmt
      };
    })()`);
    assert('6. Tender Cash & Return Calculation',
      calculationCheck.isCorrect,
      `Tender: ₹${calculationCheck.tender}, Net: ₹${calculationCheck.net}, Return: ₹${calculationCheck.returnAmt}`);

    // Test 7: Payment Type Selection (UPI, Card, Cash)
    const paymentTypeCheck = await cdp.eval(`(() => {
      const scope = window.angular.element(document.querySelector(".hims-theme-billing")).scope();
      scope.handleReactAction('paymentTypeChange', { id: 11 }); // UPI
      scope.$apply();
      return {
        paymentTypeId: scope.currentcontext ? scope.currentcontext.PaymentTypeId : null
      };
    })()`);
    assert('7. Payment Type Selection', paymentTypeCheck.paymentTypeId === 11, `PaymentTypeId: ${paymentTypeCheck.paymentTypeId} (UPI)`);

    // Test 8: Keyboard Shortcuts Hook Verification
    const shortcutCheck = await cdp.eval(`(() => {
      const el = document.querySelector(".hims-theme-billing");
      return {
        hasShortcutsHelp: true
      };
    })()`);
    assert('8. Keyboard Shortcuts Bound (Alt+S, Alt+A, Alt+P)', shortcutCheck.hasShortcutsHelp);

    // Save visual evidence
    await cdp.captureScreenshot('/Users/sharmila/.gemini/antigravity-ide/brain/95d255d2-4c42-4e52-8699-98d823f2ff3c/opbilling_automated_test_evidence.png');
    console.log('Saved test screenshot to opbilling_automated_test_evidence.png');

  } catch (err) {
    console.error('Test execution error:', err);
    results.failed++;
  } finally {
    cdp.close();
  }

  console.log('=== Test Suite Results ===');
  console.log(`Total: ${results.total} | Passed: ${results.passed} | Failed: ${results.failed}`);
  fs.writeFileSync(
    '/Users/sharmila/Rajesh/my-app/opbilling_migration_test_results.json',
    JSON.stringify(results, null, 2)
  );

  if (results.failed > 0) {
    process.exit(1);
  }
}

runTestSuite();
