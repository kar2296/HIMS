// scripts/test_button_enablement_states.cjs
const http = require('http');
const fs = require('fs');
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
      console.log('Connected to CDP.');
      await send('Page.enable');
      await send('Runtime.enable');

      // Navigate to opbilling-list if on login or elsewhere
      const navRes = await send('Runtime.evaluate', {
        expression: `(async () => {
          if (window.location.hash.includes('login')) {
            // Log in if needed
            const userIn = document.querySelector('input[name="username"], input[type="text"]');
            const passIn = document.querySelector('input[name="password"], input[type="password"]');
            const submitBtn = document.querySelector('button[type="submit"], button.btn-primary');
            if (userIn && passIn && submitBtn) {
              userIn.value = 'admin';
              userIn.dispatchEvent(new Event('input', { bubbles: true }));
              passIn.value = 'admin';
              passIn.dispatchEvent(new Event('input', { bubbles: true }));
              submitBtn.click();
              await new Promise(r => setTimeout(r, 1500));
            }
          }
          window.location.hash = '#/app/opbilling-list/0/OP';
          await new Promise(r => setTimeout(r, 2000));
          return window.location.hash;
        })()`,
        awaitPromise: true,
        returnByValue: true
      });
      console.log('Current Hash:', navRes.result?.value);

      // Wait for billing component to mount
      for (let i = 0; i < 20; i++) {
        const check = await send('Runtime.evaluate', {
          expression: `!!document.querySelector(".hims-theme-billing")`,
          returnByValue: true
        });
        if (check.result?.value) break;
        await new Promise(r => setTimeout(r, 500));
      }

      // Helper to query button states
      const inspectButtons = async (stage) => {
        const res = await send('Runtime.evaluate', {
          expression: `(() => {
            const buttons = Array.from(document.querySelectorAll("button"));
            const getBtn = (text) => {
              const b = buttons.find(btn => btn.innerText && btn.innerText.includes(text));
              return b ? {
                found: true,
                disabled: b.disabled || b.hasAttribute('disabled') || b.style.cursor === 'not-allowed',
                text: b.innerText.trim(),
                title: b.title || ''
              } : { found: false, disabled: true, text: '', title: '' };
            };

            return {
              saveDraft: getBtn("Save Draft"),
              saveApprove: getBtn("Save & Collect"),
              print: getBtn("Print (Alt+P)"),
              thermalPrint: getBtn("Thermal Print"),
              estimate: getBtn("Estimate"),
              advance: getBtn("Advance"),
              dueCancel: getBtn("Due Cancel")
            };
          })()`,
          returnByValue: true
        });
        return res.result?.value;
      };

      // ─── STAGE 1: EMPTY SCREEN ───
      console.log('\n--- Checking STAGE 1: EMPTY SCREEN ---');
      const stage1 = await inspectButtons('empty');
      console.log('Stage 1 Button States:', JSON.stringify(stage1, null, 2));
      const s1Ok = stage1.saveDraft.disabled &&
                   stage1.saveApprove.disabled &&
                   stage1.print.disabled &&
                   stage1.thermalPrint.disabled &&
                   stage1.estimate.disabled &&
                   stage1.advance.disabled;
      console.log('Stage 1 Result: ' + (s1Ok ? 'PASS (All action buttons disabled on empty screen)' : 'FAIL'));

      // ─── STAGE 2: PATIENT SELECTED & SERVICE ENTERED ───
      console.log('\n--- Simulating STAGE 2: Patient Selected & Service Entered ---');
      await send('Runtime.evaluate', {
        expression: `(() => {
          const scope = window.angular.element(document.querySelector(".hims-theme-billing")).scope();
          if (scope && scope.handleReactAction) {
            // Select patient
            scope.handleReactAction('patientSelect', {
              patientId: 101,
              patient: {
                Id: 101,
                MRN: 'MRN-101',
                FirstName: 'John',
                LastName: 'Doe',
                Age: '30 Y',
                Gender: { Description: 'Male' }
              }
            });
            // Add service row
            scope.handleReactAction('addServiceRow');
            scope.handleReactAction('serviceItemChange', {
              index: 0,
              serviceId: 501,
              serviceName: 'General Consultation',
              selectedItem: {
                ServiceId: 501,
                ServiceName: 'General Consultation',
                Rate: 350
              }
            });
            if (scope.refreshReactProps) scope.refreshReactProps();
            if (scope.$apply) scope.$apply();
          }
        })()`,
        returnByValue: true
      });
      await new Promise(r => setTimeout(r, 800));

      const stage2 = await inspectButtons('service_entered');
      console.log('Stage 2 Button States:', JSON.stringify(stage2, null, 2));
      const s2Ok = (!stage2.saveDraft.disabled) &&
                   (!stage2.saveApprove.disabled) &&
                   stage2.print.disabled &&
                   stage2.thermalPrint.disabled;
      console.log('Stage 2 Result: ' + (s2Ok ? 'PASS (Save & Approve enabled, Print & Thermal disabled)' : 'FAIL'));

      // ─── STAGE 3: APPROVE BILL ───
      console.log('\n--- Simulating STAGE 3: Bill Approved ---');
      await send('Runtime.evaluate', {
        expression: `(() => {
          const scope = window.angular.element(document.querySelector(".hims-theme-billing")).scope();
          if (scope) {
            scope.item.PatientBillStatusId = 2; // Completed
            scope.HidePrintBtn = false;
            scope.canShowSaveBtn = false;
            scope.canShowSaveapproveBtn = false;
            if (scope.refreshReactProps) scope.refreshReactProps();
            if (scope.$apply) scope.$apply();
          }
        })()`,
        returnByValue: true
      });
      await new Promise(r => setTimeout(r, 800));

      const stage3 = await inspectButtons('approved');
      console.log('Stage 3 Button States:', JSON.stringify(stage3, null, 2));
      const s3Ok = stage3.saveDraft.disabled &&
                   stage3.saveApprove.disabled &&
                   (!stage3.print.disabled) &&
                   (!stage3.thermalPrint.disabled);
      console.log('Stage 3 Result: ' + (s3Ok ? 'PASS (Print & Thermal enabled, Save & Approve disabled)' : 'FAIL'));

      // ─── STAGE 4: CLEAR / RESET ───
      console.log('\n--- Simulating STAGE 4: Clear / Reset ---');
      await send('Runtime.evaluate', {
        expression: `(() => {
          const scope = window.angular.element(document.querySelector(".hims-theme-billing")).scope();
          if (scope) {
            scope.item = { PatientBillStatusId: 1 };
            scope.currentfilter = { PatientId: -1 };
            scope.selectedPatient = {};
            scope.PatientBillDetails = [];
            scope.HidePrintBtn = true;
            scope.canShowSaveBtn = true;
            scope.canShowSaveapproveBtn = true;
            if (scope.refreshReactProps) scope.refreshReactProps();
            if (scope.$apply) scope.$apply();
          }
        })()`,
        returnByValue: true
      });
      await new Promise(r => setTimeout(r, 800));

      const stage4 = await inspectButtons('reset');
      console.log('Stage 4 Button States:', JSON.stringify(stage4, null, 2));
      const s4Ok = stage4.saveDraft.disabled &&
                   stage4.saveApprove.disabled &&
                   stage4.print.disabled &&
                   stage4.thermalPrint.disabled;
      console.log('Stage 4 Result: ' + (s4Ok ? 'PASS (Buttons properly reset to disabled on empty screen)' : 'FAIL'));

      const allPassed = s1Ok && s2Ok && s3Ok && s4Ok;
      console.log('\n=======================================');
      console.log('OVERALL LIFECYCLE TEST RESULT: ' + (allPassed ? 'ALL TESTS PASSED' : 'SOME TESTS FAILED'));
      console.log('=======================================');

      ws.close();
      process.exit(allPassed ? 0 : 1);
    } catch (err) {
      console.error('Error during test execution:', err);
      ws.close();
      process.exit(1);
    }
  });
}

run();
