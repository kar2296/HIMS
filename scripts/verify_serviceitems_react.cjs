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

  const pageTarget = targets.find(t => t.url.includes('localhost:5174'));
  if (!pageTarget) {
    console.error('No localhost:5174 tab found');
    return;
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

  console.log('Navigating and reloading serviceitems...');
  await send('Page.navigate', { url: 'http://localhost:5174/#/app/serviceitems' });
  await new Promise(r => setTimeout(r, 4000));

  // Check state
  const inspectResult = await send('Runtime.evaluate', {
    returnByValue: true,
    expression: `(() => {
      const container = document.querySelector('.srv-page-container');
      const title = document.querySelector('.srv-header-title')?.innerText;
      const stats = Array.from(document.querySelectorAll('.srv-stat-card')).map(c => ({
        label: c.querySelector('.srv-stat-label')?.innerText,
        val: c.querySelector('.srv-stat-value')?.innerText
      }));
      const rows = Array.from(document.querySelectorAll('.srv-table tbody tr')).map(r => ({
        idx: r.querySelector('.srv-col-idx')?.innerText,
        code: r.querySelector('.srv-code-badge')?.innerText,
        name: r.querySelector('.srv-name-primary')?.innerText,
        dept: r.querySelector('.srv-dept-text')?.innerText,
        category: r.querySelector('.srv-category-text')?.innerText,
        cost: r.querySelector('.srv-cost-val')?.innerText,
        status: r.querySelector('.srv-status-pill')?.innerText?.trim()
      }));
      const paginationInfo = document.querySelector('.srv-pagination-info')?.innerText;
      return {
        hasContainer: !!container,
        title,
        stats,
        rowCount: rows.length,
        firstThreeRows: rows.slice(0, 3),
        paginationInfo
      };
    })()`
  });

  console.log('Initial React State:', JSON.stringify(inspectResult.result.value, null, 2));

  // Screenshot 1: React Verified Screen
  const shot1 = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('serviceitems_react_verified.png', Buffer.from(shot1.data, 'base64'));
  console.log('Saved serviceitems_react_verified.png');

  // Test 1: Test Advanced Filters Drawer Toggle
  console.log('Testing Advanced Filters toggle...');
  await send('Runtime.evaluate', {
    expression: `(() => {
      const btn = document.getElementById('btnToggleAdvanced');
      if (btn) btn.click();
    })()`
  });
  await new Promise(r => setTimeout(r, 600));

  const advState = await send('Runtime.evaluate', {
    returnByValue: true,
    expression: `(() => {
      const panel = document.querySelector('.srv-advanced-panel');
      const chips = document.querySelectorAll('.srv-flag-chip').length;
      return { hasPanel: !!panel, flagChipCount: chips };
    })()`
  });
  console.log('Advanced panel state:', JSON.stringify(advState.result.value));

  const shotAdv = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('serviceitems_advanced_drawer.png', Buffer.from(shotAdv.data, 'base64'));
  console.log('Saved serviceitems_advanced_drawer.png');

  // Close advanced drawer
  await send('Runtime.evaluate', {
    expression: `(() => {
      const btn = document.getElementById('btnToggleAdvanced');
      if (btn) btn.click();
    })()`
  });
  await new Promise(r => setTimeout(r, 400));

  // Test 2: Search for "EMERGENCY"
  console.log('Testing search for EMERGENCY...');
  await send('Runtime.evaluate', {
    expression: `(() => {
      const inp = document.getElementById('inputSearchService');
      const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
      setter.call(inp, 'EMERGENCY');
      inp.dispatchEvent(new Event('input', { bubbles: true }));
      const btn = document.getElementById('btnFilterSearch');
      if (btn) btn.click();
    })()`
  });
  await new Promise(r => setTimeout(r, 2500));

  const searchResults = await send('Runtime.evaluate', {
    returnByValue: true,
    expression: `(() => {
      const rows = Array.from(document.querySelectorAll('.srv-table tbody tr')).map(r => ({
        code: r.querySelector('.srv-code-badge')?.innerText,
        name: r.querySelector('.srv-name-primary')?.innerText,
        dept: r.querySelector('.srv-dept-text')?.innerText
      }));
      const paginationInfo = document.querySelector('.srv-pagination-info')?.innerText;
      return {
        rowCount: rows.length,
        paginationInfo,
        sample: rows.slice(0, 3)
      };
    })()`
  });
  console.log('Search Results for EMERGENCY:', JSON.stringify(searchResults.result.value, null, 2));

  const shotSearch = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('serviceitems_search_verified.png', Buffer.from(shotSearch.data, 'base64'));
  console.log('Saved serviceitems_search_verified.png');

  // Test 3: Reset Filters
  console.log('Testing Reset Filters...');
  await send('Runtime.evaluate', {
    expression: `(() => {
      const btn = document.getElementById('btnFilterReset');
      if (btn) btn.click();
    })()`
  });
  await new Promise(r => setTimeout(r, 2500));

  const resetResults = await send('Runtime.evaluate', {
    returnByValue: true,
    expression: `(() => {
      const rows = Array.from(document.querySelectorAll('.srv-table tbody tr')).map(r => ({
        code: r.querySelector('.srv-code-badge')?.innerText,
        name: r.querySelector('.srv-name-primary')?.innerText
      }));
      const paginationInfo = document.querySelector('.srv-pagination-info')?.innerText;
      return {
        rowCount: rows.length,
        paginationInfo,
        firstRow: rows[0]
      };
    })()`
  });
  console.log('Reset Results:', JSON.stringify(resetResults.result.value, null, 2));

  // Test 4: Pagination to Page 2
  console.log('Testing Pagination to Page 2...');
  await send('Runtime.evaluate', {
    expression: `(() => {
      const pageButtons = Array.from(document.querySelectorAll('.srv-pagination-controls button'));
      const p2 = pageButtons.find(b => b.innerText.trim() === '2');
      if (p2) p2.click();
    })()`
  });
  await new Promise(r => setTimeout(r, 2500));

  const p2Results = await send('Runtime.evaluate', {
    returnByValue: true,
    expression: `(() => {
      const rows = Array.from(document.querySelectorAll('.srv-table tbody tr')).map(r => ({
        idx: r.querySelector('.srv-col-idx')?.innerText,
        code: r.querySelector('.srv-code-badge')?.innerText,
        name: r.querySelector('.srv-name-primary')?.innerText
      }));
      const paginationInfo = document.querySelector('.srv-pagination-info')?.innerText;
      return {
        rowCount: rows.length,
        paginationInfo,
        firstRow: rows[0]
      };
    })()`
  });
  console.log('Page 2 Results:', JSON.stringify(p2Results.result.value, null, 2));

  // Test 5: Click Edit button on the first row of current page
  console.log('Testing Edit button navigation...');
  const editTarget = await send('Runtime.evaluate', {
    returnByValue: true,
    expression: `(() => {
      const editBtn = document.querySelector('.srv-action-edit');
      const itemCode = document.querySelector('.srv-code-badge')?.innerText;
      if (editBtn) {
        editBtn.click();
        return { clicked: true, itemCode };
      }
      return { clicked: false };
    })()`
  });
  console.log('Edit clicked:', JSON.stringify(editTarget.result.value));
  await new Promise(r => setTimeout(r, 2000));

  const postNavUrl = await send('Runtime.evaluate', {
    returnByValue: true,
    expression: `window.location.href`
  });
  console.log('Navigated URL after Edit click:', postNavUrl.result.value);

  const shotNav = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('serviceitems_edit_navigated.png', Buffer.from(shotNav.data, 'base64'));
  console.log('Saved serviceitems_edit_navigated.png');

  // Navigate back to serviceitems
  await send('Page.navigate', { url: 'http://localhost:5174/#/app/serviceitems' });
  await new Promise(r => setTimeout(r, 3000));

  const shotFinal = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('serviceitems_final_presentation.png', Buffer.from(shotFinal.data, 'base64'));
  console.log('Saved serviceitems_final_presentation.png');

  ws.close();
}

main().catch(console.error);
