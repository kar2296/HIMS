import React from 'react';
import { colors, radii } from './tokens';

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: string;
  className?: string;
  style?: React.CSSProperties;
}

/** Single shimmer block */
export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = '16px',
  borderRadius,
  style,
}) => (
  <div
    className="hims-skeleton"
    style={{
      width,
      height,
      borderRadius: borderRadius || radii.sm,
      flexShrink: 0,
      ...style,
    }}
  />
);

/** Full-row skeleton mimicking a table row */
export const TableRowSkeleton: React.FC<{ cols?: number }> = ({ cols = 5 }) => (
  <tr style={{ borderBottom: `1px solid ${colors.border}` }}>
    {Array.from({ length: cols }).map((_, i) => (
      <td key={i} style={{ padding: '10px 12px' }}>
        <Skeleton height="14px" width={i === 0 ? '70%' : i % 3 === 0 ? '45%' : '60%'} />
      </td>
    ))}
  </tr>
);

/** Skeleton for a KPI metric card */
export const StatCardSkeleton: React.FC = () => (
  <div style={{
    background: colors.surface,
    borderRadius: radii.lg,
    border: `1px solid ${colors.border}`,
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <Skeleton width="40px" height="40px" borderRadius={radii.md} />
      <Skeleton width="60px" height="24px" borderRadius={radii.full} />
    </div>
    <Skeleton width="80px" height="28px" />
    <Skeleton width="60%" height="14px" />
  </div>
);

/** Skeleton for a data card / panel */
export const CardSkeleton: React.FC<{ rows?: number }> = ({ rows = 4 }) => (
  <div style={{
    background: colors.surface,
    borderRadius: radii.lg,
    border: `1px solid ${colors.border}`,
    padding: '20px',
  }}>
    <Skeleton width="140px" height="18px" style={{ marginBottom: '16px' }} />
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <Skeleton width="32px" height="32px" borderRadius={radii.full} />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <Skeleton height="12px" width={`${60 + Math.random() * 30}%`} />
            <Skeleton height="10px" width={`${40 + Math.random() * 20}%`} />
          </div>
        </div>
      ))}
    </div>
  </div>
);

/** Skeleton for a full table section */
export const TableSkeleton: React.FC<{ cols?: number; rows?: number }> = ({
  cols = 5,
  rows = 8,
}) => (
  <div style={{
    border: `1px solid ${colors.border}`,
    borderRadius: radii.lg,
    overflow: 'hidden',
    background: colors.surface,
  }}>
    {/* Header */}
    <div style={{
      background: colors.surfaceMuted,
      padding: '10px 12px',
      display: 'grid',
      gridTemplateColumns: `repeat(${cols}, 1fr)`,
      gap: '12px',
      borderBottom: `1px solid ${colors.border}`,
    }}>
      {Array.from({ length: cols }).map((_, i) => (
        <Skeleton key={i} height="12px" width={i === 0 ? '60%' : '50%'} />
      ))}
    </div>
    {/* Rows */}
    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
      <tbody>
        {Array.from({ length: rows }).map((_, i) => (
          <TableRowSkeleton key={i} cols={cols} />
        ))}
      </tbody>
    </table>
  </div>
);
