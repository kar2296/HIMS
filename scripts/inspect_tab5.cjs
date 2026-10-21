const WebSocket = globalThis.WebSocket;
const fs = require('fs');

async function inspectTab5() {
  const tabsRes = await fetch('http://127.0.0.1:9222/json');
  const tabs = await tabsRes.json();
  const pageTab = tabs.find(t => t.url && t.url.includes('5174'));
  if (!pageTab) {
    console.error('No tab found on 5174');
    process.exit(1);
  }
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

  // Navigate to insurancebill
  console.log('Navigating to insurancebill via $state.go...');
  await send('Runtime.evaluate', {
    expression: `window.angular.element(document.body).injector().get('$state').go('app.ipbillingtab.insurancebill', { id: 3783 });`
  });
  await new Promise(r => setTimeout(r, 3000));

  const barCheck = await send('Runtime.evaluate', {
    returnByValue: true,
    expression: `(() => {
      const bar = document.querySelector('react-component[name="IpBillingCorrectionsActionBar"]');
      if (!bar) return { error: 'No bar found' };
      const rect = bar.getBoundingClientRect();
      bar.scrollIntoView({ behavior: 'instant', block: 'end' });
      return {
        top: rect.top,
        bottom: rect.bottom,
        height: rect.height,
        text: bar.innerText,
        html: bar.innerHTML
      };
    })()`
  });

  console.log('Bar check:', JSON.stringify(barCheck.result?.value, null, 2));

  await new Promise(r => setTimeout(r, 500));
  const ss = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('scripts/tab5_scrolled.png', Buffer.from(ss.data, 'base64'));
  console.log('Screenshot saved to scripts/tab5_scrolled.png');
  process.exit(0);
}

inspectTab5().catch(e => {
  console.error(e);
  process.exit(1);
});
