import React from 'react';

interface BillRow {
  Id?: number;
  isCompleted?: boolean;
  isSelected?: boolean;
  isEditable?: boolean;
  Status?: number;
  PatientBillDetail?: {
    ServiceName?: string;
    Quantity?: number | string;
    Comments?: string;
    DetCancelReqRaisedStatusId?: number;
  };
  Doctor?: { FirstName?: string };
  BillingRequestStatus?: { Description?: string };
}

interface EditDetailIpBillingRequestListScreenProps {
  reactProps?: {
    BillDetails?: BillRow[];
    IsDisabled?: boolean;
  };
  onAction?: (actionName: string, payload?: any) => void;
}

// React bridge migration (hybrid, mount 2 of 2): renders the bill-detail
// results table and Approved/Rejected buttons. Mounted AFTER the still
// -native <ippatientbanner patientid=... encounterid=...> directive, which
// stays untouched native markup between the two mounts (a live native-only
// widget, not commented out, per this migration's HYBRID rule).
//
// Dispatch for the row checkbox matches by bill.Id (natural key) rather
// than array index, since the original ng-repeat iterates a FILTERED array
// (BillDetails | filter:{Status:1}) over the unfiltered $scope.BillDetails
// -- the same filtered-vs-unfiltered index hazard fixed elsewhere in this
// migration.
//
// Confirmed pre-existing quirks, reproduced as-is:
//  - ServiceName/Quantity/Comments inputs are gated by
//    ng-disabled="!bill.isEditable||IsDisabled"; bill.isEditable and
//    IsDisabled are never set anywhere in this controller, so these three
//    fields are ALWAYS disabled/read-only in current usage -- reproduced
//    as always-disabled inputs here. Quantity's ng-change="calcItem(...)"
//    calls a function that does not exist anywhere in the controller
//    (dead code, unreachable because the field is always disabled) -- not
//    wired up here for the same reason.
//  - The Status column is an ng-disabled="true" text input showing
//    BillingRequestStatus.Description -- rendered here as a disabled
//    input rather than plain text to match the original's exact visual
//    control (a text box, not a span).
export const EditDetailIpBillingRequestListScreen: React.FC<EditDetailIpBillingRequestListScreenProps> = ({ reactProps, onAction }) => {
  const rows = (reactProps?.BillDetails || []).filter((r) => r.Status === 1);
  const isDisabled = reactProps?.IsDisabled ?? false;

  const dispatch = (actionName: string, payload?: any) => {
    onAction?.(actionName, payload);
  };

  return (
    <>
      <div className="col-sm-12">
        <div className="drhms-refund-table">
          <table>
            <tbody>
              {rows.map((bill, idx) => {
                const fieldsDisabled = !bill.isEditable || isDisabled;
                return (
                  <tr key={bill.Id ?? idx} className={bill.isCompleted ? 'ipbilltoopbill' : undefined}>
                    <td>
                      <input
                        type="checkbox"
                        className="custom-checkbox"
                        style={{ width: '16px !important' as any }}
                        title="Adjust Rate"
                        checked={!!bill.isSelected}
                        disabled={(bill.PatientBillDetail?.DetCancelReqRaisedStatusId ?? 0) > 1}
                        onChange={(e) => dispatch('toggleSelect', { id: bill.Id, value: e.target.checked })}
                      />
                    </td>
                    <td>
                      <input type="text" className="form-control" value={bill.PatientBillDetail?.ServiceName ?? ''} disabled={fieldsDisabled} readOnly />
                    </td>
                    <td>
                      <input type="text" className="form-control" value={bill.PatientBillDetail?.Quantity ?? ''} disabled={fieldsDisabled} readOnly />
                    </td>
                    <td>Dr. {bill.Doctor?.FirstName}</td>
                    <td>
                      <input type="text" className="form-control" value={bill.PatientBillDetail?.Comments ?? ''} disabled={fieldsDisabled} readOnly />
                    </td>
                    <td>
                      <input type="text" className="form-control" value={bill.BillingRequestStatus?.Description ?? ''} disabled />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      <div className="row">
        <div className="pull-right">
          <span>
            <button type="button" className="draftbutton" onClick={() => dispatch('approve')}>
              Approved
            </button>
          </span>
          <span>
            <button type="button" className="draftbutton" onClick={() => dispatch('reject')}>
              Rejected
            </button>
          </span>
        </div>
      </div>
    </>
  );
};
