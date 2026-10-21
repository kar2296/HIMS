import React from 'react';
import { colors, radii, spacing, typography, transitions } from '../components/ui/tokens';

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

function toDateInputValue(value?: string | Date | null): string {
  if (!value) return '';
  if (typeof value === 'string') {
    const match = value.match(/^\d{4}-\d{2}-\d{2}/);
    if (match) return match[0];
  }
  const d = new Date(value);
  if (isNaN(d.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

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

  const labelStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    fontSize: '11.5px',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
    color: '#475569',
    marginBottom: 6,
    fontFamily: typography.fontFamily,
    userSelect: 'none',
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    height: 38,
    borderRadius: radii.md,
    border: '1.5px solid #cbd5e1',
    backgroundColor: '#ffffff',
    fontSize: '13px',
    fontFamily: typography.fontFamily,
    color: '#0f172a',
    padding: '0 12px',
    boxSizing: 'border-box',
    outline: 'none',
    transition: transitions.default,
  };

  if (part === 'dates') {
    return (
      <div style={{
        display: 'contents',
      }}>
        {/* From Date */}
        <div style={{ flex: '1 1 180px', minWidth: 170 }}>
          <label style={labelStyle}>
            <i className="fa-regular fa-calendar" style={{ color: '#2563eb', fontSize: 12, marginRight: 6 }} />
            <span>From Date</span>
          </label>
          <input
            type="date"
            style={inputStyle}
            value={toDateInputValue(currentfilter.FromBillDate)}
            onChange={(e) => dispatch('fromBillDateChange', { value: e.target.value })}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                dispatch('fetch');
              }
            }}
            onFocus={(e) => (e.target.style.borderColor = '#2563eb')}
            onBlur={(e) => (e.target.style.borderColor = '#cbd5e1')}
          />
        </div>

        {/* To Date */}
        <div style={{ flex: '1 1 180px', minWidth: 170 }}>
          <label style={labelStyle}>
            <i className="fa-regular fa-calendar-check" style={{ color: '#2563eb', fontSize: 12, marginRight: 6 }} />
            <span>To Date</span>
          </label>
          <input
            type="date"
            style={inputStyle}
            value={toDateInputValue(currentfilter.ToBillDate)}
            onChange={(e) => dispatch('toBillDateChange', { value: e.target.value })}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                dispatch('fetch');
              }
            }}
            onFocus={(e) => (e.target.style.borderColor = '#2563eb')}
            onBlur={(e) => (e.target.style.borderColor = '#cbd5e1')}
          />
        </div>
      </div>
    );
  }

  if (part === 'filterfield') {
    const isReceipt = filterFieldKey === 'ReceiptNumber';
    const iconClass = isReceipt ? 'fa-solid fa-receipt' : 'fa-solid fa-file-invoice';
    const placeholder = isReceipt ? 'e.g. REC24-25/...' : 'e.g. BILL...';

    return (
      <div style={{ flex: '1 1 180px', minWidth: 170 }}>
        <label style={labelStyle}>
          <i className={iconClass} style={{ color: '#2563eb', fontSize: 12, marginRight: 6 }} />
          <span>{filterFieldLabel}</span>
        </label>
        <div style={{ position: 'relative', width: '100%' }}>
          <i
            className={iconClass}
            style={{
              position: 'absolute',
              left: 12,
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#94a3b8',
              fontSize: 12,
              pointerEvents: 'none',
            }}
          />
          <input
            type="text"
            placeholder={placeholder}
            style={{
              ...inputStyle,
              paddingLeft: 34,
            }}
            value={(currentfilter as any)[filterFieldKey] ?? ''}
            onChange={(e) => dispatch('filterFieldChange', { key: filterFieldKey, value: e.target.value, autoRefetch })}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                dispatch('fetch');
              }
            }}
            onFocus={(e) => (e.target.style.borderColor = '#2563eb')}
            onBlur={(e) => (e.target.style.borderColor = '#cbd5e1')}
          />
        </div>
      </div>
    );
  }

  return (
    <div style={{ flex: '0 0 auto', alignSelf: 'flex-end' }}>
      <button
        type="button"
        onClick={() => dispatch('fetch')}
        style={{
          height: 38,
          borderRadius: radii.md,
          border: 'none',
          background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
          color: '#ffffff',
          fontFamily: typography.fontFamily,
          fontSize: '13px',
          fontWeight: 600,
          padding: '0 20px',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          cursor: 'pointer',
          boxShadow: '0 2px 6px rgba(37, 99, 235, 0.28)',
          transition: transitions.default,
          userSelect: 'none',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-1px)';
          e.currentTarget.style.boxShadow = '0 4px 10px rgba(37, 99, 235, 0.35)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 2px 6px rgba(37, 99, 235, 0.28)';
        }}
      >
        <i className="fa-solid fa-magnifying-glass" style={{ fontSize: 13 }} />
        <span>Fetch Records</span>
      </button>
    </div>
  );
};
