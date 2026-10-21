const WebSocket = globalThis.WebSocket;
const fs = require('fs');

async function test() {
  console.log('=== Step 1: Connecting to Chrome CDP ===');
  const tabsRes = await fetch('http://127.0.0.1:9222/json');
  const tabs = await tabsRes.json();
  const pageTab = tabs.find(t => t.id === '0AB041AA33F6F94A944131B76CDBC3DF') || tabs.find(t => t.url && t.url.includes('5174'));
  if (!pageTab) {
    console.error('No tab found!');
    process.exit(1);
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

  ws.onopen = async () => {
    try {
      await send('Page.enable');
      await send('Runtime.enable');

      console.log('=== Step 2: Logging in if needed ===');
      await send('Runtime.evaluate', {
        awaitPromise: true,
        expression: `(async () => {
          if (window.location.hash.includes('login') || document.querySelector('input[type="password"]')) {
            const u = document.getElementById('login-username') || document.querySelector('input[name="username"], input[type="text"]');
            const p = document.getElementById('login-password') || document.querySelector('input[name="password"], input[type="password"]');
            const submitBtn = document.querySelector('button[type="submit"], button.btn-primary') || Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Sign in'));
            if (u && p && submitBtn) {
              const valSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
              valSetter.call(u, 'admin');
              u.dispatchEvent(new Event('input', { bubbles: true }));
              valSetter.call(p, 'admin');
              p.dispatchEvent(new Event('input', { bubbles: true }));
              submitBtn.click();
              await new Promise(r => setTimeout(r, 2000));
            }
          }
          window.location.hash = '#/app/directbilling/0/DG';
        })()`
      });

      await new Promise(r => setTimeout(r, 3000));

      console.log('=== Step 3: Dispatching findBillSelect for DG-10003 (BillId: 1214) ===');
      const loadRes = await send('Runtime.evaluate', {
        returnByValue: true,
        awaitPromise: true,
        expression: `(async () => {
          const el = document.querySelector('react-component') || document.querySelector('.hims-theme-billing') || document.body;
          const allEls = [el, ...document.querySelectorAll('*')];
          let sc = null;
          for (const e of allEls) {
            const candidate = window.angular ? window.angular.element(e).scope() : null;
            if (candidate && typeof candidate.handleReactAction === 'function') {
              sc = candidate;
              break;
            }
          }
          if (!sc) return { error: 'scope not found' };

          sc.handleReactAction('findBillSelect', {
            BillId: 1214,
            PatientId: 1042,
            BillTypeId: 5
          });

          // Wait 3 seconds for bill and receipt network calls
          await new Promise(r => setTimeout(r, 3000));

          return {
            bill: sc.item?.BillNumber,
            patient: sc.item?.PatientName,
            paid: sc.item?.PaidAmount,
            due: sc.item?.OutStandingAmount,
            paymentInfoLength: sc.PaymentInfoDetails?.length,
            paymentInfo: sc.PaymentInfoDetails,
            reactPropsPaymentInfoLength: sc.reactProps?.paymentInfoDetails?.length,
          };
        })()`
      });
      console.log('Angular Scope after loading bill:', JSON.stringify(loadRes.result?.value, null, 2));

      await new Promise(r => setTimeout(r, 1000));

      console.log('=== Step 4: Checking React DOM ===');
      const domRes = await send('Runtime.evaluate', {
        returnByValue: true,
        expression: `(() => {
          const matches = [];
          for (const el of document.querySelectorAll('*')) {
            if (el.innerText && el.innerText.includes('REC24-25/415')) {
              matches.push({
                tag: el.tagName,
                className: el.className,
                innerText: el.innerText,
                outerHTML: el.outerHTML.slice(0, 400)
              });
            }
          }
          const hasReceiptsHeading = document.body.innerText.includes('Payment Receipts');
          const hasReceiptNumber = document.body.innerText.includes('REC24-25/415');
          const buttons = Array.from(document.querySelectorAll('button')).map(b => b.innerText.trim()).filter(Boolean);
          const hasFullyPaid = document.body.innerText.includes('Fully Paid');
          const hasCollectDue = buttons.some(b => b.includes('Collect Due'));

          return {
            matchesCount: matches.length,
            matches: matches.slice(0, 5),
            hasReceiptsHeading,
            hasReceiptNumber,
            buttons,
            hasFullyPaid,
            hasCollectDue
          };
        })()`
      });
      console.log('DOM State:', JSON.stringify(domRes.result?.value, null, 2));

      console.log('=== Step 5: Capturing Screenshot ===');
      await send('Runtime.evaluate', { expression: 'window.scrollTo(0, document.body.scrollHeight);' });
      await new Promise(r => setTimeout(r, 500));
      const shot = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true });
      const outPath = '/Users/sharmila/.gemini/antigravity-ide/brain/10f529db-764b-4396-b01b-e4cb40958fff/direct_billing_receipts_verified.png';
      fs.writeFileSync(outPath, Buffer.from(shot.data, 'base64'));
      console.log('Screenshot saved to:', outPath);

      ws.close();
      process.exit(0);
    } catch (e) {
      console.error('Error during test:', e);
      ws.close();
      process.exit(1);
    }
  };
}

test();
