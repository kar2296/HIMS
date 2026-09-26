// scripts/scratch_test_category.cjs
async function test() {
  const res = await fetch("http://localhost:9222/json");
  const pages = await res.json();
  const page = pages.find(p => p.url && p.url.includes("5173")) || pages.find(p => p.type === "page");
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise(r => ws.onopen = r);
  let id = 1;
  function send(method, params = {}) {
    return new Promise(resolve => {
      const curId = id++;
      const handler = (msg) => {
        const d = JSON.parse(msg.data);
        if (d.id === curId) {
          ws.removeEventListener("message", handler);
          resolve(d.result);
        }
      };
      ws.addEventListener("message", handler);
      ws.send(JSON.stringify({ id: curId, method, params }));
    });
  }

  async function ev(expr) {
    const r = await send("Runtime.evaluate", { expression: expr, awaitPromise: true, returnByValue: true });
    return r?.result?.value;
  }

  await send("Page.navigate", { url: "http://localhost:5173/servicecategories" });
  await new Promise(r => setTimeout(r, 2500));

  const testCode = "SC" + Date.now().toString().slice(-4);
  const testName = "TestCat_" + testCode;

  // Add
  console.log("Adding:", testCode, testName);
  await ev(`
    (async () => {
      const rows = document.querySelectorAll("table tbody tr");
      const lastRow = rows[rows.length - 1];
      const codeInput = lastRow.querySelector("input[placeholder='Code']");
      const nameInput = lastRow.querySelector("input[placeholder='Category Name']");

      function setVal(input, val) {
        const set = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
        if (input._valueTracker) input._valueTracker.setValue("" + Math.random());
        set.call(input, val);
        input.dispatchEvent(new Event("input", { bubbles: true }));
        input.dispatchEvent(new Event("change", { bubbles: true }));
      }

      setVal(codeInput, "${testCode}");
      setVal(nameInput, "${testName}");
      await new Promise(r => setTimeout(r, 600));
      document.getElementById("btnSaveServiceCategoriesTop").click();
    })()
  `);

  await new Promise(r => setTimeout(r, 3000));

  // Reload and Search
  await send("Page.reload");
  await new Promise(r => setTimeout(r, 2500));

  await ev(`
    (() => {
      const inp = document.getElementById("inputSearchCategory");
      const set = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
      if (inp._valueTracker) inp._valueTracker.setValue("" + Math.random());
      set.call(inp, "${testCode}");
      inp.dispatchEvent(new Event("input", { bubbles: true }));
      inp.dispatchEvent(new Event("change", { bubbles: true }));
      document.getElementById("btnFilterSearch").click();
    })()
  `);

  await new Promise(r => setTimeout(r, 2000));
  const found = await ev('document.body.innerText.includes("' + testCode + '")');
  console.log("Found in table:", found);

  // Edit
  const editedName = testName + "_EDITED";
  await ev(`
    (async () => {
      const rows = document.querySelectorAll("table tbody tr");
      for (const row of rows) {
        const codeInput = row.querySelector("input[placeholder='Code']");
        if (codeInput && codeInput.value === "${testCode}") {
          const nameInput = row.querySelector("input[placeholder='Category Name']");
          const set = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
          if (nameInput._valueTracker) nameInput._valueTracker.setValue("" + Math.random());
          set.call(nameInput, "${editedName}");
          nameInput.dispatchEvent(new Event("input", { bubbles: true }));
          nameInput.dispatchEvent(new Event("change", { bubbles: true }));
          break;
        }
      }
      await new Promise(r => setTimeout(r, 600));
      document.getElementById("btnSaveServiceCategoriesTop").click();
    })()
  `);

  await new Promise(r => setTimeout(r, 3000));

  // Verify Edit
  await send("Page.reload");
  await new Promise(r => setTimeout(r, 2500));
  await ev(`
    (() => {
      const inp = document.getElementById("inputSearchCategory");
      const set = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
      if (inp._valueTracker) inp._valueTracker.setValue("" + Math.random());
      set.call(inp, "${testCode}");
      inp.dispatchEvent(new Event("input", { bubbles: true }));
      inp.dispatchEvent(new Event("change", { bubbles: true }));
      document.getElementById("btnFilterSearch").click();
    })()
  `);
  await new Promise(r => setTimeout(r, 2000));
  const foundEdited = await ev('document.body.innerText.includes("' + editedName + '")');
  console.log("Found edited in table:", foundEdited);

  // Delete
  await ev(`
    (() => {
      const rows = document.querySelectorAll("table tbody tr");
      for (const row of rows) {
        const codeInput = row.querySelector("input[placeholder='Code']");
        if (codeInput && codeInput.value === "${testCode}") {
          const delBtn = row.querySelector("button[title='Delete Category']");
          if (delBtn) delBtn.click();
          break;
        }
      }
    })()
  `);
  await new Promise(r => setTimeout(r, 800));
  await ev('document.getElementById("btnConfirmModalYes").click()');
  await new Promise(r => setTimeout(r, 2500));

  // Verify deleted
  await send("Page.reload");
  await new Promise(r => setTimeout(r, 2500));
  await ev(`
    (() => {
      const inp = document.getElementById("inputSearchCategory");
      const set = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
      if (inp._valueTracker) inp._valueTracker.setValue("" + Math.random());
      set.call(inp, "${testCode}");
      inp.dispatchEvent(new Event("input", { bubbles: true }));
      inp.dispatchEvent(new Event("change", { bubbles: true }));
      document.getElementById("btnFilterSearch").click();
    })()
  `);
  await new Promise(r => setTimeout(r, 2000));
  const stillFound = await ev('document.body.innerText.includes("' + testCode + '")');
  console.log("Deleted cleanly (zero residue):", !stillFound);

  ws.close();
}
test().catch(console.error);
