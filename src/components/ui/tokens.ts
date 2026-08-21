/**
 * Global design tokens for the HIMS React application.
 *
 * This is the single source of truth for the "premium" enterprise-healthcare
 * visual language already partially established in src/App.css (see the
 * `--premium-*` CSS custom properties there, already consumed by Button.tsx,
 * SidebarComponent.tsx, TopNavbarComponent.tsx, the address controls, and the
 * dashboard components). This file formalizes and extends that same palette
 * as plain TS constants, because the codebase's established styling pattern
 * is inline `style={{...}}` objects (no Tailwind/CSS-modules/styled-components
 * dependency exists in package.json) -- components import these constants
 * directly rather than depending on the CSS cascade.
 *
 * Values here are additive to src/App.css's :root block, not a competing
 * palette -- the primary blue/gold hues match exactly so already-modernized
 * pieces (Sidebar, TopNavbar, Button) and newly-built components read as one
 * consistent system.
 */

export const colors = {
  // Brand
  primary: '#00005c',
  primaryHover: '#1a0070',
  primaryLight: '#f5f6ff',
  gold: '#ebb200',
  goldHover: '#c49400',

  // Neutrals
  textMain: '#1e293b',
  textMuted: '#64748b',
  textSubtle: '#94a3b8',
  border: '#e2e8f0',
  borderStrong: '#cbd5e1',
  surface: '#ffffff',
  surfaceMuted: '#f8fafc',
  surfaceSunken: '#f1f5f9',

  // Semantic status (used by StatusBadge and form validation states --
  // these map to REAL statuses already present in the app's data, e.g.
  // Active/Inactive/Pending/Approved/Rejected/Paid/Unpaid, not invented ones)
  success: '#10b981',
  successBg: '#ecfdf5',
  successBorder: '#a7f3d0',
  warning: '#f59e0b',
  warningBg: '#fffbeb',
  warningBorder: '#fde68a',
  danger: '#ef4444',
  dangerBg: '#fef2f2',
  dangerBorder: '#fecaca',
  info: '#0ea5e9',
  infoBg: '#f0f9ff',
  infoBorder: '#bae6fd',
  neutral: '#64748b',
  neutralBg: '#f1f5f9',
  neutralBorder: '#e2e8f0',
} as const;

export const typography = {
  fontFamily: 'var(--font-modern, "Poppins", "Inter", sans-serif)',
  fontFamilyMono: 'ui-monospace, Consolas, monospace',

  // Scale: page title -> section heading -> label -> body -> helper/caption
  pageTitle: { fontSize: '22px', fontWeight: 700, lineHeight: 1.3 },
  sectionHeading: { fontSize: '16px', fontWeight: 700, lineHeight: 1.35 },
  label: { fontSize: '13px', fontWeight: 600, lineHeight: 1.4 },
  body: { fontSize: '13px', fontWeight: 400, lineHeight: 1.5 },
  helper: { fontSize: '12px', fontWeight: 400, lineHeight: 1.4 },
  caption: { fontSize: '11px', fontWeight: 500, lineHeight: 1.3 },
} as const;

export const spacing = {
  xs: '4px',
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '24px',
  xxl: '32px',
  xxxl: '48px',
} as const;

export const radii = {
  sm: '4px',
  md: '8px',
  lg: '12px',
  xl: '16px',
  full: '9999px',
} as const;

export const shadows = {
  sm: '0 1px 3px rgba(0,0,0,0.05)',
  md: '0 4px 12px rgba(0,0,0,0.08)',
  lg: '0 12px 24px rgba(0,0,0,0.12)',
  focus: '0 0 0 3px rgba(0, 0, 92, 0.15)',
} as const;

export const transitions = {
  fast: 'all 0.15s cubic-bezier(0.4, 0, 0.2, 1)',
  base: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
} as const;

export const breakpoints = {
  mobile: 640,
  tablet: 1024,
  desktop: 1280,
} as const;

export const zIndex = {
  dropdown: 1000,
  sticky: 1010,
  overlay: 1020,
  modal: 1030,
  toast: 1040,
  tooltip: 1050,
} as const;

/** Standard control height used across Input/Select/DatePicker/Button-md so a form row always lines up. */
export const controlHeight = '36px';
