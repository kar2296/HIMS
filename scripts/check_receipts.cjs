const WebSocket = globalThis.WebSocket;

async function check() {
  const tabsRes = await fetch('http://127.0.0.1:9222/json');
  const tabs = await tabsRes.json();
  const pageTab = tabs.find(t => t.url && t.url.includes('5174'));
  const ws = new WebSocket(pageTab.webSocketDebuggerUrl);

  ws.onopen = () => {
    ws.send(JSON.stringify({
      id: 1,
      method: 'Runtime.evaluate',
      params: {
        returnByValue: true,
        awaitPromise: true,
        expression: `(async () => {
          try {
            let foundSc = null;
            const all = document.querySelectorAll('*');
            for (let i = 0; i < all.length; i++) {
              const sc = window.angular ? window.angular.element(all[i]).scope() : null;
              if (sc && typeof sc.handleReactAction === 'function') {
                foundSc = sc;
                break;
              }
            }
            if (!foundSc) {
              return { error: 'could not find any scope with handleReactAction' };
            }

            // Call handleReactAction
            foundSc.handleReactAction('findBillSelect', {
              BillId: 1214,
              PatientId: 1042,
              BillTypeId: 5
            });

            // Wait 2 seconds for all API calls to resolve
            await new Promise(r => setTimeout(r, 2000));

            return {
              billNumber: foundSc.item?.BillNumber,
              currentContextId: foundSc.currentcontext?.id,
              PaymentInfoDetails: foundSc.PaymentInfoDetails,
              reactPropsPaymentInfo: foundSc.reactProps?.paymentInfoDetails,
              hasReceiptsInDom: Boolean(Array.from(document.querySelectorAll('div')).find(d => d.innerText?.includes('Payment Receipts & Refund History')))
            };
          } catch (err) {
            return { error: err.message, stack: err.stack };
          }
        })()`
      }
    }));
  };

  ws.onmessage = (e) => {
    const data = JSON.parse(e.data);
    if (data.id === 1) {
      console.log('RESULT AFTER LOADING BILL 1214:', JSON.stringify(data.result?.result?.value, null, 2));
      process.exit(0);
    }
  };
}

check();
