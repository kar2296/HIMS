// scripts/test_discount_validation.cjs
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

      // Check login state and navigate to billing screen
      console.log('Navigating / logging into billing screen...');
      await send('Runtime.evaluate', {
        expression: `(async () => {
          if (window.location.hash.includes('login') || document.querySelector('input[name="username"]')) {
            const userIn = document.querySelector('input[name="username"], input[type="text"]');
            const passIn = document.querySelector('input[name="password"], input[type="password"]');
            const submitBtn = document.querySelector('button[type="submit"], button.btn-primary');
            if (userIn && passIn && submitBtn) {
              userIn.value = 'admin';
              userIn.dispatchEvent(new Event('input', { bubbles: true }));
              passIn.value = 'admin';
              passIn.dispatchEvent(new Event('input', { bubbles: true }));
              submitBtn.click();
              await new Promise(r => setTimeout(r, 2000));
            }
          }
          window.location.hash = '#/app/opbilling-list/0/OP';
          await new Promise(r => setTimeout(r, 2500));
        })()`,
        awaitPromise: true,
        returnByValue: true
      });

      // Wait for billing screen to mount
      console.log('Waiting for OpBillingListScreen to mount...');
      for (let i = 0; i < 25; i++) {
        const check = await send('Runtime.evaluate', {
          expression: `Boolean(document.querySelector(".hims-theme-billing") && window.angular && window.angular.element(document.querySelector(".hims-theme-billing")).scope())`,
          returnByValue: true
        });
        if (check.result?.value) break;
        await new Promise(r => setTimeout(r, 500));
      }

      console.log('\n--- Running Complete Discount Validation Tests ---');
      const testRes = await send('Runtime.evaluate', {
        expression: `(async () => {
          try {
          const el = document.querySelector('.hims-theme-billing');
          if (!el) return { error: 'no .hims-theme-billing found' };
          const scope = window.angular.element(el).scope();
          if (!scope) return { error: 'no scope found on .hims-theme-billing' };

          const results = [];

          // Setup patient and service using handleReactAction
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
          scope.handleReactAction('addServiceRow');
          scope.handleReactAction('serviceItemChange', {
            index: 0,
            serviceId: 501,
            serviceName: 'General Consultation',
            selectedItem: {
              ServiceId: 501,
              ServiceName: 'General Consultation',
              Rate: 1000
            }
          });
          if (scope.refreshReactProps) scope.refreshReactProps();
          if (scope.$apply) scope.$apply();
          await new Promise(r => setTimeout(r, 200));

          // Helper to check DOM error banner and button state
          const getDomState = () => {
            const errorBanner = document.querySelector('.hims-theme-billing')?.innerText || '';
            const saveDraftBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText && b.innerText.includes('Save Draft'));
            const saveApproveBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText && b.innerText.includes('Save & Collect'));
            return {
              errorBannerText: errorBanner,
              saveDraftDisabled: saveDraftBtn ? saveDraftBtn.disabled : null,
              saveDraftTitle: saveDraftBtn ? saveDraftBtn.getAttribute('title') : null,
              saveApproveDisabled: saveApproveBtn ? saveApproveBtn.disabled : null,
              saveApproveTitle: saveApproveBtn ? saveApproveBtn.getAttribute('title') : null,
            };
          };

          // ─── TEST 1: Percentage > 100% (5000%) ──────────────────────────────
          scope.handleReactAction('headerDiscountChange', { value: 5000, discountModeId: 2 });
          if (scope.$apply) scope.$apply();
          await new Promise(r => setTimeout(r, 200));

          const t1_scopeErr = scope.validateDiscount ? scope.validateDiscount() : null;
          const t1_totDisc = scope.item.TotDiscAmount;
          const t1_dom = getDomState();
          const t1_saveAttemptBlocked = scope.completeBill ? (scope.completeBill(() => { return 'executed'; }) === false) : true;

          results.push({
            name: 'TEST 1: Percentage Discount 5000% (> 100%)',
            scopeError: t1_scopeErr,
            totDiscAmount: t1_totDisc,
            saveAttemptBlocked: t1_saveAttemptBlocked,
            saveDraftDisabled: t1_dom.saveDraftDisabled,
            saveApproveDisabled: t1_dom.saveApproveDisabled,
            passed: t1_scopeErr && t1_scopeErr.includes('100%') && t1_totDisc <= 1000 && t1_saveAttemptBlocked && t1_dom.saveDraftDisabled && t1_dom.saveApproveDisabled
          });

          // ─── TEST 2: Correct Percentage to valid 10% ────────────────────────
          scope.handleReactAction('headerDiscountChange', { value: 10, discountModeId: 2 });
          if (scope.$apply) scope.$apply();
          await new Promise(r => setTimeout(r, 200));

          const t2_scopeErr = scope.validateDiscount ? scope.validateDiscount() : null;
          const t2_totDisc = scope.item.TotDiscAmount;
          const t2_dom = getDomState();

          results.push({
            name: 'TEST 2: Correct Percentage Discount to 10%',
            scopeError: t2_scopeErr,
            totDiscAmount: t2_totDisc,
            saveDraftDisabled: t2_dom.saveDraftDisabled,
            saveApproveDisabled: t2_dom.saveApproveDisabled,
            passed: !t2_scopeErr && t2_totDisc === 100 && !t2_dom.saveDraftDisabled && !t2_dom.saveApproveDisabled
          });

          // ─── TEST 3: Rupees (₹) > Bill Amount (₹1,500 on ₹1,000 bill) ──────
          scope.handleReactAction('headerDiscountChange', { value: 1500, discountModeId: 1 });
          if (scope.$apply) scope.$apply();
          await new Promise(r => setTimeout(r, 200));

          const t3_scopeErr = scope.validateDiscount ? scope.validateDiscount() : null;
          const t3_totDisc = scope.item.TotDiscAmount;
          const t3_dom = getDomState();
          const t3_saveAttemptBlocked = scope.completeBill ? (scope.completeBill(() => { return 'executed'; }) === false) : true;

          results.push({
            name: 'TEST 3: Rupees Discount ₹1,500 (> ₹1,000 bill amount)',
            scopeError: t3_scopeErr,
            totDiscAmount: t3_totDisc,
            saveAttemptBlocked: t3_saveAttemptBlocked,
            saveDraftDisabled: t3_dom.saveDraftDisabled,
            saveApproveDisabled: t3_dom.saveApproveDisabled,
            passed: t3_scopeErr && t3_scopeErr.includes('exceeds the bill amount') && t3_totDisc <= 1000 && t3_saveAttemptBlocked && t3_dom.saveDraftDisabled && t3_dom.saveApproveDisabled
          });

          // ─── TEST 4: Correct Rupees Discount to ₹500 (<= ₹1,000) ───────────
          scope.handleReactAction('headerDiscountChange', { value: 500, discountModeId: 1 });
          if (scope.$apply) scope.$apply();
          await new Promise(r => setTimeout(r, 200));

          const t4_scopeErr = scope.validateDiscount ? scope.validateDiscount() : null;
          const t4_totDisc = scope.item.TotDiscAmount;
          const t4_dom = getDomState();

          results.push({
            name: 'TEST 4: Correct Rupees Discount to ₹500',
            scopeError: t4_scopeErr,
            totDiscAmount: t4_totDisc,
            saveDraftDisabled: t4_dom.saveDraftDisabled,
            saveApproveDisabled: t4_dom.saveApproveDisabled,
            passed: !t4_scopeErr && t4_totDisc === 500 && !t4_dom.saveDraftDisabled && !t4_dom.saveApproveDisabled
          });

          // ─── TEST 5: Line Item Discount in % > 100% (150%) ───────────────────
          scope.handleReactAction('headerDiscountChange', { value: 0, discountModeId: 2 });
          scope.handleReactAction('lineDiscountChange', { index: 0, discountAmount: 150, discountModeId: 2 });
          if (scope.$apply) scope.$apply();
          await new Promise(r => setTimeout(r, 200));

          const t5_scopeErr = scope.validateDiscount ? scope.validateDiscount() : null;
          const t5_dom = getDomState();
          const t5_saveAttemptBlocked = scope.completeBill ? (scope.completeBill(() => { return 'executed'; }) === false) : true;

          results.push({
            name: 'TEST 5: Line Item Discount 150% (> 100%)',
            scopeError: t5_scopeErr,
            saveAttemptBlocked: t5_saveAttemptBlocked,
            saveDraftDisabled: t5_dom.saveDraftDisabled,
            saveApproveDisabled: t5_dom.saveApproveDisabled,
            passed: t5_scopeErr && t5_scopeErr.includes('100%') && t5_saveAttemptBlocked && t5_dom.saveDraftDisabled
          });

          // ─── TEST 6: Line Item Discount in ₹ > Row Amount (₹2,000 on ₹1,000) ──
          scope.handleReactAction('lineDiscountChange', { index: 0, discountAmount: 2000, discountModeId: 1 });
          if (scope.$apply) scope.$apply();
          await new Promise(r => setTimeout(r, 200));

          const t6_scopeErr = scope.validateDiscount ? scope.validateDiscount() : null;
          const t6_dom = getDomState();
          const t6_saveAttemptBlocked = scope.completeBill ? (scope.completeBill(() => { return 'executed'; }) === false) : true;

          results.push({
            name: 'TEST 6: Line Item Discount ₹2,000 (> ₹1,000 item amount)',
            scopeError: t6_scopeErr,
            saveAttemptBlocked: t6_saveAttemptBlocked,
            saveDraftDisabled: t6_dom.saveDraftDisabled,
            saveApproveDisabled: t6_dom.saveApproveDisabled,
            passed: t6_scopeErr && t6_scopeErr.includes('exceeds the item amount') && t6_saveAttemptBlocked && t6_dom.saveDraftDisabled
          });

          // ─── TEST 7: Reset Line Discount to 0 ──────────────────────────────
          scope.handleReactAction('lineDiscountChange', { index: 0, discountAmount: 0, discountModeId: 2 });
          if (scope.$apply) scope.$apply();
          await new Promise(r => setTimeout(r, 200));

          const t7_scopeErr = scope.validateDiscount ? scope.validateDiscount() : null;
          const t7_dom = getDomState();

          results.push({
            name: 'TEST 7: Reset Line Discount to 0 (Clear)',
            scopeError: t7_scopeErr,
            saveDraftDisabled: t7_dom.saveDraftDisabled,
            saveApproveDisabled: t7_dom.saveApproveDisabled,
            passed: !t7_scopeErr && !t7_dom.saveDraftDisabled && !t7_dom.saveApproveDisabled
          });

          return results;
          } catch (e) {
            return { error: e.message, stack: e.stack };
          }
        })()`,
        awaitPromise: true,
        returnByValue: true
      });

      console.log('Test Results:\n', JSON.stringify(testRes.result?.value, null, 2));
      const testList = testRes.result?.value || [];
      const allPassed = testList.length > 0 && testList.every(t => t.passed);
      if (allPassed) {
        console.log('\n>>> ALL 7 DISCOUNT VALIDATION TESTS PASSED! <<<');
      } else {
        console.error('\n>>> SOME TESTS FAILED! Inspect above results. <<<');
        process.exit(1);
      }

      await send('Page.captureScreenshot');
      process.exit(0);
    } catch (err) {
      console.error('Test execution error:', err);
      process.exit(1);
    }
  });
}

run();
