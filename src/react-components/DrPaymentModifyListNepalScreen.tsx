import React from 'react';
import { Select } from '../components/ui/Select';

interface LookupItem {
  Id: number;
  Text: string;
}

interface DoctorShareRow {
  Id?: number;
  slno?: number;
  BillNumber?: string;
  BillDateTime?: string;
  DoctorName?: string;
  PaidAmount?: number | string;
  DoctorShare?: number | string;
}

interface DrPaymentModifyListNepalScreenProps {
  reactProps?: {
    item?: {
      PatientName?: string;
      Age?: number | string;
      Gender?: string;
      PatientMrn?: string;
      DoctorId?: number;
      DoctorName?: string;
      ReferralId?: number;
      ReferralName?: string;
    };
    lookup?: { Doctor?: LookupItem[]; Referral?: LookupItem[] };
    gridData?: DoctorShareRow[];
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

export function DrPaymentModifyListNepalScreen({ reactProps, onAction }: DrPaymentModifyListNepalScreenProps) {
  const item = reactProps?.item || {};
  const lookup = reactProps?.lookup || {};
  const gridData = reactProps?.gridData || [];

  const dispatch = (actionName: string, payload?: any) => {
    onAction?.(actionName, payload);
  };

  const doctorOptions = (lookup.Doctor || []).map((o) => ({ value: String(o.Id), label: o.Text }));
  const referralOptions = (lookup.Referral || []).map((o) => ({ value: String(o.Id), label: o.Text }));

  const findText = (options: LookupItem[] | undefined, id: any) => {
    const found = (options || []).find((o) => String(o.Id) === String(id));
    return found ? found.Text : '';
  };

  return (
    <>
      <div className="row page-header">
        <h4 className="col-sm-6 mt0">Doctor payment Update</h4>
      </div>

      {/* Read-only patient banner. The original's "Status" column is a
          confirmed copy-paste bug: it re-renders {{item.Age}}/{{item.Gender}}
          (identical to the Age/Sex column) instead of an actual status
          value -- reproduced verbatim, not fixed. */}
      <div className="row">
        <table id="bannerdetails">
          <tbody>
            <tr>
              <td>Patient Name</td>
              <td className="service">{item.PatientName}</td>
              <td>Age/Sex</td>
              <td>{item.Age}/ {item.Gender}</td>
              <td>Patient Id</td>
              <td>{item.PatientMrn}</td>
              <td>Status/Hospital</td>
              <td>{item.Age}/ {item.Gender}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="row">
        <h4>Visit Information</h4>
        <div className="form-group col-sm-2">
          <label className="col-sm-12 control-label">Visit Doctor</label>
        </div>
        <div className="form-group col-sm-4">
          <div className="col-sm-12">
            <Select
              options={doctorOptions}
              value={item.DoctorId != null ? String(item.DoctorId) : ''}
              onChange={(v) =>
                dispatch('doctorChange', { id: v ? Number(v) : null, text: findText(lookup.Doctor, v) })
              }
            />
          </div>
        </div>
        <div className="form-group col-sm-2">
          <label className="col-sm-12 control-label">Refer Doctor</label>
        </div>
        <div className="form-group col-sm-4">
          <div className="col-sm-12">
            <Select
              options={referralOptions}
              value={item.ReferralId != null ? String(item.ReferralId) : ''}
              onChange={(v) =>
                dispatch('referralChange', { id: v ? Number(v) : null, text: findText(lookup.Referral, v) })
              }
            />
          </div>
        </div>
      </div>

      <div className="fooder-bgs">
        <div className="row">
          <div className="pull-right">
            <button id="btnCancelForm" type="button" className="draftbutton" onClick={() => dispatch('save')}>
              Update
            </button>
          </div>
        </div>
      </div>

      <div className="col-sm-12">
        <h4>Services</h4>
      </div>
      <div className="row">
        <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: 6 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                <th style={thStyle}>S. No.</th>
                <th style={thStyle}>Bill Nr.</th>
                <th style={thStyle}>Bill Date</th>
                <th style={thStyle}>Dr. Name</th>
                <th style={thStyle}>Amount</th>
                <th style={thStyle}>Dr. Share</th>
                <th style={thStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {gridData.map((row, idx) => (
                <tr key={row.Id ?? idx}>
                  <td style={tdStyle}>{row.slno}</td>
                  <td style={tdStyle}>{row.BillNumber}</td>
                  <td style={tdStyle}>{formatDateTime(row.BillDateTime)}</td>
                  <td style={tdStyle}>{row.DoctorName}</td>
                  <td style={{ ...tdStyle, textAlign: 'right' }}>{row.PaidAmount}</td>
                  <td style={{ ...tdStyle, textAlign: 'right' }}>{row.DoctorShare}</td>
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
