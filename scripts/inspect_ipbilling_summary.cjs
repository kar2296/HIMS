const http = require('http');
const WebSocket = require('ws');
const fs = require('fs');

async function inspectSummary() {
  const targets = await new Promise((resolve, reject) => {
    http.get('http://localhost:9222/json', res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });

  const pageTarget = targets.find(t => t.url.includes('localhost:5174'));
  if (!pageTarget) {
    console.error('No localhost:5174 page target found');
    process.exit(1);
  }

  console.log('Connecting to target:', pageTarget.url);
  const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);
  await new Promise(resolve => ws.on('open', resolve));

  let id = 1;
  const send = (method, params = {}) => new Promise((resolve, reject) => {
    const msgId = id++;
    const handler = (data) => {
      const msg = JSON.parse(data);
      if (msg.id === msgId) {
        ws.off('message', handler);
        if (msg.error) reject(msg.error);
        else resolve(msg.result);
      }
    };
    ws.on('message', handler);
    ws.send(JSON.stringify({ id: msgId, method, params }));
  });

  // Navigate to summary
  await send('Page.navigate', { url: 'http://localhost:5174/#/app/ipbillingtab/3783/summary' });
  await new Promise(r => setTimeout(r, 2000));

  // Evaluate scrollable containers and elements
  const evalRes = await send('Runtime.evaluate', {
    returnByValue: true,
    expression: `
      (() => {
        const allElements = Array.from(document.querySelectorAll('*'));
        const scrollables = allElements.filter(el => {
          return el.scrollHeight > el.clientHeight && el.clientHeight > 100;
        }).map(el => ({
          tag: el.tagName,
          className: el.className,
          id: el.id,
          clientHeight: el.clientHeight,
          scrollHeight: el.scrollHeight,
          scrollTop: el.scrollTop
        }));

        // Also check if react component exists
        const summaryComponent = document.querySelector('react-component[name="IpBillingSummaryScreen"]');
        const tabComponent = document.querySelector('react-component[name="IpBillingTabScreen"]');

        return {
          url: window.location.href,
          hasSummary: !!summaryComponent,
          hasTab: !!tabComponent,
          summaryRect: summaryComponent ? summaryComponent.getBoundingClientRect() : null,
          scrollables: scrollables
        };
      })()
    `
  });

  console.log('Evaluation result:', JSON.stringify(evalRes.result.value, null, 2));

  // Let's scroll the main scrollable container to bottom
  await send('Runtime.evaluate', {
    expression: `
      (() => {
        const allElements = Array.from(document.querySelectorAll('*'));
        allElements.forEach(el => {
          if (el.scrollHeight > el.clientHeight && el.clientHeight > 100) {
            el.scrollTop = el.scrollHeight;
          }
        });
        window.scrollTo(0, document.body.scrollHeight);
      })()
    `
  });

  await new Promise(r => setTimeout(r, 1000));

  const screenshot = await send('Page.captureScreenshot', { format: 'png' });
  const outPath = '/Users/sharmila/.gemini/antigravity-ide/brain/d65c7b61-8a17-4b46-8d51-47f1e19bfa2e/ipbilling_bottom_section.png';
  fs.writeFileSync(outPath, Buffer.from(screenshot.data, 'base64'));
  console.log('Bottom section screenshot saved to', outPath);

  // Let's also scroll to middle to see KPI cards and settlement
  await send('Runtime.evaluate', {
    expression: `
      (() => {
        const allElements = Array.from(document.querySelectorAll('*'));
        allElements.forEach(el => {
          if (el.scrollHeight > el.clientHeight && el.clientHeight > 100) {
            el.scrollTop = Math.floor(el.scrollHeight / 2);
          }
        });
      })()
    `
  });
  await new Promise(r => setTimeout(r, 1000));
  const screenshotMid = await send('Page.captureScreenshot', { format: 'png' });
  const outPathMid = '/Users/sharmila/.gemini/antigravity-ide/brain/d65c7b61-8a17-4b46-8d51-47f1e19bfa2e/ipbilling_middle_section.png';
  fs.writeFileSync(outPathMid, Buffer.from(screenshotMid.data, 'base64'));
  console.log('Middle section screenshot saved to', outPathMid);

  ws.close();
}

inspectSummary().catch(console.error);
