import React, { useState } from 'react';
import { colors, spacing, typography } from '../components/ui/tokens';
import { Input } from '../components/ui/Input';
import { Select, type SelectOption } from '../components/ui/Select';
import { DatePicker } from '../components/ui/DatePicker';
import { DataTable, type DataTableColumn } from '../components/ui/DataTable';
import { Pagination } from '../components/ui/Pagination';

interface LookupOption {
  Id: number;
  Text: string;
}

interface PersonName {
  Title?: { Description?: string };
  FirstName?: string;
  LastName?: string;
}

interface PatientInfo extends PersonName {
  MRN?: string;
  Age?: number;
  Gender?: { Description?: string };
}

interface AppointmentRow {
  Id: number;
  AppointmentDate?: string;
  StartTime?: string;
  EndTime?: string;
  Patient?: PatientInfo;
  AppointmentCategory?: { Name?: string };
  User?: PersonName;
  AppointmentStatus?: { Description?: string; ColorCode?: string };
}

interface CurrentFilterShape {
  AppointmentTypeId?: number | string;
  DepartmentId?: number | string;
  DoctorId?: string;
  AppointmentStatusId?: number | string;
  fromdate?: string;
  todate?: string;
  MRN?: string;
}

interface CurrentContextShape {
  candisableappttype?: boolean;
}

interface LookupShape {
  AppointmentType?: LookupOption[];
  Department?: LookupOption[];
  Doctor?: LookupOption[];
  AppointmentStatus?: LookupOption[];
}

interface PagerShape {
  totalItems?: number;
  currentPage?: number;
  pageSize?: number;
}

interface ReactPropsShape {
  currentfilter?: CurrentFilterShape;
  currentcontext?: CurrentContextShape;
  lookup?: LookupShape;
  rows?: AppointmentRow[];
  pager?: PagerShape;
  showCalendar?: boolean;
}

interface ScreenProps {
  reactProps?: ReactPropsShape;
  onAction?: (actionName: string, payload?: any) => void;
}

const toOptions = (list?: LookupOption[]): SelectOption[] => (list || []).map((l) => ({ value: l.Id, label: l.Text }));

const dispatchOf = (onAction?: (a: string, p?: any) => void) => (action: string, payload?: any) => {
  onAction?.(action, payload);
};

function formatDate(val?: string): string {
  if (!val) return '';
  const d = new Date(val);
  if (isNaN(d.getTime())) return '';
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const dd = String(d.getDate()).padStart(2, '0');
  return `${dd}-${months[d.getMonth()]}-${d.getFullYear()}`;
}

// Same ISO yyyy-mm-dd bridge convention as every other DatePicker-backed field
// in this project (see AppointmentFormScreen.tsx's toDateInputValue) --
// currentfilter.fromdate/todate are real JS Date objects on the Angular side
// (bound via uib-datepicker-popup's ng-model), converted to/from an ISO
// string only at the React boundary.
function toDateInputValue(d?: string | Date): string {
  if (!d) return '';
  const date = d instanceof Date ? d : new Date(d);
  if (isNaN(date.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function personName(p?: PersonName): string {
  if (!p) return '';
  const title = p.Title?.Description ? `${p.Title.Description} ` : '';
  return `${title}${p.FirstName || ''}${p.LastName ? ' ' + p.LastName : ''}`.trim();
}

// React bridge migration for appointmentnew/appointments-list.js
// (`appointmentsListController`, state `app.appointmentnew` -- the
// appointmentstab family's list screen, reached via `backToList()` from the
// appointmentstab shell/its Details+View tabs and directly linkable via the
// DB menu). Most of the original template is already dead/commented-out
// markup (a whole earlier iteration of the filter bar, ~220 lines, replaced
// in-place by the live `#bannerdetails` table further down); only the LIVE
// markup was migrated.
//
// Three mounts share one reactProps/handleReactAction:
//  - AppointmentsListTopBar: MRN/Name search (real `on-enter` semantics --
//    dispatches only on Enter, matches the original's `on-enter="getList()"`)
//    plus the Add/Calendar-toggle/Home buttons. The calendar-toggle icon
//    (`#calenderid`) originally flipped between fa-calendar/fa-list via a
//    jQuery `.click()` handler in the .html's inline `<script>`, purely
//    click-count-driven and never actually synced to
//    `vm.appointment.ShowCalendar` (so it was already slightly wrong if the
//    view opened with `$stateParams.iShowCalendar` true). A React re-render
//    on every dispatched action would immediately stomp that jQuery-toggled
//    class anyway, so the icon here is driven directly off the real
//    `showCalendar` prop instead -- strictly more correct (always matches
//    the actual view), same visual intent. The old jQuery listener is
//    harmless dead weight, left in the .html untouched.
//  - AppointmentsListFilterTable: the live `#bannerdetails` two-row filter
//    table (AppointmentType/From/To/Department/Doctor/Status).
//  - AppointmentsListGrid: replaces `<custom-table config="vm.gridConfig">`
//    + the `uib-pagination` footer with DataTable+Pagination. Kept behind
//    the SAME `ng-show="!vm.appointment.ShowCalendar"` on the
//    `<react-component>` tag as the original had on `<custom-table>`.
// `<jqx-scheduler>` (the day/week/month calendar view, toggled by the same
// ShowCalendar flag) and the dead `#myModal` help-image popup are left
// completely native/untouched -- same REUSABLE-SUB-WIDGET-PATTERN precedent
// as every other jqx-scheduler screen in this project.
//
// CONFIRMED PRE-EXISTING QUIRKS reproduced as-is (not fixed):
// - The LIVE Department `<ui-select>` in `#bannerdetails` has
//   `ng-change="getList()"` -- NOT `deptChange()` like the older, now-dead
//   commented-out filter block did. This means `$scope.deptChange()`,
//   `$scope.getDoctorOrResources()` and `$scope.getDoctorOrResourcesCallback`
//   are now unreachable dead code: changing Department no longer refreshes
//   the Doctor/Resource option lists (they're fetched once at initLookup()
//   time and never again). Reproduced faithfully: departmentChange only
//   updates the filter and re-queries the list, nothing else.
// - There is NO live Resource filter anywhere in the current template (the
//   old commented-out block had one) -- `currentfilter.ResourceId` is only
//   ever reset to '' by `appointmenttypechange()` and sent (always empty)
//   in `getList()`'s payload. `canShowResourceArea()`/`canShowPhysicianArea()`
//   still gate which Key (5 vs 6) `getList()` populates from `DoctorId`, but
//   the Doctor multiselect itself is unconditionally shown regardless of
//   either function's result in the live table (no `ng-show` wraps it).
// - `$scope.canShowAction(actionType, row)` references a bare `entity`
//   identifier that is never a parameter or otherwise in scope -- a
//   guaranteed `ReferenceError` if it were ever called. It isn't: no column
//   or action in the LIVE `vm.gridConfig` calls it (only a second, fully
//   commented-out `columnDefs` actions block referenced it). Confirmed dead,
//   not reproduced.
// - The grid's actual live Actions column has only ONE action, "edit" (a
//   pencil icon calling `handleEvents('edit', entity)`, which now
//   `$state.go`s to `app.appointmentstab.details` -- the modal-based
//   `utl.Modal.open('app.appointment', ...)` call for the same case is
//   commented out). The commented-out second `columnDefs` block that would
//   have added call/cancel/emr/dem actions is fully dead and not reproduced.
// - `$scope.showprocessflow()`/`hideprocessflow()` (the `#myModal` help-image
//   popup) have no live trigger anywhere in the template -- the only button
//   that opened it is commented out. The modal's own close ("X",
//   `hideprocessflow()`) is technically still live markup, but the modal can
//   never be shown in the first place. Left untouched, natively, in the
//   .html (not migrated, not removed).
// - `$scope.batchCheckout()`/multi-row-selection code block is dead (grid
//   selection was never enabled -- `vm.gridConfig.enableRowSelection` etc.
//   are all commented out); not reproduced.
// - CONFIRMED PRE-EXISTING BUG, reproduced exactly, NOT fixed: `$scope.getList()`
//   opens with `if (!$scope.currentfilter.appointmentdate) return;` --
//   `currentfilter.appointmentdate` is never assigned a truthy value anywhere
//   in this controller (its one assignment, at initialization, is commented
//   out), so this guard always trips and `getList()` always returns before
//   ever calling `appointment/Appointment/GetAppointments`. Even if the guard
//   didn't trip, the next two lines call `$filter(...)`, and `$filter` is not
//   among this controller's injected dependencies, so it would throw
//   immediately. Net effect: `vm.gridConfig.data` (this screen's `rows`) is
//   never populated by any live code path -- the grid is always empty as
//   currently deployed. Reproduced faithfully: the wiring below calls the
//   real (broken) `$scope.getList()` on every filter change exactly like the
//   original template's `ng-change`/`on-enter` handlers did, rather than
//   working around or repairing the bug.
export const AppointmentsListTopBar: React.FC<ScreenProps> = ({ reactProps, onAction }) => {
  const currentfilter = reactProps?.currentfilter || {};
  const showCalendar = !!reactProps?.showCalendar;
  const dispatch = dispatchOf(onAction);
  const [mrn, setMrn] = useState(currentfilter.MRN ?? '');

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm, flexWrap: 'wrap' }}>
      <div style={{ minWidth: 220 }}>
        <Input
          placeholder="MRN / Name"
          leftIcon="fas fa-search"
          value={mrn}
          onChange={(e) => { setMrn(e.target.value); dispatch('mrnChange', { value: e.target.value }); }}
          onKeyDown={(e) => { if (e.key === 'Enter') dispatch('search'); }}
        />
      </div>
      <button type="button" className="btn-add" title="Add Appointment" onClick={() => dispatch('addNew')}>
        <i className="fa fa-plus" aria-hidden="true" />
      </button>
      <label
        id="calenderid"
        className="btn-add"
        style={{ backgroundColor: '#e8311f', borderColor: '#9d1d14', cursor: 'pointer' }}
        onClick={() => dispatch('toggleView')}
      >
        <i className={`fa ${showCalendar ? 'fa-list' : 'fa-calendar'}`} aria-hidden="true" />
      </label>
      <button type="button" tabIndex={-1} className="btn-add" title="Dashboard" onClick={() => dispatch('backtoList')}>
        <i className="fa fa-home" aria-hidden="true" />
      </button>
    </div>
  );
};

export const AppointmentsListFilterTable: React.FC<ScreenProps> = ({ reactProps, onAction }) => {
  const currentfilter = reactProps?.currentfilter || {};
  const currentcontext = reactProps?.currentcontext || {};
  const lookup = reactProps?.lookup || {};
  const dispatch = dispatchOf(onAction);

  return (
    <table id="bannerdetails">
      <tbody>
        <tr>
          <td>Appointment Type</td>
          <td>
            <Select
              options={toOptions(lookup.AppointmentType)}
              value={currentfilter.AppointmentTypeId ?? ''}
              disabled={!!currentcontext.candisableappttype}
              onChange={(v) => dispatch('appointmentTypeChange', { value: v })}
            />
          </td>
          <td>From Date</td>
          <td>
            <DatePicker
              value={toDateInputValue(currentfilter.fromdate)}
              onChange={(v) => dispatch('fromDateChange', { value: v })}
            />
          </td>
          <td>To Date</td>
          <td>
            <DatePicker
              value={toDateInputValue(currentfilter.todate)}
              onChange={(v) => dispatch('toDateChange', { value: v })}
            />
          </td>
          <td>Department</td>
          <td>
            <Select
              options={toOptions(lookup.Department)}
              value={currentfilter.DepartmentId ?? ''}
              onChange={(v) => dispatch('departmentChange', { value: v })}
            />
          </td>
        </tr>
        <tr>
          <td>Doctor</td>
          <td colSpan={1}>
            <MultiSelectCheckboxFilter
              list={lookup.Doctor || []}
              selected={currentfilter.DoctorId}
              onChange={(value) => dispatch('doctorFilterChange', { value })}
            />
          </td>
          <td>Appointment Status</td>
          <td>
            <Select
              options={toOptions(lookup.AppointmentStatus)}
              value={currentfilter.AppointmentStatusId ?? ''}
              onChange={(v) => dispatch('statusChange', { value: v })}
            />
          </td>
          <td />
          <td />
        </tr>
      </tbody>
    </table>
  );
};

// Local reproduction of the real `<multiselectchk>` vendor widget, matching
// the exact same component already duplicated per-file in
// AllInpatientListScreen.tsx/CurrentInpatientScreen.tsx (no shared
// design-system multi-select exists yet).
const MultiSelectCheckboxFilter: React.FC<{
  list: LookupOption[];
  selected?: string;
  onChange: (value: string) => void;
}> = ({ list, selected, onChange }) => {
  const [open, setOpen] = useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const selectedIds = (selected || '').split(',').filter(Boolean).map((s) => parseInt(s, 10));

  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const toggle = (id: number) => {
    const next = selectedIds.includes(id) ? selectedIds.filter((x) => x !== id) : [...selectedIds, id];
    onChange(next.join(','));
  };

  const summary = selectedIds.length === 0
    ? 'None selected'
    : selectedIds.length <= 3
      ? list.filter((l) => selectedIds.includes(l.Id)).map((l) => l.Text).join(', ')
      : `${selectedIds.length} selected`;

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%' }}>
      <div
        onClick={() => setOpen((v) => !v)}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          height: 32, padding: '0 10px', fontSize: '13px', fontFamily: typography.fontFamily,
          color: selectedIds.length ? colors.textMain : colors.textSubtle,
          backgroundColor: colors.surface, border: `1px solid ${open ? colors.primary : colors.border}`,
          borderRadius: 4, cursor: 'pointer', boxSizing: 'border-box',
        }}
      >
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{summary}</span>
        <i className={`fa-solid fa-chevron-${open ? 'up' : 'down'}`} style={{ fontSize: '10px', color: colors.textSubtle }} />
      </div>
      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, zIndex: 1000,
          backgroundColor: colors.surface, border: `1px solid ${colors.border}`, borderRadius: 4,
          boxShadow: '0 4px 12px rgba(0,0,0,0.12)', maxHeight: 200, overflowY: 'auto',
        }}>
          {list.length === 0 && <div style={{ padding: '8px 10px', fontSize: '12px', color: colors.textSubtle }}>No options</div>}
          {list.map((item) => (
            <label
              key={item.Id}
              style={{ display: 'flex', alignItems: 'center', gap: spacing.sm, padding: '6px 10px', fontSize: '13px', cursor: 'pointer', color: colors.textMain }}
            >
              <input type="checkbox" checked={selectedIds.includes(item.Id)} onChange={() => toggle(item.Id)} />
              {item.Text}
            </label>
          ))}
        </div>
      )}
    </div>
  );
};

export const AppointmentsListGrid: React.FC<ScreenProps> = ({ reactProps, onAction }) => {
  const rows = reactProps?.rows || [];
  const pager = reactProps?.pager || {};
  const dispatch = dispatchOf(onAction);

  const columns: DataTableColumn<AppointmentRow>[] = [
    {
      key: 'apptdatetime',
      header: 'Appointment Time',
      render: (row) => `${formatDate(row.AppointmentDate)} ${row.StartTime || ''}`.trim(),
    },
    {
      key: 'patient',
      header: 'Patient Name',
      render: (row) => {
        const p = row.Patient;
        return (
          <a
            onClick={() => dispatch('handleEvents', { actionType: 'patientinfo', entity: row })}
            title={`${p?.Title?.Description || ''} ${p?.FirstName || ''} / ${p?.MRN || ''} / ${p?.Age ?? ''} / ${p?.Gender?.Description || ''}`}
            style={{ cursor: 'pointer' }}
          >
            {p?.MRN && <span>{p.MRN}&nbsp;/</span>}
            {p?.Title?.Description && <span><b>{p.Title.Description}</b>&nbsp;</span>}
            <span>{p?.FirstName}</span>&nbsp;<span>{p?.LastName}</span>
            {p?.Age ? <span>/&nbsp;{p.Age}</span> : null}
          </a>
        );
      },
    },
    { key: 'category', header: 'Category', field: 'AppointmentCategory.Name' },
    {
      key: 'slot',
      header: 'Slot Time',
      render: (row) => `${row.StartTime || ''} - ${row.EndTime || ''}`,
    },
    {
      key: 'doctor',
      header: 'Doctor',
      render: (row) => personName(row.User),
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <span style={{ display: 'inline-block', height: 15, width: 20, borderRadius: 7, background: row.AppointmentStatus?.ColorCode || '#ccc' }} />
          <span>{row.AppointmentStatus?.Description}</span>
        </span>
      ),
    },
  ];

  return (
    <div>
      <DataTable<AppointmentRow>
        columns={columns}
        rows={rows}
        rowKey={(r) => r.Id}
        emptyText="No appointments found"
        clientSort={false}
        actions={(row) => (
          <span
            className="grid-action"
            title="Edit"
            onClick={() => dispatch('handleEvents', { actionType: 'edit', entity: row })}
            style={{ cursor: 'pointer' }}
          >
            <img className="drhms-edit-button" src="assets/svg/edit.svg" alt="Edit" aria-hidden="true" />
          </span>
        )}
      />
      <div style={{ marginTop: spacing.md }}>
        <Pagination
          currentPage={pager.currentPage || 1}
          totalItems={pager.totalItems || 0}
          pageSize={pager.pageSize || 25}
          onPageChange={(page) => dispatch('pageChange', { page })}
        />
      </div>
    </div>
  );
};
