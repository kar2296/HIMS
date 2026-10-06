import React from 'react';

interface OpClearancePatientInfoScreenProps {
  reactProps?: {
    selectedPatient?: {
      Title?: { Description?: string };
      FirstName?: string;
      Age?: number;
      Gender?: { Description?: string };
      MRN?: string;
      Guarantor?: { GuarantorName?: string };
    };
    items?: {
      WardMaster?: { WardName?: string };
      WardRoomMaster?: { RoomNo?: string };
      WardRoomBedMaster?: { BedNo?: string };
      DOA?: string;
      DoctorName?: string;
      ReferralName?: string;
      GuarantorScheme?: { PromotionSchemeName?: string };
    };
    isPharmacy?: boolean;
  };
  onAction?: (actionName: string, payload?: any) => void;
}

// React bridge migration (single mount) for the patient-info banner
// (drhms-table-top-header) in opclearance-form.html. Sits below the native
// title + <patientsearch> row (kept native in the .html).
//
// CONFIRMED DEAD, reproduced as no-op clicks (matching original silent
// failure -- none of these functions exist on OPclearanceFormController):
// patientprofiledetails(selectedPatient) [click patient name], patcmnts()
// [comments icon], Bedoccupancy() [room info icon], addDoctor() [referral
// plus icon], addGuarantor() [insurance info icon]. Only the "Include
// Pharmacy" checkbox (dispatched as includePharmacyChange, wired to the
// real $scope.IsPharmacy + getopBills()) is live.
export const OpClearancePatientInfoScreen: React.FC<OpClearancePatientInfoScreenProps> = ({ reactProps, onAction }) => {
  const selectedPatient = reactProps?.selectedPatient || {};
  const items = reactProps?.items || {};

  const dispatch = (actionName: string, payload?: any) => {
    onAction?.(actionName, payload);
  };

  return (
    <div className="drhms-table-top-header">
      <div className="drhms-table-head-border">
        <div className="col-sm-12">
          <label className="col-sm-4">Patient Name</label>
          <div className="col-sm-8">:
            <span className="head-title">
              <strong onClick={() => dispatch('patientProfileDetails')}>{selectedPatient.Title?.Description} {selectedPatient.FirstName}</strong>
            </span>
            <span className="comments pull-right" onClick={() => dispatch('comments')} title="Comments"><i className="fas fa-comments"></i></span>
          </div>
        </div>
        <div className="col-sm-12">
          <label className="col-sm-4">Ward / Room/ Bed</label>
          <div className="col-sm-8">:
            <span className="head-title">
              <strong>{items.WardMaster?.WardName} / {items.WardRoomMaster?.RoomNo} / {items.WardRoomBedMaster?.BedNo}</strong>
            </span>
            <span className="comments pull-right" onClick={() => dispatch('bedOccupancy')} title="Room"><i className="fa fa-info-circle"></i></span>
          </div>
        </div>
        <div className="col-sm-12">
          <label className="col-sm-4">Date Of Admission</label>
          <div className="col-sm-8">:
            {items.DOA ? new Date(items.DOA).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : ''}
          </div>
        </div>
      </div>
      <div className="drhms-table-head-border">
        <div className="col-sm-12">
          <label className="col-sm-4">Age / Sex</label>
          <div className="col-sm-8">:
            <span className="head-title">{selectedPatient.Age} / {selectedPatient.Gender?.Description}</span>
          </div>
        </div>
        <div className="col-sm-12">
          <label className="col-sm-4">Doctor/ReferralName</label>
          <div className="col-sm-8">:
            <span className="head-title">{items.DoctorName}/{items.ReferralName}</span>
            <span className="comments pull-right" onClick={() => dispatch('addDoctor')} title="Referral Name"><i className="fa fa-plus" aria-hidden="true"></i></span>
          </div>
        </div>
        <div className="col-sm-12">
          <label className="col-sm-4">Include Pharmacy</label>
          <div className="col-sm-8">:
            <input type="checkbox" className="custom-checkbox" checked={!!reactProps?.isPharmacy}
              onChange={(e) => dispatch('includePharmacyChange', { value: e.target.checked })} />
          </div>
        </div>
      </div>
      <div className="drhms-table-head-border">
        <div className="col-sm-12">
          <label className="col-sm-4">UHID</label>
          <div className="col-sm-8">:{selectedPatient.MRN}</div>
        </div>
        <div className="col-sm-12">
          <label className="col-sm-4">Insurance/Scheme</label>
          <div className="col-sm-8">:{selectedPatient.Guarantor?.GuarantorName}/{items.GuarantorScheme?.PromotionSchemeName}
            <span className="comments pull-right" onClick={() => dispatch('addGuarantor')} title="Add Guarantor"><i className="fa fa-info-circle"></i></span>
          </div>
        </div>
      </div>
    </div>
  );
};
