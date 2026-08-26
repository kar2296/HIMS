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
 * Column notes:
 *  - "S.No" is the 1-based row position (index+1), computed from row
 *    order exactly like the original cellTemplate's {{index+1}}.
 *  - RequestDate is pre-formatted by the AngularJS bridge with the same
 *    $filter('date', 'dd-MMM-yyyy') / $filter('date', 'HH:mm') calls the
 *    original cellTemplate used.
 *  - The status column's original cellTemplate has a malformed
 *    style/class attribute
 *    (style='height:15px;width:20px;border-radius: 7px;margin-top:
 *    4px;class='col-sm-2'></div>) with no background-color ever set --
 *    so today it renders as an invisible/colorless rounded box
 *    regardless of status. Reproduced functionally (an empty box with
 *    the same height/width/border-radius/margin, no color), not as
 *    malformed markup, since JSX cannot represent invalid HTML
 *    attributes -- the visible result (no color) is unchanged.
 *  - The Actions column always dispatches 'fileReturn' with the row's
 *    id, exactly as both original ng-show/ng-hide spans called the same
 *    handleEvents('filereturn', entity) -- only the button label
 *    ("File Receive" vs "View") depends on statusId === 9.
 */
export function TransferredFileReceiveListScreen({ reactProps, onAction }: Props) {
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
          <tr key={row.id}>
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
              <span className="grid-action" onClick={() => onAction('fileReturn', { id: row.id })}>
                <i className="btn text-white dem-color4 btn-xs" aria-hidden="true">
                  <strong>{row.statusId === 9 ? 'View' : 'File Receive'}</strong>
                </i>
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
