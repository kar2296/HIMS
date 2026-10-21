const fs = require('fs');

async function main() {
  const res = await fetch('http://localhost:9222/json');
  const pages = await res.json();
  const page = pages.find(p => p.type === 'page' && !p.url.includes('omnibox'));
  if (!page) {
    console.log('No page target found');
    process.exit(1);
  }

  console.log('Connecting to:', page.webSocketDebuggerUrl);
  const ws = new global.WebSocket(page.webSocketDebuggerUrl);
  let id = 1;
  const callbacks = new Map();

  ws.onmessage = (e) => {
    try {
      const data = JSON.parse(e.data);
      if (data.id && callbacks.has(data.id)) {
        callbacks.get(data.id)(data);
        callbacks.delete(data.id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  function send(method, params = {}) {
    return new Promise((resolve) => {
      const msgId = id++;
      callbacks.set(msgId, resolve);
      ws.send(JSON.stringify({ id: msgId, method, params }));
    });
  }

  ws.onopen = async () => {
    console.log('Connected to page.');

    await send('Page.enable');

    console.log('Executing login and hash change...');
    const loginRes = await send('Runtime.evaluate', {
      awaitPromise: true,
      returnByValue: true,
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
        window.location.hash = '#/app/resultentry/8952';
        return { ok: true, hash: window.location.hash };
      })()`
    });

    console.log('Login and hash set result:', loginRes.result?.result?.value);

    // Wait 5 seconds for Angular to route and load workorder 8952
    console.log('Waiting 5s for Angular to load data...');
    await new Promise(r => setTimeout(r, 5000));

    console.log('Checking Result Entry DOM & scope...');
    const domCheck = await send('Runtime.evaluate', {
      returnByValue: true,
      expression: `(() => {
        const comp = document.querySelector('react-component[name="ResultEntryFormScreen"]');
        const sc = comp ? angular.element(comp).scope() : null;
        const container = document.querySelector('.result-entry-container');
        const rows = Array.from(document.querySelectorAll('tbody tr'));
        const buttons = Array.from(document.querySelectorAll('button')).map(b => b.innerText.trim()).filter(Boolean);
        const headers = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, .badge, .status-pill')).map(b => b.innerText.trim()).filter(Boolean);

        return {
          url: window.location.href,
          hasComp: !!comp,
          hasScope: !!sc,
          hasReactContainer: !!container,
          patientName: sc?.reactProps?.patient?.name,
          mrn: sc?.reactProps?.patient?.mrn,
          workOrderDid: sc?.reactProps?.header?.workOrderDid,
          itemCount: sc?.reactProps?.items?.length || 0,
          rowCount: rows.length,
          buttons: buttons.slice(0, 15),
          headers: headers.slice(0, 15)
        };
      })()`
    });

    console.log('DOM check result:', JSON.stringify(domCheck.result?.result?.value, null, 2));

    // Capture screenshot
    console.log('Capturing screenshot...');
    const shot = await send('Page.captureScreenshot', { format: 'png' });
    const outPath = '/Users/sharmila/.gemini/antigravity-ide/brain/90c7d2c6-82e5-4f56-9a05-7c199aab54fe/result_entry_live.png';
    fs.writeFileSync(outPath, Buffer.from(shot.result.data, 'base64'));
    console.log('Screenshot saved to:', outPath);

    process.exit(0);
  };
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
