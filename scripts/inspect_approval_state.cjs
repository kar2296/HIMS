const WebSocket = require('ws');

async function main() {
  const res = await fetch('http://localhost:9222/json');
  const pages = await res.json();
  const page = pages.find(p => p.type === 'page' && !p.url.includes('omnibox'));
  if (!page) {
    console.log('No page target found');
    process.exit(1);
  }

  const ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise(r => ws.on('open', r));

  let id = 1;
  const send = (method, params = {}) => new Promise((resolve) => {
    const msgId = id++;
    const handler = (data) => {
      const msg = JSON.parse(data);
      if (msg.id === msgId) {
        ws.off('message', handler);
        resolve(msg.result);
      }
    };
    ws.on('message', handler);
    ws.send(JSON.stringify({ id: msgId, method, params }));
  });

  const state = await send('Runtime.evaluate', {
    returnByValue: true,
    expression: `(() => {
      const comp = document.querySelector('react-component[name="ResultEntryFormScreen"]');
      const sc = comp ? angular.element(comp).scope() : null;
      const btnApprove = document.getElementById('btnApproveOrder');
      const btnSendApproval = document.getElementById('btnSendForApproval');
      const chkApproved = document.getElementById('chkMarkApproved');

      return {
        WorkOrderStatusId: sc?.item?.WorkOrderStatusId,
        WorkOrderStatusName: sc?.item?.WorkOrderStatus?.DisplayName,
        IsApproved: sc?.item?.IsApproved,
        Approvedbyid: sc?.item?.Approvedbyid,
        permissions: sc?.reactProps?.permissions,
        canDisableApproveReject: sc?.CanDisableApproveRejectButton ? sc.CanDisableApproveRejectButton() : 'no fn',
        btnApprovePresent: !!btnApprove,
        btnSendApprovalPresent: !!btnSendApproval,
        chkApprovedPresent: !!chkApproved
      };
    })()`
  });

  console.log('Order State:', JSON.stringify(state.result?.value, null, 2));
  ws.close();
}

main().catch(console.error);
