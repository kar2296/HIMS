import React from 'react';
import { Button } from './Button';
import { colors, spacing, typography, radii } from '../components/ui/tokens';

interface ProcedureDetailItem {
  ProcedureCode?: string;
  ProcedureName?: string;
  ProcedureOrder?: { OrderNumber?: string };
  Quantity?: number;
}

interface ProcedureOrderItem {
  Id: number;
  OrderRequestDate?: string;
  OrderNumber?: string;
  OrderPriority?: { Description?: string };
  DoctorName?: string;
  OrderFrom?: { DepartmentName?: string };
  OrderTo?: { DepartmentName?: string };
  PatientBillId?: number;
  IsSelected?: boolean;
  CanShowDetails?: boolean;
  ProcedureOrderDetails?: ProcedureDetailItem[];
}

interface PendingProceduresPickerScreenProps {
  reactProps?: { items?: ProcedureOrderItem[] };
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

// UI-MODERNIZATION RETROFIT (Billing / "Pending Procedures" picker modal,
// public/views/billing/pendingprocedures/pending-procedures.html + .js):
// re-skins the real modal-full picker opened from opbilling-list.js:2420 and
// opbillingest-list.js:2231 via utl.Modal.openFixedDialog('app.pending-
// procedures', { params: { id: PatientId }, confirmCallback: ... }). All real
// data/logic is untouched -- items come from the real
// emr/procedureorder/GetProcedureOrders call already made by the hollowed
// controller; every action below is dispatched by name straight to the real,
// unmodified $scope functions (toggleCanShowDetails/IsOrderSelected/
// loadorders/cancelCallback) via the bridge in pending-procedures.js -- no
// logic was reimplemented in React.
//
// CONFIRMED PRE-EXISTING, preserved not fixed:
// 1) The live template never uses the controller's initDynamicForm/schema/
//    modeldata/actionClick block at all (no <dynamicform> element, no
//    "Apply"/"Reset" button in the real HTML) -- that entire Priority/Status
//    filter is dead code today. Not reproduced here, matching the real
//    screen exactly (confirmed by reading pending-procedures.html in full --
//    no dynamicform tag present).
// 2) $scope.IsOrderSelected(item) (bound to the row checkbox's ng-click)
//    unconditionally sets IsSelected = true for the clicked row, regardless
//    of the checkbox's own toggled state -- so once a row is checked it can
//    never be unchecked from this screen. Reproduced exactly: the checkbox
//    below dispatches 'toggleSelect', which the bridge routes straight to
//    the real $scope.IsOrderSelected(item) function, so the same one-way
//    behavior applies automatically.
// 3) $scope.select(item) (single-row confirm path) is dead code -- no
//    element in the real template calls it (only the checkbox + the single
//    "Load" button, which uses loadorders()). Not reproduced.
export const PendingProceduresPickerScreen: React.FC<PendingProceduresPickerScreenProps> = ({ reactProps, onAction }) => {
  const items = reactProps?.items || [];

  const dispatch = (action: string, payload?: any) => {
    if (onAction) onAction(action, payload);
  };

  const rowStyle: React.CSSProperties = {
    border: `1px solid ${colors.border}`,
    borderRadius: radii.md,
    marginBottom: spacing.sm,
    overflow: 'hidden',
  };
  const headerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: spacing.md,
    padding: `${spacing.sm} ${spacing.md}`,
    background: colors.surfaceMuted || colors.surface,
    ...typography.body,
    color: colors.textMain,
    fontFamily: typography.fontFamily,
  };
  const colStyle: React.CSSProperties = { flex: '1 1 0', minWidth: 0 };
  const detailStyle: React.CSSProperties = {
    padding: spacing.md,
    borderTop: `1px solid ${colors.border}`,
    ...typography.body,
    color: colors.textMain,
    fontFamily: typography.fontFamily,
  };

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: `${spacing.lg} ${spacing.xl} 40px`, fontFamily: typography.fontFamily }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: spacing.lg, paddingBottom: spacing.md, borderBottom: `1px solid ${colors.border}`,
      }}>
        <h3 style={{ margin: 0, ...typography.h3, color: colors.textMain, fontFamily: typography.fontFamily }}>
          Pending Procedures
        </h3>
        <Button variant="icon" icon="fa-xmark" title="Close" onClick={() => dispatch('cancelCallback')} />
      </div>

      {items.length === 0 && (
        <div style={{ ...typography.body, color: colors.textMuted, padding: spacing.md }}>No pending procedures found.</div>
      )}

      {items.map((item) => (
        <div key={item.Id} style={rowStyle}>
          <div style={headerStyle}>
            <div style={colStyle}>{formatDate(item.OrderRequestDate)} {formatTime(item.OrderRequestDate)}</div>
            <div style={colStyle}>{item.OrderNumber}</div>
            <div style={colStyle}>{item.OrderPriority?.Description}</div>
            <div style={{ ...colStyle, flex: '2 1 0' }}>{item.DoctorName}</div>
            <div style={{ ...colStyle, flex: '1.5 1 0' }}>{item.OrderFrom?.DepartmentName}</div>
            <div style={colStyle}>{item.OrderTo?.DepartmentName}</div>
            <div style={{ flex: '0 0 auto' }}>
              {!(item.PatientBillId && item.PatientBillId > 0) && (
                <input
                  type="checkbox"
                  checked={!!item.IsSelected}
                  onChange={() => dispatch('toggleSelect', { id: item.Id })}
                />
              )}
            </div>
            <div style={{ flex: '0 0 auto' }}>
              <Button
                variant="icon"
                icon={item.CanShowDetails ? 'fa-angle-up' : 'fa-angle-down'}
                title={item.CanShowDetails ? 'Hide details' : 'Show details'}
                onClick={() => dispatch('toggleDetails', { id: item.Id })}
              />
            </div>
          </div>

          {item.CanShowDetails && (
            <div style={detailStyle}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <tbody>
                  {(item.ProcedureOrderDetails || []).map((detail, idx) => (
                    <tr key={idx}>
                      <td style={{ padding: `${spacing.xs} ${spacing.sm}` }}>
                        <strong>{detail.ProcedureCode}</strong>{detail.ProcedureName ? ` (${detail.ProcedureName})` : ''}
                      </td>
                      <td style={{ padding: `${spacing.xs} ${spacing.sm}` }}>{detail.ProcedureOrder?.OrderNumber}</td>
                      <td style={{ padding: `${spacing.xs} ${spacing.sm}` }}>{detail.Quantity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ))}

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: spacing.lg }}>
        <Button variant="primary" onClick={() => dispatch('loadorders')}>Load</Button>
      </div>
    </div>
  );
};
