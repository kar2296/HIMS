const fs = require('fs');

async function run() {
  const res = await fetch('http://localhost:9222/json');
  const pages = await res.json();
  const page = pages.find(p => p.url && p.url.includes('5173'));
  const ws = new global.WebSocket(page.webSocketDebuggerUrl);
  await new Promise(r => ws.onopen = r);
  let id = 1;
  const send = (m, p = {}) =>
    new Promise(resolve => {
      const mid = id++;
      const handler = d => {
        const msg = JSON.parse(d.data);
        if (msg.id === mid) {
          ws.removeEventListener('message', handler);
          resolve(msg.result);
        }
      };
      ws.addEventListener('message', handler);
      ws.send(JSON.stringify({ id: mid, method: m, params: p }));
    });
  await send('Page.enable');

  // Initial state
  const initial = await send('Runtime.evaluate', {
    returnByValue: true,
    expression: `(() => {
      const chk = document.getElementById("chkWithHeader");
      const btn = document.getElementById("btnPrintLabReport");
      return { checked: chk?.checked, title: btn?.getAttribute("title") };
    })()`
  });
  console.log('Initial state:', initial.result?.value);

  // Click to uncheck
  const uncheck = await send('Runtime.evaluate', {
    returnByValue: true,
    expression: `(() => {
      const chk = document.getElementById("chkWithHeader");
      chk.click();
      const btn = document.getElementById("btnPrintLabReport");
      return { checked: chk?.checked, title: btn?.getAttribute("title") };
    })()`
  });
  console.log('Unchecked state:', uncheck.result?.value);

  // Click to re-check
  const recheck = await send('Runtime.evaluate', {
    returnByValue: true,
    expression: `(() => {
      const chk = document.getElementById("chkWithHeader");
      chk.click();
      const btn = document.getElementById("btnPrintLabReport");
      return { checked: chk?.checked, title: btn?.getAttribute("title") };
    })()`
  });
  console.log('Re-checked state:', recheck.result?.value);

  ws.close();
}

run().catch(console.error);
