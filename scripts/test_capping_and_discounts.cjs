// scripts/test_capping_and_discounts.cjs
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
      console.log('Connected to CDP.');
      await send('Page.enable');
      await send('Runtime.enable');

      // Test discount and payment capping via Angular scope & component state
      console.log('\n--- Testing Discount & Payment Capping Logic ---');
      const testRes = await send('Runtime.evaluate', {
        expression: `(async () => {
          const el = document.querySelector('.hims-theme-billing');
          const scope = angular.element(el).scope();
          if (!scope) return { error: 'no scope found' };

          // 1. Simulate 1 service item with Rate 1000
          scope.PatientBillDetails = [{
            Id: 0,
            ServiceId: 101,
            ServiceName: 'CONSULTATION TEST',
            Quantity: 1,
            Rate: 1000,
            Amount: 1000,
            DiscountAmount: 0,
            DiscountModeId: 2, // %
            GSTAmount: 0,
            NetAmount: 1000,
            Status: 1
          }];

          // 2. Set 50% discount on header
          scope.currentfilter.DiscountModeId = 2; // %
          scope.currentcontext.BillDiscount = 50;
          scope.CalculateNetAmt();

          const netPayable = scope.currentcontext.TotNetAmount;

          // 3. Attempt to overpay: enter receipt amount 800 (should be clamped to netPayable 500)
          scope.handleReactAction('receiptAmtChange', { value: 800 });
          const receiptAfterOverpay = scope.currentcontext.ReceiptAmt;

          // 4. Split payments: Mode 1 = 200, Mode 2 = 100
          scope.handleReactAction('syncPaymentLines', {
            payments: [
              { Id: 1, PaymentTypeId: 1, AmountPaid: 200 },
              { Id: 2, PaymentTypeId: 11, AmountPaid: 100 }
            ]
          });
          const receiptAfterSplits = scope.currentcontext.ReceiptAmt;
          const dueBalanceAfterSplits = scope.currentcontext.TotBalanceAmt;

          return {
            netPayable,
            receiptAfterOverpay,
            receiptAfterSplits,
            dueBalanceAfterSplits,
            isCapped: receiptAfterOverpay <= netPayable,
            splitsMatchSum: receiptAfterSplits === 300,
            dueMatchesRemaining: dueBalanceAfterSplits === (netPayable - 300)
          };
        })()`,
        awaitPromise: true,
        returnByValue: true
      });

      console.log('Test Results:', testRes.result?.value);
      const val = testRes.result?.value;
      if (val && val.isCapped && val.splitsMatchSum && val.dueMatchesRemaining) {
        console.log(`PASS: Net Payable = ₹${val.netPayable}, Overpay capped = ₹${val.receiptAfterOverpay}, Multi-splits sum = ₹${val.receiptAfterSplits}, Outstanding balance preserved = ₹${val.dueBalanceAfterSplits}`);
      } else {
        console.error('FAIL: Payment capping check failed!', val);
      }

      process.exit(0);
    } catch (err) {
      console.error('Test error:', err);
      process.exit(1);
    }
  });
}

run().catch(console.error);
