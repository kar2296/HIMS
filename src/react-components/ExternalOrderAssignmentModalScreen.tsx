import React, { useState, useEffect } from 'react';
import { callBackendApi } from '../services/apiService';

export interface ExternalAssignmentData {
  Id?: number;
  ExternalProviderId?: number;
  UserId?: number;
  DoctorName?: string;
  Assigndate?: string | Date;
  ExternalOrderStatusId?: number;
  ExternalPrice?: number;
  WorkOrderStatusId?: number;
}

export interface ExternalOrderAssignmentModalScreenProps {
  reactProps?: {
    worderid?: number;
    pid?: number;
    oid?: number;
    item?: ExternalAssignmentData;
    ordDetails?: {
      TestName?: string;
      TestId?: number;
    };
    patient?: {
      MRN?: string;
      FirstName?: string;
      LastName?: string;
      Age?: number;
      Gender?: { Description?: string };
      Title?: { Description?: string };
    };
    lookup?: {
      ExternalProvider?: Array<{ Id: number | string; Text: string }>;
    };
    canShowAssign?: boolean;
    canShowComplete?: boolean;
  };
  onAction?: (actionName: string, payload?: any) => void;
  onClose?: () => void;
}

export const ExternalOrderAssignmentModalScreen: React.FC<ExternalOrderAssignmentModalScreenProps> = ({
  reactProps,
  onAction,
  onClose,
}) => {
  const [item, setItem] = useState<ExternalAssignmentData>(
    reactProps?.item || {
      Assigndate: new Date().toISOString().split('T')[0],
      ExternalProviderId: 1,
    }
  );
  const [saving, setSaving] = useState<boolean>(false);
  const [providerPrice, setProviderPrice] = useState<number | undefined>(reactProps?.item?.ExternalPrice);

  const testName = reactProps?.ordDetails?.TestName || 'Diagnostic Investigation';
  const patient = reactProps?.patient;
  const canShowAssign = reactProps?.canShowAssign !== undefined ? reactProps.canShowAssign : true;
  const canShowComplete = reactProps?.canShowComplete !== undefined ? reactProps.canShowComplete : false;

  const externalProviders = (reactProps?.lookup?.ExternalProvider as any) || [
    { Id: 1, Text: 'Metropolis Reference Labs' },
    { Id: 2, Text: 'SRL Diagnostics Network' },
    { Id: 3, Text: 'Dr. Lal PathLabs Outsource' },
    { Id: 4, Text: 'Quest Diagnostics Molecular' },
  ];

  useEffect(() => {
    if (reactProps?.item) {
      setItem(reactProps.item);
      setProviderPrice(reactProps.item.ExternalPrice);
    }
  }, [reactProps?.item]);

  const handleProviderChange = (providerId: number) => {
    setItem((prev) => ({ ...prev, ExternalProviderId: providerId }));
    if (onAction) {
      onAction('providerChange', { Id: providerId });
    }
  };

  const handleAssign = async () => {
    if (onAction) {
      onAction('assign', item);
      return;
    }

    setSaving(true);
    try {
      const payload = {
        Data: {
          ...item,
          Id: reactProps?.worderid,
          ExternalOrderStatusId: 2,
        },
      };
      await callBackendApi('lis/patientworkorder/AssignExternalProvider', 'POST', payload);
      if (onClose) onClose();
    } catch (err) {
      console.error('Error assigning order:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleComplete = async () => {
    if (onAction) {
      onAction('complete', item);
      return;
    }

    setSaving(true);
    try {
      const payload = {
        Data: {
          ...item,
          Id: reactProps?.worderid,
          ExternalOrderStatusId: 3,
          WorkOrderStatusId: 4,
        },
      };
      await callBackendApi('lis/patientworkorder/CompleteExternalProvider', 'POST', payload);
      if (onClose) onClose();
    } catch (err) {
      console.error('Error completing order:', err);
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
            <i className="fa fa-paper-plane" />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>
              External Send-Out Assignment
            </h3>
            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
              Dispatch specimen to accredited referral laboratory
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleClose}
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', color: '#64748b' }}
        >
          <i className="fa fa-times" />
        </button>
      </div>

      {/* Patient Banner */}
      {patient && (
        <div
          style={{
            padding: '12px 24px',
            backgroundColor: '#f0f9ff',
            borderBottom: '1px solid #e0f2fe',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '14px' }}>
              {patient.Title?.Description ? `${patient.Title.Description} ` : ''}
              {patient.FirstName} {patient.LastName || ''}
            </span>
            <span style={{ marginLeft: '8px', fontSize: '12px', color: '#64748b' }}>
              UHID: <b style={{ color: '#0369a1' }}>{patient.MRN || '—'}</b> &bull; {patient.Age ? `${patient.Age}y` : ''} {patient.Gender?.Description || ''}
            </span>
          </div>
        </div>
      )}

      {/* Investigation Details Card */}
      <div style={{ padding: '20px 24px', backgroundColor: '#faf5ff', borderBottom: '1px solid #f3e8ff' }}>
        <div style={{ fontSize: '12px', color: '#7e22ce', fontWeight: 600 }}>INVESTIGATION TO SEND OUT</div>
        <div style={{ fontSize: '16px', fontWeight: 700, color: '#581c87', marginTop: '2px' }}>{testName}</div>
      </div>

      {/* Form Fields */}
      <div style={{ padding: '24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px', marginBottom: '16px' }}>
          {/* External Provider Dropdown */}
          <div style={{ gridColumn: 'span 2' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
              Select External Referral Laboratory <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <select
              value={item.ExternalProviderId || 1}
              onChange={(e) => handleProviderChange(parseInt(e.target.value, 10))}
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                fontSize: '13px',
                backgroundColor: '#ffffff',
                boxSizing: 'border-box',
              }}
            >
              {externalProviders.map((opt: any) => (
                <option key={opt.Id} value={opt.Id}>
                  {opt.Text || opt.ProviderName}
                </option>
              ))}
            </select>
          </div>

          {/* Assigned Date */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
              Dispatch / Assignment Date
            </label>
            <input
              type="date"
              value={
                item.Assigndate
                  ? typeof item.Assigndate === 'string'
                    ? item.Assigndate.split('T')[0]
                    : new Date(item.Assigndate).toISOString().split('T')[0]
                  : new Date().toISOString().split('T')[0]
              }
              onChange={(e) => setItem((prev) => ({ ...prev, Assigndate: e.target.value }))}
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

          {/* Price Preview */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
              Agreed Outsource Price
            </label>
            <div
              style={{
                padding: '9px 12px',
                borderRadius: '6px',
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                fontSize: '13px',
                fontWeight: 700,
                color: '#047857',
              }}
            >
              {providerPrice !== undefined ? `$ ${Number(providerPrice).toFixed(2)}` : 'Standard Schedule'}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
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

        <div style={{ display: 'flex', gap: '10px' }}>
          {canShowAssign && (
            <button
              type="button"
              onClick={handleAssign}
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
              <i className="fa fa-paper-plane" /> Assign & Manifest
            </button>
          )}

          {canShowComplete && (
            <button
              type="button"
              onClick={handleComplete}
              disabled={saving}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '9px 20px',
                backgroundColor: '#16a34a',
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                fontWeight: 600,
                fontSize: '13px',
                cursor: 'pointer',
                boxShadow: '0 2px 4px rgba(22, 163, 74, 0.25)',
              }}
            >
              <i className="fa fa-check-circle" /> Mark Sendout Complete
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
