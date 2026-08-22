import React from 'react';
import { colors, radii, typography } from './tokens';

export interface AvatarProps {
  name?: string;
  src?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  tone?: 'blue' | 'green' | 'red' | 'amber' | 'purple' | 'teal' | 'auto';
  shape?: 'circle' | 'square';
  online?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

const sizePx: Record<NonNullable<AvatarProps['size']>, number> = {
  xs: 24, sm: 32, md: 40, lg: 48, xl: 56,
};

const fontSizePx: Record<NonNullable<AvatarProps['size']>, string> = {
  xs: '9px', sm: '12px', md: '14px', lg: '16px', xl: '20px',
};

const toneColors: Record<string, { bg: string; text: string }> = {
  blue:   { bg: colors.primaryLight, text: colors.primary },
  green:  { bg: colors.successBg, text: colors.success },
  red:    { bg: colors.dangerBg, text: colors.danger },
  amber:  { bg: colors.goldLight, text: colors.gold },
  purple: { bg: '#f3e8ff', text: '#7c3aed' },
  teal:   { bg: colors.infoBg, text: colors.info },
};

const autoTones = ['blue', 'green', 'amber', 'purple', 'teal', 'red'];

function getAutoTone(name: string): { bg: string; text: string } {
  const idx = (name.charCodeAt(0) + (name.charCodeAt(1) || 0)) % autoTones.length;
  return toneColors[autoTones[idx]];
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export const Avatar: React.FC<AvatarProps> = ({
  name = '',
  src,
  size = 'md',
  tone = 'auto',
  shape = 'circle',
  online,
  style,
}) => {
  const dim = sizePx[size];
  const fontSz = fontSizePx[size];
  const borderRad = shape === 'circle' ? radii.full : radii.md;
  const colorSet = tone === 'auto' ? getAutoTone(name || 'A') : (toneColors[tone] || toneColors.blue);

  return (
    <span style={{ position: 'relative', display: 'inline-flex', flexShrink: 0, ...style }}>
      {src ? (
        <img
          src={src}
          alt={name}
          style={{ width: dim, height: dim, borderRadius: borderRad, objectFit: 'cover', display: 'block' }}
        />
      ) : (
        <span
          style={{
            width: dim, height: dim, borderRadius: borderRad,
            backgroundColor: colorSet.bg, color: colorSet.text,
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            fontSize: fontSz, fontWeight: 700, letterSpacing: '0.3px',
            fontFamily: typography.fontFamily, userSelect: 'none', flexShrink: 0,
          }}
          aria-label={name}
        >
          {name ? getInitials(name) : '?'}
        </span>
      )}
      {online !== undefined && (
        <span
          style={{
            position: 'absolute', bottom: shape === 'circle' ? '1px' : '-2px', right: shape === 'circle' ? '1px' : '-2px',
            width: dim > 40 ? '11px' : '8px', height: dim > 40 ? '11px' : '8px',
            borderRadius: radii.full,
            backgroundColor: online ? colors.success : colors.textSubtle,
            border: '2px solid white',
          }}
        />
      )}
    </span>
  );
};
