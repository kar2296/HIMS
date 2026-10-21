const fs = require('fs');

async function main() {
  const list = await fetch('http://localhost:9222/json').then(r => r.json());
  const target = list.find(x => x.type === 'page');
  if (!target) {
    console.log('No page target found, available targets:', list);
    return;
  }
  console.log('Using target:', target.id, target.url);

  const ws = new WebSocket(target.webSocketDebuggerUrl);
  let id = 1;
  const send = (method, params = {}) => new Promise((resolve, reject) => {
    const msgId = id++;
    const handler = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.id === msgId) {
        ws.removeEventListener('message', handler);
        if (msg.error) reject(msg.error);
        else resolve(msg.result);
      }
    };
    ws.addEventListener('message', handler);
    ws.send(JSON.stringify({ id: msgId, method, params }));
  });

  await new Promise(r => ws.addEventListener('open', r));
  await send('Page.enable');
  await send('Runtime.enable');

  const evalCode = (expr) => send('Runtime.evaluate', {
    expression: expr,
    returnByValue: true,
    awaitPromise: true
  }).then(r => r.result?.value);

  // Navigate to Radiology Order Acknowledgements
  console.log('Navigating to #/app/orderacknowledgements/2...');
  await evalCode(`window.location.hash = '#/app/orderacknowledgements/2';`);
  await new Promise(r => setTimeout(r, 3000));

  const stateInfo = await evalCode(`(() => {
    return {
      hash: window.location.hash,
      title: document.title,
      rows: Array.from(document.querySelectorAll('#tblOrderAcknowledgements tbody tr')).map(tr => ({
        text: tr.innerText.replace(/\\s+/g, ' ').trim(),
        buttons: Array.from(tr.querySelectorAll('button')).map(b => b.innerText || b.id || b.className)
      }))
    };
  })()`);

  console.log('Page info:', JSON.stringify(stateInfo, null, 2));

  // Also test order 5666 in orderacknowledgementform:
  console.log('Navigating to #/app/orderacknowledgementform/2?id=5666&pid=1443...');
  await evalCode(`window.location.hash = '#/app/orderacknowledgementform/2?id=5666&pid=1443';`);
  await new Promise(r => setTimeout(r, 3000));

  const formInfo = await evalCode(`(() => {
    const btnAccept = document.getElementById('btnAcceptOrder');
    const btnCancel = document.getElementById('btnOrderCancel');
    const allButtons = Array.from(document.querySelectorAll('button')).map(b => ({
      id: b.id,
      text: b.innerText.trim(),
      disabled: b.disabled,
      visible: b.offsetParent !== null
    }));
    return {
      hash: window.location.hash,
      btnAccept: btnAccept ? {
        id: btnAccept.id,
        text: btnAccept.innerText.trim(),
        disabled: btnAccept.disabled,
        visible: btnAccept.offsetParent !== null
      } : null,
      btnCancel: btnCancel ? {
        id: btnCancel.id,
        text: btnCancel.innerText.trim(),
        disabled: btnCancel.disabled,
        visible: btnCancel.offsetParent !== null
      } : null,
      buttons: allButtons
    };
  })()`);

  console.log('Form info for order 5666:', JSON.stringify(formInfo, null, 2));

  ws.close();
}

main().catch(console.error);
