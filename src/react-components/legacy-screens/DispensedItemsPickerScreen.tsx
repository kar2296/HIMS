/**
 * "Dispensed Items" picker, opened as a popup (modal 'app.emrpick-from-dispenselist') from
 * Medicine Return. Lists the patient's dispensed pharmacy items for the visit; the user ticks items,
 * enters return quantities and loads them back into the return form.
 * Migrated from public/views/inpatient/patientreturns/emrpick-from-dispenselist.*.
 *
 *   load : billing/patientbilldetails/GetPatientPharmacyBillDetails
 *          (Key 3 = encounter, Key 4 = 3, Key 24 = 1, Key 25 = 0 -- same filters as before)
 *   close: { ReturnData: selected lines, IsPicked: 1 }
 */
import React, { useEffect, useMemo, useState } from 'react';
import { apiFetch } from '../utils/api';
import { alert } from '../utils/alert';
import { Button } from '../Button';
import { ConfirmModal } from '../ConfirmModal';
import { EmptyState } from '../../components/ui/EmptyState';
import { SkeletonRows } from '../../components/ui/Loading';
import { colors, typography } from '../../components/ui/tokens';
import { formatDate } from '../emr-workspace/emrHelpers';
import { PopupFrame } from './PopupFrame';
import { buildReturnableItems, checkReturnQuantity } from './dispensedItems';
import type { BillDetailRow, ReturnableItem, StockReturnDetail } from './dispensedItems';

type LabelKey =
  | 'title' | 'itemName' | 'billedQty' | 'returnedQty' | 'transitQty' | 'returnQty' | 'batchId' | 'expiryDate' | 'load'
  | 'exceedsBilled' | 'alreadyReturned' | 'confirmLoad' | 'selectOne' | 'confirmTitle' | 'yes' | 'no' | 'selectAll';

interface DispensedItemsPickerScreenProps {
  reactProps?: {
    context?: { encounterId?: number; patientId?: number };
    labels?: Partial<Record<LabelKey, string>>;
  };
  onClose?: (result: { ReturnData: (ReturnableItem & { select: boolean })[]; IsPicked: number }) => void;
  onCancel?: () => void;
}

interface Line extends ReturnableItem {
  select: boolean;
  qtyText: string;
}

const FILTERS = (encounterId: number) => ({
  Params: [
    { Key: 3, Value: encounterId },
    { Key: 4, Value: 3 },
    { Key: 24, Value: 1 },
    { Key: 25, Value: 0 },
  ],
  PageContext: { PageSize: 10000, PageNumber: 1 },
});

export const DispensedItemsPickerScreen: React.FC<DispensedItemsPickerScreenProps> = ({ reactProps, onClose, onCancel }) => {
  const encounterId = Number(reactProps?.context?.encounterId) || 0;
  const labels = reactProps?.labels || {};
  const L = (key: LabelKey, fallback: string) => labels[key] || fallback;

  const [lines, setLines] = useState<Line[]>([]);
  const [patient, setPatient] = useState<any>(null);
  const [loading, setLoading] = useState(encounterId > 0);
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    if (!encounterId) return;
    let active = true;
    apiFetch('billing/patientbilldetails/GetPatientPharmacyBillDetails', FILTERS(encounterId))
      .then((res) => {
        if (!active) return;
        const rows: BillDetailRow[] = res?.Data || [];
        const stockReturns: StockReturnDetail[] = (rows[0] as any)?.Encounter?.PatientStockReturnDetails || [];
        setPatient((rows[0] as any)?.PatientBill?.Patient || null);
        setLines(buildReturnableItems(rows, stockReturns).map((item) => ({ ...item, ReturnQuantity: 0, select: false, qtyText: '' })));
      })
      .catch(() => {
        /* toast already shown */
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [encounterId]);

  const allSelected = lines.length > 0 && lines.every((l) => l.select);
  const toggleAll = (checked: boolean) => setLines((ls) => ls.map((l) => ({ ...l, select: checked })));
  const toggle = (idx: number, checked: boolean) => setLines((ls) => ls.map((l, i) => (i === idx ? { ...l, select: checked } : l)));

  const changeQty = (idx: number, text: string) => {
    if (text !== '' && !/^\d+$/.test(text)) return; // whole numbers only
    setLines((ls) =>
      ls.map((l, i) => {
        if (i !== idx) return l;
        const qty = text === '' ? 0 : parseInt(text, 10);
        const problem = checkReturnQuantity(l, qty);
        if (problem) {
          alert.showErrorMsg(problem === 'alreadyReturned' ? L('alreadyReturned', 'Billed Quantity Already Returned') : L('exceedsBilled', 'Return Qty Should not Exceed than Actual Billed Qty.'));
          return { ...l, ReturnQuantity: 0, qtyText: '' };
        }
        return { ...l, ReturnQuantity: qty, qtyText: text };
      }),
    );
  };

  const selected = useMemo(() => lines.filter((l) => l.select && l.ReturnQuantity > 0), [lines]);

  const requestLoad = () => {
    if (selected.length === 0) {
      alert.showErrorMsg(L('selectOne', 'Please Select atleast one item to Return.'));
      return;
    }
    setConfirmOpen(true);
  };

  const confirmLoad = () => {
    setConfirmOpen(false);
    onClose?.({
      ReturnData: selected.map(({ qtyText: _qtyText, ...line }) => line),
      IsPicked: 1,
    });
  };

  const patientLine = patient
    ? [`${patient.Title?.Description || ''} ${patient.FirstName || ''}`.trim(), patient.MRN, patient.Gender?.Description, patient.Age ? `${patient.Age} Years` : null]
        .filter(Boolean)
        .join(' | ')
    : undefined;

  const th: React.CSSProperties = { padding: '8px 10px', textAlign: 'left', whiteSpace: 'nowrap', fontWeight: 600, fontSize: 12, color: colors.textMuted };
  const td: React.CSSProperties = { padding: '6px 10px', borderTop: `1px solid ${colors.surfaceSunken}`, fontSize: 13 };

  return (
    <PopupFrame
      title={L('title', 'Dispensed Items')}
      subtitle={patientLine}
      onClose={() => onCancel?.()}
      footer={
        <Button variant="primary" size="sm" icon="fa-solid fa-download" onClick={requestLoad} disabled={loading || lines.length === 0}>
          {L('load', 'Load')}
          {selected.length > 0 ? ` (${selected.length})` : ''}
        </Button>
      }
    >
      {loading ? (
        <SkeletonRows rows={6} columns={6} />
      ) : lines.length === 0 ? (
        <EmptyState text="No dispensed items to return for this visit." />
      ) : (
        <div style={{ overflowX: 'auto', fontFamily: typography.fontFamily }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ background: colors.surfaceMuted }}>
              <tr>
                <th style={th}>
                  <input type="checkbox" checked={allSelected} onChange={(e) => toggleAll(e.target.checked)} aria-label={L('selectAll', 'Select all')} />
                </th>
                <th style={th}>{L('itemName', 'Item Name')}</th>
                <th style={{ ...th, textAlign: 'right' }}>{L('billedQty', 'Billed Qty')}</th>
                <th style={{ ...th, textAlign: 'right' }}>{L('returnedQty', 'Returned Qty')}</th>
                <th style={{ ...th, textAlign: 'right' }}>{L('transitQty', 'Transit Qty')}</th>
                <th style={{ ...th, width: 110 }}>{L('returnQty', 'Return Qty')}</th>
                <th style={th}>{L('batchId', 'Batch Id')}</th>
                <th style={th}>{L('expiryDate', 'Expiry Date')}</th>
              </tr>
            </thead>
            <tbody>
              {lines.map((l, idx) => (
                <tr key={`${l.ItemMasterId}-${l.StockSerialItemId}`} style={{ background: l.select ? colors.primaryLight : undefined }}>
                  <td style={td}>
                    <input type="checkbox" checked={l.select} onChange={(e) => toggle(idx, e.target.checked)} aria-label={`Select ${l.ItemName}`} />
                  </td>
                  <td style={{ ...td, fontWeight: 600 }}>{l.ItemName}</td>
                  <td style={{ ...td, textAlign: 'right' }}>{l.Quantity}</td>
                  <td style={{ ...td, textAlign: 'right' }}>{l.ReturnedQuantity}</td>
                  <td style={{ ...td, textAlign: 'right' }}>{l.ReturnTransitQuantity}</td>
                  <td style={td}>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={l.qtyText}
                      onChange={(e) => changeQty(idx, e.target.value.trim())}
                      aria-label={`${L('returnQty', 'Return Qty')} ${l.ItemName}`}
                      style={{ width: 90, height: 30, padding: '0 8px', border: `1px solid ${colors.border}`, borderRadius: 4, fontSize: 13 }}
                    />
                  </td>
                  <td style={td}>{l.BatchId || '—'}</td>
                  <td style={td}>{l.ExpiryDate ? formatDate(l.ExpiryDate) : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <ConfirmModal
        isOpen={confirmOpen}
        title={L('confirmTitle', 'Confirm')}
        message={L('confirmLoad', 'Are you sure! You want to Return the Selected Items?')}
        yesLabel={L('yes', 'Yes')}
        noLabel={L('no', 'No')}
        variant="warning"
        onConfirm={confirmLoad}
        onCancel={() => setConfirmOpen(false)}
      />
    </PopupFrame>
  );
};
