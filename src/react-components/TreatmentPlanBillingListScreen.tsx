import React from 'react';

interface TreatmentPlanRow {
  Id?: number;
  PlanNumber?: string;
  PlanScheduledFrom?: string;
  PlanScheduledTo?: string;
  Doctor?: { Title?: { Description?: string }; FirstName?: string; LastName?: string };
  NoOfDays?: number;
  TotalAmount?: number;
  PlanStatus?: { Description?: string };
}

interface TreatmentPlanDetailRow {
  Id?: number;
  PlanScheduleDate?: string;
  ServiceName?: string;
  PlanStartTime?: string;
  PlanEndTime?: string;
  IsPaid?: boolean;
  ServicePrice?: number;
  PlanStatus?: { Description?: string };
}

interface TreatmentPlanBillingListScreenProps {
  reactProps?: {
    treatmentPlans?: TreatmentPlanRow[];
    treatmentPlanDetails?: TreatmentPlanDetailRow[];
  };
  onAction?: (actionName: string, payload?: any) => void;
}

function formatDate(value?: string): string {
  return value ? new Date(value).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '';
}

function formatCurrency(value?: number): string {
  const n = Number(value ?? 0);
  return n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// React bridge migration, both plain ng-repeat results tables for
// treatmentplanbilling.html (no custom-table/ui-grid, no column sort).
// Table 1 (TreatmentPlan) has 2 edit icons per row (dispatching
// 'viewDetails' -> loads that plan's detail rows into Table 2, and
// 'updateBills' -> either opens the app.updatetreatmentplanbilling
// modal directly if unpaid, or shows a "Partially Paid" error, per
// getDetailsCallback's branching -- both preserved). The "Treatment
// Name" column is commented out/dead in the original (both header and
// cell) -- not rendered here either. Table 2 (TreatmentPlanDetails)
// edit icon dispatches 'detailbills' -> opens the same modal for that
// specific scheduled session if unpaid, or shows "Already Paid...".
// The huge app.updatetreatmentplanbilling modal (4971+690 lines,
// validator-gated) is deferred to the high-risk queue, untouched.
export const TreatmentPlanBillingListScreen: React.FC<TreatmentPlanBillingListScreenProps> = ({ reactProps, onAction }) => {
  const treatmentPlans = reactProps?.treatmentPlans || [];
  const treatmentPlanDetails = reactProps?.treatmentPlanDetails || [];

  const dispatch = (actionName: string, payload?: any) => {
    onAction?.(actionName, payload);
  };

  return (
    <>
      <div className="">
        <div className="bg-pattern">
          <div className="formRoot pharmacycollections" id="mainresponsivetablecontrol">
            <table className="table table-hover table-responsive table-bordered">
              {treatmentPlans && (
                <thead className="bg-subhead">
                  <tr>
                    <th><span>Plan No</span></th>
                    <th><span>From Date</span></th>
                    <th><span>To Date</span></th>
                    <th><span>Doctor Name</span></th>
                    <th><span>No Of Days</span></th>
                    <th><span>Net Amount</span></th>
                    <th><span>Status</span></th>
                    <th><span>Action</span></th>
                  </tr>
                </thead>
              )}
              <tbody>
                {treatmentPlans.map((plan, idx) => (
                  <tr key={plan.Id ?? idx}>
                    <td className="text-left"><span>{plan.PlanNumber}</span></td>
                    <td className="text-left"><span>{formatDate(plan.PlanScheduledFrom)}</span></td>
                    <td className="text-left"><span>{formatDate(plan.PlanScheduledTo)}</span></td>
                    <td className="text-left">
                      <span>{plan.Doctor?.Title?.Description} {plan.Doctor?.FirstName} {plan.Doctor?.LastName}</span>
                    </td>
                    <td className="text-right"><span>{plan.NoOfDays}</span></td>
                    <td className="text-right"><span>{formatCurrency(plan.TotalAmount)}</span></td>
                    <td className="text-right"><span>{plan.PlanStatus?.Description}</span></td>
                    <td>
                      <span onClick={() => dispatch('viewDetails', plan)}>
                        <img className="drhms-edit-button" src="assets/svg/edit.svg" alt="" />
                      </span>
                      <span onClick={() => dispatch('updateBills', plan)}>
                        <img className="drhms-edit-button" src="assets/svg/edit.svg" alt="" />
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="">
        <div className="bg-pattern">
          <div className="formRoot pharmacycollections" id="mainresponsivetablecontrol">
            <table className="table table-hover table-responsive table-bordered">
              {treatmentPlanDetails && (
                <thead className="bg-subhead">
                  <tr>
                    <th><span>Date</span></th>
                    <th><span>Treatment Name</span></th>
                    <th><span>Start Time</span></th>
                    <th><span>End Time</span></th>
                    <th><span>Payment Status</span></th>
                    <th><span>Amount</span></th>
                    <th><span>Status</span></th>
                    <th><span>Action</span></th>
                  </tr>
                </thead>
              )}
              <tbody>
                {treatmentPlanDetails.map((dtl, idx) => (
                  <tr key={dtl.Id ?? idx}>
                    <td className="text-left"><span><span>{formatDate(dtl.PlanScheduleDate)}</span></span></td>
                    <td className="text-left"><span>{dtl.ServiceName}</span></td>
                    <td className="text-left"><span>{formatDate(dtl.PlanStartTime)}</span></td>
                    <td className="text-left"><span>{formatDate(dtl.PlanEndTime)}</span></td>
                    <td className="text-right">
                      {!dtl.IsPaid ? <span>Pending</span> : <span>Completed</span>}
                    </td>
                    <td className="text-right"><span>{dtl.ServicePrice}</span></td>
                    <td className="text-right"><span>{dtl.PlanStatus?.Description}</span></td>
                    <td>
                      <span onClick={() => dispatch('detailbills', dtl)}>
                        <img className="drhms-edit-button" src="assets/svg/edit.svg" alt="" />
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
};
