const http = require('http');

async function main() {
  const postData = JSON.stringify({
    Params: [
      { Key: 4, Value: 2016 },
      { Key: 5, Value: 5672 }
    ],
    PageContext: {
      PageSize: 500,
      PageNumber: 1
    }
  });

  const req = http.request({
    hostname: 'localhost',
    port: 5173,
    path: '/api/lis/ordertat/GetOrderTATs',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  }, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      try {
        const json = JSON.parse(data);
        console.log('Total results:', json.Data ? json.Data.length : json);
        if (json.Data && json.Data.length > 0) {
          console.log('Item 0 TestName:', json.Data[0].TestName);
          console.log('Item 0 Patient:', json.Data[0].Patient?.FirstName);
          console.log('Item 1 TestName:', json.Data[1]?.TestName);
        }
      } catch (e) {
        console.log('Raw output:', data.slice(0, 300));
      }
    });
  });

  req.on('error', console.error);
  req.write(postData);
  req.end();
}

main();
