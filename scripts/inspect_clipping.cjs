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

  const clipCheck = await send('Runtime.evaluate', {
    awaitPromise: true,
    expression: `(() => {
      const activePopup = Array.from(document.querySelectorAll('.custom-popup-wrapper')).find(p => p.offsetParent !== null && !p.classList.contains('ng-hide'));
      if (!activePopup) return { err: 'no active popup' };

      const popupRect = activePopup.getBoundingClientRect();
      const ancestors = [];
      let cur = activePopup.parentElement;
      while (cur && cur !== document.body) {
        const style = window.getComputedStyle(cur);
        ancestors.push({
          tag: cur.tagName,
          id: cur.id,
          className: cur.className,
          overflow: style.overflow,
          overflowX: style.overflowX,
          overflowY: style.overflowY,
          position: style.position,
          zIndex: style.zIndex,
          maxHeight: style.maxHeight,
          height: style.height,
          rect: cur.getBoundingClientRect()
        });
        cur = cur.parentElement;
      }
      return {
        popupRect,
        ancestors
      };
    })()`,
    returnByValue: true
  });
  console.log('Clip Check Results:', JSON.stringify(clipCheck.result.value, null, 2));

  ws.close();
}

main().catch(console.error);
