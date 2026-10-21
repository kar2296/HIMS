const WebSocket = globalThis.WebSocket;
const fs = require('fs');
const path = require('path');

async function run() {
  console.log('=== Verifying Direct Billing Receipt Details & OP Format UI ===');
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

      console.log('1. Checking page state and logging in if needed...');
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
          } else {
            window.location.reload();
          }
        })()`
      });

      await new Promise(r => setTimeout(r, 3000));

      // Remove any lingering spinner if present
      await send('Runtime.evaluate', {
        expression: `(() => {
          const sp = document.getElementById('loadingSpinner') || document.querySelector('.page-spinner');
          if (sp) sp.style.display = 'none';
        })()`
      });

      console.log('2. Opening Previous Bills (F8)...');
      await send('Runtime.evaluate', {
        expression: `(async () => {
          const prevBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Previous Bills'));
          if (prevBtn) prevBtn.click();
        })()`
      });

      await new Promise(r => setTimeout(r, 2000));

      console.log('3. Selecting bill DG-10003 from Previous Bills modal...');
      const rawSelectRes = await send('Runtime.evaluate', {
        returnByValue: true,
        awaitPromise: true,
        expression: `(async () => {
          const rows = Array.from(document.querySelectorAll('tr, .modal tr, [role="row"]'));
          const rajaRow = rows.find(r => r.innerText.includes('DG-10003') || r.innerText.includes('RAJA'));
          if (rajaRow) {
            const selBtn = rajaRow.querySelector('button') || rajaRow;
            selBtn.click();
            return { found: true, text: rajaRow.innerText.slice(0, 80) };
          }
          return { found: false, totalRows: rows.length };
        })()`
      });
      const selectResult = rawSelectRes.result?.value || rawSelectRes.value;
      console.log('Select bill result:', selectResult);

      await new Promise(r => setTimeout(r, 4000));

      console.log('4. Checking Bill UI State...');
      const rawUiState = await send('Runtime.evaluate', {
        returnByValue: true,
        expression: `(() => {
          const el = document.querySelector('.hims-theme-billing') || document.querySelector('react-component') || document.body;
          const sc = window.angular ? window.angular.element(el).scope() : null;
          const allButtons = Array.from(document.querySelectorAll('button')).map(b => b.innerText.trim()).filter(Boolean);
          const receiptHistory = Array.from(document.querySelectorAll('div')).find(d => d.innerText && d.innerText.includes('Payment Receipts & Refund History'));
          const receiptInput = Array.from(document.querySelectorAll('input')).find(i => i.placeholder && i.placeholder.includes('Receipt Amount'));
          const collectDueBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Collect Due'));
          const fullyPaidBadge = Array.from(document.querySelectorAll('div, span')).find(d => d.innerText && d.innerText.includes('Fully Paid'));

          return {
            scopeBill: sc ? sc.item?.BillNumber : null,
            scopePaymentInfo: sc ? sc.PaymentInfoDetails : null,
            scopeReactPropsPaymentInfo: sc ? sc.reactProps?.paymentInfoDetails : null,
            buttons: allButtons,
            hasReceiptHistory: Boolean(receiptHistory),
            receiptHistoryText: receiptHistory ? receiptHistory.innerText.slice(0, 200) : null,
            receiptInputValue: receiptInput ? receiptInput.value : null,
            receiptInputDisabled: receiptInput ? receiptInput.disabled : null,
            hasCollectDueBtn: Boolean(collectDueBtn),
            collectDueBtnText: collectDueBtn ? collectDueBtn.innerText : null,
            hasFullyPaidBadge: Boolean(fullyPaidBadge),
          };
        })()`
      });
      const uiState = rawUiState.result?.value || rawUiState.value || {};
      console.log('UI State:', JSON.stringify(uiState, null, 2));

      // If Collect Due button is present, click it to test settlement!
      if (uiState.hasCollectDueBtn) {
        console.log('5. Clicking Collect Due button to settle outstanding amount...');
        await send('Runtime.evaluate', {
          expression: `(() => {
            const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Collect Due'));
            if (btn) btn.click();
          })()`
        });

        await new Promise(r => setTimeout(r, 3000));

        const postSettlementState = await send('Runtime.evaluate', {
          returnByValue: true,
          expression: `(() => {
            const receiptHistory = Array.from(document.querySelectorAll('div')).find(d => d.innerText && d.innerText.includes('Payment Receipts & Refund History'));
            const fullyPaidBadge = Array.from(document.querySelectorAll('div, span')).find(d => d.innerText && d.innerText.includes('Fully Paid'));
            return {
              hasReceiptHistory: Boolean(receiptHistory),
              receiptHistoryText: receiptHistory ? receiptHistory.innerText.slice(0, 300) : null,
              hasFullyPaidBadge: Boolean(fullyPaidBadge),
            };
          })()`
        });
        console.log('Post settlement state:', JSON.stringify(postSettlementState.value, null, 2));
      }

      console.log('6. Scrolling to bottom and taking full page screenshot...');
      await send('Runtime.evaluate', {
        expression: `window.scrollTo(0, document.body.scrollHeight);`
      });
      await new Promise(r => setTimeout(r, 500));

      const shot = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true });
      const outPath = '/Users/sharmila/.gemini/antigravity-ide/brain/10f529db-764b-4396-b01b-e4cb40958fff/direct_billing_op_format_verified.png';
      fs.writeFileSync(outPath, Buffer.from(shot.data, 'base64'));
      console.log('Screenshot saved to:', outPath);

      ws.close();
      process.exit(0);
    } catch (err) {
      console.error('Error during verification:', err);
      ws.close();
      process.exit(1);
    }
  });
}

run();
