const http = require('http');
const WebSocket = require('ws');

async function main() {
  const targets = await new Promise((resolve, reject) => {
    http.get('http://localhost:9222/json', res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });

  const pageTarget = targets.find(t => t.url.includes('ipbillingtab'));
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
        const summary = document.querySelector('react-component[name="IpBillingSummaryScreen"]');
        const wrapper = document.querySelector('.content-wrapper');
        const section = document.querySelector('section');
        return {
          windowH: window.innerHeight,
          summaryRect: summary ? summary.getBoundingClientRect() : null,
          bodyH: document.body.scrollHeight,
          htmlH: document.documentElement.scrollHeight,
          sectionH: section ? section.scrollHeight : 0,
          sectionClientH: section ? section.clientHeight : 0,
          wrapperH: wrapper ? wrapper.scrollHeight : 0,
          wrapperClientH: wrapper ? wrapper.clientHeight : 0
        };
      })()
    `
  });

  console.log('Result:', JSON.stringify(res.result.value, null, 2));
  ws.close();
}

main().catch(console.error);
