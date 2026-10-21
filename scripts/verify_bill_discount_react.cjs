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
    console.error('Page not found');
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
    width: 1400,
    height: 1050,
    deviceScaleFactor: 1,
    mobile: false
  });

  console.log('=== Step 1: Navigate to http://localhost:5174/#/app/billdscnttab/0//opbillsdscnt/0/ ===');
  await send('Runtime.evaluate', {
    awaitPromise: true,
    expression: `(async () => {
      window.location.hash = '#/app/billdscnttab/0//opbillsdscnt/0/';
    })()`
  });

  await new Promise(r => setTimeout(r, 2500));

  console.log('=== Step 2: Fetch Bills with Month Range to verify KPI cards and rows ===');
  const fetchRes = await send('Runtime.evaluate', {
    returnByValue: true,
    awaitPromise: true,
    expression: `(async () => {
      const tabEl = document.querySelector('.tabview');
      const sc = window.angular && tabEl ? window.angular.element(tabEl.querySelector('*') || tabEl).scope() : null;
      if (!sc) return { error: 'scope not found' };

      // Set FromBillDate to beginning of year to capture existing test data
      sc.currentfilter.FromBillDate = '2026-01-01 00:00:00';
      sc.currentfilter.ToBillDate = '2026-12-31 23:59:59';
      
      await new Promise(r => {
        const oldCb = sc.getListCallback;
        sc.getListCallback = function(scope, res, options, hasError) {
          if (oldCb) oldCb(scope, res, options, hasError);
          r(res ? res.Data : []);
        };
        sc.getList();
      });

      return {
        count: sc.OPBills?.length,
        facility: sc.currentfilter.FacilityId,
        sample: sc.OPBills?.map(b => ({
          billNo: b.BillNumber,
          date: b.BillDateTime,
          patient: b.Patient ? (b.Patient.FirstName + ' ' + (b.Patient.LastName || '')) : null,
          amount: b.BillAmount,
          paid: b.PaidAmount
        }))
      };
    })()`
  });

  console.log('Fetch Result:', JSON.stringify(fetchRes.result.value, null, 2));

  await new Promise(r => setTimeout(r, 1200));

  console.log('=== Step 3: Capture full-page screenshot of the modern React screen ===');
  const scr1 = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(
    '/Users/sharmila/.gemini/antigravity-ide/brain/10f529db-764b-4396-b01b-e4cb40958fff/.tempmediaStorage/bill_discount_react_screen_verified.png',
    Buffer.from(scr1.data, 'base64')
  );
  console.log('Saved bill_discount_react_screen_verified.png');

  console.log('=== Step 4: Click "Discount" button on row to verify modal opens ===');
  const clickRes = await send('Runtime.evaluate', {
    returnByValue: true,
    awaitPromise: true,
    expression: `(async () => {
      const discountBtns = Array.from(document.querySelectorAll('button')).filter(b => b.innerText.includes('Discount'));
      if (discountBtns.length === 0) return { error: 'No Discount button found' };
      discountBtns[0].click();
      return { clicked: true };
    })()`
  });

  console.log('Click Result:', clickRes.result.value);

  await new Promise(r => setTimeout(r, 2000));

  console.log('=== Step 5: Capture screenshot of the modal opened ===');
  const scr2 = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(
    '/Users/sharmila/.gemini/antigravity-ide/brain/10f529db-764b-4396-b01b-e4cb40958fff/.tempmediaStorage/bill_discount_modal_opened_from_react.png',
    Buffer.from(scr2.data, 'base64')
  );
  console.log('Saved bill_discount_modal_opened_from_react.png');

  ws.close();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
