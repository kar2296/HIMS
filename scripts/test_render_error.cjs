const WebSocket = globalThis.WebSocket;

async function test() {
  const tabsRes = await fetch('http://127.0.0.1:9222/json');
  const tabs = await tabsRes.json();
  const pageTab = tabs.find(t => t.url && t.url.includes('5174'));
  const ws = new WebSocket(pageTab.webSocketDebuggerUrl);

  let id = 1;
  const send = (method, params = {}) => new Promise((resolve) => {
    const curId = id++;
    const handler = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.id === curId) {
        ws.removeEventListener('message', handler);
        resolve(msg.result);
      }
    };
    ws.addEventListener('message', handler);
    ws.send(JSON.stringify({ id: curId, method, params }));
  });

  await new Promise(r => ws.onopen = r);

  const evalRes = await send('Runtime.evaluate', {
    returnByValue: true,
    awaitPromise: true,
    expression: `(async () => {
      try {
        const compEl = document.querySelector('react-component[name="IpBillingReceiptsScreen"]');
        if (!compEl) return { error: 'no compEl' };

        // Test calling React.createElement directly
        const Component = window.ReactComponents.IpBillingReceiptsScreen;
        const testContainer = document.createElement('div');
        document.body.appendChild(testContainer);
        
        // Let us see if React has an issue rendering
        const scope = window.angular.element(compEl).scope();
        const testProps = scope ? scope.props : {};
        
        // Find React createRoot from react-dom
        const { createRoot } = await import('/node_modules/.vite/deps/react-dom_client.js');
        const React = await import('/node_modules/.vite/deps/react.js');
        const { HashRouter } = await import('/node_modules/.vite/deps/react-router-dom.js');

        const root = createRoot(testContainer);
        let renderError = null;
        try {
          root.render(
            React.createElement(
              HashRouter,
              null,
              React.createElement(Component, testProps)
            )
          );
        } catch (err) {
          renderError = { message: err.message, stack: err.stack };
        }

        await new Promise(r => setTimeout(r, 500));

        const renderedHTML = testContainer.innerHTML;
        document.body.removeChild(testContainer);

        return {
          renderError,
          testProps,
          renderedHTMLLength: renderedHTML.length,
          renderedHTMLSnippet: renderedHTML.slice(0, 300)
        };
      } catch (e) {
        return { error: e.message, stack: e.stack };
      }
    })()`
  });

  console.log('Result:', JSON.stringify(evalRes.result?.value, null, 2));
  process.exit(0);
}

test();
