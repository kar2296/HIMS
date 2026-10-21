const WebSocket = require('ws');
const fs = require('fs');

async function main() {
  const res = await fetch('http://localhost:9222/json');
  const pages = await res.json();
  const page = pages.find(p => p.type === 'page' && !p.url.includes('chrome://') && !p.url.includes('omnibox'));
  if (!page) {
    console.error('No page target found');
    process.exit(1);
  }

  const ws = new WebSocket(page.webSocketDebuggerUrl);
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

  console.log('--- TEST 1: Navigate to http://localhost:5173/#/app/approvalallorders/1 ---');
  await send('Runtime.evaluate', {
    expression: `window.location.href = "http://localhost:5173/#/app/approvalallorders/1";`
  });
  await new Promise(r => setTimeout(r, 4000));

  // Test 2: Click KPI "FULLY APPROVED"
  console.log('--- TEST 2: Click KPI "FULLY APPROVED" ---');
  const kpiRes = await send('Runtime.evaluate', {
    returnByValue: true,
    expression: `(() => {
      const cards = Array.from(document.querySelectorAll('div')).filter(d => d.innerText && d.innerText.includes('FULLY APPROVED'));
      const card = cards[cards.length - 1];
      if (card) {
        card.click();
        return { clicked: true };
      }
      return { clicked: false };
    })()`
  });
  console.log('KPI click result:', kpiRes.result?.value);
  await new Promise(r => setTimeout(r, 1000));

  const kpiRowCount = await send('Runtime.evaluate', {
    returnByValue: true,
    expression: `document.querySelectorAll('tbody tr').length`
  });
  console.log('Row count after filtering by FULLY APPROVED:', kpiRowCount.result?.value);

  // Test 3: Click "TOTAL WORK ORDERS" to restore
  console.log('--- TEST 3: Click "TOTAL WORK ORDERS" to restore ---');
  await send('Runtime.evaluate', {
    expression: `(() => {
      const cards = Array.from(document.querySelectorAll('div')).filter(d => d.innerText && d.innerText.includes('TOTAL WORK ORDERS'));
      const card = cards[cards.length - 1];
      if (card) card.click();
    })()`
  });
  await new Promise(r => setTimeout(r, 1000));

  // Test 4: Open Advanced Filters Modal
  console.log('--- TEST 4: Open Advanced Filters Modal ---');
  await send('Runtime.evaluate', {
    expression: `(() => {
      const btn = document.querySelector('button[title="Advanced Filters"]');
      if (btn) btn.click();
    })()`
  });
  await new Promise(r => setTimeout(r, 800));

  const modalOpen = await send('Runtime.evaluate', {
    returnByValue: true,
    expression: `Boolean(document.querySelector('h3')?.innerText.includes('Advanced Search Filters'))`
  });
  console.log('Advanced modal opened:', modalOpen.result?.value);

  // Take screenshot of Advanced Modal
  const modalScreenshot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('scripts/approvalallorders_advanced_modal.png', Buffer.from(modalScreenshot.data, 'base64'));
  console.log('Saved advanced modal screenshot to scripts/approvalallorders_advanced_modal.png');

  // Close modal
  await send('Runtime.evaluate', {
    expression: `(() => {
      const closeBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText === 'Apply Filters');
      if (closeBtn) closeBtn.click();
    })()`
  });
  await new Promise(r => setTimeout(r, 1000));

  // Test 5: Click TAT button on row 1
  console.log('--- TEST 5: Click TAT button on row 1 ---');
  const tatClick = await send('Runtime.evaluate', {
    returnByValue: true,
    expression: `(() => {
      const tatBtn = document.querySelector('button[title="Turnaround Time (TAT) Tracking"]');
      if (tatBtn) {
        tatBtn.click();
        return { clicked: true };
      }
      return { clicked: false };
    })()`
  });
  console.log('TAT click result:', tatClick.result?.value);
  await new Promise(r => setTimeout(r, 2500));

  // Check if TAT modal opened
  const tatModal = await send('Runtime.evaluate', {
    returnByValue: true,
    expression: `(() => {
      const modal = document.querySelector('.modal, react-component[name="TatDetailsModalScreen"]');
      return {
        hasModal: !!modal,
        textSnippet: document.body.innerText.substring(0, 300)
      };
    })()`
  });
  console.log('TAT modal state:', tatModal.result?.value);

  const tatScreenshot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('scripts/approvalallorders_tat_modal.png', Buffer.from(tatScreenshot.data, 'base64'));
  console.log('Saved TAT modal screenshot to scripts/approvalallorders_tat_modal.png');

  // Close modal by pressing Escape or clicking close button
  await send('Runtime.evaluate', {
    expression: `(() => {
      const closeBtn = document.querySelector('.modal .close, button.close, .modal-header .btn-close') ||
        Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Close') || b.querySelector('.fa-xmark'));
      if (closeBtn) closeBtn.click();
    })()`
  });
  await new Promise(r => setTimeout(r, 1000));

  console.log('--- ALL INTERACTIVE TESTS COMPLETE ---');
  ws.close();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
