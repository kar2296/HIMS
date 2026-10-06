import React, { useState, useRef, useEffect, useCallback } from 'react';
import { colors, sidebar, radii, shadows, transitions, typography, zIndex } from '../components/ui/tokens';
import { Avatar } from '../components/ui/Avatar';

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────
export interface TopNavbarComponentProps {
  facilityName?: string;
  username?: string;
  userRole?: string;
  userInitials?: string;
  breadcrumb?: Array<{ label: string; state?: string }>;
  notificationCount?: number;
  onToggleSidebar?: () => void;
  onNavigate?: (stateName: string) => void;
  onLogout?: () => void;
  onSearchPatient?: (query: string) => void;
  onChangePassword?: () => void;
  quickSearchResults?: any[];
  isSearching?: boolean;
  currentModule?: string;
}

// ─────────────────────────────────────────────────────────────
// Main TopNavbarComponent
// ─────────────────────────────────────────────────────────────
export const TopNavbarComponent: React.FC<TopNavbarComponentProps> = ({
  username = 'User',
  userRole = '',
  breadcrumb = [],
  notificationCount = 0,
  onToggleSidebar,
  onNavigate,
  onLogout,
  onSearchPatient,
  onChangePassword,
  quickSearchResults = [],
  isSearching = false,
  currentModule,
  facilityName,
}) => {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Keyboard shortcut: Escape to close dropdown
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  const dropdownBase: React.CSSProperties = {
    position: 'absolute',
    top: 'calc(100% + 8px)',
    right: 0,
    backgroundColor: colors.surface,
    border: `1px solid ${colors.border}`,
    borderRadius: radii.lg,
    boxShadow: shadows.xl,
    zIndex: zIndex.dropdown,
    minWidth: '240px',
    overflow: 'hidden',
    animation: 'hims-toast-in 0.15s ease',
  };

  return (
    <header
      style={{
        height: sidebar.topbarHeight,
        backgroundColor: 'rgba(255,255,255,0.92)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: `1px solid ${colors.border}`,
        boxShadow: shadows.navbar,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 20px',
        position: 'sticky',
        top: 0,
        zIndex: zIndex.sticky,
        flexShrink: 0,
        gap: '12px',
      }}
    >
      {/* Left: Hamburger + Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0, flex: 1 }}>
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            title="Toggle sidebar"
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: colors.textMuted, fontSize: '18px', padding: '6px',
              borderRadius: radii.md, transition: transitions.fast, flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = colors.surfaceMuted; (e.currentTarget as HTMLButtonElement).style.color = colors.primary; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent'; (e.currentTarget as HTMLButtonElement).style.color = colors.textMuted; }}
          >
            <i className="fa-solid fa-bars" />
          </button>
        )}

        {/* Breadcrumb / Module name */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflow: 'hidden', minWidth: 0 }}>
          {currentModule && (
            <span style={{
              fontSize: '15px', fontWeight: 700, color: colors.textMain,
              fontFamily: typography.fontFamily, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {currentModule}
            </span>
          )}
          {breadcrumb.length > 0 && (
            <>
              {currentModule && (
                <i className="fa-solid fa-chevron-right" style={{ fontSize: '10px', color: colors.textSubtle, flexShrink: 0 }} />
              )}
              {breadcrumb.map((b, i) => (
                <React.Fragment key={i}>
                  {i > 0 && <i className="fa-solid fa-chevron-right" style={{ fontSize: '10px', color: colors.textSubtle, flexShrink: 0 }} />}
                  <span
                    onClick={() => b.state && onNavigate && onNavigate(b.state)}
                    style={{
                      fontSize: '13px', fontWeight: i === breadcrumb.length - 1 ? 600 : 400,
                      color: i === breadcrumb.length - 1 ? colors.textMain : colors.textMuted,
                      cursor: b.state ? 'pointer' : 'default',
                      fontFamily: typography.fontFamily,
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      transition: transitions.fast,
                    }}
                    onMouseEnter={(e) => { if (b.state) (e.currentTarget as HTMLSpanElement).style.color = colors.primary; }}
                    onMouseLeave={(e) => { if (b.state) (e.currentTarget as HTMLSpanElement).style.color = i === breadcrumb.length - 1 ? colors.textMain : colors.textMuted; }}
                  >
                    {b.label}
                  </span>
                </React.Fragment>
              ))}
            </>
          )}
        </div>
      </div>

      {/* Centre-left: current facility + online status (as in the new design) */}
      {facilityName && (
        <div className="hims-topbar-facility" style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, flexShrink: 1 }}>
          <span style={{ fontSize: '11.5px', fontWeight: 700, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: '0.04em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontFamily: typography.fontFamily }}>
            Facility: <strong style={{ color: colors.textMain }}>{facilityName}</strong>
          </span>
          <span style={{ fontSize: '11px', background: '#dcfce7', color: '#166534', padding: '2px 8px', borderRadius: '9999px', fontWeight: 600, whiteSpace: 'nowrap', fontFamily: typography.fontFamily }}>
            ● Online
          </span>
        </div>
      )}

      {/* Right: Notifications + User */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>

        {/* Notifications Bell */}
        <button
          title="Notifications"
          style={{
            background: 'none', border: `1px solid ${colors.border}`, borderRadius: radii.md,
            cursor: 'pointer', padding: '6px 10px', color: colors.textMuted, fontSize: '16px',
            transition: transitions.fast, position: 'relative',
            backgroundColor: colors.surfaceMuted,
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = colors.primary; (e.currentTarget as HTMLButtonElement).style.borderColor = colors.primary; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = colors.textMuted; (e.currentTarget as HTMLButtonElement).style.borderColor = colors.border; }}
        >
          <i className="fa-regular fa-bell" />
          {notificationCount > 0 && (
            <span style={{
              position: 'absolute', top: '-4px', right: '-4px',
              backgroundColor: colors.danger, color: '#fff',
              borderRadius: radii.full, width: '16px', height: '16px',
              fontSize: '9px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '1.5px solid white',
            }}>
              {notificationCount > 9 ? '9+' : notificationCount}
            </span>
          )}
        </button>

        {/* User Menu */}
        <div ref={userMenuRef} style={{ position: 'relative' }}>
          <button
            onClick={() => setUserMenuOpen((v) => !v)}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              background: userMenuOpen ? colors.surfaceSunken : colors.surfaceMuted,
              border: `1px solid ${userMenuOpen ? colors.borderStrong : colors.border}`,
              borderRadius: radii.md, cursor: 'pointer', padding: '5px 10px',
              transition: transitions.fast,
            }}
            onMouseEnter={(e) => { if (!userMenuOpen) (e.currentTarget as HTMLButtonElement).style.backgroundColor = colors.surfaceSunken; }}
            onMouseLeave={(e) => { if (!userMenuOpen) (e.currentTarget as HTMLButtonElement).style.backgroundColor = colors.surfaceMuted; }}
          >
            <Avatar name={username} size="xs" />
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '12px', fontWeight: 600, color: colors.textMain, fontFamily: typography.fontFamily, whiteSpace: 'nowrap' }}>
                {username}
              </div>
              {userRole && (
                <div style={{ fontSize: '10px', color: colors.textSubtle, fontFamily: typography.fontFamily, whiteSpace: 'nowrap' }}>
                  {userRole}
                </div>
              )}
            </div>
            <i
              className={`fa-solid fa-chevron-${userMenuOpen ? 'up' : 'down'}`}
              style={{ fontSize: '10px', color: colors.textSubtle, transition: transitions.fast }}
            />
          </button>

          {userMenuOpen && (
            <div style={{ ...dropdownBase, minWidth: '200px' }}>
              {/* User header */}
              <div style={{ padding: '14px 16px', borderBottom: `1px solid ${colors.border}`, display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Avatar name={username} size="sm" />
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: colors.textMain }}>{username}</div>
                  {userRole && <div style={{ fontSize: '11px', color: colors.textSubtle }}>{userRole}</div>}
                </div>
              </div>

              {/* Menu items */}
              {[
                { icon: 'fa-user', label: 'My Profile', action: () => onNavigate?.('app.userprofile') },
                { icon: 'fa-lock', label: 'Change Password', action: onChangePassword },
                { icon: 'fa-gear', label: 'Settings', action: () => onNavigate?.('app.settings') },
              ].map((item, i) => (
                <div
                  key={i}
                  onClick={() => { setUserMenuOpen(false); item.action?.(); }}
                  style={{
                    padding: '10px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px',
                    transition: transitions.fast,
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.backgroundColor = colors.surfaceMuted; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.backgroundColor = 'transparent'; }}
                >
                  <i className={`fa-solid ${item.icon}`} style={{ fontSize: '13px', color: colors.textMuted, width: '16px', textAlign: 'center' }} />
                  <span style={{ fontSize: '13px', color: colors.textBody, fontFamily: typography.fontFamily }}>{item.label}</span>
                </div>
              ))}

              <div style={{ height: '1px', backgroundColor: colors.border, margin: '4px 0' }} />

              {/* Logout */}
              <div
                onClick={() => { setUserMenuOpen(false); if (onLogout) onLogout(); }}
                style={{
                  padding: '10px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px',
                  transition: transitions.fast,
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.backgroundColor = colors.dangerBg; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.backgroundColor = 'transparent'; }}
              >
                <i className="fa-solid fa-arrow-right-from-bracket" style={{ fontSize: '13px', color: colors.danger, width: '16px', textAlign: 'center' }} />
                <span style={{ fontSize: '13px', color: colors.danger, fontWeight: 600, fontFamily: typography.fontFamily }}>Logout</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
