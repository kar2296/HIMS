const http = require('http');
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
  const wsUrl = await getDevWebSocketUrl();
  const ws = new WebSocket(wsUrl);
  await new Promise(r => ws.on('open', r));

  const res = await sendCommand(ws, 'Runtime.evaluate', {
    expression: `(() => {
      const rows = Array.from(document.querySelectorAll('table tbody tr'));
      return {
        rowCount: rows.length,
        rows: rows.map(r => ({
          text: r.innerText.replace(/\\n/g, ' '),
          buttons: Array.from(r.querySelectorAll('button')).map(b => ({
            html: b.outerHTML,
            title: b.title
          }))
        }))
      };
    })()`,
    returnByValue: true
  });
  console.log('Result:', JSON.stringify(res.result.value, null, 2));

  // Now click the select button
  const click = await sendCommand(ws, 'Runtime.evaluate', {
    expression: `(() => {
      const btn = document.querySelector('table tbody tr button[title="Select Bill"]');
      if (btn) {
        btn.click();
        return { clicked: true, title: btn.title };
      }
      return { clicked: false };
    })()`,
    returnByValue: true
  });
  console.log('Click select:', click.result.value);

  await new Promise(r => setTimeout(r, 2000));

  const after = await sendCommand(ws, 'Runtime.evaluate', {
    expression: `(() => {
      return {
        hasModal: !!document.querySelector('.modal, .modal-dialog, [role="dialog"]'),
        currentUrl: window.location.href,
        billNumberOnScreen: document.querySelector('.direct-billing-container')?.innerText.substring(0, 300)
      };
    })()`,
    returnByValue: true
  });
  console.log('After select:', after.result.value);

  ws.close();
}

run().catch(console.error);
