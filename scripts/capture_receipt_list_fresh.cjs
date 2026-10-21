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
  if (!pageTarget) {
    console.error('No localhost:5174 page found!');
    process.exit(1);
  }
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

  console.log('Navigating to receipt-list and handling login if needed...');
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
      window.location.hash = '#/app/receipt-list';
    })()`
  });

  await new Promise(r => setTimeout(r, 2500));

  console.log('Reloading page...');
  await send('Page.reload', { ignoreCache: true });
  await new Promise(r => setTimeout(r, 3500));

  // Check login again after reload just in case
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
          await new Promise(r => setTimeout(r, 2500));
          window.location.hash = '#/app/receipt-list';
        }
      }
    })()`
  });
  await new Promise(r => setTimeout(r, 3000));

  // Capture top (unscrolled)
  console.log('Capturing unscrolled screenshot...');
  const shot1 = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('scripts/receipt_list_perfect.png', Buffer.from(shot1.data, 'base64'));
  fs.writeFileSync('/Users/sharmila/.gemini/antigravity-ide/brain/f828d7b8-5ab3-4b59-9efd-4799f329cb19/receipt_list_perfect.png', Buffer.from(shot1.data, 'base64'));

  // Scroll to bottom of section
  console.log('Scrolling section down...');
  await send('Runtime.evaluate', {
    expression: `(() => {
      const sec = document.querySelector('section') || document.querySelector('.content-wrapper') || window;
      if (sec.scrollTo) sec.scrollTo({ top: 9999, behavior: 'instant' });
      else sec.scrollTop = 9999;
      window.scrollTo(0, 9999);
    })()`
  });
  await new Promise(r => setTimeout(r, 1000));

  console.log('Capturing scrolled screenshot...');
  const shot2 = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('scripts/receipt_list_scrolled.png', Buffer.from(shot2.data, 'base64'));
  fs.writeFileSync('/Users/sharmila/.gemini/antigravity-ide/brain/f828d7b8-5ab3-4b59-9efd-4799f329cb19/receipt_list_scrolled.png', Buffer.from(shot2.data, 'base64'));

  console.log('Screenshots saved successfully!');
  ws.close();
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
