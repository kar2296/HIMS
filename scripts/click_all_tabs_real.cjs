const fs = require('fs');
const WebSocket = globalThis.WebSocket;

const tabsToTest = [
  { name: 'Advance / Receipts', file: 'click_tab_receipts.png' },
  { name: 'Refunds', file: 'click_tab_refunds.png' },
  { name: 'Bill Corrections', file: 'click_tab_insurancebill.png' },
  { name: 'Pharmacy Bill Corrections', file: 'click_tab_pharmacybillmodify.png' },
  { name: 'Details', file: 'click_tab_details.png' },
  { name: 'Summary Bill', file: 'click_tab_summary.png' }
];

async function run() {
  const tabsRes = await fetch('http://127.0.0.1:9222/json');
  const tabs = await tabsRes.json();
  const pageTab = tabs.find(t => t.url && t.url.includes('5174'));
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

  for (const t of tabsToTest) {
    console.log(`\n=== Clicking Tab: ${t.name} ===`);

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

    // Wait 2.5s for routing and data fetch
    await new Promise(r => setTimeout(r, 2500));

    // Inspect state and components
    const stateRes = await send('Runtime.evaluate', {
      returnByValue: true,
      expression: `(() => {
        const hash = window.location.hash;
        const allReact = Array.from(document.querySelectorAll('react-component')).map(el => el.getAttribute('name'));
        const activeTabBtn = Array.from(document.querySelectorAll('button')).find(b => {
          const style = window.getComputedStyle(b);
          return style.borderBottom.includes('3px solid rgb(37, 99, 235)');
        });

        const childHTML = document.querySelector('[ui-view]') ? document.querySelector('[ui-view]').innerHTML.slice(0, 300) : '';

        return {
          hash,
          activeTabButtonText: activeTabBtn ? activeTabBtn.innerText.trim() : 'NONE',
          allReactComponentsMounted: allReact,
          childSnippet: childHTML
        };
      })()`
    });
    console.log('State info:', JSON.stringify(stateRes?.result?.value, null, 2));

    const ss = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(`scripts/${t.file}`, Buffer.from(ss.data, 'base64'));
    console.log(`Screenshot saved to scripts/${t.file}`);
  }

  console.log('\nAll tab clicks completed!');
  process.exit(0);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
