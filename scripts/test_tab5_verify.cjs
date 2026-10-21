const WebSocket = globalThis.WebSocket;
const fs = require('fs');

async function testTab5() {
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

  console.log('Reloading page...');
  await send('Page.reload');
  await new Promise(r => setTimeout(r, 2500));

  console.log('Navigating to insurancebill...');
  await send('Runtime.evaluate', {
    expression: `window.angular.element(document.body).injector().get('$state').go('app.ipbillingtab.insurancebill', { id: 3783 });`
  });
  await new Promise(r => setTimeout(r, 2500));

  // Capture top view
  const ssTop = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('scripts/tab5_modern_top.png', Buffer.from(ssTop.data, 'base64'));
  console.log('Saved scripts/tab5_modern_top.png');

  // Scroll down to check footer & sticky bar
  await send('Runtime.evaluate', {
    expression: `window.scrollTo(0, document.body.scrollHeight);`
  });
  await new Promise(r => setTimeout(r, 500));

  const ssBottom = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('scripts/tab5_modern_bottom.png', Buffer.from(ssBottom.data, 'base64'));
  console.log('Saved scripts/tab5_modern_bottom.png');

  process.exit(0);
}

testTab5().catch(e => {
  console.error(e);
  process.exit(1);
});
