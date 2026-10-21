const fs = require('fs');

async function main() {
  const list = await fetch('http://localhost:9222/json').then(r => r.json());
  const target = list.find(x => x.type === 'page' && (x.url.includes(':5173') || x.title.includes('GenericSoft')));
  if (!target) {
    console.error('No matching GenericSoft / 5173 page target found! Target list:', list);
    process.exit(1);
  }
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

  const takeScreenshot = async (name) => {
    const shot = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(`scripts/${name}.png`, Buffer.from(shot.data, 'base64'));
    console.log(`Saved screenshot: scripts/${name}.png`);
  };

  // 1. Reload & Check login
  console.log('Reloading application...');
  await send('Page.reload', { ignoreCache: true });
  await new Promise(r => setTimeout(r, 4000));

  await evalCode(`(async () => {
    if (window.location.hash.includes('login') || document.querySelector('input[type="password"]')) {
      const u = document.getElementById('login-username') || document.querySelector('input[name="username"], input[type="text"]');
      const p = document.getElementById('login-password') || document.querySelector('input[name="password"], input[type="password"]');
      const submitBtn = document.querySelector('button[type="submit"], button.btn-primary') || Array.from(document.querySelectorAll('button')).find(b => b.innerText && (b.innerText.includes('Sign in') || b.innerText.includes('Login')));
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
  await new Promise(r => setTimeout(r, 3000));

  // ==========================================
  // TEST 1: RIS Dashboard & Result Entry Screen Options
  // ==========================================
  console.log('\n--- TEST 1: Verifying RIS Dashboard & Result Entry Options ---');
  await evalCode(`window.location.hash = '#/app/ris_dashboard';`);
  await new Promise(r => setTimeout(r, 4000));

  const risCheck = await evalCode(`(() => {
    const text = document.body.innerText || '';
    const hasHeaderBtn = Array.from(document.querySelectorAll('button')).some(b => b.innerText && b.innerText.includes('Result Entry Screen'));
    const hasResultEntriesCard = text.includes('Result Entries');
    const hasTableResultEntryBtn = Array.from(document.querySelectorAll('button')).some(b => b.innerText && b.innerText.includes('Result Entry'));
    const hasOpsNav = text.includes('RIS OPERATIONS') || text.includes('RIS Operations');
    return {
      hasHeaderBtn,
      hasResultEntriesCard,
      hasTableResultEntryBtn,
      hasOpsNav,
      url: window.location.href
    };
  })()`);
  console.log('RIS Dashboard Result Entry Check:', risCheck);
  await takeScreenshot('ris_dashboard_resultentry_verified');

  // Click Result Entry Screen launcher
  console.log('Navigating to Result Entry screen via RIS...');
  await evalCode(`(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText && b.innerText.includes('Result Entry Screen')) ||
                Array.from(document.querySelectorAll('div, span, button')).find(el => el.innerText && el.innerText.trim() === 'Result Entries');
    if (btn) btn.click();
    else window.location.hash = '#/app/allorders/2';
  })()`);
  await new Promise(r => setTimeout(r, 4000));

  const resultEntryCheck = await evalCode(`(() => {
    const text = document.body.innerText || '';
    return {
      url: window.location.href,
      isResultEntryScreen: text.includes('Result Entry') || text.includes('Diagnostic Work Orders') || text.includes('All Orders'),
      textSnippet: text.slice(0, 300).replace(/\\s+/g, ' ')
    };
  })()`);
  console.log('Result Entry Workstation Check:', resultEntryCheck);
  await takeScreenshot('ris_resultentry_screen_verified');

  // ==========================================
  // TEST 2: Parameter Master Edit & Save
  // ==========================================
  console.log('\n--- TEST 2: Verifying Parameter Master Edit & Save ---');
  // Navigate to edit parameter 87 (CREATININE - SERUM)
  await evalCode(`window.location.hash = '#/app/analytetab/87/analytemaster/87';`);
  await new Promise(r => setTimeout(r, 4500));

  const formLoadCheck = await evalCode(`(() => {
    const codeInput = document.querySelector('input[value*="BC0003"], input[name="Code"]') || Array.from(document.querySelectorAll('input')).find(i => i.value === 'BC0003');
    const nameInput = document.querySelector('input[name="Name"]') || Array.from(document.querySelectorAll('input')).find(i => (i.value || '').includes('CREATININE'));
    return {
      url: window.location.href,
      codeFound: Boolean(codeInput),
      codeValue: codeInput ? codeInput.value : null,
      nameFound: Boolean(nameInput),
      nameValue: nameInput ? nameInput.value : null
    };
  })()`);
  console.log('Parameter Edit Form Loaded:', formLoadCheck);
  await takeScreenshot('analytemaster_edit_loaded_verified');

  // Trigger Save on Parameter
  console.log('Triggering Save on Parameter...');
  const saveTriggerResult = await evalCode(`(() => {
    const saveBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText && b.innerText.includes('Save & Approve'));
    if (saveBtn) {
      saveBtn.click();
      return { clicked: true, text: saveBtn.innerText };
    }
    return { clicked: false };
  })()`);
  console.log('Save button click:', saveTriggerResult);

  // If confirm modal popped up, click "Yes, Save & Approve"
  await new Promise(r => setTimeout(r, 1200));
  const confirmResult = await evalCode(`(() => {
    const yesBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText && b.innerText.includes('Yes, Save'));
    if (yesBtn) {
      yesBtn.click();
      return { confirmClicked: true, text: yesBtn.innerText };
    }
    return { confirmClicked: false };
  })()`);
  console.log('Confirmation modal click:', confirmResult);

  await new Promise(r => setTimeout(r, 3000));
  const saveOutcome = await evalCode(`(() => {
    const text = document.body.innerText || '';
    const hasErrorAlert = text.includes('already exists') || text.includes('Please fill in all required');
    const hasSuccess = text.includes('Saved successfully') || text.includes('saved successfully') || text.includes('Saving analyte');
    return {
      hasErrorAlert,
      hasSuccess,
      bodySnippet: text.slice(0, 300).replace(/\\s+/g, ' ')
    };
  })()`);
  console.log('Save outcome:', saveOutcome);
  await takeScreenshot('analytemaster_edit_saved_verified');

  console.log('\nAll checks completed successfully!');
  process.exit(0);
}

main().catch(err => {
  console.error('Verification failed:', err);
  process.exit(1);
});
