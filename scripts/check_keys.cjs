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

  await send('Page.enable');
  await send('Runtime.enable');

  const check = await send('Runtime.evaluate', {
    expression: `(() => {
      const el = document.querySelector('.samplereview-form-wrapper') || document.querySelector('[ui-view]');
      const scope = angular.element(el || document.body).scope();
      return {
        scopeKeys: Object.keys(scope).filter(k => !k.startsWith('$')),
        vmKeys: scope.vm ? Object.keys(scope.vm) : null
      };
    })()`,
    returnByValue: true
  });
  console.log('KEYS:', JSON.stringify(check.result.value, null, 2));

  ws.close();
}
main().catch(console.error);
