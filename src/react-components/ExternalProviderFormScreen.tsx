import React, { useState, useEffect, useCallback } from 'react';
import { callBackendApi } from '../services/apiService';

export interface ExternalProviderFormData {
  Id?: number;
  Code?: string;
  ProviderName?: string;
  TESTMASTERTYPId?: number;
  ContactPerson?: string;
  MobileNumber?: string;
  PhoneNumber?: string;
  AddressLine1?: string;
  Email?: string;
  CityId?: number;
  StateId?: number;
  CountryId?: number;
  PinCodeId?: string;
  EmailAddress?: string;
  Comments?: string;
  IsActive?: boolean;
  ActiveStatusId?: number;
  isRequested?: boolean;
}

export interface ExternalProviderFormScreenProps {
  id?: number;
  reactProps?: {
    id?: number;
    item?: ExternalProviderFormData;
    lookup?: {
      TESTMASTERTYP?: Array<{ Id: number | string; Text: string }>;
      State?: Array<{ Id: number | string; Text: string }>;
      Nationality?: Array<{ Id: number | string; Text: string }>;
    };
  };
  onAction?: (actionName: string, payload?: any) => void;
  onBack?: () => void;
}

export const ExternalProviderFormScreen: React.FC<ExternalProviderFormScreenProps> = ({
  id: propId,
  reactProps,
  onAction,
  onBack,
}) => {
  const providerId = propId || reactProps?.id || 0;
  const [item, setItem] = useState<ExternalProviderFormData>(
    reactProps?.item || {
      IsActive: true,
      ActiveStatusId: 1,
      TESTMASTERTYPId: 1,
    }
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);

  // Fallback options
  const testMasterTypes = (reactProps?.lookup?.TESTMASTERTYP as any) || [
    { Id: 1, Text: 'Molecular Biology & Genetics' },
    { Id: 2, Text: 'Specialized Histopathology' },
    { Id: 3, Text: 'Reference Cytogenetics' },
    { Id: 4, Text: 'Automated Clinical Biochemistry' },
    { Id: 5, Text: 'Immunology & Flow Cytometry' },
  ];

  const fetchProvider = useCallback(async () => {
    if (!providerId || providerId <= 0) return;
    setLoading(true);
    try {
      const res = await callBackendApi<any>('lis/ExternalProvider/GetExternalProviderById', 'POST', {
        Id: providerId,
      });
      if (res && res.Data) {
        setItem(res.Data);
      }
    } catch (err) {
      console.warn('Failed to load external provider details:', err);
    } finally {
      setLoading(false);
    }
  }, [providerId]);

  useEffect(() => {
    if (reactProps?.item) {
      setItem(reactProps.item);
    } else {
      fetchProvider();
    }
  }, [reactProps?.item, fetchProvider]);

  const handleChange = (field: keyof ExternalProviderFormData, val: any) => {
    setItem((prev) => ({ ...prev, [field]: val }));
  };

  const handleSave = async (approve = false) => {
    if (onAction) {
      onAction(approve ? 'saveAndApprove' : 'save', { ...item, ActiveStatusId: approve ? 2 : 1 });
      return;
    }

    setSaving(true);
    try {
      const payload = {
        Data: {
          ...item,
          ActiveStatusId: approve ? 2 : 1,
        },
      };
      const actionName = providerId && providerId > 0
        ? 'lis/ExternalProvider/UpdateExternalProvider'
        : 'lis/ExternalProvider/AddExternalProvider';

      await callBackendApi(actionName, 'POST', payload);
      if (onBack) onBack();
    } catch (err) {
      console.error('Error saving provider:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleClear = () => {
    setItem({ IsActive: true, ActiveStatusId: 1 });
    if (onAction) onAction('clear');
  };

  const handleGoBack = () => {
    if (onBack) onBack();
    else if (onAction) onAction('backToList');
    else window.location.hash = '#/app/externalprovider';
  };

  return (
    <div
      style={{
        padding: '24px',
        backgroundColor: '#f8fafc',
        minHeight: '100vh',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      }}
    >
      {/* Top Breadcrumb & Title */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            type="button"
            onClick={handleGoBack}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: '6px',
              backgroundColor: '#ffffff',
              border: '1px solid #cbd5e1',
              color: '#334155',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <i className="fa fa-arrow-left" /> Back to Providers
          </button>
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#0f172a' }}>
            {providerId && providerId > 0 ? `Edit Provider: ${item.ProviderName || ''}` : 'Register External Referral Laboratory'}
          </h2>
        </div>

        {item.ActiveStatusId === 2 && (
          <span
            style={{
              padding: '4px 10px',
              borderRadius: '9999px',
              backgroundColor: '#dcfce7',
              color: '#15803d',
              fontSize: '12px',
              fontWeight: 700,
              border: '1px solid #bbf7d0',
            }}
          >
            Approved & Active
          </span>
        )}
      </div>

      {loading ? (
        <div style={{ padding: '60px', textAlign: 'center', color: '#64748b' }}>
          <i className="fa fa-spinner fa-spin" style={{ marginRight: '8px', fontSize: '20px' }} />
          Loading laboratory provider details...
        </div>
      ) : (
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '10px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
            padding: '24px',
            maxWidth: '1100px',
            margin: '0 auto',
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '20px',
              marginBottom: '24px',
            }}
          >
            {/* Laboratory Discipline */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                Laboratory Discipline <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <select
                value={item.TESTMASTERTYPId || 1}
                onChange={(e) => handleChange('TESTMASTERTYPId', parseInt(e.target.value, 10))}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  fontSize: '13px',
                  backgroundColor: '#ffffff',
                }}
              >
                {testMasterTypes.map((opt: any) => (
                  <option key={opt.Id} value={opt.Id}>
                    {opt.Text || opt.Description}
                  </option>
                ))}
              </select>
            </div>

            {/* Provider Code */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                Laboratory Code <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="text"
                value={item.Code || ''}
                onChange={(e) => handleChange('Code', e.target.value)}
                placeholder="e.g. METRO-GEN-01"
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  fontSize: '13px',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            {/* Provider Name */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                Provider / Organization Name <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="text"
                value={item.ProviderName || ''}
                onChange={(e) => handleChange('ProviderName', e.target.value)}
                placeholder="e.g. Metropolis Reference Laboratory Ltd"
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  fontSize: '13px',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            {/* Contact Person */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                Contact Person
              </label>
              <input
                type="text"
                value={item.ContactPerson || ''}
                onChange={(e) => handleChange('ContactPerson', e.target.value)}
                placeholder="e.g. Dr. Ramesh Kumar"
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  fontSize: '13px',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            {/* Mobile Number */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                Mobile Number
              </label>
              <input
                type="text"
                value={item.MobileNumber || ''}
                onChange={(e) => handleChange('MobileNumber', e.target.value)}
                placeholder="e.g. 9876543210"
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  fontSize: '13px',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            {/* Phone Number */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                Telephone / Landline
              </label>
              <input
                type="text"
                value={item.PhoneNumber || ''}
                onChange={(e) => handleChange('PhoneNumber', e.target.value)}
                placeholder="e.g. 080-2345678"
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  fontSize: '13px',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            {/* Email Address */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                Email Address
              </label>
              <input
                type="email"
                value={item.EmailAddress || item.Email || ''}
                onChange={(e) => {
                  handleChange('EmailAddress', e.target.value);
                  handleChange('Email', e.target.value);
                }}
                placeholder="contact@referrallab.com"
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  fontSize: '13px',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            {/* Address */}
            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                Laboratory Facility Address
              </label>
              <input
                type="text"
                value={item.AddressLine1 || ''}
                onChange={(e) => handleChange('AddressLine1', e.target.value)}
                placeholder="Street address, building number, commercial hub..."
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  fontSize: '13px',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            {/* Comments / Notes */}
            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                Accreditation & Operational Notes
              </label>
              <textarea
                value={item.Comments || ''}
                onChange={(e) => handleChange('Comments', e.target.value)}
                placeholder="e.g. NABL & CAP accredited reference lab with 24h turnaround for biopsy..."
                rows={3}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  fontSize: '13px',
                  boxSizing: 'border-box',
                  resize: 'vertical',
                }}
              />
            </div>

            {/* Active Checkbox */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingTop: '10px' }}>
              <input
                type="checkbox"
                id="providerIsActive"
                checked={!!item.IsActive}
                onChange={(e) => handleChange('IsActive', e.target.checked)}
                style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#0284c7' }}
              />
              <label htmlFor="providerIsActive" style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a', cursor: 'pointer' }}>
                Active in Diagnostic Dispatch Workflows
              </label>
            </div>
          </div>

          {/* Form Actions */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderTop: '1px solid #e2e8f0',
              paddingTop: '20px',
            }}
          >
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                onClick={handleGoBack}
                style={{
                  padding: '9px 16px',
                  backgroundColor: '#ffffff',
                  color: '#475569',
                  border: '1px solid #cbd5e1',
                  borderRadius: '6px',
                  fontWeight: 600,
                  fontSize: '13px',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleClear}
                style={{
                  padding: '9px 16px',
                  backgroundColor: '#f1f5f9',
                  color: '#475569',
                  border: '1px solid #cbd5e1',
                  borderRadius: '6px',
                  fontWeight: 600,
                  fontSize: '13px',
                  cursor: 'pointer',
                }}
              >
                Clear
              </button>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                onClick={() => handleSave(false)}
                disabled={saving}
                style={{
                  padding: '9px 18px',
                  backgroundColor: '#f1f5f9',
                  color: '#0f172a',
                  border: '1px solid #cbd5e1',
                  borderRadius: '6px',
                  fontWeight: 600,
                  fontSize: '13px',
                  cursor: 'pointer',
                }}
              >
                Save as Draft
              </button>

              <button
                type="button"
                onClick={() => handleSave(true)}
                disabled={saving}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '9px 20px',
                  backgroundColor: '#0284c7',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '6px',
                  fontWeight: 600,
                  fontSize: '13px',
                  cursor: 'pointer',
                  boxShadow: '0 2px 4px rgba(2, 132, 199, 0.25)',
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
      )}
    </div>
  );
};
