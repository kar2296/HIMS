import React from 'react';
import { spacing } from '../components/ui/tokens';
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
  Mobile?: string;
}

interface AppointmentRow {
  Id: number;
  AppointmentDate?: string;
  StartTime?: string;
  EndTime?: string;
  AppointmentStatusId?: number;
  Patient?: PatientInfo;
  AppointmentCategory?: { Name?: string };
  User?: PersonName;
  CreatedUser?: PersonName;
  CreatedAt?: string;
  AppointmentStatus?: { Description?: string; ColorCode?: string };
}

interface CurrentFilterShape {
  AppointmentTypeId?: number | string;
  DoctorId?: string;
  AppointmentStatusId?: number | string;
  fromdate?: string;
  todate?: string;
}

interface CurrentContextShape {
  candisableappttype?: boolean;
}

interface LookupShape {
  AppointmentType?: LookupOption[];
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

// Same dd-Mon-yyyy formatting convention already used by AppointmentsListScreen.tsx
// (reproduces the real <ngformatdate> directive's date-only rendering).
function formatDate(val?: string): string {
  if (!val) return '';
  const d = new Date(val);
  if (isNaN(d.getTime())) return '';
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const dd = String(d.getDate()).padStart(2, '0');
  return `${dd}-${months[d.getMonth()]}-${d.getFullYear()}`;
}

// Same ISO yyyy-mm-dd bridge convention as every other DatePicker-backed
// field in this project (see AppointmentFormScreen.tsx's toDateInputValue).
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

// React bridge migration for appointmentnew/viewappoitment.js
// (`appointmentsSchFormController`, state `app.appointmentstab.viewappoitment`
// -- the "View" tab of the appointmentstab family, same shell as
// appointment-form.js/appointments-form.js). All API calls, filtering,
// pagination, and calendar/session logic remain in the AngularJS controller;
// React only renders and dispatches, exactly like every other screen in this
// batch.
//
// Unlike the sibling appointmentnew/appointments-list.js screen (already
// migrated -- see AppointmentsListScreen.tsx), this controller's grid is
// GENUINELY FUNCTIONAL, not perpetually short-circuited: `getList()` opens
// with the identical-looking guard `if (!$scope.currentfilter.appointmentdate)
// return;`, but here `currentfilter.appointmentdate` IS initialized to
// `utl.Formatter.getCurrentDate()` (a real truthy value) at controller
// startup, and `$filter` IS among this controller's injected dependencies
// (both were the two respects in which appointments-list.js's clone of this
// same guard was broken). Confirmed: the guard never trips here and the
// subsequent `$filter('date')(...)` calls succeed, so `GetAppointmentswithoutDetail`
// really is called on every load/filter change and the grid really does
// populate.
//
// Three mounts share one reactProps/handleReactAction:
//  - ViewAppointmentToggleButton: the single calendar/list toggle button
//    (`#calenderid`, CSS class `add-btn` despite the name -- there is no
//    "add appointment" button anywhere on this screen, unlike
//    appointments-list.js's TopBar). Icon driven directly off the real
//    `showCalendar` prop rather than the dead jQuery `.toggleClass()`
//    handler in the .html's inline `<script>` (same precedent as
//    AppointmentsListTopBar -- strictly more correct, same visual intent;
//    the old jQuery listener is harmless dead weight, left untouched).
//  - ViewAppointmentFilterBar: the live `.list-filter` row (From
//    Date/To Date/Appointment Type/Doctor/Appointment Status). Kept behind
//    the SAME `ng-show="!vm.appointment.ShowCalendar"` the original had on
//    the wrapping `.list-filter` div.
//  - ViewAppointmentGrid: replaces `<custom-table config="vm.gridConfig">`
//    + the `uib-pagination` footer with DataTable+Pagination, kept behind
//    the same `ng-show="!vm.appointment.ShowCalendar"` the original had on
//    both the grid's and pager's wrapping divs.
// `<jqx-scheduler>` (the day/week/month calendar view, toggled by the same
// ShowCalendar flag) and the dead `#myModal` help-image popup are left
// completely native/untouched -- same REUSABLE-SUB-WIDGET-PATTERN precedent
// as every other jqx-scheduler screen in this project. `<patientsearch>`
// (bound to `currentfilter.PatientId`, `patientchange="getList()"`) is also
// left fully native, same vendor-directive precedent as every other screen.
//
// CONFIRMED PRE-EXISTING QUIRKS/DEAD CODE, reproduced as-is / left native,
// NOT fixed:
// - There is NO Department filter anywhere in the live template (unlike
//   appointments-list.js, which at least has one, wired to a bypassed
//   `getList()`). `currentfilter.DepartmentId` stays fixed at its
//   initialization value (-1) forever; `$scope.deptChange()` and
//   `$scope.getDoctorOrResources()`/`getDoctorOrResourcesCallback` are
//   entirely dead (zero live callers).
// - `$scope.currentfilter.MRN`/`.Mobile`/`.ResourceId` are never assigned by
//   any live UI element (no MRN/Mobile text input exists on this screen,
//   unlike appointments-list.js's TopBar search box) -- they ride along in
//   `getList()`'s payload (Keys 16/17/6) always empty/undefined.
// - `initDynamicForm()`/`$scope.advancedfilter`/`$scope.openAdvancedFilter()`
//   (the "advanced filter" popover schema) are entirely dead -- no
//   `#btnadvanced` element or any other live trigger exists in the template.
// - `$scope.batchCheckout()` and the whole multi-row-selection block
//   (`vm.gridConfig.enableRowSelection`/`enableFullRowSelection`/
//   `onRegisterApi`) have no live trigger button anywhere in the template
//   (unlike the commented-out block in appointments-list.js, this one is
//   NOT commented out in the .js, but it is still unreachable -- no button
//   ever calls `batchCheckout()`). Not reproduced.
// - `$scope.getAppointmentCategorys()`/`getAppointmentCategorysCallback` and
//   `$scope.opd_dashboard()` have no live callers in the template. Not
//   reproduced.
// - `$scope.showprocessflow()` (the `#myModal` help-image popup trigger) has
//   no live caller; `hideprocessflow()` (`#myModal`'s "X" close) is
//   technically still live markup but the modal it closes can never be
//   shown. Left untouched, natively, in the .html.
// - `$scope.canShowAction(actionType, row)` references a bare `entity`
//   identifier never in scope (guaranteed `ReferenceError` if called) --
//   confirmed unreachable, no column/action in the live grid calls it. Not
//   reproduced (identical bug/finding already disclosed for
//   appointments-list.js's clone of this same function).
// - CONFIRMED DEAD DATA FLOW into the calendar view: `$scope.getListCallback`
//   has BOTH `$scope.prepareAppointments(res.Data)` and
//   `$scope.getAppointmentSessions()` commented out, so real appointment
//   data is never pushed into `$scope.appointmentList`/the scheduler. The
//   jqx-scheduler therefore only ever displays the single hardcoded dummy
//   appointment created once by `createDummyAppt()` at controller init, no
//   matter how the list-view filters/grid are used. Left untouched
//   (native), not fixed.
export const ViewAppointmentToggleButton: React.FC<ScreenProps> = ({ reactProps, onAction }) => {
  const showCalendar = !!reactProps?.showCalendar;
  const dispatch = dispatchOf(onAction);

  return (
    <button
      type="button"
      className="add-btn"
      id="calenderid"
      onClick={() => dispatch('toggleView')}
    >
      <i className={`fas ${showCalendar ? 'fa-list' : 'fa-calendar'}`} aria-hidden="true" />
    </button>
  );
};

export const ViewAppointmentFilterBar: React.FC<ScreenProps> = ({ reactProps, onAction }) => {
  const currentfilter = reactProps?.currentfilter || {};
  const currentcontext = reactProps?.currentcontext || {};
  const lookup = reactProps?.lookup || {};
  const dispatch = dispatchOf(onAction);

  return (
    <>
      <div className="col-sm-2">
        <label className="col-sm-12">From Date</label>
        <div className="col-sm-12">
          <DatePicker
            value={toDateInputValue(currentfilter.fromdate)}
            onChange={(v) => dispatch('fromDateChange', { value: v })}
          />
        </div>
      </div>
      <div className="col-sm-2">
        <label className="col-sm-12">To Date</label>
        <div className="col-sm-12">
          <DatePicker
            value={toDateInputValue(currentfilter.todate)}
            onChange={(v) => dispatch('toDateChange', { value: v })}
          />
        </div>
      </div>
      <div className="col-sm-2">
        <label className="col-sm-12">Appointment Type</label>
        <div className="col-sm-12">
          <Select
            options={toOptions(lookup.AppointmentType)}
            value={currentfilter.AppointmentTypeId ?? ''}
            disabled={!!currentcontext.candisableappttype}
            onChange={(v) => dispatch('appointmentTypeChange', { value: v })}
          />
        </div>
      </div>
      <div className="col-sm-2">
        <label className="col-sm-12">Doctor</label>
        <div className="col-sm-12">
          <MultiSelectCheckboxFilter
            list={lookup.Doctor || []}
            selected={currentfilter.DoctorId}
            onChange={(value) => dispatch('doctorFilterChange', { value })}
          />
        </div>
      </div>
      <div className="col-sm-2">
        <label className="col-sm-12">Appointment Status</label>
        <div className="col-sm-12">
          <Select
            options={toOptions(lookup.AppointmentStatus)}
            value={currentfilter.AppointmentStatusId ?? ''}
            onChange={(v) => dispatch('statusChange', { value: v })}
          />
        </div>
      </div>
    </>
  );
};

// Local reproduction of the real `<multiselectchk>` vendor widget -- same
// per-file duplication already established by AppointmentsListScreen.tsx
// (no shared design-system multi-select exists yet).
const MultiSelectCheckboxFilter: React.FC<{
  list: LookupOption[];
  selected?: string;
  onChange: (value: string) => void;
}> = ({ list, selected, onChange }) => {
  const [open, setOpen] = React.useState(false);
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
          height: 32, padding: '0 10px', fontSize: '13px',
          backgroundColor: '#fff', border: `1px solid ${open ? '#03f' : '#ccc'}`,
          borderRadius: 4, cursor: 'pointer', boxSizing: 'border-box',
        }}
      >
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{summary}</span>
        <i className={`fa-solid fa-chevron-${open ? 'up' : 'down'}`} style={{ fontSize: '10px' }} />
      </div>
      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, zIndex: 1000,
          backgroundColor: '#fff', border: '1px solid #ccc', borderRadius: 4,
          boxShadow: '0 4px 12px rgba(0,0,0,0.12)', maxHeight: 200, overflowY: 'auto',
        }}>
          {list.length === 0 && <div style={{ padding: '8px 10px', fontSize: '12px' }}>No options</div>}
          {list.map((item) => (
            <label
              key={item.Id}
              style={{ display: 'flex', alignItems: 'center', gap: spacing.sm, padding: '6px 10px', fontSize: '13px', cursor: 'pointer' }}
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

export const ViewAppointmentGrid: React.FC<ScreenProps> = ({ reactProps, onAction }) => {
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
    { key: 'mobile', header: 'Mobile', field: 'Patient.Mobile' },
    { key: 'category', header: 'Category', field: 'AppointmentCategory.Name' },
    {
      key: 'slot',
      header: 'Slot Time',
      render: (row) => `${row.StartTime || ''} - ${row.EndTime || ''}`,
    },
    {
      key: 'doctor',
      header: 'Doctor',
      render: (row) => (row.User ? personName(row.User) : ''),
    },
    {
      key: 'createdby',
      header: 'Created By',
      render: (row) => (row.CreatedUser ? personName(row.CreatedUser) : ''),
    },
    {
      key: 'createddate',
      header: 'Created Date',
      render: (row) => formatDate(row.CreatedAt),
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
          <>
            <span
              className="grid-action"
              title="Edit"
              onClick={() => dispatch('handleEvents', { actionType: 'edit', entity: row })}
              style={{ cursor: 'pointer' }}
            >
              <img className="drhms-edit-button" src="assets/svg/edit.svg" alt="Edit" aria-hidden="true" />
            </span>
            {(row.AppointmentStatusId === 2 || row.AppointmentStatusId === 3 || row.AppointmentStatusId === 4) && (
              <span
                className="grid-action"
                title="Reschedule"
                onClick={() => dispatch('handleEvents', { actionType: 'reschedule', entity: row })}
                style={{ cursor: 'pointer' }}
              >
                <i className="fas fa-history" aria-hidden="true" />
              </span>
            )}
          </>
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
