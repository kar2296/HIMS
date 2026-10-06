interface Row {
  id: number;
  refundDateDisplay: string;
  mrn: string;
  refundidentifier: string;
  patientTitle: string;
  patientFirstName: string;
  patientMRN: string;
  patientAge: string;
  patientGender: string;
  paymentType: string;
  guarantorName: string;
  refundAmount: string;
}

interface Props {
  reactProps: any;
  onAction: (actionType: string, payload: any) => void;
}

/**
 * Billing > Refund Picker modal grid ("Find Refunds").
 *
 * Replaces the ui-grid="vm.gridConfig" + ui-grid-selection grid. This
 * grid's entire purpose in the original is a PICKER: clicking anywhere on
 * a row fires gridApi.selection.on.rowSelectionChanged, which calls
 * $scope.confirmCallback({ rid: row.entity.Id }) -- i.e.
 * $uibModalInstance.close(...) -- immediately closing the modal and
 * returning the selected refund's Id to whatever screen opened this
 * picker. Reproduced here as a native onClick per row dispatching
 * 'rowSelected', which the bridge turns straight into the same
 * confirmCallback({ rid }) call. The original vm.gridConfig.onRegisterApi
 * handler is left in place in the controller (documented, unreferenced)
 * since no ui-grid directive remains to invoke it.
 *
 * Column rendering reproduces each original cellTemplate exactly:
 *  - RefundDateTime: pre-formatted by the AngularJS bridge using the same
 *    $filter('date', 'dd-MM-yyyy HH:mm:ss') as the original cellTemplate,
 *    falling back to "N/A" when RefundDateTime is falsy.
 *  - EncountertypeId column: the original cellTemplate hardcodes the
 *    literal text "OP" regardless of the actual field value -- reproduced
 *    as a static string, not derived from data (pre-existing quirk, not
 *    fixed here).
 *  - Patient column: the original renders a chain of separate <a href>
 *    segments (Title, '.', FirstName, '/', MRN, '/', Age, '/', Gender).
 *    These anchors carry no real href value and no click handler of their
 *    own in the original -- selection is driven by the ui-grid row click,
 *    not by these anchors -- reproduced with the same bare <a href="">
 *    markup rather than converting them to plain <span> text, so any
 *    existing browser navigation quirk from an empty href is unchanged.
 *
 * Pagination (uib-pagination bound to vm.gridConfig.pagerObj) and the
 * dynamicform filter panel above the grid are untouched native
 * AngularJS/third-party directives -- out of scope for this
 * ui-select/ui-grid conversion. The set-grid-height/reduce-height="200"
 * fixed-viewport-height behavior and ui-grid's row virtualization are
 * scoped, deliberate omissions (same as billhistory-list) -- the table
 * renders at natural height with no virtualization.
 */
export function RefundPickerGridScreen({ reactProps, onAction }: Props) {
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
        {rows.map((row) => (
          <tr key={row.id} style={{ cursor: 'pointer' }} onClick={() => onAction('rowSelected', { id: row.id })}>
            <td>{row.refundDateDisplay}</td>
            <td>{row.mrn}</td>
            <td>OP</td>
            <td>{row.refundidentifier}</td>
            <td>
              <a href="">{row.patientTitle}</a>
              <a href="">.</a>
              <a href="">{row.patientFirstName}</a>
              <a href="">/</a>
              <a href="">{row.patientMRN}</a>
              <a href="">/</a>
              <a href="">{row.patientAge}</a>
              <a href="">/</a>
              <a href="">{row.patientGender}</a>
            </td>
            <td>{row.paymentType}</td>
            <td>{row.guarantorName}</td>
            <td>{row.refundAmount}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
