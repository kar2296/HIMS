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

  const pageTarget = targets.find(t => t.url.includes('localhost:5174'));
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

  console.log('Logging in and navigating...');
  await send('Runtime.evaluate', {
    awaitPromise: true,
    expression: `(async () => {
      if (window.location.hash.includes('login') || document.querySelector('input[type="password"]')) {
        const u = document.getElementById('login-username') || document.querySelector('input[name="username"], input[type="text"]');
        const p = document.getElementById('login-password') || document.querySelector('input[name="password"], input[type="password"]');
        const submitBtn = document.querySelector('button[type="submit"], button.btn-primary') || Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Sign in') || b.innerText.includes('Login'));
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
      window.location.hash = '#/app/ipbillingtab/3783/summary';
    })()`
  });

  // Wait 4 seconds for full Angular + React load & API responses
  console.log('Waiting for IP summary data load...');
  await new Promise(r => setTimeout(r, 4500));

  // Check state
  const stateCheck = await send('Runtime.evaluate', {
    returnByValue: true,
    expression: `(() => {
      const el = document.querySelector('.hims-theme-ipbilling-summary');
      const sc = el ? angular.element(el).scope() : null;
      return {
        url: window.location.href,
        hasScope: !!sc,
        gross: sc?.currentcontext?.TotGrossAmount,
        net: sc?.currentcontext?.TotNetAmount,
        patient: sc?.selectedPatient?.FirstName || sc?.Data?.PatientName
      };
    })()`
  });
  console.log('Current state in browser:', stateCheck.result.value);

  // Capture Top
  await send('Runtime.evaluate', {
    expression: `(() => {
      const cw = document.querySelector('.content-wrapper');
      if (cw) cw.scrollTop = 0;
      window.scrollTo(0, 0);
    })()`
  });
  await new Promise(r => setTimeout(r, 500));
  let shot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('/Users/sharmila/.gemini/antigravity-ide/brain/d65c7b61-8a17-4b46-8d51-47f1e19bfa2e/ipbilling_final_top.png', Buffer.from(shot.data, 'base64'));

  // Capture Mid (scroll to 350)
  await send('Runtime.evaluate', {
    expression: `(() => {
      const cw = document.querySelector('.content-wrapper');
      if (cw) cw.scrollTop = 350;
    })()`
  });
  await new Promise(r => setTimeout(r, 500));
  shot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('/Users/sharmila/.gemini/antigravity-ide/brain/d65c7b61-8a17-4b46-8d51-47f1e19bfa2e/ipbilling_final_mid.png', Buffer.from(shot.data, 'base64'));

  // Capture Bottom (scroll to max)
  await send('Runtime.evaluate', {
    expression: `(() => {
      const cw = document.querySelector('.content-wrapper');
      if (cw) cw.scrollTop = cw.scrollHeight;
    })()`
  });
  await new Promise(r => setTimeout(r, 500));
  shot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('/Users/sharmila/.gemini/antigravity-ide/brain/d65c7b61-8a17-4b46-8d51-47f1e19bfa2e/ipbilling_final_bottom.png', Buffer.from(shot.data, 'base64'));

  console.log('All final screenshots saved!');
  ws.close();
}

main().catch(console.error);
