import React, { useState, useEffect } from 'react';
import { apiFetch } from './utils/api';
import { colors, spacing, typography, radii, shadows, zIndex } from '../components/ui/tokens';
import { sessionHelper } from '../services/sessionHelper';

export interface ReferenceValueGroupItem {
  Id?: number;
  GroupCode: string;
  GroupName: string;
  Description?: string;
  ActiveFrom?: string | Date;
  ActiveTo?: string | Date | null;
  IsSortByDescription?: boolean | number;
  IsActive?: boolean;
  FacilityId?: number;
  [key: string]: any;
}

export interface ReferenceValueGroupModalProps {
  isOpen?: boolean;
  groupId?: number | null;
  onClose?: () => void;
  onSuccess?: () => void;
  // Bridged props if used as an isolated form
  reactProps?: {
    item?: ReferenceValueGroupItem;
    lookup?: {
      Facility?: Array<{ Id: number; Text: string }>;
    };
  };
  onAction?: (actionName: string, payload?: any) => void;
}

function formatDateForInput(val?: string | Date | null): string {
  if (!val) return '';
  if (typeof val === 'string' && val.length >= 10) {
    return val.substring(0, 10);
  }
  try {
    const d = new Date(val);
    if (isNaN(d.getTime())) return '';
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  } catch {
    return '';
  }
}

export const ReferenceValueGroupModal: React.FC<ReferenceValueGroupModalProps> = ({
  isOpen = true,
  groupId,
  onClose,
  onSuccess,
  reactProps,
  onAction,
}) => {
  const currentFacilityId = sessionHelper.getCurrentFacilityId() || 1;
  const handleClose = () => {
    if (onClose) onClose();
    else if (onAction) onAction('cancel');
  };

  // Form states
  const [groupCode, setGroupCode] = useState<string>('');
  const [groupName, setGroupName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [activeFrom, setActiveFrom] = useState<string>(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [activeTo, setActiveTo] = useState<string>('');
  const [isSortByDescription, setIsSortByDescription] = useState<boolean>(false);
  const [isActive, setIsActive] = useState<boolean>(true);

  // Status & loading
  const [loading, setLoading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [successToast, setSuccessToast] = useState<string>('');

  const targetId = groupId ?? reactProps?.item?.Id ?? 0;
  const isEdit = targetId > 0;

  // Load data when opening for edit
  useEffect(() => {
    if (!isOpen) return;

    setErrorMessage('');
    setSuccessToast('');

    // If bridged item was provided directly
    if (reactProps?.item && reactProps.item.Id === targetId) {
      const itm = reactProps.item;
      setGroupCode(itm.GroupCode || '');
      setGroupName(itm.GroupName || '');
      setDescription(itm.Description || '');
      setActiveFrom(formatDateForInput(itm.ActiveFrom) || new Date().toISOString().split('T')[0]);
      setActiveTo(formatDateForInput(itm.ActiveTo));
      setIsSortByDescription(Boolean(itm.IsSortByDescription));
      setIsActive(itm.IsActive !== false);
      return;
    }

    if (targetId > 0) {
      let isMounted = true;
      setLoading(true);

      apiFetch('SystemSettings/referencevaluegroup/GetReferenceValueGroupById', { Id: targetId })
        .then((res: any) => {
          if (!isMounted) return;
          const data = res?.Data || res;
          if (data) {
            setGroupCode(data.GroupCode || '');
            setGroupName(data.GroupName || '');
            setDescription(data.Description || '');
            setActiveFrom(formatDateForInput(data.ActiveFrom) || new Date().toISOString().split('T')[0]);
            setActiveTo(formatDateForInput(data.ActiveTo));
            setIsSortByDescription(Boolean(data.IsSortByDescription));
            setIsActive(data.IsActive !== false);
          }
        })
        .catch((err: any) => {
          if (!isMounted) return;
          console.error('Failed to load Reference Value Group details', err);
          setErrorMessage(err?.message || 'Failed to load Reference Value Group');
        })
        .finally(() => {
          if (isMounted) setLoading(false);
        });

      return () => {
        isMounted = false;
      };
    } else {
      // Reset form for create
      setGroupCode('');
      setGroupName('');
      setDescription('');
      setActiveFrom(new Date().toISOString().split('T')[0]);
      setActiveTo('');
      setIsSortByDescription(false);
      setIsActive(true);
    }
  }, [isOpen, targetId, reactProps?.item]);

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!groupCode.trim()) {
      setErrorMessage('Group Code is required.');
      return;
    }
    if (!groupName.trim()) {
      setErrorMessage('Group Name is required.');
      return;
    }
    if (!activeFrom) {
      setErrorMessage('Active From date is required.');
      return;
    }

    setSaving(true);
    setErrorMessage('');

    const payload: ReferenceValueGroupItem = {
      Id: targetId > 0 ? targetId : undefined,
      GroupCode: groupCode.trim(),
      GroupName: groupName.trim(),
      Description: description.trim(),
      ActiveFrom: `${activeFrom} 00:00:00`,
      ActiveTo: activeTo ? `${activeTo} 23:59:59` : null,
      IsSortByDescription: isSortByDescription ? 1 : 0,
      IsActive: isActive,
      FacilityId: currentFacilityId,
    };

    if (onAction) {
      onAction('saveItem', payload);
    }

    try {
      const actionName =
        targetId > 0
          ? 'SystemSettings/referencevaluegroup/UpdateReferenceValueGroup'
          : 'SystemSettings/referencevaluegroup/AddReferenceValueGroup';

      await apiFetch(actionName, { Data: payload });

      setSuccessToast(
        targetId > 0
          ? 'Reference Value Group updated successfully!'
          : 'Reference Value Group created successfully!'
      );

      setTimeout(() => {
        if (onSuccess) onSuccess();
        handleClose();
      }, 600);
    } catch (err: any) {
      console.error('Error saving Reference Value Group', err);
      setErrorMessage(err?.message || 'Failed to save Reference Value Group. Please check fields and try again.');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.55)',
        backdropFilter: 'blur(3px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: zIndex.modal || 1050,
        padding: spacing.md,
      }}
      onClick={handleClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '560px',
          backgroundColor: colors.surface || '#ffffff',
          borderRadius: radii.xl || '16px',
          boxShadow: shadows.xl || '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '90vh',
          overflow: 'hidden',
          animation: 'fadeInScale 0.2s ease-out',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: `${spacing.md} ${spacing.lg}`,
            borderBottom: `1px solid ${colors.border || '#e2e8f0'}`,
            backgroundColor: '#f8fafc',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: radii.md || '8px',
                backgroundColor: 'rgba(37, 99, 235, 0.1)',
                color: colors.primary?.main || '#2563eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '16px',
              }}
            >
              <i className="fa-solid fa-layer-group" />
            </div>
            <div>
              <h3
                style={{
                  margin: 0,
                  fontSize: '17px',
                  fontWeight: 600,
                  color: colors.textMain || '#0f172a',
                  fontFamily: typography.fontFamily,
                }}
              >
                {isEdit ? 'Edit Reference Value Group' : 'Add Reference Value Group'}
              </h3>
              <span style={{ fontSize: '12px', color: colors.textMuted || '#64748b' }}>
                {isEdit ? `Editing Group Code: ${groupCode}` : 'Configure reference value master category'}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            style={{
              width: 32,
              height: 32,
              borderRadius: radii.sm || '6px',
              border: 'none',
              background: 'transparent',
              color: colors.textMuted || '#64748b',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '16px',
            }}
          >
            <i className="fa-solid fa-xmark" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
          <div style={{ padding: spacing.lg, overflowY: 'auto', flex: 1, position: 'relative' }}>
            {loading && (
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  backgroundColor: 'rgba(255,255,255,0.85)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 10,
                }}
              >
                <i className="fa-solid fa-circle-notch fa-spin" style={{ fontSize: '28px', color: colors.primary?.main || '#2563eb' }} />
              </div>
            )}

            {/* Error & Success Messages */}
            {errorMessage && (
              <div
                style={{
                  padding: `${spacing.sm} ${spacing.md}`,
                  backgroundColor: '#fef2f2',
                  border: '1px solid #fecaca',
                  borderRadius: radii.md || '8px',
                  color: '#b91c1c',
                  fontSize: '13px',
                  marginBottom: spacing.md,
                  display: 'flex',
                  alignItems: 'center',
                  gap: spacing.sm,
                }}
              >
                <i className="fa-solid fa-circle-exclamation" />
                <span>{errorMessage}</span>
              </div>
            )}

            {successToast && (
              <div
                style={{
                  padding: `${spacing.sm} ${spacing.md}`,
                  backgroundColor: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  borderRadius: radii.md || '8px',
                  color: '#15803d',
                  fontSize: '13px',
                  marginBottom: spacing.md,
                  display: 'flex',
                  alignItems: 'center',
                  gap: spacing.sm,
                }}
              >
                <i className="fa-solid fa-circle-check" />
                <span>{successToast}</span>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: spacing.md }}>
              {/* Group Code */}
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: colors.textMain || '#0f172a',
                    marginBottom: 4,
                  }}
                >
                  Group Code <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. LAB_GRP_01"
                  value={groupCode}
                  onChange={(e) => setGroupCode(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: radii.md || '8px',
                    border: `1px solid ${colors.border || '#cbd5e1'}`,
                    fontSize: '13px',
                    outline: 'none',
                    backgroundColor: '#ffffff',
                  }}
                />
              </div>

              {/* Group Name */}
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: colors.textMain || '#0f172a',
                    marginBottom: 4,
                  }}
                >
                  Group Name <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Hematology Values"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: radii.md || '8px',
                    border: `1px solid ${colors.border || '#cbd5e1'}`,
                    fontSize: '13px',
                    outline: 'none',
                    backgroundColor: '#ffffff',
                  }}
                />
              </div>

              {/* Description (Full Width) */}
              <div style={{ gridColumn: 'span 2' }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: colors.textMain || '#0f172a',
                    marginBottom: 4,
                  }}
                >
                  Description
                </label>
                <input
                  type="text"
                  placeholder="Brief description of reference value group..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: radii.md || '8px',
                    border: `1px solid ${colors.border || '#cbd5e1'}`,
                    fontSize: '13px',
                    outline: 'none',
                    backgroundColor: '#ffffff',
                  }}
                />
              </div>

              {/* Active From */}
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: colors.textMain || '#0f172a',
                    marginBottom: 4,
                  }}
                >
                  Active From <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="date"
                  value={activeFrom}
                  onChange={(e) => setActiveFrom(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '7px 10px',
                    borderRadius: radii.md || '8px',
                    border: `1px solid ${colors.border || '#cbd5e1'}`,
                    fontSize: '13px',
                    outline: 'none',
                    backgroundColor: '#ffffff',
                  }}
                />
              </div>

              {/* Active To */}
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: colors.textMain || '#0f172a',
                    marginBottom: 4,
                  }}
                >
                  Active To
                </label>
                <input
                  type="date"
                  value={activeTo}
                  onChange={(e) => setActiveTo(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '7px 10px',
                    borderRadius: radii.md || '8px',
                    border: `1px solid ${colors.border || '#cbd5e1'}`,
                    fontSize: '13px',
                    outline: 'none',
                    backgroundColor: '#ffffff',
                  }}
                />
              </div>

              {/* Checkboxes */}
              <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm, marginTop: 4 }}>
                <input
                  type="checkbox"
                  id="chkSortDesc"
                  checked={isSortByDescription}
                  onChange={(e) => setIsSortByDescription(e.target.checked)}
                  style={{ width: 16, height: 16, cursor: 'pointer' }}
                />
                <label
                  htmlFor="chkSortDesc"
                  style={{ fontSize: '13px', color: colors.textMain || '#0f172a', cursor: 'pointer' }}
                >
                  Sort By Description
                </label>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm, marginTop: 4 }}>
                <input
                  type="checkbox"
                  id="chkIsActive"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  style={{ width: 16, height: 16, cursor: 'pointer' }}
                />
                <label
                  htmlFor="chkIsActive"
                  style={{ fontSize: '13px', color: colors.textMain || '#0f172a', cursor: 'pointer' }}
                >
                  Active
                </label>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: spacing.sm,
              padding: `${spacing.md} ${spacing.lg}`,
              borderTop: `1px solid ${colors.border || '#e2e8f0'}`,
              backgroundColor: '#f8fafc',
            }}
          >
            <button
              type="button"
              onClick={handleClose}
              disabled={saving}
              style={{
                padding: '8px 16px',
                borderRadius: radii.md || '8px',
                border: `1px solid ${colors.border || '#cbd5e1'}`,
                backgroundColor: '#ffffff',
                color: colors.textMain || '#334155',
                fontSize: '13px',
                fontWeight: 500,
                cursor: saving ? 'not-allowed' : 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || loading}
              style={{
                padding: '8px 20px',
                borderRadius: radii.md || '8px',
                border: 'none',
                backgroundColor: colors.primary?.main || '#2563eb',
                color: '#ffffff',
                fontSize: '13px',
                fontWeight: 600,
                cursor: saving || loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: spacing.xs,
              }}
            >
              {saving ? (
                <>
                  <i className="fa-solid fa-circle-notch fa-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <i className="fa-solid fa-check" />
                  <span>{isEdit ? 'Update Group' : 'Save Group'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
