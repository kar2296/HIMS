import React, { useState, useRef, useEffect, useCallback } from 'react';
import { colors, sidebar, radii, shadows, transitions, typography, zIndex } from '../components/ui/tokens';
import { Avatar } from '../components/ui/Avatar';

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────
interface QuickSearchResult {
  type: 'patient' | 'bill' | 'appointment';
  label: string;
  sublabel?: string;
  id?: string | number;
}

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
  quickSearchResults?: QuickSearchResult[];
  isSearching?: boolean;
  currentModule?: string;
}

// ─────────────────────────────────────────────────────────────
// Quick Actions config
// ─────────────────────────────────────────────────────────────
const QUICK_ACTIONS = [
  { label: 'New Registration', icon: 'fa-user-plus', state: 'app.newregistration' },
  { label: 'Find Bill', icon: 'fa-magnifying-glass-dollar', state: 'app.findbill' },
  { label: 'New Appointment', icon: 'fa-calendar-plus', state: 'app.appointmentstab.newappointment' },
  { label: 'OP Billing', icon: 'fa-file-invoice', state: 'app.opbilling-list' },
  { label: 'IP Admission', icon: 'fa-hospital-user', state: 'app.admissions' },
];

// ─────────────────────────────────────────────────────────────
// Main TopNavbarComponent
// ─────────────────────────────────────────────────────────────
export const TopNavbarComponent: React.FC<TopNavbarComponentProps> = ({
  facilityName = 'HIMS',
  username = 'User',
  userRole = '',
  userInitials,
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
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [quickActionsOpen, setQuickActionsOpen] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const quickActionsRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
      if (quickActionsRef.current && !quickActionsRef.current.contains(e.target as Node)) {
        setQuickActionsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Keyboard shortcut: Ctrl+K / Cmd+K to focus search
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
        setTimeout(() => searchInputRef.current?.focus(), 50);
      }
      if (e.key === 'Escape') {
        setSearchOpen(false);
        setUserMenuOpen(false);
        setQuickActionsOpen(false);
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value;
    setSearchQuery(q);
    if (q.trim() && onSearchPatient) {
      onSearchPatient(q);
    }
  }, [onSearchPatient]);

  const handleQuickAction = useCallback((state: string) => {
    setQuickActionsOpen(false);
    if (onNavigate) onNavigate(state);
  }, [onNavigate]);

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

      {/* Right: Search + Quick Actions + Notifications + User */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>

        {/* Global Search */}
        <div ref={searchRef} style={{ position: 'relative' }}>
          <div
            onClick={() => { setSearchOpen(true); setTimeout(() => searchInputRef.current?.focus(), 50); }}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '6px 12px',
              backgroundColor: colors.surfaceMuted,
              border: `1px solid ${searchOpen ? colors.primary : colors.border}`,
              borderRadius: radii.full,
              cursor: 'text',
              transition: transitions.fast,
              boxShadow: searchOpen ? `0 0 0 3px rgba(37,99,235,0.15)` : 'none',
              minWidth: '200px',
            }}
          >
            <i className="fa-solid fa-magnifying-glass" style={{ fontSize: '12px', color: colors.textSubtle }} />
            <input
              ref={searchInputRef}
              value={searchQuery}
              onChange={handleSearchChange}
              onFocus={() => setSearchOpen(true)}
              placeholder="Search patients... (⌘K)"
              style={{
                background: 'none', border: 'none', outline: 'none', padding: 0,
                fontSize: '13px', color: colors.textMain, fontFamily: typography.fontFamily,
                width: '160px', caretColor: colors.primary,
              }}
            />
            {searchQuery && (
              <button
                onClick={(e) => { e.stopPropagation(); setSearchQuery(''); }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: colors.textSubtle, fontSize: '12px' }}
              >
                <i className="fa-solid fa-xmark" />
              </button>
            )}
          </div>

          {/* Search dropdown */}
          {searchOpen && (
            <div style={{ ...dropdownBase, minWidth: '320px', left: 'auto', right: 0 }}>
              {isSearching ? (
                <div style={{ padding: '16px', textAlign: 'center', color: colors.textSubtle, fontSize: '13px' }}>
                  <i className="fa-solid fa-circle-notch fa-spin" style={{ marginRight: '8px' }} />
                  Searching...
                </div>
              ) : quickSearchResults.length > 0 ? (
                <div>
                  <div style={{ padding: '8px 12px 4px', fontSize: '11px', fontWeight: 600, color: colors.textSubtle, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Results
                  </div>
                  {quickSearchResults.map((r, i) => (
                    <div
                      key={i}
                      style={{
                        padding: '10px 14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px',
                        transition: transitions.fast,
                      }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.backgroundColor = colors.surfaceMuted; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.backgroundColor = 'transparent'; }}
                    >
                      <i
                        className={`fa-solid ${r.type === 'patient' ? 'fa-user' : r.type === 'bill' ? 'fa-file-invoice' : 'fa-calendar'}`}
                        style={{ fontSize: '13px', color: colors.primary, width: '16px', textAlign: 'center' }}
                      />
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 500, color: colors.textMain }}>{r.label}</div>
                        {r.sublabel && <div style={{ fontSize: '11px', color: colors.textSubtle }}>{r.sublabel}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              ) : searchQuery.trim() ? (
                <div style={{ padding: '16px', textAlign: 'center', color: colors.textSubtle, fontSize: '13px' }}>
                  No results for "{searchQuery}"
                </div>
              ) : (
                <div style={{ padding: '12px 14px' }}>
                  <div style={{ fontSize: '11px', fontWeight: 600, color: colors.textSubtle, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
                    Search by patient name, MRN, or visit ID
                  </div>
                  <div style={{ fontSize: '12px', color: colors.textSubtle }}>
                    <i className="fa-regular fa-keyboard" style={{ marginRight: '6px' }} />
                    Tip: Press <kbd style={{ background: colors.surfaceSunken, border: `1px solid ${colors.border}`, borderRadius: radii.xs, padding: '1px 4px', fontSize: '11px' }}>⌘K</kbd> to open search
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div ref={quickActionsRef} style={{ position: 'relative' }}>
          <button
            onClick={() => setQuickActionsOpen((v) => !v)}
            title="Quick Actions"
            style={{
              background: quickActionsOpen ? colors.primaryLight : colors.surfaceMuted,
              border: `1px solid ${quickActionsOpen ? colors.primary : colors.border}`,
              borderRadius: radii.md, cursor: 'pointer', padding: '6px 10px',
              color: quickActionsOpen ? colors.primary : colors.textMuted,
              fontSize: '14px', transition: transitions.fast, display: 'flex', alignItems: 'center', gap: '6px',
            }}
            onMouseEnter={(e) => { if (!quickActionsOpen) { (e.currentTarget as HTMLButtonElement).style.backgroundColor = colors.surfaceSunken; (e.currentTarget as HTMLButtonElement).style.color = colors.primary; } }}
            onMouseLeave={(e) => { if (!quickActionsOpen) { (e.currentTarget as HTMLButtonElement).style.backgroundColor = colors.surfaceMuted; (e.currentTarget as HTMLButtonElement).style.color = colors.textMuted; } }}
          >
            <i className="fa-solid fa-bolt" />
            <span style={{ fontSize: '12px', fontWeight: 600, fontFamily: typography.fontFamily }}>Actions</span>
          </button>

          {quickActionsOpen && (
            <div style={{ ...dropdownBase, width: '220px' }}>
              <div style={{ padding: '8px 12px 4px', fontSize: '11px', fontWeight: 600, color: colors.textSubtle, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Quick Actions
              </div>
              {QUICK_ACTIONS.map((action, i) => (
                <div
                  key={i}
                  onClick={() => handleQuickAction(action.state)}
                  style={{
                    padding: '10px 14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px',
                    transition: transitions.fast,
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.backgroundColor = colors.primaryLight; (e.currentTarget as HTMLDivElement).style.color = colors.primary; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.backgroundColor = 'transparent'; (e.currentTarget as HTMLDivElement).style.color = colors.textMain; }}
                >
                  <i className={`fa-solid ${action.icon}`} style={{ fontSize: '13px', color: colors.primary, width: '16px', textAlign: 'center' }} />
                  <span style={{ fontSize: '13px', fontFamily: typography.fontFamily }}>{action.label}</span>
                </div>
              ))}
            </div>
          )}
        </div>

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
