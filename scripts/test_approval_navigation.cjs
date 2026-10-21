const WebSocket = require('ws');
const fs = require('fs');

async function main() {
  const res = await fetch('http://localhost:9222/json');
  const pages = await res.json();
  const page = pages.find(p => p.type === 'page' && !p.url.includes('chrome://') && !p.url.includes('omnibox'));
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise(r => ws.on('open', r));

  let id = 1;
  const send = (method, params = {}) => new Promise((resolve, reject) => {
    const msgId = id++;
    const handler = (data) => {
      const msg = JSON.parse(data);
      if (msg.id === msgId) {
        ws.off('message', handler);
        if (msg.error) reject(msg.error);
        else resolve(msg.result);
      }
    };
    ws.on('message', handler);
    ws.send(JSON.stringify({ id: msgId, method, params }));
  });

  await send('Page.enable');
  await send('Runtime.enable');

  console.log('1. Ensuring we are on http://localhost:5173/#/app/approvalallorders/1 ...');
  await send('Runtime.evaluate', {
    expression: `window.location.href = "http://localhost:5173/#/app/approvalallorders/1";`
  });
  await new Promise(r => setTimeout(r, 4000));

  console.log('2. Clicking Approve / Review button on row 1...');
  const navClick = await send('Runtime.evaluate', {
    returnByValue: true,
    expression: `(() => {
      const btn = document.querySelector('button[title="Approve / Review Result"]');
      if (btn) {
        btn.click();
        return { clicked: true };
      }
      return { clicked: false };
    })()`
  });
  console.log('Approve button click:', navClick.result?.value);
  await new Promise(r => setTimeout(r, 3500));

  const currentUrl = await send('Runtime.evaluate', {
    returnByValue: true,
    expression: `window.location.href`
  });
  console.log('Navigated to URL:', currentUrl.result?.value);

  const screenshot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('scripts/approvalallorders_navigated_resultentry.png', Buffer.from(screenshot.data, 'base64'));
  console.log('Saved screenshot to scripts/approvalallorders_navigated_resultentry.png');

  console.log('3. Returning back to http://localhost:5173/#/app/approvalallorders/1 ...');
  await send('Runtime.evaluate', {
    expression: `window.location.href = "http://localhost:5173/#/app/approvalallorders/1";`
  });
  await new Promise(r => setTimeout(r, 3000));

  ws.close();
}

main().catch(console.error);
