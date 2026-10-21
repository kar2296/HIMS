import React, { useState, useRef } from 'react';
import { callBackendApi } from '../services/apiService';

export interface ClinicalDocumentData {
  Id?: number;
  DocumentTypeId?: number;
  CreatedDate?: string;
  comments?: string;
  Name?: string;
  FilePath?: string;
  WorkOrderdId?: number;
  EncounterId?: number;
  PatientId?: number;
  CreatedBy?: number;
}

export interface ExternalClinicalDocumentModalScreenProps {
  reactProps?: {
    id?: number;
    eid?: number;
    oid?: number;
    pid?: number;
    item?: ClinicalDocumentData;
    patient?: {
      MRN?: string;
      FirstName?: string;
      LastName?: string;
      Age?: number;
      Gender?: { Description?: string };
      Title?: { Description?: string };
    };
    lookup?: {
      DocumentType?: Array<{ Id: number | string; Text: string }>;
    };
  };
  onAction?: (actionName: string, payload?: any) => void;
  onClose?: () => void;
}

export const ExternalClinicalDocumentModalScreen: React.FC<ExternalClinicalDocumentModalScreenProps> = ({
  reactProps,
  onAction,
  onClose,
}) => {
  const [item, setItem] = useState<ClinicalDocumentData>(
    reactProps?.item || {
      DocumentTypeId: 1,
      CreatedDate: new Date().toISOString().slice(0, 16),
      comments: '',
    }
  );
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const documentTypes = reactProps?.lookup?.DocumentType || [
    { Id: 1, Text: 'Outsource Lab Result Slip' },
    { Id: 2, Text: 'External Referral Lab Requisition' },
    { Id: 3, Text: 'Specimen Courier Manifest' },
    { Id: 4, Text: 'Pathology Outsource Report' },
    { Id: 5, Text: 'Clinical Consultation Note' },
    { Id: 6, Text: 'Other Diagnostic Record' },
  ];

  const patient = reactProps?.patient;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setItem((prev) => ({ ...prev, Name: file.name }));
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setSelectedFile(file);
      setItem((prev) => ({ ...prev, Name: file.name }));
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setItem((prev) => ({ ...prev, Name: undefined }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (onAction) {
      onAction('save', {
        item: {
          ...item,
          WorkOrderdId: reactProps?.oid,
          EncounterId: reactProps?.eid,
          PatientId: reactProps?.pid,
        },
        file: selectedFile,
      });
      return;
    }

    setSaving(true);
    try {
      const formData = new FormData();
      if (selectedFile) {
        formData.append('file', selectedFile);
      }
      formData.append(
        'Data',
        JSON.stringify({
          ...item,
          WorkOrderdId: reactProps?.oid,
          EncounterId: reactProps?.eid,
          PatientId: reactProps?.pid,
        })
      );

      const endpoint = reactProps?.id
        ? 'emr/ClinicalDocument/UpdateClinicalDocument'
        : 'emr/ClinicalDocument/AddClinicalDocument';

      await callBackendApi(endpoint, 'POST', formData);
      if (onClose) onClose();
    } catch (err) {
      console.error('Error saving clinical document:', err);
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
        maxWidth: '680px',
        margin: '0 auto',
        overflow: 'hidden',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
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
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              backgroundColor: '#0284c7',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '16px',
            }}
          >
            <i className="fa fa-file-text-o" />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>
              Upload Clinical Document & Attachment
            </h3>
            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
              Attach external lab report, requisition note, or scan file
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleClose}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: '18px',
            color: '#64748b',
            padding: '4px',
            borderRadius: '4px',
          }}
        >
          <i className="fa fa-times" />
        </button>
      </div>

      {/* Patient Banner if available */}
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
            <span style={{ marginLeft: '10px', fontSize: '12px', color: '#64748b' }}>
              UHID: <b style={{ color: '#0369a1' }}>{patient.MRN || '—'}</b> &bull; {patient.Age ? `${patient.Age}y` : ''} {patient.Gender?.Description || ''}
            </span>
          </div>
          <span
            style={{
              fontSize: '11px',
              fontWeight: 600,
              padding: '2px 8px',
              borderRadius: '12px',
              backgroundColor: '#e0f2fe',
              color: '#0369a1',
            }}
          >
            Work Order #{reactProps?.oid || '—'}
          </span>
        </div>
      )}

      {/* Form Content */}
      <form onSubmit={handleSave} style={{ padding: '24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px', marginBottom: '20px' }}>
          {/* Document Type */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
              Document Category <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <select
              value={item.DocumentTypeId || 1}
              onChange={(e) => setItem((prev) => ({ ...prev, DocumentTypeId: parseInt(e.target.value, 10) }))}
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
              {documentTypes.map((dt) => (
                <option key={dt.Id} value={dt.Id}>
                  {dt.Text}
                </option>
              ))}
            </select>
          </div>

          {/* Created Date */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
              Record / Attachment Date <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input
              type="datetime-local"
              value={item.CreatedDate ? item.CreatedDate.slice(0, 16) : new Date().toISOString().slice(0, 16)}
              onChange={(e) => setItem((prev) => ({ ...prev, CreatedDate: e.target.value }))}
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
        </div>

        {/* Drag and Drop File Upload Zone */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
            Document File (PDF, DICOM, JPEG, PNG, TIFF up to 200MB)
          </label>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />

          {!selectedFile && !item.FilePath ? (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              style={{
                border: isDragging ? '2px dashed #0284c7' : '2px dashed #cbd5e1',
                borderRadius: '8px',
                padding: '28px 20px',
                textAlign: 'center',
                backgroundColor: isDragging ? '#f0f9ff' : '#f8fafc',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  backgroundColor: '#e0f2fe',
                  color: '#0284c7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 10px auto',
                  fontSize: '20px',
                }}
              >
                <i className="fa fa-cloud-upload" />
              </div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#0f172a' }}>
                Drag and drop your file here, or <span style={{ color: '#0284c7' }}>browse</span>
              </div>
              <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                Supports PDF reports, scan images, HL7 documents up to 200MB
              </div>
            </div>
          ) : (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
                borderRadius: '8px',
                backgroundColor: '#f1f5f9',
                border: '1px solid #cbd5e1',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '6px',
                    backgroundColor: '#0284c7',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '18px',
                  }}
                >
                  <i className="fa fa-file" />
                </div>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>
                    {selectedFile?.name || item.Name || 'Attached Document'}
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>
                    {selectedFile ? `${(selectedFile.size / 1024).toFixed(1)} KB` : 'Uploaded Attachment'}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '4px',
                    border: '1px solid #cbd5e1',
                    backgroundColor: '#ffffff',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: '#475569',
                    cursor: 'pointer',
                  }}
                >
                  Replace
                </button>
                <button
                  type="button"
                  onClick={handleRemoveFile}
                  style={{
                    padding: '6px 10px',
                    borderRadius: '4px',
                    border: '1px solid #fca5a5',
                    backgroundColor: '#fef2f2',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: '#dc2626',
                    cursor: 'pointer',
                  }}
                >
                  <i className="fa fa-trash-o" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Clinical Comments */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
            Clinical Remarks & Document Notes
          </label>
          <textarea
            rows={3}
            value={item.comments || ''}
            onChange={(e) => setItem((prev) => ({ ...prev, comments: e.target.value }))}
            placeholder="Add specimen transit conditions, outsourced accession ID, or doctor instructions..."
            style={{
              width: '100%',
              padding: '10px 12px',
              borderRadius: '6px',
              border: '1px solid #cbd5e1',
              fontSize: '13px',
              boxSizing: 'border-box',
              resize: 'vertical',
            }}
          />
        </div>

        {/* Modal Footer */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingTop: '16px',
            borderTop: '1px solid #e2e8f0',
          }}
        >
          <button
            type="button"
            onClick={handleClose}
            style={{
              padding: '9px 18px',
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
            type="submit"
            disabled={saving}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '9px 22px',
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
            <i className={`fa ${saving ? 'fa-spinner fa-spin' : 'fa-check'}`} />
            {saving ? 'Uploading...' : 'Save & Attach Document'}
          </button>
        </div>
      </form>
    </div>
  );
};
