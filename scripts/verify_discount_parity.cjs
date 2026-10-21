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

  // Set standard resolution
  await send('Emulation.setDeviceMetricsOverride', {
    width: 1300,
    height: 1050,
    deviceScaleFactor: 1,
    mobile: false
  });

  console.log('=== Step 1: Login if required & Navigate ===');
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

  await new Promise(r => setTimeout(r, 3500));

  console.log('=== Step 2: Populate exact bill scenario ===');
  const setupRes = await send('Runtime.evaluate', {
    returnByValue: true,
    awaitPromise: true,
    expression: `(async () => {
      const el = document.querySelector('react-component') || document.querySelector('.hims-theme-billing') || document.body;
      const allEls = [el, ...document.querySelectorAll('*')];
      let sc = null;
      for (const e of allEls) {
        const candidate = window.angular ? window.angular.element(e).scope() : null;
        if (candidate && typeof candidate.handleReactAction === 'function') {
          sc = candidate;
          break;
        }
      }
      if (!sc) return { error: 'scope not found' };

      // Set patient fields
      sc.currentfilter.FirstName = 'TEST';
      sc.item.PatientName = 'TEST';
      sc.currentfilter.GenderId = 1;
      sc.currentfilter.Age = '22';
      sc.currentfilter.Mobile = '1234567898';
      sc.currentfilter.DiscountModeId = 2; // % mode
      sc.currentcontext.BillDiscount = 0;

      // Set line items
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
          ServiceName: 'BASIC PROFILE (CBC, PT, HBSAG, HCV, HIV, UR, CR,ELEC, LFT)',
          Quantity: 1,
          Rate: 3320,
          UnitPrice: 3320,
          Amount: 3320,
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
        row0Net: sc.PatientBillDetails[0].NetAmount,
        row1Net: sc.PatientBillDetails[1].NetAmount,
        gross: sc.item.GrossAmount,
        discount: sc.item.TotDiscAmount,
        net: sc.item.TotNetAmount || sc.currentcontext.TotNetAmount
      };
    })()`
  });

  console.log('Setup result from Angular:', setupRes.result.value);

  await new Promise(r => setTimeout(r, 800));

  console.log('=== Step 3: Verify Percentage (%) Mode ===');
  const pctEval = await send('Runtime.evaluate', {
    returnByValue: true,
    awaitPromise: true,
    expression: `(() => {
      const rows = Array.from(document.querySelectorAll('table tbody tr')).map(tr => {
        const tds = Array.from(tr.querySelectorAll('td')).map(td => td.innerText.trim());
        const inputs = Array.from(tr.querySelectorAll('input')).map(i => i.value);
        return { tds, inputs };
      });
      const ths = Array.from(document.querySelectorAll('table thead th')).map(th => th.innerText.trim());
      const summaryText = document.body.innerText;
      const grossMatch = summaryText.match(/Gross Amount\\s*\\n\\s*(₹[\\d,.]+)/);
      const discMatch = summaryText.match(/Discount\\s*\\n\\s*(₹[\\d,.]+)/);
      const netMatch = summaryText.match(/Net Amount\\s*\\n\\s*(₹[\\d,.]+)/);

      return {
        ths,
        row1: {
          name: rows[0]?.inputs[0],
          rate: rows[0]?.inputs[2],
          gross: rows[0]?.tds[4],
          discount: rows[0]?.inputs[3],
          net: rows[0]?.tds[6]
        },
        row2: {
          name: rows[1]?.inputs[0],
          rate: rows[1]?.inputs[2],
          gross: rows[1]?.tds[4],
          discount: rows[1]?.inputs[3],
          net: rows[1]?.tds[6]
        },
        billSummary: {
          gross: grossMatch ? grossMatch[1] : null,
          discount: discMatch ? discMatch[1] : null,
          net: netMatch ? netMatch[1] : null
        }
      };
    })()`
  });

  console.log('--- Percentage Mode Results ---');
  console.log(JSON.stringify(pctEval.result.value, null, 2));

  // Capture screenshot of % mode
  const pctScreen = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(
    '/Users/sharmila/.gemini/antigravity-ide/brain/10f529db-764b-4396-b01b-e4cb40958fff/.tempmediaStorage/verified_percentage_mode.png',
    Buffer.from(pctScreen.data, 'base64')
  );

  console.log('=== Step 4: Toggle to Rupee (₹) Mode ===');
  await send('Runtime.evaluate', {
    awaitPromise: true,
    expression: `(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const inrBtn = buttons.find(b => b.innerText.trim() === '₹');
      if (inrBtn) inrBtn.click();
    })()`
  });

  await new Promise(r => setTimeout(r, 800));

  const inrEval = await send('Runtime.evaluate', {
    returnByValue: true,
    awaitPromise: true,
    expression: `(() => {
      const rows = Array.from(document.querySelectorAll('table tbody tr')).map(tr => {
        const tds = Array.from(tr.querySelectorAll('td')).map(td => td.innerText.trim());
        const inputs = Array.from(tr.querySelectorAll('input')).map(i => i.value);
        return { tds, inputs };
      });
      const ths = Array.from(document.querySelectorAll('table thead th')).map(th => th.innerText.trim());
      const summaryText = document.body.innerText;
      const grossMatch = summaryText.match(/Gross Amount\\s*\\n\\s*(₹[\\d,.]+)/);
      const discMatch = summaryText.match(/Discount\\s*\\n\\s*(₹[\\d,.]+)/);
      const netMatch = summaryText.match(/Net Amount\\s*\\n\\s*(₹[\\d,.]+)/);

      return {
        ths,
        row1: {
          name: rows[0]?.inputs[0],
          rate: rows[0]?.inputs[2],
          gross: rows[0]?.tds[4],
          discount: rows[0]?.inputs[3],
          net: rows[0]?.tds[6]
        },
        row2: {
          name: rows[1]?.inputs[0],
          rate: rows[1]?.inputs[2],
          gross: rows[1]?.tds[4],
          discount: rows[1]?.inputs[3],
          net: rows[1]?.tds[6]
        },
        billSummary: {
          gross: grossMatch ? grossMatch[1] : null,
          discount: discMatch ? discMatch[1] : null,
          net: netMatch ? netMatch[1] : null
        }
      };
    })()`
  });

  console.log('--- Rupee Mode Results ---');
  console.log(JSON.stringify(inrEval.result.value, null, 2));

  // Capture screenshot of ₹ mode
  const inrScreen = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(
    '/Users/sharmila/.gemini/antigravity-ide/brain/10f529db-764b-4396-b01b-e4cb40958fff/.tempmediaStorage/verified_rupee_mode.png',
    Buffer.from(inrScreen.data, 'base64')
  );

  console.log('=== Step 5: Toggle back to % and test Validation (150%) ===');
  await send('Runtime.evaluate', {
    awaitPromise: true,
    expression: `(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const pctBtn = buttons.find(b => b.innerText.trim() === '%');
      if (pctBtn) pctBtn.click();

      const billDiscInput = document.getElementById('txtDirectBillDiscount');
      if (billDiscInput) {
        if (billDiscInput._valueTracker) billDiscInput._valueTracker.setValue('');
        const valSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
        valSetter.call(billDiscInput, '150');
        billDiscInput.dispatchEvent(new Event('input', { bubbles: true }));
        billDiscInput.dispatchEvent(new Event('change', { bubbles: true }));
      }
    })()`
  });

  await new Promise(r => setTimeout(r, 600));

  const valEval = await send('Runtime.evaluate', {
    returnByValue: true,
    awaitPromise: true,
    expression: `(() => {
      const alerts = Array.from(document.querySelectorAll('div'))
        .filter(d => d.innerText && d.innerText.includes('Bill discount cannot exceed 100%'))
        .map(d => d.innerText.trim());

      const saveBtn = document.querySelector('button[title*="Cannot save"]') || document.querySelector('button[title*="Save as Draft"]');

      return {
        alerts: Array.from(new Set(alerts)),
        saveBtnTitle: saveBtn ? saveBtn.getAttribute('title') : null,
        saveBtnDisabled: saveBtn ? saveBtn.disabled : null
      };
    })()`
  });

  console.log('--- Validation Results ---');
  console.log(JSON.stringify(valEval.result.value, null, 2));

  const valScreen = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(
    '/Users/sharmila/.gemini/antigravity-ide/brain/10f529db-764b-4396-b01b-e4cb40958fff/.tempmediaStorage/verified_validation_error.png',
    Buffer.from(valScreen.data, 'base64')
  );

  console.log('=== Step 6: Reset Bill Discount to 0 for final clean state ===');
  await send('Runtime.evaluate', {
    awaitPromise: true,
    expression: `(() => {
      const billDiscInput = document.getElementById('txtDirectBillDiscount');
      if (billDiscInput) {
        if (billDiscInput._valueTracker) billDiscInput._valueTracker.setValue('');
        const valSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
        valSetter.call(billDiscInput, '0');
        billDiscInput.dispatchEvent(new Event('input', { bubbles: true }));
        billDiscInput.dispatchEvent(new Event('change', { bubbles: true }));
      }
    })()`
  });

  await new Promise(r => setTimeout(r, 600));

  const finalScreen = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(
    '/Users/sharmila/.gemini/antigravity-ide/brain/10f529db-764b-4396-b01b-e4cb40958fff/.tempmediaStorage/verified_final_percent.png',
    Buffer.from(finalScreen.data, 'base64')
  );

  console.log('All screenshots saved successfully!');
  ws.close();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
