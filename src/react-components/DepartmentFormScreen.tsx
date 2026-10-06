import React, { useState, useEffect, useRef } from 'react';
import { apiFetch } from './utils/api';
import { colors, spacing, typography, radii } from '../components/ui/tokens';

export interface DepartmentItem {
  Id?: number;
  DepartmentCode?: string;
  DepartmentName?: string;
  Description?: string;
  DepartmentTypeId?: number;
  ParentDepartmentId?: number;
  DisplayOrder?: number | string;
  IsActive?: boolean;
  IsParentDepartment?: boolean;
  IsVirtual?: boolean;
  IsEmergency?: boolean;
  IsDiet?: boolean;
  IsAllFacility?: boolean;
  IsIPClearence?: boolean;
  FacilityId?: number;
  LogoPath?: string;
  [key: string]: any;
}

export interface DepartmentFormScreenProps {
  reactProps?: {
    item?: DepartmentItem;
    lookup?: {
      DepartmentType?: Array<{ Id: number; Text: string }>;
      Department?: Array<{ Id: number; Text: string }>;
      Speciality?: Array<{ Id: number; Text: string }>;
      CostCenter?: Array<{ Id: number; Text: string }>;
      [key: string]: any;
    };
    deptId?: number;
    logoBase64?: string;
  };
  onAction?: (actionName: string, payload?: any) => void;
}

export const DepartmentFormScreen: React.FC<DepartmentFormScreenProps> = ({
  reactProps,
  onAction
}) => {
  const initialId = reactProps?.deptId ?? reactProps?.item?.Id ?? 0;

  const [formData, setFormData] = useState<DepartmentItem>(() => ({
    IsActive: true,
    IsAllFacility: false,
    ...reactProps?.item
  }));

  const [lookups, setLookups] = useState<{
    DepartmentType: Array<{ Id: number; Text: string }>;
    Department: Array<{ Id: number; Text: string }>;
    Speciality: Array<{ Id: number; Text: string }>;
    CostCenter: Array<{ Id: number; Text: string }>;
  }>({
    DepartmentType: reactProps?.lookup?.DepartmentType || [],
    Department: reactProps?.lookup?.Department || [],
    Speciality: reactProps?.lookup?.Speciality || [],
    CostCenter: reactProps?.lookup?.CostCenter || []
  });

  const [logoPreview, setLogoPreview] = useState<string | null>(
    reactProps?.logoBase64 ? `data:image/png;base64,${reactProps.logoBase64}` : null
  );
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Sync props
  useEffect(() => {
    if (reactProps?.item) {
      setFormData(prev => ({ ...prev, ...reactProps.item }));
    }
    if (reactProps?.lookup) {
      setLookups({
        DepartmentType: reactProps.lookup.DepartmentType || [],
        Department: reactProps.lookup.Department || [],
        Speciality: reactProps.lookup.Speciality || [],
        CostCenter: reactProps.lookup.CostCenter || []
      });
    }
    if (reactProps?.logoBase64) {
      setLogoPreview(`data:image/png;base64,${reactProps.logoBase64}`);
    }
  }, [reactProps]);

  // Initial load
  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      setLoading(true);
      try {
        // Load lookups if empty
        if (!lookups.DepartmentType.length || !lookups.Department.length) {
          const lookupRes = await apiFetch('General/Options/getoptions', [
            { Key: 'DepartmentType' },
            { Key: 'Speciality' },
            { Key: 'CostCenter' },
            { Key: 'Department', Request: { Params: [{ Key: 4, Value: 1 }] } }
          ]);
          if (isMounted && lookupRes) {
            setLookups({
              DepartmentType: lookupRes.DepartmentType || [],
              Department: lookupRes.Department || [],
              Speciality: lookupRes.Speciality || [],
              CostCenter: lookupRes.CostCenter || []
            });
          }
        }

        // Load Department item if editing
        if (initialId > 0 && (!formData.DepartmentCode || !formData.DepartmentName)) {
          const itemRes = await apiFetch('SystemSettings/department/GetDepartmentById', { Id: initialId });
          if (isMounted && itemRes) {
            setFormData(prev => ({ ...prev, ...itemRes }));

            // Load Logo
            if (itemRes.LogoPath) {
              try {
                const logoRes = await apiFetch('SystemSettings/department/GetDepartmentLogo', {
                  Data: { Id: itemRes.Id, LogoPath: itemRes.LogoPath }
                });
                if (isMounted && logoRes?.Logo) {
                  setLogoPreview(`data:image/png;base64,${logoRes.Logo}`);
                }
              } catch (e) {
                console.warn('Could not load logo', e);
              }
            }
          }
        }
      } catch (err) {
        console.error('Failed to init department form', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    init();
    return () => { isMounted = false; };
  }, [initialId]);

  const dispatch = (action: string, payload?: any) => {
    if (onAction) onAction(action, payload);
  };

  const handleFieldChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: '' }));
    setFormError(null);
    dispatch('fieldChange', { [field]: value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setLogoPreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
      dispatch('onLogoUpload', { file });
    }
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.DepartmentCode?.trim()) errs.DepartmentCode = 'Department code is required';
    if (!formData.DepartmentName?.trim()) errs.DepartmentName = 'Department name is required';
    if (!formData.DepartmentTypeId) errs.DepartmentTypeId = 'Department type is required';
    setErrors(errs);
    if (Object.keys(errs).length > 0) {
      setFormError('Please fill in all required fields: ' + Object.values(errs).join(', '));
      return false;
    }
    setFormError(null);
    return true;
  };

  const handleSave = async (isApprove = false) => {
    setFormError(null);
    if (!validate()) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // Prepare clean payload with database-compatible types and default values
    const cleanPayload = {
      ...formData,
      ParentDepartmentId: formData.ParentDepartmentId ? Number(formData.ParentDepartmentId) : null,
      SpecialityId: formData.SpecialityId ? Number(formData.SpecialityId) : null,
      CostCenterId: formData.CostCenterId ? Number(formData.CostCenterId) : null,
      DisplayOrder: (formData.DisplayOrder !== undefined && formData.DisplayOrder !== null && formData.DisplayOrder !== '' && !isNaN(Number(formData.DisplayOrder))) ? Number(formData.DisplayOrder) : null,
      ActiveStatusId: isApprove ? 2 : (formData.ActiveStatusId || 1),
      ActiveStatus: isApprove ? 'Active' : (formData.ActiveStatus || 'Draft'),
      ActiveFrom: formData.ActiveFrom || new Date().toISOString(),
      IsActive: formData.IsActive !== false,
      IsAllFacility: Boolean(formData.IsAllFacility),
      FacilityId: formData.IsAllFacility ? -1 : (formData.FacilityId || 1),
      IsEmergency: Boolean(formData.IsEmergency),
      IsAdmittingDept: Boolean(formData.IsAdmittingDept),
      IsParentDepartment: Boolean(formData.IsParentDepartment),
      IsVirtual: Boolean(formData.IsVirtual),
      IsDiet: Boolean(formData.IsDiet),
      IsIPClearence: Boolean(formData.IsIPClearence),
      IncludeMRDRequired: Boolean(formData.IncludeMRDRequired),
      IsPatientFlowMandatory: Boolean(formData.IsPatientFlowMandatory),
      IsProcessingCenter: Boolean(formData.IsProcessingCenter),
      Rev: formData.Rev || 0
    };

    if (onAction) {
      setSaving(true);
      dispatch(isApprove ? 'saveAndApprove' : 'saveItem', { item: cleanPayload, file: selectedFile });
      setTimeout(() => setSaving(false), 2000);
      return;
    }

    setSaving(true);
    try {
      const isUpdate = (cleanPayload.Id || initialId) > 0;
      const actionName = isUpdate ? 'SystemSettings/department/UpdateDepartment' : 'SystemSettings/department/AddDepartment';
      await apiFetch(actionName, { Data: cleanPayload, file: selectedFile });
      setSuccessMessage('Department saved successfully');
      setTimeout(() => dispatch('backToList'), 800);
    } catch (err: any) {
      console.error('Failed to save department', err);
      const msg = err?.Error?.Message || err?.message || 'Failed to save department. Please check required fields.';
      setFormError(msg);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setSaving(false);
    }
  };

  const sectionStyle: React.CSSProperties = {
    background: colors.surface,
    border: `1px solid ${colors.border}`,
    borderRadius: radii.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
  };

  const sectionHeaderStyle: React.CSSProperties = {
    fontSize: '14px',
    fontWeight: 600,
    color: colors.textMain,
    display: 'flex',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
    paddingBottom: spacing.xs,
    borderBottom: `1px solid ${colors.border}`
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '12px',
    fontWeight: 600,
    color: colors.textBody,
    marginBottom: 4
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '8px 12px',
    fontSize: '13px',
    border: `1px solid ${colors.border}`,
    borderRadius: radii.md,
    outline: 'none',
    boxSizing: 'border-box',
    fontFamily: typography.fontFamily,
    transition: 'border-color 0.15s ease'
  };

  const checkboxLabelStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    fontSize: '13px',
    fontWeight: 500,
    color: colors.textBody,
    cursor: 'pointer',
    userSelect: 'none'
  };

  if (loading) {
    return (
      <div style={{ padding: spacing.xl, textAlign: 'center', color: colors.textMuted }}>
        <i className="fa fa-spinner fa-spin fa-2x" style={{ color: colors.primary }} />
        <div style={{ marginTop: spacing.sm, fontSize: 13 }}>Loading department details...</div>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: typography.fontFamily, color: colors.textBody }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: spacing.md,
          paddingBottom: spacing.sm,
          borderBottom: `1px solid ${colors.border}`
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: spacing.md }}>
          <button
            type="button"
            onClick={() => dispatch('backToList')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: 'transparent',
              border: `1px solid ${colors.border}`,
              borderRadius: radii.md,
              padding: '6px 12px',
              fontSize: '13px',
              fontWeight: 500,
              color: colors.textBody,
              cursor: 'pointer'
            }}
          >
            <i className="fa fa-arrow-left" style={{ fontSize: 11 }} />
            <span>Departments</span>
          </button>

          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 600, color: colors.textMain }}>
            {formData.Id ? `Edit Department — ${formData.DepartmentName}` : 'Add New Department'}
          </h3>
        </div>
      </div>

      {/* Form Feedback Banners */}
      {formError && (
        <div
          style={{
            background: '#fef2f2',
            border: '1px solid #f87171',
            borderRadius: radii.md,
            padding: '12px 16px',
            marginBottom: spacing.md,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: spacing.md,
            color: '#b91c1c',
            fontSize: '13px',
            fontWeight: 500,
            boxShadow: '0 1px 3px rgba(239, 68, 68, 0.1)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <i className="fa fa-exclamation-circle" style={{ fontSize: 16 }} />
            <span>{formError}</span>
          </div>
          <button
            type="button"
            onClick={() => setFormError(null)}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#b91c1c',
              cursor: 'pointer',
              fontSize: '18px',
              lineHeight: 1,
              padding: '0 4px'
            }}
          >
            &times;
          </button>
        </div>
      )}

      {successMessage && (
        <div
          style={{
            background: '#ecfdf5',
            border: '1px solid #34d399',
            borderRadius: radii.md,
            padding: '12px 16px',
            marginBottom: spacing.md,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            color: '#065f46',
            fontSize: '13px',
            fontWeight: 500,
            boxShadow: '0 1px 3px rgba(16, 185, 129, 0.1)'
          }}
        >
          <i className="fa fa-check-circle" style={{ fontSize: 16 }} />
          <span>{successMessage}</span>
        </div>
      )}

      <form onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
        {/* 1. Department Information */}
        <div style={sectionStyle}>
          <div style={sectionHeaderStyle}>
            <i className="fa fa-info-circle" style={{ color: colors.primary }} />
            <span>General Information</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: spacing.md }}>
            <div>
              <label style={labelStyle}>
                Department Code <span style={{ color: colors.gold }}>*</span>
              </label>
              <input
                type="text"
                style={{ ...inputStyle, borderColor: errors.DepartmentCode ? '#ef4444' : colors.border }}
                value={formData.DepartmentCode || ''}
                onChange={(e) => handleFieldChange('DepartmentCode', e.target.value)}
                placeholder="e.g. CARD"
              />
              {errors.DepartmentCode && <div style={{ color: '#ef4444', fontSize: 11, marginTop: 2 }}>{errors.DepartmentCode}</div>}
            </div>

            <div>
              <label style={labelStyle}>
                Department Name <span style={{ color: colors.gold }}>*</span>
              </label>
              <input
                type="text"
                style={{ ...inputStyle, borderColor: errors.DepartmentName ? '#ef4444' : colors.border }}
                value={formData.DepartmentName || ''}
                onChange={(e) => handleFieldChange('DepartmentName', e.target.value)}
                placeholder="e.g. Cardiology"
              />
              {errors.DepartmentName && <div style={{ color: '#ef4444', fontSize: 11, marginTop: 2 }}>{errors.DepartmentName}</div>}
            </div>

            <div>
              <label style={labelStyle}>
                Description
              </label>
              <input
                type="text"
                style={inputStyle}
                value={formData.Description || ''}
                onChange={(e) => handleFieldChange('Description', e.target.value)}
                placeholder="Brief department description (optional)"
              />
            </div>

            <div>
              <label style={labelStyle}>
                Department Type <span style={{ color: colors.gold }}>*</span>
              </label>
              <select
                style={{ ...inputStyle, borderColor: errors.DepartmentTypeId ? '#ef4444' : colors.border, background: '#fff' }}
                value={formData.DepartmentTypeId || ''}
                onChange={(e) => handleFieldChange('DepartmentTypeId', e.target.value ? parseInt(e.target.value, 10) : undefined)}
              >
                <option value="">Select Type</option>
                {lookups.DepartmentType.map((dt) => (
                  <option key={dt.Id} value={dt.Id}>{dt.Text}</option>
                ))}
              </select>
              {errors.DepartmentTypeId && <div style={{ color: '#ef4444', fontSize: 11, marginTop: 2 }}>{errors.DepartmentTypeId}</div>}
            </div>

            <div>
              <label style={labelStyle}>Parent Department</label>
              <select
                style={{ ...inputStyle, background: '#fff' }}
                value={formData.ParentDepartmentId || ''}
                onChange={(e) => handleFieldChange('ParentDepartmentId', e.target.value ? parseInt(e.target.value, 10) : null)}
              >
                <option value="">None (Top-Level)</option>
                {lookups.Department.map((d) => (
                  <option key={d.Id} value={d.Id}>{d.Text}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={labelStyle}>Display Order</label>
              <input
                type="number"
                style={inputStyle}
                value={formData.DisplayOrder ?? ''}
                onChange={(e) => handleFieldChange('DisplayOrder', e.target.value ? parseInt(e.target.value, 10) : '')}
                placeholder="1, 2, 3..."
              />
            </div>
          </div>
        </div>

        {/* 2. Operational & Workflow Flags */}
        <div style={sectionStyle}>
          <div style={sectionHeaderStyle}>
            <i className="fa fa-sliders" style={{ color: colors.primary }} />
            <span>Operational &amp; System Flags</span>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '14px 18px',
              padding: `${spacing.xs} 0`
            }}
          >
            <label style={checkboxLabelStyle}>
              <input
                type="checkbox"
                checked={formData.IsActive ?? true}
                onChange={(e) => handleFieldChange('IsActive', e.target.checked)}
              />
              <span>Active Department</span>
            </label>

            <label style={checkboxLabelStyle}>
              <input
                type="checkbox"
                checked={!!formData.IsParentDepartment}
                onChange={(e) => handleFieldChange('IsParentDepartment', e.target.checked)}
              />
              <span>Is Parent Department</span>
            </label>

            <label style={checkboxLabelStyle}>
              <input
                type="checkbox"
                checked={!!formData.IsVirtual}
                onChange={(e) => handleFieldChange('IsVirtual', e.target.checked)}
              />
              <span>Is Virtual Department</span>
            </label>

            <label style={checkboxLabelStyle}>
              <input
                type="checkbox"
                checked={!!formData.IsEmergency}
                onChange={(e) => handleFieldChange('IsEmergency', e.target.checked)}
              />
              <span>Emergency Services</span>
            </label>

            <label style={checkboxLabelStyle}>
              <input
                type="checkbox"
                checked={!!formData.IsDiet}
                onChange={(e) => handleFieldChange('IsDiet', e.target.checked)}
              />
              <span>Diet Department</span>
            </label>

            <label style={checkboxLabelStyle}>
              <input
                type="checkbox"
                checked={!!formData.IsAllFacility}
                onChange={(e) => handleFieldChange('IsAllFacility', e.target.checked)}
              />
              <span>Available in All Facilities</span>
            </label>

            <label style={checkboxLabelStyle}>
              <input
                type="checkbox"
                checked={!!formData.IsIPClearence}
                onChange={(e) => handleFieldChange('IsIPClearence', e.target.checked)}
              />
              <span>IP Clearance Required</span>
            </label>
          </div>
        </div>

        {/* 3. Logo Upload */}
        <div style={sectionStyle}>
          <div style={sectionHeaderStyle}>
            <i className="fa fa-picture-o" style={{ color: colors.primary }} />
            <span>Department Logo / Icon</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: spacing.lg, flexWrap: 'wrap' }}>
            <div
              style={{
                width: 100,
                height: 100,
                borderRadius: radii.md,
                border: `1px solid ${colors.border}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                background: colors.surfaceMuted
              }}
            >
              {logoPreview ? (
                <img
                  src={logoPreview}
                  alt="Department Logo"
                  style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                />
              ) : (
                <div style={{ textAlign: 'center', color: colors.textMuted }}>
                  <i className="fa fa-sitemap fa-2x" />
                  <div style={{ fontSize: 11, marginTop: 4 }}>No Icon</div>
                </div>
              )}
            </div>

            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '8px 16px',
                  fontSize: '13px',
                  fontWeight: 500,
                  color: colors.primary,
                  background: colors.primaryLight,
                  border: `1px solid ${colors.primaryMid}`,
                  borderRadius: radii.md,
                  cursor: 'pointer'
                }}
              >
                <i className="fa fa-upload" />
                <span>Upload Logo</span>
              </button>
              <div style={{ fontSize: '11px', color: colors.textMuted, marginTop: 6 }}>
                PNG, SVG, or JPG format up to 5MB.
              </div>
            </div>
          </div>
        </div>

        {/* 4. Action Footer */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: `${spacing.md} 0`,
            borderTop: `1px solid ${colors.border}`,
            marginTop: spacing.md
          }}
        >
          <button
            type="button"
            onClick={() => dispatch('backToList')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 18px',
              fontSize: '13px',
              fontWeight: 500,
              color: colors.textBody,
              background: colors.surfaceMuted,
              border: `1px solid ${colors.border}`,
              borderRadius: radii.md,
              cursor: 'pointer'
            }}
          >
            <i className="fa fa-arrow-left" />
            <span>Back to List</span>
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm }}>
            <button
              type="button"
              disabled={saving}
              onClick={() => handleSave(false)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 20px',
                fontSize: '13px',
                fontWeight: 600,
                color: '#ffffff',
                background: colors.primary,
                border: 'none',
                borderRadius: radii.md,
                cursor: saving ? 'not-allowed' : 'pointer',
                opacity: saving ? 0.7 : 1,
                boxShadow: '0 1px 3px rgba(37,99,235,0.25)'
              }}
            >
              {saving ? <i className="fa fa-spinner fa-spin" /> : <i className="fa fa-save" />}
              <span>Save</span>
            </button>

            <button
              type="button"
              disabled={saving}
              onClick={() => handleSave(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 20px',
                fontSize: '13px',
                fontWeight: 600,
                color: '#ffffff',
                background: '#10b981',
                border: 'none',
                borderRadius: radii.md,
                cursor: saving ? 'not-allowed' : 'pointer',
                opacity: saving ? 0.7 : 1,
                boxShadow: '0 1px 3px rgba(16,185,129,0.25)'
              }}
            >
              {saving ? <i className="fa fa-spinner fa-spin" /> : <i className="fa fa-check" />}
              <span>Save &amp; Approve</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
