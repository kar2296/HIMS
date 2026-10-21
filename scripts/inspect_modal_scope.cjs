const http = require('http');
const WebSocket = require('ws');

async function main() {
  const targets = await new Promise((resolve, reject) => {
    http.get('http://localhost:9222/json', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });
  const pageTarget = targets.find(t => t.type === 'page' && !t.url.includes('chrome://'));
  const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);
  await new Promise(r => ws.on('open', r));

  let id = 1;
  const send = (method, params = {}) => new Promise((resolve) => {
    const msgId = id++;
    const handler = (data) => {
      const msg = JSON.parse(data);
      if (msg.id === msgId) {
        ws.off('message', handler);
        resolve(msg.result);
      }
    };
    ws.on('message', handler);
    ws.send(JSON.stringify({ id: msgId, method, params }));
  });

  const res = await send('Runtime.evaluate', {
    expression: `(() => {
      const rows = Array.from(document.querySelectorAll('table#tblData tr')).map(r => r.innerText);
      const lisCtrl = document.querySelector('[ng-controller*="lisordertat"], .modal-content [ng-controller], .modal-body, .modal-header');
      let scopeData = null;
      const allModalEls = Array.from(document.querySelectorAll('.modal *'));
      for (const el of allModalEls) {
        const s = window.angular ? window.angular.element(el).scope() : null;
        if (s && s.PreviousOrderDetails) {
          scopeData = {
            PreviousOrderDetails: s.PreviousOrderDetails,
            currentcontext: s.currentcontext
          };
          break;
        }
      }
      return { rows, scopeData };
    })()`,
    returnByValue: true
  });
  console.log('Result:', JSON.stringify(res.result.value, null, 2));

  ws.close();
}

main().catch(console.error);
