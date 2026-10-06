import React from 'react';

interface LookupItem {
  Id?: number;
  Text?: string;
}

interface ExecutableProcedureFormScreenProps {
  part: 'leftpanel' | 'executedby';
  reactProps?: {
    assignTypeId?: number;
    bodySiteId?: number;
    executableProcedureStatusId?: number;
    executedBy?: number;
    assignTypeOptions?: LookupItem[];
    bodySiteOptions?: LookupItem[];
    statusOptions?: LookupItem[];
    userOptions?: LookupItem[];
  };
  onAction?: (actionName: string, payload?: any) => void;
}

// React bridge migration: replaces the four <ui-select> dropdowns
// (Assign Type, Body Site, Status, Executed By) in executableprocedure.html
// (the executable-procedure edit modal), following the established
// ui-select -> plain <select> pattern. 'leftpanel' covers the three
// stacked selects in the form's left column; 'executedby' covers the
// single select in the right column (the ExecutedAt date-picker and
// Comments text input on either side of it stay native). The patient/
// bill/order info display, the commented-out (permanently empty) BOM
// table, and the Save/Back footer buttons all stay native.
//
// CONFIRMED PRE-EXISTING BUG (not fixed): the info panel toggles between
// "Bill Details" and "Order Details" via `ng-if="item.BillsRaisedFromId
// != 3"` / `== 3`, but getItemCallback() never assigns
// $scope.item.BillsRaisedFromId at all - it is always undefined, so the
// condition is always true and "Order Details" can never actually be
// shown, even for procedures that were genuinely raised from an order.
export const ExecutableProcedureFormScreen: React.FC<ExecutableProcedureFormScreenProps> = ({ part, reactProps, onAction }) => {
  const dispatch = (actionName: string, payload?: any) => {
    onAction?.(actionName, payload);
  };

  if (part === 'leftpanel') {
    const assignTypeOptions = reactProps?.assignTypeOptions || [];
    const bodySiteOptions = reactProps?.bodySiteOptions || [];
    const statusOptions = reactProps?.statusOptions || [];
    return (
      <>
        <div className="form-group">
          <label className="col-sm-4 control-label">Assign Type</label>
          <div className="col-sm-8">
            <select
              className="filter-combo form-control"
              value={reactProps?.assignTypeId ?? ''}
              onChange={(e) => dispatch('assignTypeChange', { value: e.target.value ? Number(e.target.value) : null })}
            >
              <option value=""></option>
              {assignTypeOptions.map((opt) => (
                <option key={opt.Id} value={opt.Id}>{opt.Text}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="form-group">
          <label className="col-sm-4 control-label">Body Site</label>
          <div className="col-sm-8">
            <select
              className="filter-combo form-control"
              value={reactProps?.bodySiteId ?? ''}
              onChange={(e) => dispatch('bodySiteChange', { value: e.target.value ? Number(e.target.value) : null })}
            >
              <option value=""></option>
              {bodySiteOptions.map((opt) => (
                <option key={opt.Id} value={opt.Id}>{opt.Text}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="form-group">
          <label className="col-sm-4 control-label">Status</label>
          <div className="col-sm-8">
            <select
              className="filter-combo form-control"
              value={reactProps?.executableProcedureStatusId ?? ''}
              onChange={(e) => dispatch('statusChange', { value: e.target.value ? Number(e.target.value) : null })}
            >
              <option value=""></option>
              {statusOptions.map((opt) => (
                <option key={opt.Id} value={opt.Id}>{opt.Text}</option>
              ))}
            </select>
          </div>
        </div>
      </>
    );
  }

  // part === 'executedby'
  const userOptions = reactProps?.userOptions || [];
  return (
    <div className="form-group">
      <label className="col-sm-4 control-label">Executed By</label>
      <div className="col-sm-8">
        <select
          className="filter-combo form-control"
          value={reactProps?.executedBy ?? ''}
          onChange={(e) => dispatch('executedByChange', { value: e.target.value ? Number(e.target.value) : null })}
        >
          <option value=""></option>
          {userOptions.map((opt) => (
            <option key={opt.Id} value={opt.Id}>{opt.Text}</option>
          ))}
        </select>
      </div>
    </div>
  );
};
