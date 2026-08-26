import React from 'react';

interface PaymodeChangeFilterScreenProps {
  part: 'dates' | 'filterfield' | 'fetch';
  filterFieldKey?: 'BillNo' | 'ReceiptNumber';
  filterFieldLabel?: string;
  autoRefetch?: boolean;
  reactProps?: {
    currentfilter?: {
      FromBillDate?: string;
      ToBillDate?: string;
      BillNo?: string;
      ReceiptNumber?: string;
    };
  };
  onAction?: (actionName: string, payload?: any) => void;
}

function toInputValue(value?: string): string {
  if (!value) return '';
  const d = new Date(value);
  if (isNaN(d.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

// React bridge migration, shared across the three near-identical
// payment-mode-change list screens (oppaymodechange, pharpaymodechange,
// advreptpaymodechange -- OP / Pharmacy / Advance-receipt variants of the
// same copy-pasted controller/template pair). Each is HYBRID because of
// the live <patientsearch> widget between the filter field and the Fetch
// button (untouched, kept native in each screen's own .html). This
// component covers the 3 non-widget filter parts:
//   'dates'       - From/To bill-date pickers. None of the three variants
//                   auto-refetch on date change -- only the Fetch button
//                   (and pharm's extra auto-refetch triggers below) call
//                   getPaymentDetailList()/getList().
//   'filterfield' - the single text filter field, which differs by
//                   variant: BillNo (op, pharm) or ReceiptNumber (advrept,
//                   which also drops the Bill Number results column
//                   entirely -- see PaymodeChangeListScreen). Only the
//                   pharm variant auto-refetches on change
//                   (autoRefetch=true, matching its original
//                   ng-change="getPaymentDetailList()"); op/advrept do not.
//   'fetch'       - the Fetch button, calling getList() in every variant.
export const PaymodeChangeFilterScreen: React.FC<PaymodeChangeFilterScreenProps> = ({
  part,
  filterFieldKey = 'BillNo',
  filterFieldLabel = 'Bill Number',
  autoRefetch = false,
  reactProps,
  onAction,
}) => {
  const currentfilter = reactProps?.currentfilter || {};

  const dispatch = (actionName: string, payload?: any) => {
    onAction?.(actionName, payload);
  };

  if (part === 'dates') {
    return (
      <>
        <div className="col-sm-2">
          <label className="col-sm-12">From Date</label>
          <div className="col-sm-12">
            <input
              type="datetime-local"
              className="form-control"
              value={toInputValue(currentfilter.FromBillDate)}
              onChange={(e) => dispatch('fromBillDateChange', { value: e.target.value })}
            />
          </div>
        </div>
        <div className="col-sm-2">
          <label className="col-sm-12">To Date</label>
          <div className="col-sm-12">
            <input
              type="datetime-local"
              className="form-control"
              value={toInputValue(currentfilter.ToBillDate)}
              onChange={(e) => dispatch('toBillDateChange', { value: e.target.value })}
            />
          </div>
        </div>
      </>
    );
  }

  if (part === 'filterfield') {
    return (
      <div className="col-sm-2">
        <label className="col-sm-12">{filterFieldLabel}</label>
        <div className="col-sm-12">
          <input
            type="text"
            className="form-control"
            value={(currentfilter as any)[filterFieldKey] ?? ''}
            onChange={(e) => dispatch('filterFieldChange', { key: filterFieldKey, value: e.target.value, autoRefetch })}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="col-sm-2">
      <div className="col-sm-12">
        <button className="draftbutton" onClick={() => dispatch('fetch')}>
          <span>Fetch</span>
        </button>
      </div>
    </div>
  );
};
