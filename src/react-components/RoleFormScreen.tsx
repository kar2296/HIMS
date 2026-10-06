import React, { useState, useEffect } from 'react';
import { apiFetch } from './utils/api';
import { colors, spacing, typography, radii } from '../components/ui/tokens';

export interface RoleData {
  Id?: number;
  RoleCode: string;
  RoleName: string;
  Description?: string;
  IsActive: boolean;
  IsAllFacility: boolean;
  LandingControlId?: number | null;
  ActiveStatusId?: number;
  FacilityId?: number;
  ActiveFrom?: string;
  [key: string]: any;
}

export interface RoleFormScreenProps {
  reactProps?: {
    roleId?: number;
    code?: string;
    item?: RoleData;
  };
  roleId?: number;
  onAction?: (actionName: string, payload?: any) => void;
  onSaved?: (roleId: number) => void;
}

export const RoleFormScreen: React.FC<RoleFormScreenProps> = ({ reactProps, roleId: propRoleId, onAction, onSaved }) => {
  const effectiveRoleId = propRoleId ?? reactProps?.roleId ?? 0;

  const [formData, setFormData] = useState<RoleData>({
    Id: effectiveRoleId,
    RoleCode: '',
    RoleName: '',
    Description: '',
    IsActive: true,
    IsAllFacility: false,
    LandingControlId: null,
    ActiveStatusId: 2
  });

  const [loading, setLoading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [controlOptions, setControlOptions] = useState<Array<{ Id: number; Text: string }>>([]);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Load Lookups (Control)
  useEffect(() => {
    let isMounted = true;
    const fetchLookups = async () => {
      try {
        const res = await apiFetch<any>('General/Options/getoptions', [{ Key: 'Control' }]);
        if (isMounted && res?.Control) {
          setControlOptions(res.Control);
        }
      } catch (err) {
        console.error('Failed to load Control lookups:', err);
      }
    };

    fetchLookups();

    return () => {
      isMounted = false;
    };
  }, []);

  // Load Existing Role Details
  useEffect(() => {
    if (!effectiveRoleId || effectiveRoleId <= 0) return;

    let isMounted = true;
    setLoading(true);
    setErrorMessage(null);

    const loadRole = async () => {
      try {
        const res = await apiFetch<any>('SystemSettings/role/GetRoleById', { Id: effectiveRoleId });

        if (isMounted && res) {
          const roleData = res.Data || res;
          setFormData({
            ...roleData,
            IsActive: roleData.IsActive ?? (roleData.ActiveStatusId === 2),
            IsAllFacility: roleData.IsAllFacility ?? false,
            LandingControlId: roleData.LandingControlId ?? null
          });
        }
      } catch (err: any) {
        if (isMounted) {
          console.error('Failed to load role details:', err);
          setErrorMessage(err.message || 'Failed to load role details.');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadRole();

    return () => {
      isMounted = false;
    };
  }, [effectiveRoleId]);

  const handleChange = (field: keyof RoleData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value
    }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const validate = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.RoleCode?.trim()) {
      newErrors.RoleCode = 'Role Code is required';
    }
    if (!formData.RoleName?.trim()) {
      newErrors.RoleName = 'Role Name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const executeSave = async (statusId: number) => {
    if (!validate()) {
      setErrorMessage('Please fill in all mandatory fields.');
      return;
    }

    setSaving(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const payloadItem = {
        ...formData,
        ActiveStatusId: statusId,
        FacilityId: formData.IsAllFacility ? -1 : (formData.FacilityId || 1),
        ActiveFrom: formData.ActiveFrom || new Date().toISOString()
      };

      const isUpdate = Boolean(effectiveRoleId && effectiveRoleId > 0);
      const actionUrl = isUpdate ? 'SystemSettings/role/UpdateRole' : 'SystemSettings/role/AddRole';

      const res = await apiFetch<any>(actionUrl, { Data: payloadItem });

      const newId = typeof res === 'number' ? res : (res?.Data?.Id || res?.Id || effectiveRoleId);

      setSuccessMessage('Role saved successfully!');

      if (onSaved) onSaved(newId);
      if (onAction) onAction('saveComplete', { id: newId });

      // If we just created a new role, navigate to its tab view
      if (!isUpdate && newId) {
        setTimeout(() => {
          if (window.location.hash.startsWith('#/app')) {
            window.location.hash = `#/app/role/${newId}/general`;
          } else {
            window.location.href = `/app/role/${newId}`;
          }
        }, 800);
      }
    } catch (err: any) {
      console.error('Failed to save role:', err);
      setErrorMessage(err.message || 'Failed to save role.');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveDraft = () => {
    executeSave(1); // Draft
  };

  const handleSaveAndApprove = () => {
    executeSave(formData.IsActive ? 2 : 3); // Active or Inactive
  };

  const handleBack = () => {
    if (onAction) {
      onAction('back');
      return;
    }
    if (window.location.hash.startsWith('#/app')) {
      window.location.hash = '#/app/roles';
    } else {
      window.location.href = '/app/roles';
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: spacing.xl, color: colors.text.secondary }}>
        <i className="fa fa-spinner fa-spin fa-2x" style={{ marginBottom: spacing.sm, color: colors.primary.main }} />
        <div>Loading role profile...</div>
      </div>
    );
  }

  return (
    <div
      style={{
        backgroundColor: colors.background.primary,
        borderRadius: radii.md,
        padding: spacing.lg,
        display: 'flex',
        flexDirection: 'column',
        gap: spacing.lg
      }}
    >
      {/* Alert Banners */}
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

      {/* Form Fields Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: spacing.lg
        }}
      >
        {/* Role Code */}
        <div>
          <label
            style={{
              display: 'block',
              fontSize: typography.fontSizes.xs,
              fontWeight: typography.fontWeights.medium,
              color: colors.text.secondary,
              marginBottom: spacing.xs
            }}
          >
            Role Code <span style={{ color: colors.state.danger }}>*</span>
          </label>
          <input
            type="text"
            placeholder="e.g. ROLE_DOCTOR, NURSING_LEAD"
            value={formData.RoleCode}
            onChange={(e) => handleChange('RoleCode', e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px',
              fontSize: typography.fontSizes.sm,
              borderRadius: radii.sm,
              border: `1px solid ${errors.RoleCode ? colors.state.danger : colors.border.subtle}`,
              outline: 'none',
              backgroundColor: colors.background.primary,
              color: colors.text.primary
            }}
          />
          {errors.RoleCode && (
            <div style={{ color: colors.state.danger, fontSize: typography.fontSizes.xs, marginTop: 4 }}>
              {errors.RoleCode}
            </div>
          )}
        </div>

        {/* Role Name */}
        <div>
          <label
            style={{
              display: 'block',
              fontSize: typography.fontSizes.xs,
              fontWeight: typography.fontWeights.medium,
              color: colors.text.secondary,
              marginBottom: spacing.xs
            }}
          >
            Role Name <span style={{ color: colors.state.danger }}>*</span>
          </label>
          <input
            type="text"
            placeholder="e.g. Senior Medical Consultant"
            value={formData.RoleName}
            onChange={(e) => handleChange('RoleName', e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px',
              fontSize: typography.fontSizes.sm,
              borderRadius: radii.sm,
              border: `1px solid ${errors.RoleName ? colors.state.danger : colors.border.subtle}`,
              outline: 'none',
              backgroundColor: colors.background.primary,
              color: colors.text.primary
            }}
          />
          {errors.RoleName && (
            <div style={{ color: colors.state.danger, fontSize: typography.fontSizes.xs, marginTop: 4 }}>
              {errors.RoleName}
            </div>
          )}
        </div>

        {/* Landing Control */}
        <div>
          <label
            style={{
              display: 'block',
              fontSize: typography.fontSizes.xs,
              fontWeight: typography.fontWeights.medium,
              color: colors.text.secondary,
              marginBottom: spacing.xs
            }}
          >
            Landing Screen / Control
          </label>
          <select
            value={formData.LandingControlId ?? ''}
            onChange={(e) => handleChange('LandingControlId', e.target.value ? Number(e.target.value) : null)}
            style={{
              width: '100%',
              padding: '8px 12px',
              fontSize: typography.fontSizes.sm,
              borderRadius: radii.sm,
              border: `1px solid ${colors.border.subtle}`,
              outline: 'none',
              backgroundColor: colors.background.primary,
              color: colors.text.primary
            }}
          >
            <option value="">-- Select Default Landing Menu --</option>
            {controlOptions.map((opt) => (
              <option key={opt.Id} value={opt.Id}>
                {opt.Text}
              </option>
            ))}
          </select>
        </div>

        {/* Description */}
        <div style={{ gridColumn: '1 / -1' }}>
          <label
            style={{
              display: 'block',
              fontSize: typography.fontSizes.xs,
              fontWeight: typography.fontWeights.medium,
              color: colors.text.secondary,
              marginBottom: spacing.xs
            }}
          >
            Role Details / Description
          </label>
          <textarea
            rows={3}
            placeholder="Enter responsibilities, notes, or role description..."
            value={formData.Description || ''}
            onChange={(e) => handleChange('Description', e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px',
              fontSize: typography.fontSizes.sm,
              borderRadius: radii.sm,
              border: `1px solid ${colors.border.subtle}`,
              outline: 'none',
              backgroundColor: colors.background.primary,
              color: colors.text.primary,
              resize: 'vertical'
            }}
          />
        </div>

        {/* Checkbox Options */}
        <div style={{ display: 'flex', alignItems: 'center', gap: spacing.xl, gridColumn: '1 / -1', marginTop: spacing.xs }}>
          <label style={{ display: 'inline-flex', alignItems: 'center', gap: spacing.sm, cursor: 'pointer', userSelect: 'none' }}>
            <input
              type="checkbox"
              checked={Boolean(formData.IsActive)}
              onChange={(e) => handleChange('IsActive', e.target.checked)}
              style={{ width: 18, height: 18, accentColor: colors.primary.main, cursor: 'pointer' }}
            />
            <span style={{ fontSize: typography.fontSizes.sm, fontWeight: typography.fontWeights.medium, color: colors.text.primary }}>
              Active Role
            </span>
          </label>

          <label style={{ display: 'inline-flex', alignItems: 'center', gap: spacing.sm, cursor: 'pointer', userSelect: 'none' }}>
            <input
              type="checkbox"
              checked={Boolean(formData.IsAllFacility)}
              onChange={(e) => handleChange('IsAllFacility', e.target.checked)}
              style={{ width: 18, height: 18, accentColor: colors.primary.main, cursor: 'pointer' }}
            />
            <span style={{ fontSize: typography.fontSizes.sm, fontWeight: typography.fontWeights.medium, color: colors.text.primary }}>
              All Facilities (Enterprise-wide access)
            </span>
          </label>
        </div>
      </div>

      {/* Action Buttons Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderTop: `1px solid ${colors.border.subtle}`,
          paddingTop: spacing.md,
          marginTop: spacing.sm
        }}
      >
        <button
          type="button"
          onClick={handleBack}
          disabled={saving}
          style={{
            padding: '8px 18px',
            borderRadius: radii.sm,
            border: `1px solid ${colors.border.subtle}`,
            backgroundColor: colors.background.secondary,
            color: colors.text.primary,
            fontSize: typography.fontSizes.sm,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: spacing.xs
          }}
        >
          <i className="fa fa-angle-left" /> Back to Roles
        </button>

        <div style={{ display: 'flex', gap: spacing.sm }}>
          <button
            type="button"
            onClick={handleSaveDraft}
            disabled={saving}
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
            onClick={handleSaveAndApprove}
            disabled={saving}
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
