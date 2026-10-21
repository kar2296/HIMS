const http = require('http');
const WebSocket = require('ws');

async function main() {
  const targets = await new Promise((resolve, reject) => {
    http.get('http://127.0.0.1:9222/json', res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });

  const page = targets.find(t => t.url && t.url.includes('localhost:5174') && t.type === 'page');
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise(r => ws.on('open', r));

  let reqId = 1;
  const send = (method, params = {}) => new Promise((resolve, reject) => {
    const id = reqId++;
    const onMsg = (raw) => {
      const msg = JSON.parse(raw);
      if (msg.id === id) {
        ws.removeListener('message', onMsg);
        if (msg.error) reject(new Error(JSON.stringify(msg.error)));
        else resolve(msg.result);
      }
    };
    ws.on('message', onMsg);
    ws.send(JSON.stringify({ id, method, params }));
  });

  const evalRes = await send('Runtime.evaluate', {
    returnByValue: true,
    expression: `(() => {
      const popup = document.querySelector(".custom-popup-wrapper:not(.ng-hide)");
      if (!popup) return "no popup";
      const tbl = popup.querySelector("table");
      return {
        popup: {
          clientHeight: popup.clientHeight,
          scrollHeight: popup.scrollHeight,
          offsetHeight: popup.offsetHeight,
          styleHeight: popup.style.height,
          computedHeight: window.getComputedStyle(popup).height,
          computedMaxHeight: window.getComputedStyle(popup).maxHeight,
          computedOverflow: window.getComputedStyle(popup).overflow,
          computedOverflowY: window.getComputedStyle(popup).overflowY,
          computedDisplay: window.getComputedStyle(popup).display,
          computedPosition: window.getComputedStyle(popup).position,
          computedTop: window.getComputedStyle(popup).top,
          computedLeft: window.getComputedStyle(popup).left
        },
        table: tbl ? {
          clientHeight: tbl.clientHeight,
          scrollHeight: tbl.scrollHeight,
          offsetHeight: tbl.offsetHeight,
          computedHeight: window.getComputedStyle(tbl).height,
          rowsCount: tbl.querySelectorAll("tr").length,
          classes: tbl.className
        } : null
      };
    })()`
  });

  console.log('Popup size info:', JSON.stringify(evalRes.result.value, null, 2));
  ws.close();
}

main().catch(console.error);
