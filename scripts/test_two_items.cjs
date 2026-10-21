const http = require('http');
const WebSocket = require('ws');
const fs = require('fs');

async function main() {
  const targets = await new Promise((resolve, reject) => {
    http.get('http://127.0.0.1:9222/json', res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });

  const page = targets.find(t => t.url && t.url.includes('localhost:5174') && t.type === 'page');
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise(r => ws.on('open', r));

  let reqId = 1;
  const send = (method, params = {}) => new Promise((resolve, reject) => {
    const id = reqId++;
    const onMsg = (raw) => {
      const msg = JSON.parse(raw);
      if (msg.id === id) {
        ws.removeListener('message', onMsg);
        if (msg.error) reject(new Error(JSON.stringify(msg.error)));
        else resolve(msg.result);
      }
    };
    ws.on('message', onMsg);
    ws.send(JSON.stringify({ id, method, params }));
  });

  console.log('Typing "ecg" into desc1...');
  const searchRes = await send('Runtime.evaluate', {
    awaitPromise: true,
    expression: `(async () => {
      const inp = document.getElementById('desc1');
      if (!inp) return { error: 'desc1 not found' };
      inp.focus();

      const ngEl = angular.element(inp);
      const ngModel = ngEl.controller('ngModel');
      const cvm = ngEl.controller('autosearch');

      ngModel.$setViewValue('ecg');
      ngModel.$commitViewValue();
      inp.value = 'ecg';
      inp.dispatchEvent(new Event('input', { bubbles: true }));

      if (cvm) {
        await cvm.searchItem('ecg');
      }

      await new Promise(r => setTimeout(r, 1200));

      const matches = Array.from(document.querySelectorAll('.uib-typeahead-match'));
      return {
        matchesCount: matches.length,
        matchTexts: matches.map(m => m.innerText.trim().replace(/\\s+/g, ' ')).slice(0, 3)
      };
    })()`,
    returnByValue: true
  });
  console.log('Search matches for ECG:', JSON.stringify(searchRes.result.value, null, 2));

  console.log('Clicking first ECG match...');
  const selectRes = await send('Runtime.evaluate', {
    awaitPromise: true,
    expression: `(async () => {
      // Find visible match
      const matches = Array.from(document.querySelectorAll('.custom-popup-wrapper:not(.ng-hide) .uib-typeahead-match'));
      const targetMatch = matches[0] || document.querySelector('.uib-typeahead-match');
      if (targetMatch) {
        targetMatch.click();
      }

      await new Promise(r => setTimeout(r, 1200));

      const modalEl = document.querySelector('.hims-modal-container');
      const scope = angular.element(modalEl).scope();
      const details = scope && scope.PatientBillDetails;

      return {
        detailsCount: details ? details.length : 0,
        rows: (details || []).map(d => ({
          ServiceId: d.ServiceId,
          ServiceName: d.ServiceName,
          UnitPrice: d.UnitPrice,
          Rate: d.Rate,
          Quantity: d.Quantity,
          NetAmount: d.NetAmount
        })),
        totalNet: scope ? scope.TotalNet : null
      };
    })()`,
    returnByValue: true
  });
  console.log('Select Result:', JSON.stringify(selectRes.result.value, null, 2));

  const ss = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('/Users/sharmila/.gemini/antigravity-ide/brain/adff7622-89a9-4f40-bdb1-4d3d4f1af2a7/two_items_verified.png', Buffer.from(ss.data, 'base64'));
  console.log('Screenshot saved to two_items_verified.png');

  ws.close();
}

main().catch(console.error);
