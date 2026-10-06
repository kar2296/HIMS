interface BillInfoRow {
  _idx: number;
  Status?: number;
  PackageMasterServiceId?: number;
  ServiceName?: string;
  Department?: { DepartmentName?: string };
  Quantity?: number;
  Rate?: number;
  totDiscount?: number;
  NetAmount?: number;
  ReceivedAmount?: number;
  PatientBillStatus?: { Description?: string };
  PatientBillStatusId?: number;
  OrderStatusId?: number;
  select?: boolean;
  CancelReason?: string;
}

interface Props {
  reactProps: {
    billinfo?: BillInfoRow[];
    selectAllChecked?: boolean;
  };
  onAction: (actionType: string, payload: any) => void;
}

// Mirrors the real displaycurrency filter (vendor/common/ngCommonHelper.js):
// currency symbol plus Indian-style digit grouping, 2 decimals.
function formatCurrency(val: number | string | undefined | null): string {
  const num = Number(val) || 0;
  return `₹${num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/**
 * opbilling > itemwiseopbillcancel (Partial Cancel modal): the plain
 * ng-repeat line-item table with a select-all header checkbox, per-row
 * checkbox, and per-row cancellation-reason text input. Reproduces the
 * original `| filter: billingFilter` (Status==1 && PackageMasterServiceId==0)
 * and the "canceleditem" row styling (PatientBillStatusId==2 ||
 * OrderStatusId==10) exactly. All financial/rounding/package-share logic
 * (SelectAll, selectionChangedCal, CalculateTotal, AddValuetoDetail) stays
 * in the AngularJS controller untouched -- this component only renders
 * reactProps.billinfo and dispatches action names.
 */
export function ItemwiseOpBillCancelTableScreen({ reactProps, onAction }: Props) {
  const rows = (reactProps?.billinfo || []).filter(
    (item) => item.Status === 1 && item.PackageMasterServiceId === 0
  );

  return (
    <div style={{ overflowX: 'auto', maxHeight: 350 }}>
      <table className="partial-cancel-table">
        <thead>
          <tr>
            <th style={{ width: 40, textAlign: 'center' }}>
              <input
                type="checkbox"
                title="Select All"
                checked={!!reactProps?.selectAllChecked}
                onChange={(e) => onAction('selectAll', { checked: e.target.checked })}
              />
            </th>
            <th style={{ minWidth: 160 }}><span>Service Name</span></th>
            <th style={{ minWidth: 140 }}><span>Dept. Name</span></th>
            <th style={{ width: 60, textAlign: 'center' }}><span>Qty</span></th>
            <th style={{ width: 90, textAlign: 'right' }}><span>Rate</span></th>
            <th style={{ width: 80, textAlign: 'right' }}><span>Disc</span></th>
            <th style={{ width: 120, textAlign: 'right' }}><span>Sales Amt</span></th>
            <th style={{ width: 100, textAlign: 'right' }}><span>Rec.Amt</span></th>
            <th style={{ width: 100, textAlign: 'center' }}><span>Status</span></th>
            <th style={{ minWidth: 180 }}><span>Reason</span></th>
          </tr>
        </thead>
        <tbody>
          {rows.map((item) => {
            const isCancelled = item.PatientBillStatusId === 2 || item.OrderStatusId === 10;
            return (
              <tr key={item._idx} className={isCancelled ? 'canceleditem' : undefined}>
                <td style={{ textAlign: 'center' }}>
                  <input
                    type="checkbox"
                    id={`select${item._idx}`}
                    disabled={isCancelled}
                    checked={!!item.select}
                    onChange={(e) => onAction('rowSelect', { idx: item._idx, checked: e.target.checked })}
                  />
                </td>
                <td style={{ fontWeight: 600, color: '#0f172a' }}>{item.ServiceName}</td>
                <td style={{ color: '#64748b' }}>{item.Department?.DepartmentName}</td>
                <td style={{ textAlign: 'center', fontWeight: 600 }}>{item.Quantity}</td>
                <td style={{ textAlign: 'right' }}>{formatCurrency(item.Rate)}</td>
                <td style={{ textAlign: 'right', color: '#64748b' }}>{formatCurrency(item.totDiscount)}</td>
                <td style={{ textAlign: 'right', fontWeight: 600, color: '#0f172a' }}>{formatCurrency(item.NetAmount)}</td>
                <td style={{ textAlign: 'right', fontWeight: 600, color: '#059669' }}>{formatCurrency(item.ReceivedAmount)}</td>
                <td style={{ textAlign: 'center' }}>
                  <span className="partial-status-badge">{item.PatientBillStatus?.Description}</span>
                </td>
                <td>
                  <input
                    type="text"
                    className="form-control"
                    disabled={isCancelled}
                    placeholder="Enter cancellation reason..."
                    required={!!item.select}
                    value={item.CancelReason ?? ''}
                    onChange={(e) => onAction('reasonChange', { idx: item._idx, value: e.target.value })}
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
