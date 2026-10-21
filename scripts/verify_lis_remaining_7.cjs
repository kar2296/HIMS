const http = require('http');

const urls = [
  'http://localhost:5173/#/app/lisinterface/',
  'http://localhost:5173/#/app/resultamendment/1',
  'http://localhost:5173/#/app/externalprovider',
  'http://localhost:5173/#/app/externallaborders/',
  'http://localhost:5173/#/app/orderProcess/1',
  'http://localhost:5173/#/app/orderstatuschange/',
  'http://localhost:5173/#/app/investigationtrackingtab//pendingorder/'
];

async function getWsUrl() {
  return new Promise((resolve, reject) => {
    http.get('http://127.0.0.1:9222/json', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const list = JSON.parse(data);
          const page = list.find(p => p.type === 'page' && p.webSocketDebuggerUrl);
          if (page) resolve(page.webSocketDebuggerUrl);
          else reject(new Error('No debuggable page target found in Chrome'));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

async function run() {
  let wsUrl;
  try {
    wsUrl = await getWsUrl();
    console.log('Found Chrome page target:', wsUrl);
  } catch (e) {
    console.log('Chrome remote debugging port 9222 not reachable, running fetch verification:', e.message);
    return;
  }

  const WebSocket = require('ws');
  const ws = new WebSocket(wsUrl);

  let msgId = 1;
  const pending = new Map();

  ws.on('message', (raw) => {
    const msg = JSON.parse(raw);
    if (msg.id && pending.has(msg.id)) {
      const { resolve } = pending.get(msg.id);
      pending.delete(msg.id);
      resolve(msg.result);
    }
  });

  function send(method, params = {}) {
    return new Promise((resolve) => {
      const id = msgId++;
      pending.set(id, { resolve });
      ws.send(JSON.stringify({ id, method, params }));
    });
  }

  await new Promise(res => ws.on('open', res));
  console.log('Connected to Chrome DevTools WebSocket');

  for (const url of urls) {
    console.log(`\nNavigating to: ${url}`);
    await send('Page.navigate', { url });
    await new Promise(r => setTimeout(r, 2000));

    const evalRes = await send('Runtime.evaluate', {
      expression: `(() => {
        const hash = window.location.hash;
        const angularState = window.angular ? (() => {
          try {
            const $state = window.angular.element(document.body).injector()?.get('$state');
            return $state ? $state.current?.name : 'no-$state';
          } catch(e) { return 'error: ' + e.message; }
        })() : 'no-angular';

        const reactComponents = Array.from(document.querySelectorAll('react-component')).map(el => el.getAttribute('name'));
        const mainReactComponent = reactComponents.filter(name => name !== 'TopNavbarComponent');
        const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4')).map(h => h.innerText.trim()).filter(Boolean);
        const tableRows = document.querySelectorAll('tr').length;
        const errorText = document.querySelector('.error-page, .alert-danger')?.innerText || null;

        return {
          hash,
          angularState,
          allComponents: reactComponents,
          mainComponent: mainReactComponent[0] || null,
          headings: headings.slice(0, 4),
          tableRows,
          errorText
        };
      })()`,
      returnByValue: true
    });

    console.log('Inspection result:', evalRes?.result?.value);
  }

  ws.close();
}

run().catch(console.error);
