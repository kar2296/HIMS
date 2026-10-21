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

  console.log('1. Clicking "Back to Worklist" button...');
  const backResult = await send('Runtime.evaluate', {
    expression: `(() => {
      const backBtn = document.querySelector('#btnBackToWorklistBottom, #btnBackToSampleReviewListTop');
      if (backBtn) {
        backBtn.click();
        return 'Clicked back button';
      }
      return 'Back button not found';
    })()`,
    returnByValue: true
  });
  console.log('Back button click:', backResult.result.value);

  await new Promise(r => setTimeout(r, 2500));

  const listState = await send('Runtime.evaluate', {
    expression: `(() => {
      return {
        url: window.location.href,
        title: document.querySelector('.pkg-header-title')?.innerText,
        rowCount: document.querySelectorAll('.pkg-table tbody tr').length
      };
    })()`,
    returnByValue: true
  });
  console.log('List State after Back click:', JSON.stringify(listState.result.value, null, 2));

  const shot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('scripts/samplereview_back_to_list.png', Buffer.from(shot.data, 'base64'));
  console.log('Saved screenshot: scripts/samplereview_back_to_list.png');

  ws.close();
}
main().catch(console.error);
