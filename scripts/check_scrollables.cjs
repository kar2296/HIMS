const http = require('http');
const WebSocket = require('ws');

async function check() {
  const targets = await new Promise((resolve, reject) => {
    http.get('http://localhost:9222/json', res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });

  const pageTarget = targets.find(t => t.url.includes('localhost:5174'));
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

  const res = await send('Runtime.evaluate', {
    returnByValue: true,
    expression: `
      (() => {
        return {
          windowInnerHeight: window.innerHeight,
          bodyScrollHeight: document.body.scrollHeight,
          docElementScrollHeight: document.documentElement.scrollHeight,
          allScrollable: Array.from(document.querySelectorAll('*'))
            .filter(el => el.scrollHeight > el.clientHeight)
            .map(el => ({
              tag: el.tagName,
              cls: el.className,
              ch: el.clientHeight,
              sh: el.scrollHeight,
              st: el.scrollTop,
              overflowY: window.getComputedStyle(el).overflowY
            }))
        };
      })()
    `
  });

  console.log(JSON.stringify(res.result.value, null, 2));
  ws.close();
}

check().catch(console.error);
