/**
 * MediFlow Enterprise Design System — Design Tokens
 * Single source of truth for the HIMS React application visual language.
 *
 * Color palette: Vibrant Blue primary (#2563eb), dark slate sidebar (#0a0f1d),
 * clean white surfaces. Built for a modern enterprise healthcare platform.
 */

// ─────────────────────────────────────────────────────────────
// COLOR PALETTE
// ─────────────────────────────────────────────────────────────
export const colors = {
  // Brand — Primary Blue
  primary:       '#2563eb',
  primaryHover:  '#1d4ed8',
  primaryActive: '#1e40af',
  primaryLight:  '#eff6ff',
  primaryMid:    '#bfdbfe',

  // Brand — Accent Indigo
  accent:        '#4f46e5',
  accentHover:   '#4338ca',
  accentLight:   '#eef2ff',

  // Brand — Gold / Amber (secondary brand, used for highlights)
  gold:          '#d97706',
  goldHover:     '#b45309',
  goldLight:     '#fef3c7',

  // Sidebar & Shell
  sidebarBg:     '#0a0f1d',
  sidebarTop:    '#0a0f1d',
  sidebarBottom: '#1e293b',
  sidebarText:   'rgba(255,255,255,0.82)',
  sidebarMuted:  'rgba(255,255,255,0.45)',
  sidebarBorder: 'rgba(255,255,255,0.08)',
  sidebarActive: 'rgba(37,99,235,0.20)',
  sidebarActiveBar: '#2563eb',

  // Neutrals — Slate scale
  textMain:      '#0f172a',   // slate-900
  textBody:      '#1e293b',   // slate-800
  textMuted:     '#475569',   // slate-600
  textSubtle:    '#94a3b8',   // slate-400
  textDisabled:  '#cbd5e1',   // slate-300
  textInverse:   '#ffffff',

  border:        '#e2e8f0',   // slate-200
  borderStrong:  '#cbd5e1',   // slate-300
  borderFocus:   '#2563eb',

  surface:       '#ffffff',
  surfaceMuted:  '#f8fafc',   // slate-50
  surfaceSunken: '#f1f5f9',   // slate-100
  surfaceRaised: '#ffffff',

  overlay:       'rgba(15,23,42,0.5)',
  overlayLight:  'rgba(15,23,42,0.08)',

  // Semantic — Status colors
  success:       '#10b981',   // Emerald-500
  successHover:  '#059669',
  successBg:     '#ecfdf5',
  successBorder: '#a7f3d0',
  successText:   '#065f46',

  warning:       '#f59e0b',   // Amber-500
  warningHover:  '#d97706',
  warningBg:     '#fffbeb',
  warningBorder: '#fde68a',
  warningText:   '#92400e',

  danger:        '#ef4444',   // Red-500
  dangerHover:   '#dc2626',
  dangerBg:      '#fef2f2',
  dangerBorder:  '#fecaca',
  dangerText:    '#991b1b',

  info:          '#0ea5e9',   // Sky-500
  infoHover:     '#0284c7',
  infoBg:        '#f0f9ff',
  infoBorder:    '#bae6fd',
  infoText:      '#0c4a6e',

  neutral:       '#64748b',
  neutralBg:     '#f1f5f9',
  neutralBorder: '#e2e8f0',

  // Chart palette — 10 distinct colors
  chart: [
    '#2563eb', // Blue
    '#10b981', // Emerald
    '#f59e0b', // Amber
    '#ef4444', // Red
    '#8b5cf6', // Violet
    '#06b6d4', // Cyan
    '#ec4899', // Pink
    '#14b8a6', // Teal
    '#f97316', // Orange
    '#84cc16', // Lime
  ],
} as const;

// ─────────────────────────────────────────────────────────────
// TYPOGRAPHY
// ─────────────────────────────────────────────────────────────
export const typography = {
  // Font families
  fontFamily:     '"Inter", "Poppins", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  fontFamilyMono: 'ui-monospace, "JetBrains Mono", Consolas, "Courier New", monospace',

  // Scale
  display:        { fontSize: '30px', fontWeight: 800, lineHeight: 1.2,  letterSpacing: '-0.5px' },
  h1:             { fontSize: '24px', fontWeight: 700, lineHeight: 1.25, letterSpacing: '-0.3px' },
  h2:             { fontSize: '20px', fontWeight: 700, lineHeight: 1.3,  letterSpacing: '-0.2px' },
  h3:             { fontSize: '16px', fontWeight: 600, lineHeight: 1.35, letterSpacing: '-0.1px' },
  h4:             { fontSize: '14px', fontWeight: 600, lineHeight: 1.4  },
  pageTitle:      { fontSize: '22px', fontWeight: 700, lineHeight: 1.3  },
  sectionHeading: { fontSize: '15px', fontWeight: 600, lineHeight: 1.4  },
  body:           { fontSize: '13px', fontWeight: 400, lineHeight: 1.6  },
  bodyMd:         { fontSize: '14px', fontWeight: 400, lineHeight: 1.6  },
  label:          { fontSize: '12px', fontWeight: 600, lineHeight: 1.4,  letterSpacing: '0.05px' },
  labelSm:        { fontSize: '11px', fontWeight: 600, lineHeight: 1.4,  letterSpacing: '0.3px', textTransform: 'uppercase' as const },
  helper:         { fontSize: '12px', fontWeight: 400, lineHeight: 1.4  },
  caption:        { fontSize: '11px', fontWeight: 500, lineHeight: 1.3  },
  mono:           { fontSize: '12px', fontWeight: 400, lineHeight: 1.5, fontFamily: 'ui-monospace, Consolas, monospace' },
} as const;

// ─────────────────────────────────────────────────────────────
// SPACING (4px grid)
// ─────────────────────────────────────────────────────────────
export const spacing = {
  px:   '1px',
  0.5:  '2px',
  1:    '4px',
  xs:   '4px',    // 1
  2:    '8px',
  sm:   '8px',    // 2
  3:    '12px',
  md:   '12px',   // 3
  4:    '16px',
  lg:   '16px',   // 4
  5:    '20px',
  xl:   '24px',   // 6
  6:    '24px',
  xxl:  '32px',   // 8
  8:    '32px',
  10:   '40px',
  xxxl: '48px',   // 12
  12:   '48px',
  16:   '64px',
} as const;

// ─────────────────────────────────────────────────────────────
// BORDER RADIUS
// ─────────────────────────────────────────────────────────────
export const radii = {
  none:  '0px',
  xs:    '2px',
  sm:    '4px',
  md:    '8px',
  lg:    '12px',
  xl:    '16px',
  '2xl': '20px',
  '3xl': '24px',
  full:  '9999px',
} as const;

// ─────────────────────────────────────────────────────────────
// SHADOWS
// ─────────────────────────────────────────────────────────────
export const shadows = {
  none:   'none',
  xs:     '0 1px 2px rgba(15,23,42,0.04)',
  sm:     '0 1px 3px rgba(15,23,42,0.06), 0 1px 2px rgba(15,23,42,0.04)',
  md:     '0 4px 6px rgba(15,23,42,0.05), 0 2px 4px rgba(15,23,42,0.04)',
  lg:     '0 10px 15px rgba(15,23,42,0.06), 0 4px 6px rgba(15,23,42,0.04)',
  xl:     '0 20px 25px rgba(15,23,42,0.07), 0 10px 10px rgba(15,23,42,0.03)',
  '2xl':  '0 25px 50px rgba(15,23,42,0.12)',
  inner:  'inset 0 2px 4px rgba(15,23,42,0.05)',
  focus:  '0 0 0 3px rgba(37,99,235,0.22)',
  focusDanger:   '0 0 0 3px rgba(239,68,68,0.22)',
  focusSuccess:  '0 0 0 3px rgba(16,185,129,0.22)',
  card:   '0 1px 3px rgba(15,23,42,0.06), 0 1px 2px rgba(15,23,42,0.03)',
  cardHover: '0 8px 20px rgba(15,23,42,0.10), 0 2px 6px rgba(15,23,42,0.06)',
  sidebar: '4px 0 20px rgba(0,0,0,0.25)',
  navbar:  '0 1px 0 rgba(15,23,42,0.06)',
} as const;

// ─────────────────────────────────────────────────────────────
// TRANSITIONS
// ─────────────────────────────────────────────────────────────
export const transitions = {
  instant: 'all 0.05s linear',
  fast:    'all 0.12s cubic-bezier(0.4, 0, 0.2, 1)',
  base:    'all 0.18s cubic-bezier(0.4, 0, 0.2, 1)',
  slow:    'all 0.28s cubic-bezier(0.4, 0, 0.2, 1)',
  spring:  'all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
} as const;

// ─────────────────────────────────────────────────────────────
// Z-INDEX LADDER
// ─────────────────────────────────────────────────────────────
export const zIndex = {
  hide:     -1,
  auto:     'auto',
  base:     0,
  raised:   1,
  dropdown: 1000,
  sticky:   1010,
  overlay:  1020,
  drawer:   1025,
  modal:    1030,
  popover:  1040,
  toast:    1050,
  tooltip:  1060,
} as const;

// ─────────────────────────────────────────────────────────────
// BREAKPOINTS (px values for JS comparisons)
// ─────────────────────────────────────────────────────────────
export const breakpoints = {
  xs:  480,
  sm:  640,
  md:  768,
  lg:  1024,
  xl:  1280,
  '2xl': 1536,
} as const;

// ─────────────────────────────────────────────────────────────
// CONTROL SIZES (standard interactive element heights)
// ─────────────────────────────────────────────────────────────
export const controlHeight = {
  xs: '26px',
  sm: '32px',
  md: '36px',
  lg: '42px',
  xl: '48px',
} as const;

/** Default control height for single line inputs/selects */
export const controlHeightDefault = controlHeight.md;

// ─────────────────────────────────────────────────────────────
// SIDEBAR DIMENSIONS
// ─────────────────────────────────────────────────────────────
export const sidebar = {
  width:         '256px',
  collapsedWidth: '64px',
  topbarHeight:  '60px',
} as const;
