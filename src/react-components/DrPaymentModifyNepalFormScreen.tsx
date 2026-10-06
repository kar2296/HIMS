import React from 'react';
import { Select } from '../components/ui/Select';

interface LookupItem {
  Id: number;
  Text: string;
}

interface DoctorShareDetailRow {
  Id?: number;
  Status?: number;
  DoctorId?: number;
  DoctorName?: string;
  DoctorShareAmount?: number | string;
  ServiceName?: string;
  ServiceAmount?: number | string;
  PatientBill?: { BillNumber?: string };
}

interface DrPaymentModifyNepalFormScreenProps {
  reactProps?: {
    PatientDoctorShareDetails?: DoctorShareDetailRow[];
    lookup?: { Doctor?: LookupItem[] };
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

// Modal for editing per-service doctor-share allocations for a Nepal visit.
export function DrPaymentModifyNepalFormScreen({ reactProps, onAction }: DrPaymentModifyNepalFormScreenProps) {
  const allRows = reactProps?.PatientDoctorShareDetails || [];
  const lookup = reactProps?.lookup || {};
  // Reproduces the original's `| filter:{Status:1}` on the ng-repeat. Keep
  // each row's ORIGINAL index (not the filtered position) so dispatched
  // updates land on the correct entry in PatientDoctorShareDetails.
  const rows = allRows
    .map((r, i) => ({ row: r, index: i }))
    .filter((x) => x.row.Status === 1);
  const doctorOptions = (lookup.Doctor || []).map((o) => ({ value: String(o.Id), label: o.Text }));

  const dispatch = (actionName: string, payload?: any) => {
    onAction?.(actionName, payload);
  };

  return (
    <>
      <div className="modal-header custom-modal-header">
        <h4 className="col-sm-11 mt0">Change Dr.</h4>
        <button
          id="btnCancelForm"
          style={{ width: 33 }}
          type="button"
          className="col-sm-1 btn btn-danger btn-sm"
          onClick={() => dispatch('cancel')}
        >
          X
        </button>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ background: '#f8fafc' }}>
            <tr>
              <th style={thStyle}>Bill Number</th>
              <th style={thStyle}>Service Name</th>
              <th style={thStyle}>Amt</th>
              <th style={thStyle}>Doctor</th>
              <th style={thStyle}>Share Amount</th>
              <th style={thStyle}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ row, index: idx }) => (
              <tr key={row.Id ?? idx}>
                <td style={{ ...tdStyle, textAlign: 'center' }}>{row.PatientBill?.BillNumber}</td>
                <td style={{ ...tdStyle, textAlign: 'center' }}>{row.ServiceName}</td>
                <td style={{ ...tdStyle, textAlign: 'center' }}>{row.ServiceAmount}</td>
                <td style={{ ...tdStyle, textAlign: 'center' }}>
                  {/* The original's ng-change="onDoctorSelected($index,item)" calls a
                      plain (non-$scope) JS function that AngularJS templates cannot
                      reach -- a confirmed pre-existing bug. Only the ng-model binding
                      (DoctorId) actually worked; DoctorName was never updated by this
                      control. Reproduced verbatim: selecting a doctor here updates
                      DoctorId only, not the displayed DoctorName. */}
                  <Select
                    options={doctorOptions}
                    value={row.DoctorId != null ? String(row.DoctorId) : ''}
                    onChange={(v) => dispatch('doctorIdChange', { index: idx, value: v ? Number(v) : null })}
                  />
                </td>
                <td style={{ ...tdStyle, textAlign: 'center' }}>
                  <input
                    type="text"
                    className="form-control"
                    value={row.DoctorShareAmount ?? ''}
                    onChange={(e) => dispatch('doctorShareAmountChange', { index: idx, value: e.target.value })}
                  />
                </td>
                <td style={tdStyle}>
                  {/* The original's ng-click="deleteItem($index,item)" calls a
                      $scope method that is never defined anywhere in this
                      controller -- a confirmed pre-existing dead/broken action.
                      Reproduced as non-functional: this dispatch has no handler
                      wired up on the AngularJS side, matching the original's
                      inert delete button. */}
                  <img
                    src="/app/img/svg/noun_Delete.svg"
                    style={{ cursor: 'pointer' }}
                    alt=""
                    onClick={() => dispatch('delete', { index: idx })}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="fooder-bgs">
        <div className="pull-right">
          <div className="col-sm-12">
            <button id="btnCancelForm" type="button" className="draftbutton" onClick={() => dispatch('save')}>
              Approve
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
