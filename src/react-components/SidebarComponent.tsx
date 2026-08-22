import React, { useState, useCallback } from 'react';
import { colors, sidebar, radii, transitions, typography } from '../components/ui/tokens';

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────
interface MenuItem {
  id?: string;
  label: string;
  icon?: string;
  href?: string;
  state?: string;
  children?: MenuItem[];
  isActive?: boolean;
}

export interface SidebarComponentProps {
  menuItems?: MenuItem[];
  facilityName?: string;
  facilityShort?: string;
  currentState?: string;
  username?: string;
  userRole?: string;
  userInitials?: string;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  onNavigate?: (stateName: string) => void;
  onLogout?: () => void;
}

// ─────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────

/** Single sidebar item — leaf node */
const SidebarItem: React.FC<{
  item: MenuItem;
  depth?: number;
  isActive: boolean;
  collapsed: boolean;
  onClick: (item: MenuItem) => void;
}> = ({ item, depth = 0, isActive, collapsed, onClick }) => {
  const [hovered, setHovered] = useState(false);
  const paddingLeft = collapsed ? 0 : 16 + depth * 14;

  return (
    <div
      role="menuitem"
      tabIndex={0}
      onClick={() => onClick(item)}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onClick(item); }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: collapsed ? 0 : '10px',
        justifyContent: collapsed ? 'center' : 'flex-start',
        padding: collapsed ? '10px 0' : `9px ${paddingLeft}px 9px ${paddingLeft}px`,
        marginRight: '8px',
        marginLeft: '8px',
        marginBottom: '1px',
        borderRadius: radii.md,
        cursor: 'pointer',
        transition: transitions.fast,
        backgroundColor: isActive
          ? colors.sidebarActive
          : hovered
          ? 'rgba(255,255,255,0.07)'
          : 'transparent',
        position: 'relative',
        outline: 'none',
      }}
    >
      {/* Active indicator bar */}
      {isActive && (
        <div style={{
          position: 'absolute', left: 0, top: '6px', bottom: '6px',
          width: '3px', borderRadius: '0 3px 3px 0',
          backgroundColor: colors.sidebarActiveBar,
        }} />
      )}

      {/* Icon */}
      {item.icon && (
        <i
          className={`fa-solid ${item.icon}`}
          style={{
            fontSize: depth > 0 ? '13px' : '15px',
            color: isActive ? colors.sidebarActiveBar : (hovered ? '#fff' : colors.sidebarText),
            width: '18px', textAlign: 'center', flexShrink: 0,
            transition: transitions.fast,
          }}
        />
      )}

      {/* Label */}
      {!collapsed && (
        <span style={{
          fontSize: '13px', fontWeight: isActive ? 600 : 400,
          color: isActive ? '#fff' : (hovered ? '#fff' : colors.sidebarText),
          fontFamily: typography.fontFamily, overflow: 'hidden',
          textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1,
          transition: transitions.fast,
        }}>
          {item.label}
        </span>
      )}
    </div>
  );
};

/** Sidebar group with collapsible children */
const SidebarGroup: React.FC<{
  item: MenuItem;
  depth: number;
  currentState: string;
  collapsed: boolean;
  onLeafClick: (item: MenuItem) => void;
}> = ({ item, depth, currentState, collapsed, onLeafClick }) => {
  const isChildActive = item.children?.some(
    (c) => c.state === currentState || c.children?.some((cc) => cc.state === currentState)
  );
  const [open, setOpen] = useState(isChildActive ?? false);
  const [hovered, setHovered] = useState(false);

  const paddingLeft = collapsed ? 0 : 16 + depth * 14;

  return (
    <div>
      {/* Group header */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => !collapsed && setOpen((v) => !v)}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') !collapsed && setOpen((v) => !v); }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: collapsed ? 0 : '10px',
          justifyContent: collapsed ? 'center' : 'flex-start',
          padding: collapsed ? '10px 0' : `9px ${paddingLeft}px 9px ${paddingLeft}px`,
          margin: '0 8px 1px 8px',
          borderRadius: radii.md,
          cursor: 'pointer',
          transition: transitions.fast,
          backgroundColor: isChildActive && !open
            ? colors.sidebarActive
            : hovered ? 'rgba(255,255,255,0.07)' : 'transparent',
          outline: 'none',
        }}
      >
        {item.icon && (
          <i
            className={`fa-solid ${item.icon}`}
            style={{
              fontSize: depth > 0 ? '13px' : '15px',
              color: isChildActive ? colors.sidebarActiveBar : (hovered ? '#fff' : colors.sidebarText),
              width: '18px', textAlign: 'center', flexShrink: 0,
            }}
          />
        )}
        {!collapsed && (
          <>
            <span style={{
              flex: 1, fontSize: '13px', fontWeight: isChildActive ? 600 : 400,
              color: isChildActive ? '#fff' : (hovered ? '#fff' : colors.sidebarText),
              fontFamily: typography.fontFamily, overflow: 'hidden',
              textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {item.label}
            </span>
            <i
              className={`fa-solid fa-chevron-${open ? 'up' : 'down'}`}
              style={{
                fontSize: '10px', color: colors.sidebarMuted,
                transition: 'transform 0.2s ease',
                transform: open ? 'rotate(0deg)' : 'rotate(-90deg)',
                flexShrink: 0,
              }}
            />
          </>
        )}
      </div>

      {/* Children */}
      {!collapsed && open && item.children && (
        <div style={{
          borderLeft: `1px solid ${colors.sidebarBorder}`,
          marginLeft: '24px',
          paddingLeft: '4px',
          marginBottom: '4px',
        }}>
          {item.children.map((child, i) =>
            child.children?.length ? (
              <SidebarGroup
                key={i}
                item={child}
                depth={depth + 1}
                currentState={currentState}
                collapsed={false}
                onLeafClick={onLeafClick}
              />
            ) : (
              <SidebarItem
                key={i}
                item={child}
                depth={depth + 1}
                isActive={child.state === currentState}
                collapsed={false}
                onClick={onLeafClick}
              />
            )
          )}
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// Main SidebarComponent
// ─────────────────────────────────────────────────────────────
export const SidebarComponent: React.FC<SidebarComponentProps> = ({
  menuItems = [],
  facilityName = 'HIMS',
  facilityShort = 'H',
  currentState = '',
  username = 'User',
  userRole = '',
  userInitials,
  isCollapsed = false,
  onToggleCollapse,
  onNavigate,
  onLogout,
}) => {
  const [localCollapsed, setLocalCollapsed] = useState(isCollapsed);
  const collapsed = isCollapsed ?? localCollapsed;

  const handleToggle = useCallback(() => {
    setLocalCollapsed((v) => !v);
    if (onToggleCollapse) onToggleCollapse();
  }, [onToggleCollapse]);

  const handleLeafClick = useCallback((item: MenuItem) => {
    if (item.state && onNavigate) {
      onNavigate(item.state);
    } else if (item.href) {
      window.location.href = item.href;
    }
  }, [onNavigate]);

  const sidebarWidth = collapsed ? sidebar.collapsedWidth : sidebar.width;

  return (
    <div
      role="navigation"
      aria-label="Main navigation"
      style={{
        width: sidebarWidth,
        minWidth: sidebarWidth,
        maxWidth: sidebarWidth,
        height: '100%',
        backgroundColor: colors.sidebarBg,
        backgroundImage: `linear-gradient(180deg, ${colors.sidebarTop} 0%, ${colors.sidebarBottom} 100%)`,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        transition: 'width 0.22s cubic-bezier(0.4,0,0.2,1), min-width 0.22s cubic-bezier(0.4,0,0.2,1)',
        boxShadow: '4px 0 20px rgba(0,0,0,0.25)',
        flexShrink: 0,
        position: 'relative',
        zIndex: 100,
      }}
    >
      {/* ── Brand / Logo ── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: collapsed ? 'center' : 'space-between',
        padding: collapsed ? '18px 0' : '18px 16px',
        borderBottom: `1px solid ${colors.sidebarBorder}`,
        flexShrink: 0,
        minHeight: sidebar.topbarHeight,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
          {/* Logo badge */}
          <div style={{
            width: '32px', height: '32px', borderRadius: radii.md, flexShrink: 0,
            background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '16px', color: '#fff', fontWeight: 800,
            boxShadow: '0 4px 12px rgba(37,99,235,0.4)',
          }}>
            {facilityShort?.[0] ?? <i className="fa-solid fa-house-medical" />}
          </div>

          {!collapsed && (
            <div style={{ overflow: 'hidden' }}>
              <div style={{
                fontSize: '14px', fontWeight: 700, color: '#fff',
                fontFamily: typography.fontFamily, whiteSpace: 'nowrap',
                overflow: 'hidden', textOverflow: 'ellipsis',
              }}>
                {facilityName}
              </div>
              <div style={{
                fontSize: '10px', color: colors.sidebarMuted,
                fontFamily: typography.fontFamily, whiteSpace: 'nowrap',
                letterSpacing: '0.5px', textTransform: 'uppercase',
              }}>
                Hospital Management
              </div>
            </div>
          )}
        </div>

        {/* Collapse toggle */}
        {!collapsed && onToggleCollapse && (
          <button
            onClick={handleToggle}
            title="Collapse sidebar"
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: colors.sidebarMuted, fontSize: '14px', padding: '4px',
              borderRadius: radii.sm, transition: transitions.fast,
              flexShrink: 0,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#fff')}
            onMouseLeave={(e) => (e.currentTarget.style.color = colors.sidebarMuted)}
          >
            <i className="fa-solid fa-chevron-left" />
          </button>
        )}

        {collapsed && onToggleCollapse && (
          <button
            onClick={handleToggle}
            title="Expand sidebar"
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: colors.sidebarMuted, fontSize: '14px', padding: '4px',
              borderRadius: radii.sm, transition: transitions.fast,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#fff')}
            onMouseLeave={(e) => (e.currentTarget.style.color = colors.sidebarMuted)}
          >
            <i className="fa-solid fa-chevron-right" />
          </button>
        )}
      </div>

      {/* ── Menu items ── */}
      <div
        style={{
          flex: 1, overflowY: 'auto', overflowX: 'hidden',
          paddingTop: '8px', paddingBottom: '8px',
          scrollbarWidth: 'thin',
        }}
        role="menu"
      >
        {menuItems.map((item, i) =>
          item.children?.length ? (
            <SidebarGroup
              key={i}
              item={item}
              depth={0}
              currentState={currentState}
              collapsed={collapsed}
              onLeafClick={handleLeafClick}
            />
          ) : (
            <SidebarItem
              key={i}
              item={item}
              depth={0}
              isActive={item.state === currentState}
              collapsed={collapsed}
              onClick={handleLeafClick}
            />
          )
        )}
      </div>

      {/* ── User profile footer ── */}
      <div style={{
        padding: collapsed ? '12px 0' : '12px 12px',
        borderTop: `1px solid ${colors.sidebarBorder}`,
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        justifyContent: collapsed ? 'center' : 'flex-start',
        flexShrink: 0,
      }}>
        {/* Avatar */}
        <div style={{
          width: '32px', height: '32px', borderRadius: radii.full, flexShrink: 0,
          background: 'linear-gradient(135deg, #2563eb, #4f46e5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '12px', fontWeight: 700, color: '#fff',
          fontFamily: typography.fontFamily,
        }}>
          {userInitials || username.slice(0, 2).toUpperCase()}
        </div>

        {!collapsed && (
          <>
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <div style={{
                fontSize: '13px', fontWeight: 600, color: '#fff',
                fontFamily: typography.fontFamily,
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                {username}
              </div>
              {userRole && (
                <div style={{
                  fontSize: '11px', color: colors.sidebarMuted,
                  fontFamily: typography.fontFamily,
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                  {userRole}
                </div>
              )}
            </div>

            {onLogout && (
              <button
                onClick={onLogout}
                title="Logout"
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: colors.sidebarMuted, fontSize: '14px', padding: '4px',
                  borderRadius: radii.sm, transition: transitions.fast, flexShrink: 0,
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = colors.danger)}
                onMouseLeave={(e) => (e.currentTarget.style.color = colors.sidebarMuted)}
              >
                <i className="fa-solid fa-arrow-right-from-bracket" />
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};
