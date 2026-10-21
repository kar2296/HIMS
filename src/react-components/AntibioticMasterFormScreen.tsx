import React, { useState, useEffect } from 'react';
import { colors, spacing, typography, radii, shadows } from '../components/ui/tokens';
import { callBackendApi } from '../services/apiService';
import { sessionHelper } from '../services/sessionHelper';

export interface AntibioticMasterFormScreenProps {
  id?: number | string;
  reactProps?: {
    id?: number;
    item?: any;
    lookup?: {
      Facility?: { Id: number; Text: string }[];
      AntibioticType?: { Id: number; Text: string }[];
    };
  };
  onAction?: (actionName: string, payload?: any) => void;
  onNavigate?: (stateName: string, params?: Record<string, any>) => void;
  onClose?: () => void;
}

export const AntibioticMasterFormScreen: React.FC<AntibioticMasterFormScreenProps> = ({
  id,
  reactProps,
  onAction,
  onNavigate,
  onClose,
}) => {
  const antibioticId = Number(reactProps?.id ?? id ?? 0);
  const isEdit = antibioticId > 0;

  const [code, setCode] = useState<string>('');
  const [antibioticName, setAntibioticName] = useState<string>('');
  const [mnemonic, setMnemonic] = useState<string>('');
  const [displayOrder, setDisplayOrder] = useState<string>('');
  const [typeId, setTypeId] = useState<number>(-1);
  const [isActive, setIsActive] = useState<boolean>(true);
  const [facilityId, setFacilityId] = useState<number>(sessionHelper.getFacilityId() || 1);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [antibioticTypes, setAntibioticTypes] = useState<{ Id: number; Text: string }[]>(
    reactProps?.lookup?.AntibioticType || [
      { Id: 1, Text: 'Beta-lactams (Penicillins, Cephalosporins)' },
      { Id: 2, Text: 'Aminoglycosides (Gentamicin, Amikacin)' },
      { Id: 3, Text: 'Fluoroquinolones (Ciprofloxacin, Levofloxacin)' },
      { Id: 4, Text: 'Macrolides (Azithromycin, Clarithromycin)' },
      { Id: 5, Text: 'Glycopeptides (Vancomycin, Teicoplanin)' },
      { Id: 6, Text: 'Carbapenems (Meropenem, Imipenem)' },
      { Id: 7, Text: 'Tetracyclines (Doxycycline)' },
      { Id: 8, Text: 'Oxazolidinones (Linezolid)' },
    ]
  );

  useEffect(() => {
    if (reactProps?.item) {
      const it = reactProps.item;
      setCode(it.Code || '');
      setAntibioticName(it.AntibioticName || '');
      setMnemonic(it.Mnemonic || '');
      setDisplayOrder(it.DisplayOrder ? String(it.DisplayOrder) : '');
      setTypeId(it.AnbioticTypeId ?? -1);
      setIsActive(it.ActiveStatusId === 2 || it.IsActive === true);
      setFacilityId(it.FacilityId || 1);
      return;
    }

    if (isEdit) {
      setIsLoading(true);
      callBackendApi('lis/AntibioticMaster/GetAntibioticMasterById', { Id: antibioticId })
        .then((res) => {
          const it = res?.data || res?.Data || res;
          if (it) {
            setCode(it.Code || '');
            setAntibioticName(it.AntibioticName || '');
            setMnemonic(it.Mnemonic || '');
            setDisplayOrder(it.DisplayOrder ? String(it.DisplayOrder) : '');
            setTypeId(it.AnbioticTypeId ?? -1);
            setIsActive(it.ActiveStatusId === 2 || it.IsActive === true);
            setFacilityId(it.FacilityId || 1);
          }
        })
        .catch((err) => {
          console.error('Error fetching antibiotic details:', err);
          setErrorMessage('Failed to load antibiotic details.');
        })
        .finally(() => setIsLoading(false));
    }
  }, [antibioticId, isEdit, reactProps?.item]);

  const handleClose = () => {
    if (onAction) {
      onAction('cancel');
      return;
    }
    if (onClose) {
      onClose();
      return;
    }
    if (onNavigate) {
      onNavigate('app.antibioticmasters');
      return;
    }
    window.location.hash = '#/app/antibioticmasters';
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) {
      alert('Antibiotic Code is required.');
      return;
    }
    if (!antibioticName.trim()) {
      alert('Antibiotic Name is required.');
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);

    const payload = {
      Data: {
        Id: isEdit ? antibioticId : 0,
        Code: code.trim(),
        AntibioticName: antibioticName.trim(),
        Mnemonic: mnemonic.trim(),
        DisplayOrder: displayOrder ? parseInt(displayOrder) : null,
        AnbioticTypeId: typeId !== -1 ? typeId : null,
        IsActive: isActive,
        ActiveStatusId: isActive ? 2 : 1,
        FacilityId: facilityId,
      }
    };

    try {
      if (onAction) {
        onAction('save', payload);
        return;
      }
      const endpoint = isEdit ? 'lis/AntibioticMaster/UpdateAntibioticMaster' : 'lis/AntibioticMaster/AddAntibioticMaster';
      await callBackendApi(endpoint, payload);
      alert('Antibiotic Master saved successfully.');
      handleClose();
    } catch (err: any) {
      console.error('Error saving antibiotic:', err);
      setErrorMessage(err?.message || 'Failed to save antibiotic master.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      style={{
        padding: spacing.md,
        fontFamily: typography.fontFamily,
        color: colors.textMain,
        backgroundColor: '#ffffff',
        borderRadius: radii.xl,
        boxShadow: shadows.md,
        maxWidth: 720,
        margin: '0 auto',
        boxSizing: 'border-box',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingBottom: spacing.md,
          borderBottom: `1px solid ${colors.border}`,
          marginBottom: spacing.md,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: radii.md,
              background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 16,
            }}
          >
            <i className="fas fa-pills" />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: colors.textMain }}>
              {isEdit ? 'Edit Antibiotic Master' : 'Add Antibiotic Master'}
            </h3>
            <div style={{ fontSize: 11, color: colors.textMuted }}>
              Microbiology susceptibility & disc diffusion master record
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleClose}
          style={{
            background: 'transparent',
            border: 'none',
            color: colors.textMuted,
            cursor: 'pointer',
            fontSize: 16,
          }}
        >
          <i className="fa fa-times" />
        </button>
      </div>

      {errorMessage && (
        <div style={{ padding: spacing.sm, background: '#fef2f2', color: '#b91c1c', fontSize: 12, borderRadius: radii.md, marginBottom: spacing.md }}>
          {errorMessage}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSave}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: spacing.md }}>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: colors.textMain, marginBottom: 4 }}>
              Code <span style={{ color: '#dc2626' }}>*</span>
            </label>
            <input
              type="text"
              required
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="e.g. AMK, CIP, VAN"
              style={{
                width: '100%',
                height: 36,
                borderRadius: radii.md,
                border: `1px solid ${colors.border}`,
                padding: '0 10px',
                fontSize: 13,
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: colors.textMain, marginBottom: 4 }}>
              Antibiotic Name <span style={{ color: '#dc2626' }}>*</span>
            </label>
            <input
              type="text"
              required
              value={antibioticName}
              onChange={(e) => setAntibioticName(e.target.value)}
              placeholder="e.g. Amikacin, Ciprofloxacin"
              style={{
                width: '100%',
                height: 36,
                borderRadius: radii.md,
                border: `1px solid ${colors.border}`,
                padding: '0 10px',
                fontSize: 13,
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: colors.textMain, marginBottom: 4 }}>
              Mnemonic / Short Name
            </label>
            <input
              type="text"
              value={mnemonic}
              onChange={(e) => setMnemonic(e.target.value)}
              placeholder="e.g. AK, CIP"
              style={{
                width: '100%',
                height: 36,
                borderRadius: radii.md,
                border: `1px solid ${colors.border}`,
                padding: '0 10px',
                fontSize: 13,
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: colors.textMain, marginBottom: 4 }}>
              Antibiotic Class / Type
            </label>
            <select
              value={typeId}
              onChange={(e) => setTypeId(Number(e.target.value))}
              style={{
                width: '100%',
                height: 36,
                borderRadius: radii.md,
                border: `1px solid ${colors.border}`,
                padding: '0 10px',
                fontSize: 13,
                boxSizing: 'border-box',
              }}
            >
              <option value={-1}>Select Antibiotic Class</option>
              {antibioticTypes.map((t) => (
                <option key={t.Id} value={t.Id}>{t.Text}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: colors.textMain, marginBottom: 4 }}>
              Display Order
            </label>
            <input
              type="number"
              value={displayOrder}
              onChange={(e) => setDisplayOrder(e.target.value)}
              placeholder="Order sequence..."
              style={{
                width: '100%',
                height: 36,
                borderRadius: radii.md,
                border: `1px solid ${colors.border}`,
                padding: '0 10px',
                fontSize: 13,
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', marginTop: 14 }}>
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                style={{ width: 16, height: 16, accentColor: colors.primary }}
              />
              <span style={{ fontSize: 13, fontWeight: 600, color: colors.textMain }}>Active Antibiotic</span>
            </label>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: spacing.sm,
            marginTop: spacing.lg,
            paddingTop: spacing.md,
            borderTop: `1px solid ${colors.border}`,
          }}
        >
          <button
            type="button"
            onClick={handleClose}
            style={{
              padding: '8px 18px',
              borderRadius: radii.md,
              border: `1px solid ${colors.border}`,
              background: '#ffffff',
              color: colors.textMain,
              fontSize: 13,
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSaving}
            style={{
              padding: '8px 20px',
              borderRadius: radii.md,
              border: 'none',
              background: colors.primary,
              color: '#ffffff',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              boxShadow: '0 2px 4px rgba(37, 99, 235, 0.2)',
            }}
          >
            <i className={`fas ${isSaving ? 'fa-spinner fa-spin' : 'fa-check'}`} />
            <span>{isSaving ? 'Saving...' : 'Save Antibiotic'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
