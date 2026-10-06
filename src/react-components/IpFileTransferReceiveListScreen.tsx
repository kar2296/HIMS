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
  doctorName: string;
  statusDescription: string;
}

interface Props {
  reactProps: any;
  onAction: (actionType: string, payload: any) => void;
}

/**
 * Billing > IP File Management > IP File Transfer Receive list.
 *
 * Replaces <custom-table config="vm.gridConfig"></custom-table>.
 *
 * UI-MODERNIZATION RETROFIT, identical in intent to the sibling
 * TransferredFileReceiveListScreen: renders through the global design-system
 * DataTable/Button instead of a hand-rolled <table>, with no behavioral
 * change -- same rows, same single dispatch ('receive' with the row id),
 * still handled by the existing unchanged
 * $scope.handleEvents('filerequest', entity).
 *
 * Screen-specific, matching this controller's own columnDefs:
 *  - No ApproveUser column (this screen's columnDefs has none).
 *  - No vm.gridConfig.background config, so no row-highlight rule exists
 *    here (unlike ipmrdfiletransfer-list/transferredfilereturns-list).
 *  - One always-visible "Receive" action (no ng-show/ng-hide toggle).
 *
 * Sorting/S.No/status-box notes are the same as the sibling screen: sort is
 * enabled only on plain-value columns, S.No renumbers with the displayed
 * order as {{index+1}} did, and the status cellTemplate's colour box has
 * never been visible (malformed style attribute, no background-color).
 */
export const IpFileTransferReceiveListScreen: React.FC<Props> = ({ reactProps, onAction }) => {
  const rows: Row[] = reactProps?.rows || [];
  const headers: string[] = reactProps?.headers || [];
  const header = (idx: number, fallback: string) => headers[idx] || fallback;

  const columns: DataTableColumn<Row>[] = [
    { key: 'sno', header: header(0, 'S.NO'), width: '60px', render: (_r, i) => i + 1 },
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
    { key: 'doctorname', header: header(5, 'Doctor Name'), field: 'doctorName', sortable: true },
    { key: 'status', header: header(6, 'Status'), field: 'statusDescription', sortable: true },
  ];

  return (
    <div style={{ padding: `0 ${spacing.xs} ${spacing.lg}`, fontFamily: typography.fontFamily }}>
      <DataTable<Row>
        columns={columns}
        rows={rows}
        rowKey={(r) => r.id}
        emptyText="No records found"
        actionsHeader={header(7, 'Actions')}
        actions={(r) => (
          <Button
            variant="primary"
            size="xs"
            text="Receive"
            onClick={() => onAction('receive', { id: r.id })}
          />
        )}
      />
    </div>
  );
};
