import React from 'react';
import { colors, radii, spacing, typography, transitions, shadows } from './tokens';

// ─────────────────────────────────────────────────────────────
// StatCard — Primary KPI metric card for all dashboards
// ─────────────────────────────────────────────────────────────
export interface StatCardProps {
  title: string;
  count?: number | string;
  icon: string;
  color: string;
  onClick?: () => void;
  trend?: { value: number; label?: string };
  subtitle?: string;
  badge?: string;
  style?: React.CSSProperties;
}

export const StatCard: React.FC<StatCardProps> = ({
  title, count, icon, color, onClick, trend, subtitle, badge, style,
}) => {
  const [hovered, setHovered] = React.useState(false);

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: colors.surface,
        borderRadius: radii.lg,
        border: `1px solid ${colors.border}`,
        padding: '20px',
        position: 'relative',
        overflow: 'hidden',
        cursor: onClick ? 'pointer' : 'default',
        transition: transitions.base,
        boxShadow: hovered ? shadows.cardHover : shadows.card,
        transform: hovered ? 'translateY(-3px)' : 'translateY(0)',
        ...style,
      }}
    >
      {/* Left accent bar */}
      <div style={{
        position: 'absolute', top: 0, left: 0, bottom: 0,
        width: '4px', backgroundColor: color, borderRadius: `${radii.lg} 0 0 ${radii.lg}`,
      }} />

      {/* Subtle background glow */}
      <div style={{
        position: 'absolute', top: -20, right: -20,
        width: '100px', height: '100px',
        backgroundColor: `${color}08`,
        borderRadius: radii.full,
        transition: transitions.base,
        opacity: hovered ? 1.5 : 1,
      }} />

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Top row: icon + badge */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.lg }}>
          <div style={{
            width: '44px', height: '44px', borderRadius: radii.md,
            backgroundColor: `${color}18`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '20px', color: color, flexShrink: 0,
          }}>
            <i className={`fa-solid ${icon}`} />
          </div>
          {badge && (
            <span style={{
              backgroundColor: `${color}15`, color,
              borderRadius: radii.full, padding: '2px 8px',
              fontSize: '11px', fontWeight: 600, fontFamily: typography.fontFamily,
            }}>
              {badge}
            </span>
          )}
        </div>

        {/* Count */}
        {count !== undefined && (
          <div style={{
            fontSize: '28px', fontWeight: 800, color: colors.textMain,
            lineHeight: 1.1, letterSpacing: '-0.5px', fontFamily: typography.fontFamily,
            marginBottom: '4px',
          }}>
            {count}
          </div>
        )}

        {/* Title */}
        <div style={{
          fontSize: '13px', fontWeight: 600, color: colors.textMuted,
          fontFamily: typography.fontFamily, marginBottom: trend || subtitle ? '8px' : 0,
        }}>
          {title}
        </div>

        {/* Subtitle */}
        {subtitle && (
          <div style={{ fontSize: '12px', color: colors.textSubtle, fontFamily: typography.fontFamily }}>
            {subtitle}
          </div>
        )}

        {/* Trend indicator */}
        {trend && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
            <i
              className={`fa-solid ${trend.value >= 0 ? 'fa-arrow-trend-up' : 'fa-arrow-trend-down'}`}
              style={{ fontSize: '11px', color: trend.value >= 0 ? colors.success : colors.danger }}
            />
            <span style={{
              fontSize: '11px', fontWeight: 600,
              color: trend.value >= 0 ? colors.success : colors.danger,
              fontFamily: typography.fontFamily,
            }}>
              {trend.value >= 0 ? '+' : ''}{trend.value}%
            </span>
            {trend.label && (
              <span style={{ fontSize: '11px', color: colors.textSubtle, fontFamily: typography.fontFamily }}>
                {trend.label}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Right chevron on hover (if clickable) */}
      {onClick && (
        <div style={{
          position: 'absolute', right: '16px', bottom: '16px',
          opacity: hovered ? 0.6 : 0, transition: transitions.base,
          color: color, fontSize: '14px',
        }}>
          <i className="fa-solid fa-arrow-right" />
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// ActionCard — Navigation shortcut card (icon + title + arrow)
// ─────────────────────────────────────────────────────────────
export interface ActionCardProps {
  title: string;
  icon: string;
  color: string;
  onClick?: () => void;
  description?: string;
  style?: React.CSSProperties;
}

export const ActionCard: React.FC<ActionCardProps> = ({
  title, icon, color, onClick, description, style,
}) => {
  const [hovered, setHovered] = React.useState(false);

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: colors.surface,
        borderRadius: radii.lg,
        border: `1px solid ${hovered ? color + '60' : colors.border}`,
        padding: '16px 18px',
        cursor: onClick ? 'pointer' : 'default',
        transition: transitions.base,
        boxShadow: hovered ? shadows.cardHover : shadows.card,
        transform: hovered ? 'translateY(-2px)' : 'translateY(0)',
        display: 'flex', alignItems: 'center', gap: '14px',
        ...style,
      }}
    >
      {/* Icon */}
      <div style={{
        width: '42px', height: '42px', borderRadius: radii.md,
        backgroundColor: `${color}15`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '18px', color: color, flexShrink: 0,
        transition: transitions.base,
      }}>
        <i className={`fa-solid ${icon}`} />
      </div>

      {/* Text */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: '14px', fontWeight: 600, color: colors.textMain,
          fontFamily: typography.fontFamily, marginBottom: description ? '2px' : 0,
        }}>
          {title}
        </div>
        {description && (
          <div style={{ fontSize: '12px', color: colors.textSubtle, fontFamily: typography.fontFamily }}>
            {description}
          </div>
        )}
      </div>

      {/* Arrow */}
      <i
        className="fa-solid fa-chevron-right"
        style={{
          fontSize: '12px', color: hovered ? color : colors.textSubtle,
          transition: transitions.fast, transform: hovered ? 'translateX(2px)' : 'translateX(0)',
        }}
      />
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// DashboardSection — Wrapper with heading for dashboard areas
// ─────────────────────────────────────────────────────────────
export interface DashboardSectionProps {
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  style?: React.CSSProperties;
}

export const DashboardSection: React.FC<DashboardSectionProps> = ({
  title, subtitle, action, children, style,
}) => (
  <div style={{ marginBottom: spacing.xxl, ...style }}>
    {(title || action) && (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: spacing.lg,
      }}>
        <div>
          {title && (
            <h3 style={{
              margin: 0, fontSize: '15px', fontWeight: 700,
              color: colors.textMain, fontFamily: typography.fontFamily,
            }}>
              {title}
            </h3>
          )}
          {subtitle && (
            <p style={{
              margin: '2px 0 0 0', fontSize: '12px',
              color: colors.textSubtle, fontFamily: typography.fontFamily,
            }}>
              {subtitle}
            </p>
          )}
        </div>
        {action && <div>{action}</div>}
      </div>
    )}
    {children}
  </div>
);

// ─────────────────────────────────────────────────────────────
// DashboardPageWrapper — Standard page shell for all dashboards
// ─────────────────────────────────────────────────────────────
export interface DashboardPageWrapperProps {
  title: string;
  subtitle?: string;
  headerAction?: React.ReactNode;
  children: React.ReactNode;
}

export const DashboardPageWrapper: React.FC<DashboardPageWrapperProps> = ({
  title, subtitle, headerAction, children,
}) => (
  <div style={{
    padding: '24px 28px',
    backgroundColor: colors.surfaceMuted,
    minHeight: '100vh',
    fontFamily: typography.fontFamily,
  }}>
    {/* Page Header */}
    <div style={{
      display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
      marginBottom: '28px',
    }}>
      <div>
        <h1 style={{
          margin: 0, fontSize: '22px', fontWeight: 800,
          color: colors.textMain, letterSpacing: '-0.3px',
          fontFamily: typography.fontFamily,
        }}>
          {title}
        </h1>
        {subtitle && (
          <p style={{
            margin: '4px 0 0 0', fontSize: '13px',
            color: colors.textSubtle, fontFamily: typography.fontFamily,
          }}>
            {subtitle}
          </p>
        )}
      </div>
      {headerAction && <div style={{ flexShrink: 0 }}>{headerAction}</div>}
    </div>
    {children}
  </div>
);
