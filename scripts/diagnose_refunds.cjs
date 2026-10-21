const WebSocket = globalThis.WebSocket;

async function test() {
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

  console.log('Reloading page to pick up updated JS...');
  await send('Page.reload');
  await new Promise(r => setTimeout(r, 2500));

  // Navigate directly to refunds
  await send('Runtime.evaluate', {
    expression: `window.angular.element(document.body).injector().get('$state').go('app.ipbillingtab.refunds', { id: 3783 })`
  });

  await new Promise(r => setTimeout(r, 2500));

  const evalRes = await send('Runtime.evaluate', {
    returnByValue: true,
    expression: `(() => {
      const comp = document.querySelector('react-component[name="IpBillingRefundsScreen"]');
      if (!comp) return { error: 'IpBillingRefundsScreen not in DOM' };
      const scope = window.angular ? window.angular.element(comp).scope() : null;
      return {
        innerHTML: comp.innerHTML,
        innerHTMLTotalLength: comp.innerHTML.length,
        scopeId: scope ? scope.$id : null,
        scopeKeys: scope ? Object.keys(scope).filter(k => !k.startsWith('$')) : null,
        vmKeys: scope && scope.vm ? Object.keys(scope.vm) : null
      };
    })()`
  });

  console.log('Refunds eval result:', JSON.stringify(evalRes.result?.value, null, 2));

  const fs = require('fs');
  const ss = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('scripts/tab_refunds_inspect.png', Buffer.from(ss.data, 'base64'));
  console.log('Saved screenshot to scripts/tab_refunds_inspect.png');
  process.exit(0);
}

test();
