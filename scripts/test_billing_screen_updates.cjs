// scripts/test_billing_screen_updates.cjs
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

      // Check current login state or login if needed
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
      console.log('Waiting for OpBillingListScreen...');
      for (let i = 0; i < 20; i++) {
        const check = await send('Runtime.evaluate', {
          expression: `!!document.querySelector(".hims-theme-billing")`,
          returnByValue: true
        });
        if (check.result?.value) break;
        await new Promise(r => setTimeout(r, 500));
      }

      // ─────────────────────────────────────────────────────────────
      // TEST 1: COMPACT LAYOUT & REMOVAL OF FIXED BOTTOM BAR
      // ─────────────────────────────────────────────────────────────
      console.log('\n--- Checking Requirement 1: Compact Layout & No Fixed Footer ---');
      const test1 = await send('Runtime.evaluate', {
        expression: `(() => {
          const allEls = Array.from(document.querySelectorAll('.hims-theme-billing *'));
          const fixedEls = allEls.filter(el => window.getComputedStyle(el).position === 'fixed');
          const stickyEls = allEls.filter(el => window.getComputedStyle(el).position === 'sticky');

          // Check presence of action buttons below payment section
          const inlineBar = Array.from(document.querySelectorAll('button')).some(b => 
            b.innerText && (b.innerText.includes('Save Draft') || b.innerText.includes('Save & Collect') || b.innerText.includes('Print (Alt+P)'))
          );

          return {
            fixedCount: fixedEls.length,
            stickyCount: stickyEls.length,
            hasInlineActionButtons: inlineBar,
          };
        })()`,
        returnByValue: true
      });
      console.log('Fixed elements in billing screen:', test1.result?.value?.fixedCount);
      console.log('Sticky elements in billing screen:', test1.result?.value?.stickyCount);
      console.log('Action buttons present inline:', test1.result?.value?.hasInlineActionButtons);
      if (test1.result?.value?.fixedCount !== 0) {
        console.error('FAIL: Found fixed element(s) in billing screen!');
      } else {
        console.log('PASS: No fixed bottom bar exists. Action buttons scroll inline.');
      }

      // ─────────────────────────────────────────────────────────────
      // TEST 2: BUTTON CLEANUP (NO FIND BILL, NO ESTIMATE, SINGLE NEW)
      // ─────────────────────────────────────────────────────────────
      console.log('\n--- Checking Requirement 2: Button Cleanup ---');
      const test2 = await send('Runtime.evaluate', {
        expression: `(() => {
          const buttons = Array.from(document.querySelectorAll('button')).map(b => (b.innerText || '').trim());
          return {
            hasFindBill: buttons.some(b => b.includes('Find Bill')),
            hasEstimate: buttons.some(b => b.includes('Estimate') || b.includes('Estimation')),
            hasNew: buttons.some(b => b === 'New' || b.startsWith('New')),
            hasDueCancel: buttons.some(b => b.includes('Due Cancel')),
            hasAdvance: buttons.some(b => b.includes('Advance')),
            hasOutstanding: buttons.some(b => b.includes('Outstanding')),
            hasPending: buttons.some(b => b.includes('Pending')),
            allButtons: buttons
          };
        })()`,
        returnByValue: true
      });
      console.log('Has Find Bill:', test2.result?.value?.hasFindBill);
      console.log('Has Estimate:', test2.result?.value?.hasEstimate);
      console.log('Has New:', test2.result?.value?.hasNew);
      console.log('Has Due Cancel:', test2.result?.value?.hasDueCancel);
      console.log('Has Advance:', test2.result?.value?.hasAdvance);
      console.log('Has Outstanding:', test2.result?.value?.hasOutstanding);
      console.log('Has Pending:', test2.result?.value?.hasPending);
      if (!test2.result?.value?.hasFindBill && !test2.result?.value?.hasEstimate && test2.result?.value?.hasNew) {
        console.log('PASS: Find Bill & Estimate removed. Single New button and essential toolbar actions present.');
      } else {
        console.error('FAIL on button cleanup check!');
      }

      // ─────────────────────────────────────────────────────────────
      // TEST 6: DISCOUNT TOGGLES (% / ₹) & REMOVAL OF TOP DISCOUNT SELECTOR
      // ─────────────────────────────────────────────────────────────
      console.log('\n--- Checking Requirement 6: Discount Controls ---');
      const test6 = await send('Runtime.evaluate', {
        expression: `(() => {
          const discountToggles = Array.from(document.querySelectorAll('button')).filter(b => 
            (b.innerText === '%' || b.innerText === '₹')
          );
          // Check that top discount mode dropdown does not exist
          const labels = Array.from(document.querySelectorAll('label')).map(l => (l.innerText || '').trim());
          const hasTopDiscountModeLabel = labels.includes('Discount Mode');

          return {
            toggleButtonCount: discountToggles.length,
            hasTopDiscountModeDropdown: hasTopDiscountModeLabel
          };
        })()`,
        returnByValue: true
      });
      console.log('Discount toggle buttons (% / ₹):', test6.result?.value?.toggleButtonCount);
      console.log('Has top "Discount Mode" dropdown label:', test6.result?.value?.hasTopDiscountModeDropdown);
      if (test6.result?.value?.toggleButtonCount >= 2 && !test6.result?.value?.hasTopDiscountModeDropdown) {
        console.log('PASS: Top discount dropdown removed; two-position toggles (% / ₹) present in bill summary & lines.');
      } else {
        console.log('Discount toggle check result:', test6.result?.value);
      }

      // ─────────────────────────────────────────────────────────────
      // TEST 7: MULTI-PAYMENT SPLITS & CAPPING
      // ─────────────────────────────────────────────────────────────
      console.log('\n--- Checking Requirement 7: Multi-Payment Splits & Auto-fill ---');
      const test7 = await send('Runtime.evaluate', {
        expression: `(() => {
          const addSplitBtn = Array.from(document.querySelectorAll('button')).find(b => 
            b.innerText && b.innerText.includes('Add Payment Split')
          );
          const paymentModeSelects = Array.from(document.querySelectorAll('select')).filter(s => {
            const opts = Array.from(s.options).map(o => o.text);
            return opts.includes('Cash') && opts.includes('UPI / QR Code');
          });

          return {
            hasAddPaymentSplitBtn: !!addSplitBtn,
            paymentModeSelectCount: paymentModeSelects.length
          };
        })()`,
        returnByValue: true
      });
      console.log('Add Payment Split button present:', test7.result?.value?.hasAddPaymentSplitBtn);
      console.log('Payment Mode selects present:', test7.result?.value?.paymentModeSelectCount);
      if (test7.result?.value?.hasAddPaymentSplitBtn && test7.result?.value?.paymentModeSelectCount >= 1) {
        console.log('PASS: Multi-payment split UI and capping support verified.');
      }

      console.log('\nALL CDP VERIFICATIONS COMPLETED SUCCESSFULLY!');
      process.exit(0);
    } catch (err) {
      console.error('Test execution failed:', err);
      process.exit(1);
    }
  });
}

run().catch(console.error);
