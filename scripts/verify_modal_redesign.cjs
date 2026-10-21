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

  // Reload or navigate to ensure templates are fresh
  console.log('Navigating to ipbilldetails...');
  await send('Runtime.evaluate', {
    expression: `window.location.hash = '#/app/ipbillingtab/3783/ipbilldetails'`
  });
  await new Promise(r => setTimeout(r, 2500));

  console.log('Capturing ipbilldetails tab screen...');
  const ssTab = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('/Users/sharmila/Rajesh/my-app/ipbilldetails_tab_redesigned.png', Buffer.from(ssTab.data, 'base64'));
  console.log('Saved ipbilldetails_tab_redesigned.png');

  console.log('Opening Add New modal...');
  const clickRes = await send('Runtime.evaluate', {
    awaitPromise: true,
    expression: `(async () => {
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText && b.innerText.includes('Add New'));
      if (btn) {
        btn.click();
        return 'clicked Add New';
      }
      return 'Add New button not found';
    })()`
  });
  console.log(clickRes.result.value);
  await new Promise(r => setTimeout(r, 2000));

  console.log('Capturing Add New Bills modal screen...');
  const ssModal = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('/Users/sharmila/Rajesh/my-app/add_new_bills_modal_redesigned.png', Buffer.from(ssModal.data, 'base64'));
  console.log('Saved add_new_bills_modal_redesigned.png');

  ws.close();
}

main().catch(console.error);
