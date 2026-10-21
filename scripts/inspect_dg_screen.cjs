const WebSocket = globalThis.WebSocket;

async function test() {
  const tabs = await (await fetch('http://127.0.0.1:9222/json')).json();
  const tab = tabs.find(t => t.url && t.url.includes('5174'));
  if (!tab) {
    console.log('No 5174 tab found');
    return;
  }
  const ws = new WebSocket(tab.webSocketDebuggerUrl);
  let id = 1;
  const send = (m, p = {}) => new Promise((resolve) => {
    const mid = id++;
    const handler = (event) => {
      const parsed = JSON.parse(event.data);
      if (parsed.id === mid) {
        ws.removeEventListener('message', handler);
        resolve(parsed.result);
      }
    };
    ws.addEventListener('message', handler);
    ws.send(JSON.stringify({ id: mid, method: m, params: p }));
  });

  ws.addEventListener('open', async () => {
    await send('Runtime.evaluate', {
      expression: 'window.location.hash = "#/app/directbilling/0/DG"; location.reload();'
    });
    // Wait until .direct-billing-container is rendered
    for (let i = 0; i < 20; i++) {
      await new Promise(r => setTimeout(r, 500));
      const check = await send('Runtime.evaluate', {
        expression: 'Boolean(document.querySelector(".direct-billing-container"))',
        returnByValue: true
      });
      if (check.result?.value) break;
    }
    const res = await send('Runtime.evaluate', {
      expression: `(() => {
        const directCont = document.querySelector('.direct-billing-container');
        const reactRoot = document.querySelector('[ui-view]');
        const fields = Array.from(document.querySelectorAll('input, select, .form-control')).map(el => ({
          id: el.id,
          name: el.name,
          placeholder: el.placeholder,
          height: el.offsetHeight,
          fontSize: window.getComputedStyle(el).fontSize,
          padding: window.getComputedStyle(el).padding
        }));
        const cardElements = Array.from(document.querySelectorAll('.drhms-filter, .drhms-table-head-border, [class*="card"]')).map(el => ({
          className: el.className,
          offsetHeight: el.offsetHeight,
          padding: window.getComputedStyle(el).padding,
          margin: window.getComputedStyle(el).margin
        }));
        return {
          hash: window.location.hash,
          isDirectHtml: Boolean(directCont),
          cards: cardElements.slice(0, 10),
          fieldSample: fields.slice(0, 8),
          totalHeight: document.body.scrollHeight
        };
      })()`,
      returnByValue: true
    });
    console.log(JSON.stringify(res.result?.value, null, 2));
    process.exit(0);
  });
}
test();
