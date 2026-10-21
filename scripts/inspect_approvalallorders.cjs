const WebSocket = require('ws');
const fs = require('fs');

async function main() {
  const res = await fetch('http://localhost:9222/json');
  const pages = await res.json();
  const page = pages.find(p => p.type === 'page' && !p.url.includes('chrome://') && !p.url.includes('omnibox'));
  if (!page) {
    console.error('No page target found');
    process.exit(1);
  }

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

  console.log('Navigating to http://localhost:5173/#/app/approvalallorders/1 ...');
  await send('Page.enable');
  await send('Runtime.enable');
  await send('Runtime.evaluate', {
    expression: `window.location.href = "http://localhost:5173/#/app/approvalallorders/1";`
  });

  await new Promise(r => setTimeout(r, 4000));

  const info = await send('Runtime.evaluate', {
    returnByValue: true,
    expression: `(() => {
      return {
        url: window.location.href,
        title: document.title,
        heading: document.querySelector('h4')?.innerText,
        tableCount: document.querySelectorAll('custom-table, table, .ui-grid').length,
        hasReactComponent: !!document.querySelector('react-component'),
        bodyTextSnippet: document.body.innerText.substring(0, 500)
      };
    })()`
  });

  console.log('Page info:', JSON.stringify(info.result?.value, null, 2));

  const screenshot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('scripts/approvalallorders_initial.png', Buffer.from(screenshot.data, 'base64'));
  console.log('Saved screenshot to scripts/approvalallorders_initial.png');
  ws.close();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
