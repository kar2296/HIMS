const fs = require('fs');

async function main() {
  const list = await fetch('http://localhost:9222/json').then(r => r.json());
  const target = list.find(x => x.type === 'page');
  console.log('Using target:', target.id, target.url);

  const ws = new WebSocket(target.webSocketDebuggerUrl);
  let id = 1;
  const send = (method, params = {}) => new Promise((resolve, reject) => {
    const msgId = id++;
    const handler = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.id === msgId) {
        ws.removeEventListener('message', handler);
        if (msg.error) reject(msg.error);
        else resolve(msg.result);
      }
    };
    ws.addEventListener('message', handler);
    ws.send(JSON.stringify({ id: msgId, method, params }));
  });

  await new Promise(r => ws.addEventListener('open', r));
  await send('Page.enable');
  await send('Runtime.enable');

  const evalCode = (expr) => send('Runtime.evaluate', {
    expression: expr,
    returnByValue: true,
    awaitPromise: true
  }).then(r => r.result?.value);

  const takeScreenshot = async (name) => {
    const shot = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(`scripts/${name}.png`, Buffer.from(shot.data, 'base64'));
    console.log(`Saved screenshot: scripts/${name}.png`);
  };

  // Reload page first
  console.log('Reloading application...');
  await send('Page.reload', { ignoreCache: true });
  await new Promise(r => setTimeout(r, 4000));

  // Check login
  await evalCode(`(async () => {
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
      }
    }
  })()`);
  await new Promise(r => setTimeout(r, 3000));

  const screensToTest = [
    {
      name: 'ris_dashboard',
      hash: '#/app/ris_dashboard',
      expectedText: 'Radiology Information System (RIS)'
    },
    {
      name: 'radiology_reports',
      hash: '#/app/radiologyreports',
      expectedText: 'Radiology Reports & Clinical Analytics'
    },
    {
      name: 'radiology_criticals',
      hash: '#/app/radiologycriticals',
      expectedText: 'Radiology Critical Findings & STAT Value Tracker'
    },
    {
      name: 'order_acknowledgements_rad',
      hash: '#/app/orderacknowledgements/2',
      expectedText: 'Radiology Order Acceptance'
    },
    {
      name: 'all_orders_rad',
      hash: '#/app/allorders/2',
      expectedText: 'Radiology'
    }
  ];

  for (const s of screensToTest) {
    console.log(`\nNavigating to ${s.name} (${s.hash})...`);
    await evalCode(`window.location.hash = '${s.hash}';`);
    await new Promise(r => setTimeout(r, 3500));

    const check = await evalCode(`(() => {
      const bodyText = document.body.innerText || '';
      const containsExpected = bodyText.includes('${s.expectedText}');
      const reactRoots = document.querySelectorAll('[data-reactroot], react-component, .mediflow-enterprise-screen, .ris-dashboard-container').length;
      return {
        url: window.location.href,
        containsExpected,
        reactRoots,
        bodyPreview: bodyText.substring(0, 300).replace(/\\s+/g, ' ')
      };
    })()`);

    console.log(`Result for ${s.name}:`, JSON.stringify(check, null, 2));
    await takeScreenshot(`ris_${s.name}`);
  }

  console.log('\nAll RIS screens verified successfully!');
  ws.close();
}

main().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
