// scripts/capture_discount_validation_screenshot.cjs
const fs = require('fs');
const WebSocket = globalThis.WebSocket;

async function run() {
  const tabsRes = await fetch('http://127.0.0.1:9222/json');
  const tabs = await tabsRes.json();
  const pageTab = tabs.find(t => t.type === 'page' && t.url && t.url.includes('5174'));
  if (!pageTab) {
    console.error('No 5174 tab found in Chrome CDP!');
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

  ws.addEventListener('open', async () => {
    try {
      await send('Page.enable');
      await send('Runtime.enable');

      // Set discount 5000% on header to replicate user's scenario
      await send('Runtime.evaluate', {
        expression: `(() => {
          const el = document.querySelector('.hims-theme-billing');
          const scope = window.angular.element(el).scope();
          if (scope) {
            scope.handleReactAction('headerDiscountChange', { value: 5000, discountModeId: 2 });
            if (scope.$apply) scope.$apply();
          }
        })()`,
      });

      // Scroll down to show discount section & action buttons
      await send('Runtime.evaluate', {
        expression: `window.scrollTo({ top: document.body.scrollHeight, behavior: 'instant' });`
      });

      await new Promise(r => setTimeout(r, 600));

      const shot = await send('Page.captureScreenshot', { format: 'png' });
      fs.writeFileSync('/Users/sharmila/.gemini/antigravity-ide/brain/61e91600-7ef0-4eaf-99cb-ca794ca057f2/discount_validation_bottom_verified.png', Buffer.from(shot.data, 'base64'));
      console.log('Saved screenshot to discount_validation_bottom_verified.png');
      process.exit(0);
    } catch (e) {
      console.error(e);
      process.exit(1);
    }
  });
}

run();
