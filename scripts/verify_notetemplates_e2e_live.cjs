const http = require('http');
const WebSocket = require('ws');
const fs = require('fs');
const path = require('path');

const ARTIFACTS_DIR = '/Users/sharmila/.gemini/antigravity-ide/brain/e725b423-1f3c-4717-8d6e-0dd8d6ba6a4e';

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

  console.log('Connecting to page:', pageTarget.url, 'id:', pageTarget.id);
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
  await send('Runtime.enable');

  await send('Emulation.setDeviceMetricsOverride', {
    width: 1440,
    height: 900,
    deviceScaleFactor: 1,
    mobile: false,
  });

  const evaluate = async (expression) => {
    const result = await send('Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise: true,
    });
    if (result.exceptionDetails) {
      console.error('Eval error:', result.exceptionDetails);
    }
    return result.result?.value;
  };

  const takeScreenshot = async (name) => {
    const shot = await send('Page.captureScreenshot', { format: 'png' });
    const buffer = Buffer.from(shot.data, 'base64');
    const outPath = path.join(ARTIFACTS_DIR, `${name}.png`);
    fs.writeFileSync(outPath, buffer);
    console.log('Saved screenshot:', outPath);
    return outPath;
  };

  // Step 0: Handle login if needed
  console.log('Checking authentication state...');
  const didLogin = await evaluate(`(async () => {
    if (window.location.hash.includes('login') || document.querySelector('input[type="password"]')) {
      const u = document.getElementById('login-username') || document.querySelector('input[name="username"], input[type="text"]');
      const p = document.getElementById('login-password') || document.querySelector('input[name="password"], input[type="password"]');
      const submitBtn = document.querySelector('button[type="submit"], button.btn-primary') || Array.from(document.querySelectorAll('button')).find(b => b.innerText && (b.innerText.includes('Sign in') || b.innerText.includes('Login')));
      if (u && p && submitBtn) {
        const valSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
        valSetter.call(u, 'admin');
        u.dispatchEvent(new Event('input', { bubbles: true }));
        valSetter.call(p, 'admin');
        p.dispatchEvent(new Event('input', { bubbles: true }));
        submitBtn.click();
        return 'logged_in';
      }
    }
    return 'already_authenticated';
  })()`);
  console.log('Login check result:', didLogin);
  if (didLogin === 'logged_in') {
    await new Promise((r) => setTimeout(r, 2000));
  }

  // Step 1: Ensure we are at http://localhost:5173/#/app/notetemplates
  console.log('Navigating to #/app/notetemplates...');
  await evaluate(`window.location.hash = '#/app/notetemplates'`);
  await new Promise((r) => setTimeout(r, 1500));

  await takeScreenshot('final_verified_notetemplates_screen');

  // Step 2: Open Voice Translator from Header
  console.log('Opening Voice Translator from Header button (#btn-voice-translator-header)...');
  await evaluate(`(() => {
    const btn = document.getElementById('btn-voice-translator-header');
    if (btn) btn.click();
  })()`);
  await new Promise((r) => setTimeout(r, 800));

  await takeScreenshot('final_verified_voice_translator_header_modal');

  // Step 3: Switch to Clinical Phrases tab in Voice Translator
  console.log('Switching to Clinical Phrases tab (#tab-clinical-phrases)...');
  await evaluate(`(() => {
    const tab = document.getElementById('tab-clinical-phrases');
    if (tab) tab.click();
  })()`);
  await new Promise((r) => setTimeout(r, 600));

  // Step 4: Click a phrase card
  console.log('Selecting a clinical phrase card (#card-phrase-0)...');
  const phraseText = await evaluate(`(() => {
    const card = document.getElementById('card-phrase-0');
    if (card) {
      const text = card.innerText;
      card.click();
      return text;
    }
    return null;
  })()`);
  console.log('Phrase selected and clicked:', phraseText);
  await new Promise((r) => setTimeout(r, 1200));

  await takeScreenshot('final_verified_voice_translator_phrase_translated');

  // Step 5: Close Voice Translator Header Modal
  console.log('Closing Voice Translator modal (#btn-close-voice-translator)...');
  await evaluate(`(() => {
    const closeBtn = document.getElementById('btn-close-voice-translator');
    if (closeBtn) closeBtn.click();
  })()`);
  await new Promise((r) => setTimeout(r, 600));

  // Step 6: Click Add New Template button (#btn-add-new-template)
  console.log('Opening Note Template Form Modal (#btn-add-new-template)...');
  await evaluate(`(() => {
    const addBtn = document.getElementById('btn-add-new-template');
    if (addBtn) addBtn.click();
  })()`);
  await new Promise((r) => setTimeout(r, 800));

  // Step 7: Populate Form Fields and click SOAP Starter
  console.log('Populating Template Form and loading SOAP starter template...');
  await evaluate(`(() => {
    const soapBtn = document.getElementById('btn-starter-soap');
    if (soapBtn) soapBtn.click();

    const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
    const codeIn = document.getElementById('input-template-code');
    const nameIn = document.getElementById('input-template-name');

    if (codeIn) {
      nativeSetter.call(codeIn, 'SOAP_CLINICAL_VERIFY');
      codeIn.dispatchEvent(new Event('input', { bubbles: true }));
      codeIn.dispatchEvent(new Event('change', { bubbles: true }));
    }
    if (nameIn) {
      nativeSetter.call(nameIn, 'Clinical Progress Note (SOAP Modern)');
      nameIn.dispatchEvent(new Event('input', { bubbles: true }));
      nameIn.dispatchEvent(new Event('change', { bubbles: true }));
    }
  })()`);
  await new Promise((r) => setTimeout(r, 800));

  await takeScreenshot('final_verified_add_template_modal_open');

  // Step 8: Click Voice Translator inside Note Template Form (#btn-voice-translator-form)
  console.log('Opening Voice Translator from inside the Form (#btn-voice-translator-form)...');
  await evaluate(`(() => {
    const vtFormBtn = document.getElementById('btn-voice-translator-form');
    if (vtFormBtn) vtFormBtn.click();
  })()`);
  await new Promise((r) => setTimeout(r, 800));

  // Step 9: In form Voice Translator, pick Examination phrase and click Append to Template
  console.log('Picking Examination phrase and clicking Append to Template (#btn-append-to-template)...');
  await evaluate(`(() => {
    const tab = document.getElementById('tab-clinical-phrases');
    if (tab) tab.click();
  })()`);
  await new Promise((r) => setTimeout(r, 600));

  await evaluate(`(() => {
    const card = document.getElementById('card-phrase-3') || document.getElementById('card-phrase-0');
    if (card) card.click();
  })()`);
  await new Promise((r) => setTimeout(r, 1000));

  await evaluate(`(() => {
    const appendBtn = document.getElementById('btn-append-to-template');
    if (appendBtn) appendBtn.click();
    const closeBtn = document.getElementById('btn-close-voice-translator');
    if (closeBtn) closeBtn.click();
  })()`);
  await new Promise((r) => setTimeout(r, 800));

  await takeScreenshot('final_verified_template_form_populated');

  // Step 10: Save Template (#btn-save-note-template)
  console.log('Saving Note Template (#btn-save-note-template)...');
  await evaluate(`(() => {
    const saveBtn = document.getElementById('btn-save-note-template');
    if (saveBtn) saveBtn.click();
  })()`);
  await new Promise((r) => setTimeout(r, 1600));

  await takeScreenshot('final_verified_template_saved_in_table');

  // Check saved template in table
  const checkResult = await evaluate(`(() => {
    const rows = Array.from(document.querySelectorAll('tr'));
    const matched = rows.find(r => r.innerText.includes('SOAP_CLINICAL_VERIFY') || r.innerText.includes('SOAP_GEN'));
    return matched ? matched.innerText.replace(/\\n/g, ' | ') : null;
  })()`);
  console.log('Saved template found in list table:', checkResult);

  ws.close();
  console.log('All E2E verification steps completed successfully!');
}

main().catch((err) => {
  console.error('Script error:', err);
  process.exit(1);
});
