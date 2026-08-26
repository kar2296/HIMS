import React, { useState } from 'react';

interface ChecklistRow {
  Id?: number;
  Patient?: { Title?: { Description?: string }; FirstName?: string; LastName?: string; MRN?: string; Age?: number; Gender?: { Description?: string } };
  BillNumber?: string;
  BillDateTime?: string;
  Encounter?: { VisitIdentifier?: string; AdmissionDate?: string; DischargeDate?: string };
  Guarantor?: { GuarantorName?: string; GuarantorId?: number };
  ChecklistStatus?: { Description?: string };
  EncounterId?: number;
}

interface ChecklistListScreenProps {
  reactProps?: {
    rows?: ChecklistRow[];
  };
  onAction?: (actionName: string, payload?: any) => void;
}

type SortState = { field: string; order: 1 | -1 } | null;

function dotGet(obj: any, path: string): any {
  let broke = false;
  return path.split('.').reduce((o, k) => {
    if (!broke && o && o[k] !== undefined) return o[k];
    broke = true;
    return undefined;
  }, obj);
}

function formatDT(value?: string): { date: string; time: string } {
  if (!value) return { date: '', time: '' };
  const d = new Date(value);
  return {
    date: d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
    time: d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false }),
  };
}

// React bridge migration, results table for the HYBRID checklist.html
// split (see ChecklistFilterScreen.tsx for the title/filter row this
// sandwiches). Replaces <custom-table config="vm.gridConfig">, with
// client-side column-sort emulation. The Patient column's uib-tooltip
// (hover detail) is not reproduced -- tooltips are a presentational
// affordance layered on top of already-visible data, not a distinct
// workflow. The single Action-column link dispatches 'claim', which in
// the original navigates to app.checklist-form with the row's
// EncounterId/GuarantorId/Id.
export const ChecklistListScreen: React.FC<ChecklistListScreenProps> = ({ reactProps, onAction }) => {
  const rows = reactProps?.rows || [];
  const [sort, setSort] = useState<SortState>(null);

  const dispatch = (actionName: string, payload?: any) => {
    onAction?.(actionName, payload);
  };

  const sortedRows = React.useMemo(() => {
    if (!sort) return rows;
    const copy = [...rows];
    copy.sort((a, b) => {
      const x = String(dotGet(a, sort.field) ?? '').toLowerCase();
      const y = String(dotGet(b, sort.field) ?? '').toLowerCase();
      if (x < y) return -sort.order;
      if (x > y) return sort.order;
      return 0;
    });
    return copy;
  }, [rows, sort]);

  const headerClick = (field: string) => {
    setSort((prev) => (prev && prev.field === field ? { field, order: prev.order === 1 ? -1 : 1 } : { field, order: 1 }));
  };

  const claim = (row: ChecklistRow) => {
    dispatch('claim', { EncounterId: row.EncounterId, GuarantorId: row.Guarantor?.GuarantorId, Id: row.Id });
  };

  return (
    <div className="custom-table table-striped table-bordered">
      <table className="table table-bordered bordered table-striped table-condensed datatable">
        <thead>
          <tr>
            <th onClick={() => headerClick('Patient.FirstName')}>Patient Information</th>
            <th onClick={() => headerClick('BillNumber')}>Bill No</th>
            <th onClick={() => headerClick('BillDateTime')}>Bill Date</th>
            <th onClick={() => headerClick('Encounter.VisitIdentifier')}>Visit No.</th>
            <th onClick={() => headerClick('Guarantor.GuarantorName')}>Payer</th>
            <th onClick={() => headerClick('Encounter.AdmissionDate')}>DOA</th>
            <th onClick={() => headerClick('Encounter.DischargeDate')}>DOD</th>
            <th onClick={() => headerClick('ChecklistStatus.Description')}>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {sortedRows.map((row, idx) => {
            const bd = formatDT(row.BillDateTime);
            const ad = formatDT(row.Encounter?.AdmissionDate);
            const dd = formatDT(row.Encounter?.DischargeDate);
            return (
              <tr key={row.Id ?? idx}>
                <td>
                  <a onClick={() => dispatch('patientinfo', { PatientId: (row as any).PatientId })}>
                    {row.Patient?.Title?.Description}&nbsp;
                    {row.Patient?.FirstName}&nbsp;
                    {row.Patient?.LastName}&nbsp;/&nbsp;
                    {row.Patient?.MRN}&nbsp;/&nbsp;
                    {row.Patient?.Age}&nbsp;/&nbsp;
                    {row.Patient?.Gender?.Description}
                  </a>
                </td>
                <td>{row.BillNumber}</td>
                <td>{bd.date}&nbsp;{bd.time}</td>
                <td>{row.Encounter?.VisitIdentifier}</td>
                <td>{row.Guarantor?.GuarantorName}</td>
                <td>{ad.date}&nbsp;{ad.time}</td>
                <td>{dd.date}&nbsp;{dd.time}</td>
                <td>{row.ChecklistStatus?.Description}</td>
                <td>
                  <a className="grid-action btn btn-warning btn-xs" onClick={() => claim(row)}>
                    <i className="fa fa-usd" aria-hidden="true"></i>
                  </a>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
