const WebSocket = globalThis.WebSocket;
const fs = require('fs');

async function testDischarged() {
  const tabsRes = await fetch('http://127.0.0.1:9222/json');
  const tabs = await tabsRes.json();
  const pageTab = tabs.find(t => t.url && t.url.includes('5174'));
  const ws = new WebSocket(pageTab.webSocketDebuggerUrl);

  let id = 1;
  const send = (method, params = {}) => new Promise((resolve) => {
    const curId = id++;
    const handler = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.id === curId) {
        ws.removeEventListener('message', handler);
        resolve(msg.result);
      }
    };
    ws.addEventListener('message', handler);
    ws.send(JSON.stringify({ id: curId, method, params }));
  });

  await new Promise(r => ws.onopen = r);

  console.log('Navigating to app.discharged-patients...');
  await send('Runtime.evaluate', {
    expression: `window.angular.element(document.body).injector().get('$state').go('app.discharged-patients');`
  });
  await new Promise(r => setTimeout(r, 3000));

  const pageInfo = await send('Runtime.evaluate', {
    returnByValue: true,
    expression: `(() => {
      return {
        url: window.location.href,
        title: document.title,
        hasBridgeGridScreen: !!document.querySelector('react-component[name="BridgeGridScreen"]'),
        bridgeGridChildren: document.querySelector('react-component[name="BridgeGridScreen"]')?.children?.length || 0,
        filtersCount: document.querySelectorAll('.input-group').length,
        footerBgs: !!document.querySelector('.fooder-bgs'),
        pagination: !!document.querySelector('ul[uib-pagination]'),
        gridRows: document.querySelectorAll('.rz-grid-row, .ui-grid-row, tr').length
      };
    })()`
  });

  console.log('Page info:', JSON.stringify(pageInfo.result?.value, null, 2));

  const ss = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('scripts/discharged_patients_current.png', Buffer.from(ss.data, 'base64'));
  console.log('Saved scripts/discharged_patients_current.png');

  process.exit(0);
}

testDischarged().catch(e => {
  console.error(e);
  process.exit(1);
});
