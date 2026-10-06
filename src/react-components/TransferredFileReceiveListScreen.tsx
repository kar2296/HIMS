import React from 'react';
import { spacing, typography } from '../components/ui/tokens';
import { DataTable, type DataTableColumn } from '../components/ui/DataTable';
import { Button } from './Button';

interface Row {
  id: number;
  requestDateDisplay: string;
  requestTimeDisplay: string;
  visitNo: string;
  patientName: string;
  requestUserTitle: string;
  requestUserFirstName: string;
  requestUserLastName: string;
  approveUserTitle: string;
  approveUserFirstName: string;
  approveUserLastName: string;
  doctorName: string;
  statusDescription: string;
  statusId: number;
}

interface Props {
  reactProps: any;
  onAction: (actionType: string, payload: any) => void;
}

/**
 * Billing > IP File Management > Transferred File Receive list.
 *
 * Replaces <custom-table config="vm.gridConfig"></custom-table>.
 *
 * UI-MODERNIZATION RETROFIT: this table now renders through the global
 * design-system DataTable/Button instead of the hand-rolled <table> it was
 * first migrated with. NOTHING behavioral changed -- same rows from the same
 * reactProps, same single dispatch ('fileReturn' with the row id), which the
 * bridge still turns into the existing, unchanged
 * $scope.handleEvents('filereturn', entity).
 *
 * Column-header click-to-sort is restored via DataTable's clientSort, which
 * uses the same case-insensitive string compare as the original custom-table
 * `reOrder` directive, and S.No renumbers with the displayed order exactly as
 * the original {{index+1}} cellTemplate did. Sorting is enabled only on the
 * plain-value columns: the original reOrder throws today on this screen's
 * composite object columns (RequestUser/ApproveUser) and on the numeric Id
 * column, so those stay unsortable rather than reproducing a crash.
 *
 * Other original details preserved:
 *  - RequestDate is pre-formatted by the AngularJS bridge with the same
 *    $filter('date', 'dd-MMM-yyyy') / $filter('date', 'HH:mm') calls.
 *  - The status column's original cellTemplate has a malformed style/class
 *    attribute with no background-color ever set, so its colour box has never
 *    been visible; only the status text it wrapped is rendered.
 *  - The action button toggles "File Receive" / "View" at
 *    MRDIPFileStatusId === 8; both original ng-show/ng-hide spans called the
 *    same handler, so one conditionally-labelled button is equivalent.
 */
export const TransferredFileReceiveListScreen: React.FC<Props> = ({ reactProps, onAction }) => {
  const rows: Row[] = reactProps?.rows || [];
  const headers: string[] = reactProps?.headers || [];
  const header = (idx: number, fallback: string) => headers[idx] || fallback;

  const columns: DataTableColumn<Row>[] = [
    { key: 'sno', header: header(0, 'S.No'), width: '60px', render: (_r, i) => i + 1 },
    {
      key: 'requestdate',
      header: header(1, 'Date'),
      field: 'requestDateDisplay',
      sortable: true,
      render: (r) => (
        <>
          <span>{r.requestDateDisplay} </span>
          <span>{r.requestTimeDisplay}</span>
        </>
      ),
    },
    { key: 'visitno', header: header(2, 'Visit No'), field: 'visitNo', sortable: true },
    { key: 'patientname', header: header(3, 'Patient Name'), field: 'patientName', sortable: true },
    {
      key: 'requestuser',
      header: header(4, 'Requested By'),
      render: (r) => `${r.requestUserTitle || ''} ${r.requestUserFirstName || ''} ${r.requestUserLastName || ''}`.trim(),
    },
    {
      key: 'approveuser',
      header: header(5, 'Approved By'),
      render: (r) => `${r.approveUserTitle || ''} ${r.approveUserFirstName || ''} ${r.approveUserLastName || ''}`.trim(),
    },
    { key: 'doctorname', header: header(6, 'Doctor Name'), field: 'doctorName', sortable: true },
    { key: 'status', header: header(7, 'Status'), field: 'statusDescription', sortable: true },
  ];

  return (
    <div style={{ padding: `0 ${spacing.xs} ${spacing.lg}`, fontFamily: typography.fontFamily }}>
      <DataTable<Row>
        columns={columns}
        rows={rows}
        rowKey={(r) => r.id}
        emptyText="No records found"
        actionsHeader={header(8, 'Actions')}
        actions={(r) => (
          <Button
            variant="primary"
            size="xs"
            text={r.statusId === 8 ? 'View' : 'File Receive'}
            onClick={() => onAction('fileReturn', { id: r.id })}
          />
        )}
      />
    </div>
  );
};
