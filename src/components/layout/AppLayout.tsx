import React, { useState } from 'react';
import { colors, spacing, radii, shadows, typography } from '../ui/tokens';
import { sessionHelper } from '../../services/sessionHelper';

export interface AppLayoutProps {
  children?: React.ReactNode;
  activeRoute?: string;
  onNavigate?: (route: string) => void;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  children,
  activeRoute = 'dashboard',
  onNavigate
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const userName = sessionHelper.getCurrentUserName() || 'Administrator';
  const facilityName = sessionHelper.getCurrentFacilityName() || 'Main Hospital';

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'fa-tachometer-alt', module: 'Analytics' },
    { id: 'registration', label: 'Registration & Queue', icon: 'fa-user-plus', module: 'Front Office' },
    { id: 'appointments', label: 'Appointments', icon: 'fa-calendar-alt', module: 'Front Office' },
    { id: 'emr', label: 'EMR Clinical Portal', icon: 'fa-stethoscope', module: 'Clinical' },
    { id: 'emr/masters', label: 'EMR Masters (77)', icon: 'fa-database', module: 'Clinical' },
    { id: 'inpatient', label: 'Inpatient (IPD)', icon: 'fa-bed', module: 'Clinical' },
    { id: 'lis', label: 'Laboratory (LIS)', icon: 'fa-vial', module: 'Diagnostics' },
    { id: 'billing', label: 'Billing & Cashier', icon: 'fa-file-invoice-dollar', module: 'Finance' },
    { id: 'pharmacy', label: 'Pharmacy & Meds', icon: 'fa-pills', module: 'Supply Chain' },
    { id: 'inventory', label: 'Inventory & Stores', icon: 'fa-boxes', module: 'Supply Chain' },
    { id: 'reports', label: 'MIS & Reports', icon: 'fa-chart-bar', module: 'Reporting' },
    { id: 'masters', label: 'System Masters', icon: 'fa-cogs', module: 'Administration' }
  ];

  const handleNavClick = (id: string) => {
    if (onNavigate) {
      onNavigate(id);
    } else {
      // Strangler fallback: navigate in AngularJS router if available
      if ((window as any).angular) {
        const $state = (window as any).angular.element(document.body).injector()?.get('$state');
        if ($state) {
          const stateMap: Record<string, string> = {
            dashboard: 'app.dashboard',
            registration: 'app.registration',
            appointments: 'app.appointment',
            emr: 'app.emrworkspace',
            inpatient: 'app.inpatient',
            lis: 'app.samplecollectlist',
            billing: 'app.opbilling',
            pharmacy: 'app.oppharmacy',
            inventory: 'app.itemmasterlist',
            reports: 'app.reports',
            masters: 'app.generalmaster'
          };
          const target = stateMap[id] || 'app.dashboard';
          $state.go(target);
          return;
        }
      }
      window.location.hash = `#/${id}`;
    }
  };

  const handleLogout = () => {
    sessionStorage.clear();
    localStorage.removeItem('token');
    window.location.href = '#/page/login';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', fontFamily: typography.fontFamily, backgroundColor: colors.surfaceSunken }}>
      {/* Top Header */}
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 20px',
          height: '56px',
          backgroundColor: '#ffffff',
          borderBottom: `1px solid ${colors.border}`,
          boxShadow: shadows.sm,
          zIndex: 100,
          flexShrink: 0
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button
            type="button"
            onClick={() => setIsCollapsed(!isCollapsed)}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '18px',
              color: colors.textMain,
              cursor: 'pointer',
              padding: '6px 8px',
              borderRadius: radii.sm
            }}
            title="Toggle Navigation Menu"
          >
            <i className="fa fa-bars" />
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: radii.md,
                backgroundColor: colors.primary,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                fontWeight: 800,
                fontSize: 16
              }}
            >
              H
            </div>
            <div>
              <span style={{ fontWeight: 800, fontSize: 16, color: colors.primaryActive, letterSpacing: '-0.3px' }}>
                HIMS Enterprise
              </span>
              <span style={{ fontSize: 11, marginLeft: 8, padding: '2px 6px', backgroundColor: colors.primaryLight, color: colors.primary, borderRadius: radii.full, fontWeight: 700 }}>
                React Strangler v2.0
              </span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          {/* Active Facility Indicator */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '6px 12px',
              backgroundColor: '#f8fafc',
              border: `1px solid ${colors.border}`,
              borderRadius: radii.md,
              fontSize: 12
            }}
          >
            <i className="fa fa-hospital-o" style={{ color: colors.primary }} />
            <span style={{ fontWeight: 600, color: colors.textMain }}>{facilityName}</span>
          </div>

          {/* User Profile */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: radii.full,
                backgroundColor: colors.primaryLight,
                color: colors.primary,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: 13
              }}
            >
              {userName.charAt(0).toUpperCase()}
            </div>
            <div style={{ lineHeight: 1.2 }}>
              <div style={{ fontWeight: 700, fontSize: 13, color: colors.textMain }}>{userName}</div>
              <div style={{ fontSize: 11, color: colors.textMuted }}>Authenticated</div>
            </div>
          </div>

          {/* Logout Action */}
          <button
            type="button"
            onClick={handleLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 12px',
              backgroundColor: 'transparent',
              border: `1px solid ${colors.border}`,
              borderRadius: radii.md,
              color: colors.textMuted,
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <i className="fa fa-sign-out" />
            <span>Logout</span>
          </button>
        </div>
      </header>

      {/* Main Container: Sidebar + Content */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Navigation Sidebar */}
        <aside
          style={{
            width: isCollapsed ? '64px' : '230px',
            backgroundColor: '#ffffff',
            borderRight: `1px solid ${colors.border}`,
            transition: 'width 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            overflowY: 'auto',
            overflowX: 'hidden',
            flexShrink: 0,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ padding: '12px 8px' }}>
            {navItems.map((item) => {
              const isActive = activeRoute === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleNavClick(item.id)}
                  title={isCollapsed ? item.label : undefined}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    width: '100%',
                    padding: isCollapsed ? '12px 0' : '10px 14px',
                    justifyContent: isCollapsed ? 'center' : 'flex-start',
                    borderRadius: radii.md,
                    border: 'none',
                    backgroundColor: isActive ? colors.primaryLight : 'transparent',
                    color: isActive ? colors.primary : colors.textMain,
                    fontWeight: isActive ? 700 : 500,
                    fontSize: 13,
                    cursor: 'pointer',
                    marginBottom: 4,
                    transition: 'all 0.15s ease'
                  }}
                >
                  <i className={`fa ${item.icon}`} style={{ fontSize: 16, width: 20, textAlign: 'center' }} />
                  {!isCollapsed && <span>{item.label}</span>}
                </button>
              );
            })}
          </div>

          {!isCollapsed && (
            <div style={{ padding: '16px', borderTop: `1px solid ${colors.border}`, fontSize: 11, color: colors.textMuted }}>
              <div>Core Status: <span style={{ color: colors.success, fontWeight: 700 }}>● Online</span></div>
              <div style={{ marginTop: 4 }}>Node API: Port 2012</div>
            </div>
          )}
        </aside>

        {/* Viewport Content */}
        <main style={{ flex: 1, overflowY: 'auto', padding: spacing.lg }}>
          {children}
        </main>
      </div>
    </div>
  );
};
