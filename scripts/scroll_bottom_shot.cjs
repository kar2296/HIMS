const http = require('http');
const WebSocket = require('ws');
const fs = require('fs');

async function main() {
  const targets = await new Promise((resolve, reject) => {
    http.get('http://localhost:9222/json', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });
  const pageTarget = targets.find(t => t.type === 'page' && !t.url.includes('chrome://'));
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

  await send('Page.enable');
  await send('Runtime.enable');

  // Close modal if open
  await send('Runtime.evaluate', {
    expression: `(() => {
      const closeBtn = document.querySelector('.modal-dialog button[ng-click*="cancel"], .modal-dialog button.close, .modal-dialog button:has(.fa-times), button:contains("Close")');
      const allBtns = Array.from(document.querySelectorAll('button'));
      const close = allBtns.find(b => b.innerText.trim() === 'Close');
      if (close) close.click();
    })()`
  });

  await new Promise(r => setTimeout(r, 1000));

  // Scroll to bottom
  await send('Runtime.evaluate', {
    expression: 'window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });'
  });

  await new Promise(r => setTimeout(r, 1000));

  const shot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('scripts/samplereview_form_bottom_scrolled.png', Buffer.from(shot.data, 'base64'));
  console.log('Saved screenshot: scripts/samplereview_form_bottom_scrolled.png');

  ws.close();
}
main().catch(console.error);
