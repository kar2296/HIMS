import React, { useState, useEffect, useCallback } from 'react';
import { colors, spacing, typography, radii, shadows } from '../components/ui/tokens';
import { apiFetch } from './utils/api';

export interface OrganismFormItem {
  Id?: number;
  FacilityId?: number;
  Code?: string;
  OrgIsolationName?: string;
  Mnemonic?: string;
  IsActive?: boolean;
  ActiveStatusId?: number;
  [key: string]: any;
}

export interface LookupOption {
  Id: number;
  Text: string;
  Description?: string;
}

export interface OrganismIsolatedFormScreenProps {
  reactProps?: {
    id?: number;
    item?: OrganismFormItem;
    lookup?: {
      Facility?: LookupOption[];
      ActiveStatus?: LookupOption[];
    };
  };
  onAction?: (actionName: string, payload?: any) => void;
}

export const OrganismIsolatedFormScreen: React.FC<OrganismIsolatedFormScreenProps> = ({
  reactProps,
  onAction,
}) => {
  const isHybrid = Boolean(reactProps && reactProps.item);

  const [formData, setFormData] = useState<OrganismFormItem>({
    FacilityId: reactProps?.item?.FacilityId || 1,
    Code: reactProps?.item?.Code || '',
    OrgIsolationName: reactProps?.item?.OrgIsolationName || '',
    Mnemonic: reactProps?.item?.Mnemonic || '',
    IsActive: reactProps?.item?.IsActive !== undefined ? reactProps.item.IsActive : true,
    ActiveStatusId: reactProps?.item?.ActiveStatusId || 2,
    ...reactProps?.item,
  });

  const [standaloneLookups, setStandaloneLookups] = useState<{
    Facility: LookupOption[];
    ActiveStatus: LookupOption[];
  }>({
    Facility: [],
    ActiveStatus: [],
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (reactProps?.item) {
      setFormData({
        ...reactProps.item,
        IsActive: reactProps.item.IsActive !== undefined ? reactProps.item.IsActive : true,
      });
    }
  }, [reactProps?.item]);

  const dispatch = useCallback((action: string, payload?: any) => {
    if (onAction) {
      onAction(action, payload);
    }
  }, [onAction]);

  // Standalone lookup & item fetch
  useEffect(() => {
    if (!isHybrid) {
      const fetchInitial = async () => {
        try {
          const res = await apiFetch({
            action: 'General/Options/getoptions',
            data: [
              { Key: 'Facility', Request: { Params: [{ Key: 4, Value: true }] } },
              { Key: 'ActiveStatus' },
            ],
          });
          if (res) {
            setStandaloneLookups({
              Facility: Array.isArray(res.Facility) ? res.Facility : [],
              ActiveStatus: Array.isArray(res.ActiveStatus) ? res.ActiveStatus : [],
            });
          }

          const orgId = reactProps?.id;
          if (orgId && orgId > 0) {
            const itemRes = await apiFetch({
              action: 'lis/OrgIsolation/GetOrgIsolationById',
              data: { Id: orgId },
            });
            if (itemRes) {
              setFormData(itemRes);
            }
          }
        } catch (e) {
          console.error('Failed to load organism data:', e);
        }
      };
      fetchInitial();
    }
  }, [isHybrid, reactProps?.id]);

  const facilities = isHybrid ? (reactProps?.lookup?.Facility || []) : standaloneLookups.Facility;

  const handleChange = (field: keyof OrganismFormItem, value: any) => {
    const updated = { ...formData, [field]: value };
    setFormData(updated);
    if (onAction) {
      dispatch('formChange', updated);
    }
  };

  const handleSave = async (isApprove: boolean) => {
    if (!formData.Code || !formData.OrgIsolationName) {
      alert('Please fill in required fields (Code and Organism Name).');
      return;
    }

    const payload = {
      ...formData,
      ActiveStatusId: isApprove ? (formData.IsActive ? 2 : 3) : 1,
    };

    if (onAction) {
      dispatch(isApprove ? 'saveAndApprove' : 'save', payload);
    } else {
      setIsSaving(true);
      try {
        const actionName = payload.Id && payload.Id > 0
          ? 'lis/OrgIsolation/UpdateOrgIsolation'
          : 'lis/OrgIsolation/AddOrgIsolation';
        await apiFetch({
          action: actionName,
          data: { Data: payload },
        });
        window.location.hash = '#/app/organismisolations:/';
      } catch (e) {
        console.error('Failed to save organism:', e);
      } finally {
        setIsSaving(false);
      }
    }
  };

  const handleBack = () => {
    if (onAction) {
      dispatch('backToList');
    } else {
      window.location.hash = '#/app/organismisolations:/';
    }
  };

  return (
    <div
      style={{
        background: '#ffffff',
        borderRadius: radii.lg,
        boxShadow: shadows.sm,
        border: `1px solid ${colors.border}`,
        padding: spacing.xl,
        maxWidth: '1000px',
        margin: '0 auto',
      }}
    >
      <div style={{ marginBottom: spacing.lg, borderBottom: `1px solid ${colors.border}`, paddingBottom: spacing.sm }}>
        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: colors.textMain }}>
          Organism Master Information
        </h3>
        <p style={{ margin: '4px 0 0', fontSize: 13, color: colors.textMuted }}>
          Specify isolate classification details for laboratory susceptibility testing
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: spacing.lg,
          marginBottom: spacing.xl,
        }}
      >
        {/* Facility */}
        <div>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: colors.textMain, marginBottom: 6 }}>
            Facility
          </label>
          <select
            value={formData.FacilityId || ''}
            onChange={(e) => handleChange('FacilityId', parseInt(e.target.value, 10))}
            style={{
              width: '100%',
              height: 38,
              borderRadius: radii.md,
              border: `1px solid ${colors.border}`,
              padding: '0 12px',
              fontSize: 13,
              background: '#f8fafc',
              outline: 'none',
            }}
          >
            <option value="">Select Facility</option>
            {facilities.map((fac) => (
              <option key={fac.Id} value={fac.Id}>
                {fac.Text}
              </option>
            ))}
          </select>
        </div>

        {/* Code */}
        <div>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: colors.textMain, marginBottom: 6 }}>
            Code <span style={{ color: colors.danger }}>*</span>
          </label>
          <input
            type="text"
            required
            placeholder="e.g. ORG01"
            value={formData.Code || ''}
            onChange={(e) => handleChange('Code', e.target.value.toUpperCase())}
            style={{
              width: '100%',
              height: 38,
              borderRadius: radii.md,
              border: `1px solid ${colors.border}`,
              padding: '0 12px',
              fontSize: 13,
              background: '#ffffff',
              outline: 'none',
              fontFamily: 'monospace',
              fontWeight: 600,
            }}
          />
        </div>

        {/* Organism Name */}
        <div>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: colors.textMain, marginBottom: 6 }}>
            Organism Name <span style={{ color: colors.danger }}>*</span>
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Staphylococcus aureus"
            value={formData.OrgIsolationName || ''}
            onChange={(e) => handleChange('OrgIsolationName', e.target.value)}
            style={{
              width: '100%',
              height: 38,
              borderRadius: radii.md,
              border: `1px solid ${colors.border}`,
              padding: '0 12px',
              fontSize: 13,
              background: '#ffffff',
              outline: 'none',
            }}
          />
        </div>

        {/* Mnemonic */}
        <div>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: colors.textMain, marginBottom: 6 }}>
            Mnemonic
          </label>
          <input
            type="text"
            placeholder="Short mnemonic code"
            value={formData.Mnemonic || ''}
            onChange={(e) => handleChange('Mnemonic', e.target.value)}
            style={{
              width: '100%',
              height: 38,
              borderRadius: radii.md,
              border: `1px solid ${colors.border}`,
              padding: '0 12px',
              fontSize: 13,
              background: '#ffffff',
              outline: 'none',
            }}
          />
        </div>

        {/* Is Active */}
        <div style={{ display: 'flex', alignItems: 'center', paddingTop: 26 }}>
          <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
            <input
              type="checkbox"
              checked={Boolean(formData.IsActive)}
              onChange={(e) => handleChange('IsActive', e.target.checked)}
              style={{ width: 18, height: 18, accentColor: '#059669', cursor: 'pointer' }}
            />
            <span>Active Organism</span>
          </label>
        </div>
      </div>

      {/* ── Action Buttons Footer ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderTop: `1px solid ${colors.border}`,
          paddingTop: spacing.lg,
          flexWrap: 'wrap',
          gap: spacing.md,
        }}
      >
        <button
          type="button"
          onClick={handleBack}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            height: 38,
            padding: '0 18px',
            borderRadius: radii.md,
            border: `1px solid ${colors.border}`,
            background: '#ffffff',
            color: colors.textMain,
            fontWeight: 600,
            fontSize: 13,
            cursor: 'pointer',
          }}
        >
          <i className="fa fa-angle-left" />
          <span>Back</span>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm }}>
          <button
            type="button"
            disabled={isSaving}
            onClick={() => handleSave(false)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              height: 38,
              padding: '0 18px',
              borderRadius: radii.md,
              border: `1px solid ${colors.border}`,
              background: '#f8fafc',
              color: colors.textMain,
              fontWeight: 600,
              fontSize: 13,
              cursor: isSaving ? 'not-allowed' : 'pointer',
            }}
          >
            <span>Save Draft</span>
          </button>

          <button
            type="button"
            disabled={isSaving}
            onClick={() => handleSave(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              height: 38,
              padding: '0 20px',
              borderRadius: radii.md,
              border: 'none',
              background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
              color: '#ffffff',
              fontWeight: 600,
              fontSize: 13,
              cursor: isSaving ? 'not-allowed' : 'pointer',
              boxShadow: '0 2px 6px rgba(5, 150, 105, 0.3)',
            }}
          >
            <i className="fa fa-check" />
            <span>Save & Approve</span>
          </button>
        </div>
      </div>
    </div>
  );
};
