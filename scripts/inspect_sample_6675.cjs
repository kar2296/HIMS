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

  const pageTarget = targets.find(t => t.url && t.url.includes(':5174'));
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

  const evalRes = await send('Runtime.evaluate', {
    expression: `(() => {
      const rows = document.querySelectorAll('table tbody tr');
      const data = [];
      for (const r of rows) {
        data.push({
          cells: Array.from(r.querySelectorAll('td, th')).map(c => c.innerText.trim()).filter(Boolean),
          checked: r.querySelector('input[type="checkbox"]')?.checked,
          disabled: r.querySelector('input[type="checkbox"]')?.disabled
        });
      }
      return {
        url: window.location.hash,
        rowCount: rows.length,
        data: data
      };
    })()`,
    returnByValue: true
  });

  console.log('Result:', JSON.stringify(evalRes.result.value, null, 2));
  ws.close();
}

main().catch(console.error);
