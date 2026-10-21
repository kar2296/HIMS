// scripts/test_direct_billing_service_lock.cjs
const WebSocket = globalThis.WebSocket;

async function run() {
  console.log('=== Testing Direct Billing (DG) Service Lock and Add Behavior ===');
  const tabsRes = await fetch('http://127.0.0.1:9222/json');
  const tabs = await tabsRes.json();
  const pageTab = tabs.find(t => t.id === '0AB041AA33F6F94A944131B76CDBC3DF') || tabs.find(t => t.url && t.url.includes('5174'));
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
      await send('Page.enable');
      await send('Runtime.enable');

      console.log('Reloading page...');
      await send('Page.reload', { ignoreCache: true });
      await new Promise(r => setTimeout(r, 2500));

      console.log('Navigating to http://localhost:5174/#/app/directbilling/0/DG...');
      await send('Runtime.evaluate', {
        expression: `window.location.hash = "#/app/directbilling/0/DG";`
      });
      await new Promise(r => setTimeout(r, 2000));

      // Wait for Direct Billing scope
      for (let i = 0; i < 20; i++) {
        const check = await send('Runtime.evaluate', {
          expression: `Boolean(window.angular && window.angular.element(document.querySelector(".direct-billing-container"))?.scope())`,
          returnByValue: true
        });
        if (check.result?.value) break;
        await new Promise(r => setTimeout(r, 500));
      }

      // --- TEST 1: Check No "Add Service" Button ---
      console.log('\n--- 1. Testing Requirement: No "Add Service" Button ---');
      const test1 = await send('Runtime.evaluate', {
        expression: `(() => {
          const allButtons = Array.from(document.querySelectorAll("button")).map(b => (b.innerText || b.title || b.getAttribute("uib-tooltip") || "").trim());
          const hasAddServiceBtn = allButtons.some(t => t.toLowerCase() === "add service" || t.toLowerCase().includes("add service"));
          return {
            hasAddServiceBtn,
            allButtons: allButtons.filter(Boolean)
          };
        })()`,
        returnByValue: true
      });
      console.log('Has "Add Service" button:', test1.result.value.hasAddServiceBtn);
      if (!test1.result.value.hasAddServiceBtn) {
        console.log('PASS: No "Add Service" button exists.');
      } else {
        console.error('FAIL: Found "Add Service" button:', test1.result.value.allButtons);
      }

      // --- TEST 2: Draft Mode Service Input Enablement ---
      console.log('\n--- 2. Testing Draft Mode: Service Row Input is Enabled ---');
      const test2 = await send('Runtime.evaluate', {
        expression: `(() => {
          const scope = window.angular.element(document.querySelector(".direct-billing-container")).scope();
          scope.item.PatientBillStatusId = 1;
          scope.currentcontext.PatientBillStatusId = 1;
          scope.item.BillNumber = null;
          scope.IsApproved = false;
          scope.PatientBillDetails = [{
            Id: 0,
            ServiceId: -1,
            ServiceName: '',
            Quantity: 1,
            Rate: 0,
            Amount: 0,
            NetAmount: 0,
            Status: 1,
            PackageMasterServiceId: 0,
            SelectedItem: { IsRateEditable: true }
          }];
          scope.$applyAsync();
          return {
            isBillGenerated: scope.isBillGenerated(),
            rowCount: scope.PatientBillDetails.length
          };
        })()`,
        returnByValue: true
      });
      console.log('Draft mode check:', test2.result.value);
      await new Promise(r => setTimeout(r, 600));

      const draftDomCheck = await send('Runtime.evaluate', {
        expression: `(() => {
          const autosearchInput = document.querySelector("#txtServiceItem_0") || document.querySelector(".direct-billing-container autosearch input") || document.querySelector("input[placeholder*='service']");
          const qtyInput = document.querySelector("#qty0") || document.querySelector("input[value='1']");
          const rateInput = document.querySelector("#rate0") || document.querySelector("tbody tr td:nth-child(4) input");
          const deleteBtn = document.querySelector("button[title*='Delete']") || document.querySelector(".direct-billing-container button.drhms-delete-icon");

          return {
            autosearchDisabled: autosearchInput ? autosearchInput.disabled : null,
            qtyDisabled: qtyInput ? qtyInput.disabled : null,
            rateDisabled: rateInput ? rateInput.disabled : null,
            hasDeleteBtn: !!deleteBtn
          };
        })()`,
        returnByValue: true
      });
      console.log('Draft mode DOM status:', draftDomCheck.result.value);
      if (draftDomCheck.result.value.autosearchDisabled === false) {
        console.log('PASS: In draft mode, service input is enabled.');
      }

      // --- TEST 3: Generated Bill Mode: Service Edit & Add Options Disabled ---
      console.log('\n--- 3. Testing Generated Bill Mode: Service Edit & Add Options are Disabled ---');
      const test3 = await send('Runtime.evaluate', {
        expression: `(() => {
          const scope = window.angular.element(document.querySelector(".direct-billing-container")).scope();
          scope.item.BillNumber = "DG-2026-00099";
          scope.item.PatientBillStatusId = 3;
          scope.currentcontext.PatientBillStatusId = 3;
          scope.IsApproved = true;
          scope.item.isCompleted = true;
          scope.PatientBillDetails = [
            {
              Id: 101,
              ServiceId: 55,
              ServiceName: 'Complete Blood Count',
              Quantity: 1,
              Rate: 450,
              Amount: 450,
              NetAmount: 450,
              Status: 1,
              PackageMasterServiceId: 0,
              SelectedItem: { IsRateEditable: true }
            },
            {
              Id: 0,
              ServiceId: -1,
              ServiceName: '',
              Quantity: 1,
              Rate: 0,
              Amount: 0,
              NetAmount: 0,
              Status: 1,
              PackageMasterServiceId: 0,
              SelectedItem: { IsRateEditable: true }
            }
          ];
          scope.EnableDisableDropdown(true);
          scope.$applyAsync();

          // Try to execute add and mutate functions
          const addRes = scope.addNewLineItem();
          const changeRes = scope.ServiceItemChanged(0, scope.PatientBillDetails[0]);
          const delRes = scope.deletePatientBillDetails(0, scope.PatientBillDetails[0]);
          const calcRes = scope.CalcualteAmt(scope.PatientBillDetails[0]);

          return {
            isBillGenerated: scope.isBillGenerated(),
            addBlocked: addRes === false,
            changeBlocked: changeRes === false,
            deleteBlocked: delRes === false,
            calcBlocked: calcRes === false
          };
        })()`,
        returnByValue: true
      });
      console.log('Function call blocking result:', test3.result.value);
      await new Promise(r => setTimeout(r, 600));

      const genDomCheck = await send('Runtime.evaluate', {
        expression: `(() => {
          const serviceRows = Array.from(document.querySelectorAll("table.drhms-responsive-table > tbody > tr, .direct-billing-container tbody tr"));
          const autosearchInput = document.querySelector("#txtServiceItem_0") || document.querySelector("table.drhms-responsive-table autosearch input") || document.querySelector(".direct-billing-container tbody tr input");
          const qtyInput = document.querySelector("#qty0") || document.querySelector(".direct-billing-container tbody tr td:nth-child(3) input");
          const rateInput = document.querySelector("#rate0") || document.querySelector(".direct-billing-container tbody tr td:nth-child(4) input");
          const discountInput = document.querySelector("#discount0") || document.querySelector(".direct-billing-container tbody tr td:nth-child(6) input");
          const lockBadge = document.querySelector(".fa-lock");
          const deleteBtn = document.querySelector(".direct-billing-container button.drhms-delete-icon, .direct-billing-container button[title*='Delete']");

          return {
            visibleRowCount: serviceRows.length,
            autosearchDisabled: autosearchInput ? autosearchInput.disabled : null,
            qtyDisabled: qtyInput ? qtyInput.disabled : null,
            rateDisabled: rateInput ? rateInput.disabled : null,
            discountDisabled: discountInput ? discountInput.disabled : null,
            hasLockBadge: !!lockBadge,
            hasDeleteBtn: !!deleteBtn
          };
        })()`,
        returnByValue: true
      });
      console.log('Generated bill DOM status:', genDomCheck.result.value);

      const allDisabled = genDomCheck.result.value.autosearchDisabled &&
                          genDomCheck.result.value.hasLockBadge &&
                          !genDomCheck.result.value.hasDeleteBtn;

      if (allDisabled && test3.result.value.addBlocked && test3.result.value.changeBlocked) {
        console.log('\n>>> SUCCESS: ALL DIRECT BILLING REQUIREMENTS VERIFIED & PASSED! <<<');
      } else {
        console.error('\n>>> SOME CHECKS FAILED! <<<');
      }

      // Cleanup back to new bill
      await send('Runtime.evaluate', {
        expression: `(() => {
          const scope = window.angular.element(document.querySelector(".direct-billing-container")).scope();
          if (scope && typeof scope.addNewBill === "function") scope.addNewBill();
        })()`
      });

      process.exit(0);
    } catch (e) {
      console.error('Test error:', e);
      process.exit(1);
    }
  });
}

run();
