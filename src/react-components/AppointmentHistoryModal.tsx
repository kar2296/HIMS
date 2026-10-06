import React from 'react';
import { colors, spacing, typography } from '../components/ui/tokens';
import { DatePicker } from '../components/ui/DatePicker';
import { DataTable, type DataTableColumn } from '../components/ui/DataTable';

interface HistoryRow {
  DoctorName?: string;
  Department?: { DepartmentName?: string };
  StartDate?: string;
  ConsultationStatus?: { Description?: string };
  [key: string]: any;
}

interface ReactPropsShape {
  pid?: number;
  from?: string | null;
  to?: string | null;
  rows?: HistoryRow[];
}

interface ScreenProps {
  reactProps?: ReactPropsShape;
  onAction?: (actionName: string, payload?: any) => void;
}

// ---------------------------------------------------------------------------
// TWO REAL, SEPARATE, LITERALLY-IDENTICAL controllers/modal-states bridged by
// this ONE shared React component (registered twice in main.tsx's
// window.ReactComponents, once per real name):
//   1. appointment-history.js (`appointmenthistoryController`, modal
//      `app.appointmenthistory`) -- 20+ real live callers app-wide
//      (consultationnotes, prescription-form, patientorder-form,
//      dietorder-form, patientdietorder-form, ipdashboard, surgerycalendar,
//      appointments-list.js, viewappoitment.js, appappointments.js, etc).
//   2. view-history.js (`viewhistoryController`, modal `app.viewhistory`) --
//      called from viewappoitment.js and surgerycalendar.js.
// This is a REAL, PRE-EXISTING DUPLICATION BUG/QUIRK in the Angular source,
// not something introduced here: both controllers are byte-for-byte
// identical (same $scope shape, same default date-range filter, same API
// call `Visit/EncounterDoctor/GetEncounterDoctors` with the exact same
// Params Key mapping [16=pid, 17=fromdate, 18=todate], same columns). Two
// separate buttons/menu-actions across the app open what is functionally the
// exact same "Doctor Consultation History" list under two different names.
// Preserved faithfully (not merged/fixed in Angular), but since the UI and
// logic really are identical, one React component is reused for both real
// hollow controllers rather than hand-duplicating the same JSX twice.
//
// Real quirk (both files, preserved, not fixed): `<ControllerName>.$inject =
// [...]` is assigned INSIDE the controller function body (after
// `vm.gridConfig` is built), not immediately after the function declaration
// outside it. In this unminified app that has zero observable effect
// (Angular resolves DI from the function's own parameter names when
// unannotated), but it would silently break under a minified/ng-annotate
// build since the annotation would never be applied before first invocation.
// Not fixed, disclosed only.
// ---------------------------------------------------------------------------
export const AppointmentHistoryModal: React.FC<ScreenProps> = ({ reactProps, onAction }) => {
  const { from, to, rows = [] } = reactProps || {};
  const dispatch = (action: string, payload?: any) => { if (onAction) onAction(action, payload); };

  const columns: DataTableColumn<HistoryRow>[] = [
    { key: 'DoctorName', header: 'Doctor', field: 'DoctorName' },
    { key: 'Department', header: 'Department', field: 'Department.DepartmentName' },
    {
      key: 'StartDate', header: 'Start Date',
      render: (row) => row.StartDate ? new Date(row.StartDate).toLocaleString() : '',
    },
    { key: 'Status', header: 'Status', field: 'ConsultationStatus.Description' },
  ];

  return (
    <div style={{ fontFamily: typography.fontFamily }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md }}>
        <h4 style={{ margin: 0, color: colors.textMain }}>Doctor Consultation History</h4>
        <button onClick={() => dispatch('cancel')} style={{ border: 'none', background: 'none', cursor: 'pointer' }} title="Close">
          <i className="fa fa-times" style={{ color: colors.textSubtle }} />
        </button>
      </div>

      <div style={{ display: 'flex', gap: spacing.md, margin: `${spacing.md} 0` }}>
        <DatePicker
          label="From Date"
          value={from ?? ''}
          onChange={(val) => dispatch('filterChangeAndSearch', { field: 'From', value: val })}
        />
        <DatePicker
          label="To Date"
          value={to ?? ''}
          onChange={(val) => dispatch('filterChangeAndSearch', { field: 'To', value: val })}
        />
      </div>

      <DataTable<HistoryRow>
        columns={columns}
        rows={rows}
        rowKey={(row) => `${row.DoctorName}-${row.StartDate}`}
      />
    </div>
  );
};
