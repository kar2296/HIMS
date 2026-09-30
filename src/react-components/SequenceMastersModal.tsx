import React, { useState, useEffect } from 'react';
import { apiFetch } from './utils/api';
import { colors, spacing, typography, radii, shadows, zIndex } from '../components/ui/tokens';

export interface SequenceMasterItem {
  Id?: number;
  SeqName?: string;
  FacilityId?: number;
  SeqPrefix?: string;
  SeqStartId?: number | string;
  SeqLastId?: number | string;
  SeqIncSize?: number | string;
  SeqBlockSize?: number | string;
  ActiveStatusId?: number;
  IsActive?: boolean;
  Facility?: {
    Id: number;
    FacilityName: string;
  };
  [key: string]: any;
}

export interface SequenceMastersModalProps {
  isOpen?: boolean;
  sequenceId?: number | null;
  onClose?: () => void;
  onSuccess?: () => void;
  reactProps?: {
    item?: SequenceMasterItem;
  };
  onAction?: (actionName: string, payload?: any) => void;
}

export const SequenceMastersModal: React.FC<SequenceMastersModalProps> = ({
  isOpen = true,
  sequenceId,
  onClose,
  onSuccess,
  reactProps,
  onAction,
}) => {
  const targetId = sequenceId ?? reactProps?.item?.Id ?? 0;
  const isEdit = targetId > 0;

  // Form Fields
  const [seqData, setSeqData] = useState<SequenceMasterItem | null>(null);
  const [seqPrefix, setSeqPrefix] = useState<string>('');
  const [seqStartId, setSeqStartId] = useState<string | number>('');

  // Status
  const [loading, setLoading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [successToast, setSuccessToast] = useState<string>('');

  const handleClose = () => {
    if (onClose) onClose();
    else if (onAction) onAction('cancel');
  };

  // Load item
  useEffect(() => {
    if (!isOpen) return;

    setErrorMessage('');
    setSuccessToast('');

    // If item was passed directly
    if (reactProps?.item && reactProps.item.Id === targetId) {
      const itm = reactProps.item;
      setSeqData(itm);
      setSeqPrefix(itm.SeqPrefix || '');
      setSeqStartId(itm.SeqStartId ?? '');
      return;
    }

    if (targetId > 0) {
      let isMounted = true;
      setLoading(true);

      apiFetch('General/SequenceMasters/GetSequenceMastersById', { Id: targetId })
        .then((res: any) => {
          if (!isMounted) return;
          const data = res?.Data || res;
          if (data) {
            setSeqData(data);
            setSeqPrefix(data.SeqPrefix || '');
            setSeqStartId(data.SeqStartId ?? '');
          }
        })
        .catch((err: any) => {
          if (!isMounted) return;
          console.error('Failed to load Sequence Master details:', err);
          setErrorMessage(err?.message || 'Failed to load Sequence Master details.');
        })
        .finally(() => {
          if (isMounted) setLoading(false);
        });

      return () => {
        isMounted = false;
      };
    } else {
      setSeqData(null);
      setSeqPrefix('');
      setSeqStartId('');
    }
  }, [isOpen, targetId, reactProps?.item]);

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    setSaving(true);
    setErrorMessage('');

    const payload: SequenceMasterItem = {
      ...(seqData || {}),
      Id: targetId > 0 ? targetId : undefined,
      SeqPrefix: seqPrefix.trim(),
      SeqStartId: seqStartId !== '' ? Number(seqStartId) : 1,
      ActiveStatusId: 1,
    };

    if (onAction) {
      onAction('saveItem', payload);
    }

    try {
      const actionName =
        targetId > 0
          ? 'General/SequenceMasters/UpdateSequenceMasters'
          : 'General/SequenceMasters/AddSequenceMasters';

      await apiFetch(actionName, { Data: payload });

      setSuccessToast(
        targetId > 0 ? 'Sequence updated successfully!' : 'Sequence created successfully!'
      );

      setTimeout(() => {
        if (onSuccess) onSuccess();
        handleClose();
      }, 600);
    } catch (err: any) {
      console.error('Error saving Sequence Master:', err);
      setErrorMessage(err?.message || 'Failed to save Sequence Master.');
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
          maxWidth: '520px',
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
        {/* Modal Header */}
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
              <i className="fa-solid fa-arrow-down-1-9" />
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
                {isEdit ? 'Edit Sequence Master' : 'Add Sequence Master'}
              </h3>
              <span style={{ fontSize: '12px', color: colors.textMuted || '#64748b' }}>
                {seqData?.SeqName ? `Sequence: ${seqData.SeqName}` : 'Configure ID numbering rule'}
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

            {/* Context Info Box */}
            {seqData && (
              <div
                style={{
                  backgroundColor: '#f8fafc',
                  border: `1px solid ${colors.border || '#e2e8f0'}`,
                  borderRadius: radii.md || '8px',
                  padding: spacing.md,
                  marginBottom: spacing.lg,
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: spacing.sm,
                  fontSize: '12px',
                }}
              >
                <div>
                  <span style={{ color: colors.textMuted || '#64748b' }}>Sequence Name:</span>
                  <div style={{ fontWeight: 600, color: colors.textMain || '#0f172a', marginTop: 2 }}>
                    {seqData.SeqName || '-'}
                  </div>
                </div>
                <div>
                  <span style={{ color: colors.textMuted || '#64748b' }}>Facility:</span>
                  <div style={{ fontWeight: 600, color: colors.textMain || '#0f172a', marginTop: 2 }}>
                    {seqData.Facility?.FacilityName || '-'}
                  </div>
                </div>
                <div>
                  <span style={{ color: colors.textMuted || '#64748b' }}>Last ID:</span>
                  <div style={{ fontWeight: 600, color: colors.primary?.main || '#2563eb', marginTop: 2 }}>
                    {seqData.SeqLastId ?? '-'}
                  </div>
                </div>
                <div>
                  <span style={{ color: colors.textMuted || '#64748b' }}>Increment / Block:</span>
                  <div style={{ fontWeight: 600, color: colors.textMain || '#0f172a', marginTop: 2 }}>
                    {seqData.SeqIncSize ?? 1} / {seqData.SeqBlockSize ?? 1}
                  </div>
                </div>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: spacing.md }}>
              {/* Prefix */}
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
                  Sequence Prefix
                </label>
                <input
                  type="text"
                  placeholder="e.g. UHID-, INV-"
                  value={seqPrefix}
                  onChange={(e) => setSeqPrefix(e.target.value)}
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

              {/* Start ID */}
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
                  Start ID
                </label>
                <input
                  type="number"
                  placeholder="e.g. 1"
                  value={seqStartId}
                  onChange={(e) => setSeqStartId(e.target.value)}
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
            </div>
          </div>

          {/* Modal Footer */}
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
                  <span>Save Sequence</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
