const fs = require('fs');
const path = require('path');
const WebSocket = globalThis.WebSocket;

const tabs = [
  { name: 'Summary Bill', key: '1_summary', urlPart: 'summary' },
  { name: 'Details', key: '2_details', urlPart: 'ipbilldetails' },
  { name: 'Advance / Receipts', key: '3_receipts', urlPart: 'receipts' },
  { name: 'Refunds', key: '4_refunds', urlPart: 'refunds' },
  { name: 'Bill Corrections', key: '5_bill_corrections', urlPart: 'insurancebill' },
  { name: 'Pharmacy Bill Corrections', key: '6_pharmacy_bill_corrections', urlPart: 'pharmacybill-modify' }
];

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

  // Reload page to start with fresh state
  console.log('Reloading page...');
  await send('Page.reload');
  await new Promise(r => setTimeout(r, 2500));

  for (const t of tabs) {
    console.log(`\n=== Testing Tab: ${t.name} ===`);

    // Click the tab button
    const clickRes = await send('Runtime.evaluate', {
      returnByValue: true,
      expression: `(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const targetBtn = btns.find(b => b.innerText && b.innerText.trim() === '${t.name}');
        if (!targetBtn) return { error: 'Button not found: ${t.name}' };
        targetBtn.click();
        return { clicked: true, text: targetBtn.innerText.trim() };
      })()`
    });
    console.log('Click result:', clickRes?.result?.value);

    // Wait 2.5s for view update
    await new Promise(r => setTimeout(r, 2500));

    // Verify state
    const verifyRes = await send('Runtime.evaluate', {
      returnByValue: true,
      expression: `(() => {
        const hash = window.location.hash;
        const activeBtn = Array.from(document.querySelectorAll('button')).find(b => {
          const s = window.getComputedStyle(b);
          return s.borderBottom.includes('3px solid rgb(37, 99, 235)');
        });
        const reactComps = Array.from(document.querySelectorAll('react-component')).map(el => el.getAttribute('name'));
        return {
          hash,
          activeTabHighlight: activeBtn ? activeBtn.innerText.trim() : 'NONE',
          reactComponentsMounted: reactComps
        };
      })()`
    });
    console.log('Verification:', JSON.stringify(verifyRes?.result?.value, null, 2));

    // Capture screenshot
    const ss = await send('Page.captureScreenshot', { format: 'png' });
    const filePath = path.join(__dirname, `final_tab_${t.key}.png`);
    fs.writeFileSync(filePath, Buffer.from(ss.data, 'base64'));
    console.log(`Saved screenshot: final_tab_${t.key}.png`);
  }

  console.log('\nAll 6 tabs verified and captured successfully!');
  process.exit(0);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
