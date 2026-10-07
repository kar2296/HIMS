import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';
import { colors, spacing, radii, shadows, typography, transitions } from '../components/ui/tokens';
import { sessionHelper } from '../services/sessionHelper';
import { apiFetch } from './utils/api';

// ─────────────────────────────────────────────────────────────
// Types & Interfaces
// ─────────────────────────────────────────────────────────────

export interface PatientInfo {
  Id?: number;
  FirstName?: string;
  LastName?: string;
  Mobile?: string;
  MRN?: string;
  Title?: { Description?: string; Id?: number };
}

export interface DoctorUserInfo {
  Id?: number;
  FirstName?: string;
  LastName?: string;
  UserName?: string;
  Title?: { Description?: string; Id?: number };
}

export interface AppointmentRecord {
  Id?: number;
  StartTime?: string;
  EndTime?: string;
  AppointmentDate?: string;
  AppointmentStatusId?: number;
  DoctorId?: number;
  FacilityId?: number;
  Patient?: PatientInfo;
  User?: DoctorUserInfo;
  [key: string]: any;
}

export interface DoctorSummaryItem {
  DoctorName: string;
  DoctorId?: number;
  Scheduled: number;
  Checkin: number;
  Checkout: number;
  Cancelled: number;
  Noshown: number;
  Total: number;
  FacilityDet?: number[];
}

export interface FacilityLookup {
  Id: number;
  Text: string;
}

export interface StatusCounts {
  TodayScheduledCount?: number | string;
  TodayCheckInCount?: number | string;
  TodayCancelledCount?: number | string;
  TodayNoShownCount?: number | string;
}

export interface AdminAppointmentDashboardScreenProps {
  reactProps?: {
    Items?: StatusCounts;
    todayscheduled?: AppointmentRecord[];
    todaycheckin?: AppointmentRecord[];
    todaycanceled?: AppointmentRecord[];
    todayonshown?: AppointmentRecord[];
    todayappsummary?: DoctorSummaryItem[];
    todaysummarycount?: Record<string, number>;
    monthappsummary?: DoctorSummaryItem[];
    monthsummarycount?: Record<string, number>;
    todaybranchsummary?: DoctorSummaryItem[];
    todaybranch_facility?: number[];
    todaybranchsummarycount?: { Total?: number };
    monthbranchsummary?: DoctorSummaryItem[];
    branch_facility?: number[];
    monthbranchsummarycount?: { Total?: number };
    lookup?: {
      Facility?: FacilityLookup[];
      [key: string]: any;
    };
    currentfilter?: {
      OrganizationId?: any;
      FacilityId?: number;
      FacilityName?: string;
      FromDate?: any;
      ToDate?: any;
    };
    loading?: boolean;
  };
  onAction?: (actionName: string, payload?: any) => void;
}

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

function getInitials(title?: string, first?: string, last?: string): string {
  const f = (first || '').trim().charAt(0);
  const l = (last || '').trim().charAt(0);
  if (f || l) return (f + l).toUpperCase();
  return (title || 'P').charAt(0).toUpperCase();
}

function formatFullName(title?: string, first?: string, last?: string): string {
  const parts = [title, first, last].filter(Boolean).map(s => String(s).trim());
  return parts.length ? parts.join(' ') : 'Unknown';
}

function formatDateToYMD(d: Date | string | null | undefined): string {
  if (!d) return '';
  const dateObj = typeof d === 'string' ? new Date(d) : d;
  if (isNaN(dateObj.getTime())) return '';
  const yyyy = dateObj.getFullYear();
  const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
  const dd = String(dateObj.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function formatDateDisplay(d: Date | string | null | undefined): string {
  if (!d) return '';
  const dateObj = typeof d === 'string' ? new Date(d) : d;
  if (isNaN(dateObj.getTime())) return '';
  return dateObj.toLocaleDateString('en-IN', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

const CHART_COLORS = {
  scheduled: '#3b82f6',
  checkin: '#10b981',
  checkout: '#06b6d4',
  cancelled: '#f43f5e',
  noshow: '#f59e0b',
  total: '#8b5cf6',
};

// ─────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────

export const AdminAppointmentDashboardScreen: React.FC<AdminAppointmentDashboardScreenProps> = ({
  reactProps,
  onAction
}) => {
  // Standalone states (used when running outside AngularJS bridge)
  const isBridgeMode = Boolean(reactProps);

  const [standaloneLookup, setStandaloneLookup] = useState<{ Facility: FacilityLookup[] }>({ Facility: [] });
  const [standaloneCounts, setStandaloneCounts] = useState<StatusCounts>({
    TodayScheduledCount: '0',
    TodayCheckInCount: '0',
    TodayCancelledCount: '0',
    TodayNoShownCount: '0',
  });
  const [standaloneScheduled, setStandaloneScheduled] = useState<AppointmentRecord[]>([]);
  const [standaloneCheckin, setStandaloneCheckin] = useState<AppointmentRecord[]>([]);
  const [standaloneCancelled, setStandaloneCancelled] = useState<AppointmentRecord[]>([]);
  const [standaloneNoShow, setStandaloneNoShow] = useState<AppointmentRecord[]>([]);
  const [standaloneTodayDocSummary, setStandaloneTodayDocSummary] = useState<DoctorSummaryItem[]>([]);
  const [standaloneTodayDocTotals, setStandaloneTodayDocTotals] = useState<Record<string, number>>({});
  const [standaloneMonthDocSummary, setStandaloneMonthDocSummary] = useState<DoctorSummaryItem[]>([]);
  const [standaloneMonthDocTotals, setStandaloneMonthDocTotals] = useState<Record<string, number>>({});
  const [standaloneTodayBranchSummary, setStandaloneTodayBranchSummary] = useState<DoctorSummaryItem[]>([]);
  const [standaloneTodayBranchFacility, setStandaloneTodayBranchFacility] = useState<number[]>([]);
  const [standaloneMonthBranchSummary, setStandaloneMonthBranchSummary] = useState<DoctorSummaryItem[]>([]);
  const [standaloneMonthBranchFacility, setStandaloneMonthBranchFacility] = useState<number[]>([]);
  const [standaloneLoading, setStandaloneLoading] = useState<boolean>(false);

  // Active filter state
  const initialFacilityId = reactProps?.currentfilter?.FacilityId !== undefined ? reactProps.currentfilter.FacilityId : -1;
  const [facilityFilter, setFacilityFilter] = useState<number>(initialFacilityId);
  const [selectedDate, setSelectedDate] = useState<string>(() => formatDateToYMD(new Date()));
  const [lastRefreshedAt, setLastRefreshedAt] = useState<string>(() => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
  const [isRotating, setIsRotating] = useState<boolean>(false);

  // UI view toggles
  const [mainView, setMainView] = useState<'overview' | 'doctors' | 'branches' | 'all'>('overview');
  const [queueDisplayMode, setQueueDisplayMode] = useState<'split' | 'tabbed'>('split');
  const [activeQueueTab, setActiveQueueTab] = useState<'scheduled' | 'checkin' | 'cancelled' | 'noshow'>('scheduled');
  const [queueSearchQuery, setQueueSearchQuery] = useState<string>('');
  const [doctorSummaryPeriod, setDoctorSummaryPeriod] = useState<'today' | 'month'>('today');
  const [branchSummaryPeriod, setBranchSummaryPeriod] = useState<'today' | 'month'>('today');
  const [doctorTableSearch, setDoctorTableSearch] = useState<string>('');

  // Selected appointment detail modal
  const [selectedAppointment, setSelectedAppointment] = useState<{ item: AppointmentRecord; type: string } | null>(null);

  // Synced data values
  const facilityList = useMemo(() => {
    const list = reactProps?.lookup?.Facility || standaloneLookup.Facility || [];
    // Ensure "All Facilities" option exists
    if (!list.some(f => f.Id === -1)) {
      return [{ Id: -1, Text: 'All Facilities / Branches' }, ...list];
    }
    return list;
  }, [reactProps?.lookup?.Facility, standaloneLookup.Facility]);

  const activeFacilities = useMemo(() => {
    return facilityList.filter(f => f.Id > 0);
  }, [facilityList]);

  const counts: StatusCounts = useMemo(() => {
    if (reactProps?.Items) {
      return {
        TodayScheduledCount: reactProps.Items.TodayScheduledCount ?? '0',
        TodayCheckInCount: reactProps.Items.TodayCheckInCount ?? '0',
        TodayCancelledCount: reactProps.Items.TodayCancelledCount ?? '0',
        TodayNoShownCount: reactProps.Items.TodayNoShownCount ?? '0',
      };
    }
    return standaloneCounts;
  }, [reactProps?.Items, standaloneCounts]);

  const scheduledList = reactProps?.todayscheduled || standaloneScheduled;
  const checkinList = reactProps?.todaycheckin || standaloneCheckin;
  const cancelledList = reactProps?.todaycanceled || standaloneCancelled;
  const noShowList = reactProps?.todayonshown || standaloneNoShow;

  const todayDocSummary = reactProps?.todayappsummary || standaloneTodayDocSummary;
  const todayDocTotals = reactProps?.todaysummarycount || standaloneTodayDocTotals;
  const monthDocSummary = reactProps?.monthappsummary || standaloneMonthDocSummary;
  const monthDocTotals = reactProps?.monthsummarycount || standaloneMonthDocTotals;

  const todayBranchSummary = reactProps?.todaybranchsummary || standaloneTodayBranchSummary;
  const todayBranchTotals = reactProps?.todaybranch_facility || standaloneTodayBranchFacility;
  const monthBranchSummary = reactProps?.monthbranchsummary || standaloneMonthBranchSummary;
  const monthBranchTotals = reactProps?.branch_facility || standaloneMonthBranchFacility;

  const isLoading = Boolean(reactProps?.loading || standaloneLoading);

  // Sync date/facility filter if reactProps updates from external
  useEffect(() => {
    if (reactProps?.currentfilter) {
      if (reactProps.currentfilter.FacilityId !== undefined) {
        setFacilityFilter(reactProps.currentfilter.FacilityId);
      }
      if (reactProps.currentfilter.FromDate) {
        setSelectedDate(formatDateToYMD(reactProps.currentfilter.FromDate));
      }
    }
  }, [reactProps?.currentfilter]);

  // ─────────────────────────────────────────────────────────────
  // Standalone Data Fetching Logic (Self-contained parity)
  // ─────────────────────────────────────────────────────────────

  const loadStandaloneFacilities = useCallback(async () => {
    try {
      const orgId = sessionHelper.getCurrentOrgId() || '1';
      const res = await apiFetch('General/Options/getoptions', [
        {
          Key: 'Facility',
          Request: {
            Params: [{ Key: 12, Value: orgId }]
          }
        }
      ]);
      if (res && res.Facility && Array.isArray(res.Facility)) {
        setStandaloneLookup({ Facility: res.Facility });
      }
    } catch (err) {
      console.warn('Failed to load standalone facilities:', err);
    }
  }, []);

  const loadStandaloneDashboardData = useCallback(async (facId: number, dateStr: string) => {
    setStandaloneLoading(true);
    try {
      const orgId = sessionHelper.getCurrentOrgId() || '1';
      const facilityIds: number[] = [];
      if (facId === -1) {
        activeFacilities.forEach(f => facilityIds.push(f.Id));
      } else {
        facilityIds.push(facId);
      }

      const fromTime = `${dateStr} 00:00:00`;
      const toTime = `${dateStr} 23:59:59`;

      const parsedDate = new Date(dateStr);
      const firstDay = new Date(parsedDate.getFullYear(), parsedDate.getMonth(), 1);
      const monthFromTime = `${formatDateToYMD(firstDay)} 00:00:00`;

      // 1. KPI Counts
      const countsRes = await apiFetch('Visit/DoctorDashboard/GetDashboardOptions', {
        Data: { Keys: [{ Key: 'appointment' }] },
        Attributes: {
          FacilityId: facilityIds,
          OrganizationId: orgId,
          FromDate: fromTime,
          ToDate: toTime,
        }
      });
      if (countsRes && countsRes.appointment) {
        setStandaloneCounts({
          TodayScheduledCount: countsRes.appointment.TodayScheduledCount || '0',
          TodayCheckInCount: countsRes.appointment.TodayCheckInCount || '0',
          TodayCancelledCount: countsRes.appointment.TodayCancelledCount || '0',
          TodayNoShownCount: countsRes.appointment.TodayNoShownCount || '0',
        });
      }

      // 2. Fetch Queues in Parallel
      const [scheduledRes, checkinRes, cancelledRes, noShowRes, todaySummaryRes, monthSummaryRes] = await Promise.all([
        // Scheduled (Key 7: 2)
        apiFetch('appointment/Appointment/GetDashboardAppointments', {
          Params: [
            { Key: 21, Value: facilityIds },
            { Key: 4, Value: 1 },
            { Key: 7, Value: 2 },
            { Key: 9, Value: fromTime },
            { Key: 10, Value: toTime },
          ]
        }),
        // Check-In (Key 7: 6)
        apiFetch('appointment/Appointment/GetDashboardAppointments', {
          Params: [
            { Key: 21, Value: facilityIds },
            { Key: 4, Value: 1 },
            { Key: 7, Value: 6 },
            { Key: 9, Value: fromTime },
            { Key: 10, Value: toTime },
          ]
        }),
        // Cancelled (Key 7: 5)
        apiFetch('appointment/Appointment/GetDashboardAppointments', {
          Params: [
            { Key: 21, Value: facilityIds },
            { Key: 4, Value: 1 },
            { Key: 7, Value: 5 },
            { Key: 9, Value: fromTime },
            { Key: 10, Value: toTime },
          ]
        }),
        // No Show (Key 7: 12)
        apiFetch('appointment/Appointment/GetDashboardAppointments', {
          Params: [
            { Key: 21, Value: facilityIds },
            { Key: 4, Value: 1 },
            { Key: 7, Value: 12 },
            { Key: 9, Value: fromTime },
            { Key: 10, Value: toTime },
          ],
          PageContext: { PageSize: 10000, PageNumber: 1 }
        }),
        // Today All Appointments for Doctor & Branch Summaries
        apiFetch('appointment/Appointment/GetDashboardAppointments', {
          Params: [
            { Key: 21, Value: facilityIds },
            { Key: 4, Value: 1 },
            { Key: 9, Value: fromTime },
            { Key: 10, Value: toTime },
          ],
          PageContext: { PageSize: 10000, PageNumber: 1 }
        }),
        // Month All Appointments
        apiFetch('appointment/Appointment/GetDashboardAppointments', {
          Params: [
            { Key: 21, Value: facilityIds },
            { Key: 4, Value: 1 },
            { Key: 9, Value: monthFromTime },
            { Key: 10, Value: toTime },
          ],
          PageContext: { PageSize: 10000, PageNumber: 1 }
        }),
      ]);

      setStandaloneScheduled(scheduledRes?.Data || []);
      setStandaloneCheckin(checkinRes?.Data || []);
      setStandaloneCancelled(cancelledRes?.Data || []);
      setStandaloneNoShow(noShowRes?.Data || []);

      // Group Today Doctor & Branch
      const todayAppointments: AppointmentRecord[] = todaySummaryRes?.Data || [];
      const groupedToday: Record<string, AppointmentRecord[]> = {};
      todayAppointments.forEach(item => {
        const docId = String(item.DoctorId || '0');
        if (!groupedToday[docId]) groupedToday[docId] = [];
        groupedToday[docId].push(item);
      });

      const todayDocList: DoctorSummaryItem[] = [];
      const todayBranchList: DoctorSummaryItem[] = [];

      Object.keys(groupedToday).forEach(docId => {
        const res = groupedToday[docId];
        const first = res[0];
        const docName = formatFullName(first.User?.Title?.Description, first.User?.FirstName, first.User?.LastName);
        const scheduled = res.filter(e => e.AppointmentStatusId === 2).length;
        const checkin = res.filter(e => e.AppointmentStatusId === 6).length;
        const checkout = res.filter(e => e.AppointmentStatusId === 11).length;
        const cancelled = res.filter(e => e.AppointmentStatusId === 5).length;
        const noshown = res.filter(e => e.AppointmentStatusId === 12).length;
        const total = scheduled + checkin + checkout + cancelled + noshown;

        todayDocList.push({
          DoctorName: docName,
          DoctorId: Number(docId),
          Scheduled: scheduled,
          Checkin: checkin,
          Checkout: checkout,
          Cancelled: cancelled,
          Noshown: noshown,
          Total: total,
        });

        const facCounts = activeFacilities.map(fac => res.filter(e => e.FacilityId === fac.Id).length);
        todayBranchList.push({
          DoctorName: docName,
          DoctorId: Number(docId),
          Scheduled: scheduled,
          Checkin: checkin,
          Checkout: checkout,
          Cancelled: cancelled,
          Noshown: noshown,
          Total: res.length,
          FacilityDet: facCounts,
        });
      });

      setStandaloneTodayDocSummary(todayDocList);
      setStandaloneTodayBranchSummary(todayBranchList);
      setStandaloneTodayDocTotals({
        Scheduled: todayAppointments.filter(e => e.AppointmentStatusId === 2).length,
        Checkin: todayAppointments.filter(e => e.AppointmentStatusId === 6).length,
        Checkout: todayAppointments.filter(e => e.AppointmentStatusId === 11).length,
        Cancelled: todayAppointments.filter(e => e.AppointmentStatusId === 5).length,
        Noshown: todayAppointments.filter(e => e.AppointmentStatusId === 12).length,
        Total: todayAppointments.length,
      });
      setStandaloneTodayBranchFacility(activeFacilities.map(fac => todayAppointments.filter(e => e.FacilityId === fac.Id).length));

      // Group Month Doctor & Branch
      const monthAppointments: AppointmentRecord[] = monthSummaryRes?.Data || [];
      const groupedMonth: Record<string, AppointmentRecord[]> = {};
      monthAppointments.forEach(item => {
        const docId = String(item.DoctorId || '0');
        if (!groupedMonth[docId]) groupedMonth[docId] = [];
        groupedMonth[docId].push(item);
      });

      const monthDocList: DoctorSummaryItem[] = [];
      const monthBranchList: DoctorSummaryItem[] = [];

      Object.keys(groupedMonth).forEach(docId => {
        const res = groupedMonth[docId];
        const first = res[0];
        const docName = formatFullName(first.User?.Title?.Description, first.User?.FirstName, first.User?.LastName);
        const scheduled = res.filter(e => e.AppointmentStatusId === 2).length;
        const checkin = res.filter(e => e.AppointmentStatusId === 6).length;
        const checkout = res.filter(e => e.AppointmentStatusId === 11).length;
        const cancelled = res.filter(e => e.AppointmentStatusId === 5).length;
        const noshown = res.filter(e => e.AppointmentStatusId === 12).length;
        const total = scheduled + checkin + checkout + cancelled + noshown;

        monthDocList.push({
          DoctorName: docName,
          DoctorId: Number(docId),
          Scheduled: scheduled,
          Checkin: checkin,
          Checkout: checkout,
          Cancelled: cancelled,
          Noshown: noshown,
          Total: total,
        });

        const facCounts = activeFacilities.map(fac => res.filter(e => e.FacilityId === fac.Id).length);
        monthBranchList.push({
          DoctorName: docName,
          DoctorId: Number(docId),
          Scheduled: scheduled,
          Checkin: checkin,
          Checkout: checkout,
          Cancelled: cancelled,
          Noshown: noshown,
          Total: res.length,
          FacilityDet: facCounts,
        });
      });

      setStandaloneMonthDocSummary(monthDocList);
      setStandaloneMonthBranchSummary(monthBranchList);
      setStandaloneMonthDocTotals({
        Scheduled: monthAppointments.filter(e => e.AppointmentStatusId === 2).length,
        Checkin: monthAppointments.filter(e => e.AppointmentStatusId === 6).length,
        Checkout: monthAppointments.filter(e => e.AppointmentStatusId === 11).length,
        Cancelled: monthAppointments.filter(e => e.AppointmentStatusId === 5).length,
        Noshown: monthAppointments.filter(e => e.AppointmentStatusId === 12).length,
        Total: monthAppointments.length,
      });
      setStandaloneMonthBranchFacility(activeFacilities.map(fac => monthAppointments.filter(e => e.FacilityId === fac.Id).length));

      setLastRefreshedAt(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    } catch (err) {
      console.warn('Dashboard data fetch error:', err);
    } finally {
      setStandaloneLoading(false);
    }
  }, [activeFacilities]);

  // Initial load for standalone mode
  useEffect(() => {
    if (!isBridgeMode) {
      loadStandaloneFacilities();
    }
  }, [isBridgeMode, loadStandaloneFacilities]);

  useEffect(() => {
    if (!isBridgeMode) {
      loadStandaloneDashboardData(facilityFilter, selectedDate);
    }
  }, [isBridgeMode, facilityFilter, selectedDate, loadStandaloneDashboardData]);

  // ─────────────────────────────────────────────────────────────
  // Action Handlers (Bridge or Standalone)
  // ─────────────────────────────────────────────────────────────

  const handleFacilityChange = (newFacId: number) => {
    setFacilityFilter(newFacId);
    if (onAction) {
      onAction('facilityFilterChange', { value: newFacId });
    } else {
      loadStandaloneDashboardData(newFacId, selectedDate);
    }
  };

  const handleDateChange = (newDateStr: string) => {
    setSelectedDate(newDateStr);
    if (onAction) {
      onAction('dateFilterChange', { date: newDateStr });
    } else {
      loadStandaloneDashboardData(facilityFilter, newDateStr);
    }
  };

  const handleRefresh = () => {
    setIsRotating(true);
    setTimeout(() => setIsRotating(false), 800);
    setLastRefreshedAt(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    if (onAction) {
      onAction('refresh');
    } else {
      loadStandaloneDashboardData(facilityFilter, selectedDate);
    }
  };

  const setQuickDate = (type: 'today' | 'yesterday' | 'tomorrow') => {
    const d = new Date();
    if (type === 'yesterday') d.setDate(d.getDate() - 1);
    if (type === 'tomorrow') d.setDate(d.getDate() + 1);
    const dateStr = formatDateToYMD(d);
    handleDateChange(dateStr);
  };

  // ─────────────────────────────────────────────────────────────
  // Filtered Queue Items
  // ─────────────────────────────────────────────────────────────

  const filterQueueItems = (items: AppointmentRecord[]) => {
    if (!queueSearchQuery.trim()) return items;
    const q = queueSearchQuery.toLowerCase().trim();
    return items.filter(item => {
      const pName = formatFullName(item.Patient?.Title?.Description, item.Patient?.FirstName, item.Patient?.LastName).toLowerCase();
      const dName = formatFullName(item.User?.Title?.Description, item.User?.FirstName, item.User?.LastName).toLowerCase();
      const phone = (item.Patient?.Mobile || '').toLowerCase();
      const time = (item.StartTime || '').toLowerCase();
      return pName.includes(q) || dName.includes(q) || phone.includes(q) || time.includes(q);
    });
  };

  const filteredScheduled = useMemo(() => filterQueueItems(scheduledList), [scheduledList, queueSearchQuery]);
  const filteredCheckin = useMemo(() => filterQueueItems(checkinList), [checkinList, queueSearchQuery]);
  const filteredCancelled = useMemo(() => filterQueueItems(cancelledList), [cancelledList, queueSearchQuery]);
  const filteredNoShow = useMemo(() => filterQueueItems(noShowList), [noShowList, queueSearchQuery]);

  // Filtered Doctor Summary
  const filteredDoctors = useMemo(() => {
    const list = doctorSummaryPeriod === 'today' ? todayDocSummary : monthDocSummary;
    if (!doctorTableSearch.trim()) return list;
    const q = doctorTableSearch.toLowerCase().trim();
    return list.filter(d => (d.DoctorName || '').toLowerCase().includes(q));
  }, [doctorSummaryPeriod, todayDocSummary, monthDocSummary, doctorTableSearch]);

  // Derived Performance Metrics
  const scheduledCountNum = Number(counts.TodayScheduledCount) || 0;
  const checkinCountNum = Number(counts.TodayCheckInCount) || 0;
  const cancelledCountNum = Number(counts.TodayCancelledCount) || 0;
  const noShowCountNum = Number(counts.TodayNoShownCount) || 0;
  const totalBookedToday = scheduledCountNum + checkinCountNum + cancelledCountNum + noShowCountNum;
  const turnoutRate = totalBookedToday > cancelledCountNum && (totalBookedToday - cancelledCountNum) > 0
    ? Math.round((checkinCountNum / (totalBookedToday - cancelledCountNum)) * 100)
    : 0;

  // Chart Data preparation
  const doctorChartData = useMemo(() => {
    return filteredDoctors.slice(0, 8).map(doc => ({
      name: doc.DoctorName.replace(/^(Dr\.|Doctor|Dr)\s+/i, '').slice(0, 14),
      scheduled: doc.Scheduled,
      checkin: doc.Checkin,
      checkout: doc.Checkout,
      cancelled: doc.Cancelled,
      noshow: doc.Noshown,
    }));
  }, [filteredDoctors]);

  const branchPieData = useMemo(() => {
    const list = branchSummaryPeriod === 'today' ? todayBranchTotals : monthBranchTotals;
    return activeFacilities.map((fac, idx) => ({
      name: fac.Text,
      value: list[idx] || 0,
      color: colors.chart[idx % colors.chart.length],
    })).filter(item => item.value > 0);
  }, [branchSummaryPeriod, todayBranchTotals, monthBranchTotals, activeFacilities]);

  // ─────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────

  return (
    <div
      style={{
        backgroundColor: colors.surfaceSunken,
        minHeight: '100vh',
        fontFamily: typography.fontFamily,
        color: colors.textMain,
        padding: `${spacing.lg} ${spacing.xl}`,
        display: 'flex',
        flexDirection: 'column',
        gap: spacing.lg,
      }}
    >
      {/* ── TOP EXECUTIVE BANNER & CONTROLS ── */}
      <div
        style={{
          background: `linear-gradient(135deg, ${colors.surface} 0%, #f8fafc 100%)`,
          borderRadius: radii.xl,
          border: `1px solid ${colors.border}`,
          boxShadow: shadows.md,
          padding: `${spacing.lg} ${spacing.xl}`,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Top vibrant brand bar */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: 'linear-gradient(90deg, #2563eb 0%, #4f46e5 35%, #06b6d4 70%, #10b981 100%)',
          }}
        />

        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: spacing.lg,
          }}
        >
          {/* Header titles */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm, marginBottom: '4px' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: radii.md,
                  background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  fontSize: '15px',
                  boxShadow: '0 2px 8px rgba(37,99,235,0.3)',
                }}
              >
                <i className="fa-solid fa-calendar-days" />
              </div>
              <h1
                style={{
                  margin: 0,
                  fontSize: '20px',
                  fontWeight: 800,
                  color: colors.textMain,
                  letterSpacing: '-0.3px',
                }}
              >
                Admin Appointment Dashboard
              </h1>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '3px 8px',
                  backgroundColor: '#ecfdf5',
                  border: '1px solid #a7f3d0',
                  borderRadius: radii.full,
                  fontSize: '11px',
                  fontWeight: 600,
                  color: '#065f46',
                }}
              >
                <span
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    backgroundColor: '#10b981',
                    boxShadow: '0 0 6px #10b981',
                  }}
                />
                Live Operations
              </div>
            </div>
            <p style={{ margin: 0, fontSize: '13px', color: colors.textMuted }}>
              Real-time clinical queues, doctor attendance, scheduled consultations & multi-branch distribution
            </p>
          </div>

          {/* Interactive Toolbar Controls */}
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: spacing.md }}>
            {/* Facility Branch Selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: spacing.xs }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: colors.textMuted }}>
                <i className="fa-solid fa-hospital" style={{ marginRight: '4px', color: colors.primary }} />
                Facility:
              </label>
              <select
                value={facilityFilter}
                onChange={(e) => handleFacilityChange(Number(e.target.value))}
                style={{
                  height: '36px',
                  padding: '0 12px',
                  borderRadius: radii.md,
                  border: `1px solid ${colors.border}`,
                  backgroundColor: colors.surface,
                  color: colors.textMain,
                  fontSize: '13px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  outline: 'none',
                  boxShadow: shadows.sm,
                  minWidth: '200px',
                }}
              >
                {facilityList.map(fac => (
                  <option key={fac.Id} value={fac.Id}>
                    {fac.Text}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: spacing.xs }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: colors.textMuted }}>
                <i className="fa-solid fa-calendar" style={{ marginRight: '4px', color: colors.primary }} />
                Date:
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => handleDateChange(e.target.value)}
                style={{
                  height: '36px',
                  padding: '0 10px',
                  borderRadius: radii.md,
                  border: `1px solid ${colors.border}`,
                  backgroundColor: colors.surface,
                  color: colors.textMain,
                  fontSize: '13px',
                  fontWeight: 500,
                  outline: 'none',
                  boxShadow: shadows.sm,
                  cursor: 'pointer',
                }}
              />
            </div>

            {/* Quick Date Pills */}
            <div
              style={{
                display: 'inline-flex',
                borderRadius: radii.md,
                border: `1px solid ${colors.border}`,
                backgroundColor: colors.surface,
                padding: '2px',
                boxShadow: shadows.sm,
              }}
            >
              {(['yesterday', 'today', 'tomorrow'] as const).map(type => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setQuickDate(type)}
                  style={{
                    padding: '4px 10px',
                    borderRadius: radii.sm,
                    border: 'none',
                    backgroundColor: 'transparent',
                    fontSize: '11px',
                    fontWeight: 600,
                    textTransform: 'capitalize',
                    color: colors.textMuted,
                    cursor: 'pointer',
                    transition: transitions.fast,
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = colors.primary)}
                  onMouseLeave={(e) => (e.currentTarget.style.color = colors.textMuted)}
                >
                  {type}
                </button>
              ))}
            </div>

            {/* Refresh Button */}
            <button
              type="button"
              onClick={handleRefresh}
              title="Refresh dashboard metrics"
              style={{
                height: '36px',
                padding: '0 14px',
                borderRadius: radii.md,
                border: `1px solid ${colors.primary}`,
                backgroundColor: colors.primaryLight,
                color: colors.primary,
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: transitions.base,
                boxShadow: shadows.sm,
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#dbeafe')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = colors.primaryLight)}
            >
              <i
                className="fa-solid fa-arrows-rotate"
                style={{
                  transition: 'transform 0.8s ease',
                  transform: isRotating ? 'rotate(360deg)' : 'none',
                }}
              />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Status ribbon: Last sync + Quick Summary */}
        <div
          style={{
            marginTop: spacing.md,
            paddingTop: spacing.sm,
            borderTop: `1px solid ${colors.border}`,
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '12px',
            color: colors.textSubtle,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: spacing.lg }}>
            <span>
              <i className="fa-regular fa-clock" style={{ marginRight: '4px' }} />
              Last updated: <strong style={{ color: colors.textMain }}>{lastRefreshedAt}</strong>
            </span>
            <span>
              Viewing date: <strong style={{ color: colors.textMain }}>{formatDateDisplay(selectedDate)}</strong>
            </span>
            <span>
              Total Bookings: <strong style={{ color: colors.primary }}>{totalBookedToday}</strong>
            </span>
            <span>
              Show-up Rate: <strong style={{ color: '#059669' }}>{turnoutRate}%</strong>
            </span>
          </div>

          {isLoading && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: colors.primary }}>
              <i className="fa-solid fa-circle-notch fa-spin" />
              <span>Fetching live appointments...</span>
            </div>
          )}
        </div>
      </div>

      {/* ── 4 PRIMARY KPI METRIC CARDS ── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: spacing.lg,
        }}
      >
        {/* 1. Scheduled Card */}
        <div
          onClick={() => { setMainView('overview'); setQueueDisplayMode('tabbed'); setActiveQueueTab('scheduled'); }}
          style={{
            background: colors.surface,
            borderRadius: radii.xl,
            border: `1px solid #bfdbfe`,
            boxShadow: shadows.md,
            padding: spacing.lg,
            position: 'relative',
            overflow: 'hidden',
            cursor: 'pointer',
            transition: transitions.base,
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-3px)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
        >
          <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: '4px', backgroundColor: '#2563eb' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: radii.lg,
                backgroundColor: '#eff6ff',
                color: '#2563eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '20px',
              }}
            >
              <i className="fa-solid fa-calendar-check" />
            </div>
            <span
              style={{
                padding: '2px 8px',
                borderRadius: radii.full,
                backgroundColor: '#eff6ff',
                color: '#1d4ed8',
                fontSize: '11px',
                fontWeight: 700,
              }}
            >
              Confirmed
            </span>
          </div>
          <div style={{ marginTop: spacing.md }}>
            <div style={{ fontSize: '32px', fontWeight: 800, color: colors.textMain, lineHeight: 1 }}>
              {counts.TodayScheduledCount}
            </div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: '#1e40af', marginTop: '6px' }}>
              Today Scheduled
            </div>
            <div style={{ fontSize: '12px', color: colors.textMuted, marginTop: '2px' }}>
              Patients queued for consultation
            </div>
          </div>
        </div>

        {/* 2. Check-In Card */}
        <div
          onClick={() => { setMainView('overview'); setQueueDisplayMode('tabbed'); setActiveQueueTab('checkin'); }}
          style={{
            background: colors.surface,
            borderRadius: radii.xl,
            border: `1px solid #a7f3d0`,
            boxShadow: shadows.md,
            padding: spacing.lg,
            position: 'relative',
            overflow: 'hidden',
            cursor: 'pointer',
            transition: transitions.base,
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-3px)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
        >
          <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: '4px', backgroundColor: '#059669' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: radii.lg,
                backgroundColor: '#ecfdf5',
                color: '#059669',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '20px',
              }}
            >
              <i className="fa-solid fa-user-check" />
            </div>
            <span
              style={{
                padding: '2px 8px',
                borderRadius: radii.full,
                backgroundColor: '#ecfdf5',
                color: '#047857',
                fontSize: '11px',
                fontWeight: 700,
              }}
            >
              Arrived
            </span>
          </div>
          <div style={{ marginTop: spacing.md }}>
            <div style={{ fontSize: '32px', fontWeight: 800, color: colors.textMain, lineHeight: 1 }}>
              {counts.TodayCheckInCount}
            </div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: '#065f46', marginTop: '6px' }}>
              Today Check-In
            </div>
            <div style={{ fontSize: '12px', color: colors.textMuted, marginTop: '2px' }}>
              In clinic waiting area / in-consult
            </div>
          </div>
        </div>

        {/* 3. Cancelled Card */}
        <div
          onClick={() => { setMainView('overview'); setQueueDisplayMode('tabbed'); setActiveQueueTab('cancelled'); }}
          style={{
            background: colors.surface,
            borderRadius: radii.xl,
            border: `1px solid #fecaca`,
            boxShadow: shadows.md,
            padding: spacing.lg,
            position: 'relative',
            overflow: 'hidden',
            cursor: 'pointer',
            transition: transitions.base,
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-3px)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
        >
          <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: '4px', backgroundColor: '#e11d48' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: radii.lg,
                backgroundColor: '#fff1f2',
                color: '#e11d48',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '20px',
              }}
            >
              <i className="fa-solid fa-calendar-xmark" />
            </div>
            <span
              style={{
                padding: '2px 8px',
                borderRadius: radii.full,
                backgroundColor: '#fff1f2',
                color: '#be123c',
                fontSize: '11px',
                fontWeight: 700,
              }}
            >
              Voided
            </span>
          </div>
          <div style={{ marginTop: spacing.md }}>
            <div style={{ fontSize: '32px', fontWeight: 800, color: colors.textMain, lineHeight: 1 }}>
              {counts.TodayCancelledCount}
            </div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: '#9f1239', marginTop: '6px' }}>
              Today Cancelled
            </div>
            <div style={{ fontSize: '12px', color: colors.textMuted, marginTop: '2px' }}>
              Cancelled by doctor or patient
            </div>
          </div>
        </div>

        {/* 4. No Show Card */}
        <div
          onClick={() => { setMainView('overview'); setQueueDisplayMode('tabbed'); setActiveQueueTab('noshow'); }}
          style={{
            background: colors.surface,
            borderRadius: radii.xl,
            border: `1px solid #fde68a`,
            boxShadow: shadows.md,
            padding: spacing.lg,
            position: 'relative',
            overflow: 'hidden',
            cursor: 'pointer',
            transition: transitions.base,
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-3px)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
        >
          <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: '4px', backgroundColor: '#d97706' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: radii.lg,
                backgroundColor: '#fffbeb',
                color: '#d97706',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '20px',
              }}
            >
              <i className="fa-solid fa-user-slash" />
            </div>
            <span
              style={{
                padding: '2px 8px',
                borderRadius: radii.full,
                backgroundColor: '#fffbeb',
                color: '#b45309',
                fontSize: '11px',
                fontWeight: 700,
              }}
            >
              Absent
            </span>
          </div>
          <div style={{ marginTop: spacing.md }}>
            <div style={{ fontSize: '32px', fontWeight: 800, color: colors.textMain, lineHeight: 1 }}>
              {counts.TodayNoShownCount}
            </div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: '#92400e', marginTop: '6px' }}>
              Today No Show
            </div>
            <div style={{ fontSize: '12px', color: colors.textMuted, marginTop: '2px' }}>
              Missed scheduled slot time
            </div>
          </div>
        </div>
      </div>

      {/* ── MAIN DASHBOARD VIEW NAVIGATOR TABS ── */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: `1px solid ${colors.border}`,
          paddingBottom: spacing.sm,
          gap: spacing.md,
        }}
      >
        <div style={{ display: 'flex', gap: spacing.sm }}>
          {[
            { id: 'overview', label: 'Appointment Queues', icon: 'fa-list-check' },
            { id: 'doctors', label: 'Doctor Workload Summary', icon: 'fa-user-doctor' },
            { id: 'branches', label: 'Branch Distribution', icon: 'fa-network-wired' },
            { id: 'all', label: 'Executive Full View', icon: 'fa-chart-pie' },
          ].map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setMainView(tab.id as any)}
              style={{
                padding: '8px 16px',
                borderRadius: radii.lg,
                border: 'none',
                backgroundColor: mainView === tab.id ? colors.primary : 'transparent',
                color: mainView === tab.id ? '#ffffff' : colors.textMuted,
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: transitions.base,
                boxShadow: mainView === tab.id ? '0 2px 8px rgba(37,99,235,0.3)' : 'none',
              }}
            >
              <i className={`fa-solid ${tab.icon}`} />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Search across queues input */}
        <div style={{ position: 'relative', width: '280px' }}>
          <input
            type="text"
            placeholder="Search patient, doctor, phone..."
            value={queueSearchQuery}
            onChange={(e) => setQueueSearchQuery(e.target.value)}
            style={{
              width: '100%',
              height: '36px',
              padding: '0 32px 0 34px',
              borderRadius: radii.full,
              border: `1px solid ${colors.border}`,
              backgroundColor: colors.surface,
              fontSize: '12px',
              outline: 'none',
              boxShadow: shadows.sm,
            }}
          />
          <i
            className="fa-solid fa-magnifying-glass"
            style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: colors.textSubtle,
              fontSize: '12px',
            }}
          />
          {queueSearchQuery && (
            <button
              type="button"
              onClick={() => setQueueSearchQuery('')}
              style={{
                position: 'absolute',
                right: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                color: colors.textSubtle,
                cursor: 'pointer',
                fontSize: '12px',
              }}
            >
              <i className="fa-solid fa-xmark" />
            </button>
          )}
        </div>
      </div>

      {/* ── SECTION 1: APPOINTMENT QUEUES (OVERVIEW & ALL) ── */}
      {(mainView === 'overview' || mainView === 'all') && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.md }}>
          {/* Controls Bar for Queues */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: spacing.md,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm }}>
              <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: colors.textMain }}>
                Today's Appointment Queues
              </h2>
              <span style={{ fontSize: '12px', color: colors.textMuted }}>
                ({totalBookedToday} appointments total)
              </span>
            </div>

            {/* Split / Tabbed View Mode Toggle */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: colors.surface,
                borderRadius: radii.md,
                border: `1px solid ${colors.border}`,
                padding: '2px',
              }}
            >
              <button
                type="button"
                onClick={() => setQueueDisplayMode('split')}
                style={{
                  padding: '4px 12px',
                  borderRadius: radii.sm,
                  border: 'none',
                  backgroundColor: queueDisplayMode === 'split' ? colors.primaryLight : 'transparent',
                  color: queueDisplayMode === 'split' ? colors.primary : colors.textMuted,
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                }}
              >
                <i className="fa-solid fa-table-cells-large" />
                <span>4-Grid View</span>
              </button>
              <button
                type="button"
                onClick={() => setQueueDisplayMode('tabbed')}
                style={{
                  padding: '4px 12px',
                  borderRadius: radii.sm,
                  border: 'none',
                  backgroundColor: queueDisplayMode === 'tabbed' ? colors.primaryLight : 'transparent',
                  color: queueDisplayMode === 'tabbed' ? colors.primary : colors.textMuted,
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                }}
              >
                <i className="fa-solid fa-folder-open" />
                <span>Focused Tab View</span>
              </button>
            </div>
          </div>

          {/* Queue Tab selector when in Tabbed Mode */}
          {queueDisplayMode === 'tabbed' && (
            <div style={{ display: 'flex', gap: spacing.sm, borderBottom: `1px solid ${colors.border}` }}>
              {[
                { id: 'scheduled', label: 'Today Scheduled', count: filteredScheduled.length, color: '#2563eb' },
                { id: 'checkin', label: 'Today Check-In', count: filteredCheckin.length, color: '#059669' },
                { id: 'cancelled', label: 'Today Cancelled', count: filteredCancelled.length, color: '#e11d48' },
                { id: 'noshow', label: 'Today No Show', count: filteredNoShow.length, color: '#d97706' },
              ].map(tab => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveQueueTab(tab.id as any)}
                  style={{
                    padding: '8px 16px',
                    border: 'none',
                    borderBottom: activeQueueTab === tab.id ? `3px solid ${tab.color}` : '3px solid transparent',
                    backgroundColor: 'transparent',
                    color: activeQueueTab === tab.id ? tab.color : colors.textMuted,
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <span>{tab.label}</span>
                  <span
                    style={{
                      padding: '1px 6px',
                      borderRadius: radii.full,
                      backgroundColor: activeQueueTab === tab.id ? `${tab.color}18` : colors.surfaceSunken,
                      color: activeQueueTab === tab.id ? tab.color : colors.textSubtle,
                      fontSize: '11px',
                    }}
                  >
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* Render Queue Tables */}
          {queueDisplayMode === 'split' ? (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(440px, 1fr))',
                gap: spacing.lg,
              }}
            >
              <QueueTableCard
                title="Today Scheduled"
                count={filteredScheduled.length}
                icon="fa-calendar-check"
                color="#2563eb"
                badgeText="Scheduled"
                items={filteredScheduled}
                onSelect={(item) => setSelectedAppointment({ item, type: 'Scheduled' })}
                onViewProfile={(item) => {
                  if (item.Patient?.Id && onAction) onAction('viewPatient', { patientId: item.Patient.Id });
                }}
              />
              <QueueTableCard
                title="Today Check-In"
                count={filteredCheckin.length}
                icon="fa-user-check"
                color="#059669"
                badgeText="Checked In"
                items={filteredCheckin}
                onSelect={(item) => setSelectedAppointment({ item, type: 'Checked In' })}
                onViewProfile={(item) => {
                  if (item.Patient?.Id && onAction) onAction('viewPatient', { patientId: item.Patient.Id });
                }}
              />
              <QueueTableCard
                title="Today Cancelled"
                count={filteredCancelled.length}
                icon="fa-calendar-xmark"
                color="#e11d48"
                badgeText="Cancelled"
                items={filteredCancelled}
                onSelect={(item) => setSelectedAppointment({ item, type: 'Cancelled' })}
                onViewProfile={(item) => {
                  if (item.Patient?.Id && onAction) onAction('viewPatient', { patientId: item.Patient.Id });
                }}
              />
              <QueueTableCard
                title="Today No Show"
                count={filteredNoShow.length}
                icon="fa-user-slash"
                color="#d97706"
                badgeText="No Show"
                items={filteredNoShow}
                onSelect={(item) => setSelectedAppointment({ item, type: 'No Show' })}
                onViewProfile={(item) => {
                  if (item.Patient?.Id && onAction) onAction('viewPatient', { patientId: item.Patient.Id });
                }}
              />
            </div>
          ) : (
            <div>
              {activeQueueTab === 'scheduled' && (
                <QueueTableCard
                  title="Today Scheduled"
                  count={filteredScheduled.length}
                  icon="fa-calendar-check"
                  color="#2563eb"
                  badgeText="Scheduled"
                  items={filteredScheduled}
                  fullWidth
                  onSelect={(item) => setSelectedAppointment({ item, type: 'Scheduled' })}
                  onViewProfile={(item) => {
                    if (item.Patient?.Id && onAction) onAction('viewPatient', { patientId: item.Patient.Id });
                  }}
                />
              )}
              {activeQueueTab === 'checkin' && (
                <QueueTableCard
                  title="Today Check-In"
                  count={filteredCheckin.length}
                  icon="fa-user-check"
                  color="#059669"
                  badgeText="Checked In"
                  items={filteredCheckin}
                  fullWidth
                  onSelect={(item) => setSelectedAppointment({ item, type: 'Checked In' })}
                  onViewProfile={(item) => {
                    if (item.Patient?.Id && onAction) onAction('viewPatient', { patientId: item.Patient.Id });
                  }}
                />
              )}
              {activeQueueTab === 'cancelled' && (
                <QueueTableCard
                  title="Today Cancelled"
                  count={filteredCancelled.length}
                  icon="fa-calendar-xmark"
                  color="#e11d48"
                  badgeText="Cancelled"
                  items={filteredCancelled}
                  fullWidth
                  onSelect={(item) => setSelectedAppointment({ item, type: 'Cancelled' })}
                  onViewProfile={(item) => {
                    if (item.Patient?.Id && onAction) onAction('viewPatient', { patientId: item.Patient.Id });
                  }}
                />
              )}
              {activeQueueTab === 'noshow' && (
                <QueueTableCard
                  title="Today No Show"
                  count={filteredNoShow.length}
                  icon="fa-user-slash"
                  color="#d97706"
                  badgeText="No Show"
                  items={filteredNoShow}
                  fullWidth
                  onSelect={(item) => setSelectedAppointment({ item, type: 'No Show' })}
                  onViewProfile={(item) => {
                    if (item.Patient?.Id && onAction) onAction('viewPatient', { patientId: item.Patient.Id });
                  }}
                />
              )}
            </div>
          )}
        </div>
      )}

      {/* ── SECTION 2: DOCTOR WORKLOAD SUMMARY ── */}
      {(mainView === 'doctors' || mainView === 'all') && (
        <div
          style={{
            background: colors.surface,
            borderRadius: radii.xl,
            border: `1px solid ${colors.border}`,
            boxShadow: shadows.md,
            padding: spacing.xl,
            display: 'flex',
            flexDirection: 'column',
            gap: spacing.lg,
          }}
        >
          {/* Section Header */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: spacing.md,
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm }}>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: radii.md,
                    backgroundColor: '#ede9fe',
                    color: '#7c3aed',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '15px',
                  }}
                >
                  <i className="fa-solid fa-stethoscope" />
                </div>
                <h2 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: colors.textMain }}>
                  Doctor Appointment Workload Summary
                </h2>
              </div>
              <p style={{ margin: '2px 0 0 0', fontSize: '13px', color: colors.textMuted }}>
                Consultations, check-ins, check-outs, cancellations, and no-shows categorized per physician
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: spacing.md }}>
              {/* Today vs Monthly toggle */}
              <div
                style={{
                  display: 'inline-flex',
                  backgroundColor: colors.surfaceSunken,
                  borderRadius: radii.md,
                  padding: '2px',
                  border: `1px solid ${colors.border}`,
                }}
              >
                <button
                  type="button"
                  onClick={() => setDoctorSummaryPeriod('today')}
                  style={{
                    padding: '5px 14px',
                    borderRadius: radii.sm,
                    border: 'none',
                    backgroundColor: doctorSummaryPeriod === 'today' ? colors.primary : 'transparent',
                    color: doctorSummaryPeriod === 'today' ? '#ffffff' : colors.textMuted,
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: transitions.fast,
                  }}
                >
                  Today's Summary
                </button>
                <button
                  type="button"
                  onClick={() => setDoctorSummaryPeriod('month')}
                  style={{
                    padding: '5px 14px',
                    borderRadius: radii.sm,
                    border: 'none',
                    backgroundColor: doctorSummaryPeriod === 'month' ? colors.primary : 'transparent',
                    color: doctorSummaryPeriod === 'month' ? '#ffffff' : colors.textMuted,
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: transitions.fast,
                  }}
                >
                  Monthly Summary
                </button>
              </div>

              {/* Filter doctor name */}
              <input
                type="text"
                placeholder="Filter doctor..."
                value={doctorTableSearch}
                onChange={(e) => setDoctorTableSearch(e.target.value)}
                style={{
                  height: '32px',
                  padding: '0 10px',
                  borderRadius: radii.md,
                  border: `1px solid ${colors.border}`,
                  fontSize: '12px',
                  outline: 'none',
                }}
              />
            </div>
          </div>

          {/* Doctor Workload Stacked Chart */}
          {doctorChartData.length > 0 && (
            <div
              style={{
                padding: spacing.md,
                backgroundColor: colors.surfaceSunken,
                borderRadius: radii.lg,
                border: `1px solid ${colors.border}`,
              }}
            >
              <div style={{ fontSize: '12px', fontWeight: 700, color: colors.textMuted, marginBottom: spacing.sm }}>
                <i className="fa-solid fa-chart-column" style={{ marginRight: '6px', color: colors.primary }} />
                Physician Workload Breakdown ({doctorSummaryPeriod === 'today' ? 'Today' : 'Month to Date'})
              </div>
              <div style={{ height: '220px', width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={doctorChartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                    <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
                    <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                    <RechartsTooltip
                      contentStyle={{
                        backgroundColor: '#ffffff',
                        border: '1px solid #cbd5e1',
                        borderRadius: '8px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                        fontSize: '12px',
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '6px' }} />
                    <Bar dataKey="scheduled" name="Scheduled" fill={CHART_COLORS.scheduled} stackId="a" radius={[0, 0, 0, 0]} />
                    <Bar dataKey="checkin" name="Checked In" fill={CHART_COLORS.checkin} stackId="a" radius={[0, 0, 0, 0]} />
                    <Bar dataKey="checkout" name="Checked Out" fill={CHART_COLORS.checkout} stackId="a" radius={[0, 0, 0, 0]} />
                    <Bar dataKey="cancelled" name="Cancelled" fill={CHART_COLORS.cancelled} stackId="a" radius={[0, 0, 0, 0]} />
                    <Bar dataKey="noshow" name="No Show" fill={CHART_COLORS.noshow} stackId="a" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Doctor Summary Table */}
          <div
            style={{
              overflowX: 'auto',
              borderRadius: radii.lg,
              border: `1px solid ${colors.border}`,
            }}
          >
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
              <thead>
                <tr style={{ backgroundColor: '#f1f5f9', borderBottom: `2px solid ${colors.border}` }}>
                  <th style={{ padding: '10px 14px', fontWeight: 700, color: colors.textMain }}>Doctor Name</th>
                  <th style={{ padding: '10px 14px', fontWeight: 700, color: '#1d4ed8', textAlign: 'center' }}>Scheduled</th>
                  <th style={{ padding: '10px 14px', fontWeight: 700, color: '#047857', textAlign: 'center' }}>Check-In</th>
                  <th style={{ padding: '10px 14px', fontWeight: 700, color: '#0e7490', textAlign: 'center' }}>Check-Out</th>
                  <th style={{ padding: '10px 14px', fontWeight: 700, color: '#be123c', textAlign: 'center' }}>Cancelled</th>
                  <th style={{ padding: '10px 14px', fontWeight: 700, color: '#b45309', textAlign: 'center' }}>No Show</th>
                  <th style={{ padding: '10px 14px', fontWeight: 800, color: colors.textMain, textAlign: 'center' }}>Total</th>
                  <th style={{ padding: '10px 14px', fontWeight: 700, color: colors.textMuted, width: '160px' }}>Completion</th>
                </tr>
              </thead>
              <tbody>
                {filteredDoctors.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ padding: '30px', textAlign: 'center', color: colors.textSubtle }}>
                      <i className="fa-regular fa-folder-open" style={{ fontSize: '24px', marginBottom: '8px', display: 'block' }} />
                      No doctor appointments found for this period
                    </td>
                  </tr>
                ) : (
                  filteredDoctors.map((doc, idx) => {
                    const completeRate = doc.Total > 0
                      ? Math.round(((doc.Checkin + doc.Checkout) / doc.Total) * 100)
                      : 0;

                    return (
                      <tr
                        key={idx}
                        style={{
                          borderBottom: `1px solid ${colors.border}`,
                          backgroundColor: idx % 2 === 0 ? colors.surface : '#fafafa',
                          transition: transitions.fast,
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f0fdf4')}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = idx % 2 === 0 ? colors.surface : '#fafafa')}
                      >
                        <td style={{ padding: '10px 14px', fontWeight: 600, color: colors.textMain }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div
                              style={{
                                width: '28px',
                                height: '28px',
                                borderRadius: radii.full,
                                backgroundColor: '#e0e7ff',
                                color: '#4338ca',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '11px',
                                fontWeight: 700,
                              }}
                            >
                              {getInitials('', doc.DoctorName)}
                            </div>
                            <span>{doc.DoctorName}</span>
                          </div>
                        </td>
                        <td style={{ padding: '10px 14px', textAlign: 'center', fontWeight: 600, color: '#2563eb' }}>
                          <span style={{ padding: '2px 8px', borderRadius: radii.full, backgroundColor: '#eff6ff' }}>
                            {doc.Scheduled}
                          </span>
                        </td>
                        <td style={{ padding: '10px 14px', textAlign: 'center', fontWeight: 600, color: '#059669' }}>
                          <span style={{ padding: '2px 8px', borderRadius: radii.full, backgroundColor: '#ecfdf5' }}>
                            {doc.Checkin}
                          </span>
                        </td>
                        <td style={{ padding: '10px 14px', textAlign: 'center', fontWeight: 600, color: '#0891b2' }}>
                          <span style={{ padding: '2px 8px', borderRadius: radii.full, backgroundColor: '#ecfeff' }}>
                            {doc.Checkout}
                          </span>
                        </td>
                        <td style={{ padding: '10px 14px', textAlign: 'center', fontWeight: 600, color: '#e11d48' }}>
                          <span style={{ padding: '2px 8px', borderRadius: radii.full, backgroundColor: '#fff1f2' }}>
                            {doc.Cancelled}
                          </span>
                        </td>
                        <td style={{ padding: '10px 14px', textAlign: 'center', fontWeight: 600, color: '#d97706' }}>
                          <span style={{ padding: '2px 8px', borderRadius: radii.full, backgroundColor: '#fffbeb' }}>
                            {doc.Noshown}
                          </span>
                        </td>
                        <td style={{ padding: '10px 14px', textAlign: 'center', fontWeight: 800, color: colors.textMain }}>
                          <span style={{ padding: '3px 10px', borderRadius: radii.full, backgroundColor: '#f1f5f9' }}>
                            {doc.Total}
                          </span>
                        </td>
                        <td style={{ padding: '10px 14px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div
                              style={{
                                flex: 1,
                                height: '6px',
                                backgroundColor: '#e2e8f0',
                                borderRadius: radii.full,
                                overflow: 'hidden',
                              }}
                            >
                              <div
                                style={{
                                  width: `${completeRate}%`,
                                  height: '100%',
                                  backgroundColor: completeRate >= 80 ? '#10b981' : completeRate >= 50 ? '#3b82f6' : '#f59e0b',
                                  borderRadius: radii.full,
                                }}
                              />
                            </div>
                            <span style={{ fontSize: '11px', fontWeight: 600, color: colors.textMuted, width: '30px' }}>
                              {completeRate}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
              <tfoot>
                {(() => {
                  const totals = doctorSummaryPeriod === 'today' ? todayDocTotals : monthDocTotals;
                  return (
                    <tr
                      style={{
                        backgroundColor: '#f8fafc',
                        borderTop: `2px solid ${colors.border}`,
                        fontWeight: 800,
                      }}
                    >
                      <td style={{ padding: '12px 14px', color: colors.textMain }}>
                        <i className="fa-solid fa-calculator" style={{ marginRight: '6px', color: colors.primary }} />
                        Summary Total ({filteredDoctors.length} Doctors)
                      </td>
                      <td style={{ padding: '12px 14px', textAlign: 'center', color: '#1d4ed8' }}>
                        {totals.Scheduled ?? 0}
                      </td>
                      <td style={{ padding: '12px 14px', textAlign: 'center', color: '#047857' }}>
                        {totals.Checkin ?? 0}
                      </td>
                      <td style={{ padding: '12px 14px', textAlign: 'center', color: '#0e7490' }}>
                        {totals.Checkout ?? 0}
                      </td>
                      <td style={{ padding: '12px 14px', textAlign: 'center', color: '#be123c' }}>
                        {totals.Cancelled ?? 0}
                      </td>
                      <td style={{ padding: '12px 14px', textAlign: 'center', color: '#b45309' }}>
                        {totals.Noshown ?? 0}
                      </td>
                      <td style={{ padding: '12px 14px', textAlign: 'center', color: colors.textMain, fontSize: '15px' }}>
                        {totals.Total ?? 0}
                      </td>
                      <td style={{ padding: '12px 14px', color: colors.textMuted, fontSize: '11px' }}>
                        Period Totals
                      </td>
                    </tr>
                  );
                })()}
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* ── SECTION 3: MULTI-BRANCH DISTRIBUTION SUMMARY ── */}
      {(mainView === 'branches' || mainView === 'all') && (
        <div
          style={{
            background: colors.surface,
            borderRadius: radii.xl,
            border: `1px solid ${colors.border}`,
            boxShadow: shadows.md,
            padding: spacing.xl,
            display: 'flex',
            flexDirection: 'column',
            gap: spacing.lg,
          }}
        >
          {/* Section Header */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: spacing.md,
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm }}>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: radii.md,
                    backgroundColor: '#e0f2fe',
                    color: '#0284c7',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '15px',
                  }}
                >
                  <i className="fa-solid fa-hospital-user" />
                </div>
                <h2 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: colors.textMain }}>
                  Branch Appointment Distribution
                </h2>
              </div>
              <p style={{ margin: '2px 0 0 0', fontSize: '13px', color: colors.textMuted }}>
                Cross-facility appointment allocation across all active hospital branches
              </p>
            </div>

            {/* Today vs Monthly toggle */}
            <div
              style={{
                display: 'inline-flex',
                backgroundColor: colors.surfaceSunken,
                borderRadius: radii.md,
                padding: '2px',
                border: `1px solid ${colors.border}`,
              }}
            >
              <button
                type="button"
                onClick={() => setBranchSummaryPeriod('today')}
                style={{
                  padding: '5px 14px',
                  borderRadius: radii.sm,
                  border: 'none',
                  backgroundColor: branchSummaryPeriod === 'today' ? colors.primary : 'transparent',
                  color: branchSummaryPeriod === 'today' ? '#ffffff' : colors.textMuted,
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: transitions.fast,
                }}
              >
                Today by Branch
              </button>
              <button
                type="button"
                onClick={() => setBranchSummaryPeriod('month')}
                style={{
                  padding: '5px 14px',
                  borderRadius: radii.sm,
                  border: 'none',
                  backgroundColor: branchSummaryPeriod === 'month' ? colors.primary : 'transparent',
                  color: branchSummaryPeriod === 'month' ? '#ffffff' : colors.textMuted,
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: transitions.fast,
                }}
              >
                Monthly by Branch
              </button>
            </div>
          </div>

          {/* Grid with Donut Chart and Facility Matrix Table */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: branchPieData.length > 0 ? '1fr 280px' : '1fr',
              gap: spacing.lg,
              alignItems: 'start',
            }}
          >
            {/* Facility Breakdown Table */}
            <div
              style={{
                overflowX: 'auto',
                borderRadius: radii.lg,
                border: `1px solid ${colors.border}`,
              }}
            >
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f1f5f9', borderBottom: `2px solid ${colors.border}` }}>
                    <th style={{ padding: '10px 14px', fontWeight: 700, color: colors.textMain }}>
                      Doctor Name
                    </th>
                    {activeFacilities.map(fac => (
                      <th
                        key={fac.Id}
                        style={{
                          padding: '10px 14px',
                          fontWeight: 700,
                          color: colors.primary,
                          textAlign: 'center',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {fac.Text}
                      </th>
                    ))}
                    <th style={{ padding: '10px 14px', fontWeight: 800, color: colors.textMain, textAlign: 'center' }}>
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    const list = branchSummaryPeriod === 'today' ? todayBranchSummary : monthBranchSummary;
                    if (list.length === 0) {
                      return (
                        <tr>
                          <td colSpan={activeFacilities.length + 2} style={{ padding: '30px', textAlign: 'center', color: colors.textSubtle }}>
                            <i className="fa-regular fa-hospital" style={{ fontSize: '24px', marginBottom: '8px', display: 'block' }} />
                            No branch appointment data available
                          </td>
                        </tr>
                      );
                    }
                    return list.map((item, idx) => (
                      <tr
                        key={idx}
                        style={{
                          borderBottom: `1px solid ${colors.border}`,
                          backgroundColor: idx % 2 === 0 ? colors.surface : '#fafafa',
                          transition: transitions.fast,
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f8fafc')}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = idx % 2 === 0 ? colors.surface : '#fafafa')}
                      >
                        <td style={{ padding: '10px 14px', fontWeight: 600, color: colors.textMain }}>
                          {item.DoctorName}
                        </td>
                        {item.FacilityDet?.map((cnt, fIdx) => (
                          <td key={fIdx} style={{ padding: '10px 14px', textAlign: 'center', fontWeight: 500 }}>
                            <span
                              style={{
                                padding: '2px 8px',
                                borderRadius: radii.full,
                                backgroundColor: cnt > 0 ? '#eff6ff' : 'transparent',
                                color: cnt > 0 ? colors.primary : colors.textSubtle,
                                fontWeight: cnt > 0 ? 700 : 400,
                              }}
                            >
                              {cnt}
                            </span>
                          </td>
                        ))}
                        <td style={{ padding: '10px 14px', textAlign: 'center', fontWeight: 800, color: colors.textMain }}>
                          <span style={{ padding: '3px 10px', borderRadius: radii.full, backgroundColor: '#f1f5f9' }}>
                            {item.Total}
                          </span>
                        </td>
                      </tr>
                    ));
                  })()}
                </tbody>
                <tfoot>
                  {(() => {
                    const facilityTotals = branchSummaryPeriod === 'today' ? todayBranchTotals : monthBranchTotals;
                    const grandTotal = facilityTotals.reduce((a, b) => a + b, 0);

                    return (
                      <tr
                        style={{
                          backgroundColor: '#f8fafc',
                          borderTop: `2px solid ${colors.border}`,
                          fontWeight: 800,
                        }}
                      >
                        <td style={{ padding: '12px 14px', color: colors.textMain }}>
                          <i className="fa-solid fa-calculator" style={{ marginRight: '6px', color: colors.primary }} />
                          Facility Summary
                        </td>
                        {activeFacilities.map((fac, idx) => (
                          <td key={fac.Id} style={{ padding: '12px 14px', textAlign: 'center', color: colors.primary, fontSize: '14px' }}>
                            {facilityTotals[idx] || 0}
                          </td>
                        ))}
                        <td style={{ padding: '12px 14px', textAlign: 'center', color: colors.textMain, fontSize: '15px' }}>
                          {grandTotal}
                        </td>
                      </tr>
                    );
                  })()}
                </tfoot>
              </table>
            </div>

            {/* Branch Distribution Donut Chart */}
            {branchPieData.length > 0 && (
              <div
                style={{
                  backgroundColor: colors.surfaceSunken,
                  borderRadius: radii.lg,
                  border: `1px solid ${colors.border}`,
                  padding: spacing.md,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                }}
              >
                <div style={{ fontSize: '12px', fontWeight: 700, color: colors.textMuted, marginBottom: spacing.xs, alignSelf: 'flex-start' }}>
                  <i className="fa-solid fa-chart-pie" style={{ marginRight: '6px', color: colors.primary }} />
                  Branch Share
                </div>
                <div style={{ width: '220px', height: '200px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={branchPieData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={3}
                      >
                        {branchPieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <RechartsTooltip
                        contentStyle={{
                          backgroundColor: '#ffffff',
                          border: '1px solid #cbd5e1',
                          borderRadius: '8px',
                          fontSize: '11px',
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div style={{ width: '100%', marginTop: spacing.xs, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {branchPieData.map((item, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: colors.textMuted }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: item.color }} />
                        {item.name}
                      </span>
                      <strong style={{ color: colors.textMain }}>{item.value}</strong>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── APPOINTMENT DETAILS PREVIEW MODAL ── */}
      {selectedAppointment && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(15,23,42,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: spacing.md,
            backdropFilter: 'blur(3px)',
          }}
          onClick={() => setSelectedAppointment(null)}
        >
          <div
            style={{
              backgroundColor: colors.surface,
              borderRadius: radii.xl,
              boxShadow: shadows.xl,
              width: '100%',
              maxWidth: '520px',
              border: `1px solid ${colors.border}`,
              overflow: 'hidden',
              animation: 'fadeIn 0.2s ease-out',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: `${spacing.md} ${spacing.lg}`,
                borderBottom: `1px solid ${colors.border}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'linear-gradient(90deg, #f8fafc 0%, #eff6ff 100%)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm }}>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: radii.md,
                    backgroundColor: colors.primary,
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '14px',
                  }}
                >
                  <i className="fa-solid fa-user-doctor" />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: colors.textMain }}>
                    Appointment Details
                  </h3>
                  <span style={{ fontSize: '11px', color: colors.textMuted }}>
                    Queue Category: {selectedAppointment.type}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedAppointment(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: colors.textMuted,
                  cursor: 'pointer',
                  fontSize: '16px',
                }}
              >
                <i className="fa-solid fa-xmark" />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: spacing.lg, display: 'flex', flexDirection: 'column', gap: spacing.md }}>
              {/* Patient Card */}
              <div
                style={{
                  backgroundColor: colors.surfaceSunken,
                  borderRadius: radii.lg,
                  padding: spacing.md,
                  border: `1px solid ${colors.border}`,
                  display: 'flex',
                  alignItems: 'center',
                  gap: spacing.md,
                }}
              >
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: radii.full,
                    backgroundColor: colors.primary,
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '16px',
                    fontWeight: 800,
                  }}
                >
                  {getInitials(
                    selectedAppointment.item.Patient?.Title?.Description,
                    selectedAppointment.item.Patient?.FirstName,
                    selectedAppointment.item.Patient?.LastName
                  )}
                </div>
                <div>
                  <div style={{ fontSize: '15px', fontWeight: 700, color: colors.textMain }}>
                    {formatFullName(
                      selectedAppointment.item.Patient?.Title?.Description,
                      selectedAppointment.item.Patient?.FirstName,
                      selectedAppointment.item.Patient?.LastName
                    )}
                  </div>
                  {selectedAppointment.item.Patient?.MRN && (
                    <div style={{ fontSize: '12px', color: colors.primary, fontWeight: 600 }}>
                      MRN: {selectedAppointment.item.Patient.MRN}
                    </div>
                  )}
                  {selectedAppointment.item.Patient?.Mobile && (
                    <div style={{ fontSize: '12px', color: colors.textMuted }}>
                      <i className="fa-solid fa-phone" style={{ marginRight: '4px' }} />
                      {selectedAppointment.item.Patient.Mobile}
                    </div>
                  )}
                </div>
              </div>

              {/* Consultation Details */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: spacing.md,
                }}
              >
                <div style={{ backgroundColor: '#f8fafc', padding: spacing.sm, borderRadius: radii.md }}>
                  <div style={{ fontSize: '11px', color: colors.textSubtle, fontWeight: 600 }}>ATTENDING DOCTOR</div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: colors.textMain, marginTop: '2px' }}>
                    {formatFullName(
                      selectedAppointment.item.User?.Title?.Description,
                      selectedAppointment.item.User?.FirstName,
                      selectedAppointment.item.User?.LastName
                    )}
                  </div>
                </div>

                <div style={{ backgroundColor: '#f8fafc', padding: spacing.sm, borderRadius: radii.md }}>
                  <div style={{ fontSize: '11px', color: colors.textSubtle, fontWeight: 600 }}>SLOT TIME</div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: colors.primary, marginTop: '2px' }}>
                    <i className="fa-regular fa-clock" style={{ marginRight: '4px' }} />
                    {selectedAppointment.item.StartTime || 'Scheduled Time'}
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div
              style={{
                padding: `${spacing.md} ${spacing.lg}`,
                borderTop: `1px solid ${colors.border}`,
                backgroundColor: '#f8fafc',
                display: 'flex',
                justifyContent: 'flex-end',
                gap: spacing.sm,
              }}
            >
              {selectedAppointment.item.Patient?.Id && onAction && (
                <button
                  type="button"
                  onClick={() => {
                    const pid = selectedAppointment.item.Patient?.Id;
                    setSelectedAppointment(null);
                    onAction('viewPatient', { patientId: pid });
                  }}
                  style={{
                    padding: '6px 14px',
                    borderRadius: radii.md,
                    border: `1px solid ${colors.primary}`,
                    backgroundColor: colors.primary,
                    color: '#ffffff',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  <i className="fa-solid fa-id-card" style={{ marginRight: '6px' }} />
                  View Patient Profile
                </button>
              )}
              <button
                type="button"
                onClick={() => setSelectedAppointment(null)}
                style={{
                  padding: '6px 14px',
                  borderRadius: radii.md,
                  border: `1px solid ${colors.border}`,
                  backgroundColor: colors.surface,
                  color: colors.textMain,
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// Subcomponent: Queue Table Card
// ─────────────────────────────────────────────────────────────

interface QueueTableCardProps {
  title: string;
  count: number;
  icon: string;
  color: string;
  badgeText: string;
  items: AppointmentRecord[];
  fullWidth?: boolean;
  onSelect: (item: AppointmentRecord) => void;
  onViewProfile?: (item: AppointmentRecord) => void;
}

const QueueTableCard: React.FC<QueueTableCardProps> = ({
  title,
  count,
  icon,
  color,
  badgeText,
  items,
  fullWidth,
  onSelect,
  onViewProfile,
}) => {
  return (
    <div
      style={{
        backgroundColor: colors.surface,
        borderRadius: radii.xl,
        border: `1px solid ${colors.border}`,
        boxShadow: shadows.md,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: `${spacing.md} ${spacing.lg}`,
          borderBottom: `1px solid ${colors.border}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: `linear-gradient(90deg, ${colors.surface} 0%, #fafafa 100%)`,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: radii.md,
              backgroundColor: `${color}15`,
              color: color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '15px',
            }}
          >
            <i className={`fa-solid ${icon}`} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: colors.textMain }}>
              {title}
            </h3>
            <span style={{ fontSize: '11px', color: colors.textSubtle }}>
              {count} {count === 1 ? 'patient' : 'patients'} in queue
            </span>
          </div>
        </div>

        <span
          style={{
            padding: '2px 8px',
            borderRadius: radii.full,
            backgroundColor: `${color}15`,
            color: color,
            fontSize: '11px',
            fontWeight: 700,
          }}
        >
          {badgeText}
        </span>
      </div>

      {/* Table Content */}
      <div style={{ maxHeight: fullWidth ? '500px' : '320px', overflowY: 'auto' }}>
        {items.length === 0 ? (
          <div
            style={{
              padding: '40px 20px',
              textAlign: 'center',
              color: colors.textSubtle,
              fontSize: '13px',
            }}
          >
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: radii.full,
                backgroundColor: '#f1f5f9',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: colors.textSubtle,
                fontSize: '18px',
                marginBottom: spacing.xs,
              }}
            >
              <i className="fa-regular fa-calendar-xmark" />
            </div>
            <div style={{ fontWeight: 600, color: colors.textMuted }}>No appointments in this queue</div>
            <div style={{ fontSize: '11px', marginTop: '2px' }}>
              Check back or select another date / facility
            </div>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '12px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: `1px solid ${colors.border}`, color: colors.textMuted }}>
                <th style={{ padding: '8px 12px', fontWeight: 600 }}>Patient</th>
                <th style={{ padding: '8px 12px', fontWeight: 600 }}>Doctor</th>
                <th style={{ padding: '8px 12px', fontWeight: 600 }}>Phone</th>
                <th style={{ padding: '8px 12px', fontWeight: 600, textAlign: 'right' }}>Time</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => {
                const patientName = formatFullName(item.Patient?.Title?.Description, item.Patient?.FirstName, item.Patient?.LastName);
                const doctorName = formatFullName(item.User?.Title?.Description, item.User?.FirstName, item.User?.LastName);

                return (
                  <tr
                    key={idx}
                    onClick={() => onSelect(item)}
                    style={{
                      borderBottom: `1px solid ${colors.border}`,
                      cursor: 'pointer',
                      transition: transitions.fast,
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f8fafc')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    {/* Patient */}
                    <td style={{ padding: '8px 12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div
                          style={{
                            width: '26px',
                            height: '26px',
                            borderRadius: radii.full,
                            backgroundColor: `${color}15`,
                            color: color,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '10px',
                            fontWeight: 700,
                            flexShrink: 0,
                          }}
                        >
                          {getInitials(item.Patient?.Title?.Description, item.Patient?.FirstName, item.Patient?.LastName)}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, color: colors.textMain }}>
                            {patientName}
                          </div>
                          {item.Patient?.MRN && (
                            <div style={{ fontSize: '10px', color: colors.textSubtle }}>
                              MRN: {item.Patient.MRN}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Doctor */}
                    <td style={{ padding: '8px 12px', color: colors.textMuted }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <i className="fa-solid fa-user-doctor" style={{ fontSize: '10px', color: colors.primary }} />
                        <span style={{ fontWeight: 500 }}>{doctorName}</span>
                      </div>
                    </td>

                    {/* Phone */}
                    <td style={{ padding: '8px 12px', color: colors.textMuted }}>
                      {item.Patient?.Mobile ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <i className="fa-solid fa-phone" style={{ fontSize: '10px', color: colors.textSubtle }} />
                          <span>{item.Patient.Mobile}</span>
                        </div>
                      ) : (
                        <span style={{ color: colors.textSubtle }}>-</span>
                      )}
                    </td>

                    {/* Time */}
                    <td style={{ padding: '8px 12px', textAlign: 'right' }}>
                      <span
                        style={{
                          padding: '2px 6px',
                          borderRadius: radii.sm,
                          backgroundColor: '#f1f5f9',
                          color: colors.textMain,
                          fontSize: '11px',
                          fontWeight: 600,
                          whiteSpace: 'nowrap',
                        }}
                      >
                        <i className="fa-regular fa-clock" style={{ marginRight: '3px', color: color, fontSize: '10px' }} />
                        {item.StartTime || '—'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
