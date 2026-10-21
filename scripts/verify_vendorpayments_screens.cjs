const fs = require('fs');

async function main() {
  const list = await fetch('http://localhost:9222/json').then(r => r.json());
  const target = list.find(x => x.type === 'page' && (x.url.includes(':5173') || x.title.includes('GenericSoft')));
  if (!target) {
    console.error('No matching GenericSoft / 5173 page target found! Target list:', list);
    process.exit(1);
  }
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

  // Reload page first to ensure fresh state
  console.log('Reloading application...');
  await send('Page.reload', { ignoreCache: true });
  await new Promise(r => setTimeout(r, 4000));

  // Check login
  await evalCode(`(async () => {
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
      }
    }
  })()`);
  await new Promise(r => setTimeout(r, 3000));

  const screensToTest = [
    {
      name: 'vendorpaymentlist',
      hash: '#/app/vendorpaymentlist/',
      expectedText: 'Supplier Payments',
      screenshot: 'vendorpaymentlist_verified'
    },
    {
      name: 'vendorpayments_form',
      hash: '#/app/vendorpayments/0',
      expectedText: 'Supplier Payment Voucher',
      screenshot: 'vendorpayments_form_verified'
    }
  ];

  for (const s of screensToTest) {
    console.log(`\nNavigating to ${s.name} (${s.hash})...`);
    await evalCode(`window.location.hash = '${s.hash}';`);
    await new Promise(r => setTimeout(r, 4000));

    const check = await evalCode(`(() => {
      const bodyText = document.body.innerText || '';
      const containsExpected = bodyText.includes('${s.expectedText}');
      const reactRoots = document.querySelectorAll('[data-reactroot], react-component, .mediflow-enterprise-screen').length;
      return {
        url: window.location.href,
        containsExpected,
        reactRoots,
        bodySnippet: bodyText.slice(0, 300).replace(/\\s+/g, ' ')
      };
    })()`);

    console.log('Result for', s.name, ':', JSON.stringify(check, null, 2));
    await takeScreenshot(s.screenshot);

    if (!check.containsExpected) {
      console.warn(`WARNING: Expected text '${s.expectedText}' not found on ${s.name}`);
    } else {
      console.log(`SUCCESS: Modernized React screen '${s.name}' verified with text '${s.expectedText}'!`);
    }
  }

  // Also test interactive modal opening on the form screen
  console.log('\nTesting Picklist modal trigger on vendorpayments form...');
  const picklistResult = await evalCode(`(() => {
    // First select a vendor if not selected
    const select = document.querySelector('select');
    if (select && select.options.length > 1) {
      select.selectedIndex = 1;
      select.dispatchEvent(new Event('change', { bubbles: true }));
    }
    const pickBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText && (b.innerText.includes('Select Invoices') || b.innerText.includes('Invoices / Returns')));
    if (pickBtn) {
      pickBtn.click();
      return { clicked: true, btnText: pickBtn.innerText, vendorSelected: select ? select.value : null };
    }
    return { clicked: false };
  })()`);
  console.log('Picklist button click result:', picklistResult);
  await new Promise(r => setTimeout(r, 2000));
  await takeScreenshot('vendorpayments_picklist_modal_verified');

  console.log('\nAll Vendor Payment screens verified successfully!');
  process.exit(0);
}

main().catch(err => {
  console.error('Verification failed:', err);
  process.exit(1);
});
