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
 * Replaces <custom-table config="vm.gridConfig"></custom-table>. Same
 * shape/omissions as the sibling ipmrdfiletransfer-list /
 * transferredfilereceive-list / transferredfilereturns-list tables (see
 * those components' notes on the shared custom-table directive's
 * not-reproduced click-to-sort headers and the malformed status-box
 * cellTemplate), with two differences specific to this screen:
 *  - No ApproveUser column (this columnDefs list doesn't have one).
 *  - No vm.gridConfig.background config -- there is no row-highlight
 *    rule on this screen, unlike ipmrdfiletransfer-list/
 *    transferredfilereturns-list's red-on-status-7 highlight.
 *  - The single "Receive" action button is always visible (no ng-show/
 *    ng-hide toggle), dispatching 'receive' -> handleEvents('filerequest',
 *    entity) -> $state.go('app.ipfiletransferreceiveform', {id}).
 */
export function IpFileTransferReceiveListScreen({ reactProps, onAction }: Props) {
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
            <td>{row.doctorName}</td>
            <td>
              <div style={{ height: 15, width: 20, borderRadius: 7, marginTop: 4 }} />
              &nbsp;<span>{row.statusDescription}</span>
            </td>
            <td>
              <span className="grid-action" onClick={() => onAction('receive', { id: row.id })}>
                <i className="btn text-white dem-color4 btn-xs" aria-hidden="true">
                  <strong>Receive</strong>
                </i>
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
