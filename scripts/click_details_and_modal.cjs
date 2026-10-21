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

  console.log('Clicking Details tab...');
  const res = await send('Runtime.evaluate', {
    awaitPromise: true,
    expression: `(async () => {
      const tabs = Array.from(document.querySelectorAll('button, div, span, a')).filter(el => el.innerText && el.innerText.trim() === 'Details');
      const detailsBtn = tabs.find(el => el.tagName === 'BUTTON' || el.getAttribute('role') === 'tab');
      if (detailsBtn) {
        detailsBtn.click();
        return 'clicked Details';
      }
      // If not, find Angular state or click any matching
      if (tabs.length > 0) {
        tabs[0].click();
        return 'clicked first matching Details';
      }
      return 'Details not found';
    })()`
  });
  console.log('Result:', res.result.value);

  await new Promise(r => setTimeout(r, 3000));

  // Now find Add New button
  console.log('Looking for Add New button...');
  const addRes = await send('Runtime.evaluate', {
    awaitPromise: true,
    expression: `(async () => {
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText && b.innerText.trim() === 'Add New');
      if (btn) {
        btn.click();
        return 'clicked Add New';
      }
      return 'Add New not found: ' + document.body.innerText.substring(0, 300);
    })()`
  });
  console.log('Add New:', addRes.result.value);

  await new Promise(r => setTimeout(r, 2000));

  const screenshot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('/Users/sharmila/Rajesh/my-app/details_modal_live.png', Buffer.from(screenshot.data, 'base64'));
  console.log('Saved details_modal_live.png');

  ws.close();
}

main().catch(console.error);
