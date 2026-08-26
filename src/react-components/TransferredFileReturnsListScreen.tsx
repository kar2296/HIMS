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
 * Billing > IP File Management > Transferred File Returns list.
 *
 * Replaces <custom-table config="vm.gridConfig"></custom-table>. Same
 * shape as ipmrdfiletransfer-list's table (see that component's notes
 * on the shared custom-table directive's row-highlight/ng-style
 * mechanism, the not-reproduced click-to-sort headers, and the
 * malformed status-box cellTemplate), with two differences specific to
 * this screen:
 *  - The Actions column toggles "File Return" / "View" at
 *    MRDIPFileStatusId === 8 (this screen's threshold, not 9 like
 *    transferredfilereceive-list) -- both original spans call the same
 *    handleEvents('filereturn', entity).
 *  - Row highlight is still keyed on statusId === 7 (background: red).
 */
export function TransferredFileReturnsListScreen({ reactProps, onAction }: Props) {
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
              <span className="grid-action" onClick={() => onAction('fileReturn', { id: row.id })}>
                <i className="btn text-white dem-color4 btn-xs" aria-hidden="true">
                  <strong>{row.statusId === 8 ? 'View' : 'File Return'}</strong>
                </i>
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
