import React, { useState, useEffect, useCallback } from 'react';
import { apiFetch } from './utils/api';
import { colors, spacing, typography, radii } from '../components/ui/tokens';

export interface MultiSessionFormData {
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
  [key: string]: any;
}

export interface AppointmentMultiSessionModalProps {
  isOpen: boolean;
  id?: number;
  doctorId?: number;
  parentSessionId?: number;
  onClose: () => void;
  onSaved: () => void;
}

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

const formatTimeForInput = (val?: string | Date | null): string => {
  if (!val) return '';
  if (typeof val === 'string' && /^\d{2}:\d{2}/.test(val)) return val.substring(0, 5);
  try {
    const d = new Date(val);
    if (isNaN(d.getTime())) return '';
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  } catch {
    return '';
  }
};

export const AppointmentMultiSessionModal: React.FC<AppointmentMultiSessionModalProps> = ({
  isOpen,
  id = 0,
  doctorId = -1,
  parentSessionId = 0,
  onClose,
  onSaved
}) => {
  const [formData, setFormData] = useState<MultiSessionFormData>({
    Id: id,
    FacilityId: 1,
    AppointmentSessionTypeId: 1,
    ClinicId: undefined,
    DoctorId: doctorId,
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

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const [lookups, setLookups] = useState<{
    AppointmentSessionType: LookupOption[];
    Clinic: LookupOption[];
    SessionType: LookupOption[];
    AppointmentSlotType: LookupOption[];
    Resource: LookupOption[];
    Doctor: LookupOption[];
  }>({
    AppointmentSessionType: [
      { Id: 1, Text: 'Doctor / Physician' },
      { Id: 2, Text: 'Resource / Room' }
    ],
    Clinic: [],
    SessionType: [],
    AppointmentSlotType: [],
    Resource: [],
    Doctor: []
  });

  const fetchLookups = useCallback(async () => {
    try {
      const resp = await apiFetch<any>('General/Options/getoptions', {
        method: 'POST',
        body: JSON.stringify([
          { Key: 'AppointmentSessionType' },
          { Key: 'Clinic' },
          { Key: 'SessionType' },
          { Key: 'AppointmentSlotType' },
          { Key: 'Resource' },
          { Key: 'Doctor' }
        ])
      });
      if (resp) {
        setLookups({
          AppointmentSessionType: resp.AppointmentSessionType || [
            { Id: 1, Text: 'Doctor / Physician' },
            { Id: 2, Text: 'Resource / Room' }
          ],
          Clinic: resp.Clinic || [],
          SessionType: resp.SessionType || [],
          AppointmentSlotType: resp.AppointmentSlotType || [],
          Resource: resp.Resource || [],
          Doctor: resp.Doctor || []
        });
      }
    } catch (e) {
      console.warn('Failed to load multi-session lookups', e);
    }
  }, []);

  const loadData = useCallback(async () => {
    if (!isOpen) return;
    setLoading(true);
    setErrorMessage(null);
    setErrors({});
    try {
      if (id > 0) {
        // Load multi-session by ID
        const res = await apiFetch<any>('appointment/AppointmentMultiSession/GetAppointmentMultiSessionById', {
          method: 'POST',
          body: JSON.stringify({ Id: id })
        });
        if (res) {
          const d = res.Data || res;
          setFormData({
            ...d,
            Id: d.Id || id,
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
      } else if (parentSessionId > 0) {
        // Inherit defaults from parent session
        const parentRes = await apiFetch<any>('appointment/AppointmentSession/GetAppointmentSessionById', {
          method: 'POST',
          body: JSON.stringify({ Id: parentSessionId })
        });
        if (parentRes) {
          const p = parentRes.Data || parentRes;
          setFormData((prev) => ({
            ...prev,
            Id: 0,
            FacilityId: p.FacilityId || 1,
            AppointmentSessionTypeId: p.AppointmentSessionTypeId || 1,
            ClinicId: p.ClinicId,
            DoctorId: p.DoctorId || doctorId,
            SpecialityId: p.SpecialityId,
            SessionTypeId: p.SessionTypeId,
            StartDate: formatDateForInput(p.StartDate),
            EndDate: formatDateForInput(p.EndDate),
            SlotDuration: p.SlotDuration || 15,
            AppointmentSlotTypeId: p.AppointmentSlotTypeId
          }));
        }
      } else {
        setFormData((prev) => ({
          ...prev,
          Id: 0,
          DoctorId: doctorId > 0 ? doctorId : prev.DoctorId
        }));
      }
    } catch (e: any) {
      console.error('Error loading multi session', e);
      setErrorMessage(e.message || 'Failed to load session details.');
    } finally {
      setLoading(false);
    }
  }, [id, parentSessionId, doctorId, isOpen]);

  useEffect(() => {
    if (isOpen) {
      fetchLookups();
      loadData();
    }
  }, [isOpen, fetchLookups, loadData]);

  if (!isOpen) return null;

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

  const handleDayToggle = (field: keyof MultiSessionFormData, val: boolean) => {
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

  const validate = (): boolean => {
    const errs: { [key: string]: string } = {};
    if (!formData.ClinicId) errs.ClinicId = 'Clinic is required.';
    if (!formData.SessionTypeId) errs.SessionTypeId = 'Session type is required.';
    if (!formData.StartDate) errs.StartDate = 'Start date is required.';
    if (!formData.EndDate) errs.EndDate = 'End date is required.';
    if (formData.StartDate && formData.EndDate && formData.EndDate < formData.StartDate) {
      errs.EndDate = 'End date cannot be earlier than start date.';
    }
    if (!formData.StartTime) errs.StartTime = 'Start time is required.';
    if (!formData.EndTime) errs.EndTime = 'End time is required.';
    if (!formData.AppointmentSlotTypeId) errs.AppointmentSlotTypeId = 'Slot type is required.';
    if (!formData.SlotDuration || Number(formData.SlotDuration) <= 0) {
      errs.SlotDuration = 'Valid duration is required.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async (statusId: number = 2) => {
    if (!validate()) return;
    setSaving(true);
    setErrorMessage(null);
    try {
      const payloadItem = {
        ...formData,
        ActiveStatusId: statusId,
        IsActive: statusId === 2,
        SlotDuration: Number(formData.SlotDuration) || 15,
        MaxSlotPerDay: formData.MaxSlotPerDay ? Number(formData.MaxSlotPerDay) : null,
        NoofScheduleAppt: formData.NoofScheduleAppt ? Number(formData.NoofScheduleAppt) : null,
        NoofWalkInPatient: formData.NoofWalkInPatient ? Number(formData.NoofWalkInPatient) : null
      };

      const isUpdate = !!(formData.Id && formData.Id > 0);
      const actionName = isUpdate
        ? 'appointment/AppointmentMultiSession/UpdateAppointmentMultiSession'
        : 'appointment/AppointmentMultiSession/AddAppointmentMultiSession';

      await apiFetch(actionName, {
        method: 'POST',
        body: JSON.stringify({ Data: payloadItem })
      });

      onSaved();
      onClose();
    } catch (e: any) {
      console.error('Failed to save multi session', e);
      setErrorMessage(e.message || 'Failed to save multi session.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.6)',
        backdropFilter: 'blur(4px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: spacing.md
      }}
    >
      <div
        style={{
          backgroundColor: '#fff',
          borderRadius: radii.xl,
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1)',
          width: '100%',
          maxWidth: 960,
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: `${spacing.md}px ${spacing.xl}px`,
            borderBottom: `1px solid ${colors.border?.subtle || '#e2e8f0'}`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: '#f8fafc'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <i className="fa fa-layer-group" style={{ color: colors.primary?.main || '#2563eb', fontSize: '1.2rem' }} />
            <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, color: colors.text?.primary || '#1e293b' }}>
              {id > 0 ? `Edit Multi-Session Slot #${id}` : 'Configure Multi-Session Slot'}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '1.2rem',
              color: '#64748b'
            }}
          >
            <i className="fa fa-times" />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: spacing.xl, overflowY: 'auto', flex: 1 }}>
          {errorMessage && (
            <div
              style={{
                padding: '10px 14px',
                backgroundColor: '#fef2f2',
                border: '1px solid #ef4444',
                borderRadius: radii.md,
                color: '#991b1b',
                marginBottom: spacing.md,
                fontSize: '0.875rem'
              }}
            >
              <i className="fa fa-exclamation-circle" style={{ marginRight: 6 }} />
              {errorMessage}
            </div>
          )}

          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <i className="fa fa-spinner fa-spin fa-2x" style={{ color: colors.primary?.main || '#2563eb' }} />
              <div style={{ marginTop: 8, color: '#64748b' }}>Loading session details...</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.lg }}>
              {/* Row 1: Target & Clinic */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: spacing.md }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 4 }}>
                    Clinic / Room <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <select
                    value={formData.ClinicId || ''}
                    onChange={(e) => setFormData((p) => ({ ...p, ClinicId: Number(e.target.value) }))}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: radii.md,
                      border: `1px solid ${errors.ClinicId ? '#ef4444' : '#cbd5e1'}`
                    }}
                  >
                    <option value="">-- Select Clinic --</option>
                    {lookups.Clinic.map((c) => (
                      <option key={c.Id} value={c.Id}>
                        {c.Text}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 4 }}>
                    Session Type <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <select
                    value={formData.SessionTypeId || ''}
                    onChange={(e) => setFormData((p) => ({ ...p, SessionTypeId: Number(e.target.value) }))}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: radii.md,
                      border: `1px solid ${errors.SessionTypeId ? '#ef4444' : '#cbd5e1'}`
                    }}
                  >
                    <option value="">-- Select Type --</option>
                    {lookups.SessionType.map((st) => (
                      <option key={st.Id} value={st.Id}>
                        {st.Text}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 4 }}>
                    Slot Type <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <select
                    value={formData.AppointmentSlotTypeId || ''}
                    onChange={(e) => setFormData((p) => ({ ...p, AppointmentSlotTypeId: Number(e.target.value) }))}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: radii.md,
                      border: `1px solid ${errors.AppointmentSlotTypeId ? '#ef4444' : '#cbd5e1'}`
                    }}
                  >
                    <option value="">-- Select Slot Type --</option>
                    {lookups.AppointmentSlotType.map((ast) => (
                      <option key={ast.Id} value={ast.Id}>
                        {ast.Text}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row 2: Dates & Duration */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: spacing.md }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 4 }}>
                    Start Date <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.StartDate || ''}
                    onChange={(e) => setFormData((p) => ({ ...p, StartDate: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: radii.md,
                      border: `1px solid ${errors.StartDate ? '#ef4444' : '#cbd5e1'}`
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 4 }}>
                    End Date <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.EndDate || ''}
                    onChange={(e) => setFormData((p) => ({ ...p, EndDate: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: radii.md,
                      border: `1px solid ${errors.EndDate ? '#ef4444' : '#cbd5e1'}`
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 4 }}>
                    Slot Duration (Min) <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.SlotDuration || ''}
                    onChange={(e) => setFormData((p) => ({ ...p, SlotDuration: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: radii.md,
                      border: `1px solid ${errors.SlotDuration ? '#ef4444' : '#cbd5e1'}`
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 4 }}>
                    Max Slots / Day
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.MaxSlotPerDay ?? ''}
                    onChange={(e) => setFormData((p) => ({ ...p, MaxSlotPerDay: e.target.value }))}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: radii.md, border: '1px solid #cbd5e1' }}
                  />
                </div>
              </div>

              {/* Row 3: Timings */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: spacing.md }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 4 }}>
                    Start Time <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="time"
                    value={formData.StartTime || ''}
                    onChange={(e) => setFormData((p) => ({ ...p, StartTime: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: radii.md,
                      border: `1px solid ${errors.StartTime ? '#ef4444' : '#cbd5e1'}`
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 4 }}>
                    End Time <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="time"
                    value={formData.EndTime || ''}
                    onChange={(e) => setFormData((p) => ({ ...p, EndTime: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: radii.md,
                      border: `1px solid ${errors.EndTime ? '#ef4444' : '#cbd5e1'}`
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 4 }}>
                    Break From
                  </label>
                  <input
                    type="time"
                    value={formData.BreakFrom || ''}
                    onChange={(e) => setFormData((p) => ({ ...p, BreakFrom: e.target.value }))}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: radii.md, border: '1px solid #cbd5e1' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 4 }}>
                    Break To
                  </label>
                  <input
                    type="time"
                    value={formData.BreakTo || ''}
                    onChange={(e) => setFormData((p) => ({ ...p, BreakTo: e.target.value }))}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: radii.md, border: '1px solid #cbd5e1' }}
                  />
                </div>
              </div>

              {/* Row 4: Days of Week */}
              <div
                style={{
                  backgroundColor: '#f8fafc',
                  padding: spacing.md,
                  borderRadius: radii.md,
                  border: '1px solid #e2e8f0'
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 8
                  }}
                >
                  <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Active Days:</span>
                  <label style={{ fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <input
                      type="checkbox"
                      checked={!!formData.IsAll}
                      onChange={(e) => handleAllDaysToggle(e.target.checked)}
                    />
                    Select All
                  </label>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6 }}>
                  {[
                    { key: 'IsMonday', label: 'Mon' },
                    { key: 'IsTuesday', label: 'Tue' },
                    { key: 'IsWednesday', label: 'Wed' },
                    { key: 'IsThursday', label: 'Thu' },
                    { key: 'IsFriday', label: 'Fri' },
                    { key: 'IsSaturday', label: 'Sat' },
                    { key: 'IsSunday', label: 'Sun' }
                  ].map((d) => (
                    <label
                      key={d.key}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 4,
                        padding: '6px',
                        backgroundColor: '#fff',
                        border: '1px solid #cbd5e1',
                        borderRadius: radii.sm,
                        cursor: 'pointer',
                        fontSize: '0.8rem'
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={!!formData[d.key as keyof MultiSessionFormData]}
                        onChange={(e) =>
                          handleDayToggle(d.key as keyof MultiSessionFormData, e.target.checked)
                        }
                      />
                      {d.label}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div
          style={{
            padding: `${spacing.md}px ${spacing.xl}px`,
            borderTop: `1px solid ${colors.border?.subtle || '#e2e8f0'}`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: '#f8fafc'
          }}
        >
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '8px 16px',
              borderRadius: radii.md,
              backgroundColor: '#fff',
              border: '1px solid #cbd5e1',
              cursor: 'pointer',
              fontWeight: 500
            }}
          >
            Cancel
          </button>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              type="button"
              disabled={saving}
              onClick={() => handleSave(1)}
              style={{
                padding: '8px 16px',
                borderRadius: radii.md,
                backgroundColor: '#e2e8f0',
                border: 'none',
                cursor: saving ? 'not-allowed' : 'pointer',
                fontWeight: 600
              }}
            >
              Save Draft
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={() => handleSave(2)}
              style={{
                padding: '8px 20px',
                borderRadius: radii.md,
                backgroundColor: colors.primary?.main || '#2563eb',
                color: '#fff',
                border: 'none',
                cursor: saving ? 'not-allowed' : 'pointer',
                fontWeight: 600
              }}
            >
              {saving ? 'Saving...' : 'Save & Approve'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppointmentMultiSessionModal;
