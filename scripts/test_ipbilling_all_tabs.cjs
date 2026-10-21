const fs = require('fs');
const path = require('path');
const WebSocket = globalThis.WebSocket;

const tabsList = [
  { name: 'Summary Bill', path: '/summary', key: 'summary' },
  { name: 'Details', path: '/ipbilldetails', key: 'ipbilldetails' },
  { name: 'Advance / Receipts', path: '/receipts', key: 'receipts' },
  { name: 'Refunds', path: '/refunds', key: 'refunds' },
  { name: 'Bill Corrections', path: '/insurancebill', key: 'insurancebill' },
  { name: 'Pharmacy Bill Corrections', path: '/pharmacybill-modify', key: 'pharmacybillmodify' }
];

async function run() {
  const tabsRes = await fetch('http://127.0.0.1:9222/json');
  const tabs = await tabsRes.json();
  const pageTab = tabs.find(t => t.url && t.url.includes('5174'));
  if (!pageTab) {
    console.error('No page found with 5174');
    process.exit(1);
  }

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

  for (const t of tabsList) {
    const targetHash = `#/app/ipbillingtab/3783${t.path}`;
    console.log(`\n--- Testing Tab: ${t.name} (${targetHash}) ---`);

    // Navigate hash
    await send('Runtime.evaluate', {
      expression: `window.location.hash = '${targetHash}'`
    });

    // Wait 1.5s for state transition and angular/react mount
    await new Promise(r => setTimeout(r, 1500));

    // Inspect active tab indicator and mounted components
    const evalRes = await send('Runtime.evaluate', {
      returnByValue: true,
      expression: `(() => {
        const hash = window.location.hash;
        const tabButtons = Array.from(document.querySelectorAll('button')).filter(b => {
          return ['Summary Bill', 'Details', 'Advance / Receipts', 'Refunds', 'Bill Corrections', 'Pharmacy Bill Corrections'].includes(b.innerText.trim());
        }).map(b => ({
          text: b.innerText.trim(),
          color: window.getComputedStyle(b).color,
          borderBottom: window.getComputedStyle(b).borderBottom,
          fontWeight: window.getComputedStyle(b).fontWeight
        }));

        const hasReactReceipts = Boolean(document.querySelector('div[style*="Receipts & Advances"], button[title*="Advance"], button:has(.fa-plus)'));
        const receiptsInDom = Array.from(document.querySelectorAll('*')).some(el => el.innerText && el.innerText.includes('Receipts & Advances'));
        const refundsInDom = Array.from(document.querySelectorAll('*')).some(el => el.innerText && el.innerText.includes('Refund History & Advances'));
        const hasLegacyButtons = Array.from(document.querySelectorAll('button.drhms-common-btn')).length;

        return {
          hash,
          tabButtons,
          receiptsInDom,
          refundsInDom,
          hasLegacyButtons,
          bodyTextSnippet: document.body.innerText.slice(0, 300)
        };
      })()`
    });

    console.log('Tab check result:', JSON.stringify(evalRes.result?.value, null, 2));

    // Capture screenshot
    const screenshot = await send('Page.captureScreenshot', { format: 'png' });
    if (screenshot && screenshot.data) {
      const filename = path.join(__dirname, `tab_${t.key}_screenshot.png`);
      fs.writeFileSync(filename, Buffer.from(screenshot.data, 'base64'));
      console.log(`Saved screenshot to ${filename}`);
    }
  }

  console.log('\nAll tabs tested successfully!');
  process.exit(0);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
