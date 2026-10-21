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

  const modalDebug = await send('Runtime.evaluate', {
    expression: `(() => {
      const modal = document.querySelector('.modal');
      if (!modal) return 'no modal in dom';
      const all = Array.from(modal.querySelectorAll('*'));
      for (const el of all) {
        const s = window.angular ? window.angular.element(el).scope() : null;
        if (s && (s.currentcontext || s.ordertat || s.reactProps)) {
          return {
            tag: el.tagName,
            className: el.className,
            currentcontext: s.currentcontext,
            ordertatLen: s.ordertat ? s.ordertat.length : undefined,
            ordertatSample: s.ordertat ? s.ordertat.slice(0, 2).map(x => ({ TestName: x.TestName, id: x.Id })) : null,
            isLoading: s.isLoading,
            reactProps: s.reactProps
          };
        }
      }
      return 'not found in modal elements, total elements: ' + all.length;
    })()`,
    returnByValue: true
  });

  console.log('Modal Debug:', JSON.stringify(modalDebug.result.value, null, 2));

  ws.close();
}

main().catch(console.error);
