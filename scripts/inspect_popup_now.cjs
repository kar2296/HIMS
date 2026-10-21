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
  if (!page) {
    console.log('No 5174 page found!');
    return;
  }
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

  console.log('1. Page URL:', (await send('Runtime.evaluate', { expression: 'location.href' })).result.value);

  // Check if Add New modal is open
  const modalOpen = await send('Runtime.evaluate', {
    expression: 'Boolean(document.querySelector(".hims-modal-container"))'
  });
  console.log('2. Modal open?', modalOpen.result.value);

  if (!modalOpen.result.value) {
    console.log('Modal not open, opening via button or location...');
    await send('Runtime.evaluate', {
      expression: `(() => {
        const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText && b.innerText.includes('Add New'));
        if (btn) btn.click();
      })()`
    });
    await new Promise(r => setTimeout(r, 1500));
  }

  // Inspect desc0 and type cbc
  console.log('3. Triggering cbc search on desc0...');
  const searchResult = await send('Runtime.evaluate', {
    awaitPromise: true,
    expression: `(async () => {
      const inp = document.getElementById('desc0');
      if (!inp) return { err: 'no desc0' };

      const ngEl = angular.element(inp);
      const cvm = ngEl.controller('autosearch');
      if (!cvm) return { err: 'no cvm' };

      // Call searchItem
      const results = await cvm.searchItem('cbc');

      return {
        hasCvm: true,
        resultsLength: results ? results.length : 0,
        sampleResults: (results || []).slice(0, 3).map(r => ({
          Id: r.Id,
          Name: r.Name,
          Rate: r.Rate,
          ServiceItemRate: r.ServiceItemRate
        }))
      };
    })()`,
    returnByValue: true
  });
  console.log('4. Service search API result:', JSON.stringify(searchResult.result.value, null, 2));

  // Now inspect what elements are created when cvm.autosearchdisplay = 'cbc' and digest runs
  console.log('5. Triggering typeahead popup in UI...');
  const uiCheck = await send('Runtime.evaluate', {
    awaitPromise: true,
    expression: `(async () => {
      const inp = document.getElementById('desc0');
      inp.focus();
      const ngEl = angular.element(inp);
      const ngModel = ngEl.controller('ngModel');
      
      ngModel.$setViewValue('cbc');
      ngModel.$commitViewValue();
      inp.value = 'cbc';
      inp.dispatchEvent(new Event('input', { bubbles: true }));

      await new Promise(r => setTimeout(r, 1000));

      const popups = document.querySelectorAll('.uib-typeahead-popup, .custom-popup-wrapper, ul.dropdown-menu');
      return Array.from(popups).map(p => ({
        tag: p.tagName,
        className: p.className,
        style: p.getAttribute('style'),
        rect: p.getBoundingClientRect(),
        display: window.getComputedStyle(p).display,
        visibility: window.getComputedStyle(p).visibility,
        matches: p.querySelectorAll('tr, li').length,
        htmlSnippet: p.outerHTML.substring(0, 300)
      }));
    })()`,
    returnByValue: true
  });
  console.log('6. UI Popups found:', JSON.stringify(uiCheck.result.value, null, 2));

  const shot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('/Users/sharmila/.gemini/antigravity-ide/brain/adff7622-89a9-4f40-bdb1-4d3d4f1af2a7/test_popup_inspect.png', Buffer.from(shot.data, 'base64'));
  console.log('Screenshot saved to test_popup_inspect.png');

  ws.close();
}

main().catch(console.error);
