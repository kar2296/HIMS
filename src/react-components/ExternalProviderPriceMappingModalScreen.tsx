import React, { useState, useEffect } from 'react';
import { callBackendApi } from '../services/apiService';

export interface PriceMappingModalData {
  Id?: number;
  ExternalProviderId?: number;
  TestId?: number;
  TestName?: string;
  TESTMASTERTYPId?: number;
  ProviderName?: string;
  AliasCode?: string;
  AliasName?: string;
  Price?: number;
  IsActive?: boolean;
}

export interface ExternalProviderPriceMappingModalScreenProps {
  reactProps?: {
    id?: number;
    externalproviderid?: number;
    providerName?: string;
    item?: PriceMappingModalData;
    lookup?: {
      TESTMASTERTYP?: Array<{ Id: number | string; Text: string }>;
    };
  };
  onAction?: (actionName: string, payload?: any) => void;
  onClose?: () => void;
}

export const ExternalProviderPriceMappingModalScreen: React.FC<ExternalProviderPriceMappingModalScreenProps> = ({
  reactProps,
  onAction,
  onClose,
}) => {
  const [item, setItem] = useState<PriceMappingModalData>(
    reactProps?.item || {
      IsActive: true,
      TESTMASTERTYPId: 1,
      ProviderName: reactProps?.providerName || '',
      Price: 0,
    }
  );
  const [saving, setSaving] = useState<boolean>(false);

  useEffect(() => {
    if (reactProps?.item) {
      setItem(reactProps.item);
    }
  }, [reactProps?.item]);

  const testMasterTypes = (reactProps?.lookup?.TESTMASTERTYP as any) || [
    { Id: 1, Text: 'Molecular Biology & Genetics' },
    { Id: 2, Text: 'Specialized Histopathology' },
    { Id: 3, Text: 'Reference Cytogenetics' },
    { Id: 4, Text: 'Automated Clinical Biochemistry' },
  ];

  const handleSave = async () => {
    if (onAction) {
      onAction('save', item);
      return;
    }

    setSaving(true);
    try {
      const payload = { Data: item };
      const actionName = item.Id && item.Id > 0 ? 'lis/PriceMapping/UpdatePriceMapping' : 'lis/PriceMapping/AddPriceMapping';
      await callBackendApi(actionName, 'POST', payload);
      if (onClose) onClose();
    } catch (err) {
      console.error('Error saving price mapping:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    if (onClose) onClose();
    else if (onAction) onAction('close');
  };

  return (
    <div
      style={{
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        maxWidth: '650px',
        margin: '0 auto',
        overflow: 'hidden',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
        border: '1px solid #e2e8f0',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px 24px',
          borderBottom: '1px solid #e2e8f0',
          backgroundColor: '#f8fafc',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '6px',
              backgroundColor: '#0284c7',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '16px',
            }}
          >
            <i className="fa fa-tag" />
          </div>
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>
            {item.Id && item.Id > 0 ? 'Edit Outsource Price Mapping' : 'Map Test Outsource Cost'}
          </h3>
        </div>

        <button
          type="button"
          onClick={handleClose}
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', color: '#64748b' }}
        >
          <i className="fa fa-times" />
        </button>
      </div>

      {/* Body */}
      <div style={{ padding: '24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
          {/* Discipline */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
              Laboratory Discipline <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <select
              value={item.TESTMASTERTYPId || 1}
              onChange={(e) => setItem((prev) => ({ ...prev, TESTMASTERTYPId: parseInt(e.target.value, 10) }))}
              style={{
                width: '100%',
                padding: '8px 12px',
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

          {/* Test Name */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
              Test / Investigation Name <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input
              type="text"
              value={item.TestName || ''}
              onChange={(e) => setItem((prev) => ({ ...prev, TestName: e.target.value }))}
              placeholder="e.g. Bone Marrow Cytogenetics"
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                fontSize: '13px',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Provider Name */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
              External Provider
            </label>
            <input
              type="text"
              value={item.ProviderName || reactProps?.providerName || ''}
              disabled
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '6px',
                border: '1px solid #e2e8f0',
                backgroundColor: '#f8fafc',
                fontSize: '13px',
                color: '#64748b',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Alias Code */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
              External Lab Test Code (Alias Code)
            </label>
            <input
              type="text"
              value={item.AliasCode || ''}
              onChange={(e) => setItem((prev) => ({ ...prev, AliasCode: e.target.value }))}
              placeholder="e.g. REF-CYTO-102"
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                fontSize: '13px',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Alias Name */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
              External Lab Test Name (Alias Name)
            </label>
            <input
              type="text"
              value={item.AliasName || ''}
              onChange={(e) => setItem((prev) => ({ ...prev, AliasName: e.target.value }))}
              placeholder="e.g. Cytogenetic Karyotyping Comprehensive"
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                fontSize: '13px',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Price */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
              Agreed Outsource Price ($) <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input
              type="number"
              step="0.01"
              value={item.Price ?? ''}
              onChange={(e) => setItem((prev) => ({ ...prev, Price: parseFloat(e.target.value) || 0 }))}
              placeholder="0.00"
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                fontSize: '13px',
                fontWeight: 700,
                color: '#047857',
                boxSizing: 'border-box',
              }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <input
            type="checkbox"
            id="mappingActive"
            checked={!!item.IsActive}
            onChange={(e) => setItem((prev) => ({ ...prev, IsActive: e.target.checked }))}
            style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: '#0284c7' }}
          />
          <label htmlFor="mappingActive" style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a', cursor: 'pointer' }}>
            Active for Automatic Outsource Billing & Routing
          </label>
        </div>
      </div>

      {/* Footer */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '10px',
          padding: '16px 24px',
          borderTop: '1px solid #e2e8f0',
          backgroundColor: '#f8fafc',
        }}
      >
        <button
          type="button"
          onClick={handleClose}
          style={{
            padding: '8px 16px',
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
          onClick={handleSave}
          disabled={saving}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 20px',
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
              <i className="fa fa-check" /> Save Mapping
            </>
          )}
        </button>
      </div>
    </div>
  );
};
