const WebSocket = globalThis.WebSocket;

async function checkScope() {
  const tabsRes = await fetch('http://127.0.0.1:9222/json');
  const tabs = await tabsRes.json();
  const pageTab = tabs.find(t => t.url && t.url.includes('5174'));
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

  await send('Runtime.evaluate', {
    expression: `window.angular.element(document.body).injector().get('$state').go('app.ipbillingtab.insurancebill', { id: 3783 });`
  });
  await new Promise(r => setTimeout(r, 2000));

  const info = await send('Runtime.evaluate', {
    returnByValue: true,
    expression: `(() => {
      const el = document.querySelector('react-component[name="IpBillingCorrectionsActionBar"]');
      if (!el) return { error: 'no element' };
      const scope = window.angular ? window.angular.element(el).scope() : null;
      if (!scope) return { error: 'no scope' };
      return {
        hasUpdateAccess: scope.HasAccess ? scope.HasAccess('IPBILLING_BILLCORRECTION', 'IPBilling_BillCorrection_Update') : 'no HasAccess',
        hasDoctorShareAccess: scope.HasAccess ? scope.HasAccess('IPBILLING_BILLCORRECTION', 'IPBilling_DoctorShareUpdate') : 'no HasAccess',
        isFinalBillClosed: scope.currentcontext ? scope.currentcontext.isFinalBillClosed : null,
        IsDisabled: scope.IsDisabled,
        reactPropsActionBar: scope.reactPropsActionBar
      };
    })()`
  });

  console.log('Scope info:', JSON.stringify(info.result?.value, null, 2));
  process.exit(0);
}

checkScope().catch(console.error);
