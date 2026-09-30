import React, { useState, useEffect } from 'react';
import { apiFetch } from './utils/api';
import { colors, spacing, typography, radii } from '../components/ui/tokens';

export interface RoleMobileConfigScreenProps {
  roleId: number;
  roleName?: string;
  onAction?: (actionName: string, payload?: any) => void;
}

export const RoleMobileConfigScreen: React.FC<RoleMobileConfigScreenProps> = ({ roleId, roleName, onAction }) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [availableModules, setAvailableModules] = useState<Array<{ Id: number; Text: string }>>([]);
  const [selectedModuleIds, setSelectedModuleIds] = useState<Set<number>>(new Set());
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!roleId || roleId <= 0) return;

    let isMounted = true;
    setLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    const loadData = async () => {
      try {
        // 1. Fetch available MobileConfig options
        const lookupRes = await apiFetch<any>('General/Options/getoptions', [{ Key: 'MobileConfig' }]);

        const modules: Array<{ Id: number; Text: string }> = lookupRes?.MobileConfig || [];

        // 2. Fetch current role mappings
        const mappedRes = await apiFetch<any>('SystemSettings/Role/GetRoleMobileConfigMap', {
          Params: [{ Key: 0, Value: roleId }]
        });

        const mappedData: any[] = mappedRes?.Data || mappedRes || [];
        const mappedSet = new Set<number>();

        mappedData.forEach((item) => {
          const mId = item.MobileConfigId ?? item.Id ?? item;
          if (typeof mId === 'number') mappedSet.add(mId);
        });

        if (isMounted) {
          setAvailableModules(modules);
          setSelectedModuleIds(mappedSet);
        }
      } catch (err: any) {
        if (isMounted) {
          console.error('Failed to load mobile config map:', err);
          setErrorMessage(err.message || 'Failed to load mobile app configurations.');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [roleId]);

  const toggleModule = (id: number) => {
    setSelectedModuleIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const selectAll = () => {
    const all = new Set<number>();
    availableModules.forEach((m) => all.add(m.Id));
    setSelectedModuleIds(all);
  };

  const deselectAll = () => {
    setSelectedModuleIds(new Set());
  };

  const handleSave = async (status: 'Draft' | 'Active' = 'Active') => {
    setSaving(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const payload = Array.from(selectedModuleIds).map((mId) => ({
        RoleId: roleId,
        MobileConfigId: mId,
        PatientStatus: status
      }));

      await apiFetch<any>('SystemSettings/Role/MapMobileConfigs', {
        Data: payload
      });

      setSuccessMessage('Mobile configurations saved successfully!');
      if (onAction) onAction('saveComplete', { roleId });
    } catch (err: any) {
      console.error('Failed to save mobile configurations:', err);
      setErrorMessage(err.message || 'Failed to save mobile configurations.');
    } finally {
      setSaving(false);
    }
  };

  const filteredModules = availableModules.filter((m) =>
    m.Text.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div
      style={{
        backgroundColor: colors.background.primary,
        borderRadius: radii.md,
        padding: spacing.lg,
        display: 'flex',
        flexDirection: 'column',
        gap: spacing.md
      }}
    >
      {/* Header and Search */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: spacing.md
        }}
      >
        <div>
          <h3
            style={{
              margin: 0,
              fontSize: typography.fontSizes.md,
              fontWeight: typography.fontWeights.semibold,
              color: colors.text.primary,
              display: 'flex',
              alignItems: 'center',
              gap: spacing.sm
            }}
          >
            <i className="fa fa-mobile-alt" style={{ color: colors.primary.main }} />
            Mobile App Configurations
          </h3>
          <span style={{ fontSize: typography.fontSizes.xs, color: colors.text.secondary }}>
            Select features and clinical modules enabled for this role on mobile applications.
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm }}>
          <div style={{ position: 'relative', width: 240 }}>
            <i
              className="fa fa-search"
              style={{
                position: 'absolute',
                left: 10,
                top: '50%',
                transform: 'translateY(-50%)',
                color: colors.text.secondary,
                fontSize: 12
              }}
            />
            <input
              type="text"
              placeholder="Search modules..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '6px 12px 6px 30px',
                fontSize: typography.fontSizes.sm,
                borderRadius: radii.full,
                border: `1px solid ${colors.border.subtle}`,
                outline: 'none',
                backgroundColor: colors.background.secondary
              }}
            />
          </div>

          <button
            type="button"
            onClick={selectAll}
            style={{
              fontSize: typography.fontSizes.xs,
              padding: '6px 12px',
              borderRadius: radii.sm,
              border: `1px solid ${colors.border.subtle}`,
              backgroundColor: colors.background.secondary,
              cursor: 'pointer',
              color: colors.text.primary
            }}
          >
            Select All
          </button>

          <button
            type="button"
            onClick={deselectAll}
            style={{
              fontSize: typography.fontSizes.xs,
              padding: '6px 12px',
              borderRadius: radii.sm,
              border: `1px solid ${colors.border.subtle}`,
              backgroundColor: colors.background.secondary,
              cursor: 'pointer',
              color: colors.text.primary
            }}
          >
            Deselect All
          </button>
        </div>
      </div>

      {/* Messages */}
      {successMessage && (
        <div
          style={{
            padding: spacing.md,
            backgroundColor: colors.state.successLight,
            color: colors.state.success,
            borderRadius: radii.md,
            fontSize: typography.fontSizes.sm,
            display: 'flex',
            alignItems: 'center',
            gap: spacing.sm
          }}
        >
          <i className="fa fa-check-circle" />
          {successMessage}
        </div>
      )}

      {errorMessage && (
        <div
          style={{
            padding: spacing.md,
            backgroundColor: colors.state.dangerLight,
            color: colors.state.danger,
            borderRadius: radii.md,
            fontSize: typography.fontSizes.sm,
            display: 'flex',
            alignItems: 'center',
            gap: spacing.sm
          }}
        >
          <i className="fa fa-exclamation-circle" />
          {errorMessage}
        </div>
      )}

      {/* Modules Cards Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: spacing.xl, color: colors.text.secondary }}>
          <i className="fa fa-spinner fa-spin fa-2x" style={{ marginBottom: spacing.sm, color: colors.primary.main }} />
          <div>Loading mobile configurations...</div>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: spacing.md,
            border: `1px solid ${colors.border.subtle}`,
            borderRadius: radii.md,
            padding: spacing.md,
            maxHeight: 460,
            overflowY: 'auto',
            backgroundColor: colors.background.secondary
          }}
        >
          {filteredModules.length === 0 ? (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: spacing.xl, color: colors.text.secondary }}>
              {availableModules.length === 0
                ? 'No mobile configuration modules available.'
                : `No modules match "${searchTerm}"`}
            </div>
          ) : (
            filteredModules.map((mod) => {
              const isSelected = selectedModuleIds.has(mod.Id);

              return (
                <div
                  key={mod.Id}
                  onClick={() => toggleModule(mod.Id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: spacing.sm,
                    padding: `${spacing.sm} ${spacing.md}`,
                    borderRadius: radii.md,
                    border: `1px solid ${isSelected ? colors.primary.main : colors.border.subtle}`,
                    backgroundColor: isSelected ? 'rgba(74, 144, 226, 0.08)' : colors.background.primary,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    boxShadow: isSelected ? '0 2px 4px rgba(74, 144, 226, 0.15)' : 'none'
                  }}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => {}} // handled by parent div click
                    style={{
                      width: 18,
                      height: 18,
                      accentColor: colors.primary.main,
                      cursor: 'pointer'
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontSize: typography.fontSizes.sm,
                        fontWeight: isSelected ? typography.fontWeights.semibold : typography.fontWeights.medium,
                        color: isSelected ? colors.primary.main : colors.text.primary
                      }}
                    >
                      {mod.Text}
                    </div>
                    <div style={{ fontSize: 11, color: colors.text.secondary }}>ID: {mod.Id}</div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Footer */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderTop: `1px solid ${colors.border.subtle}`,
          paddingTop: spacing.md
        }}
      >
        <div style={{ fontSize: typography.fontSizes.xs, color: colors.text.secondary }}>
          <strong>{selectedModuleIds.size}</strong> of {availableModules.length} mobile modules enabled
        </div>

        <button
          type="button"
          onClick={() => handleSave('Active')}
          disabled={saving || loading}
          style={{
            padding: '8px 24px',
            borderRadius: radii.sm,
            border: 'none',
            backgroundColor: colors.primary.main,
            color: '#fff',
            fontSize: typography.fontSizes.sm,
            fontWeight: typography.fontWeights.medium,
            cursor: saving ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: spacing.xs,
            boxShadow: '0 2px 6px rgba(74, 144, 226, 0.3)'
          }}
        >
          {saving ? (
            <>
              <i className="fa fa-spinner fa-spin" /> Saving...
            </>
          ) : (
            <>
              <i className="fa fa-check" /> Save & Approve
            </>
          )}
        </button>
      </div>
    </div>
  );
};
