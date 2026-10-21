const http = require('http');
const fs = require('fs');
const WebSocket = require('ws');

function getDevWebSocketUrl() {
  return new Promise((resolve, reject) => {
    http.get('http://127.0.0.1:9222/json', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const list = JSON.parse(data);
          const page = list.find(p => p.type === 'page');
          if (page && page.webSocketDebuggerUrl) {
            resolve(page.webSocketDebuggerUrl);
          } else {
            reject(new Error('No page found in CDP'));
          }
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

function sendCommand(ws, method, params = {}) {
  return new Promise((resolve, reject) => {
    const id = Math.floor(Math.random() * 1000000);
    const handler = (msg) => {
      const data = JSON.parse(msg);
      if (data.id === id) {
        ws.off('message', handler);
        if (data.error) reject(data.error);
        else resolve(data.result);
      }
    };
    ws.on('message', handler);
    ws.send(JSON.stringify({ id, method, params }));
  });
}

async function run() {
  console.log('Connecting to Chrome CDP...');
  const wsUrl = await getDevWebSocketUrl();
  const ws = new WebSocket(wsUrl);

  await new Promise(r => ws.on('open', r));

  console.log('Navigating to http://localhost:5174/#/app/directbilling/0/DG ...');
  await sendCommand(ws, 'Page.navigate', { url: 'http://localhost:5174/#/app/directbilling/0/DG' });
  await new Promise(r => setTimeout(r, 2500));

  // Click Previous Bills
  console.log('Clicking Previous Bills button...');
  await sendCommand(ws, 'Runtime.evaluate', {
    expression: `(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b => 
        b.innerText.trim() === 'Previous Bills'
      );
      if (btn) btn.click();
    })()`
  });
  await new Promise(r => setTimeout(r, 2000));

  // Select the bill row or checkbox
  console.log('Selecting bill from previous bills list...');
  const selectRes = await sendCommand(ws, 'Runtime.evaluate', {
    expression: `(() => {
      const selectBtn = document.querySelector('button i.fa-check, button i.fa-check-square, tr button');
      if (selectBtn) {
        selectBtn.closest('button').click();
        return { clickedBtn: true };
      }
      const checkOrRow = document.querySelector('table tbody tr');
      if (checkOrRow) {
        checkOrRow.click();
        return { clickedRow: true };
      }
      return { found: false };
    })()`,
    returnByValue: true
  });
  console.log('Select result:', selectRes.result.value);

  // Wait 2.5s for bill to load into form
  await new Promise(r => setTimeout(r, 2500));

  // Verify bill loaded and services locked
  const billStatus = await sendCommand(ws, 'Runtime.evaluate', {
    expression: `(() => {
      const billBadge = document.querySelector('span[style*="Bill #:"]')?.innerText || 
                        Array.from(document.querySelectorAll('*')).find(el => el.innerText && el.innerText.includes('Bill #:'))?.innerText;
      const lockedBadges = Array.from(document.querySelectorAll('*')).filter(el => el.innerText && el.innerText.includes('Locked')).length;
      const disabledInputs = Array.from(document.querySelectorAll('input:disabled, select:disabled')).length;

      return {
        billBadge,
        lockedBadges,
        disabledInputs
      };
    })()`,
    returnByValue: true
  });
  console.log('Loaded bill status:', billStatus.result.value);

  const ss = await sendCommand(ws, 'Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('direct_billing_loaded_from_previous_bills.png', Buffer.from(ss.data, 'base64'));
  console.log('Saved screenshot direct_billing_loaded_from_previous_bills.png');

  ws.close();
  console.log('Done!');
}

run().catch(err => {
  console.error('Error running test:', err);
  process.exit(1);
});
