import React from 'react';

interface IpBillRow {
  _idx?: number; // index into the full (unfiltered) $scope.PatientBillDetails array
  DoctorName?: string;
  BillDateTime?: string;
  PatientBill?: { BillNumber?: string };
  ServiceName?: string;
  Quantity?: number;
  Rate?: number;
  DiscountAmount?: number;
  NetAmount?: number;
  Encounter?: { WardRoomMaster?: { RoomNo?: string }; WardRoomBedMaster?: { BedNo?: string } };
  PatientBillStatus?: { Description?: string };
  isEditable?: boolean;
  isCompleted?: boolean;
}

interface IpBillListTableScreenProps {
  reactProps?: {
    rows?: IpBillRow[];
    isEditableAll?: boolean;
  };
  onAction?: (actionName: string, payload?: any) => void;
}

function formatCurrency(value?: number): string {
  const n = Number(value ?? 0);
  return n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatDateTime(val?: string): string {
  if (!val) return '';
  const d = new Date(val);
  if (isNaN(d.getTime())) return '';
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const dd = String(d.getDate()).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const mi = String(d.getMinutes()).padStart(2, '0');
  return `${dd}-${months[d.getMonth()]}-${d.getFullYear()} ${hh}:${mi}`;
}

// React bridge migration: replaces the plain ng-repeat table in
// ipbilllist.html. Rows are pre-filtered/sorted by the bridge to match
// the original's `| orderBy:'ServiceName' | filter:{PatientBillStatusId:
// 3}`, each carrying `_idx`, its index into the full (unfiltered)
// $scope.PatientBillDetails array, so per-row edits write back to the
// exact original element that calcAmt()/load() read from. The "select
// all" checkbox and per-row checkboxes reproduce SelectAll()/canEditable()
// exactly, including that completed rows (isCompleted) are always
// skipped by "select all" and always rendered disabled.
export const IpBillListTableScreen: React.FC<IpBillListTableScreenProps> = ({ reactProps, onAction }) => {
  const rows = reactProps?.rows || [];

  const dispatch = (actionName: string, payload?: any) => {
    onAction?.(actionName, payload);
  };

  return (
    <table className="table table-responsive table-bordered">
      <thead className="bg-subhead">
        <tr>
          <th style={{ width: '3%' }}>
            <input
              type="checkbox"
              className="custom-checkbox popbox"
              checked={!!reactProps?.isEditableAll}
              onChange={(e) => dispatch('selectAll', { checked: e.target.checked })}
            />
          </th>
          <th className="col-sm-1"><span>Doctor</span></th>
          <th className="col-sm-1"><span>Bill Date</span></th>
          <th className="col-sm-1"><span>Bill Number</span></th>
          <th className="col-sm-2"><span>Service Name</span></th>
          <th className="col-sm-1"><span>Qty</span></th>
          <th className="col-sm-1"><span>Rate</span></th>
          <th className="col-sm-1"><span>Discount</span></th>
          <th className="col-sm-1"><span>Net Amount</span></th>
          <th className="col-sm-1"><span>Ward</span></th>
          <th className="col-sm-1"><span>Status</span></th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row, idx) => (
          <tr key={row._idx ?? idx} className={row.isCompleted ? 'ipbilltoopbill' : ''}>
            <td style={{ paddingLeft: '1%' }}>
              <input
                type="checkbox"
                className="custom-checkbox"
                checked={!!row.isEditable}
                disabled={!!row.isCompleted}
                onChange={(e) => dispatch('canEditable', { idx: row._idx, checked: e.target.checked })}
              />
            </td>
            <td>{row.DoctorName}</td>
            <td>{formatDateTime(row.BillDateTime)}</td>
            <td>{row.PatientBill?.BillNumber}</td>
            <td>{row.ServiceName}</td>
            <td>{row.Quantity}</td>
            <td className="currency-align">{formatCurrency(row.Rate)}</td>
            <td className="currency-align">{formatCurrency(row.DiscountAmount)}</td>
            <td className="currency-align">{formatCurrency(row.NetAmount)}</td>
            <td>{row.Encounter?.WardRoomMaster?.RoomNo} - {row.Encounter?.WardRoomBedMaster?.BedNo}</td>
            <td>{row.PatientBillStatus?.Description}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};
