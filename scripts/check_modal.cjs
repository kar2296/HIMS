const WebSocket = globalThis.WebSocket;
async function check() {
  const tabsRes = await fetch('http://127.0.0.1:9222/json');
  const tabsList = await tabsRes.json();
  const pageTab = tabsList.find(t => t.url && t.url.includes('5174'));
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
  const evalRes = await send('Runtime.evaluate', {
    returnByValue: true,
    expression: `(() => {
      const modal = document.querySelector('.modal-dialog');
      const title = modal ? modal.querySelector('.modal-title, h3, h4')?.innerText : null;
      const html = modal ? modal.innerHTML.slice(0, 500) : null;
      return { modalFound: !!modal, title, html };
    })()`
  });
  console.log(JSON.stringify(evalRes, null, 2));
  process.exit(0);
}
check();
