import React from 'react';
import { colors, radii, spacing, typography } from '../components/ui/tokens';
import { Input } from '../components/ui/Input';
import { Select, type SelectOption } from '../components/ui/Select';
import { DatePicker } from '../components/ui/DatePicker';
import { Checkbox } from '../components/ui/Checkbox';

interface LookupOption {
  Id: number;
  Text: string;
}

interface ItemShape {
  AppointmentCategoryId?: number | string;
  AppointmentDate?: string | Date;
  AppointmentStatus?: { Description?: string };
  DepartmentId?: number | string;
  DoctorId?: number | string;
  PriorityId?: number | string;
  AppointmentStatusId?: number | string;
  StartTime?: string;
  EndTime?: string;
  Remarks?: string;
  IsVideoConsultation?: boolean;
  VisitTypeId?: number | string;
  ReferTypeId?: number | string;
  CancelorRescheduleComments?: string;
  DoctorName?: string;
  DepartmentName?: string;
  PatientId?: number;
  SelectedSlot?: string;
  IsForceBooking?: number;
  candisable?: boolean;
}

interface SelectedPatientShape {
  Title?: { Description?: string };
  FirstName?: string;
  DOB?: string;
  Age?: number | string;
  Gender?: { Description?: string };
  Mobile?: string;
  Email?: string;
  AddressLine1?: string;
}

interface NewPatientShape {
  TitleId?: number | string;
  FirstName?: string;
  DOB?: string;
  Age?: number | string;
  GenderId?: number | string;
  Mobile?: string;
  Email?: string;
  ApproxAgeDays?: number | string;
  ApproxAgeMonths?: number | string;
  AddressLine1?: string;
}

interface CurrentContextShape {
  id?: number;
  isnewpatient?: boolean;
  isreschedule?: boolean;
  Qualification?: string;
  file?: any;
  Photo?: string;
}

interface LookupShape {
  AppointmentCategory?: LookupOption[];
  Title?: LookupOption[];
  Gender?: LookupOption[];
  Department?: LookupOption[];
  Doctor?: LookupOption[];
  Priority?: LookupOption[];
  AppointmentStatus?: LookupOption[];
  VisitType?: LookupOption[];
  ReferralType?: LookupOption[];
}

interface SlotItem {
  SlotName?: string;
  AvialSlot?: string;
  Selected?: boolean;
  isSelected?: boolean;
  isBookedAppt?: boolean;
  isHoliday?: boolean;
  isBreak?: boolean;
}

interface AvailSlotGroup {
  SlotName?: string;
  SlotItems?: SlotItem[];
}

interface ReactPropsShape {
  item?: ItemShape;
  lookup?: LookupShape;
  currentcontext?: CurrentContextShape;
  selectedPatient?: SelectedPatientShape;
  newPatient?: NewPatientShape;
  searchDoctorbydept?: number;
  disableAppointment?: number;
  disableSlot?: number;
  noshown?: number;
  CanShowCancel?: boolean;
  CanShowCheckin?: boolean;
  CanShowSaveBtn?: boolean;
  canDisablePatientDiv?: boolean;
  canDisableAppointmentDiv?: boolean;
  canShowVisitType?: boolean;
  canShowApproxAge?: boolean;
  newAppointmentSlot?: AvailSlotGroup[];
}

interface ScreenProps {
  reactProps?: ReactPropsShape;
  onAction?: (actionName: string, payload?: any) => void;
}

const toOptions = (list?: LookupOption[]): SelectOption[] =>
  (list || []).map((l) => ({ value: l.Id, label: l.Text }));

const dispatchOf = (onAction?: (a: string, p?: any) => void) => (action: string, payload?: any) => {
  onAction?.(action, payload);
};

function toDateInputValue(d?: string | Date): string {
  if (!d) return '';
  const date = d instanceof Date ? d : new Date(d);
  if (isNaN(date.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function numericOnly(e: React.KeyboardEvent<HTMLInputElement>) {
  const charCode = e.charCode;
  if ((charCode > 47 && charCode < 58) || charCode === 0) return;
  e.preventDefault();
}

const panelStyle: React.CSSProperties = {
  fontFamily: typography.fontFamily,
};

// ── 1. Top Status Bar (Shown when viewing an existing appointment) ──
export const AppointmentsFormStatusBar: React.FC<ScreenProps> = ({ reactProps }) => {
  const { item = {}, currentcontext = {} } = reactProps || {};
  if (!((currentcontext.id ?? 0) > 0)) return null;

  const statusDesc = item.AppointmentStatus?.Description || 'Scheduled';
  const isCancelled = String(item.AppointmentStatusId) === '5';
  const isCheckedIn = String(item.AppointmentStatusId) === '6';

  const badgeColor = isCancelled ? '#dc2626' : isCheckedIn ? '#059669' : '#2563eb';
  const badgeBg = isCancelled ? '#fee2e2' : isCheckedIn ? '#dcfce7' : '#dbeafe';

  return (
    <div
      style={{
        ...panelStyle,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 20px',
        background: '#ffffff',
        borderRadius: 10,
        border: '1px solid #e2e8f0',
        marginBottom: 16,
        boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 32,
            height: 32,
            borderRadius: '50%',
            background: '#eff6ff',
            color: '#2563eb',
            fontSize: 14,
          }}
        >
          <i className="fas fa-calendar-check" />
        </span>
        <div>
          <span style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>
            Appointment #{currentcontext.id}
          </span>
          {item.DoctorName && (
            <span style={{ fontSize: 12, color: '#64748b', marginLeft: 8 }}>
              • Dr. {item.DoctorName} ({item.DepartmentName || ''})
            </span>
          )}
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 12, color: '#64748b', fontWeight: 500 }}>Status:</span>
        <span
          style={{
            padding: '4px 12px',
            borderRadius: 999,
            background: badgeBg,
            color: badgeColor,
            fontSize: 12,
            fontWeight: 700,
            border: `1px solid ${badgeBg}`,
          }}
        >
          {statusDesc}
        </span>
      </div>
    </div>
  );
};

// ── 2. Category Selector Buttons ──
export const AppointmentsFormCategoryButtons: React.FC<ScreenProps> = ({ reactProps, onAction }) => {
  const { lookup = {}, item = {}, canDisablePatientDiv } = reactProps || {};
  const dispatch = dispatchOf(onAction);
  const items = lookup.AppointmentCategory || [];

  return (
    <div
      style={{
        ...panelStyle,
        display: 'inline-flex',
        alignItems: 'center',
        background: '#f1f5f9',
        padding: 3,
        borderRadius: 8,
        border: '1px solid #e2e8f0',
        gap: 4,
      }}
    >
      {items.map((opt) => {
        const active = String(item.AppointmentCategoryId) === String(opt.Id);
        return (
          <button
            key={opt.Id}
            type="button"
            disabled={!!canDisablePatientDiv}
            onClick={() => dispatch('categorySelect', { value: opt.Id })}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 16px',
              borderRadius: 6,
              border: 'none',
              fontSize: 13,
              fontWeight: active ? 600 : 500,
              cursor: canDisablePatientDiv ? 'not-allowed' : 'pointer',
              background: active ? '#2563eb' : 'transparent',
              color: active ? '#ffffff' : '#475569',
              boxShadow: active ? '0 1px 3px rgba(37,99,235,0.25)' : 'none',
              transition: 'all 0.15s ease',
            }}
          >
            <i
              className={String(opt.Id) === '1' ? 'fas fa-user-plus' : 'fas fa-user-check'}
              style={{ fontSize: 11, opacity: active ? 1 : 0.7 }}
            />
            {opt.Text}
          </button>
        );
      })}
    </div>
  );
};

// ── 3. Patient Information Panel ──
export const AppointmentsFormPatientPanel: React.FC<ScreenProps> = ({ reactProps, onAction }) => {
  const {
    item = {}, lookup = {}, selectedPatient = {}, newPatient = {}, canShowApproxAge, canDisablePatientDiv,
  } = reactProps || {};
  const dispatch = dispatchOf(onAction);
  const isNew = String(item.AppointmentCategoryId) === '1';

  return (
    <div
      style={{
        ...panelStyle,
        display: 'grid',
        gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
        gap: '14px 16px',
      }}
    >
      {!isNew ? (
        <Input label="Patient Title" value={selectedPatient.Title?.Description || ''} disabled readOnly />
      ) : (
        <Select
          label="Patient Title"
          required
          disabled={!!canDisablePatientDiv}
          options={toOptions(lookup.Title)}
          value={newPatient.TitleId ?? ''}
          placeholder="Select Title"
          onChange={(v) => dispatch('titleChange', { value: v })}
        />
      )}

      {!isNew ? (
        <Input
          label="Patient Name"
          value={selectedPatient.FirstName || ''}
          disabled
          readOnly
          style={{ textTransform: 'uppercase', fontWeight: 600 }}
        />
      ) : (
        <Input
          label="Patient Name"
          required
          disabled={!!canDisablePatientDiv}
          style={{ textTransform: 'uppercase' }}
          placeholder="e.g. JOHN DOE"
          value={newPatient.FirstName || ''}
          onChange={(e) => dispatch('firstNameChange', { value: e.target.value.toUpperCase() })}
        />
      )}

      {!isNew ? (
        <Input label="Gender" value={selectedPatient.Gender?.Description || ''} disabled readOnly />
      ) : (
        <Select
          label="Gender"
          required
          disabled={!!canDisablePatientDiv}
          options={toOptions(lookup.Gender)}
          value={newPatient.GenderId ?? ''}
          placeholder="Select Gender"
          onChange={(v) => dispatch('genderChange', { value: v })}
        />
      )}

      {!isNew ? (
        <Input
          label="Mobile Number"
          value={selectedPatient.Mobile || ''}
          disabled={reactProps?.CanShowSaveBtn === false}
          leftIcon="fas fa-phone"
          onChange={(e) => dispatch('selectedPatientMobileChange', { value: e.target.value })}
        />
      ) : (
        <Input
          label="Mobile Number"
          required
          maxLength={10}
          disabled={!!canDisablePatientDiv}
          leftIcon="fas fa-phone"
          placeholder="10-digit mobile"
          value={newPatient.Mobile || ''}
          onKeyPress={numericOnly}
          onChange={(e) => dispatch('newPatientMobileChange', { value: e.target.value })}
        />
      )}

      {!isNew ? (
        <Input label="Date of Birth" value={toDateInputValue(selectedPatient.DOB)} disabled readOnly />
      ) : (
        <DatePicker
          label="Date of Birth"
          disabled={!!canDisablePatientDiv}
          value={toDateInputValue(newPatient.DOB)}
          onChange={(v) => dispatch('newPatientDobChange', { value: v })}
        />
      )}

      {!isNew ? (
        <Input
          label="Age"
          value={selectedPatient.Age !== undefined && selectedPatient.Age !== null ? `${selectedPatient.Age} Yrs` : ''}
          disabled
          readOnly
        />
      ) : (
        <Input
          label="Age (Years)"
          required
          maxLength={3}
          disabled={!!canDisablePatientDiv}
          placeholder="Years"
          value={newPatient.Age ?? ''}
          onKeyPress={numericOnly}
          onChange={(e) => dispatch('newPatientAgeChange', { value: e.target.value })}
        />
      )}

      {!isNew ? (
        <Input
          label="Email Address"
          type="email"
          value={selectedPatient.Email || ''}
          leftIcon="fas fa-envelope"
          placeholder="patient@example.com"
          onChange={(e) => dispatch('selectedPatientEmailChange', { value: e.target.value })}
        />
      ) : (
        <Input
          label="Email Address"
          type="email"
          value={newPatient.Email || ''}
          leftIcon="fas fa-envelope"
          placeholder="patient@example.com"
          onChange={(e) => dispatch('newPatientEmailChange', { value: e.target.value })}
        />
      )}

      {!isNew ? (
        <Input
          label="Address Line"
          value={selectedPatient.AddressLine1 || ''}
          disabled={!!item.candisable}
          placeholder="Residential address"
          onChange={(e) => dispatch('selectedPatientAddressChange', { value: e.target.value })}
        />
      ) : (
        <Input
          label="Address Line"
          value={newPatient.AddressLine1 || ''}
          disabled={!!item.candisable}
          placeholder="Residential address"
          onChange={(e) => dispatch('newPatientAddressChange', { value: e.target.value })}
        />
      )}

      {canShowApproxAge && isNew && (
        <div
          style={{
            gridColumn: '1 / -1',
            background: '#f8fafc',
            padding: 12,
            borderRadius: 8,
            border: '1px solid #e2e8f0',
          }}
        >
          <span
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: '#64748b',
              textTransform: 'uppercase',
              letterSpacing: 0.5,
              display: 'block',
              marginBottom: 8,
            }}
          >
            Approximate Age Breakdown
          </span>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: spacing.sm }}>
            <Input
              label="Days"
              placeholder="0"
              value={newPatient.ApproxAgeDays ?? ''}
              disabled={!!canDisablePatientDiv}
              onChange={(e) => dispatch('approxAgeDaysChange', { value: e.target.value })}
            />
            <Input
              label="Months"
              placeholder="0"
              value={newPatient.ApproxAgeMonths ?? ''}
              disabled={!!canDisablePatientDiv}
              onChange={(e) => dispatch('approxAgeMonthsChange', { value: e.target.value })}
            />
            <Input
              label="Years"
              placeholder="0"
              value={newPatient.Age ?? ''}
              disabled={!!canDisablePatientDiv}
              onChange={(e) => dispatch('approxAgeYearsChange', { value: e.target.value })}
            />
          </div>
        </div>
      )}
    </div>
  );
};

// ── 4. Appointment Details Panel ──
export const AppointmentsFormAppointmentPanel: React.FC<ScreenProps> = ({ reactProps, onAction }) => {
  const {
    item = {}, lookup = {}, searchDoctorbydept, disableAppointment, canDisableAppointmentDiv, canShowVisitType,
  } = reactProps || {};
  const dispatch = dispatchOf(onAction);
  const fieldsetDisabled = !!canDisableAppointmentDiv;
  const dateDeptDoctorDisabled =
    fieldsetDisabled || item.AppointmentStatusId === 6 || String(item.AppointmentStatusId) === '6' || !!disableAppointment;

  return (
    <div
      style={{
        ...panelStyle,
        display: 'grid',
        gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
        gap: '14px 16px',
      }}
    >
      <DatePicker
        label="Appointment Date"
        required
        disabled={dateDeptDoctorDisabled}
        value={toDateInputValue(item.AppointmentDate)}
        onChange={(v) => dispatch('appointmentDateChange', { value: v })}
      />

      {searchDoctorbydept === 1 || String(searchDoctorbydept) === '1' ? (
        <Select
          label="Department"
          required
          disabled={dateDeptDoctorDisabled}
          options={toOptions(lookup.Department)}
          value={item.DepartmentId ?? ''}
          placeholder="Select Department"
          onChange={(v) => dispatch('departmentChange', { value: v })}
        />
      ) : (
        <Select
          label="Department"
          disabled
          options={toOptions(lookup.Department)}
          value={item.DepartmentId ?? ''}
          placeholder="Select Department"
        />
      )}

      <Select
        label="Consulting Doctor"
        required
        disabled={dateDeptDoctorDisabled}
        options={toOptions(lookup.Doctor)}
        value={item.DoctorId ?? ''}
        placeholder="Select Doctor"
        onChange={(v) => {
          const selected = (lookup.Doctor || []).find((o) => String(o.Id) === String(v));
          dispatch('doctorSelect', { value: v, selected });
        }}
      />

      <Select
        label="Priority"
        required
        disabled={fieldsetDisabled}
        options={toOptions(lookup.Priority)}
        value={item.PriorityId ?? ''}
        placeholder="Select Priority"
        onChange={(v) => dispatch('priorityChange', { value: v })}
      />

      <Select
        label="Appointment Status"
        disabled={fieldsetDisabled}
        options={toOptions(lookup.AppointmentStatus)}
        value={item.AppointmentStatusId ?? ''}
        onChange={(v) => dispatch('appointmentStatusSelect', { value: v })}
      />

      {canShowVisitType ? (
        <Select
          label="Visit Type"
          required
          disabled={fieldsetDisabled}
          options={toOptions(lookup.VisitType)}
          value={item.VisitTypeId ?? ''}
          placeholder="Select Visit Type"
          onChange={(v) => dispatch('visitTypeChange', { value: v })}
        />
      ) : (
        <Select
          label="Source Type"
          required
          disabled={fieldsetDisabled}
          options={toOptions(lookup.ReferralType)}
          value={item.ReferTypeId ?? ''}
          placeholder="Select Source Type"
          onChange={(v) => dispatch('referTypeChange', { value: v })}
        />
      )}

      <Input
        label="Start Time"
        required
        value={item.StartTime || ''}
        disabled
        readOnly
        placeholder="Selected via slot"
        leftIcon="fas fa-clock"
      />

      <Input
        label="End Time"
        required
        value={item.EndTime || ''}
        disabled
        readOnly
        placeholder="Selected via slot"
        leftIcon="fas fa-clock"
      />

      {canShowVisitType && (
        <Select
          label="Source Type"
          required
          disabled={fieldsetDisabled}
          options={toOptions(lookup.ReferralType)}
          value={item.ReferTypeId ?? ''}
          placeholder="Select Source Type"
          onChange={(v) => dispatch('referTypeChange', { value: v })}
        />
      )}

      <Input
        label="Remarks"
        placeholder="Optional booking notes..."
        disabled={fieldsetDisabled}
        value={item.Remarks || ''}
        onChange={(e) => dispatch('remarksChange', { value: e.target.value })}
        containerStyle={canShowVisitType ? {} : { gridColumn: 'span 2' }}
      />

      <div style={{ display: 'flex', alignItems: 'center', height: '100%', paddingTop: 22 }}>
        <Checkbox
          label="Is Video Consultation"
          checked={!!item.IsVideoConsultation}
          disabled={fieldsetDisabled}
          onChange={(v) => dispatch('videoConsultToggle', { value: v })}
        />
      </div>

      <Input
        label="Cancel / Reschedule Comments"
        placeholder="Reason if rescheduling..."
        disabled={fieldsetDisabled}
        value={item.CancelorRescheduleComments || ''}
        onChange={(e) => dispatch('cancelRescheduleCommentsChange', { value: e.target.value })}
      />
    </div>
  );
};

// ── 5. Doctor & Slot Picker Component ──
export const AppointmentsFormSlotPicker: React.FC<ScreenProps> = ({ reactProps, onAction }) => {
  const { item = {}, currentcontext = {}, newAppointmentSlot = [], disableSlot } = reactProps || {};
  const dispatch = dispatchOf(onAction);
  const forceBooking = item.IsForceBooking === 1 || String(item.IsForceBooking) === '1';

  return (
    <div style={panelStyle}>
      {/* Doctor Header Banner */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 20px',
          background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
          borderRadius: 10,
          border: '1px solid #e2e8f0',
          marginBottom: 16,
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: '50%',
              background: '#2563eb',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 18,
              boxShadow: '0 2px 4px rgba(37,99,235,0.2)',
            }}
          >
            <i className="fas fa-user-md" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 16, fontWeight: 700, color: '#0f172a' }}>
                {item.DoctorName ? `Dr. ${item.DoctorName}` : 'Select a Doctor to View Slots'}
              </span>
              {currentcontext.Qualification && (
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    padding: '2px 8px',
                    borderRadius: 4,
                    background: '#eff6ff',
                    color: '#2563eb',
                    border: '1px solid #bfdbfe',
                  }}
                >
                  {currentcontext.Qualification}
                </span>
              )}
            </div>
            {item.DepartmentName && (
              <span style={{ fontSize: 12, color: '#64748b' }}>
                Speciality: {item.DepartmentName}
              </span>
            )}
          </div>
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#334155' }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#10b981' }} />
            <span>Available</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#334155' }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#2563eb' }} />
            <span>Selected</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#334155' }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#ef4444' }} />
            <span>Booked</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#334155' }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#94a3b8' }} />
            <span>Break</span>
          </div>
        </div>
      </div>

      {/* Available Slots Groups */}
      {newAppointmentSlot.filter((g) => (g.SlotItems?.length || 0) > 0).length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '28px 20px',
            color: '#64748b',
            background: '#fafbfc',
            borderRadius: 8,
            border: '1px dashed #cbd5e1',
          }}
        >
          <i className="fas fa-calendar-times" style={{ fontSize: 24, marginBottom: 8, color: '#94a3b8' }} />
          <p style={{ margin: 0, fontSize: 13, fontWeight: 500 }}>
            {item.DoctorId ? 'No appointment slots available for this doctor on selected date.' : 'Please select a doctor and date to load available time slots.'}
          </p>
        </div>
      ) : (
        newAppointmentSlot
          .filter((g) => (g.SlotItems?.length || 0) > 0)
          .map((group, gi) => (
            <div key={group.SlotName || gi} style={{ marginBottom: 16 }}>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: '#475569',
                  textTransform: 'uppercase',
                  letterSpacing: 0.5,
                  marginBottom: 10,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <i className="fas fa-clock" style={{ color: '#2563eb' }} />
                <span>{group.SlotName}</span>
              </div>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))',
                  gap: 8,
                }}
              >
                {(group.SlotItems || []).map((it, ii) => {
                  const isAvailable = !it.isSelected && !it.isHoliday && !it.isBreak && !it.isBookedAppt;
                  const isSelected = it.Selected;
                  const isBooked = it.isBookedAppt;
                  const isBreak = it.isBreak;
                  const isHoliday = it.isHoliday;

                  const disabled = forceBooking
                    ? !!disableSlot
                    : !!isBooked || !!isHoliday || !!isBreak || !!disableSlot;

                  let bg = '#ffffff';
                  let border = '1px solid #cbd5e1';
                  let textColor = '#1e293b';

                  if (isSelected) {
                    bg = '#2563eb';
                    border = '1px solid #2563eb';
                    textColor = '#ffffff';
                  } else if (isBooked) {
                    bg = '#fef2f2';
                    border = '1px solid #fecaca';
                    textColor = '#991b1b';
                  } else if (isBreak || isHoliday) {
                    bg = '#f1f5f9';
                    border = '1px solid #e2e8f0';
                    textColor = '#94a3b8';
                  }

                  return (
                    <button
                      key={ii}
                      type="button"
                      disabled={disabled}
                      onClick={() => dispatch('slotClick', { item: it })}
                      title={it.AvialSlot}
                      style={{
                        padding: '8px 10px',
                        borderRadius: 6,
                        border,
                        background: bg,
                        color: textColor,
                        fontSize: 12,
                        fontWeight: isSelected ? 700 : 600,
                        cursor: disabled ? 'not-allowed' : 'pointer',
                        textAlign: 'center',
                        textOverflow: 'ellipsis',
                        overflow: 'hidden',
                        whiteSpace: 'nowrap',
                        boxShadow: isSelected ? '0 2px 4px rgba(37,99,235,0.3)' : 'none',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {it.AvialSlot}
                    </button>
                  );
                })}
              </div>
            </div>
          ))
      )}

      {/* Selected Slot Banner */}
      {item.SelectedSlot && (
        <div
          style={{
            marginTop: 16,
            padding: '12px 18px',
            borderRadius: 8,
            background: '#ecfdf5',
            border: '1px solid #a7f3d0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 24,
                height: 24,
                borderRadius: '50%',
                background: '#059669',
                color: '#ffffff',
                fontSize: 11,
              }}
            >
              <i className="fas fa-check" />
            </span>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#065f46' }}>
              Selected Time Slot: {item.SelectedSlot}
            </span>
          </div>
          <span style={{ fontSize: 12, color: '#047857' }}>
            Start: {item.StartTime || '-'} | End: {item.EndTime || '-'}
          </span>
        </div>
      )}
    </div>
  );
};

// ── 6. Modern Enterprise Action Footer ──
export const AppointmentsFormFooter: React.FC<ScreenProps> = ({ reactProps, onAction }) => {
  const { item = {}, currentcontext = {}, noshown, CanShowCancel, CanShowCheckin, CanShowSaveBtn } = reactProps || {};
  const dispatch = dispatchOf(onAction);
  const isNoshown = String(item.AppointmentStatusId) === '2' && (noshown === 1 || String(noshown) === '1');

  return (
    <div
      style={{
        ...panelStyle,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: 12,
        padding: '16px 24px',
        background: '#ffffff',
        borderTop: '1px solid #e2e8f0',
        borderRadius: '0 0 12px 12px',
        boxShadow: '0 -2px 10px rgba(0,0,0,0.03)',
      }}
    >
      {CanShowCancel && (
        <button
          type="button"
          onClick={() => dispatch('cancelClick')}
          style={{
            padding: '9px 20px',
            borderRadius: 8,
            border: '1px solid #fecaca',
            background: '#ffffff',
            color: '#dc2626',
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          <i className="fas fa-times" style={{ marginRight: 6 }} />
          Cancel
        </button>
      )}

      {isNoshown && (
        <button
          type="button"
          onClick={() => dispatch('noshownClick')}
          style={{
            padding: '9px 20px',
            borderRadius: 8,
            border: '1px solid #cbd5e1',
            background: '#f8fafc',
            color: '#475569',
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          No Shown
        </button>
      )}

      {CanShowCheckin && (
        <button
          type="button"
          onClick={() => dispatch('checkinClick')}
          style={{
            padding: '9px 22px',
            borderRadius: 8,
            border: 'none',
            background: '#059669',
            color: '#ffffff',
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
            boxShadow: '0 1px 3px rgba(5,150,105,0.3)',
          }}
        >
          <i className="fas fa-sign-in-alt" style={{ marginRight: 6 }} />
          Check In
        </button>
      )}

      {currentcontext.isreschedule === true && (
        <button
          type="button"
          onClick={() => dispatch('rescheduleClick')}
          style={{
            padding: '9px 22px',
            borderRadius: 8,
            border: 'none',
            background: '#d97706',
            color: '#ffffff',
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
            boxShadow: '0 1px 3px rgba(217,119,6,0.3)',
          }}
        >
          <i className="fas fa-history" style={{ marginRight: 6 }} />
          Re-Schedule
        </button>
      )}

      {CanShowSaveBtn && (
        <button
          type="button"
          onClick={() => dispatch('saveClick')}
          style={{
            padding: '10px 28px',
            borderRadius: 8,
            border: 'none',
            background: '#2563eb',
            color: '#ffffff',
            fontSize: 14,
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: '0 2px 4px rgba(37,99,235,0.25)',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <i className="fas fa-save" />
          <span>Save Appointment</span>
        </button>
      )}
    </div>
  );
};
