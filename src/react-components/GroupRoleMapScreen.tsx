import React, { useState, useEffect } from 'react';
import { apiFetch } from './utils/api';
import { colors, spacing, typography, radii } from '../components/ui/tokens';

export interface GroupRoleMapScreenProps {
  groupId?: number;
  reactProps?: {
    groupId?: number;
    groupName?: string;
  };
  onAction?: (actionName: string, payload?: any) => void;
}

export const GroupRoleMapScreen: React.FC<GroupRoleMapScreenProps> = ({
  groupId: directGroupId,
  reactProps,
  onAction
}) => {
  const parseEffectiveId = (): number => {
    if (directGroupId !== undefined) return directGroupId;
    if (reactProps?.groupId !== undefined) return reactProps.groupId;
    const hash = window.location.hash;
    const match = hash.match(/#\/app\/group\/(\d+)/);
    if (match && match[1]) return parseInt(match[1], 10);
    const pathname = window.location.pathname;
    const pathMatch = pathname.match(/\/app\/group\/(\d+)/);
    if (pathMatch && pathMatch[1]) return parseInt(pathMatch[1], 10);
    return 0;
  };

  const groupId = parseEffectiveId();

  const [availableRoles, setAvailableRoles] = useState<Array<{ Id: number; Text: string }>>([]);
  const [selectedRoleIds, setSelectedRoleIds] = useState<Set<number>>(new Set());
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Load available roles & currently mapped roles
  useEffect(() => {
    if (!groupId || groupId <= 0) return;

    let isMounted = true;
    setLoading(true);
    setErrorMessage(null);

    const loadData = async () => {
      try {
        // 1. Fetch available Roles from General/Options
        const lookupRes = await apiFetch<any>('General/Options/getoptions', [{ Key: 'Role' }]);
        const roles: Array<{ Id: number; Text: string }> = lookupRes?.Role || [];

        // 2. Fetch current mapped roles for this group
        const mappedRes = await apiFetch<any>('SystemSettings/Group/GetRoles', {
          Params: [{ Key: 0, Value: groupId }]
        });

        const mappedData: any[] = mappedRes?.Data || mappedRes || [];
        const mappedSet = new Set<number>();

        mappedData.forEach((item) => {
          const rId = item.RoleId ?? item.Id ?? item;
          if (typeof rId === 'number') mappedSet.add(rId);
        });

        if (isMounted) {
          setAvailableRoles(roles);
          setSelectedRoleIds(mappedSet);
        }
      } catch (err: any) {
        if (isMounted) {
          console.error('Failed to load group roles:', err);
          setErrorMessage(err.message || 'Failed to load group roles.');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [groupId]);

  const handleToggleRole = (roleId: number) => {
    setSelectedRoleIds((prev) => {
      const next = new Set(prev);
      if (next.has(roleId)) {
        next.delete(roleId);
      } else {
        next.add(roleId);
      }
      return next;
    });
  };

  const handleSelectAll = () => {
    const allIds = new Set(availableRoles.map((r) => r.Id));
    setSelectedRoleIds(allIds);
  };

  const handleDeselectAll = () => {
    setSelectedRoleIds(new Set());
  };

  const handleSave = async (status: 'Active' | 'Draft' = 'Active') => {
    if (!groupId || groupId <= 0) return;

    setSaving(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const payload = Array.from(selectedRoleIds).map((rId) => ({
        GroupId: groupId,
        RoleId: rId,
        PatientStatus: status
      }));

      await apiFetch<any>('SystemSettings/Group/MapRoles', {
        Data: payload
      });

      setSuccessMessage('Group role mappings saved successfully!');
      if (onAction) onAction('saveComplete', { groupId });
    } catch (err: any) {
      console.error('Failed to save group roles:', err);
      setErrorMessage(err.message || 'Failed to save group role mappings.');
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    if (onAction) {
      onAction('backToForm');
    } else {
      if (window.location.hash.startsWith('#/app')) {
        window.location.hash = `#/app/group/${groupId}/general`;
      } else {
        window.location.href = `/app/group/${groupId}/general`;
      }
    }
  };

  const filteredRoles = availableRoles.filter((r) =>
    r.Text.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: spacing.md,
        backgroundColor: colors.background.secondary,
        padding: spacing.lg,
        borderRadius: radii.md,
        border: `1px solid ${colors.border.subtle}`
      }}
    >
      {/* Alert Messages */}
      {errorMessage && (
        <div
          style={{
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: radii.md,
            padding: `${spacing.sm} ${spacing.md}`,
            color: colors.state?.danger || '#ef4444',
            fontSize: typography.fontSizes.sm,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: spacing.xs }}>
            <i className="fa fa-exclamation-circle" />
            <span>{errorMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}
          >
            &times;
          </button>
        </div>
      )}

      {successMessage && (
        <div
          style={{
            backgroundColor: 'rgba(34, 197, 94, 0.1)',
            border: '1px solid rgba(34, 197, 94, 0.3)',
            borderRadius: radii.md,
            padding: `${spacing.sm} ${spacing.md}`,
            color: '#16a34a',
            fontSize: typography.fontSizes.sm,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: spacing.xs }}>
            <i className="fa fa-check-circle" />
            <span>{successMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setSuccessMessage(null)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}
          >
            &times;
          </button>
        </div>
      )}

      {/* Header controls: Search & Bulk selection */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: spacing.md,
          paddingBottom: spacing.sm,
          borderBottom: `1px solid ${colors.border.subtle}`
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm }}>
          <span style={{ fontSize: typography.fontSizes.sm, fontWeight: typography.fontWeights.medium, color: colors.text.primary }}>
            Roles Assigned:
          </span>
          <span
            style={{
              padding: '2px 10px',
              borderRadius: radii.full,
              backgroundColor: colors.primary.main,
              color: '#ffffff',
              fontSize: typography.fontSizes.xs,
              fontWeight: typography.fontWeights.semibold
            }}
          >
            {selectedRoleIds.size} of {availableRoles.length}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm }}>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              placeholder="Search roles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                padding: '6px 30px 6px 12px',
                borderRadius: radii.sm,
                border: `1px solid ${colors.border.subtle}`,
                backgroundColor: colors.background.primary,
                color: colors.text.primary,
                fontSize: typography.fontSizes.xs,
                width: 200,
                outline: 'none'
              }}
            />
            <i
              className="fa fa-search"
              style={{
                position: 'absolute',
                right: 10,
                top: '50%',
                transform: 'translateY(-50%)',
                color: colors.text.secondary,
                fontSize: 12
              }}
            />
          </div>

          <button
            type="button"
            onClick={handleSelectAll}
            style={{
              padding: '6px 12px',
              borderRadius: radii.sm,
              border: `1px solid ${colors.border.subtle}`,
              backgroundColor: colors.background.primary,
              color: colors.text.primary,
              fontSize: typography.fontSizes.xs,
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            Select All
          </button>

          <button
            type="button"
            onClick={handleDeselectAll}
            style={{
              padding: '6px 12px',
              borderRadius: radii.sm,
              border: `1px solid ${colors.border.subtle}`,
              backgroundColor: colors.background.primary,
              color: colors.text.primary,
              fontSize: typography.fontSizes.xs,
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            Clear All
          </button>
        </div>
      </div>

      {/* Roles Grid */}
      {loading ? (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 200,
            color: colors.text.secondary
          }}
        >
          <i className="fa fa-spinner fa-spin fa-2x" style={{ color: colors.primary.main, marginBottom: spacing.sm }} />
          <span>Loading available roles...</span>
        </div>
      ) : availableRoles.length === 0 ? (
        <div style={{ textAlign: 'center', padding: spacing.xl, color: colors.text.secondary }}>
          No roles configured in system.
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
            gap: spacing.sm,
            maxHeight: 460,
            overflowY: 'auto',
            padding: spacing.xs
          }}
        >
          {filteredRoles.map((role) => {
            const isSelected = selectedRoleIds.has(role.Id);

            return (
              <div
                key={role.Id}
                onClick={() => handleToggleRole(role.Id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: spacing.sm,
                  padding: '10px 14px',
                  borderRadius: radii.md,
                  border: isSelected
                    ? `1px solid ${colors.primary.main}`
                    : `1px solid ${colors.border.subtle}`,
                  backgroundColor: isSelected ? 'rgba(74, 144, 226, 0.08)' : colors.background.primary,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <div
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: radii.xs,
                    border: isSelected
                      ? `2px solid ${colors.primary.main}`
                      : `2px solid ${colors.border.subtle}`,
                    backgroundColor: isSelected ? colors.primary.main : 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ffffff',
                    fontSize: 11
                  }}
                >
                  {isSelected && <i className="fa fa-check" />}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span
                    style={{
                      fontSize: typography.fontSizes.sm,
                      fontWeight: isSelected ? typography.fontWeights.semibold : typography.fontWeights.medium,
                      color: colors.text.primary
                    }}
                  >
                    {role.Text}
                  </span>
                  <span style={{ fontSize: typography.fontSizes.xs, color: colors.text.secondary }}>
                    Role ID: {role.Id}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Footer Buttons */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: spacing.md,
          borderTop: `1px solid ${colors.border.subtle}`,
          marginTop: spacing.sm
        }}
      >
        <button
          type="button"
          onClick={handleBack}
          style={{
            padding: '8px 16px',
            borderRadius: radii.sm,
            border: `1px solid ${colors.border.subtle}`,
            backgroundColor: colors.background.primary,
            color: colors.text.primary,
            cursor: 'pointer',
            fontSize: typography.fontSizes.sm,
            fontWeight: typography.fontWeights.medium,
            display: 'flex',
            alignItems: 'center',
            gap: spacing.xs,
            transition: 'all 0.15s ease'
          }}
        >
          <i className="fa fa-angle-left" />
          <span>Back to Form</span>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm }}>
          <button
            type="button"
            disabled={saving}
            onClick={() => handleSave('Draft')}
            style={{
              padding: '8px 20px',
              borderRadius: radii.sm,
              border: `1px solid ${colors.border.subtle}`,
              backgroundColor: colors.background.tertiary,
              color: colors.text.primary,
              cursor: saving ? 'not-allowed' : 'pointer',
              fontSize: typography.fontSizes.sm,
              fontWeight: typography.fontWeights.medium,
              transition: 'all 0.15s ease'
            }}
          >
            {saving ? 'Saving...' : 'Save Draft'}
          </button>

          <button
            type="button"
            disabled={saving}
            onClick={() => handleSave('Active')}
            style={{
              padding: '8px 22px',
              borderRadius: radii.sm,
              border: 'none',
              backgroundColor: colors.primary.main,
              color: '#ffffff',
              cursor: saving ? 'not-allowed' : 'pointer',
              fontSize: typography.fontSizes.sm,
              fontWeight: typography.fontWeights.semibold,
              display: 'flex',
              alignItems: 'center',
              gap: spacing.xs,
              boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
              transition: 'background-color 0.15s ease'
            }}
          >
            {saving && <i className="fa fa-spinner fa-spin" />}
            <span>{saving ? 'Saving...' : 'Save & Approve'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
