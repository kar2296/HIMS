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

  const pageTarget = targets.find((t) => t.type === 'page' && !t.url.includes('chrome://'));
  if (!pageTarget) {
    console.error('No page target found');
    process.exit(1);
  }

  console.log('Connecting to page:', pageTarget.url);
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

  console.log('1. Navigating to http://localhost:5173/#/app/samplereviewlist...');
  await send('Runtime.evaluate', {
    expression: `window.location.href = "http://localhost:5173/#/app/samplereviewlist";`,
  });

  console.log('Waiting 4 seconds for Vite compilation & Angular/React bridge mount...');
  await new Promise((r) => setTimeout(r, 4500));

  // Inspect page DOM
  console.log('2. Inspecting page DOM and React components...');
  const domState = await send('Runtime.evaluate', {
    expression: `(() => {
      const title = document.querySelector('.pkg-header-title')?.innerText;
      const tag = document.querySelector('.pkg-header-tag')?.innerText;
      const kpis = Array.from(document.querySelectorAll('.pkg-stat-card')).map(card => ({
        label: card.querySelector('.pkg-stat-label')?.innerText,
        value: card.querySelector('.pkg-stat-value')?.innerText,
        subtext: card.querySelector('.pkg-stat-subtext')?.innerText
      }));
      const presets = Array.from(document.querySelectorAll('.orderack-preset-chip')).map(b => b.innerText.trim());
      const rows = Array.from(document.querySelectorAll('.pkg-table tbody tr')).map(tr => {
        const cells = Array.from(tr.querySelectorAll('td')).map(td => td.innerText.replace(/\\n+/g, ' ').trim());
        return {
          colCount: cells.length,
          snippet: cells.slice(0, 5).join(' | ')
        };
      });
      const hasReviewBtn = !!document.querySelector('button[title*="Review"]');
      const hasTatBtn = !!document.querySelector('button[title*="TAT"], button[title*="Turnaround"]');

      return {
        title,
        tag,
        kpiCount: kpis.length,
        kpis,
        presets,
        rowCount: rows.length,
        rowSample: rows.slice(0, 3),
        hasReviewBtn,
        hasTatBtn
      };
    })()`,
    returnByValue: true,
  });

  console.log('DOM State:', JSON.stringify(domState.result.value, null, 2));

  // Capture Main Screenshot
  console.log('3. Capturing main screenshot...');
  const screenshot1 = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('scripts/samplereview_modern_live.png', Buffer.from(screenshot1.data, 'base64'));
  console.log('Screenshot saved to scripts/samplereview_modern_live.png');

  // Test Clicking Order TAT button if rows exist
  if (domState.result.value?.rowCount > 0 && domState.result.value?.hasTatBtn) {
    console.log('4. Testing Order TAT button click...');
    await send('Runtime.evaluate', {
      expression: `(() => {
        const tatBtn = document.querySelector('button[title*="TAT"], button[title*="Turnaround"]');
        if (tatBtn) tatBtn.click();
      })()`,
    });

    await new Promise((r) => setTimeout(r, 2000));

    // Check if modal opened
    const modalCheck = await send('Runtime.evaluate', {
      expression: `(() => {
        const modal = document.querySelector('.modal-dialog, .modal-content, [name="TatDetailsModalScreen"]');
        return {
          isOpen: !!modal,
          modalTitle: document.querySelector('.modal-title, .tat-modal-header, h2, h3, h4')?.innerText,
          bodySnippet: modal?.innerText?.slice(0, 300)
        };
      })()`,
      returnByValue: true,
    });
    console.log('Modal check:', JSON.stringify(modalCheck.result.value, null, 2));

    const screenshot2 = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('scripts/samplereview_tat_modal_verified.png', Buffer.from(screenshot2.data, 'base64'));
    console.log('Modal screenshot saved to scripts/samplereview_tat_modal_verified.png');
  }

  ws.close();
}

main().catch(console.error);
