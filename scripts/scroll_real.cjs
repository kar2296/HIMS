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

  const scrollInfo = await send('Runtime.evaluate', {
    expression: `(() => {
      const el = document.querySelector('.content-wrapper') || document.querySelector('section') || document.documentElement || document.body;
      window.scrollTo(0, 1000);
      document.body.scrollTop = 1000;
      document.documentElement.scrollTop = 1000;
      const elements = Array.from(document.querySelectorAll('*'));
      let scrolled = [];
      elements.forEach(e => {
        if (e.scrollHeight > e.clientHeight + 20) {
          e.scrollTop = e.scrollHeight;
          scrolled.push({ tag: e.tagName, cls: e.className, h: e.scrollHeight });
        }
      });
      return scrolled;
    })()`,
    returnByValue: true
  });
  console.log('SCROLLED ELEMENTS:', scrollInfo.result.value);

  await new Promise(r => setTimeout(r, 800));

  const shot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('scripts/samplereview_form_bottom_scrolled_real.png', Buffer.from(shot.data, 'base64'));
  console.log('Saved screenshot: scripts/samplereview_form_bottom_scrolled_real.png');

  ws.close();
}
main().catch(console.error);
