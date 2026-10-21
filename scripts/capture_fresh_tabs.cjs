const http = require('http');
const WebSocket = require('ws');
const fs = require('fs');
const path = require('path');

async function main() {
  const targets = await new Promise((resolve, reject) => {
    http.get('http://localhost:9222/json', (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });

  const pageTarget = targets.find(
    (t) => t.url && t.url.includes('localhost:5173') && t.type === 'page'
  );

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
  await send('DOM.enable');

  await send('Emulation.setDeviceMetricsOverride', {
    width: 1440,
    height: 900,
    deviceScaleFactor: 1,
    mobile: false,
  });

  // Remove any modal or backdrop from DOM and reload
  await send('Runtime.evaluate', {
    expression: `(() => {
      document.querySelectorAll('.modal, .modal-backdrop').forEach(el => el.remove());
      document.body.className = document.body.className.replace(/modal-open/g, '');
      window.location.href = 'http://localhost:5173/#/app/organismtab/organismform';
      window.location.reload();
    })()`
  });

  await new Promise((r) => setTimeout(r, 4000));

  let shot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(__dirname, '..', 'screen_fresh_organism_form.png'), Buffer.from(shot.data, 'base64'));
  console.log('Saved screen_fresh_organism_form.png');

  // Now navigate to antibiotic mapping
  await send('Runtime.evaluate', {
    expression: `(() => {
      window.location.href = 'http://localhost:5173/#/app/organismtab/antibioticorganismmap';
      window.location.reload();
    })()`
  });

  await new Promise((r) => setTimeout(r, 4000));

  shot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(__dirname, '..', 'screen_fresh_antibiotic_map.png'), Buffer.from(shot.data, 'base64'));
  console.log('Saved screen_fresh_antibiotic_map.png');

  ws.close();
}

main().catch(console.error);
