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

  console.log('1. Navigating to http://localhost:5173/#/app/allorders/1 ...');
  await send('Runtime.evaluate', {
    expression: `window.location.href = "http://localhost:5173/#/app/allorders/1";`
  });

  console.log('Waiting 5 seconds for Vite compile & React bridge render...');
  await new Promise(r => setTimeout(r, 5000));

  console.log('2. Inspecting DOM state...');
  const domState = await send('Runtime.evaluate', {
    expression: `(() => {
      const el = document.querySelector('react-component[name="AllOrdersProcessListScreen"]');
      const title = document.querySelector('.pkg-header-title')?.innerText;
      const tag = document.querySelector('.pkg-header-tag')?.innerText;
      const kpis = Array.from(document.querySelectorAll('.pkg-stat-card')).map(c => ({
        label: c.querySelector('.pkg-stat-label')?.innerText,
        value: c.querySelector('.pkg-stat-value')?.innerText,
        subtext: c.querySelector('.pkg-stat-subtext')?.innerText
      }));
      const presets = Array.from(document.querySelectorAll('.orderack-preset-chip')).map(b => b.innerText.trim());
      const rows = Array.from(document.querySelectorAll('.pkg-table tbody tr')).map(tr => {
        const cells = Array.from(tr.querySelectorAll('td')).map(td => td.innerText.replace(/\\n+/g, ' ').trim());
        return {
          colCount: cells.length,
          snippet: cells.slice(0, 6).join(' | ')
        };
      });

      const scope = angular.element(document.querySelector('.content-wrapper') || document.body).scope();

      return {
        hasReactComponent: !!el,
        title,
        tag,
        kpiCount: kpis.length,
        kpis,
        presets,
        rowCount: rows.length,
        firstThreeRows: rows.slice(0, 3),
        scopeDataCount: scope?.reactProps?.rows?.length || 0,
        scopeTotalItems: scope?.reactProps?.totalItems || 0
      };
    })()`,
    returnByValue: true
  });

  console.log('DOM State:', JSON.stringify(domState.result.value, null, 2));

  console.log('3. Capturing screenshot of modern React screen...');
  const shot1 = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('scripts/allorders_react_screen.png', Buffer.from(shot1.data, 'base64'));
  console.log('Saved scripts/allorders_react_screen.png');

  // Test interactive date preset (Last 30 Days)
  console.log('4. Testing interactive Preset click (Last 30 Days)...');
  await send('Runtime.evaluate', {
    expression: `(() => {
      const chips = Array.from(document.querySelectorAll('.orderack-preset-chip'));
      const btn30 = chips.find(b => b.innerText.includes('30 Days'));
      if (btn30) btn30.click();
    })()`
  });

  await new Promise(r => setTimeout(r, 2500));

  const after30Days = await send('Runtime.evaluate', {
    expression: `(() => {
      const rows = Array.from(document.querySelectorAll('.pkg-table tbody tr')).map(tr => {
        const cells = Array.from(tr.querySelectorAll('td')).map(td => td.innerText.replace(/\\n+/g, ' ').trim());
        return cells.slice(0, 6).join(' | ');
      });
      return {
        rowCount: rows.length,
        firstRow: rows[0] || null
      };
    })()`,
    returnByValue: true
  });

  console.log('After 30 Days Click:', JSON.stringify(after30Days.result.value, null, 2));

  const shot2 = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('scripts/allorders_react_30days.png', Buffer.from(shot2.data, 'base64'));
  console.log('Saved scripts/allorders_react_30days.png');

  ws.close();
}

main().catch(console.error);
