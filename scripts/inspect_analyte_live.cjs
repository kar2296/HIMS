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

  // Set nice desktop viewport
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
      window.location.hash = '#/app/analytetab/87/analytemaster/87';
    })()`,
    awaitPromise: true,
  });

  console.log('Waiting 3.5 seconds for analyte form to load...');
  await new Promise((r) => setTimeout(r, 3500));

  // Inspect the Result Type dropdown options and form field sizing
  const inspectionResult = await send('Runtime.evaluate', {
    expression: `(() => {
      // Find the select for Result Type (Valuetype_e)
      const selects = Array.from(document.querySelectorAll('select'));
      const resultTypeSelect = selects.find(s => {
        const parent = s.closest('.am-field-group');
        return parent && parent.innerText && parent.innerText.includes('Result Type');
      }) || selects[1];

      let optionsList = [];
      if (resultTypeSelect) {
        optionsList = Array.from(resultTypeSelect.options).map(o => ({
          value: o.value,
          text: o.text,
          selected: o.selected
        }));
      }

      // Check input heights and padding
      const inputs = Array.from(document.querySelectorAll('.am-input, .am-select'));
      const sampleSizes = inputs.slice(0, 4).map(el => {
        const rect = el.getBoundingClientRect();
        const style = window.getComputedStyle(el);
        return {
          tag: el.tagName,
          height: rect.height,
          padding: style.padding,
          fontSize: style.fontSize,
          border: style.border
        };
      });

      return {
        currentHash: window.location.hash,
        optionsCount: optionsList.length,
        optionsList,
        sampleSizes,
        pageTitle: document.title
      };
    })()`,
    returnByValue: true,
  });

  console.log('Inspection result:', JSON.stringify(inspectionResult.result.value, null, 2));

  // Capture Screenshot 1: Numeric Default View
  const screenshot1 = await send('Page.captureScreenshot', { format: 'png' });
  const outPath1 = path.join(__dirname, 'analyte_screen_verified.png');
  fs.writeFileSync(outPath1, Buffer.from(screenshot1.data, 'base64'));
  console.log('Saved screenshot 1 to:', outPath1);

  // Now change Result Type to Dropdown (4)
  console.log('Switching Result Type to Dropdown (4)...');
  await send('Runtime.evaluate', {
    expression: `(() => {
      const selects = Array.from(document.querySelectorAll('select'));
      const resultTypeSelect = selects.find(s => {
        const parent = s.closest('.am-field-group');
        return parent && parent.innerText && parent.innerText.includes('Result Type');
      }) || selects[1];

      if (resultTypeSelect) {
        resultTypeSelect.value = "4";
        resultTypeSelect.dispatchEvent(new Event('change', { bubbles: true }));
      }
    })()`,
  });

  await new Promise((r) => setTimeout(r, 1000));

  // Click on a Quick Preset button, e.g. "Reactive, Non-Reactive"
  await send('Runtime.evaluate', {
    expression: `(() => {
      const presetBtns = Array.from(document.querySelectorAll('button')).filter(b => b.innerText && b.innerText.includes('Reactive, Non-Reactive'));
      if (presetBtns.length > 0) {
        presetBtns[0].click();
      }
    })()`,
  });

  await new Promise((r) => setTimeout(r, 600));

  // Capture Screenshot 2: Dropdown Result Type with Presets and Preview
  const screenshot2 = await send('Page.captureScreenshot', { format: 'png' });
  const outPath2 = path.join(__dirname, 'analyte_dropdown_verified.png');
  fs.writeFileSync(outPath2, Buffer.from(screenshot2.data, 'base64'));
  console.log('Saved screenshot 2 to:', outPath2);

  // Copy screenshots to brain artifact directory as well
  const artifactDir = '/Users/sharmila/.gemini/antigravity-ide/brain/289ea0d9-72ad-480f-8fed-a28dc403c902';
  fs.copyFileSync(outPath1, path.join(artifactDir, 'analyte_screen_verified.png'));
  fs.copyFileSync(outPath2, path.join(artifactDir, 'analyte_dropdown_verified.png'));
  console.log('Copied screenshots to artifacts directory');

  ws.close();
  console.log('Done!');
}

main().catch((err) => {
  console.error('Script failed:', err);
  process.exit(1);
});
