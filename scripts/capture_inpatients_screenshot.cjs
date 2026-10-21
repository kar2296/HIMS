const http = require('http');
const WebSocket = require('ws');
const fs = require('fs');

async function captureInpatients() {
  const targets = await new Promise((resolve, reject) => {
    http.get('http://localhost:9222/json', res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });

  const pageTarget = targets.find(t => t.url.includes('localhost:5174'));
  if (!pageTarget) {
    console.error('No localhost:5174 page target found');
    process.exit(1);
  }

  console.log('Connecting to target:', pageTarget.url);
  const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);

  await new Promise(resolve => ws.on('open', resolve));

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

  // Navigate to inpatients
  await send('Page.navigate', { url: 'http://localhost:5174/#/app/inpatients' });
  await new Promise(r => setTimeout(r, 2500));

  // Reset scroll on all parent containers
  await send('Runtime.evaluate', {
    expression: `
      (() => {
        window.scrollTo(0, 0);
        document.body.scrollTop = 0;
        document.documentElement.scrollTop = 0;
        const main = document.querySelector('main') || document.querySelector('.content-wrapper') || document.querySelector('.wrapper');
        if (main) main.scrollTop = 0;
        const reactRoot = document.querySelector('react-component[name="InpatientBillingListScreen"]');
        if (reactRoot) {
          let p = reactRoot;
          while (p) {
            p.scrollTop = 0;
            p = p.parentElement;
          }
          reactRoot.scrollIntoView({ behavior: 'instant', block: 'start' });
        }
      })()
    `
  });
  await new Promise(r => setTimeout(r, 1000));

  const screenshot = await send('Page.captureScreenshot', { format: 'png' });
  const outPath = '/Users/sharmila/.gemini/antigravity-ide/brain/10f529db-764b-4396-b01b-e4cb40958fff/.tempmediaStorage/inpatients_single_line_verified.png';
  fs.writeFileSync(outPath, Buffer.from(screenshot.data, 'base64'));
  console.log('Screenshot saved to', outPath);

  ws.close();
}

captureInpatients().catch(err => {
  console.error(err);
  process.exit(1);
});
