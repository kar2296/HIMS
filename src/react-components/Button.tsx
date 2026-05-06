import React from 'react';

interface ButtonProps {
  onClick?: () => void;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
  style?: React.CSSProperties;
}

export const Button: React.FC<ButtonProps> = ({ onClick, children, variant = 'primary', style }) => {
  const baseStyle: React.CSSProperties = {
    background: variant === 'primary' ? '#21008d' : '#e2e6ea',
    color: variant === 'primary' ? '#ffffff' : '#333',
    border: 'none',
    padding: '8px 12px',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'background 0.2s',
    ...style,
  };
  const hoverStyle: React.CSSProperties = {
    background: variant === 'primary' ? 'rgba(33, 0, 141, 0.8)' : '#d6dadf',
  };
  return (
    <button
      onClick={onClick}
      style={baseStyle}
      onMouseEnter={e => (e.currentTarget.style.background = hoverStyle.background as string)}
      onMouseLeave={e => (e.currentTarget.style.background = baseStyle.background as string)}
    >
      {children}
    </button>
  );
};
