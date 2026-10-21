const WebSocket = globalThis.WebSocket;

async function run() {
  const tabsRes = await fetch('http://127.0.0.1:9222/json');
  const tabs = await tabsRes.json();
  const pageTab = tabs.find(t => t.type === 'page' && t.url && t.url.includes('5174'));
  if (!pageTab) {
    console.error('Tab not found');
    return;
  }
  const ws = new WebSocket(pageTab.webSocketDebuggerUrl);
  let id = 1;
  const send = (m, p = {}) => new Promise((resolve, reject) => {
    const mid = id++;
    const handler = (event) => {
      const parsed = JSON.parse(event.data);
      if (parsed.id === mid) {
        ws.removeEventListener('message', handler);
        if (parsed.error) reject(parsed.error);
        else resolve(parsed.result);
      }
    };
    ws.addEventListener('message', handler);
    ws.send(JSON.stringify({ id: mid, method: m, params: p }));
  });

  const logs = [];
  ws.addEventListener('message', (event) => {
    const parsed = JSON.parse(event.data);
    if (parsed.method === 'Runtime.consoleAPICalled') {
      logs.push({ type: parsed.params.type, text: parsed.params.args.map(a => a.value || a.description).join(' ') });
    }
    if (parsed.method === 'Runtime.exceptionThrown') {
      logs.push({ type: 'EXCEPTION', text: parsed.params.exceptionDetails.text, exception: parsed.params.exceptionDetails.exception?.description });
    }
  });

  ws.addEventListener('open', async () => {
    await send('Runtime.enable');
    await send('Page.enable');

    const res = await send('Runtime.evaluate', {
      expression: `(async function() {
        const token = localStorage.getItem('token') || (window.utl && window.utl.Session ? window.utl.Session.getToken() : '');
        const patRes = await fetch('/api/registration/patient/GetPatientById', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
          body: JSON.stringify({ Id: 1870 })
        });
        const patJson = await patRes.json();
        const pat = patJson.Data;

        const el = document.querySelector('.hims-theme-billing');
        const scope = angular.element(el).scope();
        if (!scope) return { error: 'no scope' };

        scope.handleReactAction('patientSelect', { patientId: 1870, patient: pat });
        scope.$apply();

        await new Promise(r => setTimeout(r, 1000));

        // Now test adding service
        const srvRes = await fetch('/api/ClinicalMaster/ServiceItem/GetServiceItems', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
          body: JSON.stringify({ Params: [{ Key: 4, Value: 2 }], PageContext: { PageSize: 5, PageNumber: 1 } })
        });
        const srvJson = await srvRes.json();
        const firstSrv = srvJson.Data && srvJson.Data[0];

        scope.handleReactAction('serviceItemChange', { index: 0, serviceId: firstSrv.Id, selectedItem: firstSrv });
        scope.$apply();

        await new Promise(r => setTimeout(r, 1000));

        return {
          patientName: scope.item && scope.item.PatientName,
          billDetailsCount: scope.PatientBillDetails && scope.PatientBillDetails.length,
          firstRowService: scope.PatientBillDetails && scope.PatientBillDetails[0] && scope.PatientBillDetails[0].ServiceName,
          grossAmt: scope.currentcontext && scope.currentcontext.GrossAmt,
          netAmt: scope.currentcontext && scope.currentcontext.TotNetAmount,
          receiptAmt: scope.currentcontext && scope.currentcontext.ReceiptAmt
        };
      })()`,
      awaitPromise: true,
      returnByValue: true
    });

    console.log('Test result:', JSON.stringify(res, null, 2));
    console.log('Logs captured:', logs.slice(-20));
    ws.close();
  });
}
run();
