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

  console.log('Reloading page...');
  await send('Page.reload', { ignoreCache: true });
  await new Promise(r => setTimeout(r, 4500));

  console.log('Navigating to ipbilldetails if needed...');
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
      window.location.hash = '#/app/ipbillingtab/3783/ipbilldetails';
    })()`
  });

  await new Promise(r => setTimeout(r, 3500));

  console.log('Capturing refreshed ipbilldetails tab...');
  const ssTab = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('/Users/sharmila/Rajesh/my-app/ipbilldetails_tab_fresh.png', Buffer.from(ssTab.data, 'base64'));
  console.log('Saved ipbilldetails_tab_fresh.png');

  ws.close();
}

main().catch(console.error);
