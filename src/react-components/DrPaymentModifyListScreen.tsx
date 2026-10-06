import React from 'react';

interface DoctorPaymentRow {
  Id?: number;
  slno?: number;
  PatientBill?: {
    BillNumber?: string;
    BillDateTime?: string;
    Patient?: { MRN?: string; FirstName?: string };
  };
  ServiceName?: string;
  Doctor?: { Title?: { Description?: string }; FirstName?: string; LastName?: string };
  NetAmount?: number | string;
  DoctorShare?: number | string;
  DiscountAmount?: number | string;
  Remarks?: string;
}

interface DrPaymentModifyListScreenProps {
  reactProps?: {
    gridData?: DoctorPaymentRow[];
  };
  onAction?: (actionName: string, payload?: any) => void;
}

// Reproduces the ngformatdate directive's own format ('dd-MMM-yyyy HH:mm')
// used by the original cellTemplate for BillDateTime.
function formatDateTime(d?: string): string {
  if (!d) return '';
  const date = new Date(d);
  if (isNaN(date.getTime())) return '';
  const day = String(date.getDate()).padStart(2, '0');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const time = `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  return `${day}-${months[date.getMonth()]}-${date.getFullYear()} ${time}`;
}

const thStyle: React.CSSProperties = {
  padding: '8px 12px',
  textAlign: 'left',
  fontSize: '12px',
  fontWeight: 600,
  borderBottom: '1px solid #e2e8f0',
  whiteSpace: 'nowrap',
};

const tdStyle: React.CSSProperties = {
  padding: '8px 12px',
  fontSize: '13px',
  borderBottom: '1px solid #e2e8f0',
  verticalAlign: 'top',
};

export function DrPaymentModifyListScreen({ reactProps, onAction }: DrPaymentModifyListScreenProps) {
  const gridData = reactProps?.gridData || [];

  const dispatch = (actionName: string, payload?: any) => {
    onAction?.(actionName, payload);
  };

  return (
    <>
      <div className="row">
        <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: 6 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                <th style={thStyle}>S. No.</th>
                <th style={thStyle}>Bill Nr.</th>
                <th style={thStyle}>Bill Date</th>
                <th style={thStyle}>UHID</th>
                <th style={thStyle}>Patient Name</th>
                <th style={thStyle}>Service Name</th>
                {/* Original columnDef's own translate key was already
                    HTML-commented out; the live column instead borrows
                    registration.checkedinpatients.drname.lbl (resolves to
                    the same "Doctor Name" text) -- reproduced verbatim. */}
                <th style={thStyle}>Doctor Name</th>
                <th style={thStyle}>Amount</th>
                <th style={thStyle}>Dr. Share</th>
                <th style={thStyle}>Disc.</th>
                <th style={thStyle}>Remarks</th>
                <th style={thStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {gridData.map((row, idx) => (
                <tr key={row.Id ?? idx}>
                  <td style={tdStyle}>{row.slno}</td>
                  <td style={tdStyle}>{row.PatientBill?.BillNumber}</td>
                  <td style={tdStyle}>{formatDateTime(row.PatientBill?.BillDateTime)}</td>
                  <td style={tdStyle}>{row.PatientBill?.Patient?.MRN}</td>
                  {/* Already pre-formatted (Title + First + Last) by the
                      AngularJS getListCallback before this data reaches
                      React -- reproduced as-is, not re-concatenated here. */}
                  <td style={tdStyle}>{row.PatientBill?.Patient?.FirstName}</td>
                  <td style={tdStyle}>{row.ServiceName}</td>
                  <td style={tdStyle}>
                    {row.Doctor?.Title?.Description} {row.Doctor?.FirstName} {row.Doctor?.LastName}
                  </td>
                  <td style={{ ...tdStyle, textAlign: 'right' }}>{row.NetAmount}</td>
                  <td style={{ ...tdStyle, textAlign: 'right' }}>{row.DoctorShare}</td>
                  <td style={{ ...tdStyle, textAlign: 'right' }}>{row.DiscountAmount}</td>
                  <td style={tdStyle}>{row.Remarks}</td>
                  <td style={tdStyle}>
                    <span style={{ cursor: 'pointer' }} onClick={() => dispatch('edit', { entity: row })}>
                      <img className="drhms-edit-button" src="assets/svg/edit.svg" alt="" />
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {/* The original uib-pagination footer bound to vm.gridConfig.pagerObj
          is confirmed dead: pagerObj is never assigned anywhere in the
          controller (only columnDefs/enableColumnResizing are set on
          vm.gridConfig), and customTableController itself never touches
          pagerObj either -- combined with getList() always sending
          PageContext.PageSize: -1 (fetch the full result set every time),
          this pager never had working totals/pages to show. Omitted here
          rather than rendering a non-functional control. */}
    </>
  );
}
