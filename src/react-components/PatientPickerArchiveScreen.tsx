import React from 'react';
import { colors, spacing, typography } from '../components/ui/tokens';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { DatePicker } from '../components/ui/DatePicker';
import { DataTable, type DataTableColumn } from '../components/ui/DataTable';
import { Pagination } from '../components/ui/Pagination';
import { Card, FilterBar } from '../components/ui/Card';

interface LookupItem {
  Id: number;
  Text: string;
}

interface NameDescription {
  Description?: string;
}

interface AppointmentInfo {
  [key: string]: any;
}

interface PatientArchiveRow {
  Id?: number;
  MRN?: string;
  Title?: NameDescription;
  FirstName?: string;
  LastName?: string;
  AddressLine1?: string;
  AddressLine2?: string;
  Area?: string;
  City?: string;
  State?: string;
  Country?: string;
  DOB?: string;
  PatientStatus?: NameDescription;
  Mobile?: string;
  LandLine?: string;
  Appointments?: AppointmentInfo[];
  // Set by the real (untouched) getListCallback -- computed on every row but
  // never rendered by any column here or in the real cellTemplates; see
  // disclosure below.
  LatestAppointment?: AppointmentInfo | null;
  [key: string]: any;
}

interface ModelData {
  mrn?: string;
  patientname?: string;
  dateofbirth?: string; // ISO yyyy-mm-dd, converted from the real modeldata.dateofbirth (a plain Date/'') by the controller bridge
  status?: number;
  phoneno?: string;
  From?: string; // ISO yyyy-mm-dd
  To?: string; // ISO yyyy-mm-dd
  PinCode?: string;
  // Real schema field (dynamicform control, model 'GuardianName') -- rendered
  // and editable in the real page, but getList() never includes it in the
  // request Params (no Key maps to it). Purely decorative today. See
  // disclosure below.
  GuardianName?: string;
}

interface Pager {
  totalItems?: number;
  currentPage?: number;
  pageSize?: number;
}

interface ReactPropsShape {
  items?: PatientArchiveRow[];
  modeldata?: ModelData;
  lookup?: { PatientStatus?: LookupItem[] };
  pager?: Pager;
}

interface ScreenProps {
  reactProps?: ReactPropsShape;
  onAction?: (actionName: string, payload?: any) => void;
}

// Mirrors the real <ngformatdate date-val='row.entity.DOB'> directive's own
// 'dd-MMM-yyyy' AngularJS date filter (public/vendor/common/ngCommonHelper.js).
function formatDate(val?: string): string {
  if (!val) return '';
  const d = new Date(val);
  if (isNaN(d.getTime())) return '';
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const dd = String(d.getDate()).padStart(2, '0');
  return `${dd}-${months[d.getMonth()]}-${d.getFullYear()}`;
}

// ---------------------------------------------------------------------------
// patientpickerarchive (app.patpickarchive, PatPickArchiveController) -- a
// fixed MODAL DIALOG (opened via utl.Modal.openFixedDialog('app.patpickarchive',
// {params, confirmCallback})) used to search the full patient archive and
// pick one row back to the caller. Three real call sites today:
// pharmacy-regcumvisit.js, regcumvisitwithbill.js and
// aepatientregistration.js, all via the same "Old Patient" button ->
// OldPatientPickerCallback pattern. Single React mount: filter row (all 9
// dynamicform fields, none of which are a live server-searched
// autosearch/typeahead -- all are plain text/date/select -- so none needed
// to stay native, unlike e.g. FamilyLinkScreen's Doctor autosearch) + grid +
// pager + Cancel, all sharing one reactProps/handleReactAction. The
// modal-header/title markup stays native in the .html (a static translated
// h4, not worth a mount of its own).
//
// Real, disclosed pre-existing quirks/bugs preserved as-is, NOT fixed:
// - DUPLICATE/CONFLICTING DATE-RANGE PARAMS SENT TO THE SEARCH API: the real
//   getList() unconditionally pushes `{Key:9, Value: utl.Formatter.getFilterDate(From)}`
//   and `{Key:10, Value: utl.Formatter.getFilterDate(To)}` into Params, THEN,
//   if modeldata.From is truthy, pushes a SECOND pair of Key:9/Key:10 entries
//   (formatted via `$filter('date')(..., 'yyyy-MM-dd 00:00:00'/'23:59:59')`
//   instead of getFilterDate) -- i.e. whenever a "Date From" is set, the
//   request body carries two different-format values for the same Key twice
//   each. Whatever the backend does with a duplicate key (first-wins,
//   last-wins, or something else) is exactly what happens today; not
//   deduplicated or reconciled here. This bridge only mirrors modeldata back
//   into reactProps -- it does not touch getList()'s Params-building logic.
// - "GuardianName" FILTER FIELD IS PURELY DECORATIVE: the real schema
//   includes a dynamicform text control bound to modeldata.GuardianName
//   (label borrowed from the unrelated fullregistration module's
//   'registration.fullregistration.guardianname.lbl' key, not a
//   patientpicker-specific one -- happens to read "Guardian Name" either
//   way), but modeldata.GuardianName does not even exist in the real
//   defaultdata object, and getList()'s Params array has no Key for it at
//   all. Typing into this field has zero effect on the search request.
//   Reproduced as a real, editable, but functionally inert field -- not
//   wired into search, matching production.
// - "DOB/Age" COLUMN HEADER PROMISES AGE, ONLY SHOWS DATE: the real
//   displayName resolves to "DOB/Age" (registration.patientpicker.dob.lbl)
//   but the cellTemplate (`<ngformatdate date-val='row.entity.DOB'>`) only
//   ever renders the formatted DOB string -- no age value is computed or
//   shown anywhere on this screen. Reproduced with the same header text and
//   date-only cell content, not fabricating an age calculation that does
//   not exist in the real page.
// - "Phone" COLUMN'S REAL FIELD ("Contact") DOES NOT EXIST ON ANY ROW: the
//   real columnDef is `{field: "Contact", ...}` but the cellTemplate reads
//   `entity.Mobile`/`entity.LandLine` directly -- there is no top-level
//   `Contact` property anywhere in the API response. Same bug class already
//   disclosed on the sibling OP/IP list screens (a column field that
//   resolves to undefined on every row, so ui-grid's default sort on that
//   header is a silent no-op in production). Reproduced here as
//   non-sortable, not fabricated as newly-working sort.
// - `LatestAppointment` IS A DEAD COMPUTED FIELD: the real (untouched)
//   getListCallback computes `item.LatestAppointment = item.Appointments?.[0]
//   || null` for every row, but no live columnDef or cellTemplate in this
//   screen's template ever reads it -- the one column that would have
//   (`Appointments[0].AppointmentStatus.Description`, a "visit status"
//   column) is entirely commented out in the real columnDefs array. The
//   computation still runs (unchanged, in the wrapped getListCallback
//   below) but its result is never rendered here either, matching
//   production exactly.
// - SEARCH DOES NOT RESET PAGINATION TO PAGE 1: the real actionClick('apply')
//   just resets/keeps modeldata and calls getList() -- it never resets
//   vm.gridConfig.pagerObj.currentPage. If a user pages to page 3 and then
//   runs a new search, the request still asks for PageNumber 3 of the new
//   result set. Reproduced unchanged: the 'apply'/'reset' dispatch cases
//   below call the real, untouched $scope.actionClick() exactly as the
//   original ng-click did, with no added page reset.
// - $scope.getList(pageNo)'S `pageNo` PARAMETER IS DEAD: every real call
//   site (`actionClick`, the pagination widget's `ng-change="getList()"`)
//   calls it with zero arguments; the parameter is declared but never read
//   in the function body (PageContext.PageNumber always comes from
//   vm.gridConfig.pagerObj.currentPage instead). Not exercised differently
//   here -- 'pageChange' below sets pagerObj.currentPage then calls the
//   real getList() with no argument, exactly like the original pager.
// - MANY LOOKUP OPTIONS ARE FETCHED BUT NEVER RENDERED: initLookup() always
//   requests PatientStatus, Referral, VisitType and Guarantor options, but
//   the schema's Referral/VisitType/Guarantor/IsAdmitted/Area/VisitDate/
//   Country/State/CityTown controls are all commented out in the real
//   schema.controls array -- only PatientStatus is ever used (for the
//   Status select below). The Referral/VisitType/Guarantor fetches are real,
//   unchanged network calls whose results are simply discarded. Not
//   exposed via reactProps here, matching what the real page actually shows.
// ---------------------------------------------------------------------------

export const PatientPickerArchiveScreen: React.FC<ScreenProps> = ({ reactProps, onAction }) => {
  const { items = [], modeldata = {}, lookup = {}, pager = {} } = reactProps || {};
  const dispatch = (action: string, payload?: any) => { if (onAction) onAction(action, payload); };

  const numberedItems = items;

  const columns: DataTableColumn<PatientArchiveRow>[] = [
    { key: 'mrn', header: 'MRN No', field: 'MRN', sortable: true },
    {
      key: 'patientname', header: 'Patient Name', field: 'FirstName', sortable: true,
      render: (e) => (
        <span>
          {e.Title?.Description ? `${e.Title.Description} ` : ''}{e.FirstName} {e.LastName}
        </span>
      ),
    },
    {
      key: 'address', header: 'Address', field: 'AddressLine1', sortable: true,
      render: (e) => {
        if (!e.AddressLine1 && !e.AddressLine2) return null;
        return (
          <div>
            {e.AddressLine1 ? `${e.AddressLine1}, ` : ''}
            {e.AddressLine2 ? `${e.AddressLine2}, ` : ''}
            {e.Area ? `${e.Area}, ` : ''}
            {e.City ? `${e.City}, ` : ''}
            {e.State ? `${e.State}, ` : ''}
            {e.Country ? e.Country : ''}
          </div>
        );
      },
    },
    {
      // Header text is real ("DOB/Age") even though only the date renders -- see disclosure above.
      key: 'dob', header: 'DOB/Age', field: 'DOB', sortable: true,
      render: (e) => <span>{formatDate(e.DOB)}</span>,
    },
    { key: 'regstatus', header: 'Reg. Status', field: 'PatientStatus.Description', sortable: true },
    {
      // Real field is literally "Contact" -- does not exist on any row; see disclosure above.
      key: 'phone', header: 'Phone',
      render: (e) => <span>{e.LandLine ? e.LandLine : (e.Mobile || '')}</span>,
    },
  ];

  const pageSize = pager.pageSize || 25;
  const totalItems = pager.totalItems || 0;
  const currentPage = pager.currentPage || 1;

  return (
    <div style={{ fontFamily: typography.fontFamily }}>
      <Card padding={spacing.md} style={{ marginBottom: spacing.lg }}>
        <FilterBar>
          <div style={{ minWidth: 160 }}>
            <Input
              id="mrn"
              label="MRN/NRIC"
              value={modeldata.mrn ?? ''}
              onChange={(ev) => dispatch('filterChange', { field: 'mrn', value: ev.target.value })}
            />
          </div>
          <div style={{ minWidth: 180 }}>
            <Input
              label="Name"
              value={modeldata.patientname ?? ''}
              onChange={(ev) => dispatch('filterChange', { field: 'patientname', value: ev.target.value })}
            />
          </div>
          <div style={{ minWidth: 160 }}>
            <DatePicker
              label="DOB"
              value={modeldata.dateofbirth ?? ''}
              onChange={(v) => dispatch('filterChange', { field: 'dateofbirth', value: v })}
            />
          </div>
          <div style={{ minWidth: 160 }}>
            <Input
              label="Phone No"
              value={modeldata.phoneno ?? ''}
              onChange={(ev) => dispatch('filterChange', { field: 'phoneno', value: ev.target.value })}
            />
          </div>
          <div style={{ minWidth: 180 }}>
            <Select
              label="Status"
              value={modeldata.status ?? ''}
              onChange={(v) => dispatch('filterChange', { field: 'status', value: Number(v) })}
              options={(lookup.PatientStatus || []).map((o) => ({ value: o.Id, label: o.Text }))}
            />
          </div>
          <div style={{ minWidth: 160 }}>
            <DatePicker
              label="Date From"
              value={modeldata.From ?? ''}
              onChange={(v) => dispatch('filterChange', { field: 'From', value: v })}
            />
          </div>
          <div style={{ minWidth: 160 }}>
            <DatePicker
              label="Date To"
              value={modeldata.To ?? ''}
              onChange={(v) => dispatch('filterChange', { field: 'To', value: v })}
            />
          </div>
          <div style={{ minWidth: 140 }}>
            <Input
              label="Pincode"
              value={modeldata.PinCode ?? ''}
              onChange={(ev) => dispatch('filterChange', { field: 'PinCode', value: ev.target.value })}
            />
          </div>
          <div style={{ minWidth: 180 }}>
            {/* Real field, real label -- but see "purely decorative" disclosure above: never sent to the search API. */}
            <Input
              label="Guardian Name"
              value={modeldata.GuardianName ?? ''}
              onChange={(ev) => dispatch('filterChange', { field: 'GuardianName', value: ev.target.value })}
            />
          </div>
        </FilterBar>
        <div style={{ display: 'flex', gap: spacing.sm }}>
          <button
            type="button"
            onClick={() => dispatch('apply')}
            style={{
              padding: '8px 20px', borderRadius: 4, border: 'none', cursor: 'pointer',
              backgroundColor: colors.primary, color: '#fff', fontFamily: typography.fontFamily, fontWeight: 600,
            }}
          >
            Search
          </button>
          <button
            type="button"
            onClick={() => dispatch('reset')}
            style={{
              padding: '8px 20px', borderRadius: 4, border: 'none', cursor: 'pointer',
              backgroundColor: colors.danger, color: '#fff', fontFamily: typography.fontFamily, fontWeight: 600,
            }}
          >
            Reset
          </button>
        </div>
      </Card>

      <DataTable<PatientArchiveRow>
        columns={columns}
        rows={numberedItems}
        rowKey={(e) => e.Id ?? Math.random()}
        emptyText="No records"
        // Real behavior: selecting (clicking) a row via ui-grid's row-selection
        // API immediately confirms the pick and closes the modal -- there is
        // no separate "select" button.
        onRowClick={(e) => dispatch('selectPatient', { entity: e })}
      />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: spacing.md }}>
        <div style={{ flex: 1 }}>
          <Pagination
            currentPage={currentPage}
            totalItems={totalItems}
            pageSize={pageSize}
            onPageChange={(page) => dispatch('pageChange', { page })}
          />
        </div>
        <button
          type="button"
          onClick={() => dispatch('cancel')}
          style={{
            padding: '6px 16px', borderRadius: 4, border: 'none', cursor: 'pointer',
            backgroundColor: colors.danger, color: '#fff', fontFamily: typography.fontFamily, fontWeight: 600, fontSize: '13px',
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
};
