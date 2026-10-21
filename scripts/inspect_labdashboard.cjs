const http = require('http');
const WebSocket = require('ws');
const fs = require('fs');

async function main() {
  const targets = await new Promise((resolve, reject) => {
    http.get('http://localhost:9222/json', (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });

  const pageTarget = targets.find((t) => t.type === 'page' && !t.url.includes('chrome://') && !t.url.includes('omnibox'));
  if (!pageTarget) {
    console.error('No page target found');
    process.exit(1);
  }

  console.log('Connecting to page:', pageTarget.url);
  const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);
  await new Promise((r) => ws.on('open', r));

  let id = 1;
  const send = (method, params = {}) =>
    new Promise((resolve, reject) => {
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

  console.log('1. Navigating to http://localhost:5173/#/app/labdashboard ...');
  await send('Runtime.evaluate', {
    expression: `window.location.href = "http://localhost:5173/#/app/labdashboard";`
  });

  console.log('Waiting 3 seconds...');
  await new Promise(r => setTimeout(r, 3000));

  const pageInfo = await send('Runtime.evaluate', {
    expression: `(() => {
      return {
        url: window.location.href,
        title: document.title,
        bodyText: document.body.innerText.slice(0, 500),
        reactComponent: document.querySelector('react-component[name="LabDashboardComponent"]') ? true : false,
        cardsCount: document.querySelectorAll('.dashboard-card, [class*="Card"], .stat-card').length,
        hasError: document.body.innerText.includes('Error') || document.body.innerText.includes('Cannot GET')
      };
    })()`,
    returnByValue: true
  });

  console.log('Page Info:', JSON.stringify(pageInfo.result?.value, null, 2));

  // Capture screenshot
  const screenshot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('labdashboard_current_state.png', Buffer.from(screenshot.data, 'base64'));
  console.log('Saved screenshot to labdashboard_current_state.png');

  ws.close();
}

main().catch(console.error);
