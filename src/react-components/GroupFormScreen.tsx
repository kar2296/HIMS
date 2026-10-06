import React, { useState, useEffect } from 'react';
import { apiFetch } from './utils/api';
import { colors, spacing, typography, radii } from '../components/ui/tokens';

export interface GroupFormData {
  Id?: number;
  GroupCode: string;
  GroupName: string;
  Description?: string;
  IsActive?: boolean;
  IsAllFacility?: boolean;
  FacilityId?: number;
  ActiveStatusId?: number;
  [key: string]: any;
}

export interface GroupFormScreenProps {
  groupId?: number;
  reactProps?: {
    groupId?: number;
    groupName?: string;
    item?: GroupFormData;
    isSaving?: boolean;
  };
  onAction?: (actionName: string, payload?: any) => void;
  onSaved?: (newId: number) => void;
}

export const GroupFormScreen: React.FC<GroupFormScreenProps> = ({
  groupId: directGroupId,
  reactProps,
  onAction,
  onSaved
}) => {
  // Extract effective groupId
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

  const effectiveGroupId = parseEffectiveId();

  const [formData, setFormData] = useState<GroupFormData>({
    Id: effectiveGroupId,
    GroupCode: '',
    GroupName: '',
    Description: '',
    IsActive: true,
    IsAllFacility: false,
    FacilityId: undefined,
    ...(reactProps?.item || {})
  });

  const [loading, setLoading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({});

  // Load Existing Group Details
  useEffect(() => {
    if (!effectiveGroupId || effectiveGroupId <= 0) return;

    let isMounted = true;
    setLoading(true);
    setErrorMessage(null);

    const loadGroup = async () => {
      try {
        const res = await apiFetch<any>('SystemSettings/group/GetGroupById', { Id: effectiveGroupId });

        if (isMounted && res) {
          const groupData = res.Data || res;
          setFormData({
            ...groupData,
            IsActive: groupData.IsActive ?? (groupData.ActiveStatusId === 2),
            IsAllFacility: groupData.IsAllFacility ?? false
          });
        }
      } catch (err: any) {
        if (isMounted) {
          console.error('Failed to load group details:', err);
          setErrorMessage(err.message || 'Failed to load group details.');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadGroup();

    return () => {
      isMounted = false;
    };
  }, [effectiveGroupId]);

  const validate = (): boolean => {
    const errors: { [key: string]: string } = {};
    if (!formData.GroupCode?.trim()) {
      errors.GroupCode = 'Group Code is required.';
    }
    if (!formData.GroupName?.trim()) {
      errors.GroupName = 'Group Name is required.';
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (field: keyof GroupFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (validationErrors[field]) {
      setValidationErrors((prev) => {
        const copy = { ...prev };
        delete copy[field];
        return copy;
      });
    }
  };

  const handleSave = async (isApprove: boolean = false) => {
    if (!validate()) {
      setErrorMessage('Please fix the validation errors before saving.');
      return;
    }

    setSaving(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const statusId = isApprove ? 2 : (formData.IsActive ? 2 : 1);
      const payloadItem = {
        ...formData,
        ActiveStatusId: statusId,
        IsActive: formData.IsActive ?? (statusId === 2),
        FacilityId: formData.IsAllFacility ? -1 : (formData.FacilityId || 1),
        PatientStatus: isApprove ? 'Active' : 'Draft'
      };

      const isUpdate = Boolean(effectiveGroupId && effectiveGroupId > 0);
      const actionUrl = isUpdate ? 'SystemSettings/group/UpdateGroup' : 'SystemSettings/group/AddGroup';

      const res = await apiFetch<any>(actionUrl, { Data: payloadItem });

      const newId = typeof res === 'number' ? res : (res?.Data?.Id || res?.Id || effectiveGroupId);

      setSuccessMessage(`Group ${isUpdate ? 'updated' : 'created'} successfully!`);

      if (onSaved) onSaved(newId);
      if (onAction) onAction('saveComplete', { id: newId });

      // If we just created a new group, navigate to its tab view
      if (!isUpdate && newId) {
        setTimeout(() => {
          if (window.location.hash.startsWith('#/app')) {
            window.location.hash = `#/app/group/${newId}/general`;
          } else {
            window.location.href = `/app/group/${newId}/general`;
          }
        }, 800);
      }
    } catch (err: any) {
      console.error('Failed to save group:', err);
      setErrorMessage(err.message || 'Failed to save group.');
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    if (onAction) {
      onAction('backToList');
    } else {
      if (window.location.hash.startsWith('#/app')) {
        window.location.hash = '#/app/groups';
      } else {
        window.location.href = '/app/groups';
      }
    }
  };

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 280,
          color: colors.text.secondary
        }}
      >
        <i className="fa fa-spinner fa-spin fa-2x" style={{ color: colors.primary.main, marginBottom: spacing.sm }} />
        <span>Loading group information...</span>
      </div>
    );
  }

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

      {/* Form Fields Section */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: spacing.lg
        }}
      >
        {/* Group Code */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.xs }}>
          <label style={{ fontSize: typography.fontSizes.xs, fontWeight: typography.fontWeights.semibold, color: colors.text.secondary }}>
            Group Code <span style={{ color: colors.state?.danger || '#ef4444' }}>*</span>
          </label>
          <input
            type="text"
            placeholder="e.g. GRP_NURSE, GRP_ADMIN"
            value={formData.GroupCode || ''}
            onChange={(e) => handleInputChange('GroupCode', e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: radii.sm,
              border: `1px solid ${validationErrors.GroupCode ? (colors.state?.danger || '#ef4444') : colors.border.subtle}`,
              backgroundColor: colors.background.primary,
              color: colors.text.primary,
              fontSize: typography.fontSizes.sm,
              outline: 'none',
              fontFamily: 'monospace'
            }}
          />
          {validationErrors.GroupCode && (
            <span style={{ fontSize: typography.fontSizes.xs, color: colors.state?.danger || '#ef4444' }}>
              {validationErrors.GroupCode}
            </span>
          )}
        </div>

        {/* Group Name */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.xs }}>
          <label style={{ fontSize: typography.fontSizes.xs, fontWeight: typography.fontWeights.semibold, color: colors.text.secondary }}>
            Group Name <span style={{ color: colors.state?.danger || '#ef4444' }}>*</span>
          </label>
          <input
            type="text"
            placeholder="e.g. Nursing Staff Group"
            value={formData.GroupName || ''}
            onChange={(e) => handleInputChange('GroupName', e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: radii.sm,
              border: `1px solid ${validationErrors.GroupName ? (colors.state?.danger || '#ef4444') : colors.border.subtle}`,
              backgroundColor: colors.background.primary,
              color: colors.text.primary,
              fontSize: typography.fontSizes.sm,
              outline: 'none'
            }}
          />
          {validationErrors.GroupName && (
            <span style={{ fontSize: typography.fontSizes.xs, color: colors.state?.danger || '#ef4444' }}>
              {validationErrors.GroupName}
            </span>
          )}
        </div>

        {/* Description */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.xs }}>
          <label style={{ fontSize: typography.fontSizes.xs, fontWeight: typography.fontWeights.semibold, color: colors.text.secondary }}>
            Description
          </label>
          <input
            type="text"
            placeholder="Short purpose of this group..."
            value={formData.Description || ''}
            onChange={(e) => handleInputChange('Description', e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: radii.sm,
              border: `1px solid ${colors.border.subtle}`,
              backgroundColor: colors.background.primary,
              color: colors.text.primary,
              fontSize: typography.fontSizes.sm,
              outline: 'none'
            }}
          />
        </div>
      </div>

      {/* Checkbox Options */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: spacing.xl,
          paddingTop: spacing.sm,
          borderTop: `1px solid ${colors.border.subtle}`
        }}
      >
        {/* Is Active */}
        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: spacing.sm,
            cursor: 'pointer',
            fontSize: typography.fontSizes.sm,
            color: colors.text.primary
          }}
        >
          <input
            type="checkbox"
            checked={Boolean(formData.IsActive)}
            onChange={(e) => handleInputChange('IsActive', e.target.checked)}
            style={{ width: 16, height: 16, accentColor: colors.primary.main, cursor: 'pointer' }}
          />
          <span style={{ fontWeight: typography.fontWeights.medium }}>Active</span>
        </label>

        {/* Is All Facility */}
        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: spacing.sm,
            cursor: 'pointer',
            fontSize: typography.fontSizes.sm,
            color: colors.text.primary
          }}
        >
          <input
            type="checkbox"
            checked={Boolean(formData.IsAllFacility)}
            onChange={(e) => handleInputChange('IsAllFacility', e.target.checked)}
            style={{ width: 16, height: 16, accentColor: colors.primary.main, cursor: 'pointer' }}
          />
          <span style={{ fontWeight: typography.fontWeights.medium }}>Applies to All Facilities</span>
        </label>
      </div>

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
          <span>Back to List</span>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm }}>
          <button
            type="button"
            disabled={saving}
            onClick={() => handleSave(false)}
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
            onClick={() => handleSave(true)}
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
