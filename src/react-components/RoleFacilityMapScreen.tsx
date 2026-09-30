import React, { useState, useEffect } from 'react';
import { apiFetch } from './utils/api';
import { colors, spacing, typography, radii } from '../components/ui/tokens';

export interface RoleFacilityMapScreenProps {
  roleId: number;
  roleName?: string;
  onAction?: (actionName: string, payload?: any) => void;
}

export const RoleFacilityMapScreen: React.FC<RoleFacilityMapScreenProps> = ({ roleId, roleName, onAction }) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [availableFacilities, setAvailableFacilities] = useState<Array<{ Id: number; Text: string }>>([]);
  const [selectedFacilityIds, setSelectedFacilityIds] = useState<Set<number>>(new Set());
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Load available facilities and currently mapped facilities
  useEffect(() => {
    if (!roleId || roleId <= 0) return;

    let isMounted = true;
    setLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    const loadData = async () => {
      try {
        // 1. Fetch available facilities
        const lookupRes = await apiFetch<any>('General/Options/getoptions', [
          {
            Key: 'Facility',
            Request: {
              Params: [{ Key: 4, Value: true }]
            }
          }
        ]);

        const facilities: Array<{ Id: number; Text: string }> = lookupRes?.Facility || [];

        // 2. Fetch mapped facilities for this role
        const mappedRes = await apiFetch<any>('SystemSettings/Role/GetFacilities', {
          Params: [{ Key: 0, Value: roleId }]
        });

        const mappedData: any[] = mappedRes?.Data || mappedRes || [];
        const mappedSet = new Set<number>();

        mappedData.forEach((item) => {
          const fId = item.FacilityId ?? item.Id ?? item;
          if (typeof fId === 'number') mappedSet.add(fId);
        });

        if (isMounted) {
          setAvailableFacilities(facilities);
          setSelectedFacilityIds(mappedSet);
        }
      } catch (err: any) {
        if (isMounted) {
          console.error('Failed to load facility map:', err);
          setErrorMessage(err.message || 'Failed to load facility assignments.');
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

  const toggleFacility = (fId: number) => {
    setSelectedFacilityIds((prev) => {
      const next = new Set(prev);
      if (next.has(fId)) {
        next.delete(fId);
      } else {
        next.add(fId);
      }
      return next;
    });
  };

  const selectAll = () => {
    const all = new Set<number>();
    availableFacilities.forEach((f) => all.add(f.Id));
    setSelectedFacilityIds(all);
  };

  const deselectAll = () => {
    setSelectedFacilityIds(new Set());
  };

  const handleSave = async (status: 'Draft' | 'Active' = 'Active') => {
    setSaving(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const payload = Array.from(selectedFacilityIds).map((fId) => ({
        RoleId: roleId,
        FacilityId: fId,
        PatientStatus: status
      }));

      await apiFetch<any>('SystemSettings/Role/MapFacilities', {
        Data: payload
      });

      setSuccessMessage('Facility assignments saved successfully!');
      if (onAction) onAction('saveComplete', { roleId });
    } catch (err: any) {
      console.error('Failed to save mapped facilities:', err);
      setErrorMessage(err.message || 'Failed to save facility mappings.');
    } finally {
      setSaving(false);
    }
  };

  const filteredFacilities = availableFacilities.filter((f) =>
    f.Text.toLowerCase().includes(searchTerm.toLowerCase())
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
            <i className="fa fa-hospital" style={{ color: colors.primary.main }} />
            Assign Facilities / Hospitals
          </h3>
          <span style={{ fontSize: typography.fontSizes.xs, color: colors.text.secondary }}>
            Select which facilities users with this role are permitted to access.
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
              placeholder="Search facilities..."
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

      {/* Facilities Cards Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: spacing.xl, color: colors.text.secondary }}>
          <i className="fa fa-spinner fa-spin fa-2x" style={{ marginBottom: spacing.sm, color: colors.primary.main }} />
          <div>Loading facility assignments...</div>
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
          {filteredFacilities.length === 0 ? (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: spacing.xl, color: colors.text.secondary }}>
              No facilities match "{searchTerm}"
            </div>
          ) : (
            filteredFacilities.map((fac) => {
              const isSelected = selectedFacilityIds.has(fac.Id);

              return (
                <div
                  key={fac.Id}
                  onClick={() => toggleFacility(fac.Id)}
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
                      {fac.Text}
                    </div>
                    <div style={{ fontSize: 11, color: colors.text.secondary }}>ID: {fac.Id}</div>
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
          <strong>{selectedFacilityIds.size}</strong> of {availableFacilities.length} facilities selected
        </div>

        <div style={{ display: 'flex', gap: spacing.sm }}>
          <button
            type="button"
            onClick={() => handleSave('Draft')}
            disabled={saving || loading}
            style={{
              padding: '8px 20px',
              borderRadius: radii.sm,
              border: `1px solid ${colors.border.subtle}`,
              backgroundColor: colors.background.tertiary,
              color: colors.text.primary,
              fontSize: typography.fontSizes.sm,
              fontWeight: typography.fontWeights.medium,
              cursor: saving ? 'not-allowed' : 'pointer'
            }}
          >
            Save Draft
          </button>

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
    </div>
  );
};
