import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiFetch } from './utils/api';
import { sessionHelper } from '../services/sessionHelper';

export interface EventTemplateItem {
  Id?: number;
  EventTypeId?: number;
  FacilityId?: number;
  TemplateKey?: string;
  ModuleName?: string;
  TemplateContent?: string;
  SmsTrigger?: string;
  SampleMessage?: string;
  ScheduleTime?: string;
  IsRepeat?: boolean;
  RepeatDuration?: string;
  SentToPersonId?: number;
  SentToPerson?: string;
  SentToGroupId?: number;
  SentToGroup?: string;
  IsCronJob?: boolean;
  IsActive?: boolean;
  ActiveStatusId?: number;
  ActiveStatus?: any;
  EventType?: { Id?: number; Description?: string; Text?: string };
  Facility?: { Id?: number; FacilityName?: string; Text?: string };
  Status?: number;
  Rev?: number;
  EmailSubject?: string;
}

export interface EventTemplateFormScreenProps {
  id?: number | string;
  reactProps?: {
    id?: number | string;
    item?: EventTemplateItem;
    lookup?: {
      Facility?: Array<{ Id: number; Text: string }>;
      EventType?: Array<{ Id: number; Text: string }>;
      User?: Array<{ Id: number; Text: string }>;
      Group?: Array<{ Id: number; Text: string }>;
      [key: string]: any;
    };
    currentcontext?: {
      id?: number;
      [key: string]: any;
    };
  };
  onAction?: (actionName: string, payload?: any) => void;
  onClose?: () => void;
}

export const TEMPLATE_PLACEHOLDERS = [
  { displaytext: 'Facility Name', placeholder: '{{facilityName}}' },
  { displaytext: 'Patient Name', placeholder: '{{patientName}}' },
  { displaytext: 'Patient MRN', placeholder: '{{mrn}}' },
  { displaytext: 'First Name', placeholder: '{{firstName}}' },
  { displaytext: 'Gender', placeholder: '{{gender}}' },
  { displaytext: 'Age', placeholder: '{{age}}' },
  { displaytext: 'Doctor Name', placeholder: '{{doctorName}}' },
  { displaytext: 'Ref Doctor Name', placeholder: '{{refDoctorName}}' },
  { displaytext: 'No Of Appointments', placeholder: '{{noofappointments}}' },
  { displaytext: 'Display Date', placeholder: '{{displaydate}}' },
  { displaytext: 'Display Time', placeholder: '{{displaytime}}' },
  { displaytext: 'Display Ward', placeholder: '{{displayward}}' },
  { displaytext: 'Display Bed', placeholder: '{{displaybed}}' },
  { displaytext: 'Web Address', placeholder: '{{webAddress}}' },
  { displaytext: 'Test Names', placeholder: '{{testNames}}' },
];

export const EventTemplateFormScreen: React.FC<EventTemplateFormScreenProps> = ({
  id: propId,
  reactProps,
  onAction,
  onClose,
}) => {
  const params = useParams<{ id?: string }>();
  let navigate: ReturnType<typeof useNavigate> | null = null;
  try {
    navigate = useNavigate();
  } catch (e) {
    // Outside react-router context
  }

  const rawId = propId ?? reactProps?.currentcontext?.id ?? reactProps?.id ?? params?.id ?? 0;
  const templateId = Number(rawId) || 0;
  const isEdit = templateId > 0;

  const [item, setItem] = useState<EventTemplateItem>(
    reactProps?.item || {
      Id: templateId,
      TemplateKey: '',
      ModuleName: '',
      EventTypeId: undefined,
      FacilityId: sessionHelper.getCurrentFacilityId() || undefined,
      SmsTrigger: '',
      TemplateContent: '',
      IsActive: true,
      ActiveStatusId: 2,
      ActiveStatus: 'Active',
      SampleMessage: '',
      EmailSubject: '',
      ScheduleTime: '',
      RepeatDuration: '',
      IsRepeat: false,
      IsCronJob: false,
    }
  );

  const [facilityLookup, setFacilityLookup] = useState<any[]>(reactProps?.lookup?.Facility || []);
  const [eventTypeLookup, setEventTypeLookup] = useState<any[]>(reactProps?.lookup?.EventType || []);
  const [userLookup, setUserLookup] = useState<any[]>(reactProps?.lookup?.User || []);
  const [groupLookup, setGroupLookup] = useState<any[]>(reactProps?.lookup?.Group || []);

  const [loading, setLoading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Load Lookups if not present
  useEffect(() => {
    const fetchLookups = async () => {
      if (
        facilityLookup.length > 0 &&
        eventTypeLookup.length > 0 &&
        userLookup.length > 0 &&
        groupLookup.length > 0
      ) {
        return;
      }
      try {
        const inputData = [
          { Key: 'Facility' },
          { Key: 'EventType' },
          { Key: 'User' },
          { Key: 'Group' },
        ];
        const res = await apiFetch('General/Options/getoptions', inputData);
        if (res) {
          if (res.Facility) setFacilityLookup(res.Facility);
          if (res.EventType) setEventTypeLookup(res.EventType);
          if (res.User) setUserLookup(res.User);
          if (res.Group) setGroupLookup(res.Group);
        }
      } catch (err) {
        console.error('Failed to load event template lookups:', err);
      }
    };
    fetchLookups();
  }, []);

  // Fetch Item data if edit mode
  useEffect(() => {
    if (reactProps?.item && reactProps.item.Id === templateId) {
      setItem(reactProps.item);
      return;
    }

    if (templateId > 0) {
      setLoading(true);
      apiFetch('SystemSettings/EventTemplate/GetEventTemplateById', { Id: templateId })
        .then((res) => {
          if (res) {
            setItem(res);
          }
        })
        .catch((err) => {
          console.error('Error fetching event template details:', err);
          showToast('Failed to load template details', 'error');
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [templateId, reactProps?.item]);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleBack = () => {
    if (onClose) {
      onClose();
      return;
    }
    if (onAction) {
      onAction('backToList');
    }
    if (navigate) {
      navigate('/app/eventtemplates');
    } else if (typeof window !== 'undefined' && window.location.hash) {
      window.location.hash = '#/app/eventtemplates';
    }
  };

  const insertPlaceholder = (placeholder: string) => {
    const textarea = textareaRef.current;
    const currentVal = item.TemplateContent || '';
    if (!textarea) {
      setItem((prev) => ({
        ...prev,
        TemplateContent: currentVal + placeholder,
      }));
      return;
    }

    const startPos = textarea.selectionStart ?? currentVal.length;
    const endPos = textarea.selectionEnd ?? currentVal.length;

    const newVal =
      currentVal.substring(0, startPos) +
      placeholder +
      currentVal.substring(endPos, currentVal.length);

    setItem((prev) => ({
      ...prev,
      TemplateContent: newVal,
    }));

    setTimeout(() => {
      textarea.focus();
      const nextPos = startPos + placeholder.length;
      textarea.setSelectionRange(nextPos, nextPos);
    }, 0);
  };

  const validate = (): boolean => {
    const errs: { [key: string]: string } = {};
    if (!item.TemplateKey?.trim()) {
      errs.TemplateKey = 'Template Key is required';
    }
    if (!item.ModuleName?.trim()) {
      errs.ModuleName = 'Module Name is required';
    }
    if (!item.EventTypeId || Number(item.EventTypeId) <= 0) {
      errs.EventTypeId = 'Event Type is required';
    }
    if (!item.TemplateContent?.trim()) {
      errs.TemplateContent = 'Template Content is required';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async (status: 'Draft' | 'Active') => {
    if (!validate()) {
      showToast('Please fix required validation errors', 'error');
      return;
    }

    setSaving(true);
    const payload: EventTemplateItem = {
      ...item,
      Id: templateId > 0 ? templateId : undefined,
      ActiveStatus: status,
      ActiveStatusId: status === 'Active' ? 2 : 1,
      IsActive: item.IsActive !== undefined ? item.IsActive : true,
    };

    try {
      const actionName =
        templateId > 0
          ? 'SystemSettings/EventTemplate/UpdateEventTemplate'
          : 'SystemSettings/EventTemplate/AddEventTemplate';

      if (onAction) {
        onAction(status === 'Active' ? 'saveAndApprove' : 'save', payload);
      }

      await apiFetch(actionName, { Data: payload });

      showToast(
        templateId > 0
          ? `Template updated successfully (${status})`
          : `Template created successfully (${status})`,
        'success'
      );

      setTimeout(() => {
        handleBack();
      }, 1000);
    } catch (err: any) {
      console.error('Error saving template:', err);
      showToast(err?.message || 'Failed to save template', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      style={{
        padding: '24px',
        backgroundColor: '#f8fafc',
        minHeight: '100%',
        boxSizing: 'border-box',
        fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
      }}
    >
      {/* Toast Notification */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            top: 24,
            right: 24,
            zIndex: 9999,
            padding: '12px 20px',
            borderRadius: '6px',
            backgroundColor: toastMessage.type === 'success' ? '#10b981' : '#ef4444',
            color: '#FFFFFF',
            boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
            fontSize: '13px',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <span>{toastMessage.type === 'success' ? '✓' : '⚠️'}</span>
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Header & Breadcrumb */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '12px',
              color: '#64748b',
              marginBottom: 4,
            }}
          >
            <span
              onClick={handleBack}
              style={{
                cursor: 'pointer',
                color: '#2563eb',
                fontWeight: 500,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              ← SMS Templates
            </span>
            <span>/</span>
            <span style={{ color: '#1e293b', fontWeight: 600 }}>
              {isEdit ? `Edit: ${item.TemplateKey || 'Template'}` : 'New SMS Template'}
            </span>
          </div>
          <h2
            style={{
              margin: 0,
              fontSize: '22px',
              fontWeight: 700,
              color: '#0f172a',
            }}
          >
            {isEdit ? 'Edit SMS Template' : 'Create SMS Template'}
          </h2>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            type="button"
            onClick={handleBack}
            disabled={saving}
            style={{
              padding: '8px 16px',
              borderRadius: '6px',
              border: '1px solid #cbd5e1',
              backgroundColor: '#FFFFFF',
              color: '#334155',
              fontWeight: 600,
              cursor: 'pointer',
              fontSize: '13px',
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => handleSave('Draft')}
            disabled={saving || loading}
            style={{
              padding: '8px 16px',
              borderRadius: '6px',
              border: '1px solid #cbd5e1',
              backgroundColor: '#f1f5f9',
              color: '#1e293b',
              fontWeight: 600,
              cursor: saving ? 'not-allowed' : 'pointer',
              fontSize: '13px',
            }}
          >
            {saving ? 'Saving...' : 'Save as Draft'}
          </button>
          <button
            type="button"
            onClick={() => handleSave('Active')}
            disabled={saving || loading}
            style={{
              padding: '8px 20px',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: '#2563eb',
              color: '#FFFFFF',
              fontWeight: 600,
              cursor: saving ? 'not-allowed' : 'pointer',
              fontSize: '13px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            }}
          >
            {saving ? 'Saving...' : 'Save & Approve'}
          </button>
        </div>
      </div>

      {loading ? (
        <div
          style={{
            padding: '40px',
            backgroundColor: '#FFFFFF',
            borderRadius: '8px',
            textAlign: 'center',
            color: '#64748b',
          }}
        >
          Loading template details...
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1fr)',
            gap: '20px',
          }}
        >
          {/* Main Form Card */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              padding: '24px',
            }}
          >
            <h3
              style={{
                margin: '0 0 16px 0',
                fontSize: '16px',
                fontWeight: 600,
                color: '#1e293b',
                borderBottom: '1px solid #f1f5f9',
                paddingBottom: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <span>📄</span>
              <span>Template Definition</span>
            </h3>

            {/* Grid 2-columns */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '16px',
                marginBottom: '20px',
              }}
            >
              {/* Template Key */}
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: '#334155',
                    marginBottom: 6,
                  }}
                >
                  Template Key <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. APPT_CONFIRMATION"
                  value={item.TemplateKey || ''}
                  onChange={(e) => {
                    setItem({ ...item, TemplateKey: e.target.value });
                    if (errors.TemplateKey) setErrors({ ...errors, TemplateKey: '' });
                  }}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: `1px solid ${errors.TemplateKey ? '#ef4444' : '#cbd5e1'}`,
                    fontSize: '13px',
                    boxSizing: 'border-box',
                    outline: 'none',
                  }}
                />
                {errors.TemplateKey && (
                  <span style={{ color: '#ef4444', fontSize: 12, marginTop: 4, display: 'block' }}>
                    {errors.TemplateKey}
                  </span>
                )}
              </div>

              {/* Module Name */}
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: '#334155',
                    marginBottom: 6,
                  }}
                >
                  Module Name <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. EMR, OPD, IPD, Billing"
                  value={item.ModuleName || ''}
                  onChange={(e) => {
                    setItem({ ...item, ModuleName: e.target.value });
                    if (errors.ModuleName) setErrors({ ...errors, ModuleName: '' });
                  }}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: `1px solid ${errors.ModuleName ? '#ef4444' : '#cbd5e1'}`,
                    fontSize: '13px',
                    boxSizing: 'border-box',
                    outline: 'none',
                  }}
                />
                {errors.ModuleName && (
                  <span style={{ color: '#ef4444', fontSize: 12, marginTop: 4, display: 'block' }}>
                    {errors.ModuleName}
                  </span>
                )}
              </div>

              {/* Event Type */}
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: '#334155',
                    marginBottom: 6,
                  }}
                >
                  Event Type <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <select
                  value={item.EventTypeId ?? ''}
                  onChange={(e) => {
                    const val = e.target.value ? Number(e.target.value) : undefined;
                    setItem({ ...item, EventTypeId: val });
                    if (errors.EventTypeId) setErrors({ ...errors, EventTypeId: '' });
                  }}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: `1px solid ${errors.EventTypeId ? '#ef4444' : '#cbd5e1'}`,
                    fontSize: '13px',
                    boxSizing: 'border-box',
                    backgroundColor: '#FFFFFF',
                    outline: 'none',
                  }}
                >
                  <option value="">-- Select Event Type --</option>
                  {eventTypeLookup.map((opt) => (
                    <option key={opt.Id} value={opt.Id}>
                      {opt.Text || opt.Description || `Type #${opt.Id}`}
                    </option>
                  ))}
                </select>
                {errors.EventTypeId && (
                  <span style={{ color: '#ef4444', fontSize: 12, marginTop: 4, display: 'block' }}>
                    {errors.EventTypeId}
                  </span>
                )}
              </div>

              {/* SMS Trigger */}
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: '#334155',
                    marginBottom: 6,
                  }}
                >
                  SMS Trigger
                </label>
                <input
                  type="text"
                  placeholder="e.g. ON_REGISTRATION, ON_DISCHARGE"
                  value={item.SmsTrigger || ''}
                  onChange={(e) => setItem({ ...item, SmsTrigger: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    fontSize: '13px',
                    boxSizing: 'border-box',
                    outline: 'none',
                  }}
                />
              </div>

              {/* Hospital / Facility */}
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: '#334155',
                    marginBottom: 6,
                  }}
                >
                  Hospital / Facility
                </label>
                <select
                  value={item.FacilityId ?? ''}
                  onChange={(e) => {
                    const val = e.target.value ? Number(e.target.value) : undefined;
                    setItem({ ...item, FacilityId: val });
                  }}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    fontSize: '13px',
                    boxSizing: 'border-box',
                    backgroundColor: '#FFFFFF',
                    outline: 'none',
                  }}
                >
                  <option value="">-- All Facilities (Global) --</option>
                  {facilityLookup.map((f) => (
                    <option key={f.Id} value={f.Id}>
                      {f.Text || f.FacilityName || `Facility #${f.Id}`}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status / Active */}
              <div style={{ display: 'flex', alignItems: 'center', marginTop: 24 }}>
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: '#1e293b',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={Boolean(item.IsActive)}
                    onChange={(e) => setItem({ ...item, IsActive: e.target.checked })}
                    style={{
                      width: 18,
                      height: 18,
                      cursor: 'pointer',
                      accentColor: '#2563eb',
                    }}
                  />
                  <span>Active Template</span>
                </label>
              </div>
            </div>

            {/* Template Content & Dynamic Placeholders */}
            <div style={{ marginBottom: '20px' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 6,
                }}
              >
                <label
                  style={{
                    fontSize: '12px',
                    fontWeight: 600,
                    color: '#334155',
                  }}
                >
                  Template Content <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <span
                  style={{
                    fontSize: 12,
                    color: (item.TemplateContent?.length || 0) > 3800 ? '#ef4444' : '#64748b',
                  }}
                >
                  {item.TemplateContent?.length || 0} / 4000 characters
                </span>
              </div>

              {/* Dynamic Placeholders Chips */}
              <div
                style={{
                  padding: '10px',
                  backgroundColor: '#f8fafc',
                  borderRadius: '6px',
                  border: '1px solid #e2e8f0',
                  marginBottom: '8px',
                }}
              >
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    color: '#64748b',
                    marginBottom: 6,
                    letterSpacing: '0.05em',
                  }}
                >
                  Insert Dynamic Placeholders (click to insert at cursor position):
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {TEMPLATE_PLACEHOLDERS.map((btn) => (
                    <button
                      key={btn.placeholder}
                      type="button"
                      onClick={() => insertPlaceholder(btn.placeholder)}
                      title={`Insert ${btn.placeholder}`}
                      style={{
                        padding: '4px 10px',
                        borderRadius: '4px',
                        border: '1px solid #bfdbfe',
                        backgroundColor: '#FFFFFF',
                        color: '#2563eb',
                        fontSize: 12,
                        fontWeight: 500,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.backgroundColor = '#eff6ff';
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.backgroundColor = '#FFFFFF';
                      }}
                    >
                      <span>+</span>
                      <span>{btn.displaytext}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Textarea */}
              <textarea
                ref={textareaRef}
                rows={7}
                maxLength={4000}
                placeholder="Dear {{patientName}}, your appointment with Dr. {{doctorName}} is confirmed for {{displaydate}} at {{displaytime}}."
                value={item.TemplateContent || ''}
                onChange={(e) => {
                  setItem({ ...item, TemplateContent: e.target.value });
                  if (errors.TemplateContent) setErrors({ ...errors, TemplateContent: '' });
                }}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '6px',
                  border: `1px solid ${errors.TemplateContent ? '#ef4444' : '#cbd5e1'}`,
                  fontSize: '13px',
                  fontFamily: 'monospace',
                  lineHeight: '1.5',
                  boxSizing: 'border-box',
                  outline: 'none',
                  resize: 'vertical',
                }}
              />
              {errors.TemplateContent && (
                <span style={{ color: '#ef4444', fontSize: 12, marginTop: 4, display: 'block' }}>
                  {errors.TemplateContent}
                </span>
              )}
            </div>

            {/* Advanced / Extended Settings Accordion */}
            <div
              style={{
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                overflow: 'hidden',
              }}
            >
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  backgroundColor: '#f8fafc',
                  border: 'none',
                  textAlign: 'left',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '13px',
                  color: '#334155',
                }}
              >
                <span>⚙️ Advanced & Dispatch Routing Settings</span>
                <span style={{ fontSize: 16 }}>{showAdvanced ? '▲' : '▼'}</span>
              </button>

              {showAdvanced && (
                <div style={{ padding: '16px', backgroundColor: '#FFFFFF' }}>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                      gap: '16px',
                      marginBottom: '12px',
                    }}
                  >
                    {/* Email Subject */}
                    <div>
                      <label
                        style={{
                          display: 'block',
                          fontSize: '12px',
                          fontWeight: 600,
                          color: '#334155',
                          marginBottom: 6,
                        }}
                      >
                        Email Subject (if multi-channel)
                      </label>
                      <input
                        type="text"
                        placeholder="Subject headline..."
                        value={item.EmailSubject || ''}
                        onChange={(e) => setItem({ ...item, EmailSubject: e.target.value })}
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

                    {/* Schedule Time */}
                    <div>
                      <label
                        style={{
                          display: 'block',
                          fontSize: '12px',
                          fontWeight: 600,
                          color: '#334155',
                          marginBottom: 6,
                        }}
                      >
                        Schedule Time
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 09:00"
                        value={item.ScheduleTime || ''}
                        onChange={(e) => setItem({ ...item, ScheduleTime: e.target.value })}
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

                    {/* Repeat Duration */}
                    <div>
                      <label
                        style={{
                          display: 'block',
                          fontSize: '12px',
                          fontWeight: 600,
                          color: '#334155',
                          marginBottom: 6,
                        }}
                      >
                        Repeat Duration
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Daily, 2h"
                        value={item.RepeatDuration || ''}
                        onChange={(e) => setItem({ ...item, RepeatDuration: e.target.value })}
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

                    {/* Sent To User */}
                    <div>
                      <label
                        style={{
                          display: 'block',
                          fontSize: '12px',
                          fontWeight: 600,
                          color: '#334155',
                          marginBottom: 6,
                        }}
                      >
                        Sent to Specific User
                      </label>
                      <select
                        value={item.SentToPersonId ?? ''}
                        onChange={(e) => {
                          const val = e.target.value ? Number(e.target.value) : undefined;
                          const selected = userLookup.find((u) => u.Id === val);
                          setItem({
                            ...item,
                            SentToPersonId: val,
                            SentToPerson: selected?.Text || '',
                          });
                        }}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          borderRadius: '6px',
                          border: '1px solid #cbd5e1',
                          fontSize: '13px',
                          boxSizing: 'border-box',
                          backgroundColor: '#FFFFFF',
                        }}
                      >
                        <option value="">-- None / Default Recipient --</option>
                        {userLookup.map((u) => (
                          <option key={u.Id} value={u.Id}>
                            {u.Text || `User #${u.Id}`}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Sent To Group */}
                    <div>
                      <label
                        style={{
                          display: 'block',
                          fontSize: '12px',
                          fontWeight: 600,
                          color: '#334155',
                          marginBottom: 6,
                        }}
                      >
                        Sent to Group
                      </label>
                      <select
                        value={item.SentToGroupId ?? ''}
                        onChange={(e) => {
                          const val = e.target.value ? Number(e.target.value) : undefined;
                          const selected = groupLookup.find((g) => g.Id === val);
                          setItem({
                            ...item,
                            SentToGroupId: val,
                            SentToGroup: selected?.GroupName || selected?.Text || '',
                          });
                        }}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          borderRadius: '6px',
                          border: '1px solid #cbd5e1',
                          fontSize: '13px',
                          boxSizing: 'border-box',
                          backgroundColor: '#FFFFFF',
                        }}
                      >
                        <option value="">-- None / Default Group --</option>
                        {groupLookup.map((g) => (
                          <option key={g.Id} value={g.Id}>
                            {g.Text || g.GroupName || `Group #${g.Id}`}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Cron & Repeat checkboxes */}
                  <div style={{ display: 'flex', gap: '24px', marginTop: '12px' }}>
                    <label
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        cursor: 'pointer',
                        fontSize: '13px',
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={Boolean(item.IsCronJob)}
                        onChange={(e) => setItem({ ...item, IsCronJob: e.target.checked })}
                        style={{ width: 16, height: 16, accentColor: '#2563eb' }}
                      />
                      <span>Is Cron Job</span>
                    </label>

                    <label
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        cursor: 'pointer',
                        fontSize: '13px',
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={Boolean(item.IsRepeat)}
                        onChange={(e) => setItem({ ...item, IsRepeat: e.target.checked })}
                        style={{ width: 16, height: 16, accentColor: '#2563eb' }}
                      />
                      <span>Is Recurring / Repeat</span>
                    </label>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventTemplateFormScreen;
