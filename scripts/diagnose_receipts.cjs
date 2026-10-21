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
  console.log('Reloading page...');
  await send('Page.reload');
  await new Promise(r => setTimeout(r, 2500));

  const evalRes = await send('Runtime.evaluate', {
    returnByValue: true,
    expression: `(() => {
          const comp = document.querySelector('react-component[name="IpBillingReceiptsScreen"]');
          if (!comp) {
            return {
              error: 'comp not found in DOM',
              allReactComponents: Array.from(document.querySelectorAll('react-component')).map(el => el.getAttribute('name')),
              uiView: document.querySelector('[ui-view]') ? document.querySelector('[ui-view]').innerHTML : null
            };
          }
          const scope = window.angular ? window.angular.element(comp).scope() : null;
          return {
            found: true,
            innerHTMLSnippet: comp.innerHTML.slice(0, 300),
            innerHTMLTotalLength: comp.innerHTML.length,
            scopeId: scope ? scope.$id : null,
            scopeKeys: scope ? Object.keys(scope).filter(k => !k.startsWith('$')) : null,
            vmKeys: scope && scope.vm ? Object.keys(scope.vm) : null
        })()`
  });

  console.log('Eval result:', JSON.stringify(evalRes.result?.value, null, 2));

  const fs = require('fs');
  const ss = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('scripts/tab_receipts_after_reload.png', Buffer.from(ss.data, 'base64'));
  console.log('Saved screenshot to scripts/tab_receipts_after_reload.png');
  process.exit(0);
}

test();
