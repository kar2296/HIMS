import React, { useState, useEffect } from 'react';

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
        padding: '12px 20px',
        fontSize: '11px',
        fontWeight: 700,
        color: 'rgba(255,255,255,0.4)',
        letterSpacing: '1px',
        textTransform: 'uppercase',
        marginTop: '10px'
      }}>
        {item.text}
      </div>
    );
  }

  return (
    <div style={{ padding: '2px 10px' }}>
      <div 
        onClick={handleClick}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: `12px 16px 12px ${16 + depth * 16}px`,
          cursor: 'pointer',
          borderRadius: '8px',
          backgroundColor: isOpen ? 'rgba(255,255,255,0.1)' : 'transparent',
          color: isOpen ? '#fff' : 'rgba(255,255,255,0.7)',
          transition: 'all 0.2s ease',
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {item.icon && (
            <i 
              className={item.icon} 
              style={{ 
                width: '20px', 
                textAlign: 'center',
                color: isOpen ? 'var(--premium-gold)' : 'inherit'
              }}
            ></i>
          )}
          <span style={{ 
            fontSize: depth === 0 ? '14px' : '13px',
            fontWeight: depth === 0 ? 500 : 400,
            fontFamily: 'var(--font-modern)'
          }}>
            {item.text}
          </span>
        </div>

        {/* Submenu Indicator or Alert */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {item.alert && (
            <span style={{
              backgroundColor: 'var(--premium-gold)',
              color: '#fff',
              fontSize: '10px',
              padding: '2px 6px',
              borderRadius: '10px',
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
                transition: 'transform 0.2s ease',
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
            marginTop: '4px',
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
      backgroundColor: 'var(--premium-blue)', 
      backgroundImage: 'linear-gradient(180deg, var(--premium-blue) 0%, var(--premium-blue-hover) 100%)',
      color: '#fff',
      overflowY: 'auto',
      overflowX: 'hidden',
      boxShadow: 'var(--shadow-md)',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Optional Branding Area */}
      <div style={{
        padding: '20px',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        marginBottom: '10px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
      }}>
        <div style={{
          width: '36px',
          height: '36px',
          borderRadius: '8px',
          backgroundColor: 'var(--premium-gold)',
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
          fontFamily: 'var(--font-modern)',
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
          <div style={{ padding: '20px', color: 'rgba(255,255,255,0.5)', textAlign: 'center', fontSize: '13px' }}>
            <i className="fa-solid fa-circle-notch fa-spin" style={{ marginRight: '8px' }}></i>
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
