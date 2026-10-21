const WebSocket = globalThis.WebSocket;
const fs = require('fs');

async function testDue() {
  const tabsRes = await fetch('http://127.0.0.1:9222/json');
  const tabs = await tabsRes.json();
  const pageTab = tabs.find(t => t.url && t.url.includes('5174'));
  const ws = new WebSocket(pageTab.webSocketDebuggerUrl);

  ws.onopen = async () => {
    let id = 1;
    const send = (m, p = {}) => new Promise((resolve) => {
      const mid = id++;
      const handler = (event) => {
        const parsed = JSON.parse(event.data);
        if (parsed.id === mid) {
          ws.removeEventListener('message', handler);
          resolve(parsed.result);
        }
      };
      ws.addEventListener('message', handler);
      ws.send(JSON.stringify({ id: mid, method: m, params: p }));
    });

    await send('Page.enable');
    await send('Runtime.enable');

    console.log('Simulating bill with OutStandingAmount = 500...');
    const res = await send('Runtime.evaluate', {
      awaitPromise: true,
      returnByValue: true,
      expression: `(async () => {
        const sc = window.angular.element(document.querySelector('.hims-theme-billing') || document.body).scope();
        if (!sc) return 'no scope';

        // Set item with outstanding balance
        sc.item.BillNumber = 'DG-10099';
        sc.item.PatientBillStatusId = 2; // Generated/Approved
        sc.item.BillAmount = 1500;
        sc.item.PaidAmount = 1000;
        sc.item.TotalPaidAmount = 1000;
        sc.item.TotalDueAmount = 500;
        sc.item.OutStandingAmount = 500;
        sc.currentcontext.PendingAmt = 500;
        sc.item.IsPaidFully = false;
        sc.item.PatientName = 'TEST DUE PATIENT';

        sc.refreshReactProps();
        if (!sc.$root.$$phase) sc.$applyAsync();

        await new Promise(r => setTimeout(r, 600));

        // Scroll to bottom
        const cw = document.querySelector('.content-wrapper');
        const sec = document.querySelector('section.ng-scope');
        if (cw) cw.scrollTop = cw.scrollHeight;
        if (sec) sec.scrollTop = sec.scrollHeight;

        await new Promise(r => setTimeout(r, 300));

        const buttons = Array.from(document.querySelectorAll('button')).map(b => b.innerText.trim()).filter(Boolean);
        const hasCollectDue = buttons.some(b => b.includes('Collect Due'));
        const hasFullyPaid = document.body.innerText.includes('Fully Paid');

        return { buttons, hasCollectDue, hasFullyPaid };
      })()`
    });

    console.log('Result:', JSON.stringify(res.result.value, null, 2));

    const shot = await send('Page.captureScreenshot', { format: 'png' });
    const outPath = '/Users/sharmila/.gemini/antigravity-ide/brain/10f529db-764b-4396-b01b-e4cb40958fff/direct_billing_due_button_verified.png';
    fs.writeFileSync(outPath, Buffer.from(shot.data, 'base64'));
    console.log('Saved due screenshot to:', outPath);

    ws.close();
  };
}

testDue();
