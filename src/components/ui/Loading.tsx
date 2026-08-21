import React from 'react';
import { colors, spacing, typography, radii } from './tokens';

export interface LoadingProps {
  text?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const Loading: React.FC<LoadingProps> = ({ text = 'Loading...', size = 'md' }) => {
  const fontSize = size === 'sm' ? '16px' : size === 'lg' ? '28px' : '20px';
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, padding: spacing.xl, color: colors.textMuted }}>
      <i className="fa-solid fa-circle-notch fa-spin" style={{ fontSize, color: colors.primary }} />
      {text && <span style={{ ...typography.helper, fontFamily: typography.fontFamily }}>{text}</span>}
    </div>
  );
};

export interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  rounded?: boolean;
  style?: React.CSSProperties;
}

/** Simple shimmering placeholder block for loading states -- CSS-only, no dependency. */
export const Skeleton: React.FC<SkeletonProps> = ({ width = '100%', height = 16, rounded, style }) => (
  <span
    style={{
      display: 'inline-block', width, height, borderRadius: rounded ? radii.full : radii.sm,
      background: `linear-gradient(90deg, ${colors.surfaceSunken} 25%, ${colors.border} 37%, ${colors.surfaceSunken} 63%)`,
      backgroundSize: '400% 100%', animation: 'hims-skeleton-shimmer 1.4s ease infinite',
      ...style,
    }}
  >
    <style>{`@keyframes hims-skeleton-shimmer { 0% { background-position: 100% 50%; } 100% { background-position: 0 50%; } }`}</style>
  </span>
);

export const SkeletonRows: React.FC<{ rows?: number; columns?: number }> = ({ rows = 4, columns = 4 }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.md, padding: spacing.lg }}>
    {Array.from({ length: rows }).map((_, r) => (
      <div key={r} style={{ display: 'flex', gap: spacing.lg }}>
        {Array.from({ length: columns }).map((_, c) => (
          <Skeleton key={c} height={14} />
        ))}
      </div>
    ))}
  </div>
);
