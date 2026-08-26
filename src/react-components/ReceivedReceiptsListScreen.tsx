import React, { useState } from 'react';

interface ReceiptRow {
  Id?: number;
  PaymentDate?: string;
  PaymentIdentifier?: string;
  GuarantorName?: string;
  ReceivedAmount?: number;
  TDSAmount?: number;
  Disallowed?: number;
  InsurancePaymentStatus?: { Description?: string };
  InsurancePaymentStatusId?: number;
}

interface ReceivedReceiptsListScreenProps {
  reactProps?: {
    rows?: ReceiptRow[];
  };
  onAction?: (actionName: string, payload?: any) => void;
}

type SortState = { field: string; order: 1 | -1 } | null;

function dotGet(obj: any, path: string): any {
  let broke = false;
  return path.split('.').reduce((o, k) => {
    if (!broke && o && o[k] !== undefined) return o[k];
    broke = true;
    return undefined;
  }, obj);
}

function formatCurrency(value?: number): string {
  const n = Number(value ?? 0);
  return n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatDT(value?: string): string {
  if (!value) return '';
  const d = new Date(value);
  const date = d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  const time = d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false });
  return `${date} ${time}`;
}

// React bridge migration, results table for the HYBRID
// receivedreceipts.html split (see ReceivedReceiptsFilterScreen.tsx).
// Replaces <custom-table config="vm.gridConfig">, with column-sort
// emulation; native <ul uib-pagination> footer untouched. The "No"
// column header (translate key currentinpatient.ipno.lbl) is a
// pre-existing label reuse -- reproduced as-is, not renamed. The
// PaymentDate column uses <ngformatdate> in the original (a pure
// date-formatting directive, safely reimplemented here as plain JS).
//
// Confirmed pre-existing redundant markup, collapsed here without any
// behavior change: the Action column originally renders TWO edit-icon
// <span>s with complementary ng-show conditions
// (InsurancePaymentStatusId==3, and ==1||==2) that both call the
// identical handleEvents('edit', entity) -- functionally equivalent to
// one icon shown whenever status is 1, 2, or 3, which is what is
// rendered here.
export const ReceivedReceiptsListScreen: React.FC<ReceivedReceiptsListScreenProps> = ({ reactProps, onAction }) => {
  const rows = reactProps?.rows || [];
  const [sort, setSort] = useState<SortState>(null);

  const dispatch = (actionName: string, payload?: any) => {
    onAction?.(actionName, payload);
  };

  const sortedRows = React.useMemo(() => {
    if (!sort) return rows;
    const copy = [...rows];
    copy.sort((a, b) => {
      const x = String(dotGet(a, sort.field) ?? '').toLowerCase();
      const y = String(dotGet(b, sort.field) ?? '').toLowerCase();
      if (x < y) return -sort.order;
      if (x > y) return sort.order;
      return 0;
    });
    return copy;
  }, [rows, sort]);

  const headerClick = (field: string) => {
    setSort((prev) => (prev && prev.field === field ? { field, order: prev.order === 1 ? -1 : 1 } : { field, order: 1 }));
  };

  return (
    <div className="custom-table table-striped table-bordered">
      <table className="table table-bordered bordered table-striped table-condensed datatable">
        <thead>
          <tr>
            <th>No</th>
            <th onClick={() => headerClick('PaymentDate')}>Date &amp; Time</th>
            <th onClick={() => headerClick('PaymentIdentifier')}>Receipt #</th>
            <th onClick={() => headerClick('GuarantorName')}>Payer Name</th>
            <th onClick={() => headerClick('ReceivedAmount')}>Receipt Amount</th>
            <th onClick={() => headerClick('TDSAmount')}>TDS</th>
            <th onClick={() => headerClick('Disallowed')}>Disallowed</th>
            <th onClick={() => headerClick('InsurancePaymentStatus.Description')}>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {sortedRows.map((row, idx) => (
            <tr key={row.Id ?? idx}>
              <td>{idx + 1}</td>
              <td>{formatDT(row.PaymentDate)}</td>
              <td>{row.PaymentIdentifier}</td>
              <td>{row.GuarantorName}</td>
              <td className="pl-3">{formatCurrency(row.ReceivedAmount)}</td>
              <td className="pl-3">{formatCurrency(row.TDSAmount)}</td>
              <td className="pl-3">{formatCurrency(row.Disallowed)}</td>
              <td>{row.InsurancePaymentStatus?.Description}</td>
              <td>
                {(row.InsurancePaymentStatusId === 1 || row.InsurancePaymentStatusId === 2 || row.InsurancePaymentStatusId === 3) && (
                  <span className="grid-action" onClick={() => dispatch('edit', { Id: row.Id })}>
                    <img className="drhms-edit-button" src="assets/svg/edit.svg" alt="" />
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
