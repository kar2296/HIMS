const http = require('http');
const WebSocket = require('ws');

async function checkScope() {
  const targets = await new Promise((resolve, reject) => {
    http.get('http://localhost:9222/json', res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });

  const pageTarget = targets.find(t => t.url.includes('localhost:5174'));
  if (!pageTarget) {
    console.error('No localhost:5174 target found');
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

  const res = await send('Runtime.evaluate', {
    returnByValue: true,
    expression: `
      (() => {
        const el = document.querySelector('.hims-theme-ipbilling-summary');
        const sc = el ? angular.element(el).scope() : null;
        if (!sc) return { error: 'No scope found' };
        return {
          currentcontext: {
            TotGrossAmount: sc.currentcontext?.TotGrossAmount,
            TotNetAmount: sc.currentcontext?.TotNetAmount,
            TotBalanceAmt: sc.currentcontext?.TotBalanceAmt,
            TotDiscAmount: sc.currentcontext?.TotDiscAmount,
            TotalReceiptAmount: sc.currentcontext?.TotalReceiptAmount
          },
          item: {
            GrossAmount: sc.item?.GrossAmount,
            TotNetAmount: sc.item?.TotNetAmount,
            BalanceAmount: sc.item?.BalanceAmount,
            TotalDiscountAmount: sc.item?.TotalDiscountAmount
          },
          summaryDetailsLength: (sc.PatientSummaryDetails || []).length,
          suppDetailsLength: (sc.SupplementaryDetails || []).length,
          reactPropsKeys: Object.keys(sc.reactProps || {})
        };
      })()
    `
  });

  console.log('Scope check result:', JSON.stringify(res.result.value, null, 2));
  ws.close();
}

checkScope().catch(console.error);
