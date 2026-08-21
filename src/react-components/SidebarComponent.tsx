import React, { useState } from 'react';
import { colors, typography, radii, spacing, shadows, transitions } from '../components/ui/tokens';

// Interfaces for our Sidebar
interface MenuItem {
  text: string;
  sref?: string;
  params?: any;
  icon?: string;
  translate?: string;
  heading?: boolean;
  submenu?: MenuItem[];
  alert?: string;
}

interface SidebarComponentProps {
  menuItems?: MenuItem[];
  onNavigate?: (sref: string, params?: any) => void;
}

const SidebarMenuItem: React.FC<{
  item: MenuItem;
  depth: number;
  onNavigate?: (sref: string, params?: any) => void;
}> = ({ item, depth, onNavigate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const hasSubmenu = item.submenu && item.submenu.length > 0;

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (hasSubmenu) {
      setIsOpen(!isOpen);
    } else if (onNavigate && item.sref && item.sref !== '#') {
      onNavigate(item.sref, item.params);
    }
  };

  // Heading styles (like 'MAIN NAVIGATION')
  if (item.heading) {
    return (
      <div style={{
        padding: `${spacing.md} ${spacing.xl}`,
        fontSize: '11px',
        fontWeight: 700,
        color: 'rgba(255,255,255,0.4)',
        letterSpacing: '1px',
        textTransform: 'uppercase',
        marginTop: spacing.sm
      }}>
        {item.text}
      </div>
    );
  }

  return (
    <div style={{ padding: `2px ${spacing.sm}` }}>
      <div
        onClick={handleClick}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: `${spacing.md} ${spacing.lg} ${spacing.md} ${16 + depth * 16}px`,
          cursor: 'pointer',
          borderRadius: radii.sm,
          backgroundColor: isOpen ? 'rgba(255,255,255,0.1)' : 'transparent',
          color: isOpen ? '#fff' : 'rgba(255,255,255,0.7)',
          transition: transitions.base,
        }}
        onMouseEnter={(e) => {
          if (!isOpen) {
            e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)';
            e.currentTarget.style.color = '#fff';
          }
        }}
        onMouseLeave={(e) => {
          if (!isOpen) {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = 'rgba(255,255,255,0.7)';
          }
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: spacing.md }}>
          {item.icon && depth === 0 && (
            <i
              className={item.icon}
              style={{
                width: '20px',
                textAlign: 'center',
                color: isOpen ? colors.gold : 'inherit'
              }}
            ></i>
          )}
          <span style={{
            fontSize: depth === 0 ? '14px' : '13px',
            fontWeight: depth === 0 ? 500 : 400,
            fontFamily: typography.fontFamily
          }}>
            {item.text}
          </span>
        </div>

        {/* Submenu Indicator or Alert */}
        <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm }}>
          {item.alert && (
            <span style={{
              backgroundColor: colors.gold,
              color: '#fff',
              fontSize: '10px',
              padding: '2px 6px',
              borderRadius: radii.full,
              fontWeight: 600
            }}>
              {item.alert}
            </span>
          )}
          {hasSubmenu && (
            <i
              className={`fa-solid fa-chevron-${isOpen ? 'down' : 'right'}`}
              style={{
                fontSize: '10px',
                transition: transitions.base,
                opacity: 0.5
              }}
            ></i>
          )}
        </div>
      </div>

      {/* Render Submenu */}
      {hasSubmenu && (
        <div style={{
          overflow: 'hidden',
          maxHeight: isOpen ? '1000px' : '0',
          opacity: isOpen ? 1 : 0,
          transition: 'all 0.3s ease-in-out',
        }}>
          <div style={{
            marginTop: spacing.xs,
            borderLeft: '1px solid rgba(255,255,255,0.1)',
            marginLeft: `${24 + depth * 16}px`
          }}>
            {item.submenu!.map((subItem, index) => (
              <SidebarMenuItem
                key={index}
                item={subItem}
                depth={depth + 1}
                onNavigate={onNavigate}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export const SidebarComponent: React.FC<SidebarComponentProps> = ({
  menuItems = [],
  onNavigate
}) => {
  return (
    <div style={{
      width: '250px',
      height: '100%',
      backgroundColor: colors.primary,
      backgroundImage: `linear-gradient(180deg, ${colors.primary} 0%, ${colors.primaryHover} 100%)`,
      color: '#fff',
      overflowY: 'auto',
      overflowX: 'hidden',
      boxShadow: shadows.md,
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Optional Branding Area */}
      <div style={{
        padding: spacing.xl,
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        marginBottom: spacing.sm,
        display: 'flex',
        alignItems: 'center',
        gap: spacing.md
      }}>
        <div style={{
          width: '36px',
          height: '36px',
          borderRadius: radii.sm,
          backgroundColor: colors.gold,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          fontWeight: 'bold',
          fontSize: '18px'
        }}>
          H
        </div>
        <div style={{
          fontFamily: typography.fontFamily,
          fontWeight: 700,
          fontSize: '18px',
          letterSpacing: '0.5px'
        }}>
          HIMS
        </div>
      </div>

      {/* Menu Items */}
      <div style={{ flex: 1 }}>
        {menuItems && menuItems.map((item, index) => (
          <SidebarMenuItem
            key={index}
            item={item}
            depth={0}
            onNavigate={onNavigate}
          />
        ))}
        {(!menuItems || menuItems.length === 0) && (
          <div style={{ padding: spacing.xl, color: 'rgba(255,255,255,0.5)', textAlign: 'center', fontSize: '13px' }}>
            <i className="fa-solid fa-circle-notch fa-spin" style={{ marginRight: spacing.sm }}></i>
            Loading menu...
          </div>
        )}
      </div>

      {/* Custom Scrollbar Styles injected globally just for this container */}
      <style>
        {`
          ::-webkit-scrollbar {
            width: 6px;
          }
          ::-webkit-scrollbar-track {
            background: rgba(0,0,0,0.1);
          }
          ::-webkit-scrollbar-thumb {
            background: rgba(255,255,255,0.2);
            border-radius: 10px;
          }
          ::-webkit-scrollbar-thumb:hover {
            background: rgba(255,255,255,0.3);
          }
        `}
      </style>
    </div>
  );
};
