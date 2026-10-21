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

  console.log('Navigating to paymode change...');
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
      window.location.hash = '#/app/paymodetab/paymodechange';
    })()`
  });

  await new Promise(r => setTimeout(r, 3500));

  // Evaluate state info
  const evalRes = await send('Runtime.evaluate', {
    returnByValue: true,
    expression: `(() => {
      return {
        url: window.location.href,
        hash: window.location.hash,
        title: document.title,
        hasReceiptTab: Boolean(document.getElementById('receipt_tab')),
        tabText: document.getElementById('assettabs') ? document.getElementById('assettabs').innerText : null,
        tableRows: document.querySelectorAll('table tbody tr').length,
        hasPatientSearch: Boolean(document.querySelector('patientsearch'))
      };
    })()`
  });
  console.log('Page state:', evalRes.result?.value);

  const shot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('scripts/paymode_current.png', Buffer.from(shot.data, 'base64'));
  fs.writeFileSync('/Users/sharmila/.gemini/antigravity-ide/brain/f828d7b8-5ab3-4b59-9efd-4799f329cb19/paymode_current.png', Buffer.from(shot.data, 'base64'));
  console.log('Saved scripts/paymode_current.png');
  ws.close();
}

main().catch(console.error);
