const WebSocket = require('ws');
const fs = require('fs');

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

  // Ensure navigated to Result Entry
  console.log('Navigating to Result Entry screen for Workorder 8952...');
  await send('Runtime.evaluate', {
    expression: `window.location.hash = '#/app/resultentry/8952';`
  });

  // Wait 4 seconds for API and rendering
  await new Promise(r => setTimeout(r, 4000));

  const check = async (statusId, label) => {
    const res = await send('Runtime.evaluate', {
      returnByValue: true,
      expression: `(() => {
        const comp = document.querySelector('react-component[name="ResultEntryFormScreen"]');
        const sc = comp ? angular.element(comp).scope() : null;
        if (!sc) return { error: 'no scope' };
        sc.item.WorkOrderStatusId = ${statusId};
        if (sc.updateReactProps) sc.updateReactProps();
        return {
          statusSet: ${statusId},
          canDisableApproveReject: sc.CanDisableApproveRejectButton ? sc.CanDisableApproveRejectButton() : 'no fn',
          reactPermissions: sc.reactProps?.permissions
        };
      })()`
    });
    console.log(`\n========================================`);
    console.log(`TEST STATUS: ${label} (ID: ${statusId})`);
    console.log(`========================================`);
    console.log('Angular Scope state:', JSON.stringify(res.result?.value, null, 2));

    // Wait 500ms for React re-render
    await new Promise(r => setTimeout(r, 600));

    const domCheck = await send('Runtime.evaluate', {
      returnByValue: true,
      expression: `(() => {
        const btnApprove = document.getElementById('btnApproveOrder');
        const btnSendApproval = document.getElementById('btnSendForApproval');
        const btnReject = document.getElementById('btnRejectOrder');
        const btnSave = document.getElementById('btnSaveForm');
        const chkApproved = document.getElementById('chkMarkApproved');

        return {
          btnApproveOrder: {
            exists: !!btnApprove,
            display: btnApprove ? window.getComputedStyle(btnApprove).display : 'none'
          },
          btnSendForApproval: {
            exists: !!btnSendApproval
          },
          btnRejectOrder: {
            exists: !!btnReject
          },
          btnSaveForm: {
            exists: !!btnSave
          },
          chkMarkApproved: {
            exists: !!chkApproved
          }
        };
      })()`
    });
    console.log('DOM check result:', JSON.stringify(domCheck.result?.value, null, 2));

    // Capture screenshot
    const shot = await send('Page.captureScreenshot', { format: 'png' });
    const filename = `scripts/test_status_${statusId}_${label.toLowerCase().replace(/[^a-z0-9]/g, '_')}.png`;
    fs.writeFileSync(filename, Buffer.from(shot.data, 'base64'));
    console.log(`Screenshot saved to ${filename}`);
  };

  // Test 1: FULLY APPROVED (Status 7) -> Approval button MUST NOT SHOW
  await check(7, 'FULLY_APPROVED_7');

  // Test 2: RELEASED (Status 8) -> Approval button MUST NOT SHOW
  await check(8, 'RELEASED_8');

  // Test 3: PARTIALLY APPROVED (Status 9) -> Approval button MUST SHOW
  await check(9, 'PARTIALLY_APPROVED_9');

  // Test 4: COMPLETED (Status 4) -> Approval button MUST SHOW
  await check(4, 'COMPLETED_4');

  // Test 5: CREATED (Status 1) -> Approval button MUST SHOW
  await check(1, 'CREATED_1');

  ws.close();
}

main().catch(console.error);
