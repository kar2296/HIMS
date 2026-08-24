import React from 'react';
import { Button } from './Button';
import { colors, spacing, typography, radii } from '../components/ui/tokens';

interface OrderDetailItem {
  TestCode?: string;
  TestName?: string;
  PatientOrder?: { OrderNumber?: string };
  Quantity?: number;
  OrderComments?: string;
}

interface OrderItem {
  Id: number;
  PatientId?: number;
  OrderRequestDate?: string;
  OrderNumber?: string;
  OrderPriority?: { Description?: string };
  DoctorName?: string;
  OrderFrom?: { DepartmentName?: string };
  OrderTo?: { DepartmentName?: string };
  BillingId?: number;
  IsSelected?: boolean;
  CanShowDetails?: boolean;
  PatientOrderDetails?: OrderDetailItem[];
}

interface PendingOrderPickerScreenProps {
  reactProps?: { items?: OrderItem[] };
  onAction?: (actionName: string, payload?: any) => void;
}

// Mirrors the real cellTemplate/displaydate filter's 'dd-MMM-yyyy' + 'HH:mm' formatting.
function formatDate(val?: string): string {
  if (!val) return '';
  const d = new Date(val);
  if (isNaN(d.getTime())) return '';
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const dd = String(d.getDate()).padStart(2, '0');
  return `${dd}-${months[d.getMonth()]}-${d.getFullYear()}`;
}
function formatTime(val?: string): string {
  if (!val) return '';
  const d = new Date(val);
  if (isNaN(d.getTime())) return '';
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

// UI-MODERNIZATION RETROFIT (Billing / "Pending Order" picker modal,
// public/views/billing/pendingorders/pendingorder.html + .js): re-skins the
// real modal-full picker opened from opbilling-list.js's and
// opbillingest-list.js's $scope.pendingOrder() via utl.Modal.open('app.
// pendingorder', { params: { id: PatientId }, confirmCallback:
// $scope.getPendingData }). All real data/logic is untouched -- items come
// from the real emr/patientorder/GetPatientOrders call already made by the
// hollowed controller; every action below is dispatched by name straight
// to the real, unmodified $scope functions (IsOrderSelected,
// toggleCanShowDetails, loadorders, cancelCallback) via the bridge in
// pendingorder.js -- no logic was reimplemented in React.
//
// CONFIRMED PRE-EXISTING, preserved not fixed (confirmed by reading
// pendingorder.js and pendingorder.html in full, not assumed):
// 1) Unlike the near-identical Pending Procedures picker, initDynamicForm()
//    IS actually called here (from lookupCallback), so $scope.modeldata is
//    populated with real defaults (orderpriorityid: 1, orderstatusid: 1) --
//    but the live template still never renders a <dynamicform> element, so
//    there is no way to change these values from the UI. The real
//    getList() Params are effectively locked to these two defaults for
//    every session. Not reproduced as an editable filter, matching the
//    real screen exactly.
// 2) The real template renders item rows and their expandable "Item
//    Details" panels as two SEPARATE ng-repeat="item in items" loops --
//    the full summary table first, then every item's (possibly-empty)
//    detail panel stacked below it. So expanding row 1's toggle shows its
//    panel at the bottom of the whole list, not inline under row 1.
//    Reproduced exactly below (summary table, then a separate stacked
//    detail list in the same item order) rather than the more intuitive
//    inline-expand layout used for the separate Pending Procedures picker.
// 3) $scope.IsOrderSelected(item) (bound to the row checkbox) unconditionally
//    sets IsSelected = true regardless of the checkbox's own toggled state
//    -- so once a row is checked it can never be unchecked from this
//    screen. Reproduced exactly via the 'toggleSelect' dispatch, which the
//    bridge routes straight to the real, unmodified function.
// 4) $scope.select(item) and $scope.editPrescriptionDetail(item) are both
//    dead code -- no element in the real template calls either of them
//    (only the checkbox + the single "Load" button, which uses
//    loadorders()). Not reproduced.
export const PendingOrderPickerScreen: React.FC<PendingOrderPickerScreenProps> = ({ reactProps, onAction }) => {
  const items = reactProps?.items || [];

  const dispatch = (action: string, payload?: any) => {
    if (onAction) onAction(action, payload);
  };

  const rowStyle: React.CSSProperties = {
    display: 'flex', alignItems: 'center', gap: spacing.md,
    padding: `${spacing.sm} ${spacing.md}`, borderBottom: `1px solid ${colors.border}`,
    ...typography.body, color: colors.textMain, fontFamily: typography.fontFamily,
  };
  const colStyle: React.CSSProperties = { flex: '1 1 0', minWidth: 0 };
  const panelStyle: React.CSSProperties = {
    border: `1px solid ${colors.border}`, borderRadius: radii.md,
    marginBottom: spacing.sm, padding: spacing.md,
  };

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: `${spacing.lg} ${spacing.xl} 40px`, fontFamily: typography.fontFamily }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: spacing.lg, paddingBottom: spacing.md, borderBottom: `1px solid ${colors.border}`,
      }}>
        <h3 style={{ margin: 0, ...typography.h3, color: colors.textMain, fontFamily: typography.fontFamily }}>
          Pending Order
        </h3>
        <Button variant="icon" icon="fa-xmark" title="Close" onClick={() => dispatch('cancelCallback')} />
      </div>

      {items.length === 0 && (
        <div style={{ ...typography.body, color: colors.textMuted, padding: spacing.md }}>No pending orders found.</div>
      )}

      <div style={{ border: `1px solid ${colors.border}`, borderRadius: radii.md, marginBottom: spacing.lg }}>
        {items.map((item) => (
          <div key={item.Id} style={rowStyle}>
            <div style={{ flex: '0 0 auto' }}>
              {!(item.BillingId && item.BillingId > 0) && (
                <input
                  type="checkbox"
                  checked={!!item.IsSelected}
                  onChange={() => dispatch('toggleSelect', { id: item.Id })}
                />
              )}
            </div>
            <div style={colStyle}>{formatDate(item.OrderRequestDate)} {formatTime(item.OrderRequestDate)}</div>
            <div style={colStyle}>{item.OrderNumber}</div>
            <div style={colStyle}>{item.OrderPriority?.Description}</div>
            <div style={{ ...colStyle, flex: '2 1 0' }}>{item.DoctorName}</div>
            <div style={{ ...colStyle, flex: '1.5 1 0' }}>{item.OrderFrom?.DepartmentName}</div>
            <div style={colStyle}>{item.OrderTo?.DepartmentName}</div>
            <div style={{ flex: '0 0 auto' }}>
              <Button
                variant="icon"
                icon={item.CanShowDetails ? 'fa-angle-up' : 'fa-angle-down'}
                title={item.CanShowDetails ? 'Hide details' : 'Show details'}
                onClick={() => dispatch('toggleDetails', { id: item.Id })}
              />
            </div>
          </div>
        ))}
      </div>

      {items.map((item) => (
        item.CanShowDetails ? (
          <div key={item.Id} style={panelStyle}>
            <h4 style={{ margin: `0 0 ${spacing.sm} 0`, ...typography.h4, color: colors.textMain, fontFamily: typography.fontFamily }}>Item Details</h4>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <tbody>
                {(item.PatientOrderDetails || []).map((detail, idx) => (
                  <tr key={idx}>
                    <td style={{ padding: `${spacing.xs} ${spacing.sm}` }}>
                      <strong>{detail.TestCode}</strong>{detail.TestName ? ` (${detail.TestName})` : ''}
                    </td>
                    <td style={{ padding: `${spacing.xs} ${spacing.sm}` }}>{detail.PatientOrder?.OrderNumber}</td>
                    <td style={{ padding: `${spacing.xs} ${spacing.sm}` }}>{detail.Quantity}</td>
                    <td style={{ padding: `${spacing.xs} ${spacing.sm}` }}>{detail.OrderComments}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null
      ))}

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: spacing.lg }}>
        <Button variant="primary" onClick={() => dispatch('loadorders')}>Load</Button>
      </div>
    </div>
  );
};
