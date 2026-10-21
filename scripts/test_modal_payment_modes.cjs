const fs = require('fs');
const WebSocket = globalThis.WebSocket;

async function testModes() {
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

  // Change PaymentTypeId to 2 (Cheque) via Angular scope to test Cheque fields
  const chequeRes = await send('Runtime.evaluate', {
    returnByValue: true,
    expression: `(() => {
      const el = document.getElementById('item_form');
      if (!el) return { error: 'form not found' };
      const scope = angular.element(el).scope();
      if (!scope) return { error: 'scope not found' };
      scope.$apply(() => {
        scope.item.PaymentTypeId = 2; // Cheque
        scope.item.AmountPaid = 5000;
      });
      return { paymentTypeId: scope.item.PaymentTypeId, amountPaid: scope.item.AmountPaid };
    })()`
  });
  console.log('Cheque mode result:', chequeRes?.result?.value);
  await new Promise(r => setTimeout(r, 800));

  let ss = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('scripts/advance_modal_cheque_mode.png', Buffer.from(ss.data, 'base64'));
  console.log('Saved advance_modal_cheque_mode.png');

  // Change PaymentTypeId to 5 (Credit Card)
  const cardRes = await send('Runtime.evaluate', {
    returnByValue: true,
    expression: `(() => {
      const el = document.getElementById('item_form');
      const scope = angular.element(el).scope();
      scope.$apply(() => {
        scope.item.PaymentTypeId = 5; // Credit Card
        scope.item.AmountPaid = 12500;
        scope.refreshReactProps();
      });
      return { paymentTypeId: scope.item.PaymentTypeId, amountPaid: scope.item.AmountPaid };
    })()`
  });
  console.log('Card mode result:', cardRes?.result?.value);
  await new Promise(r => setTimeout(r, 800));

  ss = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('scripts/advance_modal_card_mode.png', Buffer.from(ss.data, 'base64'));
  console.log('Saved advance_modal_card_mode.png');

  // Switch back to 1 (Cash)
  await send('Runtime.evaluate', {
    expression: `(() => {
      const el = document.getElementById('item_form');
      const scope = angular.element(el).scope();
      scope.$apply(() => {
        scope.item.PaymentTypeId = 1;
        scope.item.AmountPaid = 2500;
      });
    })()`
  });
  await new Promise(r => setTimeout(r, 500));

  ss = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('scripts/advance_modal_cash_final.png', Buffer.from(ss.data, 'base64'));
  console.log('Saved advance_modal_cash_final.png');

  process.exit(0);
}

testModes().catch(err => {
  console.error(err);
  process.exit(1);
});
