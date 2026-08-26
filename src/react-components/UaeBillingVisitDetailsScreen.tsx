import React from 'react';

interface UaeBillingVisitDetailsScreenProps {
  reactProps?: {
    item?: {
      VisitIdentifier?: string;
      VisitType?: string;
      DoctorName?: string;
      Speciality?: string;
      VisitReason?: string;
    };
  };
  onAction?: (actionName: string, payload?: any) => void;
}

// React bridge migration (single mount) for the "Visit Details" fieldset in
// uae-billing-form.html. These 5 plain text inputs are the ONLY genuinely
// interactive fields in the entire "billing_typecontent" region of this
// screen -- everything else there (Insurance fieldset, Eligibility
// fieldset, and the line-items table) has NO ng-model/ng-repeat at all in
// the original and is kept as untouched static native markup alongside
// this mount: the Insurance/Eligibility inputs are permanently empty,
// unfocusable (tabindex="-1") placeholders with no bindings whatsoever, and
// the line-items table's <tbody> is completely empty with no ng-repeat --
// addNewLineItem()/ServiceItemChanged(), though defined on the controller,
// are never referenced by any element in this template and are dead code.
export const UaeBillingVisitDetailsScreen: React.FC<UaeBillingVisitDetailsScreenProps> = ({ reactProps, onAction }) => {
  const item = reactProps?.item || {};

  const dispatch = (actionName: string, payload?: any) => {
    onAction?.(actionName, payload);
  };

  return (
    <>
      <div className="form-group">
        <label className="col-sm-4 control-label">Encounter No</label>
        <div className="col-sm-8">
          <input type="text" className="form-control" placeholder="Visit No#"
            value={item.VisitIdentifier ?? ''} onChange={(e) => dispatch('visitIdentifierChange', { value: e.target.value.toUpperCase() })} />
        </div>
      </div>
      <div className="form-group">
        <label className="col-sm-4 control-label">Visit Type</label>
        <div className="col-sm-8">
          <input type="text" className="form-control" placeholder="Visit Type"
            value={item.VisitType ?? ''} onChange={(e) => dispatch('visitTypeChange', { value: e.target.value.toUpperCase() })} />
        </div>
      </div>
      <div className="form-group">
        <label className="col-sm-4 control-label">Doctor</label>
        <div className="col-sm-8">
          <input type="text" className="form-control" placeholder="Doctor Name"
            value={item.DoctorName ?? ''} onChange={(e) => dispatch('doctorNameChange', { value: e.target.value.toUpperCase() })} />
        </div>
      </div>
      <div className="form-group">
        <label className="col-sm-4 control-label">Speciality</label>
        <div className="col-sm-8">
          <input type="text" className="form-control" placeholder="Speciality"
            value={item.Speciality ?? ''} onChange={(e) => dispatch('specialityChange', { value: e.target.value.toUpperCase() })} />
        </div>
      </div>
      <div className="form-group">
        <label className="col-sm-4 control-label">Reason</label>
        <div className="col-sm-8">
          <input type="text" className="form-control"
            value={item.VisitReason ?? ''} onChange={(e) => dispatch('visitReasonChange', { value: e.target.value.toUpperCase() })} />
        </div>
      </div>
    </>
  );
};
