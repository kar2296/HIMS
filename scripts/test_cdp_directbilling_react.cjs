const http = require('http');
const WebSocket = require('ws');

async function testDirectBillingReact() {
  const targets = await new Promise((resolve, reject) => {
    http.get('http://localhost:9222/json', res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });

  const pageTarget = targets.find(t => t.url.includes('localhost:5174'));
  if (!pageTarget) {
    throw new Error('No localhost:5174 page target found');
  }

  console.log('Connecting to target:', pageTarget.url);
  const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);

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

  await new Promise(res => ws.on('open', res));
  console.log('Connected to CDP!');

  // Navigate to #/app/directbilling/0/DG
  console.log('Navigating to http://localhost:5174/#/app/directbilling/0/DG ...');
  await send('Page.navigate', { url: 'http://localhost:5174/#/app/directbilling/0/DG' });

  // Wait 3 seconds for Angular and React to mount
  await new Promise(r => setTimeout(r, 3000));

  // Evaluate page status
  const evalRes = await send('Runtime.evaluate', {
    expression: `(() => {
      const titleEl = document.querySelector('h1');
      const title = titleEl ? titleEl.innerText : 'NO H1';
      const badge = document.querySelector('span[style*="background-color: rgb(237, 233, 254)"]') ||
                    document.querySelector('span[style*="#ede9fe"]');
      const badgeText = badge ? badge.innerText : 'NO BADGE';
      const directPatientCard = document.querySelector('#txtDirectPatientName') || document.querySelector('input[placeholder="Enter Patient Name"]');
      const hasDirectPatient = !!directPatientCard;
      const patientSearchInput = document.querySelector('#txtPatientSearch') || document.querySelector('input[placeholder*="Search Patient"]');
      const hasPatientSearch = !!patientSearchInput;
      const addServiceBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Add Service'));
      const reactComponent = !!document.querySelector('react-component[name="OpBillingListScreen"]');
      
      const genderSelect = !!document.querySelector('#selDirectPatientGender');
      const ageInput = !!document.querySelector('#txtDirectPatientAge');
      const mobileInput = !!document.querySelector('#txtDirectPatientMobile');
      const referralSelect = !!document.querySelector('#selDirectPatientReferral');

      return {
        url: window.location.href,
        reactComponent,
        title,
        badgeText,
        hasDirectPatient,
        hasPatientSearch,
        hasAddServiceBtn: !!addServiceBtn,
        genderSelect,
        ageInput,
        mobileInput,
        referralSelect
      };
    })()`,
    returnByValue: true
  });

  console.log('Result:', JSON.stringify(evalRes.result.value, null, 2));

  // Take screenshot
  const screenshot = await send('Page.captureScreenshot', { format: 'png' });
  const fs = require('fs');
  fs.writeFileSync('direct_billing_react_screenshot.png', Buffer.from(screenshot.data, 'base64'));
  console.log('Saved screenshot to direct_billing_react_screenshot.png');

  ws.close();
}

testDirectBillingReact().catch(err => {
  console.error(err);
  process.exit(1);
});
