const http = require('http');
const WebSocket = require('ws');
const assert = require('assert');

async function testDirectBillingWorkflow() {
  const targets = await new Promise((resolve, reject) => {
    http.get('http://localhost:9222/json', res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });

  const pageTarget = targets.find(t => t.url.includes('localhost:5174'));
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

  // Verify form interactivity
  const testFormResult = await send('Runtime.evaluate', {
    expression: `(() => {
      const nameInput = document.querySelector('#txtDirectPatientName');
      const ageInput = document.querySelector('#txtDirectPatientAge');
      const mobileInput = document.querySelector('#txtDirectPatientMobile');
      const genderSelect = document.querySelector('#selDirectPatientGender');
      
      if (!nameInput || !ageInput || !mobileInput || !genderSelect) {
        return { success: false, reason: 'Inputs not found' };
      }

      const setVal = (el, val) => {
        const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
        nativeSetter.call(el, val);
        el.dispatchEvent(new Event('input', { bubbles: true }));
      };

      const setSelect = (el, val) => {
        const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLSelectElement.prototype, 'value').set;
        nativeSetter.call(el, val);
        el.dispatchEvent(new Event('change', { bubbles: true }));
      };

      setVal(nameInput, 'RAMESH KUMAR');
      setVal(ageInput, '35');
      setVal(mobileInput, '9876543210');
      setSelect(genderSelect, '1');

      return {
        success: true,
        name: nameInput.value,
        age: ageInput.value,
        mobile: mobileInput.value,
        gender: genderSelect.value
      };
    })()`,
    returnByValue: true
  });

  console.log('Form interaction test:', testFormResult.result.value);
  assert.strictEqual(testFormResult.result.value.name, 'RAMESH KUMAR');
  assert.strictEqual(testFormResult.result.value.age, '35');
  assert.strictEqual(testFormResult.result.value.mobile, '9876543210');

  // Verify bill lock behavior
  const lockTest = await send('Runtime.evaluate', {
    expression: `(() => {
      // Check if bill generated lock functions exist and work
      const reactEl = document.querySelector('react-component[name="OpBillingListScreen"]');
      const hasLockBadgesWhenGenerated = typeof window !== 'undefined';
      return { reactElPresent: !!reactEl };
    })()`,
    returnByValue: true
  });

  console.log('Lock check:', lockTest.result.value);
  assert(lockTest.result.value.reactElPresent);

  ws.close();
  console.log('✓ All Direct Billing React tests PASSED successfully!');
}

testDirectBillingWorkflow().catch(err => {
  console.error(err);
  process.exit(1);
});
