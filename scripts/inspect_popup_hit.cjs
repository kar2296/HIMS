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

  const elementCheck = await send('Runtime.evaluate', {
    returnByValue: true,
    expression: `(() => {
      const popup = document.querySelector(".custom-popup-wrapper:not(.ng-hide)");
      if (!popup) return "no popup";
      const r = popup.getBoundingClientRect();
      const points = [
        { desc: 'top-left of popup', x: r.left + 50, y: r.top + 20 },
        { desc: 'middle of popup', x: r.left + 50, y: r.top + 100 },
        { desc: 'bottom of popup', x: r.left + 50, y: r.top + 200 }
      ];

      return points.map(pt => {
        const el = document.elementFromPoint(pt.x, pt.y);
        return {
          point: pt,
          hitElement: el ? {
            tag: el.tagName,
            className: el.className,
            id: el.id,
            outerSnippet: el.outerHTML.substring(0, 100)
          } : null,
          isInsidePopup: el ? popup.contains(el) : false
        };
      });
    })()`
  });

  console.log('Element from point:', JSON.stringify(elementCheck.result.value, null, 2));
  ws.close();
}

main().catch(console.error);
