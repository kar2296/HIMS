const WebSocket = require('ws');
const fs = require('fs');

async function main() {
  const res = await fetch('http://localhost:9222/json');
  const pages = await res.json();
  const page = pages.find(p => p.type === 'page' && !p.url.includes('chrome://') && !p.url.includes('omnibox'));
  if (!page) {
    console.error('No page target found');
    process.exit(1);
  }

  const ws = new WebSocket(page.webSocketDebuggerUrl);
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

  await send('Page.enable');
  await send('Runtime.enable');

  console.log('1. Navigating to http://localhost:5173/#/app/approvalallorders/1 ...');
  await send('Runtime.evaluate', {
    expression: `window.location.href = "http://localhost:5173/#/app/approvalallorders/1";`
  });

  console.log('Waiting 5 seconds for data load and React bridge rendering...');
  await new Promise(r => setTimeout(r, 5000));

  console.log('2. Inspecting DOM state...');
  const domState = await send('Runtime.evaluate', {
    returnByValue: true,
    expression: `(() => {
      const bridgeEl = document.querySelector('react-component[name="AllResultApprovalListScreen"]');
      const title = document.querySelector('h1')?.innerText;
      const subtitle = document.querySelector('p')?.innerText;
      const kpis = Array.from(document.querySelectorAll('div')).filter(d => 
        d.innerText && (d.innerText.includes('TOTAL WORK ORDERS') || d.innerText.includes('AWAITING APPROVAL'))
      ).map(d => d.innerText.split('\\n').slice(0, 3).join(' | '));
      
      const rows = Array.from(document.querySelectorAll('tbody tr')).map(tr => {
        const tds = tr.querySelectorAll('td');
        if (tds.length < 5) return { empty: tr.innerText.substring(0, 100) };
        return {
          num: tds[0]?.innerText.trim(),
          wo: tds[1]?.innerText.trim(),
          orderBill: tds[2]?.innerText.trim(),
          sampleId: tds[3]?.innerText.trim(),
          type: tds[4]?.innerText.trim(),
          date: tds[5]?.innerText.trim(),
          mrn: tds[6]?.innerText.trim(),
          patient: tds[7]?.innerText.trim(),
          doctor: tds[8]?.innerText.trim(),
          status: tds[11]?.innerText.trim(),
        };
      });

      return {
        url: window.location.href,
        hasBridge: !!bridgeEl,
        title,
        subtitle,
        kpiCount: kpis.length,
        kpis: kpis.slice(0, 5),
        rowCount: rows.length,
        sampleRows: rows.slice(0, 3)
      };
    })()`
  });

  console.log('DOM State:', JSON.stringify(domState.result?.value, null, 2));

  console.log('3. Capturing screenshot of modernized Result Approvals screen...');
  const screenshot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('scripts/approvalallorders_modernized.png', Buffer.from(screenshot.data, 'base64'));
  console.log('Saved screenshot to scripts/approvalallorders_modernized.png');

  ws.close();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
