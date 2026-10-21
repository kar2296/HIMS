const http = require('http');
const WebSocket = require('ws');

async function main() {
  const targets = await new Promise((resolve, reject) => {
    http.get('http://localhost:9222/json', res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });

  const pageTarget = targets.find(t => t.url && t.url.includes('localhost:5174'));
  if (!pageTarget) {
    console.log('No localhost:5174 page target found!');
    return;
  }
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
    ws.send(JSON.stringify({ id: msgId, method, params }));
  });

  const evalCode = async (expr) => {
    const res = await send('Runtime.evaluate', {
      expression: expr,
      returnByValue: true,
      awaitPromise: true
    });
    return res.result ? res.result.value : null;
  };

  console.log('1. Checking page state...');
  const state = await evalCode(`(() => {
    const input = document.getElementById('desc0');
    if (!input) return { error: 'desc0 not found' };
    const ngEl = angular.element(input);
    const scope = ngEl.scope();
    const ctrl = scope ? (scope.cvm || (scope.$parent && scope.$parent.cvm)) : null;
    return {
      inputValue: input.value,
      hasScope: !!scope,
      hasCtrl: !!ctrl,
      cvmSearchVal: ctrl ? ctrl.autosearchdisplay : null
    };
  })()`);
  console.log('State:', state);

  // Type cbc into desc0
  console.log('2. Simulating typing "cbc" into desc0...');
  const typeRes = await evalCode(`(async () => {
    const input = document.getElementById('desc0');
    input.focus();
    input.value = 'cbc';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
    const ngEl = angular.element(input);
    const ngModel = ngEl.controller('ngModel');
    if (ngModel) {
      ngModel.$setViewValue('cbc');
      ngModel.$commitViewValue();
      ngModel.$render();
    }
    ngEl.scope().$apply();
    
    // Wait 500ms for debounce/async service call
    await new Promise(r => setTimeout(r, 600));

    const popups = Array.from(document.querySelectorAll('.custom-popup-wrapper'));
    return {
      popupsCount: popups.length,
      popupsInfo: popups.map(p => ({
        offsetParent: !!p.offsetParent,
        styleDisplay: p.style.display,
        classList: Array.from(p.classList),
        ariaHidden: p.getAttribute('aria-hidden'),
        matchesCount: p.querySelectorAll('tr.uib-typeahead-match').length,
        rect: p.getBoundingClientRect(),
        computedDisplay: window.getComputedStyle(p).display,
        computedVisibility: window.getComputedStyle(p).visibility,
        computedZIndex: window.getComputedStyle(p).zIndex,
        firstRowText: p.querySelector('tr.uib-typeahead-match') ? p.querySelector('tr.uib-typeahead-match').innerText : null
      }))
    };
  })()`);
  console.log('Type result:', JSON.stringify(typeRes, null, 2));

  // Take screenshot
  const fs = require('fs');
  const shot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('/Users/sharmila/.gemini/antigravity-ide/brain/adff7622-89a9-4f40-bdb1-4d3d4f1af2a7/test_dropdown_active.png', Buffer.from(shot.data, 'base64'));
  console.log('Screenshot saved to test_dropdown_active.png');

  ws.close();
}

main().catch(console.error);
