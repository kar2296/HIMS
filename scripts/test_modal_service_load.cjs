const http = require('http');
const WebSocket = require('ws');
const fs = require('fs');

async function main() {
  const targets = await new Promise((resolve, reject) => {
    http.get('http://localhost:9222/json', res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });

  const pageTarget = targets.find(t => t.url && t.url.includes('localhost:5174') && t.type === 'page');
  const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);
  await new Promise(r => ws.on('open', r));

  let id = 1;
  const send = (method, params = {}) => new Promise((resolve, reject) => {
    const msgId = id++;
    const handler = (data) => {
      const msg = JSON.parse(data);
      if (msg.id === msgId) {
        ws.off('message', handler);
        if (msg.error) reject(msg.error);
        else resolve(msg.result);
      }
    };
    ws.on('message', handler);
    ws.send(JSON.stringify({ id: msgId, method, params }));
  });

  console.log('Logging in if needed...');
  await send('Runtime.evaluate', {
    awaitPromise: true,
    expression: `(async () => {
      if (window.location.hash.includes('login') || document.querySelector('input[type="password"]')) {
        const u = document.getElementById('login-username') || document.querySelector('input[name="username"], input[type="text"]');
        const p = document.getElementById('login-password') || document.querySelector('input[name="password"], input[type="password"]');
        const submitBtn = document.querySelector('button[type="submit"], button.btn-primary') || Array.from(document.querySelectorAll('button')).find(b => b.innerText && (b.innerText.includes('Sign in') || b.innerText.includes('Login')));
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
    })()`
  });

  console.log('Navigating to #/app/ipbillingtab/3783/ipbilldetails...');
  await send('Runtime.evaluate', {
    expression: `window.location.hash = '#/app/ipbillingtab/3783/ipbilldetails'`
  });
  await new Promise(r => setTimeout(r, 2500));

  console.log('Clicking Add New...');
  await send('Runtime.evaluate', {
    expression: `(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText && b.innerText.includes('Add New'));
      if (btn) btn.click();
    })()`
  });
  await new Promise(r => setTimeout(r, 1500));

  console.log('Typing cbc into desc0...');
  const searchEval = await send('Runtime.evaluate', {
    awaitPromise: true,
    expression: `(async () => {
      const inp = document.getElementById('desc0');
      if (!inp) return { error: 'desc0 not found' };
      inp.focus();

      const ngEl = angular.element(inp);
      const ngModel = ngEl.controller('ngModel');
      const cvm = ngEl.controller('autosearch');

      // Trigger typeahead search via ngModel
      ngModel.$setViewValue('cbc');
      ngModel.$commitViewValue();
      inp.dispatchEvent(new Event('input', { bubbles: true }));
      inp.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true, key: 'c' }));

      // Also trigger cvm.searchItem directly if needed
      if (cvm) {
        await cvm.searchItem('cbc');
      }

      await new Promise(r => setTimeout(r, 1200));

      const matches = Array.from(document.querySelectorAll('.uib-typeahead-match'));
      return {
        inputValue: inp.value,
        matchesCount: matches.length,
        matchTexts: matches.map(m => m.innerText.trim().replace(/\\s+/g, ' ')).slice(0, 5)
      };
    })()`,
    returnByValue: true
  });
  console.log('Search Eval Result:', JSON.stringify(searchEval.result.value, null, 2));

  console.log('Capturing dropdown screenshot...');
  const ss1 = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('/Users/sharmila/Rajesh/my-app/cbc_dropdown_verified.png', Buffer.from(ss1.data, 'base64'));

  console.log('Selecting first match in dropdown...');
  const selectEval = await send('Runtime.evaluate', {
    awaitPromise: true,
    expression: `(async () => {
      const match = document.querySelector('.uib-typeahead-match');
      if (match) {
        match.click();
      } else {
        // Fallback: programmatically select on cvm
        const inp = document.getElementById('desc0');
        const cvm = angular.element(inp).controller('autosearch');
        if (cvm && cvm.config && cvm.config.result && cvm.config.result[0]) {
          cvm.OnSelectItem(cvm.config.result[0]);
        }
      }

      await new Promise(r => setTimeout(r, 1200));

      // Read form state
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
  console.log('Select Eval Result:', JSON.stringify(selectEval.result.value, null, 2));

  console.log('Capturing selected screenshot...');
  const ss2 = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('/Users/sharmila/Rajesh/my-app/cbc_selected_verified.png', Buffer.from(ss2.data, 'base64'));

  ws.close();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
