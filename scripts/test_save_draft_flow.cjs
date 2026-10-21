// scripts/test_save_draft_flow.cjs
const WebSocket = globalThis.WebSocket;

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

      // Reload page to pick up fresh JS bundle
      console.log('Reloading page...');
      await send('Page.reload', { ignoreCache: true });
      await new Promise(r => setTimeout(r, 2500));

      // Navigate to billing screen
      console.log('Navigating to billing screen...');
      await send('Runtime.evaluate', {
        expression: `(async () => {
          window.location.hash = '#/app/opbilling-list/0/OP';
          await new Promise(r => setTimeout(r, 2000));
        })()`,
        awaitPromise: true
      });

      // Wait for billing screen to mount
      console.log('Waiting for OpBillingListScreen...');
      for (let i = 0; i < 25; i++) {
        const check = await send('Runtime.evaluate', {
          expression: `Boolean(document.querySelector(".hims-theme-billing") && window.angular && window.angular.element(document.querySelector(".hims-theme-billing")).scope())`,
          returnByValue: true
        });
        if (check.result?.value) break;
        await new Promise(r => setTimeout(r, 500));
      }

      console.log('\n--- Testing Save Draft Flow ---');
      const testRes = await send('Runtime.evaluate', {
        expression: `(async () => {
          try {
            const el = document.querySelector('.hims-theme-billing');
            if (!el) return { error: 'no .hims-theme-billing found' };
            const scope = window.angular.element(el).scope();
            if (!scope) return { error: 'no scope found' };

            // Clear bill first
            scope.handleReactAction('clear');
            await new Promise(r => setTimeout(r, 500));

            // Select patient
            scope.handleReactAction('patientSelect', {
              patientId: 1,
              patient: {
                Id: 1,
                MRN: 'MRN000001',
                FirstName: 'Test Patient',
                PatientName: 'Test Patient',
                Age: 35,
                Gender: 'M'
              }
            });
            await new Promise(r => setTimeout(r, 500));

            // Select doctor
            scope.handleReactAction('doctorChange', { id: 1 });
            await new Promise(r => setTimeout(r, 300));

            // Add a service item
            scope.handleReactAction('serviceItemChange', {
              index: 0,
              serviceId: 1,
              serviceName: 'General Consultation',
              selectedItem: {
                Id: 1,
                ServiceId: 1,
                ServiceName: 'General Consultation',
                Rate: 500
              }
            });
            await new Promise(r => setTimeout(r, 500));

            const preSaveStatus = {
              billId: scope.currentcontext ? scope.currentcontext.id : 0,
              patientBillStatusId: scope.item ? scope.item.PatientBillStatusId : 0,
              billNumber: scope.item ? scope.item.BillNumber : null,
              totNetAmount: scope.currentcontext ? scope.currentcontext.TotNetAmount : 0
            };

            // Hook into utl.Dialog.confirmMessage so it auto-confirms if dialog is shown
            const origConfirm = window.utl ? window.utl.Dialog.confirmMessage : null;
            if (window.utl && window.utl.Dialog) {
              window.utl.Dialog.confirmMessage = function(opts) {
                if (opts && typeof opts.onSuccessMethod === 'function') {
                  opts.onSuccessMethod();
                }
              };
            }

            // Find and click the Save Draft button in the UI
            const saveDraftBtn = Array.from(document.querySelectorAll('button')).find(b => 
              b.innerText && b.innerText.includes('Save Draft')
            );
            if (saveDraftBtn) {
              console.log('Clicking Save Draft button in UI...');
              saveDraftBtn.click();
            } else {
              console.log('Triggering saveDraft action via bridge...');
              scope.handleReactAction('saveDraft');
            }

            // Wait for save operation and callback to complete
            await new Promise(r => setTimeout(r, 3000));

            // Restore confirm method
            if (origConfirm && window.utl) {
              window.utl.Dialog.confirmMessage = origConfirm;
            }

            const postSaveStatus = {
              billId: scope.currentcontext ? scope.currentcontext.id : 0,
              patientBillStatusId: scope.item ? scope.item.PatientBillStatusId : 0,
              patientBillStatus: scope.item ? scope.item.PatientBillStatus : null,
              billNumber: scope.item ? scope.item.BillNumber : null,
              receiptNo: scope.item ? scope.item.ReceiptNo : null,
              paidAmount: scope.item ? scope.item.PaidAmount : 0,
              outStandingAmount: scope.item ? scope.item.OutStandingAmount : 0,
              paymentDetailsCount: scope.PatientPaymentDetails ? scope.PatientPaymentDetails.length : 0,
              canShowSaveBtn: scope.canShowSaveBtn,
              canShowSaveapproveBtn: scope.canShowSaveapproveBtn,
              hidePrintBtn: scope.HidePrintBtn
            };

            return {
              preSave: preSaveStatus,
              postSave: postSaveStatus,
              isDraft: postSaveStatus.patientBillStatusId === 1,
              noBillNumberGenerated: !postSaveStatus.billNumber,
              noMoneyCollected: (postSaveStatus.paidAmount === 0 || postSaveStatus.paidAmount === '0.00' || !postSaveStatus.paidAmount) && postSaveStatus.paymentDetailsCount === 0
            };
          } catch (e) {
            return { error: e.message, stack: e.stack };
          }
        })()`,
        awaitPromise: true,
        returnByValue: true
      });

      console.log('Result:', JSON.stringify(testRes.result?.value, null, 2));

      const val = testRes.result?.value;
      if (val && val.isDraft && val.noBillNumberGenerated && val.noMoneyCollected) {
        console.log('\n>>> SUCCESS: Save button correctly saved data in DRAFT (PatientBillStatusId = 1) without finalizing bill or generating receipts! <<<');
      } else {
        console.error('\n>>> FAILED: Save draft did not produce expected draft status. <<<');
        process.exit(1);
      }

      ws.close();
      process.exit(0);
    } catch (err) {
      console.error('Test error:', err);
      ws.close();
      process.exit(1);
    }
  });

  ws.addEventListener('error', (err) => {
    console.error('WS error:', err);
    process.exit(1);
  });
}

run();
