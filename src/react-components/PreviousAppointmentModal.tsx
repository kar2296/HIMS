import React from 'react';
import { colors, spacing, typography } from '../components/ui/tokens';
import { DataTable, type DataTableColumn } from '../components/ui/DataTable';

interface DoctorLike {
  Title?: { Description?: string };
  FirstName?: string;
  LastName?: string;
}

interface EncounterRow {
  Id?: number;
  VisitIdentifier?: string;
  Doctor?: DoctorLike;
  AdmissionDate?: string;
  DischargeDate?: string;
  ReferralType?: { Description?: string };
  Referral?: { ReferralName?: string };
  EncounterType?: { Description?: string };
  IsNoBill?: boolean;
  IsPaidVisit?: boolean;
  FreeVisit?: number | string;
  BillAmount?: number;
  [key: string]: any;
}

interface ReactPropsShape {
  pid?: number;
  rows?: EncounterRow[];
}

interface ScreenProps {
  reactProps?: ReactPropsShape;
  onAction?: (actionName: string, payload?: any) => void;
}

function formatUser(u?: DoctorLike): string {
  if (!u) return '';
  const parts: string[] = [];
  if (u.Title?.Description) parts.push(u.Title.Description);
  parts.push([u.FirstName, u.LastName].filter(Boolean).join(' '));
  return parts.filter(Boolean).join(' ');
}

function formatDate(d?: string): string {
  if (!d) return '';
  const dt = new Date(d);
  return isNaN(dt.getTime()) ? '' : dt.toLocaleString();
}

// ---------------------------------------------------------------------------
// previous-appointment.js (`previousappointmentController`, modal
// `app.previousappointment`) -- the real "Previous Visits" list opened from
// ~20 real live callers app-wide: checkedinpatients family, patientsearch.js,
// updateappapnmnts.js, appointments-form/appointments-form1.js,
// appointment-form.js/appointment-form-sch.js/appointmentnew-form.js,
// appointmentfromcalendar.js, dischargesummary-form.js, pmhxdashboard.js,
// historyandcomplaints.js (+ its consultations-section twin),
// ipcasesheetsummary.js, ipdashboard.js, surgery-history.js,
// patientportal/dashboard/medicalhistory.js, and regcumvisitwithbill's
// appointmentsview.js.
//
// Real business logic (unchanged in the Angular controller): getList() calls
// Visit/Visit/GetEncounters with Params [{Key:4,pid},{Key:49,pid}] (Key 49
// is a real, undocumented-in-code "IsRegCumBill --> true" filter flag, kept
// verbatim). getListCallback then computes each row's BillAmount by looping
// over item.IsRegCumBill[] and OVERWRITING item.BillAmount on every
// iteration (real pre-existing bug, preserved: if IsRegCumBill has more than
// one entry, only the LAST one's BillAmount survives -- not summed, not
// clamped to the first). Print dispatches
// Visit/Visit/PrintPreviuosSlip (real endpoint name typo, "Previuos", kept
// verbatim) via utl.Http.doDownload.
//
// Real dead code disclosed, NOT reproduced: handleEvents() has a live
// 'encounter' branch ($state.go('patientemr.patientdashboard', {eid}) then
// confirmCallback()) but the real template's only action column is
// commented out in the source -- the ONLY live action rendered today is
// 'print'. No "open encounter" button/link exists anywhere in the real,
// live template, so none is added here either.
// ---------------------------------------------------------------------------
export const PreviousAppointmentModal: React.FC<ScreenProps> = ({ reactProps, onAction }) => {
  const { rows = [] } = reactProps || {};
  const dispatch = (action: string, payload?: any) => { if (onAction) onAction(action, payload); };

  const columns: DataTableColumn<EncounterRow>[] = [
    { key: 'VisitIdentifier', header: 'Visit No', field: 'VisitIdentifier' },
    { key: 'Doctor', header: 'Doctor', render: (row) => formatUser(row.Doctor) },
    { key: 'AdmissionDate', header: 'Admission Date', render: (row) => formatDate(row.AdmissionDate) },
    { key: 'SourceType', header: 'Source Type', field: 'ReferralType.Description' },
    { key: 'ReferralName', header: 'Referral Name', field: 'Referral.ReferralName' },
    { key: 'DischargeDate', header: 'Discharge Date', render: (row) => formatDate(row.DischargeDate) },
    { key: 'EncounterType', header: 'Encounter Type', field: 'EncounterType.Description' },
    { key: 'IsNoBill', header: 'No Bill', render: (row) => (row.IsNoBill ? 'Yes' : 'No') },
    { key: 'IsPaidVisit', header: 'Paid Visit', render: (row) => (row.IsPaidVisit ? 'Yes' : 'No') },
    { key: 'FreeVisit', header: 'Free Visit', field: 'FreeVisit' },
    { key: 'BillAmount', header: 'Amount', render: (row) => (row.BillAmount != null ? Number(row.BillAmount).toFixed(2) : '') },
  ];

  return (
    <div style={{ fontFamily: typography.fontFamily }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md }}>
        <h4 style={{ margin: 0, color: colors.textMain }}>Previous Visits</h4>
        <button onClick={() => dispatch('cancel')} style={{ border: 'none', background: 'none', cursor: 'pointer' }} title="Close">
          <i className="fa fa-times" style={{ color: colors.textSubtle }} />
        </button>
      </div>

      <DataTable<EncounterRow>
        columns={columns}
        rows={rows}
        rowKey={(row) => row.Id ?? `${row.VisitIdentifier}-${row.AdmissionDate}`}
        actions={(row) => (
          <a onClick={() => dispatch('print', { entity: row })} title="print" style={{ cursor: 'pointer' }}>
            <img src="assets/svg/print-black.svg" style={{ width: 16 }} aria-hidden="true" alt="print" />
          </a>
        )}
      />
    </div>
  );
};
