import React from 'react';
import { colors, spacing, typography } from './tokens';

export interface BreadcrumbItem {
  label: string;
  onClick?: () => void;
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

/** Global breadcrumb trail. `onClick` on non-last items should dispatch the
 * screen's own real navigation ($state.go/backTolist/etc.) -- purely a
 * presentational wrapper. */
export const Breadcrumb: React.FC<BreadcrumbProps> = ({ items }) => (
  <nav style={{ display: 'flex', alignItems: 'center', gap: spacing.xs, marginBottom: spacing.sm, flexWrap: 'wrap' }}>
    {items.map((item, idx) => {
      const isLast = idx === items.length - 1;
      return (
        <React.Fragment key={idx}>
          {idx > 0 && <i className="fa-solid fa-chevron-right" style={{ fontSize: '9px', color: colors.textSubtle }} />}
          {isLast || !item.onClick ? (
            <span style={{ ...typography.caption, color: isLast ? colors.textMain : colors.textSubtle, fontWeight: isLast ? 700 : 500, fontFamily: typography.fontFamily }}>
              {item.label}
            </span>
          ) : (
            <span
              onClick={item.onClick}
              style={{ ...typography.caption, color: colors.textMuted, cursor: 'pointer', fontFamily: typography.fontFamily }}
              onMouseEnter={(e) => (e.currentTarget.style.color = colors.primary)}
              onMouseLeave={(e) => (e.currentTarget.style.color = colors.textMuted)}
            >
              {item.label}
            </span>
          )}
        </React.Fragment>
      );
    })}
  </nav>
);

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumb?: BreadcrumbItem[];
  actions?: React.ReactNode;
}

/** Global page-header block: breadcrumb + title + right-aligned page actions.
 * Every migrated screen's header should converge on this one layout. */
export const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle, breadcrumb, actions }) => (
  <div style={{ marginBottom: spacing.lg }}>
    {breadcrumb && <Breadcrumb items={breadcrumb} />}
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: spacing.md, flexWrap: 'wrap' }}>
      <div>
        <h1 style={{ ...typography.pageTitle, color: colors.textMain, margin: 0, fontFamily: typography.fontFamily }}>{title}</h1>
        {subtitle && <p style={{ ...typography.helper, color: colors.textMuted, margin: `${spacing.xs} 0 0` }}>{subtitle}</p>}
      </div>
      {actions && <div style={{ display: 'flex', gap: spacing.sm, alignItems: 'center' }}>{actions}</div>}
    </div>
  </div>
);
