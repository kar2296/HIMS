/**
 * Small pure helpers shared by the EMR Workspace panels.
 * No HTTP here -- every backend call goes through utils/api.ts apiFetch().
 */
import type { ConsultationInfo, LookupItem } from './types';

/** getoptions prepends a { Id: -1, Text: 'Please Select' } row; panels render their own placeholder. */
export const cleanLookup = (list?: LookupItem[] | null): LookupItem[] =>
  (list || []).filter((item) => item && item.Id !== -1);

export const toSelectOptions = (list?: LookupItem[] | null) =>
  cleanLookup(list).map((item) => ({ value: item.Id, label: item.Text }));

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const toDate = (value?: string | Date | null): Date | null => {
  if (!value) return null;
  const d = value instanceof Date ? value : new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
};

const pad = (n: number) => String(n).padStart(2, '0');

/** "23 Sep 2026" */
export const formatDate = (value?: string | Date | null): string => {
  const d = toDate(value);
  return d ? `${pad(d.getDate())} ${MONTHS[d.getMonth()]} ${d.getFullYear()}` : '—';
};

/** "23 Sep 2026, 18:16" */
export const formatDateTime = (value?: string | Date | null): string => {
  const d = toDate(value);
  return d ? `${formatDate(d)}, ${pad(d.getHours())}:${pad(d.getMinutes())}` : '—';
};

/** Age text like the reference header: "2 Yrs 18 Days", "34 Yrs 2 Mths". */
export const formatAge = (dob?: string | Date | null, now: Date = new Date()): string => {
  const birth = toDate(dob);
  if (!birth || birth > now) return '—';
  let years = now.getFullYear() - birth.getFullYear();
  let months = now.getMonth() - birth.getMonth();
  let days = now.getDate() - birth.getDate();
  if (days < 0) {
    months -= 1;
    days += new Date(now.getFullYear(), now.getMonth(), 0).getDate();
  }
  if (months < 0) {
    years -= 1;
    months += 12;
  }
  if (years >= 5) return months > 0 ? `${years} Yrs ${months} Mths` : `${years} Yrs`;
  if (years >= 1) return `${years} Yrs ${months ? `${months} Mths ` : ''}${days} Days`.trim();
  if (months >= 1) return `${months} Mths ${days} Days`;
  return `${days} Days`;
};

export const fullName = (p?: { FirstName?: string; MiddleName?: string; LastName?: string } | null): string =>
  [p?.FirstName, p?.MiddleName, p?.LastName].filter(Boolean).join(' ') || '—';

export type RangeStatus = 'normal' | 'low' | 'high' | 'none';

/** Compares a reading against the master's reference range (same rule as the legacy vital form). */
export const rangeStatus = (value: string | number | undefined | null, from?: string | number | null, to?: string | number | null): RangeStatus => {
  if (value === undefined || value === null || value === '') return 'none';
  const v = typeof value === 'number' ? value : parseFloat(value);
  const lo = from === undefined || from === null || from === '' ? NaN : Number(from);
  const hi = to === undefined || to === null || to === '' ? NaN : Number(to);
  if (Number.isNaN(v) || (Number.isNaN(lo) && Number.isNaN(hi))) return 'none';
  if (!Number.isNaN(lo) && v < lo) return 'low';
  if (!Number.isNaN(hi) && v > hi) return 'high';
  return 'normal';
};

/** Legacy VitalQualifierId values: 1 Normal, 2 Below normal, 3 Above normal. */
export const qualifierIdFor = (status: RangeStatus): number | undefined =>
  status === 'normal' ? 1 : status === 'low' ? 2 : status === 'high' ? 3 : undefined;

export const calculateBmi = (heightCm?: number, weightKg?: number): number | null => {
  if (!heightCm || !weightKg || heightCm <= 0 || weightKg <= 0) return null;
  const m = heightCm / 100;
  return Math.round((weightKg / (m * m)) * 100) / 100;
};

/** Pulls a readable message out of a rejected apiFetch() (utl already toasts Error.Message). */
export const errorText = (err: unknown, fallback = 'Something went wrong. Please try again.'): string => {
  const e = err as any;
  return e?.Error?.Message || e?.message || fallback;
};

/** Consultation (visit entry) progress-note status ids. */
export const STATUS = {
  DRAFT: 1,
  COMPLETED: 2,
  FINALIZED: 3,
} as const;

export const statusLabel = (c?: ConsultationInfo | null) => {
  const id = c?.ProgressNoteStatusId || STATUS.DRAFT;
  return c?.ProgressNoteStatus?.Description || (id === STATUS.FINALIZED ? 'Finalized' : id === STATUS.COMPLETED ? 'Completed' : 'Draft');
};
