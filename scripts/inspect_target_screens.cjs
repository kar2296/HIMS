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
  if (!pageTarget) {
    console.error('No page target found on localhost:5173');
    process.exit(1);
  }

  console.log('Connecting to:', pageTarget.url, 'id:', pageTarget.id);
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

  console.log('Handling login if needed...');
  await send('Runtime.evaluate', {
    expression: `(async () => {
      if (window.location.hash.includes('login') || document.querySelector('input[type="password"]')) {
        const u = document.getElementById('login-username') || document.querySelector('input[name="username"], input[type="text"]');
        const p = document.getElementById('login-password') || document.querySelector('input[name="password"], input[type="password"]');
        const submitBtn = document.querySelector('button[type="submit"], button.btn-primary') || Array.from(document.querySelectorAll('button')).find(b => b.innerText && (b.innerText.includes('Sign in') || b.innerText.includes('Login')));
        if (u && p && submitBtn) {
          const valSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
          valSetter.call(u, 'admin');
          u.dispatchEvent(new Event('input', { bubbles: true }));
          valSetter.call(p, 'admin');
          p.dispatchEvent(new Event('input', { bubbles: true }));
          submitBtn.click();
          await new Promise(r => setTimeout(r, 2000));
        }
      }
    })()`,
    awaitPromise: true,
  });

  const routes = [
    { name: 'notetemplates', url: '#/app/notetemplates' },
    { name: 'antibioticmasters', url: '#/app/antibioticmasters' },
    { name: 'organismisolations', url: '#/app/organismisolations:/' },
    { name: 'organismtab', url: '#/app/organismtab/0/organismform/0' },
    { name: 'lisregistration', url: '#/app/lisregistration' }
  ];

  for (const r of routes) {
    console.log('Navigating to', r.url);
    await send('Runtime.evaluate', {
      expression: `window.location.hash = '${r.url}';`,
    });
    // Wait 3 seconds for data to load
    await new Promise((resolve) => setTimeout(resolve, 3000));

    const shot = await send('Page.captureScreenshot', { format: 'png' });
    const buffer = Buffer.from(shot.data, 'base64');
    const outPath = path.join(__dirname, '..', `screen_${r.name}.png`);
    fs.writeFileSync(outPath, buffer);
    console.log('Saved screenshot to:', outPath);
  }

  ws.close();
  console.log('Done capturing screenshots!');
}

main().catch(console.error);
