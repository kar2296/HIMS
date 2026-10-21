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

  console.log('1. Hard reloading page http://localhost:5173/#/app/allorders/1 ...');
  await send('Page.navigate', { url: 'http://localhost:5173/#/app/allorders/1' });
  await send('Page.reload', { ignoreCache: true });
  await new Promise(r => setTimeout(r, 4000));

  console.log('2. Clicking TAT button on first row (ORD-10103)...');
  const clickRes = await send('Runtime.evaluate', {
    expression: `(() => {
      const btn = document.querySelector('button[title*="Turnaround Time"], button[title*="Order TAT"]');
      if (btn) {
        btn.click();
        return 'Clicked TAT button on row 1';
      }
      return 'No TAT button found';
    })()`,
    returnByValue: true
  });
  console.log('Click result:', clickRes.result.value);

  await new Promise(r => setTimeout(r, 2500));

  console.log('3. Inspecting TatDetailsModalScreen content...');
  const modalInfo = await send('Runtime.evaluate', {
    expression: `(() => {
      const modal = document.querySelector('.modal');
      return {
        isOpen: Boolean(modal),
        title: modal?.querySelector('h3')?.innerText,
        patientText: modal?.innerText?.slice(0, 400),
        pills: Array.from(modal?.querySelectorAll('.tat-test-pill') || []).map(p => p.innerText.replace(/\\n/g, ' ')),
        buttons: Array.from(modal?.querySelectorAll('button') || []).map(b => b.innerText.trim()).filter(Boolean)
      };
    })()`,
    returnByValue: true
  });
  console.log('Modal Info:', JSON.stringify(modalInfo.result.value, null, 2));

  const shot1 = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('scripts/tat_modal_step1_timeline.png', Buffer.from(shot1.data, 'base64'));
  console.log('Saved to scripts/tat_modal_step1_timeline.png');

  console.log('4. Switching to "All Tests" overview table view...');
  const switchAllTests = await send('Runtime.evaluate', {
    expression: `(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const allTestsBtn = btns.find(b => b.innerText && b.innerText.includes('All Tests'));
      if (allTestsBtn) {
        allTestsBtn.click();
        return 'Switched to All Tests view';
      }
      return 'All Tests button not found';
    })()`,
    returnByValue: true
  });
  console.log('Switch result:', switchAllTests.result.value);
  await new Promise(r => setTimeout(r, 1000));

  const shot2 = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('scripts/tat_modal_step2_alltests.png', Buffer.from(shot2.data, 'base64'));
  console.log('Saved to scripts/tat_modal_step2_alltests.png');

  console.log('5. Clicking second test pill (BASIC PROFILE)...');
  const clickPill = await send('Runtime.evaluate', {
    expression: `(() => {
      const pills = Array.from(document.querySelectorAll('.tat-test-pill'));
      const basicProfilePill = pills.find(b => b.innerText && b.innerText.includes('BASIC PROFILE'));
      if (basicProfilePill) {
        basicProfilePill.click();
        return 'Clicked BASIC PROFILE pill';
      }
      return 'BASIC PROFILE pill not found';
    })()`,
    returnByValue: true
  });
  console.log('Pill click result:', clickPill.result.value);
  await new Promise(r => setTimeout(r, 1000));

  console.log('6. Switching back to Timeline Stepper for test 2...');
  await send('Runtime.evaluate', {
    expression: `(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const timelineBtn = btns.find(b => b.innerText && b.innerText.includes('Timeline Stepper'));
      if (timelineBtn) timelineBtn.click();
    })()`,
    returnByValue: true
  });
  await new Promise(r => setTimeout(r, 1000));

  const shot3 = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('scripts/tat_modal_step3_test2_timeline.png', Buffer.from(shot3.data, 'base64'));
  console.log('Saved to scripts/tat_modal_step3_test2_timeline.png');

  console.log('7. Switching to Audit Log Table view...');
  await send('Runtime.evaluate', {
    expression: `(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const tableBtn = btns.find(b => b.innerText && b.innerText.includes('Audit Log Table'));
      if (tableBtn) tableBtn.click();
    })()`,
    returnByValue: true
  });
  await new Promise(r => setTimeout(r, 1000));

  const shot4 = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('scripts/tat_modal_step4_audit_table.png', Buffer.from(shot4.data, 'base64'));
  console.log('Saved to scripts/tat_modal_step4_audit_table.png');

  console.log('8. Testing modal close via Close button...');
  const closeRes = await send('Runtime.evaluate', {
    expression: `(() => {
      const closeBtn = document.querySelector('.tat-close-btn');
      if (closeBtn) {
        closeBtn.click();
        return 'Clicked close button';
      }
      return 'Close button not found';
    })()`,
    returnByValue: true
  });
  console.log('Close result:', closeRes.result.value);
  await new Promise(r => setTimeout(r, 1000));

  const isModalOpen = await send('Runtime.evaluate', {
    expression: `Boolean(document.querySelector('.modal'))`,
    returnByValue: true
  });
  console.log('Is modal open after close click?', isModalOpen.result.value);

  const shot5 = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('scripts/tat_modal_step5_closed.png', Buffer.from(shot5.data, 'base64'));
  console.log('Saved to scripts/tat_modal_step5_closed.png');

  ws.close();
}

main().catch(console.error);
