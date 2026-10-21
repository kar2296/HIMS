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

  const pageTarget = targets.find(t => t.url && (t.url.includes('localhost:5173') || t.url.includes('localhost:5174')) && t.type === 'page');
  if (!pageTarget) {
    console.error('No page target found! Targets:', targets);
    process.exit(1);
  }
  console.log('Connecting to:', pageTarget.url);
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

  // Enable Page
  await send('Page.enable');

  console.log('Navigating to resultentry for 8952 and handling login if needed...');
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
      window.location.hash = '#/app/resultentry/8952';
    })()`
  });

  await new Promise(r => setTimeout(r, 3000));

  console.log('Checking state on page...');
  const state = await send('Runtime.evaluate', {
    returnByValue: true,
    expression: `(() => {
      const comp = document.querySelector('react-component[name="ResultEntryFormScreen"]');
      const sc = comp ? angular.element(comp).scope() : null;
      return {
        url: window.location.href,
        hasComp: !!comp,
        hasScope: !!sc,
        patientName: sc?.reactProps?.patient?.name,
        mrn: sc?.reactProps?.patient?.mrn,
        itemsCount: sc?.reactProps?.items?.length,
        hasActionButtons: !!document.querySelector('.sticky-action-bar')
      };
    })()`
  });
  console.log('State:', state);

  // Capture screenshot
  console.log('Capturing screenshot...');
  const shot1 = await send('Page.captureScreenshot', { format: 'png' });
  const outPath = '/Users/sharmila/.gemini/antigravity-ide/brain/90c7d2c6-82e5-4f56-9a05-7c199aab54fe/resultentry_modernized_screen.png';
  fs.writeFileSync(outPath, Buffer.from(shot1.data, 'base64'));
  console.log('Saved screenshot to:', outPath);

  ws.close();
  process.exit(0);
}

main().catch(err => {
  console.error('Main error:', err);
  process.exit(1);
});
