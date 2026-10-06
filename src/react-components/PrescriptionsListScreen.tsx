import React from 'react';
import { colors, spacing, radii, typography } from '../components/ui/tokens';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { DatePicker } from '../components/ui/DatePicker';
import { Card, FilterBar } from '../components/ui/Card';
import { Pagination } from '../components/ui/Pagination';
import { EmptyState } from '../components/ui/EmptyState';

interface LookupItem {
  Id: number;
  Text: string;
}

interface NameDescription {
  Description?: string;
}

interface PrescriptionRow {
  Id: number;
  Identifier?: string;
  PrescriptionDate?: string;
  PrecriptionStatus?: NameDescription;
  PrescriptionPriority?: NameDescription;
  PatientId?: number;
  Patient?: {
    Title?: NameDescription;
    FirstName?: string;
    LastName?: string;
    MRN?: string;
    Gender?: NameDescription;
    GenderId?: number;
    Age?: number | string;
    DOB?: string;
    AddressLine1?: string;
    AddressLine2?: string;
    Area?: string;
    City?: string;
    State?: string;
    Country?: string;
    LandLine?: string;
    NationalityIdentifier?: string;
    PhotoPath?: string;
    Photo?: string;
  };
  Doctor?: {
    Title?: NameDescription;
    FirstName?: string;
    LastName?: string;
  };
  [key: string]: any;
}

interface CurrentFilter {
  patient?: string;
  PrescriptionDate?: string; // ISO yyyy-mm-dd, converted from the real currentfilter.PrescriptionDate (a plain Date) by the controller bridge
  PrecriptionStatusId?: number;
}

interface Pager {
  totalItems?: number;
  currentPage?: number;
  pageSize?: number;
}

interface ReactPropsShape {
  items?: PrescriptionRow[];
  lookup?: { PrecriptionStatus?: LookupItem[] };
  currentfilter?: CurrentFilter;
  pager?: Pager;
}

interface ScreenProps {
  reactProps?: ReactPropsShape;
  onAction?: (actionName: string, payload?: any) => void;
}

// Mirrors the shared `displaydate` directive's own 'dd-MMM-yyyy HH:mm' AngularJS
// date filter, used on row.entity.PrescriptionDate via
// <displaydate datetime-val="row.entity.PrescriptionDate">
// (public/vendor/common/ngCommonHelper.js).
function formatDateTime(val?: string): string {
  if (!val) return '';
  const d = new Date(val);
  if (isNaN(d.getTime())) return '';
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const dd = String(d.getDate()).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const mi = String(d.getMinutes()).padStart(2, '0');
  return `${dd}-${months[d.getMonth()]}-${d.getFullYear()} ${hh}:${mi}`;
}

// Mirrors the real cellTemplate's DOB filter: {{DOB | date : 'dd-MMM-yyyy'}}
function formatDob(val?: string): string {
  if (!val) return '';
  const d = new Date(val);
  if (isNaN(d.getTime())) return '';
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const dd = String(d.getDate()).padStart(2, '0');
  return `${dd}-${months[d.getMonth()]}-${d.getFullYear()}`;
}

// Mirrors the real cellTemplate expression exactly, including the missing
// space before 'Yr' for age <= 1 (real markup: `row.entity.Patient.Age + 'Yr'`
// vs `row.entity.Patient.Age + ' Yrs'` for everything else) -- not "fixed" here.
function formatAge(age?: number | string): string {
  if (!age && age !== 0) return 'N/A';
  const n = Number(age);
  if (!isNaN(n) && n <= 1) return `${age}Yr`;
  return `${age} Yrs`;
}

// ---------------------------------------------------------------------------
// prescriptions.js / prescriptions.html (state app.doctorprescription) --
// the doctor's prescription worklist. Server-side paginated card list
// (emr/prescription/GetPrescriptionsWithoutDetails), same family/shape as
// PatientSearchScreen's card-list rendering (the real ui-grid here has
// exactly ONE columnDef, "Id", whose cellTemplate is the entire patient
// card -- there are no real tabular columns to reproduce as a DataTable).
//
// Real, disclosed pre-existing bugs/dead-code preserved as-is, NOT fixed:
// - `$scope.options` is referenced by the real template
//   (`<label ng-repeat="option in options" ... ng-click="getList()"
//   ng-model="currentcontext.option" uib-btn-radio="option.key">`) but is
//   NEVER defined anywhere in prescriptions.js. In real AngularJS this makes
//   `options` undefined, so `ng-repeat` iterates zero items and the whole
//   radio-tab row silently renders nothing today. Not reproduced here (no
//   tab row rendered), matching the live page exactly.
// - `getList(pageNo)` declares a `pageNo` parameter that is never referenced
//   in its own body (it reads `vm.gridConfig.pagerObj.currentPage` instead) --
//   a real, harmless dead parameter, left exactly as the original function
//   signature/body (only the bridge's call site, like every other call site
//   in the real code, ignores it).
// - `$scope.deleteItemCallback` is defined but has no caller anywhere in this
//   controller or template (no delete affordance exists in the real UI) --
//   real dead code, not wired to anything here either.
// - `$scope.item = {}` is initialized and never read or written again
//   anywhere else in the controller -- dead state, not exposed via reactProps.
// - `currentfilter.DepartmentId` and `currentfilter.FacilityId` are set from
//   session on load but the real template has no UI control for either, and
//   `getList()`'s own Params array never sends DepartmentId at all (FacilityId
//   is sent, Key 17) -- DepartmentId is pure dead state. Neither is exposed
//   as an editable filter here, matching the real page.
// - Name/MRN search uses the real `on-enter` directive semantics: typing does
//   NOT re-query (no ng-change on that field) -- only pressing Enter calls
//   getList(). Reproduced via a keydown check dispatching a separate 'search'
//   action; every keystroke still updates the filter value via
//   'filterChange' without triggering a fetch. Date and Status both have a
//   real ng-change="getList()" and refetch immediately.
// ---------------------------------------------------------------------------
export const PrescriptionsListScreen: React.FC<ScreenProps> = ({ reactProps, onAction }) => {
  const {
    items = [],
    lookup = {},
    currentfilter = {},
    pager = {},
  } = reactProps || {};
  const dispatch = (action: string, payload?: any) => { if (onAction) onAction(action, payload); };

  const pageSize = pager.pageSize || 25;
  const totalItems = pager.totalItems || 0;
  const currentPage = pager.currentPage || 1;

  return (
    <div style={{ fontFamily: typography.fontFamily, padding: `${spacing.sm} ${spacing.md} ${spacing.xl}` }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.lg, flexWrap: 'wrap', gap: spacing.sm }}>
        <h2 style={{ ...typography.sectionHeading, color: colors.textMain, margin: 0, fontFamily: typography.fontFamily }}>
          Prescriptions
        </h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm }}>
          <button
            type="button"
            title="Doctor Dashboard"
            onClick={() => dispatch('doctor_dashboard')}
            style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 4 }}
          >
            <img src="app/img/main/download.png" alt="home" style={{ width: 22, height: 22 }} />
          </button>
          <button
            type="button"
            title="Bed Management"
            onClick={() => dispatch('bed_management')}
            style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 4 }}
          >
            <img src="app/img/main/235797.png" alt="bed" style={{ width: 22, height: 22 }} />
          </button>
          <button
            type="button"
            title="Add Prescription"
            onClick={() => dispatch('addNew')}
            style={{
              border: 'none', background: colors.primary, color: '#fff', borderRadius: radii.sm,
              width: 30, height: 30, cursor: 'pointer',
            }}
          >
            <i className="fa fa-plus" aria-hidden="true" />
          </button>
        </div>
      </div>

      <Card padding={spacing.md} style={{ marginBottom: spacing.lg }}>
        <FilterBar>
          <div style={{ minWidth: 220 }}>
            <Input
              label="Patient Name"
              leftIcon="fas fa-search"
              placeholder="Patient Name"
              value={currentfilter.patient ?? ''}
              onChange={(ev) => dispatch('filterChange', { field: 'patient', value: ev.target.value })}
              onKeyDown={(ev) => { if (ev.key === 'Enter') dispatch('search'); }}
            />
          </div>
          <div style={{ minWidth: 160 }}>
            <DatePicker
              label="Date"
              value={currentfilter.PrescriptionDate ?? ''}
              onChange={(v) => dispatch('filterChangeAndSearch', { field: 'PrescriptionDate', value: v })}
            />
          </div>
          <div style={{ minWidth: 200 }}>
            <Select
              label="Status"
              value={currentfilter.PrecriptionStatusId ?? ''}
              onChange={(v) => dispatch('filterChangeAndSearch', { field: 'PrecriptionStatusId', value: Number(v) })}
              options={(lookup.PrecriptionStatus || []).map((o) => ({ value: o.Id, label: o.Text }))}
            />
          </div>
        </FilterBar>
      </Card>

      {items.length === 0 ? (
        <EmptyState text="No records" />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.sm }}>
          {items.map((row) => (
            <PrescriptionCard key={row.Id} row={row} onAction={dispatch} />
          ))}
        </div>
      )}

      <div style={{ marginTop: spacing.md }}>
        <Pagination
          currentPage={currentPage}
          totalItems={totalItems}
          pageSize={pageSize}
          onPageChange={(page) => dispatch('pageChange', { page })}
        />
      </div>
    </div>
  );
};

const PrescriptionCard: React.FC<{ row: PrescriptionRow; onAction: (action: string, payload?: any) => void }> = ({ row, onAction }) => {
  const patient = row.Patient || {};
  const doctor = row.Doctor || {};
  const hasAddress = !!(patient.AddressLine1 || patient.AddressLine2);

  return (
    <Card padding={spacing.md}>
      <div style={{ display: 'flex', gap: spacing.md, alignItems: 'flex-start', flexWrap: 'wrap' }}>
        {/* Photo */}
        <div style={{ flex: '0 0 56px' }}>
          {patient.PhotoPath && patient.Photo ? (
            <img
              src={`data:image/png;base64,${patient.Photo}`}
              alt=""
              style={{ width: 56, height: 56, objectFit: 'cover', borderRadius: radii.md }}
            />
          ) : (
            <img
              src={patient.GenderId === 2 ? 'app/img/main/no-img-female.png' : 'app/img/main/no-img-icon.png'}
              alt=""
              style={{ width: 56, height: 56, objectFit: 'cover', borderRadius: radii.md }}
            />
          )}
        </div>

        {/* Name / demographics / address / contact */}
        <div style={{ flex: '1 1 320px', minWidth: 260 }}>
          <div style={{ fontSize: '13px', fontWeight: 700, color: colors.primary }}>
            {patient.Title?.Description} {patient.FirstName} {patient.LastName}
          </div>
          <div style={{ fontSize: '13px', fontWeight: 700, color: colors.textMain }}>
            <span style={{ color: colors.textMain }}>MRN - {patient.MRN || 'N/A'}</span>
            {' | '}{patient.Gender?.Description || 'N/A'}{' | '}{formatAge(patient.Age)}{' | '}
            {patient.DOB ? formatDob(patient.DOB) : 'N/A'}
          </div>
          {hasAddress ? (
            <div style={{ fontSize: '10px', color: colors.textSubtle }}>
              <i className="fa fa-envelope" aria-hidden="true" /> :&nbsp;
              {patient.AddressLine1 ? `${patient.AddressLine1},` : ''} {patient.AddressLine2 ? `${patient.AddressLine2},` : ''}{' '}
              {patient.Area ? `${patient.Area},` : ''} {patient.City ? `${patient.City},` : ''} {patient.State ? `${patient.State},` : ''}{' '}
              {patient.Country || ''}
            </div>
          ) : (
            <div style={{ fontSize: '10px', color: colors.textSubtle }}>
              <i className="fa fa-envelope" aria-hidden="true" /> :&nbsp;N/A
            </div>
          )}
          <div style={{ fontSize: '10px', color: colors.textSubtle }}>
            <i className="fa fa-phone-square" aria-hidden="true" /> : {patient.LandLine}{' | '}
            NRIC - {patient.NationalityIdentifier || 'N/A'}
          </div>
        </div>

        {/* Identifier / date / status / priority */}
        <div style={{ flex: '1 1 220px', minWidth: 200 }}>
          <span style={{ display: 'inline-block', fontSize: '11px', fontWeight: 700, color: '#8a6d3b', background: '#fcf8e3', border: '1px solid #faebcc', borderRadius: radii.sm, padding: '2px 6px' }}>
            {row.Identifier}
          </span>
          <div style={{ fontSize: '12px', color: colors.textMain, marginTop: spacing.xs }}>
            {formatDateTime(row.PrescriptionDate)}
          </div>
          <div>
            <span style={{ display: 'inline-block', fontSize: '11px', fontWeight: 700, color: '#fff', background: colors.success, borderRadius: radii.sm, padding: '2px 6px' }}>
              {row.PrecriptionStatus?.Description}
            </span>
            {' | '}{row.PrescriptionPriority?.Description}
          </div>
        </div>

        {/* Doctor name */}
        <div style={{ flex: '1 1 200px', minWidth: 180 }}>
          <div style={{ height: 24 }}>&nbsp;</div>
          <div style={{ fontSize: '13px', color: colors.primary }}>
            {doctor.Title?.Description} {doctor.FirstName} {doctor.LastName}
          </div>
        </div>

        {/* Action */}
        <div style={{ flex: '0 0 auto', display: 'flex', gap: spacing.xs, alignItems: 'center', marginTop: 25 }}>
          <button
            type="button"
            title="Print Prescription"
            onClick={() => onAction('print', { row })}
            style={{
              border: '1px solid #d1d5db', background: '#f9fafb', color: colors.textMain, borderRadius: radii.sm,
              width: 30, height: 30, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}
          >
            <i className="fa fa-print" aria-hidden="true" />
          </button>
          <button
            type="button"
            title="View Details"
            onClick={() => onAction('edit', { row })}
            style={{
              border: 'none', background: '#1dafa1', color: '#fff', borderRadius: radii.sm,
              width: 30, height: 30, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}
          >
            <i className="fa fa-chevron-right" aria-hidden="true" />
          </button>
        </div>
      </div>
    </Card>
  );
};
