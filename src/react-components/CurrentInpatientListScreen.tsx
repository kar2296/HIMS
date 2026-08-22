import React from 'react';
import { colors, spacing, typography } from '../components/ui/tokens';
import { Select } from '../components/ui/Select';
import { Input } from '../components/ui/Input';
import { DataTable, type DataTableColumn } from '../components/ui/DataTable';
import { Pagination } from '../components/ui/Pagination';
import { Card, FilterBar } from '../components/ui/Card';

interface LookupItem {
  Id: number;
  Text: string;
}

interface NamedRef {
  Description?: string;
  [key: string]: any;
}

interface PersonRef {
  MRN?: string;
  Title?: NamedRef;
  FirstName?: string;
  LastName?: string;
  Age?: number | string;
  Gender?: NamedRef;
  [key: string]: any;
}

interface EncounterEntity {
  Id: number;
  VisitIdentifier?: string;
  AdmissionDate?: string;
  Patient?: PersonRef;
  PatientId?: number;
  Doctor?: PersonRef;
  WardMaster?: { WardName?: string };
  WardRoomMaster?: { RoomNo?: string };
  WardRoomBedMaster?: { BedNo?: string };
  Guarantor?: { GuarantorName?: string };
  ReferralName?: string;
  NoOfDays?: number;
  DischargeorderstatusId?: number;
  PatientCertificate?: { CertificateStatus?: NamedRef };
  AdmissionStatusId?: number;
  [key: string]: any;
}

interface CurrentFilter {
  facilityid?: number;
  WardId?: number;
  WardTypeId?: number;
  DoctorId?: number;
  admissionstatusid?: number | string;
  GuarantorId?: number;
  patientnamemrn?: string;
  PatientNameMRN?: string;
  [key: string]: any;
}

interface Pager {
  totalItems?: number;
  currentPage?: number;
  pageSize?: number;
  startIndex?: number;
}

interface ReactPropsShape {
  items?: EncounterEntity[];
  lookup?: { Ward?: LookupItem[]; Guarantor?: LookupItem[]; [key: string]: any };
  currentfilter?: CurrentFilter;
  context?: string;
  pager?: Pager;
}

interface ScreenProps {
  reactProps?: ReactPropsShape;
  onAction?: (actionName: string, payload?: any) => void;
}

// Cell text for the Patient Name column -- mirrors the real cellTemplate's
// Title/FirstName/LastName/Age/Gender concatenation exactly.
function patientLabel(p?: PersonRef): React.ReactNode {
  if (!p) return null;
  return (
    <>
      {p.Title?.Description && <><b>{p.Title.Description}</b>{' '}</>}
      <b>{p.FirstName}</b>{' '}
      <b>{p.LastName}</b>{' '}
      <span>/</span>{' '}
      <span>{p.Age}</span>{' '}
      <span>/</span>{' '}
      <span>{p.Gender?.Description}</span>
    </>
  );
}

// Cell text for the Doctor Name column -- mirrors the real cellTemplate's
// Title/FirstName/LastName concatenation exactly (no Age/Gender there).
function doctorLabel(p?: PersonRef): React.ReactNode {
  if (!p) return null;
  return (
    <>
      <span>{p.Title?.Description}</span>{' '}
      <span>{p.FirstName}</span>{' '}
      <span>{p.LastName}</span>
    </>
  );
}

// ---------------------------------------------------------------------------
// currentinpatientlist -- the real, live `app.currentinpatients` screen
// (public/js/hims-states.js, url /currentinpatients), controller
// `currentinpatientsListController`, template currentinpatientlist.html.
//
// NOTE ON A SIBLING FILE THAT LOOKS LIKE THIS ONE BUT ISN'T:
// public/views/emr/registration/currentinpatients/currentinpatients.js (a much
// larger, different controller `currentinpatientsController`) is NOT this
// screen. It is registered only under `app.currentinpatient` (singular) inside
// public/js/custom-states.js -- and that script tag is commented out in both
// index.html and dist/index.html, so custom-states.js never executes and that
// state/controller is unreachable dead code today. It was intentionally left
// untouched; this migration targets only the real, live plural-named screen.
//
// Real, disclosed pre-existing quirks preserved as-is, NOT fixed:
// - The "Ward" filter's <ui-select> is bound to `currentfilter.WardTypeId` but
//   its options list is `lookup.Ward` (not `lookup.WardType`, which the
//   controller separately fetches via initLookup() and never uses anywhere).
//   Reproduced verbatim: the Ward dropdown here is populated from
//   reactProps.lookup.Ward while still writing to the WardTypeId filter key.
// - `currentfilter.WardId` is initialized to -1 in the controller but nothing
//   reads or writes it again (dead init) -- not surfaced here, matching the
//   real template (which has no control bound to WardId either).
// - `currentfilter.patientnamemrn` (lowercase) is initialized to '' in the
//   controller, but the real template's search box and the real getList()
//   call both use `currentfilter.PatientNameMRN` (capital P) instead -- the
//   lowercase field is dead/unused. Only PatientNameMRN is wired here.
// - Column list has two columns both bound to field "VisitIdentifier"
//   (headers "S.NO" and "Visit No" -- the "S.NO" column does NOT show a row
//   number, it shows the same visit identifier twice) and two columns both
//   bound to "PatientCertificate.CertificateStatus.Description" (headers
//   "Lab Clr" / "Radiology Clr" -- both display the exact same underlying
//   value). Reproduced verbatim, not deduplicated or fixed.
// - The "D.Order" column renders the raw numeric `DischargeorderstatusId`
//   with no lookup/label formatting in the real cellTemplate either --
//   reproduced as a bare number here, not a status badge/description.
// - The Doctor Name column's real cellTemplate wires
//   ng-click="handleEvents('patientinfo', entity)" -- the SAME action as the
//   Patient Name column -- so clicking the doctor's name opens the patient
//   info popup, not any doctor detail. Reproduced verbatim via the same
//   'patientinfo' dispatch on both cells.
// - The real template has NO controls at all for facility, doctor, admission
//   status, referral, request no, visit identifier, patient id, department,
//   admission type, service rate category, or diagnosis filters, even though
//   getList() builds API Params for all of them from $scope.currentfilter /
//   $scope.advancedfilter. Those Params keys stay at whatever the controller
//   already defaults them to (admissionstatusid is overwritten to a
//   comma-joined 3-status string by the controller's own setDefaults(), still
//   entirely inside the unchanged native code) -- none of this is
//   reconstructed or exposed here, since no live UI reaches it today.
// - $scope.openAdvancedFilter() / the whole advanced-filter dynamic-form modal
//   (schema with FromDate/ToDate/Patient/Doctor/Department/AdmissionType/
//   Referral/Guarantor/ServiceRateCategory/Diagnosis/Attender/IsReadmission),
//   plus addNew(), filter(), and print(), are all real functions on $scope but
//   have NO trigger element anywhere in the real 60-line template (no
//   `#btnadvanced`, no ng-click referencing any of them) -- dead/orphaned
//   code today. Not wired to any control here, matching current reality.
// - The real template's action-icon column (Pharmacy Pending / Discharge
//   Advice / Discharge, wired to handleEvents('edit'|'delete'|'cancel'|
//   'view'|'show')) is entirely commented out of the live markup. Not
//   rendered here either -- only the 'patientinfo' path (used by the Patient
//   Name and Doctor Name cells) is reachable today.
// - The home/back icon button only appears when Context is one of
//   frontoffice/billing/nursing/surgery/qm, exactly matching the real
//   ng-if -- reproduced with the same condition.
// ---------------------------------------------------------------------------
export const CurrentInpatientListScreen: React.FC<ScreenProps> = ({ reactProps, onAction }) => {
  const {
    items = [],
    lookup = {},
    currentfilter = {},
    context,
    pager = {},
  } = reactProps || {};
  const dispatch = (action: string, payload?: any) => { if (onAction) onAction(action, payload); };

  const columns: DataTableColumn<EncounterEntity>[] = [
    { key: 'sno', header: 'S.NO', field: 'VisitIdentifier' },
    {
      key: 'admissiondate', header: 'Admission Date & Time', field: 'AdmissionDate',
      render: (e) => {
        if (!e.AdmissionDate) return null;
        const d = new Date(e.AdmissionDate);
        if (isNaN(d.getTime())) return null;
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const dd = String(d.getDate()).padStart(2, '0');
        const dateStr = `${dd}-${months[d.getMonth()]}-${d.getFullYear()}`;
        const hh = String(d.getHours()).padStart(2, '0');
        const mm = String(d.getMinutes()).padStart(2, '0');
        return <><span>{dateStr}</span> <span>{hh}:{mm}</span></>;
      },
    },
    { key: 'visitno', header: 'Visit No', field: 'VisitIdentifier' },
    { key: 'patientid', header: 'Patient ID', render: (e) => e.Patient?.MRN },
    {
      key: 'patientname', header: 'Patient Name',
      render: (e) => (
        <a href="javascript:void(0)" onClick={() => dispatch('patientinfo', { entity: e })} style={{ color: colors.primary, cursor: 'pointer', textDecoration: 'none' }}>
          {patientLabel(e.Patient)}
        </a>
      ),
    },
    {
      key: 'roomdetails', header: 'Room Details',
      render: (e) => (
        <>
          {e.WardMaster?.WardName && <span>{e.WardMaster.WardName}</span>}
          {e.WardRoomMaster && <span>/</span>}
          {e.WardRoomMaster?.RoomNo && <span>{e.WardRoomMaster.RoomNo}</span>}
          {e.WardRoomMaster && <span>/</span>}
          {e.WardRoomBedMaster?.BedNo && <span>{e.WardRoomBedMaster.BedNo}</span>}
        </>
      ),
    },
    {
      key: 'doctorname', header: 'Doctor Name',
      render: (e) => (
        <span onClick={() => dispatch('patientinfo', { entity: e })} style={{ cursor: 'pointer' }}>
          {doctorLabel(e.Doctor)}
        </span>
      ),
    },
    { key: 'guarantor', header: 'Payer Name', field: 'Guarantor.GuarantorName' },
    { key: 'referral', header: 'Referral Name', field: 'ReferralName', width: '7%' },
    { key: 'noofdays', header: 'No.Of Days', field: 'NoOfDays', width: '7%' },
    { key: 'dorder', header: 'D.Order', field: 'DischargeorderstatusId' },
    { key: 'summary', header: 'Lab Clr', field: 'PatientCertificate.CertificateStatus.Description' },
    { key: 'summary2', header: 'Radiology Clr', field: 'PatientCertificate.CertificateStatus.Description' },
  ];

  const pageSize = pager.pageSize || 25;
  const totalItems = pager.totalItems || 0;
  const currentPage = pager.currentPage || 1;

  const showBackButton = context === 'frontoffice' || context === 'billing' || context === 'nursing' || context === 'surgery' || context === 'qm';

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto', padding: `${spacing.sm} ${spacing.xs} ${spacing.xl}`, fontFamily: typography.fontFamily }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.lg }}>
        <h4 style={{ ...typography.sectionHeading, margin: 0, color: colors.textMain, fontFamily: typography.fontFamily }}>IP Patients List</h4>
        {showBackButton && (
          <button
            type="button"
            title="Dashboard"
            onClick={() => dispatch('backtoList')}
            style={{ width: 30, height: 30, borderRadius: 4, border: 'none', background: colors.primary, color: '#fff', cursor: 'pointer' }}
          >
            <i className="fa fa-home" aria-hidden="true" />
          </button>
        )}
      </div>

      <Card padding={spacing.md} style={{ marginBottom: spacing.lg }}>
        <FilterBar>
          <div style={{ minWidth: 200 }}>
            {/* Real bug preserved: labeled/filed as "Ward" but options come
                from lookup.Ward while writing to filter key WardTypeId --
                see file-level comment. */}
            <Select
              label="Ward"
              value={currentfilter.WardTypeId ?? ''}
              onChange={(v) => dispatch('filterChange', { field: 'WardTypeId', value: Number(v) })}
              options={(lookup.Ward || []).map((o) => ({ value: o.Id, label: o.Text }))}
            />
          </div>
          <div style={{ minWidth: 200 }}>
            <Select
              label="Insurance"
              value={currentfilter.GuarantorId ?? -1}
              onChange={(v) => dispatch('filterChange', { field: 'GuarantorId', value: Number(v) })}
              options={(lookup.Guarantor || []).map((o) => ({ value: o.Id, label: o.Text }))}
            />
          </div>
          <div style={{ minWidth: 260 }}>
            <Input
              label="Search Patient/UHID"
              value={currentfilter.PatientNameMRN ?? ''}
              onChange={(e) => dispatch('filterChange', { field: 'PatientNameMRN', value: e.target.value })}
              onKeyDown={(e) => { if (e.key === 'Enter') dispatch('search'); }}
              placeholder="Search Patient/UHID/Visit#/Mobile#"
              leftIcon="fas fa-search"
            />
          </div>
        </FilterBar>
      </Card>

      <DataTable<EncounterEntity>
        columns={columns}
        rows={items}
        rowKey={(e) => e.Id}
        emptyText="No records"
      />

      <Pagination
        currentPage={currentPage}
        totalItems={totalItems}
        pageSize={pageSize}
        onPageChange={(page) => dispatch('pageChange', { page })}
      />
    </div>
  );
};
