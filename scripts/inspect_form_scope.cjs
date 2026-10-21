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
      const el = document.querySelector('.samplereview-form-wrapper') || document.querySelector('react-component[name="SampleReviewFormScreen"]');
      const scope = angular.element(el || document.body).scope();
      if (!scope) return 'no scope';
      return {
        url: window.location.href,
        currentcontext: scope.currentcontext,
        detailsLength: scope.details ? scope.details.length : 0,
        detailsSample: (scope.details || []).slice(0, 2),
        item: scope.item ? { Id: scope.item.Id, PatientId: scope.item.PatientId } : null,
        reactProps: scope.reactProps ? {
          sampleId: scope.reactProps.sampleId,
          detailsCount: scope.reactProps.details ? scope.reactProps.details.length : 0,
          detailsSample: (scope.reactProps.details || []).slice(0, 2),
          patient: scope.reactProps.patient,
          orderInfo: scope.reactProps.orderInfo
        } : null
      };
    })()`,
    returnByValue: true
  });
  console.log('SCOPE CHECK:', JSON.stringify(check.result.value, null, 2));

  ws.close();
}
main().catch(console.error);
