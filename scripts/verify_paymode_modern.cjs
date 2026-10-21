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

  console.log('Ensuring login and navigating to paymodetab/paymodechange...');
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

  await new Promise(r => setTimeout(r, 2000));
  console.log('Reloading to load fresh assets...');
  await send('Page.reload', { ignoreCache: true });
  await new Promise(r => setTimeout(r, 3500));

  // Check login again after reload
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
          window.location.hash = '#/app/paymodetab/paymodechange';
        }
      }
    })()`
  });
  await new Promise(r => setTimeout(r, 3000));

  console.log('Capturing Tab 1: Advance / Receipt...');
  const shot1 = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('scripts/paymode_tab1_advance.png', Buffer.from(shot1.data, 'base64'));
  fs.writeFileSync('/Users/sharmila/.gemini/antigravity-ide/brain/f828d7b8-5ab3-4b59-9efd-4799f329cb19/paymode_tab1_advance.png', Buffer.from(shot1.data, 'base64'));

  // Switch to Tab 2: OP Bill
  console.log('Switching to Tab 2: OP Bill...');
  await send('Runtime.evaluate', {
    expression: `(() => {
      const tabEl = document.querySelector('react-component[name="PaymodeTabScreen"]');
      const tabSc = window.angular ? window.angular.element(tabEl).scope() : null;
      if (tabSc) tabSc.handleReactAction('switchTab', { state: 'app.paymodechange.tabop' });
    })()`
  });
  await new Promise(r => setTimeout(r, 2500));

  console.log('Capturing Tab 2: OP Bill...');
  const shot2 = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('scripts/paymode_tab2_op.png', Buffer.from(shot2.data, 'base64'));
  fs.writeFileSync('/Users/sharmila/.gemini/antigravity-ide/brain/f828d7b8-5ab3-4b59-9efd-4799f329cb19/paymode_tab2_op.png', Buffer.from(shot2.data, 'base64'));

  // Switch back to Tab 1 and make sure it has data
  console.log('Switching back to Tab 1...');
  await send('Runtime.evaluate', {
    expression: `(() => {
      const tabEl = document.querySelector('react-component[name="PaymodeTabScreen"]');
      const tabSc = window.angular ? window.angular.element(tabEl).scope() : null;
      if (tabSc) tabSc.handleReactAction('switchTab', { state: 'app.paymodechange.tabadvrept' });
    })()`
  });
  await new Promise(r => setTimeout(r, 2500));

  const shotFinal = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('scripts/paymode_final.png', Buffer.from(shotFinal.data, 'base64'));
  fs.writeFileSync('/Users/sharmila/.gemini/antigravity-ide/brain/f828d7b8-5ab3-4b59-9efd-4799f329cb19/paymode_final.png', Buffer.from(shotFinal.data, 'base64'));

  console.log('Completed successfully!');
  ws.close();
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
