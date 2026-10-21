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

  const test = await send('Runtime.evaluate', {
    expression: `(() => {
      const el = document.querySelector('.samplereview-form-wrapper') || document.body;
      const scope = angular.element(el).scope();
      try {
        scope.refreshReactProps();
        return { success: true, reactProps: scope.reactProps ? { sampleId: scope.reactProps.sampleId, details: scope.reactProps.details.length } : null };
      } catch (err) {
        return { success: false, error: err.message, stack: err.stack };
      }
    })()`,
    returnByValue: true
  });
  console.log('REFRESH RESULT:', JSON.stringify(test.result.value, null, 2));

  ws.close();
}
main().catch(console.error);
