const http = require('http');
const WebSocket = require('ws');
const fs = require('fs');
const path = require('path');

async function main() {
  const targets = await new Promise((resolve, reject) => {
    http.get('http://localhost:9222/json', (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });

  const pageTarget = targets.find(
    (t) => t.url && t.url.includes('localhost:5173') && t.type === 'page'
  );
  if (!pageTarget) {
    console.error('No page target found on localhost:5173');
    process.exit(1);
  }

  const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);
  await new Promise((r) => ws.on('open', r));

  let id = 1;
  const send = (method, params = {}) =>
    new Promise((resolve, reject) => {
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

  await send('Page.enable');
  await send('DOM.enable');

  await send('Emulation.setDeviceMetricsOverride', {
    width: 1440,
    height: 900,
    deviceScaleFactor: 1,
    mobile: false,
  });

  const takeScreenshot = async (name) => {
    const shot = await send('Page.captureScreenshot', { format: 'png' });
    const buffer = Buffer.from(shot.data, 'base64');
    const outPath = path.join(__dirname, '..', `screen_${name}.png`);
    fs.writeFileSync(outPath, buffer);
    console.log('Saved screenshot to:', outPath);
  };

  // Ensure fresh page state
  console.log('Navigating to organism isolations list...');
  await send('Page.navigate', { url: 'http://localhost:5173/#/app/organismisolations:/' });
  await new Promise((r) => setTimeout(r, 3000));

  console.log('Clicking edit on first organism item...');
  const editResult = await send('Runtime.evaluate', {
    expression: `(() => {
      const editBtns = document.querySelectorAll('button[title="Edit Organism"]');
      if (editBtns && editBtns.length > 0) {
        editBtns[0].click();
        return 'clicked edit on organism';
      }
      return 'edit button not found';
    })()`,
    returnByValue: true
  });
  console.log('Edit result:', editResult.result.value);
  await new Promise((r) => setTimeout(r, 2500));
  await takeScreenshot('organism_form_tab');

  // Test 2: Switch to Antibiotic Mapping tab in the tab bar
  console.log('Clicking Antibiotic Mapping tab...');
  const tabResult = await send('Runtime.evaluate', {
    expression: `(() => {
      const tabBtns = Array.from(document.querySelectorAll('button'));
      const antiTab = tabBtns.find(b => b.innerText && b.innerText.includes('Antibiotic Mapping'));
      if (antiTab) {
        antiTab.click();
        return 'clicked Antibiotic Mapping tab';
      }
      return 'tab not found';
    })()`,
    returnByValue: true
  });
  console.log('Tab switch result:', tabResult.result.value);
  await new Promise((r) => setTimeout(r, 2500));
  await takeScreenshot('antibiotic_mapping_tab');

  // Test 3: Note Templates -> Click Add New / Edit to verify modal / action
  console.log('Navigating to Note Templates...');
  await send('Runtime.evaluate', { expression: `window.location.hash = '#/app/notetemplates';` });
  await new Promise((r) => setTimeout(r, 2500));

  const noteAction = await send('Runtime.evaluate', {
    expression: `(() => {
      const addBtn = document.querySelector('button');
      const allBtns = Array.from(document.querySelectorAll('button'));
      const newBtn = allBtns.find(b => b.innerText && b.innerText.includes('Add New'));
      if (newBtn) {
        newBtn.click();
        return 'clicked add new note template';
      }
      return 'add new note template not found';
    })()`,
    returnByValue: true
  });
  console.log('Note action result:', noteAction.result.value);
  await new Promise((r) => setTimeout(r, 2500));
  await takeScreenshot('notetemplates_modal');

  // Close modal if open
  await send('Runtime.evaluate', {
    expression: `(() => {
      const closeBtn = document.querySelector('.modal .close, button[data-dismiss="modal"]');
      if (closeBtn) closeBtn.click();
    })()`
  });
  await new Promise((r) => setTimeout(r, 1000));

  // Test 4: Antibiotic Masters -> Click Add New / Edit
  console.log('Navigating to Antibiotic Masters...');
  await send('Runtime.evaluate', { expression: `window.location.hash = '#/app/antibioticmasters';` });
  await new Promise((r) => setTimeout(r, 2500));

  const antiAction = await send('Runtime.evaluate', {
    expression: `(() => {
      const allBtns = Array.from(document.querySelectorAll('button'));
      const newBtn = allBtns.find(b => b.innerText && b.innerText.includes('Add New'));
      if (newBtn) {
        newBtn.click();
        return 'clicked add new antibiotic';
      }
      return 'add new antibiotic not found';
    })()`,
    returnByValue: true
  });
  console.log('Antibiotic action result:', antiAction.result.value);
  await new Promise((r) => setTimeout(r, 2500));
  await takeScreenshot('antibioticmasters_modal');

  ws.close();
  console.log('All tests completed successfully!');
}

main().catch(console.error);
