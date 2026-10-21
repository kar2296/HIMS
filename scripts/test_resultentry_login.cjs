async function main() {
  const res = await fetch('http://localhost:9222/json');
  const pages = await res.json();
  const page = pages.find(p => p.type === 'page' && !p.url.includes('omnibox'));
  if (!page) {
    console.log('No page target found');
    process.exit(1);
  }

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
    } catch (err) {}
  };

  function send(method, params = {}) {
    return new Promise((resolve) => {
      const msgId = id++;
      callbacks.set(msgId, resolve);
      ws.send(JSON.stringify({ id: msgId, method, params }));
    });
  }

  ws.onopen = async () => {
    console.log('Connected to target.');

    const loginCall = await send('Runtime.evaluate', {
      awaitPromise: true,
      returnByValue: true,
      expression: `(async () => {
        try {
          const el = document.querySelector('[ng-controller*="Login"]');
          if (el && window.angular) {
            const scope = angular.element(el).scope();
            const vm = scope?.vm;
            if (vm && vm.handleLogin) {
              console.log('Found vm.handleLogin, calling with sdh, 1234');
              vm.handleLogin('sdh', '1234');
              return { invoked: true };
            }
          }
          return { invoked: false, hasEl: !!el };
        } catch (e) {
          return { error: e.message };
        }
      })()`
    });

    console.log('Login invoke result:', loginCall.result?.result?.value);
    process.exit(0);
  };
}

main().catch(console.error);
