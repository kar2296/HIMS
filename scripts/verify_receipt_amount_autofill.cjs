// scripts/verify_receipt_amount_autofill.cjs
const http = require('http');
const fs = require('fs');
const WebSocket = globalThis.WebSocket;

async function run() {
  const tabsRes = await fetch('http://127.0.0.1:9222/json');
  const tabs = await tabsRes.json();
  const opTab = tabs.find(t => t.url && t.url.includes('opbilling-list'));
  if (!opTab) {
    console.error('No opbilling-list tab found!');
    process.exit(1);
  }

  const ws = new WebSocket(opTab.webSocketDebuggerUrl);
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
      console.log('Connected to OP Billing tab CDP.');
      await send('Page.enable');
      await send('Runtime.enable');

      // 1. Initial State Check
      const initial = await send('Runtime.evaluate', {
        expression: `(() => {
          const serviceInput = Array.from(document.querySelectorAll('input')).find(i => (i.placeholder || '').includes('service name'));
          const receiptInput = Array.from(document.querySelectorAll('input')).find(i => i.closest('div') && i.closest('div').innerText && i.closest('div').innerText.includes('Receipt Amount'));
          return {
            hasServiceInput: !!serviceInput,
            hasReceiptInput: !!receiptInput,
            receiptCurrentValue: receiptInput ? receiptInput.value : null
          };
        })()`,
        returnByValue: true
      });
      console.log('Step 1 (Initial UI Check):', JSON.stringify(initial.result.value, null, 2));

      // 2. Type "%%" to open catalog
      console.log('Step 2: Focusing service input and typing "%%"...');
      const srvTypeResult = await send('Runtime.evaluate', {
        expression: `(async () => {
          const serviceInput = Array.from(document.querySelectorAll('input')).find(i => (i.placeholder || '').includes('service name'));
          if (!serviceInput) return { error: 'Service input not found' };

          serviceInput.scrollIntoView({ behavior: 'instant', block: 'center' });
          serviceInput.focus();
          serviceInput.click();

          const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
          setter.call(serviceInput, '%%');
          serviceInput.dispatchEvent(new Event('input', { bubbles: true }));
          serviceInput.dispatchEvent(new Event('change', { bubbles: true }));

          // Wait for catalog container
          for (let i = 0; i < 20; i++) {
            await new Promise(r => setTimeout(r, 200));
            const c = document.querySelector('.service-search-container');
            if (c && c.querySelectorAll('div').length > 5) break;
          }

          const container = document.querySelector('.service-search-container');
          const rows = container ? Array.from(container.children).filter(d => d.innerText && d.innerText.includes('₹')) : [];

          return {
            hasContainer: !!container,
            availableRowsCount: rows.length,
            sampleRow: rows[0] ? rows[0].innerText.replace(/\\n/g, ' - ') : null
          };
        })()`,
        awaitPromise: true,
        returnByValue: true
      });
      console.log('Step 2 (Catalog State):', JSON.stringify(srvTypeResult.result.value, null, 2));

      // 3. Select a priced service item (e.g. ₹500.00)
      console.log('Step 3: Selecting priced service...');
      const selectResult = await send('Runtime.evaluate', {
        expression: `(async () => {
          const container = document.querySelector('.service-search-container');
          if (!container) return { error: 'No dropdown container' };

          const items = Array.from(document.querySelectorAll('.service-result-item'));
          const rows = items.filter(d => {
            if (!d.innerText || !d.innerText.includes('₹')) return false;
            return !d.innerText.includes('₹0.00');
          });

          if (rows.length === 0) return { error: 'No priced items in catalog', totalItems: items.length };

          const selectedRow = rows[0];
          const text = selectedRow.innerText.replace(/\\n/g, ' - ');

          selectedRow.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
          selectedRow.click();

          await new Promise(r => setTimeout(r, 1000));

          // Inspect Net Amount display
          const allEls = Array.from(document.querySelectorAll('div, span'));
          const netLabel = allEls.find(d => d.innerText && d.innerText.trim() === 'Net Amount:');
          const netValue = netLabel?.parentElement?.innerText || 'not found';

          const receiptInput = Array.from(document.querySelectorAll('input')).find(i => i.closest('div') && i.closest('div').innerText && i.closest('div').innerText.includes('Receipt Amount'));
          const autoFillBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText && b.innerText.includes('Auto-fill'));

          return {
            selectedService: text,
            netAmountDisplay: netValue,
            receiptValBeforeClick: receiptInput ? receiptInput.value : null,
            hasAutoFillBtn: !!autoFillBtn,
            autoFillBtnText: autoFillBtn ? autoFillBtn.innerText : null
          };
        })()`,
        awaitPromise: true,
        returnByValue: true
      });
      console.log('Step 3 (Service Selected & Net Amount):', JSON.stringify(selectResult.result.value, null, 2));

      // 4. Test USER ACTION: Click the Receipt Amount input field
      console.log('Step 4: Clicking Receipt Amount input field to verify auto-fill...');
      const clickResult = await send('Runtime.evaluate', {
        expression: `(async () => {
          const receiptInput = Array.from(document.querySelectorAll('input')).find(i => i.closest('div') && i.closest('div').innerText && i.closest('div').innerText.includes('Receipt Amount'));
          if (!receiptInput) return { error: 'Receipt input not found' };

          // Reset receipt amount to 0 first to clearly demonstrate auto-fill on click
          const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
          setter.call(receiptInput, '0');
          receiptInput.dispatchEvent(new Event('input', { bubbles: true }));
          receiptInput.dispatchEvent(new Event('change', { bubbles: true }));
          await new Promise(r => setTimeout(r, 400));
          const valBeforeClick = receiptInput.value;

          // Now simulate user click / focus
          receiptInput.scrollIntoView({ behavior: 'instant', block: 'center' });
          receiptInput.focus();
          receiptInput.click();
          await new Promise(r => setTimeout(r, 600));

          return {
            receiptValueCleared: valBeforeClick,
            receiptInputValueAfterClick: receiptInput.value
          };
        })()`,
        awaitPromise: true,
        returnByValue: true
      });
      console.log('Step 4 (Receipt Amount Auto-fill on Click):', JSON.stringify(clickResult.result.value, null, 2));

      // 5. Test Auto-fill button click if present
      const autoFillTest = await send('Runtime.evaluate', {
        expression: `(async () => {
          const autoFillBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText && b.innerText.includes('Auto-fill'));
          if (autoFillBtn) {
            autoFillBtn.click();
            await new Promise(r => setTimeout(r, 400));
          }
          const receiptInput = Array.from(document.querySelectorAll('input')).find(i => i.closest('div') && i.closest('div').innerText && i.closest('div').innerText.includes('Receipt Amount'));
          return {
            autoFillBtnClicked: !!autoFillBtn,
            receiptValueAfterAutoFillBtn: receiptInput ? receiptInput.value : null
          };
        })()`,
        awaitPromise: true,
        returnByValue: true
      });
      console.log('Step 5 (AutoFill Button Click):', JSON.stringify(autoFillTest.result.value, null, 2));

      // 6. Wait for any in-flight background requests to finish and loader to hide
      await send('Runtime.evaluate', {
        expression: `(async () => {
          for (let i = 0; i < 30; i++) {
            const el = document.getElementById("divgifLoading");
            if (!el || window.getComputedStyle(el).display === "none") break;
            await new Promise(r => setTimeout(r, 200));
          }
          await new Promise(r => setTimeout(r, 300));
        })()`,
        awaitPromise: true
      });

      // 7. Capture full screenshot
      const ss = await send('Page.captureScreenshot', { format: 'png' });
      fs.writeFileSync('/Users/sharmila/.gemini/antigravity-ide/brain/b5624335-47de-476b-939d-5b4333769f91/receipt_amount_verified.png', Buffer.from(ss.data, 'base64'));
      console.log('Step 6: Saved clean screenshot to receipt_amount_verified.png');

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
