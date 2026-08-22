import React, { useState, useRef, useEffect } from 'react';
import { colors, spacing, radii, shadows, typography, controlHeight } from '../components/ui/tokens';
import { Card } from '../components/ui/Card';
import { DetailField } from '../components/ui/SectionCard';
import { Avatar } from '../components/ui/Avatar';
import { Loading } from '../components/ui/Loading';
import { Button } from './Button';

interface FeedbackItem {
  PatientId?: number;
  EncounterId?: number;
  Title?: string;
  FirstName?: string;
  LastName?: string;
  Age?: string | number;
  DOB?: string;
  MRN?: string;
  Mobile?: string;
  PhotoPath?: string;
}

interface ReactPropsShape {
  item?: FeedbackItem;
  photo?: string; // base64, matches currentcontext.Photo
}

interface ScreenProps {
  reactProps?: ReactPropsShape;
  onAction?: (actionName: string, payload?: any) => void;
  onSearch?: (query: string) => Promise<any[]>;
}

// ---------------------------------------------------------------------------
// patient-feedback (app.patient-feedback) -- confirmed reachable via the
// "Feedback" card on the Patient Management landing page (patientservices.js)
// plus real $state.go('app.patient-feedback') returns from the OTP-verification,
// feedback-form, and feedback-dashboard flows.
//
// The original controller carries a full "Feedbacks Master" CRUD grid
// (getList/handleEvents/onDeleteConfirmed/openModal/addNew, vm.gridConfig) that
// the live template never actually renders -- no grid element exists in
// patient-feedback.html. That's dead code, left untouched but unused in the
// hollowed controller; NOT reproduced here, since building UI for
// never-rendered functionality would be fabricating behavior that isn't real.
//
// What IS real and ported: an encounter search (was the native <autosearch>
// directive, config vm.patientcontrolconfig -- real API Visit/Visit/GetEncounters,
// same $http.post(window.appPath.apiroot + ...) mechanism the shared autosearch
// directive itself uses), a read-only profile card once an encounter is picked,
// and a button that navigates to app.patient-feedback-form for that patient/encounter.
//
// Disclosed pre-existing quirks preserved as-is, NOT fixed:
// - "Age/DOB" renders as the two values directly concatenated with NO separator
//   (`{{item.Age}}{{item.DOB}}` in the original) -- same here.
// - The patient name renders as `Title.FirstName LastName` even when Title is
//   empty (a bare leading "."), matching `{{item.Title}}.{{item.FirstName}}&nbsp;{{item.LastName}}`.
// - Selecting a row whose encounter has IsBillLock/IsBillFinalized shows the
//   original's real error alert and resets the selection -- same message keys.
// ---------------------------------------------------------------------------
export const PatientFeedbackScreen: React.FC<ScreenProps> = ({ reactProps, onAction, onSearch }) => {
  const { item = {}, photo } = reactProps || {};
  const dispatch = (action: string, payload?: any) => { if (onAction) onAction(action, payload); };

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleQueryChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value;
    setQuery(q);
    setActiveIndex(-1);
    if (q.length > 2 && onSearch) {
      setIsLoading(true);
      setIsOpen(true);
      try {
        const data = await onSearch(q);
        setResults(data || []);
      } catch (err) {
        console.error('Error searching encounters:', err);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    } else {
      setResults([]);
      setIsOpen(false);
    }
  };

  const handleSelect = (encounter: any) => {
    dispatch('select', { encounter });
    setIsOpen(false);
    setResults([]);
    setQuery('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((p) => (p < results.length - 1 ? p + 1 : p));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((p) => (p > 0 ? p - 1 : 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeIndex >= 0 && activeIndex < results.length) handleSelect(results[activeIndex]);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const hasPatient = !!(item.PatientId && item.PatientId > 0);
  // Preserves the original's exact concatenation quirks -- not cleaned up.
  const patientName = `${item.Title || ''}.${item.FirstName || ''} ${item.LastName || ''}`;
  const ageDob = `${item.Age ?? ''}${item.DOB ?? ''}`;

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: `${spacing.sm} ${spacing.xs} ${spacing.xl}`, fontFamily: typography.fontFamily }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.lg, flexWrap: 'wrap', gap: spacing.md }}>
        <h1 style={{ ...typography.pageTitle, color: colors.textMain, margin: 0, fontFamily: typography.fontFamily }}>OP Patient Feedback</h1>

        <div ref={wrapperRef} style={{ position: 'relative', width: 320, maxWidth: '100%' }}>
          <i
            className={isLoading ? 'fa-solid fa-circle-notch fa-spin' : 'fa-solid fa-magnifying-glass'}
            style={{ position: 'absolute', left: spacing.sm, top: '50%', transform: 'translateY(-50%)', fontSize: '13px', color: colors.textSubtle, pointerEvents: 'none' }}
          />
          <input
            type="text"
            placeholder="Patient"
            value={query}
            onChange={handleQueryChange}
            onKeyDown={handleKeyDown}
            onFocus={() => { if (results.length > 0) setIsOpen(true); }}
            autoComplete="off"
            style={{
              width: '100%', height: controlHeight.md, padding: `0 ${spacing.sm} 0 30px`, borderRadius: radii.md,
              border: `1px solid ${colors.border}`, backgroundColor: colors.surface, color: colors.textMain,
              fontFamily: typography.fontFamily, fontSize: typography.body.fontSize, boxSizing: 'border-box',
            }}
          />
          {isOpen && (results.length > 0 || isLoading) && (
            <div style={{
              position: 'absolute', top: 'calc(100% + 4px)', right: 0, zIndex: 1000, minWidth: 520,
              maxHeight: 280, overflow: 'auto', backgroundColor: colors.surface, border: `1px solid ${colors.border}`,
              borderRadius: radii.md, boxShadow: shadows.lg,
            }}>
              {isLoading && results.length === 0 ? (
                <Loading text="Searching..." size="sm" />
              ) : (
                <table className="table table-bordered table-condensed" style={{ margin: 0, background: 'transparent', borderCollapse: 'collapse' }} role="listbox">
                  <thead>
                    <tr style={{ backgroundColor: colors.primary }}>
                      {['Title', 'Name', 'Age/Gender', 'DOB', 'MRN', 'Visit#', 'Ward/Room/Bed'].map((h) => (
                        <th key={h} style={{ color: '#ffffff', ...typography.label, fontFamily: typography.fontFamily, padding: `${spacing.xs} ${spacing.sm}`, whiteSpace: 'nowrap' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((enc, index) => (
                      <tr
                        key={enc.Id ?? index}
                        style={{ cursor: 'pointer', backgroundColor: index === activeIndex ? colors.primaryLight : 'transparent' }}
                        onMouseEnter={() => setActiveIndex(index)}
                        onClick={() => handleSelect(enc)}
                        role="option"
                      >
                        <td style={{ ...typography.body, fontFamily: typography.fontFamily, color: colors.textMain, padding: `${spacing.xs} ${spacing.sm}`, borderColor: colors.border }}>{enc.Title}</td>
                        <td style={{ ...typography.body, fontFamily: typography.fontFamily, color: colors.textMain, padding: `${spacing.xs} ${spacing.sm}`, borderColor: colors.border }}>{enc.PatientName}</td>
                        <td style={{ ...typography.body, fontFamily: typography.fontFamily, color: colors.textMain, padding: `${spacing.xs} ${spacing.sm}`, borderColor: colors.border, whiteSpace: 'nowrap' }}>{enc.Age}</td>
                        <td style={{ ...typography.body, fontFamily: typography.fontFamily, color: colors.textMain, padding: `${spacing.xs} ${spacing.sm}`, borderColor: colors.border, whiteSpace: 'nowrap' }}>{enc.DOB}</td>
                        <td style={{ ...typography.body, fontFamily: typography.fontFamily, color: colors.textMain, padding: `${spacing.xs} ${spacing.sm}`, borderColor: colors.border }}>{enc.MRN}</td>
                        <td style={{ ...typography.body, fontFamily: typography.fontFamily, color: colors.textMain, padding: `${spacing.xs} ${spacing.sm}`, borderColor: colors.border }}>{enc.VisitIdentifier}</td>
                        <td style={{ ...typography.body, fontFamily: typography.fontFamily, color: colors.textMain, padding: `${spacing.xs} ${spacing.sm}`, borderColor: colors.border }}>{enc.WardDetail}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      </div>

      {hasPatient && (
        <Card>
          <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: spacing.xl, alignItems: 'center' }}>
            {photo ? (
              <img
                src={`data:image/png;base64,${photo}`}
                alt={patientName}
                style={{ width: 100, height: 100, borderRadius: '50%', objectFit: 'cover', border: `1px solid ${colors.border}` }}
              />
            ) : (
              <Avatar name={item.FirstName || item.MRN || 'P'} size="xl" />
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', columnGap: spacing.xl, rowGap: spacing.lg }}>
              <DetailField label="Patient name" value={patientName} />
              <DetailField label="Age/DOB" value={ageDob || undefined} />
              <DetailField label="MRN" value={item.MRN} emphasize />
              <DetailField label="Phone No" value={item.Mobile} />
            </div>

            <Button variant="primary" onClick={() => dispatch('feedbackpage')} title="Give Feedback">
              <i className="fa-solid fa-comment-dots" />
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};
