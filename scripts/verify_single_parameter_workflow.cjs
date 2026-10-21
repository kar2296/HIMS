const http = require('http');
const WebSocket = require('ws');
const fs = require('fs');
const Sequelize = require('sequelize');
const dotenv = require('dotenv');
dotenv.config({ path: './api/.env' });

const sequelize = new Sequelize(process.env.DATABASE_NAME, process.env.DATABASE_USER_NAME, process.env.DATABASE_PASSWORD, {
  host: process.env.DATABASE_HOST_NAME || 'localhost',
  port: process.env.DATABASE_PORT || 3307,
  dialect: 'mysql',
  logging: false
});

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

  console.log('--- STEP 1: Deselect All ---');
  await send('Runtime.evaluate', {
    expression: `(() => {
      const btn = document.getElementById('btnToggleSelectAll');
      if (btn) btn.click();
    })()`
  });
  await new Promise(r => setTimeout(r, 600));

  console.log('--- STEP 2: Select ONLY HAEMOGLOBIN ---');
  const selectRes = await send('Runtime.evaluate', {
    expression: `(() => {
      const trs = Array.from(document.querySelectorAll('#tblSampleCollectionItems tbody tr'));
      let clicked = false;
      for (const tr of trs) {
        if (tr.innerText.includes('HAEMOGLOBIN') && !tr.querySelector('.specimen-group-checkbox')) {
          const chk = tr.querySelector('input[type="checkbox"]');
          if (chk && !chk.checked && !chk.disabled) {
            chk.click();
            clicked = true;
          }
        }
      }
      return { clicked };
    })()`,
    returnByValue: true
  });
  console.log('Selected HAEMOGLOBIN result:', selectRes.result.value);
  await new Promise(r => setTimeout(r, 600));

  // Verify checked state of rows before saving
  const checkedBeforeSave = await send('Runtime.evaluate', {
    expression: `(() => {
      const trs = Array.from(document.querySelectorAll('#tblSampleCollectionItems tbody tr'));
      return trs.filter(tr => !tr.querySelector('.specimen-group-checkbox')).map(tr => ({
        name: tr.innerText.split('\\n')[1] || tr.innerText.split('\\t')[1] || tr.innerText,
        checked: tr.querySelector('input[type="checkbox"]')?.checked,
        disabled: tr.querySelector('input[type="checkbox"]')?.disabled
      }));
    })()`,
    returnByValue: true
  });
  console.log('Checked states before save:', JSON.stringify(checkedBeforeSave.result.value, null, 2));

  console.log('--- STEP 3: Click Save Collection ---');
  const saveBtnClick = await send('Runtime.evaluate', {
    expression: `(() => {
      const btn = document.getElementById('btnSaveSampleCollection');
      if (btn) {
        btn.click();
        return { clicked: true, text: btn.innerText };
      }
      return { clicked: false };
    })()`,
    returnByValue: true
  });
  console.log('Save button clicked:', saveBtnClick.result.value);

  // Wait 4 seconds for API request and response
  await new Promise(r => setTimeout(r, 4500));

  // Capture screenshot after first save
  const shot1 = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('scripts/after_single_hb_collected.png', Buffer.from(shot1.data, 'base64'));
  console.log('Saved scripts/after_single_hb_collected.png');

  // Query Database to verify:
  const [dbDetails1] = await sequelize.query('SELECT WorkOrderSampleDetailId, SampleIdentifier, TestId, TestName, SampleDetailStatusId, CollectedDate FROM workordersampledetails WHERE WorkOrderSampleId = 6677 ORDER BY WorkOrderSampleDetailId ASC');
  console.log('--- DB DETAILS AFTER COLLECTING HAEMOGLOBIN ---');
  console.table(dbDetails1);

  const hbDetail = dbDetails1.find(d => d.TestId === 440);
  const rbcDetail = dbDetails1.find(d => d.TestId === 1282);
  const otherDetails = dbDetails1.filter(d => d.TestId !== 440 && d.TestId !== 1282);

  console.log('HAEMOGLOBIN SampleIdentifier:', hbDetail.SampleIdentifier, 'Status:', hbDetail.SampleDetailStatusId);
  console.log('RBC SampleIdentifier:', rbcDetail.SampleIdentifier, 'Status:', rbcDetail.SampleDetailStatusId);
  console.log('Other 4 pending items SampleIdentifiers:', otherDetails.map(d => ({ name: d.TestName, id: d.SampleIdentifier, status: d.SampleDetailStatusId })));

  const hbSampleNo = hbDetail.SampleIdentifier;
  if (!hbSampleNo) {
    throw new Error('FAILED: HAEMOGLOBIN was not assigned a SampleIdentifier!');
  }
  if (hbSampleNo === rbcDetail.SampleIdentifier) {
    throw new Error('FAILED: HAEMOGLOBIN got the same sample number as RBC instead of a new one!');
  }
  const anyOtherGotId = otherDetails.some(d => d.SampleIdentifier !== null);
  if (anyOtherGotId) {
    throw new Error('FAILED: One of the pending unselected items received a SampleIdentifier unexpectedly!');
  }
  console.log('>>> SUCCESS: Only HAEMOGLOBIN received a new sample number (' + hbSampleNo + ')! The other 4 pending items remain NULL.');

  // Now STEP 4: Collect ANOTHER pending parameter: e.g. "PLATELET COUNT"
  console.log('\n--- STEP 4: Now collecting another pending parameter: PLATELET COUNT ---');
  // Refresh page to sync completely
  await send('Page.reload', { ignoreCache: true });
  await new Promise(r => setTimeout(r, 3500));

  // Deselect all
  await send('Runtime.evaluate', {
    expression: `(() => {
      const btn = document.getElementById('btnToggleSelectAll');
      if (btn) btn.click();
    })()`
  });
  await new Promise(r => setTimeout(r, 600));

  // Select ONLY PLATELET COUNT
  await send('Runtime.evaluate', {
    expression: `(() => {
      const trs = Array.from(document.querySelectorAll('#tblSampleCollectionItems tbody tr'));
      for (const tr of trs) {
        if (tr.innerText.includes('PLATELET') && !tr.querySelector('.specimen-group-checkbox')) {
          const chk = tr.querySelector('input[type="checkbox"]');
          if (chk && !chk.checked && !chk.disabled) chk.click();
        }
      }
    })()`
  });
  await new Promise(r => setTimeout(r, 600));

  // Save PLATELET COUNT
  console.log('Clicking Save for PLATELET COUNT...');
  await send('Runtime.evaluate', {
    expression: `(() => {
      const btn = document.getElementById('btnSaveSampleCollection');
      if (btn) btn.click();
    })()`
  });
  await new Promise(r => setTimeout(r, 4500));

  // Capture screenshot after second save
  const shot2 = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('scripts/after_platelet_collected.png', Buffer.from(shot2.data, 'base64'));
  console.log('Saved scripts/after_platelet_collected.png');

  // Query Database to verify:
  const [dbDetails2] = await sequelize.query('SELECT WorkOrderSampleDetailId, SampleIdentifier, TestId, TestName, SampleDetailStatusId, CollectedDate FROM workordersampledetails WHERE WorkOrderSampleId = 6677 ORDER BY WorkOrderSampleDetailId ASC');
  console.log('--- DB DETAILS AFTER COLLECTING PLATELET COUNT ---');
  console.table(dbDetails2);

  const plateletDetail = dbDetails2.find(d => d.TestId === 450);
  const remainingPending = dbDetails2.filter(d => d.TestId !== 440 && d.TestId !== 1282 && d.TestId !== 450);

  console.log('PLATELET SampleIdentifier:', plateletDetail.SampleIdentifier, 'Status:', plateletDetail.SampleDetailStatusId);
  console.log('Remaining 3 pending items:', remainingPending.map(d => ({ name: d.TestName, id: d.SampleIdentifier, status: d.SampleDetailStatusId })));

  if (!plateletDetail.SampleIdentifier) {
    throw new Error('FAILED: PLATELET COUNT was not assigned a SampleIdentifier!');
  }
  if (plateletDetail.SampleIdentifier === hbSampleNo) {
    throw new Error('FAILED: PLATELET COUNT got the same sample number as HAEMOGLOBIN instead of a new distinct one!');
  }
  const remainingGotId = remainingPending.some(d => d.SampleIdentifier !== null);
  if (remainingGotId) {
    throw new Error('FAILED: Remaining pending items received a SampleIdentifier unexpectedly!');
  }

  console.log('\n======================================================');
  console.log('ALL VERIFICATIONS PASSED PERFECTLY!');
  console.log('RBC Sample ID:        ' + rbcDetail.SampleIdentifier);
  console.log('HAEMOGLOBIN Sample ID: ' + hbSampleNo);
  console.log('PLATELET Sample ID:   ' + plateletDetail.SampleIdentifier);
  console.log('Remaining pending items have SampleIdentifier = NULL and are ready for future collection.');
  console.log('======================================================');

  ws.close();
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
