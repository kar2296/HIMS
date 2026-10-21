const WebSocket = require('ws');
const http = require('http');
const fs = require('fs');

async function getPages() {
  return new Promise((resolve, reject) => {
    http.get('http://localhost:9222/json', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });
}

async function main() {
  const pages = await getPages();
  const page = pages.find(p => p.url.includes('localhost:5174'));
  if (!page) {
    console.error('Localhost:5174 page not found in Chrome CDP');
    process.exit(1);
  }

  const ws = new WebSocket(page.webSocketDebuggerUrl);
  let msgId = 0;
  const callbacks = new Map();

  function send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = ++msgId;
      callbacks.set(id, { resolve, reject });
      ws.send(JSON.stringify({ id, method, params }));
    });
  }

  ws.on('message', (msg) => {
    const parsed = JSON.parse(msg);
    if (parsed.id && callbacks.has(parsed.id)) {
      const cb = callbacks.get(parsed.id);
      callbacks.delete(parsed.id);
      if (parsed.error) cb.reject(parsed.error);
      else cb.resolve(parsed.result);
    }
  });

  await new Promise(r => ws.on('open', r));
  await send('Page.enable');
  await send('Runtime.enable');

  await send('Emulation.setDeviceMetricsOverride', {
    width: 1300,
    height: 1050,
    deviceScaleFactor: 1,
    mobile: false
  });

  console.log('=== Step 1: Navigating to Direct Billing ===');
  await send('Runtime.evaluate', {
    awaitPromise: true,
    expression: `(async () => {
      if (window.location.hash.includes('login') || document.querySelector('input[type="password"]')) {
        const u = document.getElementById('login-username') || document.querySelector('input[name="username"], input[type="text"]');
        const p = document.getElementById('login-password') || document.querySelector('input[name="password"], input[type="password"]');
        const submitBtn = document.querySelector('button[type="submit"], button.btn-primary') || Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Sign in'));
        if (u && p && submitBtn) {
          const valSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
          valSetter.call(u, 'admin');
          u.dispatchEvent(new Event('input', { bubbles: true }));
          valSetter.call(p, 'admin');
          p.dispatchEvent(new Event('input', { bubbles: true }));
          submitBtn.click();
          await new Promise(r => setTimeout(r, 2000));
        }
      }
      window.location.hash = '#/app/directbilling/0/DG';
    })()`
  });

  await new Promise(r => setTimeout(r, 3000));

  console.log('=== Step 2: Populate Patient & 2 Services matching User Screenshot ===');
  const setupRes = await send('Runtime.evaluate', {
    returnByValue: true,
    awaitPromise: true,
    expression: `(async () => {
      const allEls = [document.querySelector('react-component'), document.querySelector('.hims-theme-billing'), ...document.querySelectorAll('*')];
      let sc = null;
      for (const e of allEls) {
        const candidate = window.angular && e ? window.angular.element(e).scope() : null;
        if (candidate && typeof candidate.handleReactAction === 'function') {
          sc = candidate;
          break;
        }
      }
      if (!sc) return { error: 'Scope not found' };

      sc.currentfilter.FirstName = 'TESTTT';
      sc.item.PatientName = 'TESTTT';
      sc.currentfilter.GenderId = 1;
      sc.currentfilter.Age = '22';
      sc.currentfilter.Mobile = '7654323456';
      sc.currentfilter.DiscountModeId = 2; // default %
      sc.currentcontext.BillDiscount = 0;

      sc.PatientBillDetails = [
        {
          ServiceId: 101,
          ServiceName: 'CBC (COMPLETE BLOOD COUNT)',
          Quantity: 1,
          Rate: 320,
          UnitPrice: 320,
          Amount: 320,
          DiscountAmount: 10,
          DiscountPercentage: 10,
          DiscountModeId: 2,
          Status: 1
        },
        {
          ServiceId: 102,
          ServiceName: 'ANTENATAL PROFILE 2 (34 TO 36 WEEKS) CBC, LFT, PT, CR,HIV/HC\\\\...',
          Quantity: 1,
          Rate: 2850,
          UnitPrice: 2850,
          Amount: 2850,
          DiscountAmount: 10,
          DiscountPercentage: 10,
          DiscountModeId: 2,
          Status: 1
        },
        {
          ServiceId: -1,
          ServiceName: '',
          Quantity: 1,
          Rate: 0,
          UnitPrice: 0,
          Amount: 0,
          DiscountAmount: 0,
          DiscountModeId: 2,
          NetAmount: 0,
          Status: 1
        }
      ];

      if (typeof sc.CalcualteAmt === 'function') {
        sc.CalcualteAmt(sc.PatientBillDetails[0]);
        sc.CalcualteAmt(sc.PatientBillDetails[1]);
      }
      if (typeof sc.CalculateNetAmt === 'function') {
        sc.CalculateNetAmt();
      }
      if (typeof sc.refreshReactProps === 'function') {
        sc.refreshReactProps();
      }
      sc.$applyAsync();

      return {
        success: true,
        gross: sc.item.GrossAmount,
        discount: sc.item.TotDiscAmount,
        net: sc.currentcontext.TotNetAmount,
        receiptAmt: sc.currentcontext.ReceiptAmt
      };
    })()`
  });

  console.log('Angular Scope Setup Result:', setupRes.result.value);

  await new Promise(r => setTimeout(r, 1000));

  console.log('=== Step 3: Inspect DOM - Verify per-row discount toggles and Receipt Amount ===');
  const domEval = await send('Runtime.evaluate', {
    returnByValue: true,
    awaitPromise: true,
    expression: `(() => {
      const rows = Array.from(document.querySelectorAll('table tbody tr')).map(tr => {
        const tds = Array.from(tr.querySelectorAll('td')).map(td => td.innerText.trim());
        const inputs = Array.from(tr.querySelectorAll('input')).map(i => i.value);
        const toggleButtons = Array.from(tr.querySelectorAll('button')).map(b => b.innerText.trim());
        return { tds, inputs, toggleButtons };
      });
      const ths = Array.from(document.querySelectorAll('table thead th')).map(th => th.innerText.trim());
      const receiptInput = document.getElementById('txtDirectReceiptAmt');

      const summaryText = document.body.innerText;
      const grossMatch = summaryText.match(/Gross Amount\\s*\\n\\s*(₹[\\d,.]+)/);
      const discMatch = summaryText.match(/Discount\\s*\\n\\s*(₹[\\d,.]+)/);
      const netMatch = summaryText.match(/Net Amount\\s*\\n\\s*(₹[\\d,.]+)/);
      const paidMatch = summaryText.match(/Paid Amount\\s*\\n\\s*(₹[\\d,.]+)/);
      const returnDueMatch = summaryText.match(/Return \\/ Due Amt\\s*\\n\\s*(₹[\\d,.]+)/);

      return {
        ths,
        row1: {
          name: rows[0]?.inputs[0],
          rate: rows[0]?.inputs[2],
          gross: rows[0]?.tds[4],
          toggleButtons: rows[0]?.toggleButtons,
          discount: rows[0]?.inputs[3],
          net: rows[0]?.tds[6]
        },
        row2: {
          name: rows[1]?.inputs[0],
          rate: rows[1]?.inputs[2],
          gross: rows[1]?.tds[4],
          toggleButtons: rows[1]?.toggleButtons,
          discount: rows[1]?.inputs[3],
          net: rows[1]?.tds[6]
        },
        receiptAmountInput: receiptInput ? receiptInput.value : null,
        billSummary: {
          gross: grossMatch ? grossMatch[1] : null,
          discount: discMatch ? discMatch[1] : null,
          net: netMatch ? netMatch[1] : null,
          paid: paidMatch ? paidMatch[1] : null,
          returnDue: returnDueMatch ? returnDueMatch[1] : null
        }
      };
    })()`
  });

  console.log('DOM Evaluation Result:');
  console.log(JSON.stringify(domEval.result.value, null, 2));

  // Capture screenshot of both services in % mode with correct receipt amount
  const screen1 = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(
    '/Users/sharmila/.gemini/antigravity-ide/brain/10f529db-764b-4396-b01b-e4cb40958fff/.tempmediaStorage/verified_service_wise_and_receipt_corrected.png',
    Buffer.from(screen1.data, 'base64')
  );
  console.log('Saved verified_service_wise_and_receipt_corrected.png');

  console.log('=== Step 4: Toggle Row 1 to Rupee (₹) Mode and keep Row 2 in % Mode ===');
  await send('Runtime.evaluate', {
    awaitPromise: true,
    expression: `(() => {
      const rows = Array.from(document.querySelectorAll('table tbody tr'));
      // Find the toggle buttons in row 1
      const row1Buttons = Array.from(rows[0].querySelectorAll('button'));
      const inrBtn = row1Buttons.find(b => b.innerText.trim() === '₹');
      if (inrBtn) inrBtn.click();
    })()`
  });

  await new Promise(r => setTimeout(r, 1000));

  const mixedEval = await send('Runtime.evaluate', {
    returnByValue: true,
    awaitPromise: true,
    expression: `(() => {
      const rows = Array.from(document.querySelectorAll('table tbody tr')).map(tr => {
        const tds = Array.from(tr.querySelectorAll('td')).map(td => td.innerText.trim());
        const inputs = Array.from(tr.querySelectorAll('input')).map(i => i.value);
        const toggleButtons = Array.from(tr.querySelectorAll('button')).map(b => b.innerText.trim());
        return { tds, inputs, toggleButtons };
      });
      const receiptInput = document.getElementById('txtDirectReceiptAmt');

      const summaryText = document.body.innerText;
      const grossMatch = summaryText.match(/Gross Amount\\s*\\n\\s*(₹[\\d,.]+)/);
      const discMatch = summaryText.match(/Discount\\s*\\n\\s*(₹[\\d,.]+)/);
      const netMatch = summaryText.match(/Net Amount\\s*\\n\\s*(₹[\\d,.]+)/);
      const paidMatch = summaryText.match(/Paid Amount\\s*\\n\\s*(₹[\\d,.]+)/);
      const returnDueMatch = summaryText.match(/Return \\/ Due Amt\\s*\\n\\s*(₹[\\d,.]+)/);

      return {
        row1: {
          name: rows[0]?.inputs[0],
          gross: rows[0]?.tds[4],
          toggleButtons: rows[0]?.toggleButtons,
          discount: rows[0]?.inputs[3],
          net: rows[0]?.tds[6]
        },
        row2: {
          name: rows[1]?.inputs[0],
          gross: rows[1]?.tds[4],
          toggleButtons: rows[1]?.toggleButtons,
          discount: rows[1]?.inputs[3],
          net: rows[1]?.tds[6]
        },
        receiptAmountInput: receiptInput ? receiptInput.value : null,
        billSummary: {
          gross: grossMatch ? grossMatch[1] : null,
          discount: discMatch ? discMatch[1] : null,
          net: netMatch ? netMatch[1] : null,
          paid: paidMatch ? paidMatch[1] : null,
          returnDue: returnDueMatch ? returnDueMatch[1] : null
        }
      };
    })()`
  });

  console.log('Mixed Service Discount Evaluation Result:');
  console.log(JSON.stringify(mixedEval.result.value, null, 2));

  // Capture screenshot of mixed service-wise discounts
  const screen2 = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(
    '/Users/sharmila/.gemini/antigravity-ide/brain/10f529db-764b-4396-b01b-e4cb40958fff/.tempmediaStorage/verified_mixed_service_wise_discounts.png',
    Buffer.from(screen2.data, 'base64')
  );
  console.log('Saved verified_mixed_service_wise_discounts.png');

  ws.close();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
