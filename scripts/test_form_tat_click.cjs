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

  console.log('1. Checking page state and taking full form screenshot...');
  const shot1 = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('scripts/samplereview_form_perfect_live.png', Buffer.from(shot1.data, 'base64'));
  console.log('Saved screenshot to scripts/samplereview_form_perfect_live.png');

  console.log('2. Clicking Order TAT button on row 1...');
  const clickResult = await send('Runtime.evaluate', {
    expression: `(() => {
      const tatBtn = document.querySelector('button[title*="Turnaround Time"]');
      if (tatBtn) {
        tatBtn.click();
        return 'Clicked TAT button on row';
      }
      return 'TAT button not found';
    })()`,
    returnByValue: true
  });
  console.log('Click result:', clickResult.result.value);

  await new Promise(r => setTimeout(r, 2500));

  console.log('3. Checking if TatDetailsModalScreen opened...');
  const modalInfo = await send('Runtime.evaluate', {
    expression: `(() => {
      const modal = document.querySelector('.modal-dialog, [role="dialog"], [name="TatDetailsModalScreen"]');
      return {
        isOpen: Boolean(modal),
        title: document.querySelector('.modal-title, .tat-header-title, h1, h2, h3, h4')?.innerText,
        textSnippet: modal?.innerText?.slice(0, 300)
      };
    })()`,
    returnByValue: true
  });
  console.log('Modal status:', JSON.stringify(modalInfo.result.value, null, 2));

  if (modalInfo.result.value?.isOpen) {
    const shot2 = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('scripts/samplereview_form_tat_modal_perfect.png', Buffer.from(shot2.data, 'base64'));
    console.log('Saved screenshot to scripts/samplereview_form_tat_modal_perfect.png');
  }

  ws.close();
}
main().catch(console.error);
