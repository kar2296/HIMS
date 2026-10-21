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

  // Wait 3 seconds for load and React render
  await new Promise(r => setTimeout(r, 3000));

  // Check buttons
  const res = await sendCommand(ws, 'Runtime.evaluate', {
    expression: `(() => {
      const allButtons = Array.from(document.querySelectorAll('button')).map(b => ({
        text: b.innerText.trim(),
        title: b.getAttribute('title') || '',
        classes: b.className
      }));

      const prevBillButtons = allButtons.filter(b => 
        b.text.toLowerCase().includes('previous bills') || 
        b.title.toLowerCase().includes('previous bills')
      );

      return {
        totalButtons: allButtons.length,
        prevBillButtons,
        allButtonsSummary: allButtons.map(b => b.text || b.title).filter(Boolean)
      };
    })()`,
    returnByValue: true
  });

  console.log('Button evaluation results:', JSON.stringify(res.result.value, null, 2));

  // Capture screenshot of screen showing the Previous Bills buttons
  const ss1 = await sendCommand(ws, 'Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('direct_billing_previous_bills_showing.png', Buffer.from(ss1.data, 'base64'));
  console.log('Screenshot saved to direct_billing_previous_bills_showing.png');

  // Now click the Previous Bills button
  console.log('Clicking the Previous Bills button...');
  const clickRes = await sendCommand(ws, 'Runtime.evaluate', {
    expression: `(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b => 
        b.innerText.toLowerCase().includes('previous bills') || 
        (b.getAttribute('title') && b.getAttribute('title').toLowerCase().includes('previous bills'))
      );
      if (btn) {
        btn.click();
        return { clicked: true, text: btn.innerText.trim() };
      }
      return { clicked: false };
    })()`,
    returnByValue: true
  });
  console.log('Click result:', clickRes.result.value);

  // Wait for modal to open
  await new Promise(r => setTimeout(r, 2000));

  // Check modal state
  const modalRes = await sendCommand(ws, 'Runtime.evaluate', {
    expression: `(() => {
      const modal = document.querySelector('.modal, [role="dialog"], .modal-dialog');
      const modalTitles = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, .modal-title')).map(h => h.innerText.trim());
      return {
        hasModal: !!modal || !!document.querySelector('.hims-modal-overlay'),
        modalTitles,
        bodyTextSnippet: document.body.innerText.substring(0, 500)
      };
    })()`,
    returnByValue: true
  });
  console.log('Modal status:', JSON.stringify(modalRes.result.value, null, 2));

  // Capture screenshot of opened modal
  const ss2 = await sendCommand(ws, 'Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('direct_billing_previous_bills_modal_open.png', Buffer.from(ss2.data, 'base64'));
  console.log('Screenshot of opened modal saved to direct_billing_previous_bills_modal_open.png');

  ws.close();
  console.log('Done!');
}

run().catch(err => {
  console.error('Error running test:', err);
  process.exit(1);
});
