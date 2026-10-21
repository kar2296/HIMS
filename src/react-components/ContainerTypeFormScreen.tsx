import React, { useState, useEffect } from 'react';
import { colors, spacing, typography, radii, shadows } from '../components/ui/tokens';
import { callBackendApi } from '../services/apiService';
import { sessionHelper } from '../services/sessionHelper';

export interface ContainerTypeFormScreenProps {
  id?: number | string;
  reactProps?: {
    id?: number;
    item?: any;
    lookup?: {
      COLOR?: { Id: number; Text: string }[];
      CONTAINTYP?: { Id: number; Text: string }[];
      Facility?: { Id: number; Text: string }[];
      Organization?: { Id: number; Text: string }[];
    };
  };
  onAction?: (actionName: string, payload?: any) => void;
  onNavigate?: (stateName: string, params?: Record<string, any>) => void;
}

export const ContainerTypeFormScreen: React.FC<ContainerTypeFormScreenProps> = ({
  id,
  reactProps,
  onAction,
  onNavigate,
}) => {
  const containerId = Number(reactProps?.id ?? id ?? 0);
  const isEdit = containerId > 0;

  const [code, setCode] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [mnemonics, setMnemonics] = useState<string>('');
  const [volume, setVolume] = useState<string>('');
  const [colorId, setColorId] = useState<number>(-1);
  const [typeId, setTypeId] = useState<number>(-1);
  const [isActive, setIsActive] = useState<boolean>(true);
  const [facilityId, setFacilityId] = useState<number>(sessionHelper.getFacilityId() || 1);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Lookups
  const [colorsList, setColorsList] = useState<{ Id: number; Text: string }[]>(
    reactProps?.lookup?.COLOR || [
      { Id: 1, Text: 'Lavender / Purple (EDTA)' },
      { Id: 2, Text: 'Light Blue (Citrate)' },
      { Id: 3, Text: 'Red Top (Plain / Clot Activator)' },
      { Id: 4, Text: 'Gold / SST (Gel Separator)' },
      { Id: 5, Text: 'Green (Lithium Heparin)' },
      { Id: 6, Text: 'Gray (Fluoride Oxalate)' },
      { Id: 7, Text: 'Yellow (ACD)' },
      { Id: 8, Text: 'Royal Blue (Trace Elements)' },
    ]
  );

  const [typesList, setTypesList] = useState<{ Id: number; Text: string }[]>(
    reactProps?.lookup?.CONTAINTYP || [
      { Id: 1, Text: 'Vacuum Tube (Vacutainer)' },
      { Id: 2, Text: 'Microtainer' },
      { Id: 3, Text: 'Sterile Universal Container' },
      { Id: 4, Text: 'Urine Cup with preservative' },
      { Id: 5, Text: 'Blood Culture Bottle (Aerobic)' },
      { Id: 6, Text: 'Blood Culture Bottle (Anaerobic)' },
      { Id: 7, Text: 'Swab with Transport Media' },
    ]
  );

  // Load item if editing
  useEffect(() => {
    if (reactProps?.item) {
      const it = reactProps.item;
      setCode(it.Code || '');
      setName(it.Name || '');
      setDescription(it.Description || '');
      setMnemonics(it.Mnemonics || '');
      setVolume(it.Volume ? String(it.Volume) : '');
      setColorId(it.ColorId ?? it.COLORId ?? -1);
      setTypeId(it.ContainertypId ?? it.CONTAINTYPId ?? -1);
      setIsActive(it.ActiveStatusId === 2 || it.IsActive === true);
      setFacilityId(it.FacilityId || 1);
      return;
    }

    if (isEdit) {
      setIsLoading(true);
      callBackendApi('lis/containertype/GetContainertypeById', { Id: containerId })
        .then((res) => {
          const it = res?.data || res?.Data || res;
          if (it) {
            setCode(it.Code || '');
            setName(it.Name || '');
            setDescription(it.Description || '');
            setMnemonics(it.Mnemonics || '');
            setVolume(it.Volume ? String(it.Volume) : '');
            setColorId(it.ColorId ?? it.COLORId ?? -1);
            setTypeId(it.ContainertypId ?? it.CONTAINTYPId ?? -1);
            setIsActive(it.ActiveStatusId === 2 || it.IsActive === true);
            setFacilityId(it.FacilityId || 1);
          }
        })
        .catch((err) => {
          console.error('Error fetching container type details:', err);
          setErrorMessage('Failed to load container type details.');
        })
        .finally(() => setIsLoading(false));
    }
  }, [containerId, isEdit, reactProps?.item]);

  const handleBack = () => {
    if (onAction) {
      onAction('back');
      return;
    }
    if (onNavigate) {
      onNavigate('app.containertypes');
      return;
    }
    window.location.hash = '#/app/containertypes';
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) {
      alert('Container Type Code is required.');
      return;
    }
    if (!name.trim()) {
      alert('Container Type Name is required.');
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);

    const payload = {
      Data: {
        Id: isEdit ? containerId : 0,
        Code: code.trim(),
        Name: name.trim(),
        Description: description.trim(),
        Mnemonics: mnemonics.trim(),
        Volume: volume ? parseFloat(volume) : null,
        ColorId: colorId !== -1 ? colorId : null,
        COLORId: colorId !== -1 ? colorId : null,
        ContainertypId: typeId !== -1 ? typeId : null,
        CONTAINTYPId: typeId !== -1 ? typeId : null,
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
      const endpoint = isEdit ? 'lis/containertype/UpdateContainertype' : 'lis/containertype/AddContainertype';
      await callBackendApi(endpoint, payload);
      alert('Container Type saved successfully.');
      handleBack();
    } catch (err: any) {
      console.error('Error saving container type:', err);
      setErrorMessage(err?.message || 'Failed to save container type.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      style={{
        padding: spacing.lg,
        fontFamily: typography.fontFamily,
        color: colors.textMain,
        backgroundColor: '#f8fafc',
        minHeight: '100vh',
      }}
    >
      <div
        style={{
          maxWidth: 800,
          margin: '0 auto',
          background: '#ffffff',
          borderRadius: radii.xl,
          boxShadow: shadows.md,
          border: `1px solid ${colors.border}`,
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: `${spacing.lg} ${spacing.xl}`,
            borderBottom: `1px solid ${colors.border}`,
            background: '#ffffff',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: spacing.md }}>
            <button
              type="button"
              onClick={handleBack}
              style={{
                width: 38,
                height: 38,
                borderRadius: radii.md,
                border: `1px solid ${colors.border}`,
                background: '#ffffff',
                color: colors.textMain,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <i className="fa fa-arrow-left" />
            </button>
            <div>
              <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: colors.textMain }}>
                {isEdit ? 'Edit Container Type' : 'New Container Type'}
              </h2>
              <div style={{ fontSize: 12, color: colors.textMuted, marginTop: 2 }}>
                Configure collection tube attributes, cap color, and specimen requirements
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleBack}
            style={{
              background: 'transparent',
              border: 'none',
              color: colors.textMuted,
              cursor: 'pointer',
              fontSize: 18,
            }}
          >
            <i className="fa fa-times" />
          </button>
        </div>

        {errorMessage && (
          <div style={{ padding: spacing.md, background: '#fef2f2', color: '#b91c1c', fontSize: 13 }}>
            {errorMessage}
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSave} style={{ padding: spacing.xl }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: spacing.lg }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: colors.textMain, marginBottom: 6 }}>
                Container Code <span style={{ color: '#dc2626' }}>*</span>
              </label>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="e.g. EDTA-LAV-4ML"
                style={{
                  width: '100%',
                  height: 40,
                  borderRadius: radii.md,
                  border: `1px solid ${colors.border}`,
                  padding: '0 12px',
                  fontSize: 13,
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: colors.textMain, marginBottom: 6 }}>
                Container Name <span style={{ color: '#dc2626' }}>*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Lavender Top EDTA Tube"
                style={{
                  width: '100%',
                  height: 40,
                  borderRadius: radii.md,
                  border: `1px solid ${colors.border}`,
                  padding: '0 12px',
                  fontSize: 13,
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: colors.textMain, marginBottom: 6 }}>
                Cap / Stopper Color
              </label>
              <select
                value={colorId}
                onChange={(e) => setColorId(Number(e.target.value))}
                style={{
                  width: '100%',
                  height: 40,
                  borderRadius: radii.md,
                  border: `1px solid ${colors.border}`,
                  padding: '0 12px',
                  fontSize: 13,
                  boxSizing: 'border-box',
                }}
              >
                <option value={-1}>Select Color</option>
                {colorsList.map((c) => (
                  <option key={c.Id} value={c.Id}>{c.Text}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: colors.textMain, marginBottom: 6 }}>
                Container Classification
              </label>
              <select
                value={typeId}
                onChange={(e) => setTypeId(Number(e.target.value))}
                style={{
                  width: '100%',
                  height: 40,
                  borderRadius: radii.md,
                  border: `1px solid ${colors.border}`,
                  padding: '0 12px',
                  fontSize: 13,
                  boxSizing: 'border-box',
                }}
              >
                <option value={-1}>Select Classification</option>
                {typesList.map((t) => (
                  <option key={t.Id} value={t.Id}>{t.Text}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: colors.textMain, marginBottom: 6 }}>
                Standard Volume (mL)
              </label>
              <input
                type="number"
                step="0.1"
                value={volume}
                onChange={(e) => setVolume(e.target.value)}
                placeholder="e.g. 4.0"
                style={{
                  width: '100%',
                  height: 40,
                  borderRadius: radii.md,
                  border: `1px solid ${colors.border}`,
                  padding: '0 12px',
                  fontSize: 13,
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: colors.textMain, marginBottom: 6 }}>
                Mnemonics
              </label>
              <input
                type="text"
                value={mnemonics}
                onChange={(e) => setMnemonics(e.target.value)}
                placeholder="Short alias..."
                style={{
                  width: '100%',
                  height: 40,
                  borderRadius: radii.md,
                  border: `1px solid ${colors.border}`,
                  padding: '0 12px',
                  fontSize: 13,
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: colors.textMain, marginBottom: 6 }}>
                Description / Additive Notes
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="e.g. K2 EDTA 7.2mg, invert 8-10 times gently..."
                style={{
                  width: '100%',
                  borderRadius: radii.md,
                  border: `1px solid ${colors.border}`,
                  padding: '10px 12px',
                  fontSize: 13,
                  boxSizing: 'border-box',
                  fontFamily: 'inherit',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', marginTop: 10 }}>
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  style={{ width: 18, height: 18, accentColor: colors.primary }}
                />
                <span style={{ fontSize: 13, fontWeight: 600, color: colors.textMain }}>Active Container Type</span>
              </label>
            </div>
          </div>

          {/* Footer Buttons */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: spacing.md,
              marginTop: spacing.xl,
              paddingTop: spacing.lg,
              borderTop: `1px solid ${colors.border}`,
            }}
          >
            <button
              type="button"
              onClick={handleBack}
              style={{
                padding: '9px 20px',
                borderRadius: radii.md,
                border: `1px solid ${colors.border}`,
                background: '#ffffff',
                color: colors.textMain,
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              style={{
                padding: '9px 24px',
                borderRadius: radii.md,
                border: 'none',
                background: colors.primary,
                color: '#ffffff',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                boxShadow: '0 2px 6px rgba(37, 99, 235, 0.25)',
              }}
            >
              <i className={`fas ${isSaving ? 'fa-spinner fa-spin' : 'fa-check'}`} />
              <span>{isSaving ? 'Saving...' : 'Save Container Type'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
