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
  if (!pageTarget) {
    console.error('No page target found');
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

  await send('Page.enable');
  await send('Runtime.enable');

  console.log('1. Navigating to http://localhost:5173/#/app/samplereview/1...');
  await send('Runtime.evaluate', {
    expression: 'window.location.href = "http://localhost:5173/#/app/samplereview/1";'
  });

  console.log('Waiting 4.5 seconds for API calls & React mounting...');
  await new Promise(r => setTimeout(r, 4500));

  console.log('2. Inspecting mounted React DOM...');
  const state = await send('Runtime.evaluate', {
    expression: `(() => {
      const h1 = document.querySelector('h1')?.innerText;
      const subtitle = document.querySelector('.pkg-header-card p')?.innerText;
      const patientName = document.querySelector('.orderack-patient-card span[style*="font-weight: 700"]')?.innerText;
      const mrn = document.querySelector('.orderack-patient-card span[style*="font-family: monospace"]')?.innerText;
      const rows = Array.from(document.querySelectorAll('tbody tr')).map(tr => tr.innerText.replace(/\\n/g, ' | '));
      const buttons = Array.from(document.querySelectorAll('button')).map(b => b.innerText.trim()).filter(Boolean);
      return { h1, subtitle, patientName, mrn, rowCount: rows.length, sampleRows: rows.slice(0, 5), buttons };
    })()`,
    returnByValue: true
  });

  console.log('DOM STATE:', JSON.stringify(state.result.value, null, 2));

  // Take screenshot of modernized form
  const shot1 = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('scripts/samplereview_form_modern_verified.png', Buffer.from(shot1.data, 'base64'));
  console.log('Saved screenshot: scripts/samplereview_form_modern_verified.png');

  // Test clicking Order TAT button
  console.log('3. Testing Order TAT button click...');
  const clickTat = await send('Runtime.evaluate', {
    expression: `(() => {
      const tatBtn = document.querySelector('button[title*="Turnaround Time"]');
      if (tatBtn) {
        tatBtn.click();
        return 'Clicked TAT button';
      }
      return 'TAT button not found';
    })()`,
    returnByValue: true
  });
  console.log('TAT click result:', clickTat.result.value);

  await new Promise(r => setTimeout(r, 2000));

  // Check if TAT modal appeared
  const modalState = await send('Runtime.evaluate', {
    expression: `(() => {
      const modal = document.querySelector('.modal-dialog, [role="dialog"], .tat-modal');
      return {
        hasModal: Boolean(modal),
        modalTitle: document.querySelector('.modal-title, .tat-header-title')?.innerText || 'Not found'
      };
    })()`,
    returnByValue: true
  });
  console.log('Modal State:', JSON.stringify(modalState.result.value, null, 2));

  // Capture TAT modal screenshot
  const shot2 = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('scripts/samplereview_form_tat_modal_verified.png', Buffer.from(shot2.data, 'base64'));
  console.log('Saved screenshot: scripts/samplereview_form_tat_modal_verified.png');

  ws.close();
}
main().catch(console.error);
