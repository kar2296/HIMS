const WebSocket = globalThis.WebSocket;
const fs = require('fs');

async function inspectTab6() {
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

  console.log('Navigating to pharmacybillmodify...');
  await send('Runtime.evaluate', {
    expression: `window.angular.element(document.body).injector().get('$state').go('app.ipbillingtab.pharmacybillmodify', { id: 3783 });`
  });
  await new Promise(r => setTimeout(r, 2500));

  const barCheck = await send('Runtime.evaluate', {
    returnByValue: true,
    expression: `(() => {
      const bar = document.querySelector('react-component[name="IpBillingCorrectionsActionBar"]');
      if (bar) bar.scrollIntoView({ behavior: 'instant', block: 'end' });
      return {
        found: !!bar,
        text: bar ? bar.innerText : null
      };
    })()`
  });

  console.log('Tab 6 Bar check:', barCheck.result?.value);

  const ss = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('scripts/tab6_scrolled.png', Buffer.from(ss.data, 'base64'));
  console.log('Saved tab6_scrolled.png');
  process.exit(0);
}

inspectTab6().catch(e => {
  console.error(e);
  process.exit(1);
});
