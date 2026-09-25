const fs = require('fs');

async function testModal() {
  const res = await fetch('http://localhost:9222/json');
  const pages = await res.json();
  const page = pages.find(p => p.url && p.url.includes('5173')) || pages.find(p => p.type === 'page');
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise(r => ws.onopen = r);
  let id = 1;
  const evalCd = (expr) => new Promise((resolve, reject) => {
    const handler = (m) => {
      const d = JSON.parse(m.data);
      if (d.id === id) {
        ws.removeEventListener('message', handler);
        if (d.error) reject(d.error);
        else resolve(d.result?.result?.value);
      }
    };
    ws.addEventListener('message', handler);
    ws.send(JSON.stringify({ id: id++, method: 'Runtime.evaluate', params: { expression: expr, returnByValue: true, awaitPromise: true } }));
  });

  console.log('Navigating to /masters/countries...');
  await evalCd('window.location.href = "http://localhost:5173/masters/countries"');
  await new Promise(r => setTimeout(r, 2000));

  console.log('Clicking Add New...');
  await evalCd('document.getElementById("btnAddNewCountry")?.click()');
  await new Promise(r => setTimeout(r, 500));

  console.log('Filling fields and clicking Save...');
  const res1 = await evalCd(`
    (() => {
      const setVal = (el, val) => {
        if (!el) return 'NO_EL';
        const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
        setter.call(el, val);
        el.dispatchEvent(new Event("input", { bubbles: true }));
        el.dispatchEvent(new Event("change", { bubbles: true }));
        return 'SET:' + el.value;
      };
      const r1 = setVal(document.getElementById("txtModalCountryCode"), "TC");
      const r2 = setVal(document.getElementById("txtModalCountryName"), "Testland Batch1 Controlled");
      document.getElementById("btnSaveCountryModal")?.click();
      return { r1, r2 };
    })()
  `);
  console.log('Fill result:', res1);

  await new Promise(r => setTimeout(r, 2000));
  const err = await evalCd('document.getElementById("countryModalError")?.innerText');
  console.log('Modal error text after save:', err);
  const isOpen = await evalCd('!!document.getElementById("countryModalDialog")');
  console.log('Is modal still open?', isOpen);
  const consoleLogs = await evalCd('window.__lastErrors || []');
  console.log('Window errors if any:', consoleLogs);

  ws.close();
}

testModal().catch(console.error);
