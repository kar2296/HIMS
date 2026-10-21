const WebSocket = require('ws');

async function testWithBrowserToken() {
  const res = await fetch('http://localhost:9222/json');
  const pages = await res.json();
  const page = pages.find(p => p.type === 'page' && !p.url.includes('chrome://') && !p.url.includes('omnibox'));
  const ws = new WebSocket(page.webSocketDebuggerUrl);
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
    returnByValue: true,
    awaitPromise: true,
    expression: `(async () => {
      try {
        const injector = angular.element(document.body).injector();
        const utl = injector ? injector.get('utl') : null;
        if (!utl) return { error: 'No utl service' };
        
        return await new Promise((resolve) => {
          utl.Http.doAction({
            action: 'lis/patientworkorder/GetPatientWorkorders',
            data: {
              Params: [
                { Key: 3, Value: null },
                { Key: 28, Value: null },
                { Key: 32, Value: null },
                { Key: 6, Value: 1 },
                { Key: 38, Value: null },
                { Key: 39, Value: null },
                { Key: 29, Value: utl.Session.getCurrentFacilityId() },
                { Key: 23, Value: null },
                { Key: 35, Value: null }
              ],
              PageContext: { PageSize: 5, PageNumber: 1 }
            },
            type: 'post',
            onComplete: (scope, res) => resolve(res)
          });
        });
      } catch (e) {
        return { error: e.message, stack: e.stack };
      }
    })()`
  });

  console.log('Result from utl.Http:', JSON.stringify(apiRes.result?.value, null, 2));
  ws.close();
}
testWithBrowserToken().catch(console.error);
