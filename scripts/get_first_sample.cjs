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

  await send('Runtime.evaluate', {
    expression: 'window.location.href = "http://localhost:5173/#/app/samplereviewlist";'
  });
  await new Promise(r => setTimeout(r, 3500));

  const info = await send('Runtime.evaluate', {
    expression: `(() => {
      const el = document.querySelector('react-component[name="SampleReviewListScreen"]');
      const scope = angular.element(el || document.body).scope();
      if (!scope) return 'no scope';
      return {
        listLength: scope.list ? scope.list.length : 0,
        items: (scope.list || []).slice(0, 5).map(i => ({
          Id: i.Id,
          PatientOrderId: i.PatientOrderId,
          OrderNumber: i.OrderNumber,
          PatientName: i.PatientName,
          SampleStatus: i.SampleStatus ? i.SampleStatus.Description : i.SampleStatusId
        }))
      };
    })()`,
    returnByValue: true
  });
  console.log('INFO:', JSON.stringify(info.result.value, null, 2));

  ws.close();
}
main().catch(console.error);
