import React from 'react';

interface PatientBillRow {
  Id?: number;
  PatientId?: number;
  BillNumber?: string;
  PatientBillId?: number;
  BillDateTime?: string;
  Patient?: { MRN?: string; FirstName?: string };
  PatientName?: string;
  EncounterTypeId?: number;
  UserDoctor?: { FirstName?: string };
  DoctorName?: string;
  BillAmount?: number;
  PaidAmount?: number;
  OutStandingAmount?: number;
  PrivateDue?: { FirstName?: string; LastName?: string };
  CreditApprovalStatus?: { Description?: string };
}

interface CreditApprovalListScreenProps {
  reactProps?: {
    rows?: PatientBillRow[] | null;
  };
  onAction?: (actionName: string, payload?: any) => void;
}

function formatCurrency(value?: number): string {
  const n = Number(value ?? 0);
  return n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export const CreditApprovalListScreen: React.FC<CreditApprovalListScreenProps> = ({ reactProps, onAction }) => {
  const rows = reactProps?.rows;

  const dispatch = (actionName: string, payload?: any) => {
    onAction?.(actionName, payload);
  };

  const edit = (row: PatientBillRow) => {
    const billId = row.Id ?? row.PatientBillId;
    if (!billId) return;
    dispatch('edit', {
      Id: billId,
      PatientId: row.PatientId,
      BillNumber: row.BillNumber,
      PatientBillId: billId,
      item: row,
    });
  };

  const getStatusBadge = (statusDesc?: string) => {
    const desc = statusDesc || 'Pending';
    let badgeClass = 'label label-warning';
    const style: React.CSSProperties = { padding: '4px 8px', borderRadius: '4px', fontSize: '11px', display: 'inline-block' };
    if (desc.toLowerCase().includes('approve')) {
      badgeClass = 'label label-success';
    } else if (desc.toLowerCase().includes('reject')) {
      badgeClass = 'label label-danger';
    }
    return <span className={badgeClass} style={style}>{desc}</span>;
  };

  return (
    <div className="row">
      <form id="item_form" name="item_form" className="form-horizontal" role="form">
        <div className="table-control">
          <div className="bg-pattern">
            <div className="formRoot pharmacycollections" id="mainresponsivetablecontrol">
              <table className="table table-hover table-responsive table-bordered">
                <thead className="bg-subhead">
                  <tr>
                    <th><span>Bill Date</span></th>
                    <th><span>Bill No</span></th>
                    <th><span>Patient Name</span></th>
                    <th><span>Doctor</span></th>
                    <th><span>Bill Amount</span></th>
                    <th><span>Paid Amount</span></th>
                    <th><span>Due Amount</span></th>
                    <th><span>Due Approver</span></th>
                    <th><span>Status</span></th>
                    <th style={{ textAlign: 'center', width: '70px' }}><span>Action</span></th>
                  </tr>
                </thead>
                <tbody>
                  {rows == null && (
                    <tr>
                      <td colSpan={10} className="text-center" style={{ padding: '35px 20px', color: '#64748b' }}>
                        <i className="fa fa-spinner fa-spin" style={{ fontSize: '18px', marginRight: '8px', verticalAlign: 'middle' }}></i>
                        <span style={{ fontSize: '14px', fontWeight: 500 }}>Loading due bills...</span>
                      </td>
                    </tr>
                  )}
                  {rows != null && rows.length === 0 && (
                    <tr>
                      <td colSpan={10} className="text-center" style={{ padding: '35px 20px', color: '#64748b' }}>
                        <i className="fa fa-info-circle" style={{ fontSize: '18px', marginRight: '8px', verticalAlign: 'middle' }}></i>
                        <span style={{ fontSize: '14px', fontWeight: 500 }}>No due bills found for the selected filters.</span>
                        <div style={{ marginTop: '6px', fontSize: '12px', color: '#94a3b8' }}>
                          Try selecting "Last 30 Days" or "All Records" above, or clear the bill number search.
                        </div>
                      </td>
                    </tr>
                  )}
                  {(rows || []).map((row, idx) => {
                    const patientDisplay = (row.Patient?.FirstName || row.Patient?.MRN)
                      ? `${row.Patient?.MRN ? row.Patient.MRN + ' - ' : ''}${row.Patient?.FirstName || ''}`
                      : (row.PatientName || '-');
                    const doctorDisplay = row.UserDoctor?.FirstName || row.DoctorName || '-';
                    const approverDisplay = (row.PrivateDue?.FirstName || row.PrivateDue?.LastName)
                      ? `${row.PrivateDue?.FirstName || ''} ${row.PrivateDue?.LastName || ''}`.trim()
                      : '-';

                    return (
                      <tr key={row.Id ?? row.PatientBillId ?? idx}>
                        <td className="text-left">
                          <span>
                            {row.BillDateTime ? new Date(row.BillDateTime).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : ''}{' '}
                            {row.BillDateTime ? new Date(row.BillDateTime).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false }) : ''}
                          </span>
                        </td>
                        <td className="text-left"><span style={{ fontWeight: 600 }}>{row.BillNumber}</span></td>
                        <td className="text-left">
                          <span>{patientDisplay}</span>
                          {row.EncounterTypeId === 2 ? (
                            <span className="label label-info" style={{ marginLeft: '6px', fontSize: '10px' }}>IP</span>
                          ) : (
                            <span className="label label-default" style={{ marginLeft: '6px', fontSize: '10px' }}>OP</span>
                          )}
                        </td>
                        <td className="text-left"><span>{doctorDisplay}</span></td>
                        <td className="text-right"><span>{formatCurrency(row.BillAmount)}</span></td>
                        <td className="text-right"><span>{formatCurrency(row.PaidAmount)}</span></td>
                        <td className="text-right">
                          <span style={{ fontWeight: 700, color: '#dc2626' }}>{formatCurrency(row.OutStandingAmount)}</span>
                        </td>
                        <td className="text-left"><span>{approverDisplay}</span></td>
                        <td className="text-left">{getStatusBadge(row.CreditApprovalStatus?.Description)}</td>
                        <td className="text-center">
                          <button
                            type="button"
                            className="btn btn-default btn-xs"
                            title="Approve / Reject Credit Due"
                            style={{ padding: '3px 8px', borderRadius: '4px' }}
                            onClick={() => edit(row)}
                          >
                            <img className="drhms-edit-button" src="assets/svg/edit.svg" alt="Edit" style={{ width: '14px', height: '14px' }} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
