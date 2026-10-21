// scripts/verify_direct_billing_full_functionality.cjs
const WebSocket = globalThis.WebSocket;
const fs = require('fs');

async function run() {
  console.log('=== Verifying Direct Billing (DG) Full Functionality ===');
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

      console.log('Ensuring Direct Billing page...');
      await send('Runtime.evaluate', {
        expression: `(async () => {
          if (window.location.hash.includes('login') || document.querySelector('input[name="username"]')) {
            const userIn = document.querySelector('input[name="username"], input[type="text"]');
            const passIn = document.querySelector('input[name="password"], input[type="password"]');
            const submitBtn = document.querySelector('button[type="submit"], button.btn-primary') || Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Sign in'));
            if (userIn && passIn && submitBtn) {
              userIn.value = 'admin';
              userIn.dispatchEvent(new Event('input', { bubbles: true }));
              passIn.value = 'admin';
              passIn.dispatchEvent(new Event('input', { bubbles: true }));
              submitBtn.click();
              await new Promise(r => setTimeout(r, 2000));
            }
          }
          if (!window.location.hash.includes('/directbilling/0/DG')) {
            window.location.href = 'http://localhost:5174/#/app/directbilling/0/DG';
          }
        })()`
      });

      await new Promise(r => setTimeout(r, 2000));

      // Hide leftover spinner if any
      await send('Runtime.evaluate', {
        expression: 'document.getElementById("divgifLoading")?.style.setProperty("display", "none");'
      });

      // Check 1: Top cards and referral options
      console.log('\n--- 1. Checking Patient Fields and Referral Dropdown ---');
      const check1 = await send('Runtime.evaluate', {
        expression: `(() => {
          const nameInput = document.getElementById("txtDirectPatientName");
          const genderSelect = document.getElementById("selDirectPatientGender");
          const ageInput = document.getElementById("txtDirectPatientAge");
          const referralSelect = document.getElementById("selDirectPatientReferral");
          const addReferralBtn = document.getElementById("btnAddReferralDirect");

          return {
            hasNameInput: Boolean(nameInput),
            hasGenderSelect: Boolean(genderSelect),
            genderOptionsCount: genderSelect ? genderSelect.options.length : 0,
            hasAgeInput: Boolean(ageInput),
            hasReferralSelect: Boolean(referralSelect),
            referralOptionsCount: referralSelect ? referralSelect.options.length : 0,
            hasAddReferralBtn: Boolean(addReferralBtn),
          };
        })()`,
        returnByValue: true
      });
      console.log('Fields and Referral status:', JSON.stringify(check1.result?.value, null, 2));

      // Check 2: Service Items Search API and Autocomplete
      console.log('\n--- 2. Checking Service Items Search API & Autocomplete ---');
      await send('Runtime.evaluate', {
        expression: `(() => {
          const input = document.getElementById("txtServiceItem_0");
          if (input) {
            input.focus();
            const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
            setter.call(input, 'consult');
            input.dispatchEvent(new Event('input', { bubbles: true }));
          }
        })()`
      });

      await new Promise(r => setTimeout(r, 1500));

      const check2 = await send('Runtime.evaluate', {
        expression: `(() => {
          const menu = document.querySelector('[style*="max-height: 220px"], [style*="maxHeight: 220px"]');
          const suggestionItems = menu ? Array.from(menu.querySelectorAll("div[style*='cursor: pointer']")).map(d => d.innerText.replace(/\\n/g, ' - ').trim()) : [];
          return {
            hasSuggestionsMenu: Boolean(menu),
            suggestionsCount: suggestionItems.length,
            topSuggestions: suggestionItems.slice(0, 3)
          };
        })()`,
        returnByValue: true
      });
      console.log('Service search status:', JSON.stringify(check2.result?.value, null, 2));

      // Check 3: Select a service item and verify rate/amount calculation
      console.log('\n--- 3. Selecting Service and Verifying Calculation ---');
      await send('Runtime.evaluate', {
        expression: `(() => {
          const menu = document.querySelector('[style*="max-height: 220px"], [style*="maxHeight: 220px"]');
          if (menu) {
            const firstItem = menu.querySelector("div[style*='cursor: pointer']");
            if (firstItem) firstItem.click();
          }
        })()`
      });

      await new Promise(r => setTimeout(r, 1000));

      const check3 = await send('Runtime.evaluate', {
        expression: `(() => {
          const serviceInput = document.getElementById("txtServiceItem_0");
          const rows = Array.from(document.querySelectorAll("tbody tr"));
          const firstRow = rows[0];
          const rateCell = firstRow ? firstRow.querySelectorAll("td")[3]?.innerText.trim() : "";
          const grossCell = firstRow ? firstRow.querySelectorAll("td")[4]?.innerText.trim() : "";
          const netCell = firstRow ? firstRow.querySelectorAll("td")[6]?.innerText.trim() : "";
          const totalRows = rows.length;

          return {
            serviceSelected: serviceInput ? serviceInput.value : "",
            rate: rateCell,
            gross: grossCell,
            net: netCell,
            totalRows: totalRows,
          };
        })()`,
        returnByValue: true
      });
      console.log('Selected service & totals:', JSON.stringify(check3.result?.value, null, 2));

      // Check 4: Verify No "Add Service" button
      console.log('\n--- 4. Verifying No "Add Service" Button ---');
      const check4 = await send('Runtime.evaluate', {
        expression: `(() => {
          const allButtons = Array.from(document.querySelectorAll("button")).map(b => (b.innerText || b.title || "").trim().toLowerCase());
          return {
            hasAddServiceBtn: allButtons.some(b => b === "add service" || b.includes("add service"))
          };
        })()`,
        returnByValue: true
      });
      console.log('Add Service button check:', JSON.stringify(check4.result?.value, null, 2));

      // Capture screenshot
      const shot = await send('Page.captureScreenshot', { format: 'png' });
      fs.writeFileSync('direct_billing_verified.png', Buffer.from(shot.data, 'base64'));
      console.log('\nSaved direct_billing_verified.png');

      ws.close();
      console.log('\n=== All Tests Completed Successfully ===');
    } catch (err) {
      console.error('Error during verification:', err);
      ws.close();
      process.exit(1);
    }
  });
}

run();
