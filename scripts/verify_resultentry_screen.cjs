const fs = require('fs');

async function getPageWs() {
  const res = await fetch('http://localhost:9222/json');
  const pages = await res.json();
  const page = pages.find(p => p.url && p.url.includes('5173')) || pages.find(p => p.type === 'page');
  return page?.webSocketDebuggerUrl;
}

class CDPClient {
  constructor(wsUrl) {
    this.wsUrl = wsUrl;
    this.id = 1;
    this.callbacks = new Map();
  }

  async connect() {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(this.wsUrl);
      this.ws.onopen = () => resolve();
      this.ws.onerror = (e) => reject(e);
      this.ws.onmessage = (msg) => {
        try {
          const raw = typeof msg.data === 'string' ? msg.data : msg.data.toString();
          const data = JSON.parse(raw);
          if (data.id && this.callbacks.has(data.id)) {
            const { resolve, reject } = this.callbacks.get(data.id);
            this.callbacks.delete(data.id);
            if (data.error) reject(data.error);
            else resolve(data.result);
          }
        } catch (e) {
          console.error('Error handling message', e);
        }
      };
    });
  }

  async send(method, params = {}) {
    const id = this.id++;
    return new Promise((resolve, reject) => {
      this.callbacks.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  async eval(expression) {
    const res = await this.send('Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise: true
    });
    if (res.exceptionDetails) {
      throw new Error(res.exceptionDetails.exception?.description || 'Evaluation error');
    }
    return res.result?.value;
  }

  close() {
    if (this.ws) this.ws.close();
  }
}

async function main() {
  const wsUrl = await getPageWs();
  if (!wsUrl) {
    console.error('No page target found');
    process.exit(1);
  }

  console.log('Connecting to WebSocket:', wsUrl);
  const client = new CDPClient(wsUrl);
  await client.connect();
  console.log('Connected to CDP successfully.');

  await client.send('Emulation.setDeviceMetricsOverride', {
    width: 1440,
    height: 960,
    deviceScaleFactor: 1,
    mobile: false
  });

  console.log('Logging in if needed...');
  await client.eval(`(async () => {
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
        await new Promise(r => setTimeout(r, 2000));
      }
    }
  })()`);

  console.log('Navigating to Result Entry screen for Workorder 8952...');
  await client.eval(`(() => {
    window.location.hash = '#/app/resultentry/8952';
  })()`);

  // Wait 4.5 seconds for API calls to populate
  console.log('Waiting for Angular + React render & API data...');
  await new Promise(r => setTimeout(r, 4500));

  console.log('Inspecting UI components and state...');
  const info = await client.eval(`(() => {
    const el = document.querySelector('react-component[name="ResultEntryFormScreen"]');
    const scope = el ? angular.element(el).scope() : null;
    const reactContainer = document.querySelector('.result-entry-container');
    const rows = Array.from(document.querySelectorAll('tbody tr'));
    const inputs = Array.from(document.querySelectorAll('input[type="text"], input[type="number"], textarea'));

    return {
      currentUrl: window.location.href,
      hasScope: !!scope,
      hasReactContainer: !!reactContainer,
      patientName: scope?.reactProps?.patient?.name || scope?.reactProps?.patient?.fullName,
      mrn: scope?.reactProps?.patient?.mrn,
      ageGender: scope?.reactProps?.patient?.ageGender,
      doctor: scope?.reactProps?.patient?.doctor,
      caseNumber: scope?.reactProps?.header?.workOrderDid,
      billNumber: scope?.reactProps?.header?.orderNumber,
      orderStatus: scope?.reactProps?.header?.orderStatus,
      itemsCount: scope?.reactProps?.items?.length || 0,
      totalAnalytes: (scope?.reactProps?.items || []).reduce((sum, item) => sum + (item.analytes?.length || 0), 0),
      tableRowCount: rows.length,
      sampleInputPlaceholders: inputs.slice(0, 5).map(i => ({ placeholder: i.placeholder, val: i.value, disabled: i.disabled })),
      testTitles: (scope?.reactProps?.items || []).map(i => i.testName),
      renderedButtons: Array.from(document.querySelectorAll('button')).map(b => b.innerText.trim()).filter(Boolean)
    };
  })()`);

  console.log('Inspection result:', JSON.stringify(info, null, 2));

  // Capture screenshot
  const shot = await client.send('Page.captureScreenshot', { format: 'png' });
  const shotPath = '/Users/sharmila/.gemini/antigravity-ide/brain/90c7d2c6-82e5-4f56-9a05-7c199aab54fe/result_entry_screen_initial.png';
  fs.writeFileSync(shotPath, Buffer.from(shot.data, 'base64'));
  console.log('Saved screenshot to:', shotPath);

  client.close();
}

main().catch(e => {
  console.error('Fatal error:', e);
  process.exit(1);
});
