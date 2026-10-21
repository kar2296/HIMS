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

  console.log('1. Clicking "Details" tab...');
  await send('Runtime.evaluate', {
    expression: `(() => {
      const detailsTab = Array.from(document.querySelectorAll('a, button, span, li')).find(el => el.innerText && el.innerText.trim() === 'Details');
      if (detailsTab) detailsTab.click();
    })()`
  });
  await new Promise(r => setTimeout(r, 2000));

  console.log('2. Clicking "Add New"...');
  await send('Runtime.evaluate', {
    expression: `(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText && b.innerText.includes('Add New'));
      if (btn) btn.click();
    })()`
  });
  await new Promise(r => setTimeout(r, 2000));

  console.log('3. Triggering search for "cbc"...');
  const searchEval = await send('Runtime.evaluate', {
    awaitPromise: true,
    expression: `(async () => {
      const inp = document.getElementById('desc0');
      if (!inp) return { error: 'desc0 not found' };
      inp.focus();

      const ngEl = angular.element(inp);
      const ngModel = ngEl.controller('ngModel');
      const cvm = ngEl.controller('autosearch');

      ngModel.$setViewValue('cbc');
      ngModel.$commitViewValue();
      inp.value = 'cbc';
      inp.dispatchEvent(new Event('input', { bubbles: true }));

      if (cvm) {
        await cvm.searchItem('cbc');
      }

      await new Promise(r => setTimeout(r, 1200));

      const popup = document.querySelector('.custom-popup-wrapper:not(.ng-hide)');
      const matches = document.querySelectorAll('.uib-typeahead-match');
      const tbl = document.getElementById('profile_billdropdown');

      return {
        hasPopup: !!popup,
        popupComputedHeight: popup ? window.getComputedStyle(popup).height : null,
        popupComputedOverflow: popup ? window.getComputedStyle(popup).overflowY : null,
        tableComputedOverflow: tbl ? window.getComputedStyle(tbl).overflow : null,
        matchesCount: matches.length,
        match1: matches[0] ? matches[0].innerText.trim().replace(/\\s+/g, ' ') : null,
        match2: matches[1] ? matches[1].innerText.trim().replace(/\\s+/g, ' ') : null
      };
    })()`,
    returnByValue: true
  });
  console.log('Search Evaluation:', JSON.stringify(searchEval.result.value, null, 2));

  console.log('4. Capturing fresh autocomplete screenshot...');
  const ss1 = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('/Users/sharmila/.gemini/antigravity-ide/brain/adff7622-89a9-4f40-bdb1-4d3d4f1af2a7/service_autocomplete_live.png', Buffer.from(ss1.data, 'base64'));

  console.log('5. Selecting first item (CBC)...');
  const selectEval = await send('Runtime.evaluate', {
    awaitPromise: true,
    expression: `(async () => {
      const match = document.querySelector('.uib-typeahead-match');
      if (match) {
        match.click();
      } else {
        const inp = document.getElementById('desc0');
        const cvm = angular.element(inp).controller('autosearch');
        if (cvm && cvm.config && cvm.config.result && cvm.config.result[0]) {
          cvm.OnSelectItem(cvm.config.result[0]);
        }
      }

      await new Promise(r => setTimeout(r, 1200));

      const modalEl = document.querySelector('.hims-modal-container');
      const scope = angular.element(modalEl).scope();
      const details = scope && scope.PatientBillDetails;

      return {
        detailsCount: details ? details.length : 0,
        firstRow: details && details[0] ? {
          ServiceId: details[0].ServiceId,
          ServiceName: details[0].ServiceName,
          UnitPrice: details[0].UnitPrice,
          Rate: details[0].Rate,
          Quantity: details[0].Quantity,
          NetAmount: details[0].NetAmount,
          DoctorId: details[0].DoctorId
        } : null,
        totalNet: scope ? scope.TotalNet : null
      };
    })()`,
    returnByValue: true
  });
  console.log('Select Evaluation:', JSON.stringify(selectEval.result.value, null, 2));

  console.log('6. Capturing fresh selected screenshot...');
  const ss2 = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('/Users/sharmila/.gemini/antigravity-ide/brain/adff7622-89a9-4f40-bdb1-4d3d4f1af2a7/service_selected_live.png', Buffer.from(ss2.data, 'base64'));

  console.log('DONE!');
  ws.close();
}

main().catch(console.error);
