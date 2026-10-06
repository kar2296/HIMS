import React, { useState, useEffect, useCallback } from 'react';
import { colors, spacing, typography, radii } from '../components/ui/tokens';
import { AppointmentSessionFormScreen } from './AppointmentSessionFormScreen';
import { AppointmentMultiSessionListScreen } from './AppointmentMultiSessionListScreen';
import { apiFetch } from './utils/api';

export interface TabDef {
  key: string;
  title: string;
  state: string;
  icon: string;
  canDisable?: boolean;
}

export interface AppointmentSessionFormTabScreenProps {
  id?: number;
  reactProps?: {
    id?: number;
    activeState?: string;
    selectedDoctorId?: number;
    tabs?: TabDef[];
  };
  onAction?: (actionName: string, payload?: any) => void;
}

export const AppointmentSessionFormTabScreen: React.FC<AppointmentSessionFormTabScreenProps> = ({
  id: directId,
  reactProps,
  onAction
}) => {
  // Parse ID from props or URL
  const parseId = (): number => {
    if (directId !== undefined) return directId;
    if (reactProps?.id !== undefined) return reactProps.id;
    const hash = window.location.hash;
    const hashMatch = hash.match(/appointmentsession(?:tab)?\/(\d+)/i);
    if (hashMatch && hashMatch[1]) return parseInt(hashMatch[1], 10);
    const pathname = window.location.pathname;
    const pathMatch = pathname.match(/appointmentsession(?:tab)?\/(\d+)/i);
    if (pathMatch && pathMatch[1]) return parseInt(pathMatch[1], 10);
    return 0;
  };

  const [sessionId, setSessionId] = useState<number>(parseId());
  const [activeTabKey, setActiveTabKey] = useState<string>('session');
  const [doctorId, setDoctorId] = useState<number>(reactProps?.selectedDoctorId ?? -1);
  const [sessionSummary, setSessionSummary] = useState<any>(null);

  const canDisableMulti = sessionId === 0;

  const tabs: TabDef[] = [
    {
      key: 'session',
      title: 'Appointment Session',
      state: 'app.appointmentsessionformtab.appointmentsession',
      icon: 'fa-calendar-check',
      canDisable: false
    },
    {
      key: 'multisession',
      title: 'Multi Appointment Sessions',
      state: 'app.appointmentsessionformtab.appointmentmultisession',
      icon: 'fa-layer-group',
      canDisable: canDisableMulti
    }
  ];

  // Fetch session summary if existing
  const loadSummary = useCallback(async (id: number) => {
    if (!id || id <= 0) return;
    try {
      const res = await apiFetch<any>('appointment/AppointmentSession/GetAppointmentSessionById', {
        method: 'POST',
        body: JSON.stringify({ Id: id })
      });
      if (res) {
        const d = res.Data || res;
        setSessionSummary(d);
        if (d.DoctorId && d.DoctorId > 0) {
          setDoctorId(d.DoctorId);
        }
      }
    } catch (e) {
      console.warn('Failed to load session tab summary', e);
    }
  }, []);

  useEffect(() => {
    if (sessionId > 0) {
      loadSummary(sessionId);
    }
  }, [sessionId, loadSummary]);

  const handleTabClick = (tab: TabDef) => {
    if (tab.canDisable) return;
    setActiveTabKey(tab.key);
    if (onAction) {
      onAction('switchTab', { tab, state: tab.state, id: sessionId });
    }
  };

  const handleBackToList = () => {
    if (onAction) {
      onAction('backToList');
    } else {
      window.location.hash = '#/app/appointmentsessions';
    }
  };

  const handleAddNew = () => {
    if (onAction) {
      onAction('addNew');
    } else {
      setSessionId(0);
      setActiveTabKey('session');
      window.location.hash = '#/app/appointmentsessiontab/0';
    }
  };

  const handleSessionSaved = (newId: number) => {
    if (newId > 0 && newId !== sessionId) {
      setSessionId(newId);
      loadSummary(newId);
    }
  };

  return (
    <div
      style={{
        padding: `${spacing.lg}px`,
        maxWidth: 1280,
        margin: '0 auto',
        fontFamily: typography.fontFamily
      }}
    >
      {/* Top Breadcrumb & Actions Bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: spacing.md,
          backgroundColor: '#fff',
          padding: `${spacing.md}px ${spacing.xl}px`,
          borderRadius: radii.lg,
          boxShadow: '0 2px 6px rgba(0, 0, 0, 0.04)',
          border: `1px solid ${colors.border?.subtle || '#e2e8f0'}`
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            type="button"
            onClick={handleBackToList}
            style={{
              padding: '8px 12px',
              borderRadius: radii.md,
              backgroundColor: '#f1f5f9',
              border: `1px solid ${colors.border?.default || '#cbd5e1'}`,
              color: colors.text?.primary || '#334155',
              cursor: 'pointer',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}
          >
            <i className="fa fa-arrow-left" /> Sessions
          </button>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: colors.text?.primary || '#1e293b' }}>
              {sessionId > 0
                ? `Appointment Session #${sessionId}`
                : 'Create Appointment Session'}
            </h2>
            <div style={{ fontSize: '0.8rem', color: colors.text?.secondary || '#64748b', marginTop: 2 }}>
              {sessionSummary?.User
                ? `Doctor: ${sessionSummary.User.FirstName || ''} ${sessionSummary.User.LastName || ''}`
                : sessionSummary?.ResourceMaster
                ? `Resource: ${sessionSummary.ResourceMaster.ResourceName || ''}`
                : 'Doctor & Resource Schedule Slot Manager'}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: spacing.sm }}>
          <button
            type="button"
            onClick={handleAddNew}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 16px',
              borderRadius: radii.md,
              backgroundColor: colors.primary?.main || '#2563eb',
              color: '#fff',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.875rem',
              boxShadow: '0 2px 4px rgba(37, 99, 235, 0.2)'
            }}
          >
            <i className="fa fa-plus" /> New Session
          </button>
        </div>
      </div>

      {/* Tabs Header Navigation */}
      <div
        style={{
          display: 'flex',
          gap: 8,
          marginBottom: spacing.lg,
          borderBottom: `2px solid ${colors.border?.subtle || '#e2e8f0'}`,
          paddingBottom: 2
        }}
      >
        {tabs.map((tab) => {
          const isActive = activeTabKey === tab.key;
          const isDisabled = !!tab.canDisable;

          return (
            <button
              key={tab.key}
              type="button"
              disabled={isDisabled}
              onClick={() => handleTabClick(tab)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 20px',
                border: 'none',
                background: 'none',
                borderBottom: isActive ? `3px solid ${colors.primary?.main || '#2563eb'}` : '3px solid transparent',
                marginBottom: -3,
                fontWeight: isActive ? 700 : 500,
                fontSize: '0.95rem',
                color: isDisabled
                  ? '#94a3b8'
                  : isActive
                  ? colors.primary?.main || '#2563eb'
                  : colors.text?.secondary || '#64748b',
                cursor: isDisabled ? 'not-allowed' : 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <i className={`fa ${tab.icon}`} />
              <span>{tab.title}</span>
              {isDisabled && (
                <span
                  style={{
                    fontSize: '0.7rem',
                    padding: '2px 6px',
                    borderRadius: radii.sm,
                    backgroundColor: '#e2e8f0',
                    color: '#64748b'
                  }}
                >
                  Save first
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Active Tab Content Area */}
      <div>
        {activeTabKey === 'session' && (
          <AppointmentSessionFormScreen
            sessionId={sessionId}
            onAction={onAction}
            onSaved={handleSessionSaved}
          />
        )}

        {activeTabKey === 'multisession' && (
          <AppointmentMultiSessionListScreen
            doctorId={doctorId}
            parentSessionId={sessionId}
            onAction={onAction}
          />
        )}
      </div>
    </div>
  );
};

export default AppointmentSessionFormTabScreen;
