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

  console.log('1. Navigating to http://localhost:5173/#/app/samplereviewlist...');
  await send('Runtime.evaluate', {
    expression: 'window.location.href = "http://localhost:5173/#/app/samplereviewlist";'
  });
  await new Promise(r => setTimeout(r, 4000));

  // Find the Review button on the first row and click it
  console.log('2. Clicking "Review" button on the first row...');
  const clickReview = await send('Runtime.evaluate', {
    expression: `(() => {
      const reviewBtns = Array.from(document.querySelectorAll('button[title*="Review"], .pkg-btn-action'));
      const btn = reviewBtns.find(b => b.innerText.includes('Review') || b.title.includes('Review'));
      if (btn) {
        btn.click();
        return 'Clicked review button';
      }
      return 'Review button not found';
    })()`,
    returnByValue: true
  });
  console.log('Click result:', clickReview.result.value);

  console.log('Waiting 4 seconds for route transition & data load...');
  await new Promise(r => setTimeout(r, 4000));

  // Inspect the current URL and page DOM
  const pageInfo = await send('Runtime.evaluate', {
    expression: `(() => {
      return {
        url: window.location.href,
        h1: document.querySelector('h1')?.innerText,
        patientName: document.querySelector('.orderack-patient-card span[style*="font-weight: 700"]')?.innerText,
        mrn: document.querySelector('.orderack-patient-card span[style*="font-family: monospace"]')?.innerText,
        rows: Array.from(document.querySelectorAll('tbody tr')).map(tr => tr.innerText.replace(/\\s+/g, ' ').trim()),
        buttons: Array.from(document.querySelectorAll('button')).map(b => b.innerText.trim()).filter(Boolean)
      };
    })()`,
    returnByValue: true
  });
  console.log('Page Info after Review click:', JSON.stringify(pageInfo.result.value, null, 2));

  // Take screenshot
  const shot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('scripts/samplereview_form_live_verified.png', Buffer.from(shot.data, 'base64'));
  console.log('Screenshot saved to scripts/samplereview_form_live_verified.png');

  // Test clicking TAT on the form
  console.log('3. Testing TAT click on the form...');
  const tatClick = await send('Runtime.evaluate', {
    expression: `(() => {
      const tatBtn = document.querySelector('button[title*="Turnaround Time"]');
      if (tatBtn) {
        tatBtn.click();
        return 'Clicked form TAT button';
      }
      return 'Form TAT button not found';
    })()`,
    returnByValue: true
  });
  console.log('Form TAT Click:', tatClick.result.value);

  await new Promise(r => setTimeout(r, 2000));

  const modalInfo = await send('Runtime.evaluate', {
    expression: `(() => {
      const modal = document.querySelector('.modal-dialog, [role="dialog"], .tat-modal');
      return {
        isOpen: Boolean(modal),
        title: document.querySelector('.modal-title, .tat-modal-header, h2, h3, h4')?.innerText
      };
    })()`,
    returnByValue: true
  });
  console.log('Form TAT Modal info:', JSON.stringify(modalInfo.result.value, null, 2));

  if (modalInfo.result.value?.isOpen) {
    const modalShot = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('scripts/samplereview_form_tat_modal_live.png', Buffer.from(modalShot.data, 'base64'));
    console.log('Saved modal screenshot to scripts/samplereview_form_tat_modal_live.png');
  }

  ws.close();
}
main().catch(console.error);
