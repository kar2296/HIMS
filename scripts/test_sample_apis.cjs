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

  const testApi = await send('Runtime.evaluate', {
    expression: `new Promise((resolve) => {
      const injector = angular.element(document.body).injector();
      const utl = injector.get('utl');
      utl.Http.doAction({
        action: 'lis/WorkOrderSample/GetWorkOrderSampleById',
        data: { Id: 6674 },
        type: 'post',
        onComplete: (scope, res) => {
          utl.Http.doAction({
            action: 'lis/WorkOrderSampleDetail/GetWorkOrderSampleDetails',
            data: { Params: [{ Key: 1, Value: 6674 }] },
            type: 'post',
            onComplete: (scope2, res2) => {
              resolve({ sample: res, details: res2 });
            }
          });
        }
      });
    })`,
    awaitPromise: true,
    returnByValue: true
  });

  console.log('API RESULT:', JSON.stringify(testApi.result.value, null, 2));

  ws.close();
}
main().catch(console.error);
