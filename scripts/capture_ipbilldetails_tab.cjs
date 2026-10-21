const http = require('http');
const WebSocket = require('ws');
const fs = require('fs');

async function main() {
  const targets = await new Promise((resolve, reject) => {
    http.get('http://localhost:9222/json', res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });

  const pageTarget = targets.find(t => t.url && t.url.includes('localhost:5174') && t.type === 'page');
  const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);
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

  // Close modal by clicking close icon or pressing Esc or calling Angular dismiss
  console.log('Closing modal...');
  await send('Runtime.evaluate', {
    expression: `(() => {
      const closeImg = document.querySelector('.custom-modal-header img, img[ng-click*="backToList"]');
      if (closeImg) closeImg.click();
    })()`
  });

  await new Promise(r => setTimeout(r, 1000));

  const screenshot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('/Users/sharmila/Rajesh/my-app/ipbilldetails_tab_live.png', Buffer.from(screenshot.data, 'base64'));
  console.log('Saved ipbilldetails_tab_live.png');

  ws.close();
}

main().catch(console.error);
