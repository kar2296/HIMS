const fs = require('fs');
const path = require('path');
const WebSocket = globalThis.WebSocket;

async function run() {
  const tabsRes = await fetch('http://127.0.0.1:9222/json');
  const tabsList = await tabsRes.json();
  const pageTab = tabsList.find(t => t.url && t.url.includes('5174'));
  const ws = new WebSocket(pageTab.webSocketDebuggerUrl);

  let id = 1;
  const send = (method, params = {}) => new Promise((resolve) => {
    const curId = id++;
    const handler = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.id === curId) {
        ws.removeEventListener('message', handler);
        resolve(msg.result);
      }
    };
    ws.addEventListener('message', handler);
    ws.send(JSON.stringify({ id: curId, method, params }));
  });

  await new Promise(r => ws.onopen = r);
  console.log('Connected to CDP');

  // Reload page to start fresh
  console.log('Reloading page...');
  await send('Page.reload');
  await new Promise(r => setTimeout(r, 2500));

  // Navigate to receipts tab
  await send('Runtime.evaluate', {
    expression: `window.location.hash = '#/app/ipbillingtab/3783/receipts'`
  });
  await new Promise(r => setTimeout(r, 2000));

  // Find and click "+ Advance"
  const clickRes = await send('Runtime.evaluate', {
    returnByValue: true,
    expression: `(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const advBtn = btns.find(b => b.innerText && b.innerText.trim() === 'Advance');
      if (!advBtn) return { error: 'Advance button not found', allBtns: btns.map(b => b.innerText.trim()) };
      advBtn.click();
      return { clicked: true, text: advBtn.innerText.trim() };
    })()`
  });
  console.log('Click result:', clickRes?.result?.value);

  // Wait 1.5s for modal to open
  await new Promise(r => setTimeout(r, 1500));

  // Capture screenshot of the modal
  const ss = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(__dirname, 'advance_modal_current.png'), Buffer.from(ss.data, 'base64'));
  console.log('Captured advance_modal_current.png');

  // Inspect modal HTML and elements
  const modalInfo = await send('Runtime.evaluate', {
    returnByValue: true,
    expression: `(() => {
      const modal = document.querySelector('.modal-dialog');
      if (!modal) return { found: false };
      return {
        found: true,
        className: modal.className,
        style: modal.getAttribute('style'),
        title: modal.querySelector('.modal-title, h4, h3')?.innerText,
        buttons: Array.from(modal.querySelectorAll('button')).map(b => ({
          text: b.innerText.trim(),
          className: b.className,
          bg: window.getComputedStyle(b).backgroundColor,
          color: window.getComputedStyle(b).color
        })),
        inputs: Array.from(modal.querySelectorAll('input, select, textarea')).map(i => ({
          name: i.getAttribute('name'),
          type: i.getAttribute('type'),
          value: i.value,
          className: i.className
        }))
      };
    })()`
  });
  console.log('Modal info:', JSON.stringify(modalInfo?.result?.value, null, 2));

  process.exit(0);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
