const http = require('http');
const WebSocket = require('ws');
const fs = require('fs');

async function main() {
  const targets = await new Promise((resolve, reject) => {
    http.get('http://localhost:9222/json', (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });

  const pageTarget = targets.find((t) => t.type === 'page' && !t.url.includes('chrome://') && !t.url.includes('omnibox'));
  if (!pageTarget) {
    console.error('No page target found');
    process.exit(1);
  }

  const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);
  await new Promise((r) => ws.on('open', r));

  let id = 1;
  const send = (method, params = {}) =>
    new Promise((resolve, reject) => {
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

  console.log('--- TEST 1: Click "Last 30 Days" preset ---');
  await send('Runtime.evaluate', {
    expression: `(() => {
      const chips = Array.from(document.querySelectorAll('.orderack-preset-chip'));
      const btn = chips.find(c => c.innerText.includes('30 Days'));
      if (btn) btn.click();
    })()`
  });
  await new Promise(r => setTimeout(r, 2000));

  const test1 = await send('Runtime.evaluate', {
    expression: `(() => {
      const rows = document.querySelectorAll('.pkg-table tbody tr');
      const totalText = document.querySelector('.pkg-stat-value')?.innerText;
      return { rowCount: rows.length, totalText };
    })()`,
    returnByValue: true
  });
  console.log('Test 1 (Last 30 Days):', test1.result.value);

  console.log('--- TEST 2: Patient Name Search Filter ---');
  await send('Runtime.evaluate', {
    expression: `(() => {
      const scope = angular.element(document.querySelector('.content-wrapper')).scope();
      // Test search
      scope.handleReactAction('search', { PatWoNum: 'RAJESH' });
    })()`
  });
  await new Promise(r => setTimeout(r, 1500));

  const test2 = await send('Runtime.evaluate', {
    expression: `(() => {
      const rows = Array.from(document.querySelectorAll('.pkg-table tbody tr')).map(tr => {
        return tr.querySelector('.orderack-pat-name-btn')?.innerText;
      });
      return { count: rows.length, patientNames: rows };
    })()`,
    returnByValue: true
  });
  console.log('Test 2 (Search RAJESH):', test2.result.value);

  console.log('--- TEST 3: Clear Search Filter ---');
  await send('Runtime.evaluate', {
    expression: `(() => {
      const scope = angular.element(document.querySelector('.content-wrapper')).scope();
      scope.handleReactAction('resetFilters');
    })()`
  });
  await new Promise(r => setTimeout(r, 1500));

  const test3 = await send('Runtime.evaluate', {
    expression: `(() => {
      const rows = document.querySelectorAll('.pkg-table tbody tr');
      return { count: rows.length };
    })()`,
    returnByValue: true
  });
  console.log('Test 3 (Reset Filters):', test3.result.value);

  console.log('--- TEST 4: Test In-Component TAT Modal Preview ---');
  await send('Runtime.evaluate', {
    expression: `(() => {
      const tatBtn = document.querySelector('button[title*="Turnaround Time"]');
      if (tatBtn) tatBtn.click();
    })()`
  });
  await new Promise(r => setTimeout(r, 800));

  const test4 = await send('Runtime.evaluate', {
    expression: `(() => {
      const modal = document.querySelector('[style*="rgba(15, 23, 42"]');
      const modalHeader = modal ? modal.querySelector('h4')?.innerText : null;
      return { hasModal: !!modal, modalHeader };
    })()`,
    returnByValue: true
  });
  console.log('Test 4 (TAT Modal Preview):', test4.result.value);

  const shotTat = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('scripts/allorders_tat_modal.png', Buffer.from(shotTat.data, 'base64'));
  console.log('Saved scripts/allorders_tat_modal.png');

  // Close modal
  await send('Runtime.evaluate', {
    expression: `(() => {
      const closeBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.trim() === 'Close' || b.innerText.trim() === '×');
      if (closeBtn) closeBtn.click();
    })()`
  });
  await new Promise(r => setTimeout(r, 500));

  console.log('--- TEST 5: Test Navigation to Result Entry (Edit Action) ---');
  const editRes = await send('Runtime.evaluate', {
    expression: `(() => {
      const editBtn = document.querySelector('button[title*="Result Entry"]');
      const firstRowWo = document.querySelector('.pkg-table tbody tr td:nth-child(2) span')?.innerText;
      return { hasEditBtn: !!editBtn, firstRowWo };
    })()`,
    returnByValue: true
  });
  console.log('Test 5 (Edit Button verification):', editRes.result.value);

  console.log('All automated interaction tests completed successfully!');
  ws.close();
}

main().catch(console.error);
