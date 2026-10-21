const http = require('http');
const WebSocket = require('ws');

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

  const res = await send('Runtime.evaluate', {
    returnByValue: true,
    expression: `(() => {
      const card = document.querySelector(".hims-table-card");
      const sum = document.querySelector(".hims-summary-bar");
      const ftr = document.querySelector(".hims-modal-footer-bar");
      const body = document.querySelector(".hims-modal-body-content");
      const popup = document.querySelector(".custom-popup-wrapper:not(.ng-hide)");
      const toObj = (r) => r ? ({ top: r.top, bottom: r.bottom, left: r.left, right: r.right, width: r.width, height: r.height }) : null;
      return {
        card: card ? { z: window.getComputedStyle(card).zIndex, pos: window.getComputedStyle(card).position, rect: toObj(card.getBoundingClientRect()) } : null,
        sum: sum ? { z: window.getComputedStyle(sum).zIndex, pos: window.getComputedStyle(sum).position, rect: toObj(sum.getBoundingClientRect()) } : null,
        ftr: ftr ? { z: window.getComputedStyle(ftr).zIndex, pos: window.getComputedStyle(ftr).position, rect: toObj(ftr.getBoundingClientRect()) } : null,
        popup: popup ? { z: window.getComputedStyle(popup).zIndex, pos: window.getComputedStyle(popup).position, rect: toObj(popup.getBoundingClientRect()) } : null
      };
    })()`
  });

  console.log('Z-Indexes:', JSON.stringify(res.result.value, null, 2));
  ws.close();
}

main().catch(console.error);
