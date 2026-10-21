const fs = require('fs');

async function main() {
  const list = await fetch('http://localhost:9222/json').then(r => r.json());
  const target = list.find(x => x.id === '830CF0AC56C0A99846E2FD802CF83568') || list.find(x => x.type === 'page');
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

  ws.addEventListener('message', (ev) => {
    const d = JSON.parse(ev.data);
    if (d.method === 'Runtime.consoleAPICalled') {
      const msg = d.params.args.map(a => a.value || a.description).join(' ');
      if (d.params.type === 'error') {
        console.error('BROWSER ERROR:', msg);
      }
    }
  });

  const evalCode = (expr) => send('Runtime.evaluate', {
    expression: expr,
    returnByValue: true,
    awaitPromise: true
  }).then(r => r.result?.value);

  // 1. Reload to ensure latest scripts are loaded
  console.log('Reloading to ensure latest states are loaded...');
  await send('Page.reload', { ignoreCache: true });
  await new Promise(r => setTimeout(r, 4500));

  // 2. Perform Login
  console.log('Checking login...');
  await evalCode(`(async () => {
    if (window.location.hash.includes('login') || document.querySelector('input[type="password"]')) {
      const u = document.getElementById('login-username') || document.querySelector('input[name="username"], input[type="text"]');
      const p = document.getElementById('login-password') || document.querySelector('input[name="password"], input[type="password"]');
      const submitBtn = document.querySelector('button[type="submit"], button.btn-primary') || Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Sign in') || b.innerText.includes('Login'));
      if (u && p && submitBtn) {
        const valSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
        valSetter.call(u, 'admin');
        u.dispatchEvent(new Event('input', { bubbles: true }));
        valSetter.call(p, 'admin');
        p.dispatchEvent(new Event('input', { bubbles: true }));
        submitBtn.click();
      }
    }
  })()`);

  console.log('Waiting for auth and shell bootstrap...');
  await new Promise(r => setTimeout(r, 4500));

  async function testScreen(name, hash, selector) {
    console.log(`\n========================================`);
    console.log(`Testing: ${name} (${hash})`);
    await evalCode(`(() => { window.location.hash = '${hash}'; })()`);
    await new Promise(r => setTimeout(r, 3500));

    const check = await evalCode(`(() => {
      const el = document.querySelector('${selector}');
      const reactEl = document.querySelector('react-component');
      return {
        url: window.location.href,
        foundSelector: Boolean(el),
        reactComponent: reactEl ? reactEl.getAttribute('name') : null,
        bodyLen: document.body.innerText.length,
        snippet: document.body.innerText.slice(0, 160).replace(/\\n+/g, ' ')
      };
    })()`);
    console.log(`Result:`, check);

    const ss = await send('Page.captureScreenshot', { format: 'png' });
    const p = `/Users/sharmila/Rajesh/my-app/scripts/lis_verified_${name.toLowerCase().replace(/[^a-z0-9]+/g, '_')}.png`;
    fs.writeFileSync(p, Buffer.from(ss.data, 'base64'));
    console.log(`Saved screenshot: ${p}`);
    return check;
  }

  const results = {};
  results['LIS_Dashboard'] = await testScreen('LIS Dashboard', '#/app/labdashboard', 'react-component[name="LabDashboardComponent"]');
  results['Order_Acknowledgement'] = await testScreen('Order Acknowledgement', '#/app/orderacknowledgements/1', 'react-component[name="OrderAcknowledgementListScreen"]');
  results['Sample_Collection_List'] = await testScreen('Sample Collection List', '#/app/samplecollectionlist', 'react-component[name="SampleCollectListScreen"]');
  results['Sample_Review'] = await testScreen('Sample Review', '#/app/samplereviewlist', 'react-component[name="SampleReviewListScreen"]');
  results['Order_Assignment'] = await testScreen('Order Assignment', '#/app/orderassignmentlist/', 'react-component[name="OrderAssignmentListScreen"]');
  results['All_Orders_Process'] = await testScreen('All Orders Process', '#/app/allorders/1', 'react-component[name="AllOrdersProcessListScreen"]');
  results['Result_Approval'] = await testScreen('Result Approval', '#/app/approvalallorders/1', 'react-component[name="AllResultApprovalListScreen"]');
  results['Result_Dispatch'] = await testScreen('Result Dispatch', '#/app/resultdispatchlist/1', 'react-component[name="ResultDispatchListScreen"]');
  results['Container_Types'] = await testScreen('Container Types Master', '#/app/containertypes', 'react-component[name="ContainerTypesListScreen"]');
  results['Sample_Types'] = await testScreen('Sample Types Master', '#/app/sampletypes', 'react-component[name="SampleTypesListScreen"]');
  results['Test_Masters'] = await testScreen('Test Masters', '#/app/testmasters', 'react-component[name="TestMastersListScreen"]');
  results['Analyte_Masters'] = await testScreen('Analyte Masters', '#/app/analytemasters', 'react-component[name="AnalyteMastersListScreen"]');
  results['Antibiotic_Masters'] = await testScreen('Antibiotic Masters', '#/app/antibioticmasters', 'react-component[name="AntibioticMastersListScreen"]');
  results['Organism_Isolation'] = await testScreen('Organism Isolation', '#/app/organismsisolations', 'react-component[name="OrganismIsolatedListScreen"]');

  console.log('\n========================================');
  console.log('ALL LIS SCREENS TEST SUMMARY:');
  console.log(JSON.stringify(results, null, 2));

  ws.close();
}

main().catch(console.error);
