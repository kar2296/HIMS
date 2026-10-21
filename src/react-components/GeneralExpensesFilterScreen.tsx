import React from 'react';

interface LookupItem {
  Id: number;
  Text: string;
}

interface GeneralExpensesFilterScreenProps {
  part: 'addbutton' | 'filters';
  reactProps?: {
    currentfilter?: {
      FromDate?: string;
      ToDate?: string;
      PaymentTypeId?: number;
      GeneralExpenseStatusId?: number;
    };
    lookup?: { PaymentType?: LookupItem[]; GeneralExpenseStatus?: LookupItem[] };
  };
  onAction?: (actionName: string, payload?: any) => void;
}

// React bridge migration, part of the HYBRID generalexpenses-list split
// (see GeneralExpensesListScreen.tsx / generalexpenses-list.js for the
// full disclosure). 'addbutton' renders just the Add-new button, kept as
// its own tiny mount so the live <autosearch> user-filter widget (native,
// untouched) can sit between it and the static translated title in the
// same original row. 'filters' renders the From/To date, Payment Mode,
// and Status selects (all auto-refetching on change, matching the
// original's ng-change="getList()" on every field here).
const toDateInputString = (dateVal: any): string => {
  if (!dateVal) return '';
  if (typeof dateVal === 'string') return dateVal.slice(0, 10);
  if (dateVal instanceof Date && !isNaN(dateVal.getTime())) {
    const y = dateVal.getFullYear();
    const m = String(dateVal.getMonth() + 1).padStart(2, '0');
    const d = String(dateVal.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
  return '';
};

export const GeneralExpensesFilterScreen: React.FC<GeneralExpensesFilterScreenProps> = ({ part, reactProps, onAction }) => {
  const currentfilter = reactProps?.currentfilter || {};
  const lookup = reactProps?.lookup || {};

  const dispatch = (actionName: string, payload?: any) => {
    onAction?.(actionName, payload);
  };

  if (part === 'addbutton') {
    return (
      <button
        type="button"
        id="btnAddNewExpense"
        onClick={() => dispatch('addNew')}
        style={{
          height: '38px',
          padding: '0 18px',
          background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
          color: '#ffffff',
          border: 'none',
          borderRadius: '8px',
          fontWeight: 600,
          fontSize: '13px',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          cursor: 'pointer',
          boxShadow: '0 2px 6px rgba(37, 99, 235, 0.25)',
          whiteSpace: 'nowrap',
          transition: 'all 0.15s ease'
        }}
      >
        <i className="fa-solid fa-plus" style={{ fontSize: '12px' }}></i>
        <span>New Voucher</span>
      </button>
    );
  }

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '14px',
        width: '100%',
        alignItems: 'flex-end',
        boxSizing: 'border-box'
      }}
    >
      {/* From Date */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
        <label
          style={{
            fontSize: '11.5px',
            fontWeight: 600,
            color: '#475569',
            textTransform: 'uppercase',
            letterSpacing: '0.03em',
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '5px'
          }}
        >
          <i className="fa-regular fa-calendar" style={{ color: '#2563eb', fontSize: '11.5px' }}></i>
          <span>From Date</span>
        </label>
        <input
          type="date"
          className="form-control"
          value={toDateInputString(currentfilter.FromDate)}
          onChange={(e) => dispatch('fromDateChange', { value: e.target.value })}
          style={{
            height: '38px',
            borderRadius: '8px',
            border: '1.5px solid #cbd5e1',
            padding: '0 12px',
            fontSize: '13px',
            color: '#0f172a',
            background: '#ffffff',
            boxSizing: 'border-box',
            outline: 'none'
          }}
        />
      </div>

      {/* To Date */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
        <label
          style={{
            fontSize: '11.5px',
            fontWeight: 600,
            color: '#475569',
            textTransform: 'uppercase',
            letterSpacing: '0.03em',
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '5px'
          }}
        >
          <i className="fa-regular fa-calendar-check" style={{ color: '#2563eb', fontSize: '11.5px' }}></i>
          <span>To Date</span>
        </label>
        <input
          type="date"
          className="form-control"
          value={toDateInputString(currentfilter.ToDate)}
          onChange={(e) => dispatch('toDateChange', { value: e.target.value })}
          style={{
            height: '38px',
            borderRadius: '8px',
            border: '1.5px solid #cbd5e1',
            padding: '0 12px',
            fontSize: '13px',
            color: '#0f172a',
            background: '#ffffff',
            boxSizing: 'border-box',
            outline: 'none'
          }}
        />
      </div>

      {/* Payment Mode */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
        <label
          style={{
            fontSize: '11.5px',
            fontWeight: 600,
            color: '#475569',
            textTransform: 'uppercase',
            letterSpacing: '0.03em',
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '5px'
          }}
        >
          <i className="fa-solid fa-wallet" style={{ color: '#2563eb', fontSize: '11.5px' }}></i>
          <span>Payment Mode</span>
        </label>
        <select
          className="form-control"
          value={currentfilter.PaymentTypeId ?? ''}
          onChange={(e) => dispatch('paymentTypeChange', { value: Number(e.target.value) })}
          style={{
            height: '38px',
            borderRadius: '8px',
            border: '1.5px solid #cbd5e1',
            padding: '0 12px',
            fontSize: '13px',
            color: '#0f172a',
            background: '#ffffff',
            boxSizing: 'border-box',
            outline: 'none'
          }}
        >
          {(lookup.PaymentType || []).map((opt) => (
            <option key={opt.Id} value={opt.Id}>{opt.Text}</option>
          ))}
        </select>
      </div>

      {/* Status */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
        <label
          style={{
            fontSize: '11.5px',
            fontWeight: 600,
            color: '#475569',
            textTransform: 'uppercase',
            letterSpacing: '0.03em',
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '5px'
          }}
        >
          <i className="fa-solid fa-tag" style={{ color: '#2563eb', fontSize: '11.5px' }}></i>
          <span>Status</span>
        </label>
        <select
          className="form-control"
          value={currentfilter.GeneralExpenseStatusId ?? ''}
          onChange={(e) => dispatch('statusChange', { value: Number(e.target.value) })}
          style={{
            height: '38px',
            borderRadius: '8px',
            border: '1.5px solid #cbd5e1',
            padding: '0 12px',
            fontSize: '13px',
            color: '#0f172a',
            background: '#ffffff',
            boxSizing: 'border-box',
            outline: 'none'
          }}
        >
          {(lookup.GeneralExpenseStatus || []).map((opt) => (
            <option key={opt.Id} value={opt.Id}>{opt.Text}</option>
          ))}
        </select>
      </div>
    </div>
  );
};
