import React from 'react';

interface PatientFinanceFilterScreenProps {
  reactProps?: {
    currentfilter?: {
      FromDate?: any;
      ToDate?: any;
    };
  };
  onAction?: (actionName: string, payload?: any) => void;
}

function toInputDateString(val?: any): string {
  if (!val) return '';
  if (val instanceof Date) {
    if (isNaN(val.getTime())) return '';
    const y = val.getFullYear();
    const m = String(val.getMonth() + 1).padStart(2, '0');
    const d = String(val.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
  if (typeof val === 'string') {
    if (/^\d{4}-\d{2}-\d{2}/.test(val)) {
      return val.slice(0, 10);
    }
    const parsed = new Date(val);
    if (!isNaN(parsed.getTime())) {
      const y = parsed.getFullYear();
      const m = String(parsed.getMonth() + 1).padStart(2, '0');
      const d = String(parsed.getDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
    }
  }
  return '';
}

export const PatientFinanceFilterScreen: React.FC<PatientFinanceFilterScreenProps> = ({ reactProps, onAction }) => {
  const currentfilter = reactProps?.currentfilter || {};

  const dispatch = (actionName: string, payload?: any) => {
    onAction?.(actionName, payload);
  };

  const fromDateStr = toInputDateString(currentfilter.FromDate);
  const toDateStr = toInputDateString(currentfilter.ToDate);

  return (
    <div className="pf-filter-controls-row">
      {/* From Date */}
      <div className="pf-field-group">
        <label className="pf-field-label">
          <i className="fa-solid fa-calendar-days" aria-hidden="true" />
          <span>From Date</span>
        </label>
        <div className="pf-input-wrapper">
          <input
            type="date"
            className="pf-form-control"
            value={fromDateStr}
            onChange={(e) => dispatch('fromDateChange', { value: e.target.value })}
          />
        </div>
      </div>

      {/* To Date */}
      <div className="pf-field-group">
        <label className="pf-field-label">
          <i className="fa-solid fa-calendar-days" aria-hidden="true" />
          <span>To Date</span>
        </label>
        <div className="pf-input-wrapper">
          <input
            type="date"
            className="pf-form-control"
            value={toDateStr}
            onChange={(e) => dispatch('toDateChange', { value: e.target.value })}
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="pf-btn-actions-cell">
        <button
          type="button"
          className="pf-btn-primary"
          onClick={() => dispatch('refresh')}
          title="Refresh Ledger"
        >
          <i className="fa-solid fa-arrows-rotate" aria-hidden="true" />
          <span>Refresh</span>
        </button>
      </div>
    </div>
  );
};
