const fs = require('fs');

async function main() {
  console.log('Connecting to Chrome remote debugging on port 9222...');
  const list = await fetch('http://localhost:9222/json').then(r => r.json());
  const target = list.find(x => x.url && !x.url.startsWith('chrome-extension://') && x.type === 'page') || list[0];
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

  // Reload page to get latest assets
  console.log('Reloading browser to load updated JavaScript & HTML templates...');
  await send('Page.reload', { ignoreCache: true });
  await new Promise(r => setTimeout(r, 4500));

  // Perform login if needed
  console.log('Checking authentication...');
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

  await new Promise(r => setTimeout(r, 4000));

  async function testRoute(name, hash, expectedComponent) {
    console.log(`\n--------------------------------------------------`);
    console.log(`Testing Screen: ${name} -> ${hash}`);
    await evalCode(`(() => { window.location.hash = '${hash}'; })()`);
    await new Promise(r => setTimeout(r, 3500));

    const check = await evalCode(`(() => {
      const reactEls = Array.from(document.querySelectorAll('react-component')).map(el => el.getAttribute('name'));
      const text = document.body.innerText;
      return {
        url: window.location.href,
        reactComponents: reactEls,
        hasExpected: reactEls.includes('${expectedComponent}') || (document.querySelector('${expectedComponent}') !== null),
        bodyLen: text.length,
        titleSnippet: text.slice(0, 140).replace(/\\n+/g, ' ')
      };
    })()`);

    console.log(`Result:`, check);

    const ss = await send('Page.captureScreenshot', { format: 'png' });
    const p = `/Users/sharmila/Rajesh/my-app/scripts/audit_${name.toLowerCase().replace(/[^a-z0-9]+/g, '_')}.png`;
    fs.writeFileSync(p, Buffer.from(ss.data, 'base64'));
    console.log(`Screenshot saved to: ${p}`);
    return check;
  }

  const results = {};

  // 1. LIS Interface
  results['1_lisinterface'] = await testRoute(
    'LIS Interface Telemetry Feed',
    '#/app/lisinterface/',
    'LisInterfaceScreen'
  );

  // 1b. LIS Interface Result Modal Check via Angular utl.Modal
  console.log('\nTesting Modal: LisInterfaceResultModalScreen...');
  const modalRes1 = await evalCode(`(() => {
    try {
      const utl = angular.element(document.body).injector().get('utl');
      utl.Modal.open('app.lisinterfaceresult', {
        params: { id: 1, sid: 'SMP-2026-9901' }
      });
      return { triggered: true };
    } catch(e) {
      return { error: e.message };
    }
  })()`);
  await new Promise(r => setTimeout(r, 2000));
  const checkModal1 = await evalCode(`(() => {
    const rc = Array.from(document.querySelectorAll('react-component')).map(el => el.getAttribute('name'));
    return { reactComponents: rc, hasModal: rc.includes('LisInterfaceResultModalScreen') };
  })()`);
  console.log('LisInterfaceResultModalScreen Modal Result:', checkModal1);
  results['1b_lisinterface_modal'] = checkModal1;
  const ssModal1 = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('/Users/sharmila/Rajesh/my-app/scripts/audit_modal_lisinterfaceresult.png', Buffer.from(ssModal1.data, 'base64'));

  // Close modal 1
  await evalCode(`(() => {
    const closeBtn = document.querySelector('.modal-content button, [ng-click="cancelCallback()"]');
    if (closeBtn) closeBtn.click();
    const backdrop = document.querySelector('.modal-backdrop');
    if (backdrop) backdrop.remove();
    const modal = document.querySelector('.modal');
    if (modal) modal.remove();
  })()`);
  await new Promise(r => setTimeout(r, 1000));

  // 2. Result Amendment Workstation
  results['2_resultamendment'] = await testRoute(
    'Diagnostic Result Amendment Workstation',
    '#/app/resultamendment/1',
    'AllResultApprovalListScreen'
  );

  // 3. External Providers List
  results['3_externalprovider_list'] = await testRoute(
    'External Referral Providers Master',
    '#/app/externalprovider',
    'ExternalProvidersListScreen'
  );

  // 3b. External Provider Tabs (Form Tab)
  results['3b_externalprovider_form_tab'] = await testRoute(
    'External Provider Form Tab',
    '#/app/externalprovidertab/1/externalproviders',
    'ExternalProviderFormScreen'
  );

  // 3c. External Provider Price Mapping Tab
  results['3c_externalprovider_pricemapping_tab'] = await testRoute(
    'External Provider Price Mapping Tab',
    '#/app/externalprovidertab/1/pricemapping',
    'ExternalProviderPriceMappingListScreen'
  );

  // 4. External Lab Orders
  results['4_externallaborders'] = await testRoute(
    'External Send-Out Lab Orders',
    '#/app/externallaborders/',
    'ExternalLabOrdersListScreen'
  );

  // 4b. External Order Sendout Modal Check
  console.log('\nTesting Modal: ExternalOrderAssignmentModalScreen...');
  await evalCode(`(() => {
    try {
      const utl = angular.element(document.body).injector().get('utl');
      utl.Modal.open('app.externalorderform', {
        params: { id: 1, pid: 1, oid: 1 }
      });
      return { triggered: true };
    } catch(e) {
      return { error: e.message };
    }
  })()`);
  await new Promise(r => setTimeout(r, 2000));
  const checkModal4 = await evalCode(`(() => {
    const rc = Array.from(document.querySelectorAll('react-component')).map(el => el.getAttribute('name'));
    return { reactComponents: rc, hasModal: rc.includes('ExternalOrderAssignmentModalScreen') };
  })()`);
  console.log('ExternalOrderAssignmentModalScreen Result:', checkModal4);
  results['4b_externalorder_modal'] = checkModal4;
  const ssModal4 = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('/Users/sharmila/Rajesh/my-app/scripts/audit_modal_externalorder.png', Buffer.from(ssModal4.data, 'base64'));

  // Close modal 4
  await evalCode(`(() => {
    const backdrop = document.querySelector('.modal-backdrop');
    if (backdrop) backdrop.remove();
    const modal = document.querySelector('.modal');
    if (modal) modal.remove();
  })()`);
  await new Promise(r => setTimeout(r, 1000));

  // 4c. Clinical Document Upload Modal Check
  console.log('\nTesting Modal: ExternalClinicalDocumentModalScreen...');
  await evalCode(`(() => {
    try {
      const utl = angular.element(document.body).injector().get('utl');
      utl.Modal.open('app.externalclinicaldocument', {
        params: { id: 1, pid: 1, oid: 1, eid: 1 }
      });
      return { triggered: true };
    } catch(e) {
      return { error: e.message };
    }
  })()`);
  await new Promise(r => setTimeout(r, 2000));
  const checkModal4c = await evalCode(`(() => {
    const rc = Array.from(document.querySelectorAll('react-component')).map(el => el.getAttribute('name'));
    return { reactComponents: rc, hasModal: rc.includes('ExternalClinicalDocumentModalScreen') };
  })()`);
  console.log('ExternalClinicalDocumentModalScreen Result:', checkModal4c);
  results['4c_clinicaldocument_modal'] = checkModal4c;
  const ssModal4c = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('/Users/sharmila/Rajesh/my-app/scripts/audit_modal_clinicaldocument.png', Buffer.from(ssModal4c.data, 'base64'));

  // Close modal 4c
  await evalCode(`(() => {
    const backdrop = document.querySelector('.modal-backdrop');
    if (backdrop) backdrop.remove();
    const modal = document.querySelector('.modal');
    if (modal) modal.remove();
  })()`);
  await new Promise(r => setTimeout(r, 1000));

  // 5. My Orders Process
  results['5_orderprocess'] = await testRoute(
    'My Orders Processing Workbench',
    '#/app/orderProcess/1',
    'AllOrdersProcessListScreen'
  );

  // 6. Order Status Change List
  results['6_orderstatuschange_list'] = await testRoute(
    'Diagnostic Order Status Change List',
    '#/app/orderstatuschange/',
    'OrderStatusChangeScreen'
  );

  // 6b. Order Status Change Form
  results['6b_orderstatuschange_form'] = await testRoute(
    'Diagnostic Order Status Change Form',
    '#/app/orderstatuschangeform/1',
    'OrderStatusChangeFormScreen'
  );

  // 7. Investigation Tracking Tabs Container (Pending Orders)
  results['7_investigationtracking_pending'] = await testRoute(
    'Investigation Tracking - Pending Orders Tab',
    '#/app/investigationtrackingtab//pendingorder/',
    'InvestigationFollowupTrackerScreen'
  );

  // 7b. Investigation Tracking (Complete Orders Tab)
  results['7b_investigationtracking_complete'] = await testRoute(
    'Investigation Tracking - Complete Orders Tab',
    '#/app/investigationtrackingtab//completeorder/',
    'InvestigationFollowupTrackerScreen'
  );

  console.log('\n==================================================');
  console.log('ALL 7 ROUTES, TABS & POPUPS VERIFICATION SUMMARY:');
  console.log(JSON.stringify(results, null, 2));

  ws.close();
}

main().catch(console.error);
