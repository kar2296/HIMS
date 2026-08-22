import React from 'react';
import { colors, spacing, typography } from '../components/ui/tokens';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { DatePicker } from '../components/ui/DatePicker';
import { DataTable, type DataTableColumn } from '../components/ui/DataTable';
import { Pagination } from '../components/ui/Pagination';

interface LookupItem { Id: number; Text: string; }
interface Lookup {
  Department?: LookupItem[];
  Team?: LookupItem[];
  EncounterType?: LookupItem[];
  EncounterStatus?: LookupItem[];
}

interface PersonName {
  Title?: { Description?: string };
  FirstName?: string;
  LastName?: string;
}
interface PatientInfo extends PersonName {
  MRN?: string;
  Age?: string | number;
  Gender?: { Description?: string };
}

interface EncounterEntity {
  Id: number;
  AdmissionDate?: string;
  Patient?: PatientInfo;
  Department?: { DepartmentName?: string };
  UserTeam?: { Team?: { Description?: string } };
  DoctorName?: string;
  EncounterType?: { Description?: string };
  EncounterStatusId?: number;
  // Set client-side by the real (untouched) getListCallback from EncounterStatusId -- 'CheckedIn'/'CheckedOut'
  // ONLY when EncounterStatusId is 1 or 2; any other value leaves this undefined (blank cell), reproduced as-is.
  EncounterStatus?: string;
  [key: string]: any;
}

interface CurrentFilter {
  PatientName?: string;
  DepartmentId?: number;
  TeamId?: number;
  AdmissionDate?: string; // ISO yyyy-mm-dd, converted from the real currentfilter.AdmissionDate (a Date/moment via uib-datepicker-popup) by the controller bridge
  MobileNo?: string;
  EncounterTypeId?: number;
  EncounterStatusId?: number;
  [key: string]: any;
}

interface Pager {
  totalItems?: number;
  currentPage?: number;
  pageSize?: number;
}

interface ReactPropsShape {
  items?: EncounterEntity[];
  lookup?: Lookup;
  currentfilter?: CurrentFilter;
  pager?: Pager;
}

interface ScreenProps {
  reactProps?: ReactPropsShape;
  onAction?: (actionName: string, payload?: any) => void;
}

// Mirrors the real cellTemplate's own 'dd-MMM-yyyy' / 'HH:mm' AngularJS date filters on AdmissionDate.
function formatDate(val?: string): string {
  if (!val) return '';
  const d = new Date(val);
  if (isNaN(d.getTime())) return '';
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const dd = String(d.getDate()).padStart(2, '0');
  return `${dd}-${months[d.getMonth()]}-${d.getFullYear()}`;
}
function formatTime(val?: string): string {
  if (!val) return '';
  const d = new Date(val);
  if (isNaN(d.getTime())) return '';
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

// ---------------------------------------------------------------------------
// pending-list (app.patientfollowuptab.pending, PendingListController) --
// renders inside the already-migrated patientfollowup-tab shell's
// <div ui-view>. Read-only summary grid over Visit/Visit/GetEncounters
// (server-side paginated), plus the shared "add/edit follow-up" modal
// (patientfollowup-form, migrated separately as PatientFollowupFormScreen).
//
// THREE MOUNTS (multi-mount pattern, same technique as
// PreviousOPPatientListScreen/FamilyLinkScreen): the real .html's first
// filter row is [Name/MRN input] [Doctor <autosearch>] [Department] [Team],
// with Doctor a live, debounced, server-searched typeahead (config:
// vm.doctorcontrolconfig, api 'SystemSettings/User/GetUsers', presearch/
// postsearch/formatdisplay hooks, only queries when >2 chars typed). Left
// as a NATIVE, untouched <autosearch> directive in the .html, sitting
// between the Name mount and the rest-of-filters mount, all three sharing
// the same reactProps/handleReactAction as the grid mount below.
// currentfilter.DoctorId itself is bound directly by ng-model on the native
// widget and is never read or written by this React code.
//
// Real, disclosed pre-existing quirks/bugs preserved as-is, NOT fixed:
// - ADMISSION DATE FILTER IS DEAD: the real Date field has a genuine
//   ng-change="getList()" (so changing it DOES trigger a refetch, reproduced
//   here via 'filterChangeAndSearch'), but getList()'s own Params array has
//   that entry commented out (`//{ Key: 6, Value: $scope.currentfilter
//   .AdmitDate }` -- note it even reads the wrong property name, AdmitDate,
//   which does not exist on currentfilter at all). So picking a date always
//   re-runs the search but the date itself is never actually sent to the
//   server and never filters anything.
// - DOCTOR AUTOSEARCH SELECTION IS BROKEN: the real markup has the
//   `itemchange` attribute written TWICE on the same <autosearch> tag --
//   `itemchange="getList()" itemchange="onDoctorSelected($select.selected)"`
//   -- and `onDoctorSelected` is not defined anywhere in this controller.
//   Left entirely untouched/native; not reproduced or fixed here.
// - PATIENT-NAME CLICK IS A SILENT NO-OP: the cellTemplate's
//   `ng-click="grid.appScope.handleEvents('patientinfo',row)"` calls the
//   real handleEvents(), whose if/else only handles 'edit' and 'delete' --
//   'patientinfo' falls through untouched, so clicking a patient's name
//   does nothing. Reproduced below as a real dispatch('patientinfo', ...)
//   that the controller bridge deliberately does NOT wire to anything,
//   matching this exact silent no-op.
// - EDIT OPENS THE SHARED FORM IN "ADD" MODE, NOT "EDIT" MODE: handleEvents
//   ('edit', row) opens 'app.patientfollowuptab.patientfollowup' with
//   `{ eid: row.entity.Id, encounter: row.entity }` -- no `id` param at all.
//   The form controller only calls GetPatientFollowupById when
//   `currentcontext.id > 0`; here currentcontext.id is `parseInt(undefined)`
//   = NaN, so opening "Edit" from this Pending list ALWAYS creates a brand
//   new PatientFollowup record (POSTs Addpatientfollowup on save) rather
//   than loading/updating an existing one. This happens to be the correct
//   real-world behavior for this screen (its rows are plain Encounters that
//   have no follow-up record yet), but it is worth flagging since the same
//   modal is opened with a differently-shaped param set from followup-list.js
//   (which DOES pass a real `id` and genuinely edits). Reproduced unchanged.
// - ADD NEW IS UNREACHABLE: addNew()/openModal(0) are real, but the only
//   "Add New" button markup in the real pending-list.html is fully
//   commented out -- there is currently no control anywhere on this screen
//   that calls addNew(). Not rendered here either, matching the live page.
// - backToList() targets state 'app.qualificationsetuptab.PatientFollowup'
//   -- an unrelated, seemingly copy-pasted state name with no matching
//   route in this module -- and has zero call sites in the real
//   pending-list.html. Dead function, not rendered/dispatched here.
// - setDefaults() is a real function defined in this controller but never
//   called anywhere in the file -- dead code, not reproduced.
// - The app's modalConfigProvider ALSO registers an
//   'app.patientfollowuptab.followup' modal entry pointing at
//   controllerUrl/templateUrl 'patientfollowup.js'/'patientfollowup.html'
//   (controller 'PatientFollowUpController') -- files that do not exist
//   anywhere in this directory. That modal name is never opened from this
//   screen (only from a fully commented-out block in followup-list.js) --
//   dead/unreachable configuration, disclosed here and on FollowupListScreen.
// - Sort mapping: this screen uses the real angular-ui-grid library
//   (`ui-grid="vm.gridConfig"`), not the app's separate homegrown
//   "custom-table" directive that other migrated screens' disclosures
//   describe a `.toLowerCase()` crash for -- that specific crash class was
//   NOT independently re-verified for this grid technology, so it is not
//   claimed here. Sortable is enabled below only for columns backed by a
//   plain string field (Date, MRN, Department, Unit, Refer Doctor, Followup
//   Type, Status); the Patient-Name (object) and Actions (numeric Id)
//   columns are left non-sortable as a presentational simplification only.
// ---------------------------------------------------------------------------

export const PendingFollowupNameFilterScreen: React.FC<ScreenProps> = ({ reactProps, onAction }) => {
  const { currentfilter = {} } = reactProps || {};
  const dispatch = (action: string, payload?: any) => { if (onAction) onAction(action, payload); };
  return (
    <div style={{ fontFamily: typography.fontFamily }}>
      <Input
        label="Name/MRN"
        leftIcon="fas fa-search"
        placeholder="Name/MRN"
        value={currentfilter.PatientName ?? ''}
        onChange={(ev) => dispatch('filterChange', { field: 'PatientName', value: ev.target.value })}
        // Real on-enter directive semantics: typing alone never re-fetches, only Enter does.
        onKeyDown={(ev) => { if (ev.key === 'Enter') { ev.preventDefault(); dispatch('search'); } }}
      />
    </div>
  );
};

export const PendingFollowupFiltersScreen: React.FC<ScreenProps> = ({ reactProps, onAction }) => {
  const { lookup = {}, currentfilter = {} } = reactProps || {};
  const dispatch = (action: string, payload?: any) => { if (onAction) onAction(action, payload); };
  const toOptions = (items?: LookupItem[]) => (items || []).map((o) => ({ value: o.Id, label: o.Text }));

  return (
    <div style={{ display: 'flex', gap: spacing.md, alignItems: 'flex-end', flexWrap: 'wrap', fontFamily: typography.fontFamily }}>
      <div style={{ minWidth: 180 }}>
        <Select
          label="Department"
          options={toOptions(lookup.Department)}
          value={currentfilter.DepartmentId ?? ''}
          onChange={(v) => dispatch('filterChangeAndSearch', { field: 'DepartmentId', value: Number(v) })}
        />
      </div>
      <div style={{ minWidth: 180 }}>
        <Select
          label="Unit"
          options={toOptions(lookup.Team)}
          value={currentfilter.TeamId ?? ''}
          onChange={(v) => dispatch('filterChangeAndSearch', { field: 'TeamId', value: Number(v) })}
        />
      </div>
      <div style={{ minWidth: 160 }}>
        {/* Real bug: this filter refetches on change but is never actually sent to the
            server (dead Param) -- see disclosure comment above. Reproduced unchanged. */}
        <DatePicker
          label="Date"
          value={currentfilter.AdmissionDate ?? ''}
          onChange={(v) => dispatch('filterChangeAndSearch', { field: 'AdmissionDate', value: v })}
        />
      </div>
      <div style={{ minWidth: 160 }}>
        <Input
          label="Mobile No"
          placeholder="Mobile No"
          value={currentfilter.MobileNo ?? ''}
          onChange={(ev) => dispatch('filterChange', { field: 'MobileNo', value: ev.target.value })}
          onKeyDown={(ev) => { if (ev.key === 'Enter') { ev.preventDefault(); dispatch('search'); } }}
        />
      </div>
      <div style={{ minWidth: 180 }}>
        <Select
          label="Followup Type"
          options={toOptions(lookup.EncounterType)}
          value={currentfilter.EncounterTypeId ?? ''}
          onChange={(v) => dispatch('filterChangeAndSearch', { field: 'EncounterTypeId', value: Number(v) })}
        />
      </div>
      <div style={{ minWidth: 180 }}>
        <Select
          label="Status"
          options={toOptions(lookup.EncounterStatus)}
          value={currentfilter.EncounterStatusId ?? ''}
          onChange={(v) => dispatch('filterChangeAndSearch', { field: 'EncounterStatusId', value: Number(v) })}
        />
      </div>
    </div>
  );
};

export const PendingFollowupGridScreen: React.FC<ScreenProps> = ({ reactProps, onAction }) => {
  const { items = [], pager = {} } = reactProps || {};
  const dispatch = (action: string, payload?: any) => { if (onAction) onAction(action, payload); };

  const columns: DataTableColumn<EncounterEntity>[] = [
    {
      key: 'date', header: 'Date', field: 'AdmissionDate', sortable: true,
      render: (e) => (
        <div>
          <div>{formatDate(e.AdmissionDate)}</div>
          <div style={{ fontSize: '11px', color: colors.textSubtle }}>{formatTime(e.AdmissionDate)}</div>
        </div>
      ),
    },
    { key: 'mrn', header: 'MRN', field: 'Patient.MRN', sortable: true },
    {
      // Real bug: 'patientinfo' is dispatched but never handled -- silent no-op. See disclosure above.
      key: 'patientname', header: 'Patient Name',
      render: (e) => (
        <a
          onClick={() => dispatch('patientinfo', { entity: e })}
          title={`${e.Patient?.Title?.Description ?? ''} ${e.Patient?.FirstName ?? ''} ${e.Patient?.LastName ?? ''} | ${e.Patient?.MRN ?? ''} | ${e.Patient?.Age ?? ''} | ${e.Patient?.Gender?.Description ?? ''}`}
          style={{ cursor: 'pointer', color: colors.primary, textDecoration: 'none' }}
        >
          {e.Patient?.Title?.Description ? <span>{e.Patient.Title.Description} </span> : null}
          <span>{e.Patient?.FirstName}</span> <span>{e.Patient?.LastName}</span>
          <span> / {e.Patient?.MRN} / {e.Patient?.Age} / {e.Patient?.Gender?.Description}</span>
        </a>
      ),
    },
    { key: 'department', header: 'Department', field: 'Department.DepartmentName', sortable: true },
    { key: 'unit', header: 'Unit', field: 'UserTeam.Team.Description', sortable: true },
    { key: 'referdoctor', header: 'Refer Doctor', field: 'DoctorName', sortable: true },
    { key: 'followuptype', header: 'Followup Type', field: 'EncounterType.Description', sortable: true },
    { key: 'status', header: 'Status', field: 'EncounterStatus', sortable: true },
    {
      key: 'actions', header: 'Actions',
      render: (e) => (
        <div style={{ display: 'flex', gap: spacing.sm, justifyContent: 'center' }}>
          <button
            type="button" title="Edit"
            onClick={() => dispatch('edit', { entity: e })}
            style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: colors.primary }}
          >
            <i className="fa fa-pencil" aria-hidden="true" />
          </button>
          <button
            type="button" title="Delete"
            onClick={() => dispatch('delete', { entity: e })}
            style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: colors.danger }}
          >
            <i className="fa fa-trash" aria-hidden="true" />
          </button>
        </div>
      ),
    },
  ];

  const pageSize = pager.pageSize || 25;
  const totalItems = pager.totalItems || 0;
  const currentPage = pager.currentPage || 1;

  return (
    <div style={{ fontFamily: typography.fontFamily }}>
      <DataTable<EncounterEntity>
        columns={columns}
        rows={items}
        rowKey={(e) => e.Id}
        emptyText="No records"
      />
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
