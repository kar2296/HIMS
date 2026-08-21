import React from 'react';
import { colors, radii, spacing, typography } from './tokens';

export interface PaginationProps {
  currentPage: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

/**
 * Global pager for screens with real server-side pagination (formalizes the
 * pattern already used for patientguarantor-list's uib-pagination). Only
 * emits the new page number -- the caller's existing fetch function (already
 * wired to the real paginated API) decides what happens next.
 */
export const Pagination: React.FC<PaginationProps> = ({ currentPage, totalItems, pageSize, onPageChange }) => {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  if (totalPages <= 1) return null;

  const pages: (number | '...')[] = [];
  const window = 1;
  for (let p = 1; p <= totalPages; p++) {
    if (p === 1 || p === totalPages || (p >= currentPage - window && p <= currentPage + window)) {
      pages.push(p);
    } else if (pages[pages.length - 1] !== '...') {
      pages.push('...');
    }
  }

  const btnStyle = (active: boolean, disabled?: boolean): React.CSSProperties => ({
    minWidth: 32, height: 32, padding: '0 8px', borderRadius: radii.sm,
    border: `1px solid ${active ? colors.primary : colors.border}`,
    backgroundColor: active ? colors.primary : colors.surface,
    color: active ? '#fff' : disabled ? colors.textSubtle : colors.textMain,
    fontSize: '13px', fontFamily: typography.fontFamily, fontWeight: active ? 700 : 500,
    cursor: disabled ? 'default' : 'pointer', opacity: disabled ? 0.5 : 1,
  });

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: spacing.xs, marginTop: spacing.lg, flexWrap: 'wrap' }}>
      <button type="button" disabled={currentPage <= 1} onClick={() => onPageChange(currentPage - 1)} style={btnStyle(false, currentPage <= 1)}>
        <i className="fa-solid fa-chevron-left" style={{ fontSize: '10px' }} />
      </button>
      {pages.map((p, idx) =>
        p === '...' ? (
          <span key={`ellipsis-${idx}`} style={{ padding: '0 4px', color: colors.textSubtle, fontSize: '13px' }}>…</span>
        ) : (
          <button key={p} type="button" onClick={() => onPageChange(p)} style={btnStyle(p === currentPage)}>{p}</button>
        )
      )}
      <button type="button" disabled={currentPage >= totalPages} onClick={() => onPageChange(currentPage + 1)} style={btnStyle(false, currentPage >= totalPages)}>
        <i className="fa-solid fa-chevron-right" style={{ fontSize: '10px' }} />
      </button>
    </div>
  );
};
