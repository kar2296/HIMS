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

  const apiRes = await send('Runtime.evaluate', {
    expression: `new Promise((resolve) => {
      const injector = angular.element(document.body).injector();
      const utl = injector.get('utl');
      utl.Http.doAction({
        action: 'lis/ordertat/GetOrderTATs',
        data: {
          Params: [
            { Key: 4, Value: 2016 },
            { Key: 5, Value: 5672 }
          ],
          PageContext: { PageSize: 500, PageNumber: 1 }
        },
        type: 'post',
        onComplete: (scope, res) => {
          resolve(res);
        }
      });
    })`,
    awaitPromise: true,
    returnByValue: true
  });

  console.log('API Result:', JSON.stringify({
    total: apiRes.result.value?.Data?.length,
    tests: apiRes.result.value?.Data?.map(d => ({
      TestName: d.TestName,
      OrderedOn: d.OrderedOn,
      AcceptedOn: d.AcceptedOn,
      SampleCollectedOn: d.SampleCollectedOn,
      Doctor: d.Doctor?.FirstName,
      Patient: d.Patient?.FirstName,
      PatientOrderNumber: d.PatientOrder?.OrderNumber,
      OrderRequestDate: d.PatientOrder?.OrderRequestDate
    }))
  }, null, 2));

  ws.close();
}

main().catch(console.error);
