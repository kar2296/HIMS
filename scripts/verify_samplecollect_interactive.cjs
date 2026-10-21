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
  if (!pageTarget) {
    console.error('No page target found on localhost:5174');
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

  console.log('1. Navigating to Sample Collections screen (#/app/samplecollect/6670)...');
  await send('Runtime.evaluate', {
    expression: `window.location.hash = '#/app/samplecollect/6670';`
  });

  await new Promise(r => setTimeout(r, 2000));

  // Reload to ensure fresh bundles
  await send('Page.reload', { ignoreCache: true });
  await new Promise(r => setTimeout(r, 3000));

  // Evaluate page status
  const statusRes = await send('Runtime.evaluate', {
    expression: `(() => {
      const title = document.querySelector('h2')?.innerText;
      const patientName = document.querySelector('.orderack-patient-card span')?.innerText;
      const rows = document.querySelectorAll('#tblSampleCollectionItems tbody tr');
      const kpis = Array.from(document.querySelectorAll('.pkg-stat-card .pkg-stat-value')).map(el => el.innerText);
      const saveBtn = document.getElementById('btnSaveSampleCollection');
      return {
        title,
        patientName,
        rowCount: rows.length,
        kpis,
        saveBtnDisabled: saveBtn ? saveBtn.disabled : null,
        saveBtnText: saveBtn ? saveBtn.innerText : null
      };
    })()`,
    returnByValue: true
  });

  console.log('Status after initial load:', JSON.stringify(statusRes.result.value, null, 2));

  // Capture full view
  const shot1 = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('samplecollect_test_initial.png', Buffer.from(shot1.data, 'base64'));
  console.log('Saved samplecollect_test_initial.png');

  // 2. Click "Deselect All" button
  console.log('2. Clicking Deselect All...');
  await send('Runtime.evaluate', {
    expression: `(() => {
      const btn = document.getElementById('btnToggleSelectAll');
      if (btn) btn.click();
    })()`
  });

  await new Promise(r => setTimeout(r, 600));

  const afterDeselect = await send('Runtime.evaluate', {
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
  console.log('After Deselect All:', JSON.stringify(afterDeselect.result.value, null, 2));

  // Capture Deselect All screenshot
  const shot2 = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('samplecollect_test_deselected.png', Buffer.from(shot2.data, 'base64'));
  console.log('Saved samplecollect_test_deselected.png');

  // 3. Click Specimen Group Checkbox (first group)
  console.log('3. Clicking first Specimen Group Checkbox...');
  await send('Runtime.evaluate', {
    expression: `(() => {
      const chk = document.getElementById('chkSpecimenGroup_0');
      if (chk) chk.click();
    })()`
  });

  await new Promise(r => setTimeout(r, 600));

  const afterSpecimenSelect = await send('Runtime.evaluate', {
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
  console.log('After Specimen Group Select:', JSON.stringify(afterSpecimenSelect.result.value, null, 2));

  // 4. Click Select All again to restore full selection
  console.log('4. Clicking Select All again...');
  await send('Runtime.evaluate', {
    expression: `(() => {
      const btn = document.getElementById('btnToggleSelectAll');
      if (btn) btn.click();
    })()`
  });

  await new Promise(r => setTimeout(r, 600));

  const afterReSelect = await send('Runtime.evaluate', {
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
  console.log('After Re-Select All:', JSON.stringify(afterReSelect.result.value, null, 2));

  // 5. Test typing Rejection / Phlebotomy Notes
  console.log('5. Entering phlebotomy test remarks...');
  await send('Runtime.evaluate', {
    expression: `(() => {
      const input = document.getElementById('rejectionRemarks');
      if (input) {
        const valSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
        valSetter.call(input, 'Verified vein site, routine collection per protocol.');
        input.dispatchEvent(new Event('input', { bubbles: true }));
      }
    })()`
  });

  await new Promise(r => setTimeout(r, 500));

  // 6. Test Back to List navigation
  console.log('6. Clicking Back to List button...');
  await send('Runtime.evaluate', {
    expression: `(() => {
      const backBtn = document.getElementById('btnBackToSampleListTop');
      if (backBtn) backBtn.click();
    })()`
  });

  await new Promise(r => setTimeout(r, 1500));

  const afterBack = await send('Runtime.evaluate', {
    expression: `(() => {
      return {
        currentHash: window.location.hash
      };
    })()`,
    returnByValue: true
  });
  console.log('After Back to List click:', JSON.stringify(afterBack.result.value, null, 2));

  const shot3 = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('samplecollect_test_back_to_list.png', Buffer.from(shot3.data, 'base64'));
  console.log('Saved samplecollect_test_back_to_list.png');

  // Return to the sample screen for final presentation
  await send('Runtime.evaluate', {
    expression: `window.location.hash = '#/app/samplecollect/6670';`
  });
  await new Promise(r => setTimeout(r, 1500));

  const shotFinal = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('samplecollect_final_verified.png', Buffer.from(shotFinal.data, 'base64'));
  console.log('Saved samplecollect_final_verified.png');

  ws.close();
  console.log('Interactive verification completed successfully!');
}

main().catch(err => {
  console.error('Error running test script:', err);
  process.exit(1);
});
