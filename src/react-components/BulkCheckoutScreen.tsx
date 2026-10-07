import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from './Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { DatePicker } from '../components/ui/DatePicker';
import { Checkbox } from '../components/ui/Checkbox';
import { Badge, StatusBadge, type BadgeTone } from '../components/ui/Badge';
import { SkeletonRows } from '../components/ui/Loading';
import { colors, radii, spacing, typography, shadows, transitions } from '../components/ui/tokens';

export interface AppointmentItem {
  Id: number;
  AppointmentDate?: string;
  StartTime?: string;
  AppointmentStatusId?: number;
  PatientId: number;
  IsSelected?: boolean;
  IsAllApnmntSelected?: boolean;
  Patient?: {
    Id?: number;
    MRN?: string;
    FirstName?: string;
    LastName?: string;
    Age?: number | string;
    Title?: { Description?: string };
    Gender?: { Description?: string };
  };
  User?: {
    Id?: number;
    FirstName?: string;
    LastName?: string;
    Title?: { Description?: string };
  };
  Department?: {
    DepartmentName?: string;
  };
  AppointmentStatus?: {
    Id?: number;
    Description?: string;
  };
  Encounter?: {
    Id?: number;
    VisitIdentifier?: string;
    DischargeDate?: string;
  };
  [key: string]: any;
}

export interface LookupOption {
  Id: number;
  Text: string;
}

export interface BulkCheckoutScreenProps {
  reactProps?: {
    filter?: {
      patientnamemrn?: string;
      From?: string;
      To?: string;
      AppointmentStatusId?: number | string;
      FacilityId?: number;
    };
    lookup?: {
      AppointmentStatus?: LookupOption[];
      Department?: LookupOption[];
      Doctor?: LookupOption[];
      AppointmentType?: LookupOption[];
      Resource?: LookupOption[];
      [key: string]: any;
    };
    appointments?: AppointmentItem[];
    isCheckedOut?: boolean;
    selectAll?: boolean;
    loading?: boolean;
    isCheckingOut?: boolean;
  };
  onAction?: (actionName: string, payload?: any) => void;
}

const formatDate = (val?: string | Date | null): string => {
  if (!val) return '—';
  const d = new Date(val);
  if (isNaN(d.getTime())) return String(val).slice(0, 10);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
};

const formatTime = (timeVal?: string | Date | null): string => {
  if (!timeVal) return '';
  const d = new Date(timeVal);
  if (isNaN(d.getTime())) {
    // If it's a string like "10:30:00"
    if (typeof timeVal === 'string' && timeVal.includes(':')) {
      const parts = timeVal.split(':');
      return `${parts[0]}:${parts[1]}`;
    }
    return '';
  }
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
};

const getTodayString = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const toInputDate = (d?: string | Date | null): string => {
  if (!d) return getTodayString();
  if (typeof d === 'string' && /^\d{4}-\d{2}-\d{2}/.test(d)) {
    return d.slice(0, 10);
  }
  const dateObj = new Date(d);
  if (isNaN(dateObj.getTime())) return getTodayString();
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const BulkCheckoutScreen: React.FC<BulkCheckoutScreenProps> = ({ reactProps, onAction }) => {
  const {
    filter = {},
    lookup = {},
    appointments = [],
    isCheckedOut = false,
    loading = false,
    isCheckingOut = false,
  } = reactProps || {};

  const dispatch = useCallback((action: string, payload?: any) => {
    if (onAction) onAction(action, payload);
  }, [onAction]);

  // Local state for interactive filtering
  const [searchQuery, setSearchQuery] = useState(filter.patientnamemrn || '');
  const [fromDate, setFromDate] = useState(toInputDate(filter.From));
  const [toDate, setToDate] = useState(toInputDate(filter.To));
  const [statusId, setStatusId] = useState<number | string>(filter.AppointmentStatusId ?? 6);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  // Sync state if controller updates filters
  useEffect(() => {
    if (filter.patientnamemrn !== undefined && filter.patientnamemrn !== searchQuery) {
      setSearchQuery(filter.patientnamemrn);
    }
  }, [filter.patientnamemrn]);

  useEffect(() => {
    if (filter.From) setFromDate(toInputDate(filter.From));
    if (filter.To) setToDate(toInputDate(filter.To));
    if (filter.AppointmentStatusId !== undefined) setStatusId(filter.AppointmentStatusId);
  }, [filter.From, filter.To, filter.AppointmentStatusId]);

  // Sync selected rows from backend or maintain local selection
  useEffect(() => {
    const nextSelected = new Set<number>();
    appointments.forEach((item) => {
      if (item.IsSelected) {
        nextSelected.add(item.Id);
      }
    });
    setSelectedIds(nextSelected);
  }, [appointments]);

  // Eligible appointments for checkout: only status 6 (Checked In)
  const eligibleAppointments = useMemo(() => {
    return appointments.filter((item) => item.AppointmentStatusId === 6);
  }, [appointments]);

  const allEligibleSelected = useMemo(() => {
    if (eligibleAppointments.length === 0) return false;
    return eligibleAppointments.every((item) => selectedIds.has(item.Id));
  }, [eligibleAppointments, selectedIds]);

  const someEligibleSelected = useMemo(() => {
    return eligibleAppointments.some((item) => selectedIds.has(item.Id)) && !allEligibleSelected;
  }, [eligibleAppointments, selectedIds, allEligibleSelected]);

  // Handle Search Submission
  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    dispatch('search', { query: searchQuery.trim() });
  };

  const handleDateChange = (field: 'From' | 'To', value: string) => {
    if (field === 'From') setFromDate(value);
    if (field === 'To') setToDate(value);
    dispatch('filterChange', { key: field, value });
  };

  const handleStatusChange = (val: string | number) => {
    const parsed = val === '' ? '' : Number(val);
    setStatusId(parsed);
    dispatch('filterChange', { key: 'AppointmentStatusId', value: parsed });
  };

  const handleTodayClick = () => {
    const today = getTodayString();
    setFromDate(today);
    setToDate(today);
    dispatch('filterChange', { key: 'From', value: today });
    dispatch('filterChange', { key: 'To', value: today });
  };

  const handleResetFilters = () => {
    const today = getTodayString();
    setSearchQuery('');
    setFromDate(today);
    setToDate(today);
    setStatusId(6);
    dispatch('filterChange', { key: 'patientnamemrn', value: '' });
    dispatch('filterChange', { key: 'From', value: today });
    dispatch('filterChange', { key: 'To', value: today });
    dispatch('filterChange', { key: 'AppointmentStatusId', value: 6 });
  };

  // Toggle selection for all eligible items
  const handleToggleSelectAll = () => {
    const shouldSelectAll = !allEligibleSelected;
    const newSelected = new Set(selectedIds);
    eligibleAppointments.forEach((item) => {
      if (shouldSelectAll) {
        newSelected.add(item.Id);
      } else {
        newSelected.delete(item.Id);
      }
    });
    setSelectedIds(newSelected);
    dispatch('toggleSelectAll', { selected: shouldSelectAll });
  };

  // Toggle single row selection
  const handleToggleRow = (item: AppointmentItem) => {
    if (item.AppointmentStatusId === 11) return; // Already checked out
    const newSelected = new Set(selectedIds);
    const willBeSelected = !newSelected.has(item.Id);
    if (willBeSelected) {
      newSelected.add(item.Id);
    } else {
      newSelected.delete(item.Id);
    }
    setSelectedIds(newSelected);
    dispatch('toggleSelectRow', { item, selected: willBeSelected });
  };

  // Trigger batch checkout
  const handleBatchCheckout = () => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;
    dispatch('batchCheckout', { selectedIds: ids });
  };

  const statusOptions = useMemo(() => {
    const base = (lookup.AppointmentStatus || []).map((x) => ({
      value: x.Id,
      label: x.Text,
    }));
    return [{ value: '', label: 'All Statuses' }, ...base];
  }, [lookup.AppointmentStatus]);

  return (
    <div
      className="bulk-checkout-screen"
      style={{
        fontFamily: typography.fontFamily,
        display: 'flex',
        flexDirection: 'column',
        gap: spacing.lg,
        color: colors.textMain,
      }}
    >
      {/* Top Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: spacing.md,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: spacing.md }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: radii.md,
              backgroundColor: 'rgba(33, 0, 141, 0.08)',
              color: 'var(--hims-primary, #21008d)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px',
              flexShrink: 0,
            }}
          >
            <i className="fa fa-sign-out" aria-hidden="true" />
          </div>
          <div>
            <h2
              style={{
                fontSize: '20px',
                fontWeight: 700,
                color: colors.textMain,
                margin: 0,
                letterSpacing: '-0.3px',
              }}
            >
              Bulk Checkout
            </h2>
            <div style={{ fontSize: '13px', color: colors.textMuted, marginTop: '2px' }}>
              Batch process consultations and discharge outpatients in bulk
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm }}>
          <Button
            variant="light"
            size="sm"
            icon="fa-refresh"
            onClick={() => dispatch('refresh')}
            disabled={loading}
            title="Reload appointments"
          >
            Refresh
          </Button>
          <Badge tone="neutral">
            {appointments.length} Total {appointments.length === 1 ? 'Visit' : 'Visits'}
          </Badge>
          {eligibleAppointments.length > 0 && (
            <Badge tone="info">
              {eligibleAppointments.length} Checked In
            </Badge>
          )}
        </div>
      </div>

      {/* Filter Card */}
      <Card padding="14px 18px" style={{ backgroundColor: '#ffffff', borderRadius: radii.lg }}>
        <form onSubmit={handleSearchSubmit}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '12px 16px',
              alignItems: 'flex-end',
            }}
          >
            {/* Search Input */}
            <div style={{ minWidth: '220px' }}>
              <Input
                label="Search Patient / UHID"
                placeholder="Enter patient name, MRN, UHID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                leftIcon="fa-search"
              />
            </div>

            {/* From Date */}
            <div>
              <DatePicker
                label="From Date"
                value={fromDate}
                onChange={(val) => handleDateChange('From', val)}
              />
            </div>

            {/* To Date */}
            <div>
              <DatePicker
                label="To Date"
                value={toDate}
                onChange={(val) => handleDateChange('To', val)}
              />
            </div>

            {/* Status Dropdown */}
            <div>
              <Select
                label="Appointment Status"
                options={statusOptions}
                value={statusId}
                onChange={handleStatusChange}
              />
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: spacing.xs, alignItems: 'center', paddingBottom: '2px' }}>
              <Button
                type="submit"
                variant="primary"
                size="md"
                icon="fa-search"
                style={{ flex: 1, minWidth: '90px', height: '36px' }}
              >
                Search
              </Button>
              <Button
                type="button"
                variant="light"
                size="md"
                onClick={handleTodayClick}
                title="Filter for today only"
                style={{ height: '36px' }}
              >
                Today
              </Button>
              <Button
                type="button"
                variant="light"
                size="md"
                icon="fa-undo"
                onClick={handleResetFilters}
                title="Reset filters"
                style={{ height: '36px' }}
              />
            </div>
          </div>
        </form>
      </Card>

      {/* Table Section */}
      <Card padding="0" style={{ overflow: 'hidden', borderRadius: radii.lg, border: `1px solid ${colors.border}` }}>
        {/* Table Sub-Header / Selection Status Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 18px',
            backgroundColor: selectedIds.size > 0 ? '#eff6ff' : '#f8fafc',
            borderBottom: `1px solid ${selectedIds.size > 0 ? '#bfdbfe' : colors.border}`,
            transition: transitions.fast,
            flexWrap: 'wrap',
            gap: spacing.sm,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: spacing.md }}>
            <label
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                cursor: eligibleAppointments.length > 0 ? 'pointer' : 'not-allowed',
                userSelect: 'none',
                fontWeight: 600,
                fontSize: '13px',
                color: colors.textMain,
                margin: 0,
              }}
            >
              <input
                type="checkbox"
                checked={allEligibleSelected}
                ref={(el) => {
                  if (el) el.indeterminate = someEligibleSelected;
                }}
                disabled={eligibleAppointments.length === 0}
                onChange={handleToggleSelectAll}
                style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: 'var(--hims-primary, #21008d)' }}
              />
              <span>Select All Eligible ({eligibleAppointments.length})</span>
            </label>

            {selectedIds.size > 0 && (
              <Badge tone="info">
                {selectedIds.size} Selected
              </Badge>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm }}>
            {selectedIds.size > 0 && (
              <Button
                type="button"
                variant="light"
                size="sm"
                onClick={() => setSelectedIds(new Set())}
              >
                Clear Selection
              </Button>
            )}
            <Button
              type="button"
              variant="primary"
              size="sm"
              icon="fa-check-square-o"
              disabled={selectedIds.size === 0 || isCheckingOut}
              onClick={handleBatchCheckout}
              style={{
                backgroundColor: 'var(--hims-primary, #21008d)',
                boxShadow: selectedIds.size > 0 ? '0 2px 6px rgba(33, 0, 141, 0.25)' : 'none',
              }}
            >
              {isCheckingOut ? 'Checking Out...' : `Bulk Checkout (${selectedIds.size})`}
            </Button>
          </div>
        </div>

        {/* Responsive Table */}
        <div style={{ overflowX: 'auto', width: '100%' }}>
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              textAlign: 'left',
              fontSize: '13px',
            }}
          >
            <thead>
              <tr
                style={{
                  backgroundColor: '#f8fafc',
                  borderBottom: `1px solid ${colors.border}`,
                  color: colors.textMuted,
                  fontSize: '11.5px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.4px',
                }}
              >
                <th style={{ width: '48px', padding: '12px 14px', textAlign: 'center' }}>
                  #
                </th>
                <th style={{ padding: '12px 14px', minWidth: '130px' }}>Visit Date & Time</th>
                <th style={{ padding: '12px 14px', minWidth: '220px' }}>Patient Info</th>
                <th style={{ padding: '12px 14px', minWidth: '110px' }}>Visit ID</th>
                <th style={{ padding: '12px 14px', minWidth: '150px' }}>Doctor</th>
                <th style={{ padding: '12px 14px', minWidth: '130px' }}>Department</th>
                <th style={{ padding: '12px 14px', minWidth: '110px' }}>Status</th>
                <th style={{ padding: '12px 14px', minWidth: '120px' }}>Checkout Date</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} style={{ padding: spacing.xl }}>
                    <SkeletonRows rows={6} columns={8} />
                  </td>
                </tr>
              ) : appointments.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    style={{
                      textAlign: 'center',
                      padding: '48px 16px',
                      color: colors.textMuted,
                    }}
                  >
                    <div style={{ fontSize: '32px', marginBottom: '8px', color: '#cbd5e1' }}>
                      <i className="fa fa-calendar-times-o" aria-hidden="true" />
                    </div>
                    <div style={{ fontSize: '15px', fontWeight: 600, color: colors.textMain }}>
                      No Appointments Found
                    </div>
                    <div style={{ fontSize: '13px', marginTop: '4px' }}>
                      No records match the current filter criteria. Try expanding the date range or choosing a different status.
                    </div>
                  </td>
                </tr>
              ) : (
                appointments.map((item, index) => {
                  const isChecked = selectedIds.has(item.Id);
                  const isCheckedOutRow = item.AppointmentStatusId === 11;
                  const isEligible = item.AppointmentStatusId === 6;

                  const patientName = [
                    item.Patient?.Title?.Description,
                    item.Patient?.FirstName,
                    item.Patient?.LastName,
                  ]
                    .filter(Boolean)
                    .join(' ') || 'Unnamed Patient';

                  const doctorName = [
                    item.User?.Title?.Description,
                    item.User?.FirstName,
                    item.User?.LastName,
                  ]
                    .filter(Boolean)
                    .join(' ') || '—';

                  const statusDesc = item.AppointmentStatus?.Description || (isEligible ? 'Checked In' : isCheckedOutRow ? 'Checked Out' : 'Status ' + item.AppointmentStatusId);
                  const statusTone: BadgeTone = isEligible
                    ? 'success'
                    : isCheckedOutRow
                    ? 'neutral'
                    : 'info';

                  return (
                    <tr
                      key={item.Id || index}
                      onClick={() => isEligible && handleToggleRow(item)}
                      style={{
                        borderBottom: `1px solid ${colors.border}`,
                        backgroundColor: isChecked
                          ? '#f0fdf4'
                          : index % 2 === 0
                          ? '#ffffff'
                          : '#fafafa',
                        cursor: isEligible ? 'pointer' : 'default',
                        opacity: isCheckedOutRow ? 0.75 : 1,
                        transition: 'background-color 0.15s ease',
                      }}
                    >
                      {/* Selection Checkbox */}
                      <td
                        style={{
                          textAlign: 'center',
                          padding: '10px 14px',
                          verticalAlign: 'middle',
                        }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          disabled={!isEligible}
                          onChange={() => handleToggleRow(item)}
                          title={
                            isCheckedOutRow
                              ? 'Already checked out'
                              : !isEligible
                              ? 'Only checked-in appointments can be checked out'
                              : 'Select for checkout'
                          }
                          style={{
                            width: '16px',
                            height: '16px',
                            cursor: isEligible ? 'pointer' : 'not-allowed',
                            accentColor: 'var(--hims-primary, #21008d)',
                          }}
                        />
                      </td>

                      {/* Visit Date & Time */}
                      <td style={{ padding: '10px 14px', verticalAlign: 'middle' }}>
                        <div style={{ fontWeight: 600, color: colors.textMain }}>
                          {formatDate(item.AppointmentDate)}
                        </div>
                        {item.StartTime && (
                          <div style={{ fontSize: '11.5px', color: colors.textMuted, marginTop: '2px' }}>
                            <i className="fa fa-clock-o" style={{ marginRight: '4px' }} />
                            {formatTime(item.StartTime)}
                          </div>
                        )}
                      </td>

                      {/* Patient Info */}
                      <td style={{ padding: '10px 14px', verticalAlign: 'middle' }}>
                        <div style={{ fontWeight: 600, color: '#1e293b' }}>
                          {patientName}
                        </div>
                        <div
                          style={{
                            display: 'flex',
                            gap: '6px',
                            alignItems: 'center',
                            fontSize: '11.5px',
                            color: colors.textMuted,
                            marginTop: '2px',
                            flexWrap: 'wrap',
                          }}
                        >
                          {item.Patient?.MRN && (
                            <span
                              style={{
                                fontFamily: 'monospace',
                                backgroundColor: '#f1f5f9',
                                padding: '1px 5px',
                                borderRadius: '4px',
                                border: '1px solid #e2e8f0',
                                fontWeight: 500,
                              }}
                            >
                              {item.Patient.MRN}
                            </span>
                          )}
                          {item.Patient?.Age && <span>{item.Patient.Age} yrs</span>}
                          {item.Patient?.Gender?.Description && (
                            <span>• {item.Patient.Gender.Description}</span>
                          )}
                        </div>
                      </td>

                      {/* Visit ID */}
                      <td style={{ padding: '10px 14px', verticalAlign: 'middle' }}>
                        {item.Encounter?.VisitIdentifier ? (
                          <span
                            style={{
                              fontFamily: 'monospace',
                              fontWeight: 600,
                              color: '#0f172a',
                              backgroundColor: '#f8fafc',
                              padding: '2px 6px',
                              borderRadius: '4px',
                              border: '1px solid #e2e8f0',
                            }}
                          >
                            {item.Encounter.VisitIdentifier}
                          </span>
                        ) : (
                          <span style={{ color: colors.textMuted }}>—</span>
                        )}
                      </td>

                      {/* Doctor */}
                      <td style={{ padding: '10px 14px', verticalAlign: 'middle' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <i className="fa fa-user-md" style={{ color: 'var(--hims-primary, #21008d)', fontSize: '12px' }} />
                          <span style={{ fontWeight: 500 }}>{doctorName}</span>
                        </div>
                      </td>

                      {/* Department */}
                      <td style={{ padding: '10px 14px', verticalAlign: 'middle', color: '#475569' }}>
                        {item.Department?.DepartmentName || '—'}
                      </td>

                      {/* Status */}
                      <td style={{ padding: '10px 14px', verticalAlign: 'middle' }}>
                        <Badge tone={statusTone}>
                          {statusDesc}
                        </Badge>
                      </td>

                      {/* Checkout Date */}
                      <td style={{ padding: '10px 14px', verticalAlign: 'middle', color: colors.textMuted }}>
                        {item.Encounter?.DischargeDate ? (
                          <span style={{ color: colors.textMain, fontWeight: 500 }}>
                            {formatDate(item.Encounter.DischargeDate)}
                          </span>
                        ) : (
                          <span>—</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer Stats */}
        {appointments.length > 0 && (
          <div
            style={{
              padding: '10px 18px',
              backgroundColor: '#f8fafc',
              borderTop: `1px solid ${colors.border}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '12.5px',
              color: colors.textMuted,
              flexWrap: 'wrap',
              gap: spacing.sm,
            }}
          >
            <div>
              Showing <strong>{appointments.length}</strong> appointments (
              <span style={{ color: '#047857', fontWeight: 600 }}>{eligibleAppointments.length} eligible</span>,{' '}
              <span>{appointments.length - eligibleAppointments.length} checked out/other</span>)
            </div>

            <div>
              <strong>{selectedIds.size}</strong> selected for bulk checkout
            </div>
          </div>
        )}
      </Card>

      {/* Floating Bottom Action Bar (if selections exist) */}
      {selectedIds.size > 0 && (
        <div
          style={{
            position: 'sticky',
            bottom: '16px',
            backgroundColor: '#ffffff',
            borderRadius: radii.lg,
            border: `1px solid var(--hims-primary, #21008d)`,
            boxShadow: '0 8px 24px rgba(33, 0, 141, 0.18)',
            padding: '12px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            zIndex: 100,
            animation: 'fadeIn 0.2s ease',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: spacing.md }}>
            <span
              style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                backgroundColor: 'rgba(33, 0, 141, 0.1)',
                color: 'var(--hims-primary, #21008d)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '14px',
              }}
            >
              {selectedIds.size}
            </span>
            <div>
              <div style={{ fontWeight: 700, fontSize: '14px', color: colors.textMain }}>
                {selectedIds.size} {selectedIds.size === 1 ? 'Patient' : 'Patients'} Selected
              </div>
              <div style={{ fontSize: '12px', color: colors.textMuted }}>
                Ready to be checked out in one batch operation
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: spacing.sm, alignItems: 'center' }}>
            <Button
              type="button"
              variant="light"
              size="md"
              onClick={() => setSelectedIds(new Set())}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              size="md"
              icon="fa-check-square-o"
              disabled={isCheckingOut}
              onClick={handleBatchCheckout}
              style={{
                backgroundColor: 'var(--hims-primary, #21008d)',
                padding: '0 24px',
                height: '38px',
                fontWeight: 700,
              }}
            >
              {isCheckingOut ? 'Checking Out...' : `Complete Checkout (${selectedIds.size})`}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
