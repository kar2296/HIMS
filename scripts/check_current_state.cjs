const http = require('http');
const WebSocket = require('ws');

async function main() {
  const targets = await new Promise((resolve, reject) => {
    http.get('http://localhost:9222/json', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });
  const pageTarget = targets.find(t => t.type === 'page' && !t.url.includes('chrome://'));
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

  await send('Page.enable');
  await send('Runtime.enable');

  const check = await send('Runtime.evaluate', {
    expression: `(() => {
      const el = document.querySelector('.samplereview-form-wrapper') || document.body;
      const scope = angular.element(el).scope();
      return {
        detailsLen: scope.details ? scope.details.length : 0,
        reactDetailsLen: scope.reactProps && scope.reactProps.details ? scope.reactProps.details.length : 0,
        patientName: scope.reactProps?.patient?.PatientName,
        mrn: scope.reactProps?.patient?.MRN,
        domRows: Array.from(document.querySelectorAll('tbody tr')).map(tr => tr.innerText.replace(/\\s+/g, ' ').trim())
      };
    })()`,
    returnByValue: true
  });
  console.log('CURRENT PAGE STATE:', JSON.stringify(check.result.value, null, 2));

  // Screenshot
  const shot = await send('Page.captureScreenshot', { format: 'png' });
  const fs = require('fs');
  fs.writeFileSync('scripts/samplereview_form_current.png', Buffer.from(shot.data, 'base64'));

  ws.close();
}
main().catch(console.error);
