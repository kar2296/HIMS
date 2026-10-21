const WebSocket = globalThis.WebSocket;

async function run() {
  const tabsRes = await fetch('http://127.0.0.1:9222/json');
  const tabs = await tabsRes.json();
  const pageTab = tabs.find(t => t.type === 'page' && t.url && t.url.includes('5174'));
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

  const logs = [];
  ws.addEventListener('message', (event) => {
    const parsed = JSON.parse(event.data);
    if (parsed.method === 'Runtime.consoleAPICalled') {
      logs.push({ type: parsed.params.type, text: parsed.params.args.map(a => a.value || a.description).join(' ') });
    }
    if (parsed.method === 'Runtime.exceptionThrown') {
      logs.push({ type: 'EXCEPTION', text: parsed.params.exceptionDetails.text, exception: parsed.params.exceptionDetails.exception?.description });
    }
  });

  ws.addEventListener('open', async () => {
    await send('Runtime.enable');
    await send('Page.enable');

    const res = await send('Runtime.evaluate', {
      expression: `(async function() {
        const events = [];
        // Test interactive typing in patient search
        const patInput = document.querySelector('input[placeholder*=\"Type MRN / Patient Name\"]');
        if (!patInput) return { error: 'No patient input' };

        // Test clearing / starting fresh
        patInput.focus();
        patInput.value = 'aarushi';
        patInput.dispatchEvent(new Event('input', { bubbles: true }));
        await new Promise(r => setTimeout(r, 600));

        // Check if dropdown appears
        const dropdown = document.querySelector('.patient-search-dropdown') || document.querySelector('div[style*=\"z-index: 99999\"]');
        events.push({ dropdownPresent: !!dropdown, dropdownHtml: dropdown ? dropdown.innerHTML.slice(0, 300) : null });

        // Test service input typing
        const srvInput = document.querySelector('input[placeholder*=\"Type service name\"]');
        if (srvInput) {
          srvInput.focus();
          srvInput.value = 'consult';
          srvInput.dispatchEvent(new Event('input', { bubbles: true }));
          await new Promise(r => setTimeout(r, 600));

          const srvDropdown = document.querySelector('.service-search-container');
          events.push({ srvDropdownPresent: !!srvDropdown, srvDropdownHtml: srvDropdown ? srvDropdown.innerHTML.slice(0, 300) : null });
        }

        return {
          events,
          patInputVal: patInput.value,
          srvInputVal: srvInput?.value
        };
      })()`,
      awaitPromise: true,
      returnByValue: true
    });

    console.log('Interactive test:', JSON.stringify(res, null, 2));
    console.log('Logs captured:', logs.slice(-20));
    ws.close();
  });
}
run();
