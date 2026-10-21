const http = require('http');
const WebSocket = require('ws');
const fs = require('fs');

async function testInteractions() {
  const targets = await new Promise((resolve, reject) => {
    http.get('http://localhost:9222/json', res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });

  const pageTarget = targets.find(t => t.url.includes('localhost:5174'));
  if (!pageTarget) {
    console.error('No localhost:5174 page target found');
    process.exit(1);
  }

  const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);
  await new Promise(resolve => ws.on('open', resolve));

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

  // Collect console logs
  const logs = [];
  await send('Console.enable');
  await send('Runtime.enable');

  ws.on('message', data => {
    try {
      const msg = JSON.parse(data);
      if (msg.method === 'Console.messageAdded') {
        logs.push(msg.params.message);
      }
      if (msg.method === 'Runtime.consoleAPICalled') {
        logs.push({ type: msg.params.type, args: msg.params.args });
      }
      if (msg.method === 'Runtime.exceptionThrown') {
        logs.push({ exception: msg.params.exceptionDetails });
      }
    } catch (e) {}
  });

  // Click Print Preview button to open dropdown
  const clickRes = await send('Runtime.evaluate', {
    returnByValue: true,
    expression: `
      (() => {
        const printBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Print Preview'));
        if (printBtn) {
          printBtn.click();
          return { clicked: true };
        }
        return { clicked: false };
      })()
    `
  });
  console.log('Click print preview result:', clickRes.result.value);

  await new Promise(r => setTimeout(r, 600));

  // Capture screenshot of dropdown menu open
  const screenshotDropdown = await send('Page.captureScreenshot', { format: 'png' });
  const outPathDropdown = '/Users/sharmila/.gemini/antigravity-ide/brain/d65c7b61-8a17-4b46-8d51-47f1e19bfa2e/ipbilling_dropdown_open.png';
  fs.writeFileSync(outPathDropdown, Buffer.from(screenshotDropdown.data, 'base64'));
  console.log('Dropdown screenshot saved to', outPathDropdown);

  // Close dropdown by clicking again
  await send('Runtime.evaluate', {
    expression: `
      (() => {
        const printBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Print Preview'));
        if (printBtn) printBtn.click();
      })()
    `
  });

  // Test discount change input
  const inputRes = await send('Runtime.evaluate', {
    returnByValue: true,
    expression: `
      (() => {
        const discountInput = document.querySelector('input[type=\"number\"]');
        if (discountInput) {
          discountInput.value = '50';
          discountInput.dispatchEvent(new Event('input', { bubbles: true }));
          discountInput.dispatchEvent(new Event('change', { bubbles: true }));
          return { tested: true, val: discountInput.value };
        }
        return { tested: false };
      })()
    `
  });
  console.log('Discount input test:', inputRes.result.value);

  await new Promise(r => setTimeout(r, 600));

  console.log('Console logs count during tests:', logs.length);
  const errors = logs.filter(l => l.exception || l.type === 'error' || l.level === 'error');
  console.log('Errors caught:', errors.length);
  if (errors.length > 0) {
    console.log('Error details:', JSON.stringify(errors, null, 2));
  }

  ws.close();
}

testInteractions().catch(console.error);
