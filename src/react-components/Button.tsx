import React, { forwardRef, useState } from 'react';

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'danger'
  | 'warning'
  | 'success'
  | 'info'
  | 'dark'
  | 'light'
  | 'outline'
  | 'outline-primary'
  | 'outline-secondary'
  | 'outline-danger'
  | 'outline-success'
  | 'glass'
  | 'icon'
  | 'link';

export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  children?: React.ReactNode;
  text?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: string;
  iconPosition?: 'left' | 'right';
  disabled?: boolean;
  loading?: boolean;
  loadingText?: string;
  title?: string;
  style?: React.CSSProperties;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  badgeCount?: number;
  fullWidth?: boolean;
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'full';
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(({
  onClick,
  children,
  text,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  disabled = false,
  loading = false,
  loadingText,
  title,
  style,
  className = '',
  type = 'button',
  badgeCount,
  fullWidth = false,
  rounded = 'md',
  ...restProps
}, ref) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isActive, setIsActive] = useState(false);

  const isActuallyDisabled = disabled || loading;

  // Sizing definitions
  let padding = '8px 16px';
  let fontSize = '13px';
  let minHeight = '36px';
  let iconSize = '14px';

  switch (size) {
    case 'xs':
      padding = '3px 8px';
      fontSize = '11px';
      minHeight = '26px';
      iconSize = '11px';
      break;
    case 'sm':
      padding = '5px 12px';
      fontSize = '12px';
      minHeight = '32px';
      iconSize = '12px';
      break;
    case 'lg':
      padding = '10px 22px';
      fontSize = '15px';
      minHeight = '44px';
      iconSize = '16px';
      break;
    case 'xl':
      padding = '13px 28px';
      fontSize = '16px';
      minHeight = '50px';
      iconSize = '18px';
      break;
    case 'md':
    default:
      padding = '8px 16px';
      fontSize = '13px';
      minHeight = '36px';
      iconSize = '14px';
      break;
  }

  // Icon-only square sizing
  if (variant === 'icon') {
    let iconDim = '36px';
    if (size === 'xs') iconDim = '26px';
    else if (size === 'sm') iconDim = '32px';
    else if (size === 'lg') iconDim = '44px';
    else if (size === 'xl') iconDim = '50px';

    padding = '0';
  }

  // Border radius definition
  let borderRadius = '6px';
  if (rounded === 'none') borderRadius = '0px';
  else if (rounded === 'sm') borderRadius = '4px';
  else if (rounded === 'lg') borderRadius = '10px';
  else if (rounded === 'full' || variant === 'icon') borderRadius = rounded === 'full' ? '9999px' : '8px';

  // Variant color definitions and interactive state handling
  const getVariantStyles = (): React.CSSProperties => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: isHovered && !isActuallyDisabled ? '#1a0070' : 'var(--premium-blue, #00005c)',
          color: '#ffffff',
          border: '1px solid transparent',
          boxShadow: isActuallyDisabled
            ? 'none'
            : isHovered
            ? '0 6px 16px rgba(0, 0, 92, 0.28)'
            : '0 2px 6px rgba(0, 0, 92, 0.16)',
        };
      case 'secondary':
        return {
          backgroundColor: isHovered && !isActuallyDisabled ? '#e2e8f0' : '#f1f5f9',
          color: '#1e293b',
          border: '1px solid #cbd5e1',
          boxShadow: isActuallyDisabled
            ? 'none'
            : isHovered
            ? '0 4px 12px rgba(0, 0, 0, 0.08)'
            : '0 1px 3px rgba(0, 0, 0, 0.04)',
        };
      case 'danger':
        return {
          backgroundColor: isHovered && !isActuallyDisabled ? '#dc2626' : '#ef4444',
          color: '#ffffff',
          border: '1px solid transparent',
          boxShadow: isActuallyDisabled
            ? 'none'
            : isHovered
            ? '0 6px 16px rgba(239, 68, 68, 0.35)'
            : '0 2px 6px rgba(239, 68, 68, 0.2)',
        };
      case 'warning':
        return {
          backgroundColor: isHovered && !isActuallyDisabled ? '#d97706' : '#f59e0b',
          color: '#ffffff',
          border: '1px solid transparent',
          boxShadow: isActuallyDisabled
            ? 'none'
            : isHovered
            ? '0 6px 16px rgba(245, 158, 11, 0.35)'
            : '0 2px 6px rgba(245, 158, 11, 0.2)',
        };
      case 'success':
        return {
          backgroundColor: isHovered && !isActuallyDisabled ? '#059669' : '#10b981',
          color: '#ffffff',
          border: '1px solid transparent',
          boxShadow: isActuallyDisabled
            ? 'none'
            : isHovered
            ? '0 6px 16px rgba(16, 185, 129, 0.35)'
            : '0 2px 6px rgba(16, 185, 129, 0.2)',
        };
      case 'info':
        return {
          backgroundColor: isHovered && !isActuallyDisabled ? '#0284c7' : '#0ea5e9',
          color: '#ffffff',
          border: '1px solid transparent',
          boxShadow: isActuallyDisabled
            ? 'none'
            : isHovered
            ? '0 6px 16px rgba(14, 165, 233, 0.35)'
            : '0 2px 6px rgba(14, 165, 233, 0.2)',
        };
      case 'light':
        return {
          backgroundColor: isHovered && !isActuallyDisabled ? '#f1f5f9' : '#ffffff',
          color: '#1e293b',
          border: '1px solid #e2e8f0',
          boxShadow: isActuallyDisabled
            ? 'none'
            : isHovered
            ? '0 4px 12px rgba(0, 0, 0, 0.08)'
            : '0 1px 3px rgba(0, 0, 0, 0.05)',
        };
      case 'dark':
        return {
          backgroundColor: isHovered && !isActuallyDisabled ? '#0f172a' : '#1e293b',
          color: '#ffffff',
          border: '1px solid transparent',
          boxShadow: isActuallyDisabled
            ? 'none'
            : isHovered
            ? '0 6px 16px rgba(15, 23, 42, 0.35)'
            : '0 2px 6px rgba(15, 23, 42, 0.2)',
        };
      case 'outline':
      case 'outline-primary':
        return {
          backgroundColor: isHovered && !isActuallyDisabled ? 'rgba(0, 0, 92, 0.06)' : 'transparent',
          color: 'var(--premium-blue, #00005c)',
          border: '1.5px solid var(--premium-blue, #00005c)',
          boxShadow: 'none',
        };
      case 'outline-secondary':
        return {
          backgroundColor: isHovered && !isActuallyDisabled ? '#f1f5f9' : 'transparent',
          color: '#475569',
          border: '1.5px solid #cbd5e1',
          boxShadow: 'none',
        };
      case 'outline-danger':
        return {
          backgroundColor: isHovered && !isActuallyDisabled ? 'rgba(239, 68, 68, 0.06)' : 'transparent',
          color: '#ef4444',
          border: '1.5px solid #ef4444',
          boxShadow: 'none',
        };
      case 'outline-success':
        return {
          backgroundColor: isHovered && !isActuallyDisabled ? 'rgba(16, 185, 129, 0.06)' : 'transparent',
          color: '#10b981',
          border: '1.5px solid #10b981',
          boxShadow: 'none',
        };
      case 'glass':
        return {
          backgroundColor: isHovered && !isActuallyDisabled ? 'rgba(255, 255, 255, 0.9)' : 'rgba(255, 255, 255, 0.75)',
          color: 'var(--premium-text-main, #1e293b)',
          border: '1px solid rgba(255, 255, 255, 0.6)',
          backdropFilter: 'blur(10px)',
          boxShadow: isActuallyDisabled
            ? 'none'
            : isHovered
            ? '0 6px 20px rgba(0, 0, 0, 0.08)'
            : '0 2px 8px rgba(0, 0, 0, 0.04)',
        };
      case 'icon': {
        let iconDim = '36px';
        if (size === 'xs') iconDim = '26px';
        else if (size === 'sm') iconDim = '32px';
        else if (size === 'lg') iconDim = '44px';
        else if (size === 'xl') iconDim = '50px';

        return {
          width: iconDim,
          height: iconDim,
          minWidth: iconDim,
          minHeight: iconDim,
          borderRadius: '8px',
          border: '1px solid #e2e8f0',
          backgroundColor: isHovered && !isActuallyDisabled ? '#ffffff' : '#f8fafc',
          color: isHovered && !isActuallyDisabled ? 'var(--premium-blue, #00005c)' : '#475569',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: iconSize,
          boxShadow: isActuallyDisabled
            ? 'none'
            : isHovered
            ? '0 4px 10px rgba(0, 0, 0, 0.08)'
            : '0 1px 3px rgba(0, 0, 0, 0.03)',
        };
      }
      case 'link':
        return {
          backgroundColor: 'transparent',
          color: 'var(--premium-blue, #00005c)',
          border: 'none',
          boxShadow: 'none',
          textDecoration: isHovered && !isActuallyDisabled ? 'underline' : 'none',
          padding: '0 4px',
          minHeight: 'auto',
        };
      default:
        return {
          backgroundColor: 'var(--premium-blue, #00005c)',
          color: '#ffffff',
          border: '1px solid transparent',
        };
    }
  };

  const transformStyle = isActuallyDisabled
    ? 'none'
    : isActive
    ? 'translateY(1px) scale(0.98)'
    : isHovered
    ? 'translateY(-1px)'
    : 'none';

  const baseStyle: React.CSSProperties = {
    display: fullWidth ? 'flex' : 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: fullWidth ? '100%' : undefined,
    padding,
    fontSize,
    minHeight: variant === 'link' ? undefined : minHeight,
    fontWeight: 600,
    fontFamily: 'inherit',
    borderRadius,
    cursor: isActuallyDisabled ? 'not-allowed' : 'pointer',
    opacity: isActuallyDisabled ? 0.6 : 1,
    transition: 'all 0.18s cubic-bezier(0.4, 0, 0.2, 1)',
    position: 'relative',
    outline: 'none',
    userSelect: 'none',
    verticalAlign: 'middle',
    letterSpacing: '0.2px',
    transform: transformStyle,
    boxSizing: 'border-box',
    gap: '6px',
    ...getVariantStyles(),
    ...style,
  };

  const getIconClass = (ic: string) => {
    if (
      ic.startsWith('fa-') &&
      !ic.startsWith('fa ') &&
      !ic.startsWith('fas ') &&
      !ic.startsWith('far ') &&
      !ic.startsWith('fa-solid ') &&
      !ic.startsWith('fa-regular ') &&
      !ic.startsWith('fa-brands ')
    ) {
      return `fa ${ic}`;
    }
    return ic;
  };

  const content = loading ? (loadingText || children || text) : (children || text);

  return (
    <button
      ref={ref}
      type={type}
      onClick={isActuallyDisabled ? undefined : onClick}
      style={baseStyle}
      disabled={isActuallyDisabled}
      title={title}
      className={`react-premium-btn react-premium-btn--${variant} react-premium-btn--${size} ${className}`}
      onMouseEnter={(e) => {
        setIsHovered(true);
        if (restProps.onMouseEnter) restProps.onMouseEnter(e);
      }}
      onMouseLeave={(e) => {
        setIsHovered(false);
        setIsActive(false);
        if (restProps.onMouseLeave) restProps.onMouseLeave(e);
      }}
      onMouseDown={(e) => {
        setIsActive(true);
        if (restProps.onMouseDown) restProps.onMouseDown(e);
      }}
      onMouseUp={(e) => {
        setIsActive(false);
        if (restProps.onMouseUp) restProps.onMouseUp(e);
      }}
      {...restProps}
    >
      {/* Loading Spinner */}
      {loading && (
        <i
          className="fa-solid fa-circle-notch fa-spin"
          style={{ fontSize: iconSize, marginRight: content ? '6px' : '0px' }}
        ></i>
      )}

      {/* Left Icon */}
      {!loading && icon && iconPosition === 'left' && (
        <i
          className={getIconClass(icon)}
          style={{ fontSize: iconSize, marginRight: content && variant !== 'icon' ? '6px' : '0px' }}
        ></i>
      )}

      {/* Button Content / Text */}
      {content && <span>{content}</span>}

      {/* Right Icon */}
      {!loading && icon && iconPosition === 'right' && (
        <i
          className={getIconClass(icon)}
          style={{ fontSize: iconSize, marginLeft: content ? '6px' : '0px' }}
        ></i>
      )}

      {/* Notification / Badge Pill */}
      {badgeCount !== undefined && badgeCount !== null && (
        <span
          style={{
            position: 'absolute',
            top: '-5px',
            right: '-5px',
            backgroundColor: '#ef4444',
            color: '#ffffff',
            borderRadius: '9999px',
            minWidth: '18px',
            height: '18px',
            padding: '0 4px',
            fontSize: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            boxShadow: '0 2px 5px rgba(239, 68, 68, 0.4)',
            border: '1.5px solid #ffffff',
            lineHeight: 1
          }}
        >
          {badgeCount}
        </span>
      )}
    </button>
  );
});

Button.displayName = 'Button';
