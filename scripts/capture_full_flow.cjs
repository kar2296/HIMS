const http = require('http');
const WebSocket = require('ws');
const fs = require('fs');

async function capture() {
  const targets = await new Promise((resolve, reject) => {
    http.get('http://localhost:9222/json', res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });

  const pageTarget = targets.find(t => t.url.includes('localhost:5174'));
  if (!pageTarget) {
    console.error('No localhost:5174 target found');
    process.exit(1);
  }

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

  const scrollContainers = (pos) => send('Runtime.evaluate', {
    expression: `
      (() => {
        const els = Array.from(document.querySelectorAll('*')).filter(el => el.scrollHeight > el.clientHeight && el.clientHeight > 100);
        els.forEach(el => {
          if (pos === 'top') el.scrollTop = 0;
          else if (pos === 'mid') el.scrollTop = Math.floor((el.scrollHeight - el.clientHeight) * 0.45);
          else if (pos === 'bottom') el.scrollTop = el.scrollHeight;
        });
      })()
    `
  });

  // Top
  await scrollContainers('top');
  await new Promise(r => setTimeout(r, 600));
  let shot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('/Users/sharmila/.gemini/antigravity-ide/brain/d65c7b61-8a17-4b46-8d51-47f1e19bfa2e/real_top.png', Buffer.from(shot.data, 'base64'));

  // Mid
  await scrollContainers('mid');
  await new Promise(r => setTimeout(r, 600));
  shot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('/Users/sharmila/.gemini/antigravity-ide/brain/d65c7b61-8a17-4b46-8d51-47f1e19bfa2e/real_mid.png', Buffer.from(shot.data, 'base64'));

  // Bottom
  await scrollContainers('bottom');
  await new Promise(r => setTimeout(r, 600));
  shot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('/Users/sharmila/.gemini/antigravity-ide/brain/d65c7b61-8a17-4b46-8d51-47f1e19bfa2e/real_bottom.png', Buffer.from(shot.data, 'base64'));

  console.log('Real top, mid, and bottom captured!');
  ws.close();
}

capture().catch(console.error);
