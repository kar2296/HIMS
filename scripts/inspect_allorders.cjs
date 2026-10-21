const http = require('http');
const WebSocket = require('ws');
const fs = require('fs');

async function main() {
  const targets = await new Promise((resolve, reject) => {
    http.get('http://localhost:9222/json', (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });

  const pageTarget = targets.find((t) => t.type === 'page' && !t.url.includes('chrome://') && !t.url.includes('omnibox'));
  if (!pageTarget) {
    console.error('No page target found');
    process.exit(1);
  }

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
  await send('Runtime.enable');

  console.log('Testing date range extension on All Orders...');
  const res = await send('Runtime.evaluate', {
    expression: `new Promise((resolve) => {
      const el = document.querySelector('[ng-controller*="allOrderProcessListController"]') || document.body;
      const scope = angular.element(el).scope();
      if (!scope) return resolve({ error: 'No scope' });
      
      // Let's set FromDate to 30 days ago and WorkOrderStatusId to empty or all statuses
      const d = new Date();
      d.setDate(d.getDate() - 30);
      scope.currentfilter.FromDate = d;
      scope.currentfilter.WorkOrderStatusId = null;
      scope.getList();
      
      setTimeout(() => {
        const vm = scope.vm;
        const rows = vm?.gridConfig?.data || [];
        resolve({
          rowCount: rows.length,
          sampleRow: rows[0] || null,
          statuses: rows.slice(0, 10).map(r => ({
            id: r.Id,
            woId: r.WorkOrderId || r.WorkOrderdid,
            patient: r.Patient?.FirstName,
            status: r.WorkOrderStatus?.DisplayName,
            colorStatus: r.ColorStatus,
            isPrinted: r.IsPrinted,
            isCritical: r.IsCriticalOrder
          }))
        });
      }, 1500);
    })`,
    awaitPromise: true,
    returnByValue: true
  });

  console.log('Fetch Result:', JSON.stringify(res.result.value, null, 2));

  const shot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('scripts/allorders_with_data.png', Buffer.from(shot.data, 'base64'));
  console.log('Saved scripts/allorders_with_data.png');

  ws.close();
}

main().catch(console.error);
