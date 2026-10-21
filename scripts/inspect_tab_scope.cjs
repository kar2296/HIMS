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

  const pageTarget = targets.find(t => t.url.includes('localhost:5174'));
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
        const el = document.querySelector('.hims-theme-ipbilling');
        const sc = el ? angular.element(el).scope() : null;
        return {
          hasTabScope: !!sc,
          Data: sc ? {
            PatientName: sc.Data?.PatientName,
            PatientId: sc.Data?.PatientId,
            Doctor: sc.Data?.Doctor
          } : null,
          selectedPatient: sc ? sc.selectedPatient : null,
          currentcontext: sc ? sc.currentcontext : null,
          reactProps: sc ? sc.reactProps : null
        };
      })()
    `
  });

  console.log('Result:', JSON.stringify(res.result.value, null, 2));
  ws.close();
}

main().catch(console.error);
