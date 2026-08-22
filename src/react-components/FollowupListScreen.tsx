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
  FollowupType?: LookupItem[];
  FollowupStatus?: LookupItem[];
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

interface FollowupEntity {
  Id: number;
  FirstFollowupDate?: string;
  Patient?: PatientInfo;
  Department?: { DepartmentName?: string };
  Team?: { Description?: string };
  DoctorName?: string;
  FollowupType?: { Description?: string };
  FollowupStatus?: { Description?: string };
  Encounter?: { Id?: number };
  [key: string]: any;
}

interface CurrentFilter {
  PatientName?: string;
  DoctorId?: number;
  DepartmentId?: number;
  UnitId?: number;
  AdmissionDate?: string; // ISO yyyy-mm-dd, converted from the real currentfilter.AdmissionDate (a Date via uib-datepicker-popup) by the controller bridge
  MobileNo?: string;
  FollowupTypeId?: number;
  FollowupStatusId?: number;
  [key: string]: any;
}

interface Pager {
  totalItems?: number;
  currentPage?: number;
  pageSize?: number;
}

interface ReactPropsShape {
  items?: FollowupEntity[];
  lookup?: Lookup;
  currentfilter?: CurrentFilter;
  pager?: Pager;
}

interface ScreenProps {
  reactProps?: ReactPropsShape;
  onAction?: (actionName: string, payload?: any) => void;
}

// Mirrors the real cellTemplate's own 'dd-MMM-yyyy' AngularJS date filter on FirstFollowupDate.
function formatDate(val?: string): string {
  if (!val) return '';
  const d = new Date(val);
  if (isNaN(d.getTime())) return '';
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const dd = String(d.getDate()).padStart(2, '0');
  return `${dd}-${months[d.getMonth()]}-${d.getFullYear()}`;
}

// ---------------------------------------------------------------------------
// followup-list (app.patientfollowuptab.followup, FollowupListController) --
// renders inside the already-migrated patientfollowup-tab shell's
// <div ui-view>, sibling of pending-list (PendingFollowupListScreen). Shows
// the actual PatientFollowup records (registration/patientfollowup/
// GetPatientFollowups, server-side paginated) as opposed to pending-list's
// raw Encounters, plus the shared "add/edit follow-up" modal
// (patientfollowup-form, migrated separately as PatientFollowupFormScreen).
//
// THREE MOUNTS, same technique as PendingFollowupListScreen: the real
// .html's first filter row is [Name/MRN input] [Doctor <autosearch>]
// [Department] [Unit], second row is [Date] [Mobile No] [Followup Type]
// [Status]. Doctor is a live, debounced, server-searched typeahead (config:
// vm.doctorcontrolconfig, api 'SystemSettings/User/GetUsers', presearch/
// postsearch/formatdisplay hooks, only queries when >2 chars typed). Left as
// a NATIVE, untouched <autosearch> directive in the .html, sitting between
// the Name mount and the rest-of-filters mount, all three sharing the same
// reactProps/handleReactAction as the grid mount below. currentfilter.
// DoctorId itself is bound directly by ng-model on the native widget and is
// never read or written by this React code.
//
// Real, disclosed pre-existing quirks/bugs preserved as-is, NOT fixed:
// - ADMISSION DATE FILTER IS DEAD, SAME BUG CLASS AS pending-list.js: the
//   real Date field has a genuine ng-change="getList()" (so changing it DOES
//   trigger a refetch, reproduced here via 'filterChangeAndSearch'), but
//   getList()'s own Params array has that entry commented out
//   (`//{ Key: 6, Value: $scope.currentfilter.AdmitDate }` -- note it even
//   reads the wrong property name, AdmitDate, which does not exist anywhere
//   on currentfilter; the real bound field is AdmissionDate). So picking a
//   date always re-runs the search but the date itself is never actually
//   sent to the server and never filters anything.
// - DOCTOR AUTOSEARCH SELECTION NEVER TRIGGERS A REFETCH AT ALL (worse than
//   pending-list's variant): the real markup's only wiring on <autosearch>
//   is `itemchange="onDoctorSelected($select.selected)"` -- there is no
//   `on-enter` here (unlike pending-list.js's autosearch, which at least has
//   a working `on-enter="getList()"`), and `onDoctorSelected` is not defined
//   anywhere in this controller. So selecting a doctor updates
//   currentfilter.DoctorId (via ng-model) but calls nothing -- the grid does
//   not refresh with the new doctor filter applied until some OTHER control
//   triggers getList() (a ui-select ng-change, or Enter in Name/Mobile).
//   Left entirely untouched/native; not reproduced or fixed here.
// - presearchdoctor() (feeding the native Doctor autosearch's own live
//   server query) reads `{ Key: 1, Value: $scope.currentfilter.MRN }` --
//   `currentfilter.MRN` is never set anywhere in this controller (the real
//   bound name filter field is `currentfilter.PatientName`); this Param is
//   always `{ Key: 1, Value: undefined }`. Native/untouched; disclosed only.
// - PATIENT-NAME CLICK IS A SILENT NO-OP: the cellTemplate's
//   `ng-click="grid.appScope.handleEvents('patientinfo',row)"` calls the
//   real handleEvents(), whose if/else only handles 'edit' and 'delete' --
//   'patientinfo' falls through untouched, so clicking a patient's name does
//   nothing. Reproduced below as a real dispatch('patientinfo', ...) that
//   the controller bridge deliberately does NOT wire to anything, matching
//   this exact silent no-op (same as pending-list.js).
// - EDIT PASSES A SHAPE-MISMATCHED "encounter" PARAM: handleEvents('edit',
//   row) opens 'app.patientfollowuptab.patientfollowup' with
//   `{ id: row.entity.Id, eid: row.entity.Encounter.Id, encounter:
//   row.entity }`. The form controller (PatientFollowUpFormController)
//   unconditionally reads `$scope.Encounter.PatientId`, `.DoctorId`,
//   `.DepartmentId`, `.TeamId`, and (if present) `.UserTeam.Team.Description`
//   off whatever object is passed as `encounter` -- i.e. it expects a flat
//   Encounter-shaped object. Here `encounter` is `row.entity`, this
//   controller's own PatientFollowup grid row, whose only fields this
//   file's columnDefs ever reference are nested ones -- `Patient.MRN`,
//   `Department.DepartmentName`, `Team.Description`, plus `DoctorName` and
//   `Encounter.Id` directly. No top-level `PatientId`/`DepartmentId`/
//   `UnitId`/`UserTeam` field is ever referenced by this file, so it is not
//   verifiable from the client code alone whether the live API additionally
//   returns those flat fields on a PatientFollowup row; if it does not,
//   `$scope.item.PatientId` (and therefore the form's <patientbanner>) ends
//   up undefined when editing from this specific screen. Flagged as an
//   observed shape mismatch versus the form's assumptions, not fixed here,
//   and not independently reproducible/verifiable from the frontend alone.
// - ADD NEW IS UNREACHABLE, SAME AS pending-list.js: addNew()/openModal(0)
//   are real, but the only "Add New" button markup in the real
//   followup-list.html is fully commented out -- there is currently no
//   control anywhere on this screen that calls addNew(). Not rendered here,
//   matching the live page. Also: were it ever reachable, openModal(0) only
//   passes `{ id: 0 }` (no `eid`/`encounter` keys at all), and the form
//   controller does `$scope.Encounter = modalConfig.params.encounter;` then
//   immediately `$scope.item.PatientId = $scope.Encounter.PatientId` with no
//   guard -- reading `.PatientId` off `undefined` would throw. See the
//   matching disclosure in PatientFollowupFormScreen.tsx.
// - backToList() targets state 'app.qualificationsetuptab.PatientFollowup'
//   -- an unrelated, seemingly copy-pasted state name with no matching
//   route in this module -- and has zero call sites in the real
//   followup-list.html. Dead function, not rendered/dispatched here (same
//   as pending-list.js).
// - setDefaults() is a real function defined in this controller but never
//   called anywhere in the file -- dead code, not reproduced.
// - A large block of an OLDER handleEvents('edit', ...) implementation is
//   left commented out in the real file, opening a DIFFERENT, nonexistent
//   modal name ('app.patientfollowuptab.followup') with flat params
//   (patientid/doctorid/doctorname/procedureid/departmentid/procedurename/
//   unit/teamname) -- dead code, not reproduced. (The app's
//   modalConfigProvider does separately register that exact
//   'app.patientfollowuptab.followup' name pointing at a nonexistent
//   'patientfollowup.js'/'patientfollowup.html' pair -- also dangling/dead,
//   as already disclosed on PendingFollowupListScreen.)
// - Sort mapping: this screen uses the real angular-ui-grid library
//   (`ui-grid="vm.gridConfig"`). Sortable is enabled below only for columns
//   backed by a plain string field (Date, MRN, Department, Unit, Refer
//   Doctor, Followup Type, Status); the Patient-Name (object) and Actions
//   (numeric Id) columns are left non-sortable as a presentational
//   simplification only, matching PendingFollowupListScreen's convention.
// ---------------------------------------------------------------------------

export const FollowupNameFilterScreen: React.FC<ScreenProps> = ({ reactProps, onAction }) => {
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

export const FollowupFiltersScreen: React.FC<ScreenProps> = ({ reactProps, onAction }) => {
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
          value={currentfilter.UnitId ?? ''}
          onChange={(v) => dispatch('filterChangeAndSearch', { field: 'UnitId', value: Number(v) })}
        />
      </div>
      <div style={{ minWidth: 160 }}>
        {/* Real bug: this filter refetches on change but is never actually sent to the
            server (dead Param, wrong property name in the real getList() too) -- see
            disclosure comment above. Reproduced unchanged. */}
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
          options={toOptions(lookup.FollowupType)}
          value={currentfilter.FollowupTypeId ?? ''}
          onChange={(v) => dispatch('filterChangeAndSearch', { field: 'FollowupTypeId', value: Number(v) })}
        />
      </div>
      <div style={{ minWidth: 180 }}>
        <Select
          label="Status"
          options={toOptions(lookup.FollowupStatus)}
          value={currentfilter.FollowupStatusId ?? ''}
          onChange={(v) => dispatch('filterChangeAndSearch', { field: 'FollowupStatusId', value: Number(v) })}
        />
      </div>
    </div>
  );
};

export const FollowupGridScreen: React.FC<ScreenProps> = ({ reactProps, onAction }) => {
  const { items = [], pager = {} } = reactProps || {};
  const dispatch = (action: string, payload?: any) => { if (onAction) onAction(action, payload); };

  const columns: DataTableColumn<FollowupEntity>[] = [
    {
      key: 'date', header: 'Date', field: 'FirstFollowupDate', sortable: true,
      render: (e) => <span>{formatDate(e.FirstFollowupDate)}</span>,
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
    { key: 'unit', header: 'Unit', field: 'Team.Description', sortable: true },
    { key: 'referdoctor', header: 'Refer Doctor', field: 'DoctorName', sortable: true },
    { key: 'followuptype', header: 'Followup Type', field: 'FollowupType.Description', sortable: true },
    { key: 'status', header: 'Status', field: 'FollowupStatus.Description', sortable: true },
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
      <DataTable<FollowupEntity>
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
