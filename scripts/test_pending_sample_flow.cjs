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

  console.log('1. Navigating to samplecollectionlist...');
  await send('Runtime.evaluate', {
    expression: `window.location.hash = '#/app/samplecollectionlist';`
  });
  await new Promise(r => setTimeout(r, 2000));

  // Find the action button in the table and click it
  console.log('2. Clicking action button on the pending sample item...');
  const clickRes = await send('Runtime.evaluate', {
    expression: `(() => {
      const actionBtn = document.querySelector('table tbody tr td:last-child a, table tbody tr td:last-child button, table tbody tr td:last-child i');
      if (actionBtn) {
        actionBtn.click();
        return { clicked: true, tag: actionBtn.tagName };
      }
      return { clicked: false };
    })()`,
    returnByValue: true
  });
  console.log('Action button click result:', clickRes.result.value);

  // Wait for navigation and data load
  await new Promise(r => setTimeout(r, 2500));

  const pageState = await send('Runtime.evaluate', {
    expression: `(() => {
      return {
        url: window.location.hash,
        title: document.querySelector('h2')?.innerText,
        patientName: document.querySelector('.orderack-patient-card span')?.innerText,
        kpis: Array.from(document.querySelectorAll('.pkg-stat-card .pkg-stat-value')).map(el => el.innerText),
        tableRowCount: document.querySelectorAll('#tblSampleCollectionItems tbody tr').length,
        saveBtnDisabled: document.getElementById('btnSaveSampleCollection')?.disabled,
        saveBtnText: document.getElementById('btnSaveSampleCollection')?.innerText
      };
    })()`,
    returnByValue: true
  });
  console.log('Page state in pending sample:', JSON.stringify(pageState.result.value, null, 2));

  // Capture top screenshot
  const shot1 = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('samplecollect_pending_top.png', Buffer.from(shot1.data, 'base64'));
  console.log('Saved samplecollect_pending_top.png');

  // Scroll down to action bar
  await send('Runtime.evaluate', {
    expression: `window.scrollTo({ top: document.body.scrollHeight, behavior: 'instant' });`
  });
  await new Promise(r => setTimeout(r, 500));

  const shot2 = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('samplecollect_pending_bottom.png', Buffer.from(shot2.data, 'base64'));
  console.log('Saved samplecollect_pending_bottom.png');

  // Test toggling Deselect All
  console.log('3. Toggling Deselect All on pending sample...');
  await send('Runtime.evaluate', {
    expression: `(() => {
      const btn = document.getElementById('btnToggleSelectAll');
      if (btn) btn.click();
    })()`
  });
  await new Promise(r => setTimeout(r, 600));

  const deselectedState = await send('Runtime.evaluate', {
    expression: `(() => {
      const saveBtn = document.getElementById('btnSaveSampleCollection');
      const selectedKpi = Array.from(document.querySelectorAll('.pkg-stat-card'))
        .find(c => c.innerText.includes('Selected'))?.querySelector('.pkg-stat-value')?.innerText;
      return {
        selectedKpi,
        saveBtnDisabled: saveBtn ? saveBtn.disabled : null,
        saveBtnText: saveBtn ? saveBtn.innerText : null
      };
    })()`,
    returnByValue: true
  });
  console.log('After Deselect All on pending sample:', JSON.stringify(deselectedState.result.value, null, 2));

  const shot3 = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('samplecollect_pending_deselected.png', Buffer.from(shot3.data, 'base64'));
  console.log('Saved samplecollect_pending_deselected.png');

  // Re-select all
  console.log('4. Re-selecting All...');
  await send('Runtime.evaluate', {
    expression: `(() => {
      const btn = document.getElementById('btnToggleSelectAll');
      if (btn) btn.click();
    })()`
  });
  await new Promise(r => setTimeout(r, 600));

  const reselectedState = await send('Runtime.evaluate', {
    expression: `(() => {
      const saveBtn = document.getElementById('btnSaveSampleCollection');
      const selectedKpi = Array.from(document.querySelectorAll('.pkg-stat-card'))
        .find(c => c.innerText.includes('Selected'))?.querySelector('.pkg-stat-value')?.innerText;
      return {
        selectedKpi,
        saveBtnDisabled: saveBtn ? saveBtn.disabled : null,
        saveBtnText: saveBtn ? saveBtn.innerText : null
      };
    })()`,
    returnByValue: true
  });
  console.log('After Re-Select on pending sample:', JSON.stringify(reselectedState.result.value, null, 2));

  ws.close();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
