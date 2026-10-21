const WebSocket = require('ws');
const fs = require('fs');

async function main() {
  const res = await fetch('http://localhost:9222/json');
  const pages = await res.json();
  const page = pages.find(p => p.type === 'page' && !p.url.includes('chrome://') && !p.url.includes('omnibox'));
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise(r => ws.on('open', r));

  let id = 1;
  const send = (method, params = {}) => new Promise((resolve) => {
    const msgId = id++;
    const handler = (data) => {
      const msg = JSON.parse(data);
      if (msg.id === msgId) {
        ws.off('message', handler);
        resolve(msg.result);
      }
    };
    ws.on('message', handler);
    ws.send(JSON.stringify({ id: msgId, method, params }));
  });

  await send('Page.enable');
  await send('Runtime.enable');

  await send('Runtime.evaluate', {
    expression: `window.location.href = "http://localhost:5173/#/app/approvalallorders/1";`
  });
  await new Promise(r => setTimeout(r, 3000));

  const screenshot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('scripts/approvalallorders_final.png', Buffer.from(screenshot.data, 'base64'));
  console.log('Saved final screenshot to scripts/approvalallorders_final.png');

  ws.close();
}
main();
