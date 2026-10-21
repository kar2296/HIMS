async function testApi() {
  const url = 'http://127.0.0.1:2012/lis/patientworkorder/GetPatientWorkorders';
  const payload = {
    Params: [
      { Key: 3, Value: null },
      { Key: 28, Value: null },
      { Key: 32, Value: null },
      { Key: 6, Value: 1 },
      { Key: 38, Value: null },
      { Key: 39, Value: null },
      { Key: 29, Value: 1 },
      { Key: 23, Value: null },
      { Key: 35, Value: null }
    ],
    PageContext: { PageSize: 10, PageNumber: 1 }
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const json = await res.json();
  console.log('Total records:', json?.PageContext?.TotalRecords);
  console.log('Returned items:', json?.Data?.length);
  if (json?.Data?.length > 0) {
    console.log('Sample item:', {
      Id: json.Data[0].Id,
      WorkOrderdid: json.Data[0].WorkOrderdid,
      WorkOrderStatusId: json.Data[0].WorkOrderStatusId,
      StatusName: json.Data[0].WorkOrderStatus?.DisplayName,
      Ordereddate: json.Data[0].Ordereddate,
      Patient: json.Data[0].Patient?.FirstName,
      MRN: json.Data[0].Patient?.MRN
    });
  }
}
testApi().catch(console.error);
