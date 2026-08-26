interface Row {
  index: number;
  teamDescription: string;
  doctorId: number | null;
  doctorShareAmount: string;
}

interface Props {
  reactProps: any;
  onAction: (actionType: string, payload: any) => void;
}

/**
 * Billing > IP Encounter "Doctor Share Update" modal table.
 *
 * Replaces the whole <table> (Team / Doctor / Share Amount), which is a
 * plain ng-repeat over $scope.DocShareDetails (not ui-grid/custom-table)
 * containing one <ui-select> per row for DoctorId. Converted as a single
 * component -- consistent with this migration's established whole-list
 * precedent (e.g. EditDetailIpBillingRequestListScreen) -- rather than
 * mounting a React island inside each ng-repeat row, since Team is
 * read-only text and Share Amount is a plain input in the same row.
 *
 * Rows are correlated by array index (payload.index), safe here because
 * the original ng-repeat iterates $scope.DocShareDetails directly with
 * no filter (unlike editdetailipbillingrequest's filtered list, which
 * correlates by a natural key instead).
 *
 * PRE-EXISTING BUG, reproduced not fixed: the original ui-select's
 * on-select="SelectedDoctor(item,$select.selected)" calls a function
 * that is not defined anywhere in this controller -- selecting a doctor
 * throws inside Angular's on-select callback today. Since ui-select's
 * ng-model binding (item.DoctorId) updates independently of on-select,
 * the selection value itself is unaffected; only the (already broken)
 * on-select callback is not reproduced.
 *
 * "Share Amount" column (header + cells) is conditionally shown via
 * showDoctorShare, matching the original's ng-show="ShowDoctorShare" on
 * both the header <th> and each row's <td>.
 */
export function EditDrShareInfoListScreen({ reactProps, onAction }: Props) {
  const doctorOptions = reactProps?.doctorOptions || [];
  const showDoctorShare = !!reactProps?.showDoctorShare;
  const rows: Row[] = reactProps?.rows || [];

  return (
    <table className="table table-hover table-responsive table-bordered">
      <thead className="bg-subhead">
        <tr>
          <th className="col-sm-2"><span>Team</span></th>
          <th className="col-sm-3"><span>Doctor</span></th>
          {showDoctorShare && <th className="col-sm-2"><span>Share Amount</span></th>}
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.index}>
            <td>{row.teamDescription}</td>
            <td>
              <select
                id="doctorid"
                value={row.doctorId ?? ''}
                onChange={(e) => onAction('doctorChange', { index: row.index, id: parseInt(e.target.value, 10) })}
              >
                <option value="">&nbsp;</option>
                {doctorOptions.map((o: any) => (
                  <option key={o.Id} value={o.Id}>{o.Text}</option>
                ))}
              </select>
            </td>
            {showDoctorShare && (
              <td>
                <input
                  type="text"
                  className="form-control"
                  value={row.doctorShareAmount ?? ''}
                  onChange={(e) => onAction('shareAmountChange', { index: row.index, value: e.target.value })}
                />
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
