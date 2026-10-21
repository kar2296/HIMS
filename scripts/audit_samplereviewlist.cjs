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

  const pageTarget = targets.find(t => t.url && t.url.includes('localhost:5173') && t.type === 'page') ||
                     targets.find(t => t.type === 'page');
  if (!pageTarget) {
    console.error('No page target found');
    process.exit(1);
  }

  console.log('Connecting to page:', pageTarget.url);
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

  // Enable console and network
  await send('Console.enable');
  await send('Page.enable');

  console.log('Navigating to #/app/samplereviewlist...');
  await send('Runtime.evaluate', {
    expression: `window.location.href = 'http://localhost:5173/#/app/samplereviewlist';`
  });

  await new Promise(r => setTimeout(r, 4000));

  // Check current URL and DOM
  const pageState = await send('Runtime.evaluate', {
    expression: `(() => {
      return {
        url: window.location.href,
        hash: window.location.hash,
        title: document.title,
        heading: document.querySelector('h4')?.innerText,
        tableExists: !!document.querySelector('table, custom-table, .ui-grid'),
        tableRows: document.querySelectorAll('table tbody tr, .ui-grid-row').length,
        formInputs: Array.from(document.querySelectorAll('input, select, .ui-select-container')).map(el => ({
          tagName: el.tagName,
          name: el.getAttribute('name'),
          model: el.getAttribute('ng-model'),
          placeholder: el.getAttribute('placeholder'),
          value: el.value || el.innerText
        })),
        bodySnippet: document.body.innerText.slice(0, 1000)
      };
    })()`,
    returnByValue: true
  });

  console.log('Page State:', JSON.stringify(pageState.result.value, null, 2));

  // Capture screenshot
  const screenshot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('scripts/samplereviewlist_live.png', Buffer.from(screenshot.data, 'base64'));
  console.log('Screenshot saved to scripts/samplereviewlist_live.png');

  ws.close();
}

main().catch(console.error);
