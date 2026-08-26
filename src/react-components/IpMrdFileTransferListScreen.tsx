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
 * Billing > IP File Management > IP File Transfer list.
 *
 * Replaces <custom-table config="vm.gridConfig"></custom-table>.
 *
 * Row highlighting: the original vm.gridConfig.background.style config
 * ({ field: 'MRDIPFileStatusId', value: { 7: { background: 'red',
 * color: '#fff' } } }) is applied by custom-table.html via ng-style on
 * the whole <tr> -- reproduced exactly here as inline style on the row
 * when statusId === 7, no style otherwise.
 *
 * Not reproduced (consistent with prior custom-table conversions in
 * this codebase, e.g. IpBillingRequestListScreen): the custom-table
 * directive's ambient click-to-sort column headers (ctrl.reOrder). That
 * generic sort does a case-insensitive string compare on the raw field
 * value and would actually throw for several of this screen's columns
 * today (RequestUser/ApproveUser are objects, not strings; Id is a
 * number) -- a pre-existing partially-broken feature of the shared
 * custom-table directive, out of scope for this screen's
 * ui-select/custom-table conversion. rz-table's column-resize
 * (enableColumnResizing) is likewise not reproduced, same as
 * billhistory-list's equivalent virtualization/resize omission.
 *
 * Column notes mirror transferredfilereceive-list's equivalent table:
 * S.No is the 1-based row position; RequestDate is pre-formatted by the
 * bridge with the same $filter('date', ...) calls; the status column's
 * malformed style/class cellTemplate (no background-color ever set) is
 * reproduced functionally as a colorless box.
 */
export function IpMrdFileTransferListScreen({ reactProps, onAction }: Props) {
  const headers: string[] = reactProps?.headers || [];
  const rows: Row[] = reactProps?.rows || [];

  return (
    <table className="table">
      <thead>
        <tr>
          {headers.map((h, i) => (
            <th key={i}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, idx) => (
          <tr key={row.id} style={row.statusId === 7 ? { background: 'red', color: '#fff' } : undefined}>
            <td>{idx + 1}</td>
            <td>
              <span>{row.requestDateDisplay} </span>
              <span>{row.requestTimeDisplay}</span>
            </td>
            <td>{row.visitNo}</td>
            <td>{row.patientName}</td>
            <td>
              <span>{row.requestUserTitle}&nbsp;</span>
              <span>{row.requestUserFirstName}&nbsp;</span>
              <span>{row.requestUserLastName}</span>
            </td>
            <td>
              <span>{row.approveUserTitle}&nbsp;</span>
              <span>{row.approveUserFirstName}&nbsp;</span>
              <span>{row.approveUserLastName}</span>
            </td>
            <td>{row.doctorName}</td>
            <td>
              <div style={{ height: 15, width: 20, borderRadius: 7, marginTop: 4 }} />
              &nbsp;<span>{row.statusDescription}</span>
            </td>
            <td>
              <span className="grid-action" onClick={() => onAction('fileTransfer', { id: row.id })}>
                <i className="btn text-white dem-color4 btn-xs" aria-hidden="true">
                  <strong>File Transfer</strong>
                </i>
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
