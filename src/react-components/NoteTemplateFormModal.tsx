import React, { useState, useEffect, useCallback } from 'react';
import { colors, radii, shadows, spacing, typography } from '../components/ui/tokens';
import { RichTextEditor } from './RichTextEditor';
import { VoiceTranslatorModal } from './VoiceTranslatorModal';
import { apiFetch } from './utils/api';
import type { NoteTemplateItem, LookupOption } from './NoteTemplatesListScreen';

export interface NoteTemplateFormModalProps {
  isOpen: boolean;
  templateId?: number; // 0 for new, >0 for edit
  initialData?: NoteTemplateItem | null;
  lookups?: {
    NoteType: LookupOption[];
    Department: LookupOption[];
    SubDepartment?: LookupOption[];
  };
  onClose: () => void;
  onSaved: (savedItem: NoteTemplateItem) => void;
}

// Built-in starter medical templates for quick template creation
const STARTER_TEMPLATES = {
  soap: `<h3><strong>CLINICAL PROGRESS NOTE (SOAP)</strong></h3>
<p><strong>SUBJECTIVE:</strong></p>
<p>Patient reports improvement in general condition. No fresh complaints of chest pain, dyspnea, or fever.</p>
<p><strong>OBJECTIVE:</strong></p>
<p>Vitals: BP: 120/80 mmHg, Pulse: 78 bpm, Temp: 98.4°F, SpO2: 98% on room air.</p>
<p>CVS: S1 S2 heard. RS: Clear bilaterally. P/A: Soft, non-tender.</p>
<p><strong>ASSESSMENT:</strong></p>
<p>Stable clinical status. Responding well to current medical management.</p>
<p><strong>PLAN:</strong></p>
<p>1. Continue present medications.<br>2. Monitor vitals Q8H.<br>3. Routine blood counts tomorrow.</p>`,

  discharge: `<h3><strong>PATIENT DISCHARGE SUMMARY</strong></h3>
<p><strong>ADMISSION DIAGNOSIS:</strong> Acute Febrile Illness / Acute Bronchitis</p>
<p><strong>FINAL DIAGNOSIS:</strong> Resolved Acute Bronchitis, Hemodynamically Stable</p>
<hr>
<p><strong>HOSPITAL COURSE &amp; MANAGEMENT:</strong></p>
<p>Patient was admitted with high-grade fever and productive cough. Treated with IV antibiotics, bronchodilators, and antipyretics. Patient demonstrated marked clinical improvement with complete defervescence.</p>
<p><strong>CONDITION AT DISCHARGE:</strong> Afebrile, vitals stable, ambulating independently, tolerating oral diet well.</p>
<p><strong>DISCHARGE ADVICE &amp; MEDICATIONS:</strong></p>
<p>1. Tab. Amoxicillin-Clavulanate 625mg PO BID x 5 days<br>2. Tab. Paracetamol 650mg PO SOS for fever<br>3. Adequate oral hydration and restful recovery</p>
<p><strong>FOLLOW-UP:</strong> Review in OPD after 5 days with repeat CBC.</p>`,

  consult: `<h3><strong>SPECIALIST CONSULTATION NOTE</strong></h3>
<p><strong>REASON FOR CONSULTATION:</strong> Evaluation and management</p>
<p><strong>FINDINGS &amp; OPINION:</strong></p>
<p>Detailed history reviewed. Systemic examination reveals stable hemodynamics without active distress.</p>
<p><strong>RECOMMENDATIONS:</strong></p>
<p>1. Optimized medical therapy as outlined.<br>2. Advise 2D Echocardiogram / Ultrasound abdomen.<br>3. Re-evaluate if red flag symptoms develop.</p>`,
};

export const NoteTemplateFormModal: React.FC<NoteTemplateFormModalProps> = ({
  isOpen,
  templateId = 0,
  initialData,
  lookups,
  onClose,
  onSaved,
}) => {
  const isEditMode = templateId > 0;

  // Form Fields
  const [code, setCode] = useState<string>('');
  const [templateName, setTemplateName] = useState<string>('');
  const [noteTypeId, setNoteTypeId] = useState<number>(1);
  const [departmentId, setDepartmentId] = useState<number>(-1);
  const [subDepartmentId, setSubDepartmentId] = useState<number>(-1);
  const [isActive, setIsActive] = useState<boolean>(true);
  const [contentHtml, setContentHtml] = useState<string>('');

  // Voice Translator Modal state
  const [isVoiceTranslatorOpen, setIsVoiceTranslatorOpen] = useState<boolean>(false);
  // HTML insertion payload for RichTextEditor
  const [insertPayload, setInsertPayload] = useState<string>('');

  // Preview Modal state
  const [isPreviewOpen, setIsPreviewOpen] = useState<boolean>(false);

  // Loading & Validation States
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [errors, setErrors] = useState<{ code?: string; templateName?: string }>({});
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Dynamic SubDepartment Lookup
  const [subDeptList, setSubDeptList] = useState<LookupOption[]>(lookups?.SubDepartment || []);

  // Fetch Template Details when editing
  const loadTemplate = useCallback(async (id: number) => {
    setIsLoading(true);
    try {
      const res = await apiFetch('clinicalmaster/NoteTemplate/GetNoteTemplateById', { Id: id });
      const data = res?.Data || res;
      if (data) {
        setCode(data.Code || '');
        setTemplateName(data.TemplateName || '');
        setNoteTypeId(data.NoteTypeId || 1);
        setDepartmentId(data.DepartmentId || -1);
        setSubDepartmentId(data.SubDepartmentId || -1);
        setIsActive(data.IsActive !== false && data.ActiveStatusId !== 1);
        setContentHtml(data.DataTemplate || '');
      }
    } catch (err) {
      console.error('Failed to load note template:', err);
      setStatusMessage({ text: 'Failed to load note template details.', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch Subdepartments when department changes
  const fetchSubDepartments = useCallback(async (deptIdVal: number) => {
    if (deptIdVal <= 0) {
      setSubDeptList([]);
      return;
    }
    try {
      const res = await apiFetch('General/Options/getoptions', [
        {
          Key: 'SubDepartment',
          Request: {
            Params: [{ Key: 6, Value: deptIdVal }],
          },
        },
      ]);
      if (res && res.SubDepartment) {
        setSubDeptList(res.SubDepartment);
      }
    } catch (e) {
      console.warn('Failed to load subdepartments:', e);
    }
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    if (isEditMode) {
      if (initialData && initialData.Id === templateId) {
        setCode(initialData.Code || '');
        setTemplateName(initialData.TemplateName || '');
        setNoteTypeId(initialData.NoteTypeId || 1);
        setDepartmentId(initialData.DepartmentId || -1);
        setSubDepartmentId(initialData.SubDepartmentId || -1);
        setIsActive(initialData.IsActive !== false && initialData.ActiveStatusId !== 1);
        setContentHtml(initialData.DataTemplate || '');
      } else {
        loadTemplate(templateId);
      }
    } else {
      // Add mode defaults
      setCode('');
      setTemplateName('');
      setNoteTypeId(lookups?.NoteType?.[0]?.Id || 1);
      setDepartmentId(lookups?.Department?.[0]?.Id || -1);
      setSubDepartmentId(-1);
      setIsActive(true);
      setContentHtml('');
      setErrors({});
      setStatusMessage(null);
    }
  }, [isOpen, isEditMode, templateId, initialData, loadTemplate, lookups]);

  // Load subdepartments if department is set
  useEffect(() => {
    if (departmentId > 0) {
      fetchSubDepartments(departmentId);
    }
  }, [departmentId, fetchSubDepartments]);

  // Form Validation
  const validateForm = (): boolean => {
    const newErrors: { code?: string; templateName?: string } = {};
    if (!code.trim()) {
      newErrors.code = 'Template Code is required';
    }
    if (!templateName.trim()) {
      newErrors.templateName = 'Template Name is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Save / Update Handler
  const handleSave = async () => {
    if (!validateForm()) return;

    setIsSaving(true);
    setStatusMessage(null);

    const payload = {
      Data: {
        Id: isEditMode ? templateId : 0,
        Code: code.trim().toUpperCase(),
        TemplateName: templateName.trim(),
        NoteTypeId: noteTypeId,
        DepartmentId: departmentId > 0 ? departmentId : undefined,
        SubDepartmentId: subDepartmentId > 0 ? subDepartmentId : undefined,
        DataTemplate: contentHtml,
        IsActive: isActive,
        ActiveStatusId: isActive ? 2 : 1,
      },
    };

    try {
      const endpoint = isEditMode
        ? 'clinicalmaster/NoteTemplate/UpdateNoteTemplate'
        : 'clinicalmaster/NoteTemplate/AddNoteTemplate';

      const res = await apiFetch(endpoint, payload);

      if (res && res.error) {
        setStatusMessage({ text: res.error || 'Failed to save template', type: 'error' });
      } else {
        setStatusMessage({ text: 'Note Template saved successfully!', type: 'success' });
        setTimeout(() => {
          onSaved({
            ...payload.Data,
            Id: isEditMode ? templateId : (typeof res === 'number' ? res : res?.Id || 0),
          });
          onClose();
        }, 600);
      }
    } catch (err: any) {
      console.error('Error saving note template:', err);
      setStatusMessage({
        text: err?.Error?.Message || err?.message || 'Error occurred while saving note template.',
        type: 'error',
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Starter template loader
  const handleLoadStarter = (type: 'soap' | 'discharge' | 'consult') => {
    setContentHtml(STARTER_TEMPLATES[type]);
    if (!templateName) {
      if (type === 'soap') setTemplateName('Clinical Progress Note (SOAP)');
      if (type === 'discharge') setTemplateName('General Discharge Summary');
      if (type === 'consult') setTemplateName('Specialist Consultation Evaluation');
    }
    if (!code) {
      if (type === 'soap') setCode('SOAP_GEN');
      if (type === 'discharge') setCode('DISC_SUMM');
      if (type === 'consult') setCode('SPEC_CONS');
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(6px)',
          zIndex: 10000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '60px 20px 20px 20px',
          boxSizing: 'border-box',
          animation: 'fadeIn 0.2s ease-out',
        }}
        onClick={(e) => {
          if (e.target === e.currentTarget && !isSaving) onClose();
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: '1040px',
            maxHeight: '92vh',
            backgroundColor: '#ffffff',
            borderRadius: radii.xl,
            boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.3)',
            border: `1px solid ${colors.border}`,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            position: 'relative',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* ── Modal Header ── */}
          <div
            style={{
              padding: `${spacing.md} ${spacing.xl}`,
              background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxShadow: shadows.sm,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: spacing.md }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: radii.md,
                  background: 'rgba(255, 255, 255, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 20,
                  color: '#ffffff',
                }}
              >
                <i className="fas fa-file-medical-alt" />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#ffffff', letterSpacing: -0.2 }}>
                  {isEditMode ? `Edit Note Template: ${code || 'Template'}` : 'Create New Note Template'}
                </h3>
                <div style={{ fontSize: 12, color: 'rgba(255, 255, 255, 0.85)', marginTop: 2 }}>
                  Configure clinical documentation template &amp; multi-language voice dictation
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm }}>
              {/* Voice Translator Shortcut Button in Header */}
              <button
                type="button"
                onClick={() => setIsVoiceTranslatorOpen(true)}
                title="Open Multilingual Voice Translator"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '7px 14px',
                  borderRadius: radii.full,
                  border: '1px solid rgba(255, 255, 255, 0.4)',
                  backgroundColor: 'rgba(255, 255, 255, 0.15)',
                  color: '#ffffff',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                  backdropFilter: 'blur(4px)',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.28)')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.15)')}
              >
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: radii.full,
                    backgroundColor: '#10b981',
                    boxShadow: '0 0 6px #10b981',
                  }}
                />
                <i className="fas fa-microphone-alt" />
                <span>Voice Translator</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                title="Close"
                style={{
                  background: 'rgba(255, 255, 255, 0.15)',
                  border: 'none',
                  color: '#ffffff',
                  width: 34,
                  height: 34,
                  borderRadius: radii.full,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'background 0.15s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)')}
              >
                <i className="fas fa-times" />
              </button>
            </div>
          </div>

          {/* ── Status Message Banner ── */}
          {statusMessage && (
            <div
              style={{
                padding: '10px 20px',
                backgroundColor: statusMessage.type === 'error' ? '#fef2f2' : '#ecfdf5',
                color: statusMessage.type === 'error' ? '#991b1b' : '#065f46',
                borderBottom: `1px solid ${statusMessage.type === 'error' ? '#fecaca' : '#a7f3d0'}`,
                fontSize: 13,
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <i className={`fas fa-${statusMessage.type === 'error' ? 'exclamation-circle' : 'check-circle'}`} />
              <span>{statusMessage.text}</span>
            </div>
          )}

          {/* ── Modal Body Form ── */}
          <div
            style={{
              padding: `${spacing.lg} ${spacing.xl}`,
              overflowY: 'auto',
              flex: 1,
              backgroundColor: '#f8fafc',
            }}
          >
            {isLoading ? (
              <div style={{ textAlign: 'center', padding: '60px 0', color: colors.textMuted }}>
                <i className="fas fa-spinner fa-spin fa-2x" style={{ marginBottom: 12, color: colors.primary, display: 'block' }} />
                Loading template details...
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.lg }}>
                {/* ── Row 1: Code, Name, Note Type ── */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1.2fr 2fr 1.5fr',
                    gap: spacing.md,
                    backgroundColor: '#ffffff',
                    padding: spacing.md,
                    borderRadius: radii.lg,
                    border: `1px solid ${colors.border}`,
                    boxShadow: shadows.xs,
                  }}
                >
                  {/* Template Code */}
                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontSize: 12,
                        fontWeight: 700,
                        color: colors.textMain,
                        marginBottom: 4,
                      }}
                    >
                      Template Code <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input
                      id="input-template-code"
                      type="text"
                      placeholder="e.g. DISC_GEN"
                      value={code}
                      onChange={(e) => {
                        setCode(e.target.value.toUpperCase());
                        if (errors.code) setErrors((prev) => ({ ...prev, code: undefined }));
                      }}
                      style={{
                        width: '100%',
                        height: 38,
                        borderRadius: radii.md,
                        border: errors.code ? '1px solid #ef4444' : `1px solid ${colors.border}`,
                        padding: '0 10px',
                        fontSize: 13,
                        fontWeight: 600,
                        fontFamily: 'monospace',
                        color: colors.textMain,
                        backgroundColor: '#ffffff',
                        outline: 'none',
                        boxSizing: 'border-box',
                      }}
                    />
                    {errors.code && (
                      <span style={{ fontSize: 11, color: '#ef4444', marginTop: 3, display: 'block' }}>
                        {errors.code}
                      </span>
                    )}
                  </div>

                  {/* Template Name */}
                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontSize: 12,
                        fontWeight: 700,
                        color: colors.textMain,
                        marginBottom: 4,
                      }}
                    >
                      Template Name <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input
                      id="input-template-name"
                      type="text"
                      placeholder="e.g. General Discharge Summary"
                      value={templateName}
                      onChange={(e) => {
                        setTemplateName(e.target.value);
                        if (errors.templateName) setErrors((prev) => ({ ...prev, templateName: undefined }));
                      }}
                      style={{
                        width: '100%',
                        height: 38,
                        borderRadius: radii.md,
                        border: errors.templateName ? '1px solid #ef4444' : `1px solid ${colors.border}`,
                        padding: '0 10px',
                        fontSize: 13,
                        color: colors.textMain,
                        backgroundColor: '#ffffff',
                        outline: 'none',
                        boxSizing: 'border-box',
                      }}
                    />
                    {errors.templateName && (
                      <span style={{ fontSize: 11, color: '#ef4444', marginTop: 3, display: 'block' }}>
                        {errors.templateName}
                      </span>
                    )}
                  </div>

                  {/* Note Type */}
                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontSize: 12,
                        fontWeight: 700,
                        color: colors.textMain,
                        marginBottom: 4,
                      }}
                    >
                      Note Type
                    </label>
                    <select
                      id="select-note-type"
                      value={noteTypeId}
                      onChange={(e) => setNoteTypeId(parseInt(e.target.value, 10))}
                      style={{
                        width: '100%',
                        height: 38,
                        borderRadius: radii.md,
                        border: `1px solid ${colors.border}`,
                        padding: '0 10px',
                        fontSize: 13,
                        color: colors.textMain,
                        backgroundColor: '#ffffff',
                        outline: 'none',
                        cursor: 'pointer',
                        boxSizing: 'border-box',
                      }}
                    >
                      {(lookups?.NoteType || [
                        { Id: 1, Text: 'Discharge Summary' },
                        { Id: 2, Text: 'Progress Note' },
                        { Id: 3, Text: 'Consultation Note' },
                        { Id: 4, Text: 'Procedure Note' },
                        { Id: 5, Text: 'Operation Note' },
                      ]).map((item) => (
                        <option key={item.Id} value={item.Id}>
                          {item.Text || item.Description}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* ── Row 2: Department, Sub-Department, Active Status ── */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1.5fr 1.5fr 1fr',
                    gap: spacing.md,
                    backgroundColor: '#ffffff',
                    padding: spacing.md,
                    borderRadius: radii.lg,
                    border: `1px solid ${colors.border}`,
                    boxShadow: shadows.xs,
                    alignItems: 'center',
                  }}
                >
                  {/* Department */}
                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontSize: 12,
                        fontWeight: 700,
                        color: colors.textMain,
                        marginBottom: 4,
                      }}
                    >
                      Department
                    </label>
                    <select
                      id="select-department"
                      value={departmentId}
                      onChange={(e) => setDepartmentId(parseInt(e.target.value, 10))}
                      style={{
                        width: '100%',
                        height: 38,
                        borderRadius: radii.md,
                        border: `1px solid ${colors.border}`,
                        padding: '0 10px',
                        fontSize: 13,
                        color: colors.textMain,
                        backgroundColor: '#ffffff',
                        outline: 'none',
                        cursor: 'pointer',
                        boxSizing: 'border-box',
                      }}
                    >
                      <option value={-1}>-- Select Department --</option>
                      {lookups?.Department?.map((dept) => (
                        <option key={dept.Id} value={dept.Id}>
                          {dept.Text || dept.DepartmentName}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* SubDepartment */}
                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontSize: 12,
                        fontWeight: 700,
                        color: colors.textMain,
                        marginBottom: 4,
                      }}
                    >
                      Sub Department
                    </label>
                    <select
                      id="select-subdepartment"
                      value={subDepartmentId}
                      onChange={(e) => setSubDepartmentId(parseInt(e.target.value, 10))}
                      style={{
                        width: '100%',
                        height: 38,
                        borderRadius: radii.md,
                        border: `1px solid ${colors.border}`,
                        padding: '0 10px',
                        fontSize: 13,
                        color: colors.textMain,
                        backgroundColor: '#ffffff',
                        outline: 'none',
                        cursor: 'pointer',
                        boxSizing: 'border-box',
                      }}
                    >
                      <option value={-1}>-- All / None --</option>
                      {subDeptList.map((sub) => (
                        <option key={sub.Id} value={sub.Id}>
                          {sub.Text || sub.Description}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Active Switch */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                    <label
                      style={{
                        display: 'block',
                        fontSize: 12,
                        fontWeight: 700,
                        color: colors.textMain,
                        marginBottom: 6,
                      }}
                    >
                      Status
                    </label>
                    <label
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 10,
                        cursor: 'pointer',
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={isActive}
                        onChange={(e) => setIsActive(e.target.checked)}
                        style={{ display: 'none' }}
                      />
                      <div
                        style={{
                          width: 44,
                          height: 24,
                          borderRadius: 12,
                          backgroundColor: isActive ? '#10b981' : '#cbd5e1',
                          position: 'relative',
                          transition: 'background-color 0.2s ease',
                        }}
                      >
                        <div
                          style={{
                            width: 18,
                            height: 18,
                            borderRadius: '50%',
                            backgroundColor: '#ffffff',
                            position: 'absolute',
                            top: 3,
                            left: isActive ? 23 : 3,
                            transition: 'left 0.2s ease',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                          }}
                        />
                      </div>
                      <span
                        style={{
                          fontSize: 13,
                          fontWeight: 600,
                          color: isActive ? '#059669' : colors.textMuted,
                        }}
                      >
                        {isActive ? 'Active' : 'Inactive'}
                      </span>
                    </label>
                  </div>
                </div>

                {/* ── Starter Templates & Voice Bar ── */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: spacing.sm,
                    padding: `${spacing.sm} ${spacing.md}`,
                    backgroundColor: '#eff6ff',
                    borderRadius: radii.lg,
                    border: '1px solid #bfdbfe',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#1e40af' }}>
                      <i className="fas fa-magic" style={{ marginRight: 4 }} />
                      Quick Starter Templates:
                    </span>
                    <button
                      id="btn-starter-soap"
                      type="button"
                      onClick={() => handleLoadStarter('soap')}
                      style={{
                        padding: '4px 10px',
                        borderRadius: radii.md,
                        border: '1px solid #93c5fd',
                        background: '#ffffff',
                        color: '#1d4ed8',
                        fontSize: 11,
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      SOAP Note
                    </button>
                    <button
                      id="btn-starter-discharge"
                      type="button"
                      onClick={() => handleLoadStarter('discharge')}
                      style={{
                        padding: '4px 10px',
                        borderRadius: radii.md,
                        border: '1px solid #93c5fd',
                        background: '#ffffff',
                        color: '#1d4ed8',
                        fontSize: 11,
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      Discharge Summary
                    </button>
                    <button
                      id="btn-starter-consult"
                      type="button"
                      onClick={() => handleLoadStarter('consult')}
                      style={{
                        padding: '4px 10px',
                        borderRadius: radii.md,
                        border: '1px solid #93c5fd',
                        background: '#ffffff',
                        color: '#1d4ed8',
                        fontSize: 11,
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      Consult Note
                    </button>
                  </div>

                  {/* Prominent Voice Translator Action Button */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <button
                      id="btn-voice-translator-form"
                      type="button"
                      onClick={() => setIsVoiceTranslatorOpen(true)}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '6px 16px',
                        borderRadius: radii.full,
                        border: 'none',
                        background: 'linear-gradient(135deg, #2563eb 0%, #0284c7 100%)',
                        color: '#ffffff',
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: 'pointer',
                        boxShadow: '0 3px 10px rgba(37, 99, 235, 0.3)',
                        transition: 'transform 0.15s ease',
                      }}
                      onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.97)')}
                      onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                    >
                      <i className="fas fa-microphone-alt" />
                      <span>Voice Translator (19+ Langs)</span>
                    </button>

                    <button
                      id="btn-preview-template-form"
                      type="button"
                      onClick={() => setIsPreviewOpen(true)}
                      title="Preview rendered note template"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        padding: '6px 12px',
                        borderRadius: radii.md,
                        border: `1px solid ${colors.border}`,
                        backgroundColor: '#ffffff',
                        color: colors.textMain,
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      <i className="fas fa-eye" />
                      <span>Preview</span>
                    </button>
                  </div>
                </div>

                {/* ── Rich Text Editor with Voice Dictation ── */}
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <label
                    style={{
                      display: 'block',
                      fontSize: 12,
                      fontWeight: 700,
                      color: colors.textMain,
                      marginBottom: 6,
                    }}
                  >
                    Template Body Content
                  </label>
                  <RichTextEditor
                    richtext={contentHtml}
                    onContentChange={setContentHtml}
                    insertHtml={insertPayload}
                    onInsertHtmlDone={() => setInsertPayload('')}
                    placeholder="Compose clinical template or use Voice Translator to dictate in Hindi, Tamil, Telugu, Spanish, etc..."
                    height={340}
                  />
                </div>
              </div>
            )}
          </div>

          {/* ── Modal Footer ── */}
          <div
            style={{
              padding: `${spacing.md} ${spacing.xl}`,
              backgroundColor: '#ffffff',
              borderTop: `1px solid ${colors.border}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxShadow: shadows.sm,
            }}
          >
            <div style={{ fontSize: 12, color: colors.textMuted, display: 'flex', alignItems: 'center', gap: 6 }}>
              <i className="fas fa-shield-alt" style={{ color: '#10b981' }} />
              <span>Changes are committed to EMR Clinical Master</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm }}>
              <button
                id="btn-cancel-note-template"
                type="button"
                onClick={onClose}
                disabled={isSaving}
                style={{
                  padding: '9px 18px',
                  borderRadius: radii.md,
                  border: `1px solid ${colors.border}`,
                  backgroundColor: '#ffffff',
                  color: colors.textMain,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>

              <button
                id="btn-save-note-template"
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                style={{
                  padding: '9px 24px',
                  borderRadius: radii.md,
                  border: 'none',
                  background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                  color: '#ffffff',
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: isSaving ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)',
                  opacity: isSaving ? 0.7 : 1,
                }}
              >
                <i className={`fas fa-${isSaving ? 'spinner fa-spin' : 'save'}`} />
                <span>{isSaving ? 'Saving Template...' : isEditMode ? 'Update Template' : 'Save & Approve'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Sub-Modal: Multilingual Voice Translator ── */}
      <VoiceTranslatorModal
        isOpen={isVoiceTranslatorOpen}
        onClose={() => setIsVoiceTranslatorOpen(false)}
        currentTemplateHtml={contentHtml}
        onInsertAtCursor={(textOrHtml) => {
          setInsertPayload(textOrHtml);
        }}
        onAppendToTemplate={(textOrHtml) => {
          setContentHtml((prev) => (prev ? prev + '<br/>' + textOrHtml : textOrHtml));
        }}
        onReplaceTemplate={(textOrHtml) => {
          setContentHtml(textOrHtml);
        }}
      />

      {/* ── Sub-Modal: Template Preview ── */}
      {isPreviewOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(15, 23, 42, 0.7)',
            zIndex: 10040,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: spacing.md,
            boxSizing: 'border-box',
          }}
          onClick={() => setIsPreviewOpen(false)}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '800px',
              maxHeight: '88vh',
              backgroundColor: '#ffffff',
              borderRadius: radii.xl,
              boxShadow: shadows.xl,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                padding: `${spacing.md} ${spacing.lg}`,
                borderBottom: `1px solid ${colors.border}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <h4 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: colors.textMain }}>
                  {templateName || 'Note Template Preview'}
                </h4>
                <div style={{ fontSize: 12, color: colors.textMuted }}>Code: {code || 'N/A'}</div>
              </div>
              <button
                type="button"
                onClick={() => setIsPreviewOpen(false)}
                style={{
                  border: 'none',
                  background: 'none',
                  color: colors.textMuted,
                  fontSize: 16,
                  cursor: 'pointer',
                }}
              >
                <i className="fas fa-times" />
              </button>
            </div>

            <div
              style={{
                padding: spacing.xl,
                overflowY: 'auto',
                flex: 1,
                fontSize: 14,
                lineHeight: 1.6,
                color: colors.textMain,
              }}
              dangerouslySetInnerHTML={{
                __html: contentHtml || '<p style="color:#94a3b8; font-style:italic">No template content entered yet.</p>',
              }}
            />

            <div
              style={{
                padding: `${spacing.sm} ${spacing.lg}`,
                borderTop: `1px solid ${colors.border}`,
                display: 'flex',
                justifyContent: 'flex-end',
              }}
            >
              <button
                type="button"
                onClick={() => setIsPreviewOpen(false)}
                style={{
                  padding: '6px 16px',
                  borderRadius: radii.md,
                  border: `1px solid ${colors.border}`,
                  background: '#f8fafc',
                  color: colors.textMain,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .ql-editor h1, .ql-editor h2, .ql-editor h3, .ql-editor h4 {
          color: #0f172a !important;
          margin-top: 10px;
          margin-bottom: 6px;
          font-weight: 700;
        }
        .ql-editor {
          font-family: inherit;
          font-size: 14px;
          color: #1e293b;
          line-height: 1.6;
          min-height: 220px;
        }
        .ql-editor p {
          margin-bottom: 6px;
        }
      `}</style>
    </>
  );
};
