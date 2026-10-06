import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { apiFetch } from './utils/api';
import { colors, spacing, typography, radii } from '../components/ui/tokens';

export interface AppointmentSessionFormData {
  Id?: number;
  FacilityId?: number;
  AppointmentSessionTypeId?: number;
  ClinicId?: number;
  DoctorId?: number;
  ResourceId?: number;
  SpecialityId?: number;
  SessionTypeId?: number;
  StartDate?: string;
  EndDate?: string;
  IsMonday?: boolean;
  IsTuesday?: boolean;
  IsWednesday?: boolean;
  IsThursday?: boolean;
  IsFriday?: boolean;
  IsSaturday?: boolean;
  IsSunday?: boolean;
  IsAll?: boolean;
  IsActive?: boolean;
  ActiveStatusId?: number;
  AppointmentSlotTypeId?: number;
  SlotDuration?: number | string;
  MaxSlotPerDay?: number | string;
  StartTime?: string;
  EndTime?: string;
  BreakFrom?: string;
  BreakTo?: string;
  NoofScheduleAppt?: number | string;
  NoofWalkInPatient?: number | string;
  HolidayFrom?: string;
  HolidayTo?: string;
  [key: string]: any;
}

export interface LookupOption {
  Id: number;
  Text: string;
  SpecialityId?: number;
  [key: string]: any;
}

export interface AppointmentSessionFormScreenProps {
  sessionId?: number;
  reactProps?: {
    sessionId?: number;
    item?: AppointmentSessionFormData;
    lookup?: {
      AppointmentSessionType?: LookupOption[];
      Clinic?: LookupOption[];
      SessionType?: LookupOption[];
      AppointmentSlotType?: LookupOption[];
      Resource?: LookupOption[];
      Doctor?: LookupOption[];
      Facility?: LookupOption[];
      Speciality?: LookupOption[];
      ActiveStatus?: LookupOption[];
      [key: string]: any;
    };
  };
  onAction?: (actionName: string, payload?: any) => void;
  onSaved?: (newId: number) => void;
}

// Format date to YYYY-MM-DD
const formatDateForInput = (val?: string | Date | null): string => {
  if (!val) return '';
  try {
    const d = new Date(val);
    if (isNaN(d.getTime())) return '';
    return d.toISOString().split('T')[0];
  } catch {
    return '';
  }
};

// Format time to HH:mm
const formatTimeForInput = (val?: string | Date | null): string => {
  if (!val) return '';
  if (typeof val === 'string' && /^\d{2}:\d{2}/.test(val)) {
    return val.substring(0, 5);
  }
  try {
    const d = new Date(val);
    if (isNaN(d.getTime())) return '';
    const h = String(d.getHours()).padStart(2, '0');
    const m = String(d.getMinutes()).padStart(2, '0');
    return `${h}:${m}`;
  } catch {
    return '';
  }
};

export const AppointmentSessionFormScreen: React.FC<AppointmentSessionFormScreenProps> = ({
  sessionId: directId,
  reactProps,
  onAction,
  onSaved
}) => {
  // Determine effective ID from props, reactProps, or URL hash/path
  const parseEffectiveId = (): number => {
    if (directId !== undefined) return directId;
    if (reactProps?.sessionId !== undefined) return reactProps.sessionId;
    const hash = window.location.hash;
    const match = hash.match(/appointmentsession(?:tab)?\/(\d+)/i);
    if (match && match[1]) return parseInt(match[1], 10);
    const pathname = window.location.pathname;
    const pathMatch = pathname.match(/appointmentsession(?:tab)?\/(\d+)/i);
    if (pathMatch && pathMatch[1]) return parseInt(pathMatch[1], 10);
    return 0;
  };

  const effectiveId = parseEffectiveId();

  // Form State
  const [formData, setFormData] = useState<AppointmentSessionFormData>({
    Id: effectiveId,
    FacilityId: 1,
    AppointmentSessionTypeId: 1, // 1: Doctor / Physician, 2: Resource
    ClinicId: undefined,
    DoctorId: -1,
    ResourceId: -1,
    SpecialityId: undefined,
    SessionTypeId: undefined,
    StartDate: new Date().toISOString().split('T')[0],
    EndDate: '',
    IsMonday: true,
    IsTuesday: true,
    IsWednesday: true,
    IsThursday: true,
    IsFriday: true,
    IsSaturday: true,
    IsSunday: true,
    IsAll: true,
    IsActive: true,
    ActiveStatusId: 2,
    AppointmentSlotTypeId: undefined,
    SlotDuration: 15,
    MaxSlotPerDay: '',
    StartTime: '09:00',
    EndTime: '17:00',
    BreakFrom: '13:00',
    BreakTo: '14:00',
    NoofScheduleAppt: '',
    NoofWalkInPatient: '',
    HolidayFrom: '',
    HolidayTo: '',
    ...(reactProps?.item || {})
  });

  const [initialStartDate, setInitialStartDate] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Lookups state
  const [lookups, setLookups] = useState<{
    AppointmentSessionType: LookupOption[];
    Clinic: LookupOption[];
    SessionType: LookupOption[];
    AppointmentSlotType: LookupOption[];
    Resource: LookupOption[];
    Doctor: LookupOption[];
    Facility: LookupOption[];
    Speciality: LookupOption[];
    ActiveStatus: LookupOption[];
  }>({
    AppointmentSessionType: reactProps?.lookup?.AppointmentSessionType || [
      { Id: 1, Text: 'Doctor / Physician' },
      { Id: 2, Text: 'Resource / Room' }
    ],
    Clinic: reactProps?.lookup?.Clinic || [],
    SessionType: reactProps?.lookup?.SessionType || [],
    AppointmentSlotType: reactProps?.lookup?.AppointmentSlotType || [],
    Resource: reactProps?.lookup?.Resource || [],
    Doctor: reactProps?.lookup?.Doctor || [],
    Facility: reactProps?.lookup?.Facility || [],
    Speciality: reactProps?.lookup?.Speciality || [],
    ActiveStatus: reactProps?.lookup?.ActiveStatus || []
  });

  // Doctor search filter state
  const [doctorSearch, setDoctorSearch] = useState('');

  // Fetch Lookups if not supplied
  const fetchLookups = useCallback(async () => {
    if (reactProps?.lookup && Object.keys(reactProps.lookup).length > 2) return;
    try {
      const resp = await apiFetch<any>('General/Options/getoptions', {
        method: 'POST',
        body: JSON.stringify([
          { Key: 'AppointmentSessionType' },
          { Key: 'Clinic' },
          { Key: 'SessionType' },
          { Key: 'AppointmentSlotType' },
          { Key: 'Resource' },
          {
            Key: 'Doctor',
            Request: {
              Params: [{ Key: 2, Value: [-1, formData.FacilityId || 1] }]
            }
          },
          { Key: 'Facility' },
          { Key: 'Speciality' },
          { Key: 'ActiveStatus' }
        ])
      });
      if (resp) {
        setLookups((prev) => ({
          AppointmentSessionType: resp.AppointmentSessionType?.length
            ? resp.AppointmentSessionType
            : prev.AppointmentSessionType,
          Clinic: resp.Clinic || [],
          SessionType: resp.SessionType || [],
          AppointmentSlotType: resp.AppointmentSlotType || [],
          Resource: resp.Resource || [],
          Doctor: resp.Doctor || [],
          Facility: resp.Facility || [],
          Speciality: resp.Speciality || [],
          ActiveStatus: resp.ActiveStatus || []
        }));
      }
    } catch (err) {
      console.warn('Failed to load session form lookups:', err);
    }
  }, [reactProps?.lookup, formData.FacilityId]);

  // Load Session Data for edit
  const loadSession = useCallback(async (id: number) => {
    if (!id || id <= 0) return;
    setLoading(true);
    setErrorMessage(null);
    try {
      const res = await apiFetch<any>('appointment/AppointmentSession/GetAppointmentSessionById', {
        method: 'POST',
        body: JSON.stringify({ Id: id })
      });
      if (res) {
        const d = res.Data || res;
        setInitialStartDate(formatDateForInput(d.StartDate));
        setFormData({
          ...d,
          Id: d.Id || id,
          AppointmentSessionTypeId: d.AppointmentSessionTypeId || 1,
          StartDate: formatDateForInput(d.StartDate),
          EndDate: formatDateForInput(d.EndDate),
          StartTime: formatTimeForInput(d.StartTime),
          EndTime: formatTimeForInput(d.EndTime),
          BreakFrom: formatTimeForInput(d.BreakFrom),
          BreakTo: formatTimeForInput(d.BreakTo),
          HolidayFrom: formatDateForInput(d.HolidayFrom),
          HolidayTo: formatDateForInput(d.HolidayTo),
          IsMonday: !!d.IsMonday,
          IsTuesday: !!d.IsTuesday,
          IsWednesday: !!d.IsWednesday,
          IsThursday: !!d.IsThursday,
          IsFriday: !!d.IsFriday,
          IsSaturday: !!d.IsSaturday,
          IsSunday: !!d.IsSunday,
          IsAll: !!(d.IsMonday && d.IsTuesday && d.IsWednesday && d.IsThursday && d.IsFriday && d.IsSaturday && d.IsSunday),
          IsActive: d.ActiveStatusId === 2 || d.IsActive === true
        });
      }
    } catch (err: any) {
      console.error('Failed to load appointment session:', err);
      setErrorMessage(err.message || 'Failed to load session details.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLookups();
    if (effectiveId > 0) {
      loadSession(effectiveId);
    }
  }, [fetchLookups, effectiveId, loadSession]);

  // Days of Week "All" Toggle
  const handleAllDaysToggle = (checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      IsAll: checked,
      IsMonday: checked,
      IsTuesday: checked,
      IsWednesday: checked,
      IsThursday: checked,
      IsFriday: checked,
      IsSaturday: checked,
      IsSunday: checked
    }));
  };

  // Single Day Toggle
  const handleDayToggle = (field: keyof AppointmentSessionFormData, val: boolean) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: val };
      const allChecked =
        (field === 'IsMonday' ? val : updated.IsMonday) &&
        (field === 'IsTuesday' ? val : updated.IsTuesday) &&
        (field === 'IsWednesday' ? val : updated.IsWednesday) &&
        (field === 'IsThursday' ? val : updated.IsThursday) &&
        (field === 'IsFriday' ? val : updated.IsFriday) &&
        (field === 'IsSaturday' ? val : updated.IsSaturday) &&
        (field === 'IsSunday' ? val : updated.IsSunday);
      return { ...updated, IsAll: allChecked };
    });
  };

  // Doctor Change -> Auto set Speciality
  const handleDoctorChange = (docId: number) => {
    const selectedDoc = lookups.Doctor.find((d) => d.Id === docId);
    setFormData((prev) => ({
      ...prev,
      DoctorId: docId,
      SpecialityId: selectedDoc?.SpecialityId || prev.SpecialityId
    }));
    if (errors.DoctorId) {
      setErrors((prev) => {
        const rest = { ...prev };
        delete rest.DoctorId;
        return rest;
      });
    }
  };

  // Validation
  const validate = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.AppointmentSessionTypeId) {
      newErrors.AppointmentSessionTypeId = 'Please select session target type.';
    }

    if (formData.AppointmentSessionTypeId === 1) {
      if (!formData.DoctorId || formData.DoctorId === -1) {
        newErrors.DoctorId = 'Please select a doctor.';
      }
    } else if (formData.AppointmentSessionTypeId === 2) {
      if (!formData.ResourceId || formData.ResourceId === -1) {
        newErrors.ResourceId = 'Please select a resource.';
      }
    }

    if (!formData.ClinicId) {
      newErrors.ClinicId = 'Please select clinic.';
    }

    if (!formData.SessionTypeId) {
      newErrors.SessionTypeId = 'Please select session type.';
    }

    if (!formData.StartDate) {
      newErrors.StartDate = 'Start date is required.';
    } else if (formData.StartDate !== initialStartDate) {
      const today = new Date().toISOString().split('T')[0];
      if (formData.StartDate < today) {
        newErrors.StartDate = 'Start date cannot be in the past.';
      }
    }

    if (!formData.EndDate) {
      newErrors.EndDate = 'End date is required.';
    } else if (formData.StartDate && formData.EndDate < formData.StartDate) {
      newErrors.EndDate = 'End date cannot be earlier than start date.';
    }

    if (!formData.AppointmentSlotTypeId) {
      newErrors.AppointmentSlotTypeId = 'Please select appointment slot type.';
    }

    if (!formData.StartTime) {
      newErrors.StartTime = 'Start time is required.';
    }

    if (!formData.EndTime) {
      newErrors.EndTime = 'End time is required.';
    } else if (formData.StartTime && formData.EndTime <= formData.StartTime) {
      newErrors.EndTime = 'End time must be after start time.';
    }

    if (!formData.SlotDuration || Number(formData.SlotDuration) <= 0) {
      newErrors.SlotDuration = 'Please enter valid slot duration in minutes.';
    }

    const hasAnyDay =
      formData.IsMonday ||
      formData.IsTuesday ||
      formData.IsWednesday ||
      formData.IsThursday ||
      formData.IsFriday ||
      formData.IsSaturday ||
      formData.IsSunday;
    if (!hasAnyDay) {
      newErrors.days = 'Please select at least one day of the week.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Save implementation
  const handleSave = async (statusId: number = 1) => {
    if (!validate()) {
      setErrorMessage('Please fix the highlighted errors before saving.');
      return;
    }

    setSaving(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const payloadItem = {
        ...formData,
        ActiveStatusId: statusId,
        IsActive: statusId === 2,
        DoctorId: formData.AppointmentSessionTypeId === 1 ? formData.DoctorId : -1,
        ResourceId: formData.AppointmentSessionTypeId === 2 ? formData.ResourceId : -1,
        SlotDuration: Number(formData.SlotDuration) || 15,
        MaxSlotPerDay: formData.MaxSlotPerDay ? Number(formData.MaxSlotPerDay) : null,
        NoofScheduleAppt: formData.NoofScheduleAppt ? Number(formData.NoofScheduleAppt) : null,
        NoofWalkInPatient: formData.NoofWalkInPatient ? Number(formData.NoofWalkInPatient) : null
      };

      const isUpdate = !!(formData.Id && formData.Id > 0);
      const actionName = isUpdate
        ? 'appointment/AppointmentSession/UpdateAppointmentSession'
        : 'appointment/AppointmentSession/AddAppointmentSession';

      const res = await apiFetch<any>(actionName, {
        method: 'POST',
        body: JSON.stringify({ Data: payloadItem })
      });

      const newId = typeof res === 'number' ? res : res?.Data?.Id || res?.Id || formData.Id || 0;
      setSuccessMessage(
        statusId === 2
          ? 'Appointment session saved and approved successfully!'
          : 'Appointment session saved successfully!'
      );

      if (onSaved) onSaved(newId);
      if (onAction) onAction('saveComplete', { id: newId, statusId });

      if (!isUpdate && newId > 0) {
        setFormData((prev) => ({ ...prev, Id: newId }));
      }
    } catch (err: any) {
      console.error('Save session error:', err);
      setErrorMessage(err.message || 'Failed to save appointment session.');
    } finally {
      setSaving(false);
    }
  };

  const handleBackToList = () => {
    if (onAction) {
      onAction('backToList');
    } else {
      window.location.hash = '#/app/appointmentsessions';
    }
  };

  const handleResetForm = () => {
    setFormData({
      Id: 0,
      FacilityId: 1,
      AppointmentSessionTypeId: 1,
      ClinicId: undefined,
      DoctorId: -1,
      ResourceId: -1,
      SpecialityId: undefined,
      SessionTypeId: undefined,
      StartDate: new Date().toISOString().split('T')[0],
      EndDate: '',
      IsMonday: true,
      IsTuesday: true,
      IsWednesday: true,
      IsThursday: true,
      IsFriday: true,
      IsSaturday: true,
      IsSunday: true,
      IsAll: true,
      IsActive: true,
      ActiveStatusId: 2,
      AppointmentSlotTypeId: undefined,
      SlotDuration: 15,
      MaxSlotPerDay: '',
      StartTime: '09:00',
      EndTime: '17:00',
      BreakFrom: '13:00',
      BreakTo: '14:00',
      NoofScheduleAppt: '',
      NoofWalkInPatient: '',
      HolidayFrom: '',
      HolidayTo: ''
    });
    setErrors({});
    setSuccessMessage(null);
    setErrorMessage(null);
  };

  // Filtered doctors list for search
  const filteredDoctors = useMemo(() => {
    if (!doctorSearch.trim()) return lookups.Doctor;
    const q = doctorSearch.toLowerCase();
    return lookups.Doctor.filter((doc) => doc.Text?.toLowerCase().includes(q));
  }, [lookups.Doctor, doctorSearch]);

  return (
    <div
      style={{
        backgroundColor: colors.background?.secondary || '#f8fafc',
        borderRadius: radii.lg,
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
        padding: spacing.xl,
        maxWidth: 1200,
        margin: '0 auto',
        fontFamily: typography.fontFamily
      }}
    >
      {/* Top Banner & Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: spacing.lg,
          borderBottom: `1px solid ${colors.border?.subtle || '#e2e8f0'}`,
          paddingBottom: spacing.md
        }}
      >
        <div>
          <h2
            style={{
              fontSize: '1.4rem',
              fontWeight: 700,
              color: colors.text?.primary || '#1e293b',
              margin: 0,
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}
          >
            <i className="fa fa-calendar-alt" style={{ color: colors.primary?.main || '#2563eb' }} />
            {formData.Id && formData.Id > 0
              ? `Edit Appointment Session #${formData.Id}`
              : 'New Appointment Session'}
          </h2>
          <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: colors.text?.secondary || '#64748b' }}>
            Configure doctor or resource availability, time slots, scheduling rules, and break periods.
          </p>
        </div>

        <div style={{ display: 'flex', gap: spacing.sm }}>
          <button
            type="button"
            onClick={handleBackToList}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 14px',
              borderRadius: radii.md,
              backgroundColor: '#fff',
              border: `1px solid ${colors.border?.default || '#cbd5e1'}`,
              color: colors.text?.primary || '#334155',
              cursor: 'pointer',
              fontWeight: 500,
              fontSize: '0.875rem'
            }}
          >
            <i className="fa fa-angle-left" /> Back to List
          </button>
          <button
            type="button"
            onClick={handleResetForm}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 14px',
              borderRadius: radii.md,
              backgroundColor: '#fff',
              border: `1px solid ${colors.border?.default || '#cbd5e1'}`,
              color: colors.text?.secondary || '#64748b',
              cursor: 'pointer',
              fontWeight: 500,
              fontSize: '0.875rem'
            }}
          >
            <i className="fa fa-redo" /> Reset
          </button>
        </div>
      </div>

      {/* Messages */}
      {successMessage && (
        <div
          style={{
            padding: '12px 16px',
            backgroundColor: '#ecfdf5',
            border: '1px solid #10b981',
            borderRadius: radii.md,
            color: '#065f46',
            marginBottom: spacing.md,
            display: 'flex',
            alignItems: 'center',
            gap: 8
          }}
        >
          <i className="fa fa-check-circle" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div
          style={{
            padding: '12px 16px',
            backgroundColor: '#fef2f2',
            border: '1px solid #ef4444',
            borderRadius: radii.md,
            color: '#991b1b',
            marginBottom: spacing.md,
            display: 'flex',
            alignItems: 'center',
            gap: 8
          }}
        >
          <i className="fa fa-exclamation-triangle" />
          <span>{errorMessage}</span>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: colors.text?.secondary || '#64748b' }}>
          <i className="fa fa-spinner fa-spin fa-2x" style={{ marginBottom: 12, color: colors.primary?.main || '#2563eb' }} />
          <div>Loading appointment session details...</div>
        </div>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSave(formData.IsActive ? 2 : 1);
          }}
        >
          {/* Section 1: Basic Target & Clinic */}
          <div
            style={{
              backgroundColor: '#fff',
              borderRadius: radii.md,
              border: `1px solid ${colors.border?.subtle || '#e2e8f0'}`,
              padding: spacing.lg,
              marginBottom: spacing.lg
            }}
          >
            <h3
              style={{
                fontSize: '1rem',
                fontWeight: 600,
                color: colors.text?.primary || '#1e293b',
                marginTop: 0,
                marginBottom: spacing.md,
                display: 'flex',
                alignItems: 'center',
                gap: 8
              }}
            >
              <i className="fa fa-user-md" style={{ color: colors.primary?.main || '#2563eb' }} />
              Session Assignment
            </h3>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                gap: spacing.md
              }}
            >
              {/* Session Target Type */}
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    marginBottom: 4,
                    color: colors.text?.primary || '#334155'
                  }}
                >
                  Session Type Target <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <select
                  value={formData.AppointmentSessionTypeId || 1}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      AppointmentSessionTypeId: Number(e.target.value)
                    }))
                  }
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: radii.md,
                    border: `1px solid ${errors.AppointmentSessionTypeId ? '#ef4444' : colors.border?.default || '#cbd5e1'}`,
                    outline: 'none',
                    fontSize: '0.9rem'
                  }}
                >
                  <option value={1}>Doctor / Physician</option>
                  <option value={2}>Resource / Room</option>
                </select>
                {errors.AppointmentSessionTypeId && (
                  <span style={{ fontSize: '0.75rem', color: '#ef4444' }}>{errors.AppointmentSessionTypeId}</span>
                )}
              </div>

              {/* Clinic */}
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    marginBottom: 4,
                    color: colors.text?.primary || '#334155'
                  }}
                >
                  Clinic / Room <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <select
                  value={formData.ClinicId || ''}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setFormData((prev) => ({ ...prev, ClinicId: val }));
                    if (errors.ClinicId) setErrors((prev) => ({ ...prev, ClinicId: '' }));
                  }}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: radii.md,
                    border: `1px solid ${errors.ClinicId ? '#ef4444' : colors.border?.default || '#cbd5e1'}`,
                    outline: 'none',
                    fontSize: '0.9rem'
                  }}
                >
                  <option value="">-- Select Clinic --</option>
                  {lookups.Clinic.map((c) => (
                    <option key={c.Id} value={c.Id}>
                      {c.Text}
                    </option>
                  ))}
                </select>
                {errors.ClinicId && <span style={{ fontSize: '0.75rem', color: '#ef4444' }}>{errors.ClinicId}</span>}
              </div>

              {/* Doctor (when target is Doctor) */}
              {formData.AppointmentSessionTypeId === 1 && (
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      marginBottom: 4,
                      color: colors.text?.primary || '#334155'
                    }}
                  >
                    Doctor / Consultant <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <select
                      value={formData.DoctorId ?? -1}
                      onChange={(e) => handleDoctorChange(Number(e.target.value))}
                      style={{
                        flex: 1,
                        padding: '8px 12px',
                        borderRadius: radii.md,
                        border: `1px solid ${errors.DoctorId ? '#ef4444' : colors.border?.default || '#cbd5e1'}`,
                        outline: 'none',
                        fontSize: '0.9rem'
                      }}
                    >
                      <option value={-1}>-- Select Doctor --</option>
                      {filteredDoctors.map((doc) => (
                        <option key={doc.Id} value={doc.Id}>
                          {doc.Text}
                        </option>
                      ))}
                    </select>
                  </div>
                  {errors.DoctorId && <span style={{ fontSize: '0.75rem', color: '#ef4444' }}>{errors.DoctorId}</span>}
                </div>
              )}

              {/* Resource (when target is Resource) */}
              {formData.AppointmentSessionTypeId === 2 && (
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      marginBottom: 4,
                      color: colors.text?.primary || '#334155'
                    }}
                  >
                    Resource / Equipment <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <select
                    value={formData.ResourceId ?? -1}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setFormData((prev) => ({ ...prev, ResourceId: val }));
                      if (errors.ResourceId) setErrors((prev) => ({ ...prev, ResourceId: '' }));
                    }}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: radii.md,
                      border: `1px solid ${errors.ResourceId ? '#ef4444' : colors.border?.default || '#cbd5e1'}`,
                      outline: 'none',
                      fontSize: '0.9rem'
                    }}
                  >
                    <option value={-1}>-- Select Resource --</option>
                    {lookups.Resource.map((r) => (
                      <option key={r.Id} value={r.Id}>
                        {r.Text}
                      </option>
                    ))}
                  </select>
                  {errors.ResourceId && (
                    <span style={{ fontSize: '0.75rem', color: '#ef4444' }}>{errors.ResourceId}</span>
                  )}
                </div>
              )}

              {/* Session Schedule Category */}
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    marginBottom: 4,
                    color: colors.text?.primary || '#334155'
                  }}
                >
                  Session Type <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <select
                  value={formData.SessionTypeId || ''}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setFormData((prev) => ({ ...prev, SessionTypeId: val }));
                    if (errors.SessionTypeId) setErrors((prev) => ({ ...prev, SessionTypeId: '' }));
                  }}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: radii.md,
                    border: `1px solid ${errors.SessionTypeId ? '#ef4444' : colors.border?.default || '#cbd5e1'}`,
                    outline: 'none',
                    fontSize: '0.9rem'
                  }}
                >
                  <option value="">-- Select Session Type --</option>
                  {lookups.SessionType.map((st) => (
                    <option key={st.Id} value={st.Id}>
                      {st.Text}
                    </option>
                  ))}
                </select>
                {errors.SessionTypeId && (
                  <span style={{ fontSize: '0.75rem', color: '#ef4444' }}>{errors.SessionTypeId}</span>
                )}
              </div>
            </div>
          </div>

          {/* Section 2: Date Range & Days of Week */}
          <div
            style={{
              backgroundColor: '#fff',
              borderRadius: radii.md,
              border: `1px solid ${colors.border?.subtle || '#e2e8f0'}`,
              padding: spacing.lg,
              marginBottom: spacing.lg
            }}
          >
            <h3
              style={{
                fontSize: '1rem',
                fontWeight: 600,
                color: colors.text?.primary || '#1e293b',
                marginTop: 0,
                marginBottom: spacing.md,
                display: 'flex',
                alignItems: 'center',
                gap: 8
              }}
            >
              <i className="fa fa-calendar" style={{ color: colors.primary?.main || '#2563eb' }} />
              Schedule Period & Active Days
            </h3>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: spacing.md,
                marginBottom: spacing.lg
              }}
            >
              {/* Start Date */}
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    marginBottom: 4,
                    color: colors.text?.primary || '#334155'
                  }}
                >
                  Start Date <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="date"
                  value={formData.StartDate || ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    setFormData((prev) => ({ ...prev, StartDate: val }));
                    if (errors.StartDate) setErrors((prev) => ({ ...prev, StartDate: '' }));
                  }}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: radii.md,
                    border: `1px solid ${errors.StartDate ? '#ef4444' : colors.border?.default || '#cbd5e1'}`,
                    outline: 'none',
                    fontSize: '0.9rem'
                  }}
                />
                {errors.StartDate && <span style={{ fontSize: '0.75rem', color: '#ef4444' }}>{errors.StartDate}</span>}
              </div>

              {/* End Date */}
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    marginBottom: 4,
                    color: colors.text?.primary || '#334155'
                  }}
                >
                  End Date <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="date"
                  value={formData.EndDate || ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    setFormData((prev) => ({ ...prev, EndDate: val }));
                    if (errors.EndDate) setErrors((prev) => ({ ...prev, EndDate: '' }));
                  }}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: radii.md,
                    border: `1px solid ${errors.EndDate ? '#ef4444' : colors.border?.default || '#cbd5e1'}`,
                    outline: 'none',
                    fontSize: '0.9rem'
                  }}
                />
                {errors.EndDate && <span style={{ fontSize: '0.75rem', color: '#ef4444' }}>{errors.EndDate}</span>}
              </div>

              {/* Active Status */}
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    marginBottom: 4,
                    color: colors.text?.primary || '#334155'
                  }}
                >
                  Status
                </label>
                <div style={{ display: 'flex', alignItems: 'center', height: 42, gap: 10 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: '0.9rem' }}>
                    <input
                      type="checkbox"
                      checked={!!formData.IsActive}
                      onChange={(e) => setFormData((prev) => ({ ...prev, IsActive: e.target.checked }))}
                      style={{ width: 18, height: 18, accentColor: colors.primary?.main || '#2563eb' }}
                    />
                    <span style={{ fontWeight: 500, color: formData.IsActive ? '#059669' : '#64748b' }}>
                      {formData.IsActive ? 'Active' : 'Inactive'}
                    </span>
                  </label>
                </div>
              </div>
            </div>

            {/* Days of Week Checkboxes */}
            <div
              style={{
                backgroundColor: '#f1f5f9',
                padding: spacing.md,
                borderRadius: radii.md,
                border: `1px solid ${errors.days ? '#ef4444' : '#e2e8f0'}`
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: spacing.sm
                }}
              >
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: colors.text?.primary || '#334155' }}>
                  Weekly Days of Operation:
                </span>
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    color: colors.primary?.main || '#2563eb'
                  }}
                >
                  <input
                    type="checkbox"
                    checked={!!formData.IsAll}
                    onChange={(e) => handleAllDaysToggle(e.target.checked)}
                    style={{ accentColor: colors.primary?.main || '#2563eb' }}
                  />
                  Select All Days
                </label>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))',
                  gap: spacing.sm
                }}
              >
                {[
                  { key: 'IsMonday', label: 'Monday' },
                  { key: 'IsTuesday', label: 'Tuesday' },
                  { key: 'IsWednesday', label: 'Wednesday' },
                  { key: 'IsThursday', label: 'Thursday' },
                  { key: 'IsFriday', label: 'Friday' },
                  { key: 'IsSaturday', label: 'Saturday' },
                  { key: 'IsSunday', label: 'Sunday' }
                ].map((d) => {
                  const isChecked = !!formData[d.key as keyof AppointmentSessionFormData];
                  return (
                    <label
                      key={d.key}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '6px 10px',
                        backgroundColor: isChecked ? '#eff6ff' : '#fff',
                        border: `1px solid ${isChecked ? '#93c5fd' : '#cbd5e1'}`,
                        borderRadius: radii.sm,
                        cursor: 'pointer',
                        fontSize: '0.85rem',
                        userSelect: 'none',
                        transition: 'all 0.15s'
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) =>
                          handleDayToggle(d.key as keyof AppointmentSessionFormData, e.target.checked)
                        }
                        style={{ accentColor: colors.primary?.main || '#2563eb' }}
                      />
                      <span>{d.label}</span>
                    </label>
                  );
                })}
              </div>
              {errors.days && <div style={{ fontSize: '0.75rem', color: '#ef4444', marginTop: 6 }}>{errors.days}</div>}
            </div>
          </div>

          {/* Section 3: Time Slot & Timing Rules */}
          <div
            style={{
              backgroundColor: '#fff',
              borderRadius: radii.md,
              border: `1px solid ${colors.border?.subtle || '#e2e8f0'}`,
              padding: spacing.lg,
              marginBottom: spacing.lg
            }}
          >
            <h3
              style={{
                fontSize: '1rem',
                fontWeight: 600,
                color: colors.text?.primary || '#1e293b',
                marginTop: 0,
                marginBottom: spacing.md,
                display: 'flex',
                alignItems: 'center',
                gap: 8
              }}
            >
              <i className="fa fa-clock" style={{ color: colors.primary?.main || '#2563eb' }} />
              Session Timings & Slot Duration
            </h3>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: spacing.md,
                marginBottom: spacing.lg
              }}
            >
              {/* Start Time */}
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    marginBottom: 4,
                    color: colors.text?.primary || '#334155'
                  }}
                >
                  Start Time <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="time"
                  value={formData.StartTime || ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    setFormData((prev) => ({ ...prev, StartTime: val }));
                    if (errors.StartTime) setErrors((prev) => ({ ...prev, StartTime: '' }));
                  }}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: radii.md,
                    border: `1px solid ${errors.StartTime ? '#ef4444' : colors.border?.default || '#cbd5e1'}`,
                    outline: 'none',
                    fontSize: '0.9rem'
                  }}
                />
                {errors.StartTime && <span style={{ fontSize: '0.75rem', color: '#ef4444' }}>{errors.StartTime}</span>}
              </div>

              {/* End Time */}
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    marginBottom: 4,
                    color: colors.text?.primary || '#334155'
                  }}
                >
                  End Time <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="time"
                  value={formData.EndTime || ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    setFormData((prev) => ({ ...prev, EndTime: val }));
                    if (errors.EndTime) setErrors((prev) => ({ ...prev, EndTime: '' }));
                  }}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: radii.md,
                    border: `1px solid ${errors.EndTime ? '#ef4444' : colors.border?.default || '#cbd5e1'}`,
                    outline: 'none',
                    fontSize: '0.9rem'
                  }}
                />
                {errors.EndTime && <span style={{ fontSize: '0.75rem', color: '#ef4444' }}>{errors.EndTime}</span>}
              </div>

              {/* Break From */}
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    marginBottom: 4,
                    color: colors.text?.primary || '#334155'
                  }}
                >
                  Break From
                </label>
                <input
                  type="time"
                  value={formData.BreakFrom || ''}
                  onChange={(e) => setFormData((prev) => ({ ...prev, BreakFrom: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: radii.md,
                    border: `1px solid ${colors.border?.default || '#cbd5e1'}`,
                    outline: 'none',
                    fontSize: '0.9rem'
                  }}
                />
              </div>

              {/* Break To */}
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    marginBottom: 4,
                    color: colors.text?.primary || '#334155'
                  }}
                >
                  Break To
                </label>
                <input
                  type="time"
                  value={formData.BreakTo || ''}
                  onChange={(e) => setFormData((prev) => ({ ...prev, BreakTo: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: radii.md,
                    border: `1px solid ${colors.border?.default || '#cbd5e1'}`,
                    outline: 'none',
                    fontSize: '0.9rem'
                  }}
                />
              </div>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: spacing.md
              }}
            >
              {/* Slot Type */}
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    marginBottom: 4,
                    color: colors.text?.primary || '#334155'
                  }}
                >
                  Slot Type <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <select
                  value={formData.AppointmentSlotTypeId || ''}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setFormData((prev) => ({ ...prev, AppointmentSlotTypeId: val }));
                    if (errors.AppointmentSlotTypeId)
                      setErrors((prev) => ({ ...prev, AppointmentSlotTypeId: '' }));
                  }}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: radii.md,
                    border: `1px solid ${errors.AppointmentSlotTypeId ? '#ef4444' : colors.border?.default || '#cbd5e1'}`,
                    outline: 'none',
                    fontSize: '0.9rem'
                  }}
                >
                  <option value="">-- Select Slot Type --</option>
                  {lookups.AppointmentSlotType.map((st) => (
                    <option key={st.Id} value={st.Id}>
                      {st.Text}
                    </option>
                  ))}
                </select>
                {errors.AppointmentSlotTypeId && (
                  <span style={{ fontSize: '0.75rem', color: '#ef4444' }}>{errors.AppointmentSlotTypeId}</span>
                )}
              </div>

              {/* Slot Duration */}
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    marginBottom: 4,
                    color: colors.text?.primary || '#334155'
                  }}
                >
                  Duration (Minutes) <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  max="1440"
                  value={formData.SlotDuration || ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    setFormData((prev) => ({ ...prev, SlotDuration: val }));
                    if (errors.SlotDuration) setErrors((prev) => ({ ...prev, SlotDuration: '' }));
                  }}
                  placeholder="e.g. 15"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: radii.md,
                    border: `1px solid ${errors.SlotDuration ? '#ef4444' : colors.border?.default || '#cbd5e1'}`,
                    outline: 'none',
                    fontSize: '0.9rem'
                  }}
                />
                {errors.SlotDuration && (
                  <span style={{ fontSize: '0.75rem', color: '#ef4444' }}>{errors.SlotDuration}</span>
                )}
              </div>

              {/* Max Slot Per Day */}
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    marginBottom: 4,
                    color: colors.text?.primary || '#334155'
                  }}
                >
                  Max Slot Per Day
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.MaxSlotPerDay ?? ''}
                  onChange={(e) => setFormData((prev) => ({ ...prev, MaxSlotPerDay: e.target.value }))}
                  placeholder="e.g. 30"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: radii.md,
                    border: `1px solid ${colors.border?.default || '#cbd5e1'}`,
                    outline: 'none',
                    fontSize: '0.9rem'
                  }}
                />
              </div>

              {/* Number of Scheduled Appt */}
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    marginBottom: 4,
                    color: colors.text?.primary || '#334155'
                  }}
                >
                  Scheduled Slots Quota
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.NoofScheduleAppt ?? ''}
                  onChange={(e) => setFormData((prev) => ({ ...prev, NoofScheduleAppt: e.target.value }))}
                  placeholder="e.g. 20"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: radii.md,
                    border: `1px solid ${colors.border?.default || '#cbd5e1'}`,
                    outline: 'none',
                    fontSize: '0.9rem'
                  }}
                />
              </div>

              {/* Number of Walk-In Patients */}
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    marginBottom: 4,
                    color: colors.text?.primary || '#334155'
                  }}
                >
                  Walk-In Patients Quota
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.NoofWalkInPatient ?? ''}
                  onChange={(e) => setFormData((prev) => ({ ...prev, NoofWalkInPatient: e.target.value }))}
                  placeholder="e.g. 10"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: radii.md,
                    border: `1px solid ${colors.border?.default || '#cbd5e1'}`,
                    outline: 'none',
                    fontSize: '0.9rem'
                  }}
                />
              </div>
            </div>
          </div>

          {/* Section 4: Holidays / Vacation Outages */}
          <div
            style={{
              backgroundColor: '#fff',
              borderRadius: radii.md,
              border: `1px solid ${colors.border?.subtle || '#e2e8f0'}`,
              padding: spacing.lg,
              marginBottom: spacing.lg
            }}
          >
            <h3
              style={{
                fontSize: '1rem',
                fontWeight: 600,
                color: colors.text?.primary || '#1e293b',
                marginTop: 0,
                marginBottom: spacing.md,
                display: 'flex',
                alignItems: 'center',
                gap: 8
              }}
            >
              <i className="fa fa-umbrella-beach" style={{ color: '#f59e0b' }} />
              Leave / Holiday Suspension (Optional)
            </h3>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: spacing.md
              }}
            >
              {/* Holiday From */}
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    marginBottom: 4,
                    color: colors.text?.primary || '#334155'
                  }}
                >
                  Holiday / Leave From
                </label>
                <input
                  type="date"
                  value={formData.HolidayFrom || ''}
                  onChange={(e) => setFormData((prev) => ({ ...prev, HolidayFrom: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: radii.md,
                    border: `1px solid ${colors.border?.default || '#cbd5e1'}`,
                    outline: 'none',
                    fontSize: '0.9rem'
                  }}
                />
              </div>

              {/* Holiday To */}
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    marginBottom: 4,
                    color: colors.text?.primary || '#334155'
                  }}
                >
                  Holiday / Leave To
                </label>
                <input
                  type="date"
                  value={formData.HolidayTo || ''}
                  onChange={(e) => setFormData((prev) => ({ ...prev, HolidayTo: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: radii.md,
                    border: `1px solid ${colors.border?.default || '#cbd5e1'}`,
                    outline: 'none',
                    fontSize: '0.9rem'
                  }}
                />
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: `${spacing.md}px 0`,
              borderTop: `1px solid ${colors.border?.subtle || '#e2e8f0'}`
            }}
          >
            <button
              type="button"
              onClick={handleBackToList}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '10px 18px',
                borderRadius: radii.md,
                backgroundColor: '#fff',
                border: `1px solid ${colors.border?.default || '#cbd5e1'}`,
                color: colors.text?.primary || '#334155',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.9rem'
              }}
            >
              <i className="fa fa-angle-left" /> Back
            </button>

            <div style={{ display: 'flex', gap: spacing.md }}>
              <button
                type="button"
                disabled={saving}
                onClick={() => handleSave(1)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '10px 20px',
                  borderRadius: radii.md,
                  backgroundColor: '#f1f5f9',
                  border: `1px solid ${colors.border?.default || '#cbd5e1'}`,
                  color: colors.text?.primary || '#1e293b',
                  cursor: saving ? 'not-allowed' : 'pointer',
                  fontWeight: 600,
                  fontSize: '0.9rem'
                }}
              >
                {saving ? <i className="fa fa-spinner fa-spin" /> : <i className="fa fa-save" />} Save Draft
              </button>

              <button
                type="button"
                disabled={saving}
                onClick={() => handleSave(formData.IsActive ? 2 : 3)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '10px 24px',
                  borderRadius: radii.md,
                  backgroundColor: colors.primary?.main || '#2563eb',
                  border: 'none',
                  color: '#fff',
                  cursor: saving ? 'not-allowed' : 'pointer',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  boxShadow: '0 2px 4px rgba(37, 99, 235, 0.2)'
                }}
              >
                {saving ? (
                  <>
                    <i className="fa fa-spinner fa-spin" /> Saving...
                  </>
                ) : (
                  <>
                    <i className="fa fa-check-circle" /> Save & Approve
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
};

export default AppointmentSessionFormScreen;
