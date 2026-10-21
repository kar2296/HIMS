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

  console.log('Navigating to http://localhost:5173/#/app/allorders/1 ...');
  await send('Page.navigate', { url: 'http://localhost:5173/#/app/allorders/1' });
  await new Promise(r => setTimeout(r, 3000));

  const pageInfo = await send('Runtime.evaluate', {
    expression: `(() => {
      return {
        url: window.location.href,
        buttons: Array.from(document.querySelectorAll('button')).map(b => ({
          title: b.title,
          text: b.innerText,
          className: b.className
        })).filter(b => b.title || b.text)
      };
    })()`,
    returnByValue: true
  });
  console.log('Page info:', JSON.stringify(pageInfo.result.value?.buttons?.slice(0, 10), null, 2));

  // Click on the stopwatch / TAT button
  const clickRes = await send('Runtime.evaluate', {
    expression: `(() => {
      const btn = document.querySelector('button[title*="Turnaround Time"], button[title*="Order TAT"]');
      if (btn) {
        btn.click();
        return 'Clicked TAT button';
      }
      return 'No TAT button found';
    })()`,
    returnByValue: true
  });
  console.log('Click result:', clickRes.result.value);

  await new Promise(r => setTimeout(r, 2000));

  const modalState = await send('Runtime.evaluate', {
    expression: `(() => {
      const modal = document.querySelector('.modal-dialog, [role="dialog"], .modal-content');
      return {
        hasModal: Boolean(modal),
        modalHtml: modal ? modal.innerHTML.slice(0, 400) : null
      };
    })()`,
    returnByValue: true
  });
  console.log('Modal state:', JSON.stringify(modalState.result.value, null, 2));

  const shot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('scripts/inspect_allorders_tat.png', Buffer.from(shot.data, 'base64'));
  console.log('Screenshot saved to scripts/inspect_allorders_tat.png');

  ws.close();
}

main().catch(console.error);
