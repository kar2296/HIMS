import React from 'react';
import { colors, spacing, typography } from '../components/ui/tokens';
import { Input } from '../components/ui/Input';
import { DatePicker } from '../components/ui/DatePicker';
import { DataTable, type DataTableColumn } from '../components/ui/DataTable';
import { Card, FilterBar } from '../components/ui/Card';
import { Tabs } from '../components/ui/Tabs';

interface QMSReasonInfo {
  Description?: string;
}
interface QMSStatusInfo {
  Description?: string;
}

interface QMSPatientRow {
  Id: number; // QMSId -- always present on real GetQMS rows, used as the DataTable row key
  PatientId?: number;
  TokenNo?: string | number;
  FirstName?: string;
  LastName?: string;
  MRN?: string;
  Age?: string | number;
  Mobile?: string;
  QMSReason?: QMSReasonInfo;
  QMSStatus?: QMSStatusInfo;
  QMSStatusId?: number;
  IsPatientCreated?: boolean;
  [key: string]: any;
}

interface ItemFilter {
  MRN?: string;
  PatientName?: string;
  Mobile?: string;
  TokenNumber?: string;
  From?: string; // ISO yyyy-MM-dd, converted from the real item.From (a plain Date) at the bridge boundary
  To?: string; // ISO yyyy-MM-dd, converted from the real item.To (a plain Date) at the bridge boundary
}

interface ReactPropsShape {
  item?: ItemFilter;
  patientData?: QMSPatientRow[];
  showNewPatientDetails?: boolean;
  showOldPatientDetails?: boolean;
  isModal?: boolean;
}

interface ScreenProps {
  reactProps?: ReactPropsShape;
  onAction?: (actionName: string, payload?: any) => void;
}

// ---------------------------------------------------------------------------
// qmspatients (app.qmspatients, QMSPatientController, modal picker, 3 real
// refs -- regcumvisitwithbill.js/pharmacy-regcumvisit.js's/
// aepatientregistration.js's $scope.pickQMSPatients(), all calling
// utl.Modal.openFixedDialog('app.qmspatients', { params: {}, confirmCallback:
// QMSPatientPickerCallback })). Lets the user look up a QMS (queue/token)
// patient by MRN / Name / Mobile / Token # and date range, across a New vs.
// Old patients toggle, then "Pick" a row to hand {qmsid, pid, patientdata}
// back to the caller via confirmCallback (== $uibModalInstance.close, always
// set here because every real caller passes a truthy `params: {}`). All API
// calls/validation/business logic stay in the untouched Angular controller
// (getList/getListCallback/initLookup/lookupCallback/sendPatientData/
// openNewPatientDetailsTab/openOldPatientDetailsTab); this component only
// dispatches back into those same unchanged functions.
//
// Real, disclosed pre-existing quirks/bugs preserved as-is, NOT fixed:
// - There is NO close/cancel/dismiss control anywhere in the real
//   qmspatients.html (verified against the untouched dist/ snapshot of this
//   same template) -- unlike sibling modal screens (e.g.
//   DeactivateRemarksScreen), which do have a real "x" wired to
//   cancelCallback(). $scope.cancelCallback IS defined (= $uibModalInstance
//   .dismiss) but nothing in the template ever calls it. Reproduced
//   faithfully: no close/X button is added here, since the real modal has
//   none -- picking a patient (which calls confirmCallback and closes the
//   dialog) or the browser modal backdrop/escape are the only ways out
//   today.
// - getList()'s very first guard, `if ($scope.item.TokenNumber != '')`, is
//   effectively broken: $scope.item is seeded with only
//   FacilityId/From/To/CurrentDate/CurrentUserId, so item.TokenNumber starts
//   out `undefined`, and `undefined != ''` is `true` in JS (loose `!=` does
//   NOT treat undefined as equal to ''). So this "require a From date when a
//   token number was typed" guard actually fires on EVERY getList() call
//   where TokenNumber has never been touched at all, not only when the user
//   actually entered a token number. It happens to stay invisible in
//   practice because item.From defaults to today's date, but clearing the
//   From date while TokenNumber is still untouched trips
//   "Please Select Date" even though the user never touched Token #.
//   Reproduced unchanged -- 'search'/'filterChange' dispatch straight into
//   the real getList(), this bridge does not patch the guard.
// - getList()'s three From/To branches contain dead local variables:
//   the "From and To" branch computes EndFrmDate/EndToDate but only ever
//   pushes StartFrmDate/StartToDate -- EndFrmDate/EndToDate are always
//   discarded. Left as-is (real dead code inside the untouched function).
// - $scope.lookup (populated by initLookup()'s
//   'General/Options/getoptions' / Guarantor request) is fetched and stored
//   but never read anywhere else in this controller or the real template --
//   the entire lookup round-trip exists only as a side-effecting gate before
//   lookupCallback unconditionally calls $scope.getList(). Not exposed via
//   reactProps; no UI is fabricated for it, matching the real page (which
//   renders nothing from it either).
// - The h4 page title in the real template is genuinely malformed:
//   `<h4 ... translate="registration.qmspatient.pagetitle.lbl"
//   {{ClaimCountInfo.ClaimTotal.TotalClaimCount}}></h4>` -- a bare
//   `{{...}}` interpolation sitting where an attribute would go, referencing
//   `ClaimCountInfo`, a scope variable this controller never defines. It
//   silently interpolates to an empty string and parses as a harmless
//   attribute-less token; almost certainly leftover copy/paste from an
//   unrelated claims screen. Not reproduced (nothing meaningful to
//   reproduce) -- only the real, resolved title text ("Find Tokens", per
//   registration.qmspatient.pagetitle.lbl in public/i18n/emr/registration/
//   en.json) is shown.
// - The "Pick" button's real markup is `translate="Pick"` -- a bare literal
//   word used AS the i18n key (not a real dotted key like
//   `registration.qmspatient.action.lbl`). No `"Pick"` key exists in this
//   module's translation file, so AngularJS's $translate falls back to the
//   key text itself, i.e. it happens to display "Pick" anyway. Same
//   literal-string-as-key harmless quirk documented on sibling screens
//   (e.g. `$translate.instant('Please Select Date')` in this very
//   controller, and 'Please Select Date...' style text on
//   AllOPPatientListScreen).
// - The New/Old Patients "tabs" are two real, always-visible buttons
//   (`openNewPatientDetailsTab()` / `openOldPatientDetailsTab()`), and both
//   the New and Old panels in the real template render byte-for-byte
//   identical table markup bound to the SAME `PatientData` array -- there is
//   no separate "old" dataset; only which panel is shown (ng-show) differs,
//   and both panels always call the same getList()/PatientData under the
//   hood. Reproduced with a single shared grid (mirrors what's actually on
//   screen) rather than fabricating two independent grids/datasets.
// - No pagination exists on this screen (PageContext.PageSize is sent as -1
//   / "all rows"), so none is rendered here either.
// ---------------------------------------------------------------------------
export const QMSPatientsScreen: React.FC<ScreenProps> = ({ reactProps, onAction }) => {
  const {
    item = {},
    patientData = [],
    showOldPatientDetails = false,
    isModal,
  } = reactProps || {};
  const dispatch = (action: string, payload?: any) => { if (onAction) onAction(action, payload); };

  const activeKey = showOldPatientDetails ? 'old' : 'new';

  const columns: DataTableColumn<QMSPatientRow>[] = [
    { key: 'tokenno', header: 'Token No', field: 'TokenNo' },
    {
      key: 'name', header: 'Name',
      render: (r) => <span>{r.FirstName} &nbsp; {r.LastName}</span>,
    },
    { key: 'mrn', header: 'MRN', field: 'MRN' },
    { key: 'age', header: 'Age', field: 'Age' },
    { key: 'mobile', header: 'Mobile', field: 'Mobile' },
    { key: 'reason', header: 'Reason', field: 'QMSReason.Description' },
    { key: 'registration', header: 'Registration', field: 'QMSStatus.Description' },
    {
      key: 'action', header: 'Action', align: 'center',
      render: (r) => (
        <button
          id="btnSave"
          type="button"
          onClick={() => dispatch('sendPatientData', { qmsId: r.Id, patientId: r.PatientId, patient: r })}
          style={{
            border: 'none', borderRadius: 4, padding: '4px 10px', cursor: 'pointer',
            backgroundColor: colors.success, color: '#fff', fontSize: '12px', fontWeight: 600,
          }}
        >
          Pick
        </button>
      ),
    },
  ];

  return (
    <div style={{ fontFamily: typography.fontFamily }}>
      {isModal && (
        <div style={{
          backgroundColor: '#597a9a', color: '#fff', padding: '4px 10px 10px',
          marginBottom: spacing.md,
        }}>
          <h4 style={{ margin: 0 }}>Find Tokens</h4>
        </div>
      )}

      <div style={{ padding: `0 ${spacing.md} ${spacing.xl}` }}>
        <Card padding={spacing.md} style={{ marginBottom: spacing.md }}>
          <FilterBar>
            <div style={{ minWidth: 180 }}>
              <Input
                label="MRN"
                placeholder="MRN"
                value={item.MRN ?? ''}
                onChange={(e) => dispatch('filterChange', { field: 'MRN', value: e.target.value })}
                onKeyDown={(e) => { if (e.key === 'Enter') dispatch('search'); }}
              />
            </div>
            <div style={{ minWidth: 200 }}>
              <Input
                label="Patient Name"
                placeholder="Patient Name"
                value={item.PatientName ?? ''}
                onChange={(e) => dispatch('filterChange', { field: 'PatientName', value: e.target.value })}
                onKeyDown={(e) => { if (e.key === 'Enter') dispatch('search'); }}
              />
            </div>
            <div style={{ minWidth: 180 }}>
              <Input
                label="Mobile No"
                placeholder="Mobile"
                value={item.Mobile ?? ''}
                onChange={(e) => dispatch('filterChange', { field: 'Mobile', value: e.target.value })}
                onKeyDown={(e) => { if (e.key === 'Enter') dispatch('search'); }}
              />
            </div>
          </FilterBar>
          <FilterBar>
            <div style={{ minWidth: 160 }}>
              <Input
                label="Token No"
                placeholder="Token Number"
                value={item.TokenNumber ?? ''}
                onChange={(e) => dispatch('filterChange', { field: 'TokenNumber', value: e.target.value })}
                onKeyDown={(e) => { if (e.key === 'Enter') dispatch('search'); }}
              />
            </div>
            <div style={{ minWidth: 160 }}>
              <DatePicker
                label="From"
                value={item.From ?? ''}
                onChange={(v) => dispatch('filterChange', { field: 'From', value: v })}
              />
            </div>
            <div style={{ minWidth: 160 }}>
              <DatePicker
                label="To"
                value={item.To ?? ''}
                onChange={(v) => dispatch('filterChange', { field: 'To', value: v })}
              />
            </div>
          </FilterBar>
        </Card>

        <Tabs
          items={[
            { key: 'new', label: 'New Patients' },
            { key: 'old', label: 'Old Patients' },
          ]}
          activeKey={activeKey}
          onChange={(key) => dispatch(key === 'old' ? 'openOldPatientDetailsTab' : 'openNewPatientDetailsTab')}
        />

        <div style={{ maxHeight: 450, overflowY: 'auto' }}>
          <DataTable<QMSPatientRow>
            columns={columns}
            rows={patientData}
            rowKey={(r) => r.Id}
            emptyText="No records"
          />
        </div>
      </div>
    </div>
  );
};
