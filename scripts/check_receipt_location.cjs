const WebSocket = globalThis.WebSocket;
const fs = require('fs');

async function test() {
  const tabsRes = await fetch('http://127.0.0.1:9222/json');
  const tabs = await tabsRes.json();
  const pageTab = tabs.find(t => t.id === '0AB041AA33F6F94A944131B76CDBC3DF') || tabs.find(t => t.url && t.url.includes('5174'));

  const ws = new WebSocket(pageTab.webSocketDebuggerUrl);
  let id = 1;
  const send = (m, p = {}) => new Promise((resolve) => {
    const mid = id++;
    const handler = (e) => {
      const parsed = JSON.parse(e.data);
      if (parsed.id === mid) {
        ws.removeEventListener('message', handler);
        resolve(parsed.result);
      }
    };
    ws.addEventListener('message', handler);
    ws.send(JSON.stringify({ id: mid, method: m, params: p }));
  });

  ws.onopen = async () => {
    await send('Page.enable');
    await send('Runtime.enable');

    // Login & navigate
    await send('Runtime.evaluate', {
      awaitPromise: true,
      expression: `(async () => {
        if (window.location.hash.includes('login') || document.querySelector('input[name="username"]')) {
          const userIn = document.querySelector('input[name="username"], input[type="text"]');
          const passIn = document.querySelector('input[name="password"], input[type="password"]');
          const submitBtn = document.querySelector('button[type="submit"], button.btn-primary') || Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Sign in'));
          if (userIn && passIn && submitBtn) {
            userIn.value = 'admin';
            userIn.dispatchEvent(new Event('input', { bubbles: true }));
            passIn.value = 'admin';
            passIn.dispatchEvent(new Event('input', { bubbles: true }));
            submitBtn.click();
            await new Promise(r => setTimeout(r, 2000));
          }
        }
        window.location.hash = '#/app/directbilling/0/DG';
      })()`
    });

    await new Promise(r => setTimeout(r, 2500));

    // Load Bill 1214
    await send('Runtime.evaluate', {
      awaitPromise: true,
      expression: `(async () => {
        const allEls = document.querySelectorAll('*');
        let sc = null;
        for (const e of allEls) {
          const candidate = window.angular ? window.angular.element(e).scope() : null;
          if (candidate && typeof candidate.handleReactAction === 'function') {
            sc = candidate;
            break;
          }
        }
        if (sc) {
          sc.handleReactAction('findBillSelect', {
            BillId: 1214,
            PatientId: 1042,
            BillTypeId: 5
          });
        }
        await new Promise(r => setTimeout(r, 3000));
      })()`
    });

    // Check where REC24-25/415 is located
    const loc = await send('Runtime.evaluate', {
      returnByValue: true,
      expression: `(() => {
        const el = Array.from(document.querySelectorAll('*')).find(e => e.children.length === 0 && e.innerText?.includes('REC24-25/415'));
        if (!el) return { found: false };
        return {
          found: true,
          tagName: el.tagName,
          text: el.innerText,
          parentText: el.parentElement ? el.parentElement.innerText : null,
          grandParentText: el.parentElement?.parentElement ? el.parentElement.parentElement.innerText : null
        };
      })()`
    });
    const resValue = loc.result?.value || loc?.value;
    console.log('Location of receipt text:', JSON.stringify(resValue, null, 2));

    const shot = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true });
    fs.writeFileSync('/Users/sharmila/.gemini/antigravity-ide/brain/10f529db-764b-4396-b01b-e4cb40958fff/receipt_location_full.png', Buffer.from(shot.data, 'base64'));
    console.log('Saved screenshot to receipt_location_full.png');

    ws.close();
    process.exit(0);
  };
}

test();
