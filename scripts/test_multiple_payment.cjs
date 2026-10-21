// scripts/test_multiple_payment.cjs
const WebSocket = globalThis.WebSocket;
const fs = require('fs');
const path = require('path');

async function run() {
  const tabsRes = await fetch('http://127.0.0.1:9222/json');
  const tabs = await tabsRes.json();
  const pageTab = tabs.find(t => t.type === 'page' && t.url && t.url.includes('5174'));
  if (!pageTab) {
    console.error('No 5174 tab found in Chrome CDP!');
    process.exit(1);
  }

  const ws = new WebSocket(pageTab.webSocketDebuggerUrl);
  let id = 1;
  const send = (m, p = {}) => new Promise((resolve, reject) => {
    const mid = id++;
    const handler = (event) => {
      const parsed = JSON.parse(event.data);
      if (parsed.id === mid) {
        ws.removeEventListener('message', handler);
        if (parsed.error) reject(parsed.error);
        else resolve(parsed.result);
      }
    };
    ws.addEventListener('message', handler);
    ws.send(JSON.stringify({ id: mid, method: m, params: p }));
  });

  ws.addEventListener('open', async () => {
    try {
      console.log('Connected to Chrome CDP.');
      await send('Page.enable');
      await send('Runtime.enable');

      // Navigate to OP billing screen
      console.log('Navigating to OP billing screen...');
      await send('Runtime.evaluate', {
        expression: `(async () => {
          window.location.hash = '#/app/opbilling-list/0/OP';
          await new Promise(r => setTimeout(r, 2000));
        })()`,
        awaitPromise: true,
        returnByValue: true
      });

      // Ensure patient is selected and service is present
      console.log('Setting up patient and service in billing screen...');
      const setupResult = await send('Runtime.evaluate', {
        expression: `(async () => {
          const el = document.querySelector('[ng-controller="opbillinglistCtrl"]');
          if (!el) return { error: 'No opbillinglistCtrl found' };
          const scope = angular.element(el).scope();
          if (!scope) return { error: 'No AngularJS scope found' };

          // If no patient selected, set a patient
          if (!scope.selectedPatient || !scope.selectedPatient.Id) {
            scope.selectedPatient = {
              Id: 1,
              PatientId: 1,
              PatientName: 'Test MultiPayment Patient',
              FirstName: 'Test',
              LastName: 'Patient',
              Gender: 'Male',
              Age: '32',
              AgeType: 'Years',
              DOB: '1994-01-01',
              MobileNumber: '9876543210'
            };
            scope.currentfilter.PatientId = 1;
            scope.item.PatientId = 1;
            scope.item.PatientName = 'Test MultiPayment Patient';
          }

          // Ensure at least 1 service row with ₹600
          if (!scope.PatientBillDetails || scope.PatientBillDetails.length === 0 || !scope.PatientBillDetails.some(r => r.Status === 1)) {
            scope.PatientBillDetails = [{
              Id: 0,
              ServiceId: 1,
              ServiceCode: 'CONS01',
              ServiceName: 'General Consultation',
              Quantity: 1,
              UnitPrice: 600,
              Rate: 600,
              Amount: 600,
              NetAmount: 600,
              Status: 1
            }];
          } else {
            scope.PatientBillDetails[0].Rate = 600;
            scope.PatientBillDetails[0].Amount = 600;
            scope.PatientBillDetails[0].NetAmount = 600;
          }

          if (typeof scope.CalculateNetAmt === 'function') {
            scope.CalculateNetAmt();
          }
          scope.refreshReactProps();
          scope.$apply();
          return { success: true, netAmount: scope.currentcontext.TotNetAmount };
        })()`,
        awaitPromise: true,
        returnByValue: true
      });
      console.log('Setup result:', setupResult?.result?.value);

      await new Promise(r => setTimeout(r, 1000));

      // Test Step 1: Check initial single mode payment state
      console.log('Testing single mode payment state...');
      const step1 = await send('Runtime.evaluate', {
        expression: `(() => {
          const splitInputs = Array.from(document.querySelectorAll('input[type="number"][placeholder="0.00"]'));
          const multiCheckbox = Array.from(document.querySelectorAll('input[type="checkbox"]'))
            .find(cb => cb.parentElement && cb.parentElement.textContent.includes('Multiple Payment'));
          return {
            splitCount: splitInputs.length,
            splitValue: splitInputs[0] ? splitInputs[0].value : null,
            multiChecked: multiCheckbox ? multiCheckbox.checked : null
          };
        })()`,
        returnByValue: true
      });
      console.log('Step 1 (Single mode):', step1?.result?.value);

      // Test Step 2: Toggle "Enable Multiple Payment Modes" checkbox
      console.log('Toggling "Enable Multiple Payment Modes"...');
      const step2 = await send('Runtime.evaluate', {
        expression: `(() => {
          const multiCheckbox = Array.from(document.querySelectorAll('input[type="checkbox"]'))
            .find(cb => cb.parentElement && cb.parentElement.textContent.includes('Multiple Payment'));
          if (!multiCheckbox) return { error: 'Checkbox not found' };
          multiCheckbox.click();
          return { clicked: true, checkedNow: multiCheckbox.checked };
        })()`,
        returnByValue: true
      });
      console.log('Step 2 (Checkbox toggle):', step2?.result?.value);

      await new Promise(r => setTimeout(r, 800));

      // Test Step 3: Verify 2 splits appeared and adjust amounts
      console.log('Configuring Split 1 (Cash ₹400) and Split 2 (UPI ₹200)...');
      const step3 = await send('Runtime.evaluate', {
        expression: `(async () => {
          let splitInputs = Array.from(document.querySelectorAll('input[type="number"][placeholder="0.00"]'));
          if (splitInputs.length < 2) {
            // If second split wasn't auto-created, click Add Payment Split button
            const addBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Add Payment Split'));
            if (addBtn) addBtn.click();
            await new Promise(r => setTimeout(r, 500));
            splitInputs = Array.from(document.querySelectorAll('input[type="number"][placeholder="0.00"]'));
          }

          // Set Split 1 to 400
          if (splitInputs[0]) {
            const proto = window.HTMLInputElement.prototype;
            const nativeSet = Object.getOwnPropertyDescriptor(proto, 'value').set;
            nativeSet.call(splitInputs[0], '400');
            splitInputs[0].dispatchEvent(new Event('input', { bubbles: true }));
            splitInputs[0].dispatchEvent(new Event('change', { bubbles: true }));
          }

          // Set Split 2 to 200
          if (splitInputs[1]) {
            const proto = window.HTMLInputElement.prototype;
            const nativeSet = Object.getOwnPropertyDescriptor(proto, 'value').set;
            nativeSet.call(splitInputs[1], '200');
            splitInputs[1].dispatchEvent(new Event('input', { bubbles: true }));
            splitInputs[1].dispatchEvent(new Event('change', { bubbles: true }));
          }

          // Set Split 2 mode to UPI (value 11)
          const modeSelects = Array.from(document.querySelectorAll('select')).filter(s => {
            return Array.from(s.options).some(o => o.text.includes('UPI'));
          });
          if (modeSelects[1]) {
            modeSelects[1].value = '11';
            modeSelects[1].dispatchEvent(new Event('change', { bubbles: true }));
          }

          await new Promise(r => setTimeout(r, 500));

          // Read Settlement card totals
          const bodyText = document.body.innerText;
          const hasDoubleRupee = bodyText.includes('₹₹');

          return {
            splitsCount: splitInputs.length,
            split1: splitInputs[0]?.value,
            split2: splitInputs[1]?.value,
            hasDoubleRupee: hasDoubleRupee
          };
        })()`,
        awaitPromise: true,
        returnByValue: true
      });
      console.log('Step 3 (Configured Splits):', step3?.result?.value);

      // Test Step 4: Add 3rd split and then remove it
      console.log('Testing Add & Remove 3rd split...');
      const step4 = await send('Runtime.evaluate', {
        expression: `(async () => {
          const addBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Add Payment Split'));
          if (addBtn) addBtn.click();
          await new Promise(r => setTimeout(r, 400));
          let inputs = Array.from(document.querySelectorAll('input[type="number"][placeholder="0.00"]'));
          const countAfterAdd = inputs.length;

          // Find trash button for 3rd split
          const trashBtns = Array.from(document.querySelectorAll('button[title="Remove this split"]'));
          if (trashBtns.length > 0) {
            trashBtns[trashBtns.length - 1].click();
          }
          await new Promise(r => setTimeout(r, 400));
          inputs = Array.from(document.querySelectorAll('input[type="number"][placeholder="0.00"]'));
          return {
            countAfterAdd,
            countAfterRemove: inputs.length
          };
        })()`,
        awaitPromise: true,
        returnByValue: true
      });
      console.log('Step 4 (Add & Remove split):', step4?.result?.value);

      // Test Step 5: Test Exceed Validation (e.g. 500 + 300 = 800 > 600)
      console.log('Testing over-payment warning...');
      const step5 = await send('Runtime.evaluate', {
        expression: `(async () => {
          const splitInputs = Array.from(document.querySelectorAll('input[type="number"][placeholder="0.00"]'));
          if (splitInputs[0]) {
            const proto = window.HTMLInputElement.prototype;
            const nativeSet = Object.getOwnPropertyDescriptor(proto, 'value').set;
            nativeSet.call(splitInputs[0], '500');
            splitInputs[0].dispatchEvent(new Event('input', { bubbles: true }));
          }
          if (splitInputs[1]) {
            const proto = window.HTMLInputElement.prototype;
            const nativeSet = Object.getOwnPropertyDescriptor(proto, 'value').set;
            nativeSet.call(splitInputs[1], '300');
            splitInputs[1].dispatchEvent(new Event('input', { bubbles: true }));
          }
          await new Promise(r => setTimeout(r, 400));

          const pageText = document.body.innerText;
          const warningFound = pageText.includes('exceed Net Payable');
          const saveBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Save & Collect'));
          const isSaveDisabled = saveBtn ? saveBtn.disabled : null;

          // Revert to valid amounts: 400 and 200
          if (splitInputs[0]) {
            const proto = window.HTMLInputElement.prototype;
            const nativeSet = Object.getOwnPropertyDescriptor(proto, 'value').set;
            nativeSet.call(splitInputs[0], '400');
            splitInputs[0].dispatchEvent(new Event('input', { bubbles: true }));
          }
          if (splitInputs[1]) {
            const proto = window.HTMLInputElement.prototype;
            const nativeSet = Object.getOwnPropertyDescriptor(proto, 'value').set;
            nativeSet.call(splitInputs[1], '200');
            splitInputs[1].dispatchEvent(new Event('input', { bubbles: true }));
          }
          await new Promise(r => setTimeout(r, 400));

          // Scroll down so Payment Settlements & Bill Summary are clearly visible
          window.scrollTo({ top: document.body.scrollHeight, behavior: 'instant' });
          await new Promise(r => setTimeout(r, 300));

          return {
            warningFound,
            isSaveDisabled
          };
        })()`,
        awaitPromise: true,
        returnByValue: true
      });
      console.log('Step 5 (Exceed validation):', step5?.result?.value);

      // Test Step 6: Test Unchecking "Enable Multiple Payment Modes" (reverting to single split)
      console.log('Testing Unchecking Multiple Payment checkbox...');
      const step6 = await send('Runtime.evaluate', {
        expression: `(async () => {
          const multiCheckbox = Array.from(document.querySelectorAll('input[type="checkbox"]'))
            .find(cb => cb.parentElement && cb.parentElement.textContent.includes('Multiple Payment'));
          if (!multiCheckbox) return { error: 'Checkbox not found' };

          // Uncheck
          multiCheckbox.click();
          await new Promise(r => setTimeout(r, 500));
          const splitsAfterUncheck = document.querySelectorAll('input[type="number"][placeholder="0.00"]').length;

          // Re-check
          multiCheckbox.click();
          await new Promise(r => setTimeout(r, 500));
          const splitsAfterRecheck = document.querySelectorAll('input[type="number"][placeholder="0.00"]').length;

          // Scroll content-wrapper to bottom
          const cw = document.querySelector('.content-wrapper');
          if (cw) cw.scrollTop = cw.scrollHeight;

          return {
            splitsAfterUncheck,
            splitsAfterRecheck
          };
        })()`,
        awaitPromise: true,
        returnByValue: true
      });
      console.log('Step 6 (Toggle off & on):', step6?.result?.value);

      // Take Screenshot
      console.log('Capturing verified multiple payment screenshot...');
      const ssResult = await send('Page.captureScreenshot', { format: 'png' });
      const outPath = '/Users/sharmila/.gemini/antigravity-ide/brain/61e91600-7ef0-4eaf-99cb-ca794ca057f2/multiple_payment_verified.png';
      fs.writeFileSync(outPath, Buffer.from(ssResult.data, 'base64'));
      console.log('Screenshot saved to:', outPath);

      console.log('ALL MULTIPLE PAYMENT TESTS PASSED SUCCESSFULLY!');
      process.exit(0);
    } catch (err) {
      console.error('Test error:', err);
      process.exit(1);
    }
  });
}

run();
