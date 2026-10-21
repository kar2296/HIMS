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

  console.log('Reloading page with ignoreCache: true...');
  await send('Page.reload', { ignoreCache: true });
  await new Promise(r => setTimeout(r, 4500));

  const check = await send('Runtime.evaluate', {
    expression: `(() => {
      const el = document.querySelector('.samplereview-form-wrapper') || document.querySelector('[ui-view]');
      const scope = angular.element(el || document.body).scope();
      return {
        hasRefreshReactProps: typeof scope.refreshReactProps === 'function',
        reactProps: scope.reactProps ? {
          sampleId: scope.reactProps.sampleId,
          detailsCount: scope.reactProps.details ? scope.reactProps.details.length : 0,
          sampleRows: (scope.reactProps.details || []).map(d => ({
            id: d.Id,
            testName: d.TestName,
            status: d.SampleStatus,
            volume: d.SampleVolume,
            sampleId: d.SampleIdentifier
          }))
        } : null
      };
    })()`,
    returnByValue: true
  });
  console.log('RELOAD RESULT:', JSON.stringify(check.result.value, null, 2));

  ws.close();
}
main().catch(console.error);
