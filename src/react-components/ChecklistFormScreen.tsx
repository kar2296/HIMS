import React from 'react';

interface ChecklistFormScreenProps {
  part: 'header' | 'patientinfo' | 'summary' | 'footer';
  reactProps?: {
    currentcontext?: { patientAlertsCount?: number; attachmentcount?: number };
    selectedPatient?: {
      Title?: { Description?: string };
      FirstName?: string;
      LastName?: string;
      MRN?: string;
      Gender?: { Description?: string };
      Age?: number;
      DOB?: string;
    };
  };
  onAction?: (actionName: string, payload?: any) => void;
}

function formatDOB(value?: string): string {
  if (!value) return '';
  const d = new Date(value);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const dd = String(d.getDate()).padStart(2, '0');
  return `${dd}/${months[d.getMonth()]}/${d.getFullYear()}`;
}

// React bridge migration, checklist-form.html split into 'header'
// (title + patient-alerts badge), 'patientinfo' (Patient Info/Age/DOB
// panel), 'summary' (the 4-stat checklist-banner row), and 'footer'
// (Back/Attachments/Print/Save&Approve buttons) -- see
// ChecklistFormDetailsScreen.tsx for the document-checklist table
// (radiogroupcontrol reimplementation).
//
// Confirmed pre-existing bug, reproduced exactly (not "fixed"): the
// 'summary' checklist-banner row's four stats (Bill Date, Bill No,
// Status, Checked By) are bound in the original template to
// `Data.AdmissionDate` / `Data.VisitIdentifier` / `Data.AdmissionStatus`
// / `Data.Created...` -- but checklistFormController never defines
// `$scope.Data` anywhere (it sets `$scope.Encounter` instead). This
// state is a top-level `app.*` state, not nested under a parent
// controller that could supply `Data` via scope inheritance, so these
// four values are always blank in production today. Reproduced as
// permanently-blank here too, not wired to Encounter.
//
// The 'footer' Print button dispatches 'print3', which is wired
// straight through to the real, unmodified `$scope.print3()` --
// `print3` is never defined anywhere in checklistFormController, so
// clicking Print throws the same "$scope.print3 is not a function"
// error today as it will here; not fixed or stubbed out.
export const ChecklistFormScreen: React.FC<ChecklistFormScreenProps> = ({ part, reactProps, onAction }) => {
  const currentcontext = reactProps?.currentcontext || {};
  const selectedPatient = reactProps?.selectedPatient || {};

  const dispatch = (actionName: string, payload?: any) => {
    onAction?.(actionName, payload);
  };

  if (part === 'header') {
    return (
      <div className="row">
        <div className="col-sm-10">
          <h4>Claim Checklist</h4>
        </div>
        <div className="col-sm-2">
          <div
            className="drhms-billing-btn drhms-previousbill-btn"
            title="Patient Alerts"
            onClick={() => dispatch('patientalerts')}
          >
            <span>
              <i className="fa fa-exclamation-triangle" aria-hidden="true"></i>
            </span>
            <a>{currentcontext.patientAlertsCount}</a>
          </div>
        </div>
      </div>
    );
  }

  if (part === 'patientinfo') {
    return (
      <div className="col-sm-12">
        <div className="drhms-table-top-header">
          <div className="drhms-table-head-border">
            <div className="col-sm-12">
              <label className="col-sm-4">Patient Info</label>
              <div className="col-sm-8">
                :{' '}
                <span
                  title={`${selectedPatient.Title?.Description || ''} ${selectedPatient.FirstName || ''} | ${selectedPatient.MRN || ''} | ${selectedPatient.Gender?.Description || ''}`}
                >
                  <span>{selectedPatient.Title?.Description} {selectedPatient.FirstName}</span>
                  <span onClick={() => dispatch('patientprofiledetails')}>
                    &nbsp;&nbsp;&nbsp;
                    <i className="icon-info-sign"></i>
                  </span>{' '}|
                  <span> {selectedPatient.MRN} </span>|
                  <span> {selectedPatient.Gender?.Description}</span>
                </span>
              </div>
            </div>
          </div>
          <div className="drhms-table-head-border">
            <div className="col-sm-12">
              <label className="col-sm-4">Age</label>
              <div className="col-sm-8">
                : <span title={`${selectedPatient.Age ?? ''}`}><span>{selectedPatient.Age} Years </span></span>
              </div>
            </div>
          </div>
          <div className="drhms-table-head-border">
            <div className="col-sm-12">
              <label className="col-sm-4">DOB</label>
              <div className="col-sm-8">
                : <span title={formatDOB(selectedPatient.DOB)}><span>{formatDOB(selectedPatient.DOB)}</span></span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (part === 'summary') {
    return (
      <div className="checklist-banner">
        <div className="col-sm-3">
          <span className="span">Bill Date</span> : <span></span>
        </div>
        <div className="col-sm-3">
          <span className="span">Bill #.</span> : <span></span>
        </div>
        <div className="col-sm-3">
          <span className="span">Status</span> : <span></span>
        </div>
        <div className="col-sm-3">
          <span className="span">Checked By</span> : <span></span>
        </div>
      </div>
    );
  }

  // part === 'footer'
  return (
    <div className="fooder-bgs">
      <div className="row">
        <div className="pull-left">
          <button type="button" className="btn pyr-color10 btn-sm" tabIndex={-1} onClick={() => dispatch('backToList')}>
            <i className="fa fa-angle-left" aria-hidden="true"></i>
            <span className="btn-fontsize"> &nbsp; Back</span>
          </button>
          <button type="button" className="draftbutton" title="Attachments" onClick={() => dispatch('openattachments')}>
            &nbsp;&nbsp;
            <i className="fa fa-paperclip fa-xs" aria-hidden="true">({currentcontext.attachmentcount})</i>
          </button>
        </div>
        <div className="pull-right">
          <button type="button" className="draftbutton" onClick={() => dispatch('print3')}>Print Preview</button>
          <button type="button" className="draftbutton" onClick={() => dispatch('saveItem')}>Approve</button>
        </div>
      </div>
    </div>
  );
};
