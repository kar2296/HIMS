import React from 'react';

interface VisitRow {
  Id?: number;
  slno?: number;
  VisitIdentifier?: string;
  Patient?: { FirstName?: string };
  Doctor?: { FirstName?: string };
  Referral?: { ReferralName?: string };
  Remarks?: string;
}

interface DrPaymentModifyNepalListScreenProps {
  reactProps?: {
    gridData?: VisitRow[];
  };
  onAction?: (actionName: string, payload?: any) => void;
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

export function DrPaymentModifyNepalListScreen({ reactProps, onAction }: DrPaymentModifyNepalListScreenProps) {
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
                <th style={thStyle}>Visit No</th>
                <th style={thStyle}>Patient Name</th>
                <th style={thStyle}>Visit Doctor</th>
                <th style={thStyle}>Refer Doctor</th>
                <th style={thStyle}>Remarks</th>
                <th style={thStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {gridData.map((row, idx) => (
                <tr key={row.Id ?? idx}>
                  <td style={tdStyle}>{row.slno}</td>
                  <td style={tdStyle}>{row.VisitIdentifier}</td>
                  <td style={tdStyle}>{row.Patient?.FirstName}</td>
                  <td style={tdStyle}>{row.Doctor?.FirstName}</td>
                  <td style={tdStyle}>{row.Referral?.ReferralName}</td>
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
        {/* The original uib-pagination footer is dead: vm.gridConfig.pagerObj
            is never assigned, and getList() always requests
            PageContext.PageSize: -1 (the full result set) -- there was never
            a working pager. Omitted here. */}
      </div>
    </>
  );
}
