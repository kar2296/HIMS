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
    console.error('No page target found on localhost:5174');
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

  console.log('1. Checking login and navigating to #/app/samplecollect/6668...');
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
      window.location.hash = '#/app/samplecollect/6668';
    })()`
  });

  await new Promise(r => setTimeout(r, 3000));

  // Reload page to get completely clean state
  console.log('2. Reloading page...');
  await send('Page.reload', { ignoreCache: true });
  await new Promise(r => setTimeout(r, 3500));

  // Check state
  const state1 = await send('Runtime.evaluate', {
    expression: `(() => {
      const rows = Array.from(document.querySelectorAll('table tbody tr')).map(r => ({
        text: r.innerText.trim().replace(/\\s+/g, ' '),
        checked: r.querySelector('input[type="checkbox"]')?.checked,
        disabled: r.querySelector('input[type="checkbox"]')?.disabled
      }));
      return {
        url: window.location.hash,
        title: document.querySelector('h2')?.innerText,
        rowCount: rows.length,
        rows: rows
      };
    })()`,
    returnByValue: true
  });
  console.log('Initial page state:', JSON.stringify(state1.result.value, null, 2));

  // Step 3: Deselect all first
  console.log('3. Clicking Deselect All...');
  await send('Runtime.evaluate', {
    expression: `(() => {
      const btn = document.getElementById('btnToggleSelectAll');
      if (btn) btn.click();
    })()`
  });
  await new Promise(r => setTimeout(r, 600));

  // Step 4: Select ONLY ONE parameter: "HAEMOGLOBIN (HB), BLOOD"
  console.log('4. Selecting ONLY ONE parameter: HAEMOGLOBIN...');
  const selectOneRes = await send('Runtime.evaluate', {
    expression: `(() => {
      const rows = Array.from(document.querySelectorAll('table tbody tr'));
      let clicked = false;
      for (const r of rows) {
        if (r.innerText.includes('HAEMOGLOBIN')) {
          const chk = r.querySelector('input[type="checkbox"]');
          if (chk && !chk.checked) {
            chk.click();
            clicked = true;
          }
        }
      }
      return { clicked };
    })()`,
    returnByValue: true
  });
  console.log('Select one result:', selectOneRes.result.value);
  await new Promise(r => setTimeout(r, 600));

  // Check rows checked status
  const checkStatus = await send('Runtime.evaluate', {
    expression: `(() => {
      return Array.from(document.querySelectorAll('table tbody tr')).map(r => ({
        text: r.innerText.trim().split('\\n')[0],
        checked: r.querySelector('input[type="checkbox"]')?.checked
      }));
    })()`,
    returnByValue: true
  });
  console.log('Row checked status before save:', JSON.stringify(checkStatus.result.value, null, 2));

  // Take screenshot before save
  const shot1 = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('scripts/sample_6668_before_save.png', Buffer.from(shot1.data, 'base64'));

  // Step 5: Click Save Collection
  console.log('5. Clicking Save Collection button...');
  const saveRes = await send('Runtime.evaluate', {
    expression: `(() => {
      const saveBtn = document.getElementById('btnSaveSampleCollection') || Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Save Collection'));
      if (saveBtn) {
        saveBtn.click();
        return { clicked: true, text: saveBtn.innerText };
      }
      return { clicked: false };
    })()`,
    returnByValue: true
  });
  console.log('Save button click result:', saveRes.result.value);

  // Wait 3 seconds for backend save and reload
  await new Promise(r => setTimeout(r, 3500));

  const shot2 = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('scripts/sample_6668_after_save.png', Buffer.from(shot2.data, 'base64'));

  ws.close();
  console.log('Step 1 complete, will check database now.');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
