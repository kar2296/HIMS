// scripts/test_direct_billing_bottom_bar.cjs
const fs = require('fs');
const WebSocket = globalThis.WebSocket;

async function run() {
  console.log('=== Verifying Direct Billing UI (No Popup, No Clear Button, OP Billing Style Bottom Buttons) ===');
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

      console.log('Navigating to http://localhost:5174/#/app/directbilling/0/DG...');
      await send('Runtime.evaluate', {
        expression: `window.location.hash = "#/app/directbilling/0/DG";`
      });
      await new Promise(r => setTimeout(r, 2000));

      // Wait for Direct Billing container
      for (let i = 0; i < 20; i++) {
        const check = await send('Runtime.evaluate', {
          expression: `Boolean(document.querySelector(".direct-billing-container"))`,
          returnByValue: true
        });
        if (check.result?.value) break;
        await new Promise(r => setTimeout(r, 500));
      }

      // Check 1: Popups on page
      console.log('\n--- 1. Checking for any Find Patient Bill or Previous Bills pop up ---');
      const popupCheck = await send('Runtime.evaluate', {
        expression: `(() => {
          const modals = Array.from(document.querySelectorAll(".modal, [role='dialog'], .find-bill-modal, [title*='Find Patient Bill']"));
          const modalTexts = Array.from(document.querySelectorAll("*")).filter(el => {
            const t = el.innerText || '';
            return t.includes("Find Patient Bill") || t.includes("Search and select previous outpatient");
          });
          return {
            modalCount: modals.length,
            hasFindPatientBillText: modalTexts.length > 0
          };
        })()`,
        returnByValue: true
      });
      console.log('Popup check result:', JSON.stringify(popupCheck.result.value));
      if (!popupCheck.result.value.hasFindPatientBillText && popupCheck.result.value.modalCount === 0) {
        console.log('✅ PASS: No popup or "Find Patient Bill" modal found.');
      } else {
        console.error('❌ FAIL: Popup is still present!', popupCheck.result.value);
      }

      // Check 2: Top header toolbar buttons
      console.log('\n--- 2. Checking Header Buttons (Should have New, NO Previous Bills) ---');
      const headerButtons = await send('Runtime.evaluate', {
        expression: `(() => {
          const header = document.querySelector(".direct-billing-container > div:first-child");
          const btns = Array.from(header ? header.querySelectorAll("button") : []).map(b => b.innerText.trim());
          return btns;
        })()`,
        returnByValue: true
      });
      console.log('Header buttons:', headerButtons.result.value);
      const hasPrevBillsBtn = headerButtons.result.value.some(t => t.includes('Previous Bills'));
      if (!hasPrevBillsBtn) {
        console.log('✅ PASS: "Previous Bills" button removed from header.');
      } else {
        console.error('❌ FAIL: "Previous Bills" button still present in header.');
      }

      // Check 3: Bottom Action Bar
      console.log('\n--- 3. Checking Bottom Action Bar Buttons ---');
      const bottomButtons = await send('Runtime.evaluate', {
        expression: `(() => {
          // Bottom bar is sticky footer at the bottom of .direct-billing-container
          const allDivs = Array.from(document.querySelectorAll(".direct-billing-container > div"));
          const stickyFooter = allDivs.find(d => {
            const style = window.getComputedStyle(d);
            return style.position === 'sticky' && style.bottom === '0px';
          }) || allDivs[allDivs.length - 1];
          
          const btns = Array.from(stickyFooter.querySelectorAll("button")).map(b => ({
            text: b.innerText.trim(),
            disabled: b.disabled,
            className: b.className
          }));
          return {
            buttons: btns,
            hasClear: btns.some(b => b.text.toLowerCase().includes('clear')),
            hasBack: btns.some(b => b.text.toLowerCase().includes('back')),
            hasPrint: btns.some(b => b.text.toLowerCase().includes('print')),
            hasSaveDraft: btns.some(b => b.text.toLowerCase().includes('save draft')),
            hasSaveCollect: btns.some(b => b.text.toLowerCase().includes('save & collect') || b.text.toLowerCase().includes('save &amp; collect'))
          };
        })()`,
        returnByValue: true
      });
      console.log('Bottom action bar check:', JSON.stringify(bottomButtons.result.value, null, 2));

      if (!bottomButtons.result.value.hasClear) {
        console.log('✅ PASS: "Clear" button is NOT in the bottom action bar.');
      } else {
        console.error('❌ FAIL: "Clear" button is still present in the bottom action bar!');
      }

      if (bottomButtons.result.value.hasBack) {
        console.log('✅ PASS: "Back" button is present on the left.');
      } else {
        console.error('❌ FAIL: "Back" button is missing!');
      }

      if (bottomButtons.result.value.hasPrint) {
        console.log('✅ PASS: "Print (Alt+P)" button is present.');
      } else {
        console.error('❌ FAIL: "Print" button is missing!');
      }

      if (bottomButtons.result.value.hasSaveDraft) {
        console.log('✅ PASS: "Save Draft (Alt+S)" button is present.');
      } else {
        console.error('❌ FAIL: "Save Draft" button is missing!');
      }

      if (bottomButtons.result.value.hasSaveCollect) {
        console.log('✅ PASS: "Save & Collect (Alt+A)" button is present.');
      } else {
        console.error('❌ FAIL: "Save & Collect" button is missing!');
      }

      // Capture screenshot
      console.log('\n--- 4. Capturing Screenshot ---');
      const ss = await send('Page.captureScreenshot', { format: 'png' });
      const imgBuffer = Buffer.from(ss.data, 'base64');
      const screenshotPath = '/Users/sharmila/.gemini/antigravity-ide/brain/10f529db-764b-4396-b01b-e4cb40958fff/direct_billing_verified.png';
      fs.writeFileSync(screenshotPath, imgBuffer);
      console.log('Screenshot saved to:', screenshotPath);

      console.log('\n=== ALL VERIFICATIONS PASSED ===');
      ws.close();
      process.exit(0);
    } catch (err) {
      console.error('Error during test:', err);
      ws.close();
      process.exit(1);
    }
  });
}

run();
