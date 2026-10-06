import React, { useState, useEffect, useRef, useMemo } from 'react';
import { PatientSearchControl } from './PatientSearchControl';
import { Button } from './Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { DatePicker } from '../components/ui/DatePicker';
import { Pagination } from '../components/ui/Pagination';
import { Card } from '../components/ui/Card';
import { Badge, toneForStatus } from '../components/ui/Badge';
import { EmptyState } from '../components/ui/EmptyState';
import { colors, radii, spacing, typography, shadows, zIndex } from '../components/ui/tokens';

export interface ColumnDef {
  field: string;
  displayName: string;
}

export interface MrnTypeOption {
  Id?: number;
  Text?: string;
}

export interface CurrentFilter {
  FromDate?: string;
  ToDate?: string;
  MRNTypeId?: number;
}

export interface PagerObj {
  totalItems?: number;
  currentPage?: number;
  startIndex?: number;
  pageSize?: number;
}

export interface PatientRegistrationSelfScreenProps {
  reactProps?: {
    currentfilter?: CurrentFilter;
    patientDisplay?: string;
    referralDisplay?: string;
    mrnTypeOptions?: MrnTypeOption[];
    columnDefs?: ColumnDef[];
    gridData?: any[];
    pagerObj?: PagerObj;
    canShowPrint?: boolean;
    context?: string;
    loading?: boolean;
  };
  onAction?: (actionName: string, payload?: any) => void;
  onPatientSearch?: (query: string) => Promise<any[]>;
  onPatientSelect?: (patient: any) => void;
  onReferralSearch?: (query: string) => Promise<any[]>;
  onReferralSelect?: (referral: any) => void;
}

// Default columns to ensure immediate, clean rendering even before Angular translations resolve
const DEFAULT_COLUMN_DEFS: ColumnDef[] = [
  { field: 'idx', displayName: 'S.No' },
  { field: 'FirstName', displayName: 'Patient Name' },
  { field: 'Age', displayName: 'Age / Gender' },
  { field: 'MRN', displayName: 'MRN' },
  { field: 'RegisteredDate', displayName: 'Visit Date' },
  { field: 'Referral.ReferralName', displayName: 'Referral Doctor' },
  { field: 'CityMaster.CityName', displayName: 'City' },
  { field: 'PatientStatus.Description', displayName: 'Status' },
  { field: 'Id', displayName: 'Actions' },
];

function formatDateDDMMYYYY(value?: string): string {
  if (!value) return '';
  const d = new Date(value);
  if (isNaN(d.getTime())) return '';
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  return `${day}-${month}-${d.getFullYear()}`;
}

function toDateInputValue(value?: string | Date): string {
  if (!value) return '';
  const d = typeof value === 'string' ? new Date(value) : value;
  if (isNaN(d.getTime())) return '';
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function toFormattedDateString(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function resolveField(obj: any, field: string): any {
  if (!obj) return undefined;
  let cur = obj;
  for (const part of field.split('.')) {
    if (cur && cur[part] !== undefined && cur[part] !== null) {
      cur = cur[part];
    } else {
      return undefined;
    }
  }
  return cur;
}

export const PatientRegistrationSelfScreen: React.FC<PatientRegistrationSelfScreenProps> = ({
  reactProps,
  onAction,
  onPatientSearch,
  onPatientSelect,
  onReferralSearch,
  onReferralSelect,
}) => {
  const {
    currentfilter = {},
    patientDisplay = '',
    referralDisplay = '',
    mrnTypeOptions = [],
    columnDefs = [],
    gridData = [],
    pagerObj = {},
    canShowPrint = false,
    context = '',
    loading = false,
  } = reactProps || {};

  const effectiveColumns = columnDefs && columnDefs.length > 0 ? columnDefs : DEFAULT_COLUMN_DEFS;

  // Local state for referral search typeahead
  const [referralQuery, setReferralQuery] = useState(referralDisplay);
  const [referralResults, setReferralResults] = useState<any[]>([]);
  const [referralOpen, setReferralOpen] = useState(false);
  const [isSearchingReferral, setIsSearchingReferral] = useState(false);
  const referralWrapperRef = useRef<HTMLDivElement>(null);

  // Sorting state
  const [sort, setSort] = useState<{ field: string; order: 1 | -1 } | null>(null);

  // Synchronize referralQuery when referralDisplay changes from parent/controller
  useEffect(() => {
    setReferralQuery(referralDisplay || '');
  }, [referralDisplay]);

  // Close referral dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (referralWrapperRef.current && !referralWrapperRef.current.contains(e.target as Node)) {
        setReferralOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const dispatch = (action: string, payload?: any) => {
    if (onAction) onAction(action, payload);
  };

  const handleReferralInput = async (value: string) => {
    setReferralQuery(value);
    if (value && value.length > 2 && onReferralSearch) {
      setIsSearchingReferral(true);
      try {
        const results = await onReferralSearch(value);
        setReferralResults(results || []);
        setReferralOpen(true);
      } catch (err) {
        setReferralResults([]);
      } finally {
        setIsSearchingReferral(false);
      }
    } else {
      setReferralResults([]);
      setReferralOpen(false);
    }
  };

  const selectReferral = (referral: any) => {
    const displayLabel = referral.ReferralName
      ? `${referral.ReferralName}${referral.ReferralCode ? ` (${referral.ReferralCode})` : ''}`
      : '';
    setReferralQuery(displayLabel);
    setReferralOpen(false);
    setReferralResults([]);
    if (onReferralSelect) onReferralSelect(referral);
  };

  const clearReferral = () => {
    setReferralQuery('');
    setReferralOpen(false);
    setReferralResults([]);
    if (onReferralSelect) onReferralSelect(null);
  };

  // Quick Date Range Shortcuts
  const applyQuickDate = (type: 'today' | 'last7' | 'month') => {
    const today = new Date();
    let fromDate = new Date();
    const toDate = today;

    if (type === 'today') {
      fromDate = today;
    } else if (type === 'last7') {
      fromDate = new Date(today);
      fromDate.setDate(today.getDate() - 7);
    } else if (type === 'month') {
      fromDate = new Date(today.getFullYear(), today.getMonth(), 1);
    }

    const fromVal = toFormattedDateString(fromDate);
    const toVal = toFormattedDateString(toDate);

    dispatch('dateChange', { field: 'FromDate', value: fromVal });
    dispatch('dateChange', { field: 'ToDate', value: toVal });
  };

  const handleResetFilters = () => {
    const todayStr = toFormattedDateString(new Date());
    clearReferral();
    dispatch('dateChange', { field: 'FromDate', value: todayStr });
    dispatch('dateChange', { field: 'ToDate', value: todayStr });
    dispatch('mrnTypeChange', { value: 2 });
  };

  const handleSort = (field: string) => {
    if (field === 'idx' || field === 'Id') return; // Non-sortable action columns
    setSort((prev) => {
      const nextOrder: 1 | -1 = prev && prev.field === field ? (prev.order === 1 ? -1 : 1) : 1;
      return { field, order: nextOrder };
    });
  };

  const sortedData = useMemo(() => {
    if (!sort) return gridData;
    const { field, order } = sort;
    const copy = [...gridData];
    copy.sort((a, b) => {
      const av = resolveField(a, field);
      const bv = resolveField(b, field);
      const x = av !== undefined && av !== null ? String(av).toLowerCase() : '';
      const y = bv !== undefined && bv !== null ? String(bv).toLowerCase() : '';
      if (x < y) return -order;
      if (x > y) return order;
      return 0;
    });
    return copy;
  }, [gridData, sort]);

  const totalItems = pagerObj.totalItems || 0;
  const pageSize = pagerObj.pageSize || 25;
  const currentPage = pagerObj.currentPage || 1;
  const startItemIndex = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItemIndex = Math.min(currentPage * pageSize, totalItems);

  // Modern cell rendering with rich medical UI elements
  const renderCell = (field: string, entity: any, index: number) => {
    switch (field) {
      case 'idx':
        return (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              minWidth: 26,
              height: 22,
              padding: '0 6px',
              borderRadius: radii.full,
              fontSize: '11px',
              fontWeight: 600,
              color: colors.textMuted,
              backgroundColor: colors.surfaceSunken,
            }}
          >
            {index + 1}
          </span>
        );

      case 'FirstName': {
        const titleDesc = entity.Title?.Description ? `${entity.Title.Description} ` : '';
        const fullName = `${titleDesc}${entity.FirstName || ''} ${entity.LastName || ''}`.trim() || '—';
        const initial = entity.FirstName ? entity.FirstName[0].toUpperCase() : 'P';
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: radii.full,
                backgroundColor: 'rgba(37, 99, 235, 0.1)',
                color: 'var(--hims-primary, #2563eb)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '13px',
                flexShrink: 0,
              }}
            >
              {initial}
            </div>
            <div>
              <div style={{ fontWeight: 600, color: colors.textMain, fontSize: '13px', letterSpacing: '-0.1px' }}>
                {fullName}
              </div>
            </div>
          </div>
        );
      }

      case 'Age': {
        const ageVal = entity.Age;
        const genderDesc = entity.Gender?.Description;
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontWeight: 500, color: colors.textBody, fontSize: '13px' }}>
              {ageVal ? `${ageVal} Yrs` : '—'}
            </span>
            {genderDesc && (
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  padding: '1px 6px',
                  borderRadius: radii.sm,
                  backgroundColor: colors.surfaceSunken,
                  color: colors.textMuted,
                  border: `1px solid ${colors.border}`,
                }}
              >
                {genderDesc}
              </span>
            )}
          </div>
        );
      }

      case 'MRN': {
        const mrnVal = entity.MRN;
        return mrnVal ? (
          <span
            style={{
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
              fontSize: '12px',
              fontWeight: 600,
              padding: '2px 8px',
              borderRadius: radii.sm,
              backgroundColor: '#f1f5f9',
              border: '1px solid #cbd5e1',
              color: '#0f172a',
              letterSpacing: '0.3px',
            }}
          >
            {mrnVal}
          </span>
        ) : (
          <span style={{ color: colors.textSubtle }}>—</span>
        );
      }

      case 'RegisteredDate': {
        const formattedDate = formatDateDDMMYYYY(entity.RegisteredDate);
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: colors.textBody }}>
            <i className="fa fa-calendar-o" style={{ fontSize: '12px', color: colors.textSubtle }} />
            <span>{formattedDate || '—'}</span>
          </div>
        );
      }

      case 'Referral.ReferralName': {
        const refName = resolveField(entity, 'Referral.ReferralName');
        return refName ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: colors.textBody }}>
            <i className="fa fa-user-md" style={{ fontSize: '13px', color: 'var(--hims-primary, #2563eb)' }} />
            <span style={{ fontWeight: 500 }}>{refName}</span>
          </div>
        ) : (
          <span style={{ color: colors.textSubtle }}>—</span>
        );
      }

      case 'CityMaster.CityName': {
        const cityName = resolveField(entity, 'CityMaster.CityName');
        return cityName ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: colors.textBody }}>
            <i className="fa fa-map-marker" style={{ fontSize: '13px', color: colors.textSubtle }} />
            <span>{cityName}</span>
          </div>
        ) : (
          <span style={{ color: colors.textSubtle }}>—</span>
        );
      }

      case 'PatientStatus.Description': {
        const statusDesc = resolveField(entity, 'PatientStatus.Description');
        return statusDesc ? (
          <Badge tone={toneForStatus(statusDesc)}>{statusDesc}</Badge>
        ) : (
          <Badge tone="success">Active</Badge>
        );
      }

      case 'Id':
        return (
          <Button
            size="xs"
            variant="light"
            icon="fa-pencil"
            onClick={() => dispatch('editRow', { Id: entity.Id, PatientId: entity.PatientId })}
            title="Edit Patient Registration"
            style={{
              borderColor: colors.border,
              boxShadow: shadows.xs,
              fontWeight: 600,
            }}
          >
            Edit
          </Button>
        );

      default: {
        const val = resolveField(entity, field);
        return <span style={{ fontSize: '13px', color: colors.textBody }}>{val !== undefined && val !== null ? String(val) : '—'}</span>;
      }
    }
  };

  const thStyle: React.CSSProperties = {
    textAlign: 'left',
    fontSize: '11px',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    color: colors.textMuted,
    padding: `${spacing.sm} ${spacing.md}`,
    borderBottom: `2px solid ${colors.border}`,
    backgroundColor: '#f8fafc',
    cursor: 'pointer',
    userSelect: 'none',
    whiteSpace: 'nowrap',
    fontFamily: typography.fontFamily,
    transition: 'background-color 0.15s ease',
  };

  const tdStyle: React.CSSProperties = {
    padding: `${spacing.sm} ${spacing.md}`,
    borderBottom: `1px solid ${colors.surfaceSunken}`,
    verticalAlign: 'middle',
    fontSize: '13px',
    color: colors.textMain,
    fontFamily: typography.fontFamily,
  };

  return (
    <div
      className="patientregistration-self-screen"
      style={{
        fontFamily: typography.fontFamily,
        padding: spacing.lg,
        display: 'flex',
        flexDirection: 'column',
        gap: spacing.lg,
        color: colors.textMain,
      }}
    >
      {/* ─────────────────────────────────────────────────────────────
          TOP PAGE HEADER & SEARCH BAR
          ───────────────────────────────────────────────────────────── */}
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
              width: 44,
              height: 44,
              borderRadius: radii.md,
              backgroundColor: 'rgba(37, 99, 235, 0.08)',
              color: 'var(--hims-primary, #2563eb)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px',
              flexShrink: 0,
            }}
          >
            <i className="fa fa-address-book" aria-hidden="true" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm }}>
              <h1
                style={{
                  fontSize: '20px',
                  fontWeight: 700,
                  color: colors.textMain,
                  margin: 0,
                  letterSpacing: '-0.3px',
                }}
              >
                Patient Registered
              </h1>
              <Badge tone="neutral">{totalItems} Total Records</Badge>
              {sortedData.length > 0 && sortedData.length !== totalItems && (
                <Badge tone="info">{sortedData.length} Shown</Badge>
              )}
            </div>
            <div style={{ fontSize: '13px', color: colors.textMuted, marginTop: '3px' }}>
              Search, filter, and review registered patient records, MRN history, and referrals
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm, flexWrap: 'wrap' }}>
          <Button
            variant="light"
            size="sm"
            icon="fa-refresh"
            onClick={() => dispatch('getList')}
            disabled={loading}
            title="Reload patients"
          >
            Refresh
          </Button>

          <div style={{ minWidth: 260 }}>
            <PatientSearchControl
              reactProps={{
                controlId: 'drhms-patinet-search-box',
                canDisable: false,
                tabIndex: 0,
                patientDisplay: patientDisplay,
                placeholder: 'Patient Name / Phone / UHID...',
              }}
              onSearch={onPatientSearch || (() => Promise.resolve([]))}
              onSelect={(patient) => onPatientSelect && onPatientSelect(patient)}
            />
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          FILTER CARD WITH TYPEAHEAD AND DATE SHORTCUTS
          ───────────────────────────────────────────────────────────── */}
      <Card
        padding="16px 20px"
        style={{
          backgroundColor: '#ffffff',
          borderRadius: radii.lg,
          boxShadow: shadows.xs,
          border: `1px solid ${colors.border}`,
        }}
      >
        {/* Filter Card Header Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: spacing.sm,
            marginBottom: spacing.md,
            paddingBottom: spacing.sm,
            borderBottom: `1px solid ${colors.surfaceSunken}`,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: spacing.xs, fontSize: '13px', fontWeight: 600, color: colors.textBody }}>
            <i className="fa fa-filter" style={{ color: 'var(--hims-primary, #2563eb)' }} />
            <span>Search & Filter Criteria</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: spacing.xs, flexWrap: 'wrap' }}>
            <span style={{ fontSize: '12px', color: colors.textSubtle, marginRight: '4px' }}>Quick Dates:</span>
            <Button size="xs" variant="light" onClick={() => applyQuickDate('today')}>
              Today
            </Button>
            <Button size="xs" variant="light" onClick={() => applyQuickDate('last7')}>
              Last 7 Days
            </Button>
            <Button size="xs" variant="light" onClick={() => applyQuickDate('month')}>
              This Month
            </Button>
            <div style={{ width: 1, height: 16, backgroundColor: colors.border, margin: `0 ${spacing.xs}` }} />
            <Button size="xs" variant="light" icon="fa-undo" onClick={handleResetFilters} title="Reset all filters">
              Reset
            </Button>
          </div>
        </div>

        {/* Filter Input Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
            gap: '14px 18px',
            alignItems: 'flex-end',
          }}
        >
          {/* Referral Doctor Typeahead */}
          <div ref={referralWrapperRef} style={{ position: 'relative' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.xs }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: colors.textBody }}>
                Referral Doctor
              </label>
              {referralQuery && (
                <span
                  onClick={clearReferral}
                  style={{ fontSize: '11px', color: 'var(--hims-primary, #2563eb)', cursor: 'pointer', fontWeight: 500 }}
                  title="Clear referral selection"
                >
                  Clear
                </span>
              )}
            </div>
            <div style={{ position: 'relative' }}>
              <Input
                value={referralQuery}
                onChange={(e) => handleReferralInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && (!referralQuery || referralQuery.length === 0)) {
                    dispatch('search');
                  }
                }}
                placeholder="Search Referral Doctor..."
                autoComplete="off"
              />
              {isSearchingReferral && (
                <div style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: colors.textSubtle }}>
                  <i className="fa fa-spinner fa-spin" style={{ fontSize: '12px' }} />
                </div>
              )}
            </div>

            {/* Typeahead Suggestions Popover */}
            {referralOpen && referralResults.length > 0 && (
              <ul
                style={{
                  display: 'block',
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  zIndex: zIndex.dropdown,
                  width: '100%',
                  maxHeight: 220,
                  overflowY: 'auto',
                  margin: '4px 0 0',
                  padding: `${spacing.xs} 0`,
                  listStyle: 'none',
                  backgroundColor: colors.surface,
                  border: `1px solid ${colors.border}`,
                  borderRadius: radii.md,
                  boxShadow: shadows.lg,
                  boxSizing: 'border-box',
                }}
              >
                {referralResults.map((r, i) => (
                  <li
                    key={r.Id || i}
                    onClick={() => selectReferral(r)}
                    style={{
                      cursor: 'pointer',
                      padding: `${spacing.sm} ${spacing.md}`,
                      fontSize: '13px',
                      fontFamily: typography.fontFamily,
                      color: colors.textMain,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      borderBottom: `1px solid ${colors.surfaceSunken}`,
                      transition: 'background-color 0.15s ease',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = colors.surfaceMuted; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: spacing.xs }}>
                      <i className="fa fa-user-md" style={{ color: 'var(--hims-primary, #2563eb)', fontSize: '13px' }} />
                      <span style={{ fontWeight: 600 }}>{r.ReferralName}</span>
                    </div>
                    {r.ReferralCode && (
                      <span
                        style={{
                          fontSize: '11px',
                          color: colors.textMuted,
                          padding: '1px 6px',
                          borderRadius: radii.sm,
                          backgroundColor: colors.surfaceSunken,
                        }}
                      >
                        {r.ReferralCode}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* From Date */}
          <div>
            <DatePicker
              label="From Date"
              value={toDateInputValue(currentfilter.FromDate)}
              onChange={(value) => dispatch('dateChange', { field: 'FromDate', value })}
            />
          </div>

          {/* To Date */}
          <div>
            <DatePicker
              label="To Date"
              value={toDateInputValue(currentfilter.ToDate)}
              onChange={(value) => dispatch('dateChange', { field: 'ToDate', value })}
            />
          </div>

          {/* MRN Type */}
          <div>
            <Select
              label="MRN Type"
              value={currentfilter.MRNTypeId ?? ''}
              onChange={(value) => dispatch('mrnTypeChange', { value: parseInt(String(value), 10) })}
              options={mrnTypeOptions.map((opt) => ({ value: opt.Id ?? '', label: opt.Text ?? '' }))}
            />
          </div>
        </div>
      </Card>

      {/* ─────────────────────────────────────────────────────────────
          MODERN DATA TABLE CARD
          ───────────────────────────────────────────────────────────── */}
      <Card
        padding="0"
        style={{
          borderRadius: radii.lg,
          boxShadow: shadows.xs,
          border: `1px solid ${colors.border}`,
          overflow: 'hidden',
          backgroundColor: '#ffffff',
        }}
      >
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr>
                {effectiveColumns.map((col) => {
                  const isSortable = col.field !== 'idx' && col.field !== 'Id';
                  const isSorted = sort && sort.field === col.field;
                  return (
                    <th
                      key={col.field}
                      onClick={() => isSortable && handleSort(col.field)}
                      style={{
                        ...thStyle,
                        cursor: isSortable ? 'pointer' : 'default',
                      }}
                      onMouseEnter={(e) => {
                        if (isSortable) e.currentTarget.style.backgroundColor = '#f1f5f9';
                      }}
                      onMouseLeave={(e) => {
                        if (isSortable) e.currentTarget.style.backgroundColor = '#f8fafc';
                      }}
                    >
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        <span>{col.displayName}</span>
                        {isSortable && (
                          <span style={{ fontSize: '11px', color: isSorted ? 'var(--hims-primary, #2563eb)' : colors.textSubtle }}>
                            {isSorted ? (
                              sort.order === 1 ? (
                                <i className="fa fa-sort-asc" />
                              ) : (
                                <i className="fa fa-sort-desc" />
                              )
                            ) : (
                              <i className="fa fa-sort" style={{ opacity: 0.4 }} />
                            )}
                          </span>
                        )}
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {sortedData.length === 0 ? (
                <tr>
                  <td colSpan={effectiveColumns.length || 1} style={{ padding: spacing.xxl, textAlign: 'center' }}>
                    <EmptyState
                      icon="fa fa-users-slash"
                      text="No Registered Patients Found"
                      subtext="No records match the selected date range or filter criteria. Try adjusting dates or resetting filters."
                      action={
                        <Button variant="light" size="sm" icon="fa-refresh" onClick={handleResetFilters}>
                          Reset Filters
                        </Button>
                      }
                    />
                  </td>
                </tr>
              ) : (
                sortedData.map((entity, index) => {
                  const isZebra = index % 2 === 1;
                  return (
                    <tr
                      key={entity.Id || index}
                      style={{
                        backgroundColor: isZebra ? 'rgba(248, 250, 252, 0.6)' : '#ffffff',
                        transition: 'background-color 0.15s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(37, 99, 235, 0.04)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = isZebra ? 'rgba(248, 250, 252, 0.6)' : '#ffffff';
                      }}
                    >
                      {effectiveColumns.map((col) => (
                        <td key={col.field} style={tdStyle}>
                          {renderCell(col.field, entity, index)}
                        </td>
                      ))}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ─────────────────────────────────────────────────────────────
          FOOTER TOOLBAR: ACTIONS & PAGINATION
          ───────────────────────────────────────────────────────────── */}
      <Card
        padding="12px 18px"
        style={{
          backgroundColor: '#ffffff',
          borderRadius: radii.lg,
          boxShadow: shadows.xs,
          border: `1px solid ${colors.border}`,
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: spacing.md,
          }}
        >
          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: spacing.sm, alignItems: 'center', flexWrap: 'wrap' }}>
            {context && (
              <Button
                variant="light"
                size="sm"
                icon="fa-arrow-left"
                onClick={() => dispatch('backtoReport')}
                title="Return to previous report"
              >
                Back
              </Button>
            )}
            <Button
              variant="light"
              size="sm"
              icon="fa-file-excel-o"
              onClick={() => dispatch('excelDownload')}
              title="Download results as CSV"
            >
              Export CSV
            </Button>
            {canShowPrint && (
              <Button
                variant="light"
                size="sm"
                icon="fa-print"
                onClick={() => dispatch('print')}
                title="Print patient list report"
              >
                Print
              </Button>
            )}
          </div>

          {/* Record Count Summary & Pager */}
          <div style={{ display: 'flex', alignItems: 'center', gap: spacing.md, flexWrap: 'wrap' }}>
            {totalItems > 0 && (
              <span style={{ fontSize: '13px', color: colors.textMuted }}>
                Showing <strong>{startItemIndex}</strong>–<strong>{endItemIndex}</strong> of{' '}
                <strong>{totalItems}</strong> patients
              </span>
            )}
            <div style={{ margin: 0 }}>
              <Pagination
                currentPage={currentPage}
                totalItems={totalItems}
                pageSize={pageSize}
                onPageChange={(page) => dispatch('pageChange', { page })}
              />
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
