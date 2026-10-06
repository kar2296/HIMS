import React from 'react';

interface CardDetailRow {
  PatientName?: string;
  Age?: number | string;
  DOB?: string;
  Gender?: string;
  MobileNo?: string;
  Status?: number;
}

interface PrivilegeCardRegScreenProps {
  part: 'title' | 'addbutton' | 'form' | 'cardtable' | 'footer';
  reactProps?: {
    item?: {
      PatientId?: number;
      CardTypeId?: number;
      PromotionalSchemeId?: number;
      CardNo?: string;
      ValidTo?: string;
      TitleId?: number;
      FirstName?: string;
      LastName?: string;
      Age?: string | number;
      ApproxAgeDays?: string | number;
      ApproxAgeMonths?: string | number;
      DOB?: string;
      MobileNo?: string;
      GenderId?: number;
      Address?: string;
      candisable?: boolean;
    };
    lookup?: {
      PromotionSchemeType?: Array<{ Id: number; Text: string; Code?: string }>;
      PromotionalScheme?: Array<{ Id: number; Text: string }>;
      Title?: Array<{ Id: number; Text: string; Code?: string }>;
      Gender?: Array<{ Id: number; Text: string }>;
    };
    cardDetails?: CardDetailRow[];
  };
  onAction?: (actionName: string, payload?: any) => void;
}

// React bridge migration for privilegecardreg.html, split across 4 mounts.
//
// CONFIRMED PRE-EXISTING BUGS, reproduced as-is (not fixed):
// 1. `$scope.lookupCallback` calls a bare, undefined global `forEach(...)`
//    (should be `angular.forEach`). This throws a ReferenceError every time
//    lookups load, so `$scope.lookup` is NEVER populated -- every dropdown
//    below (Privilige Card Type, Promotional Scheme, Title, Gender) is
//    always empty in the original. Reproduced by leaving reactProps.lookup
//    genuinely empty; not "fixed" by populating it from elsewhere.
// 2. The 'toolbar' part in the original template is a near-verbatim copy of
//    the full patient-registration header toolbar, but this controller
//    defines almost none of the functions/properties it references:
//    addNew, clinicalalertview, consultationcharges, checkout,
//    saveAndInactive, openattachments, printRegistrationIdlabel, HasAccess,
//    moveHeaderFocus, tabindexmap, SaveCompleted, BillCompleted,
//    isPatientDeactivated are ALL undefined in privilegecardregController.
//    Every one of those buttons is gated by an ng-if/ng-show referencing one
//    of these undefined values (or an undefined HasAccess() call, which
//    throws and is caught, evaluating falsy) -- so none of them ever
//    actually render. Only the patient search box (wired to the real
//    patientChange()) and the unconditional "Add" button (btn-add, calls
//    addNew() which is undefined -> silent no-op) are ever visible. Those
//    permanently-hidden buttons are omitted here; the Add button is kept,
//    dispatching 'addNew' with NO corresponding handleReactAction case
//    (reproducing its original no-op).
// 3. The footer print dropdown's menu items (printRegistration,
//    printRegistrationIdlabel, idcard, printVisitSlip, printOPBill) are also
//    all undefined in this controller -- the entire Print dropdown is dead
//    (visible, clickable, does nothing). Reproduced as a real dropdown whose
//    items dispatch actions with no handler, matching the original's no-op.
//    Only Back (backToList) and the Save & Approve button (saveAndApprove)
//    are genuinely wired.
// 4. The Google-Places address autocomplete field (`gm-places-autocomplete`)
//    and its "manual address" checkbox reference `enablegoogleaddopt()`
//    (undefined -> no-op), `disablegoogleaddopt` (undefined -> never
//    disabled) and `autocompleteOptions`/`autocompleteModel` (never
//    initialized). This is a native shared directive left untouched in the
//    surrounding .html rather than reimplemented here, consistent with the
//    native-widget rule for generic framework directives.
export const PrivilegeCardRegScreen: React.FC<PrivilegeCardRegScreenProps> = ({ part, reactProps, onAction }) => {
  const item = reactProps?.item || {};
  const lookup = reactProps?.lookup || {};
  const cardDetails = (reactProps?.cardDetails || []).filter((d) => d.Status === 1);

  const dispatch = (actionName: string, payload?: any) => {
    onAction?.(actionName, payload);
  };

  const showApproxAge = !!(item.TitleId && (lookup.Title || []).some((t) =>
    t.Id === item.TitleId && (t.Code || '').toLowerCase() === 'babyof' || t.Id === item.TitleId && (t.Code || '').toLowerCase() === 'baby'
  ));

  if (part === 'title') {
    return <h4 className="mt0">Privilege Card Registration</h4>;
  }

  if (part === 'addbutton') {
    // native <patientsearch> sits alongside this mount in the .html, inside
    // the same ".filters" wrapper, preceding this button (matches original
    // visual order).
    return (
      <button className="btn-add" onClick={() => dispatch('addNew')} title="Registration">
        <i className="fas fa-plus" aria-hidden="true"></i>
      </button>
    );
  }

  if (part === 'form') {
    return (
      <form id="item_form" name="item_form" className="form-horizontal" role="form">
        <div className="col-sm-12">
          <div className="form-group col-sm-3">
            <label className="col-sm-12 control-label">Privilige Card Type</label>
            <div className="col-sm-12">
              <select className="form-control" value={item.CardTypeId ?? ''} onChange={(e) => dispatch('cardTypeChange', { value: Number(e.target.value) })}>
                {(lookup.PromotionSchemeType || []).map((opt) => (
                  <option key={opt.Id} value={opt.Id}>{opt.Text}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="form-group col-sm-3">
            <label className="col-sm-12 control-label">Promotional Scheme</label>
            <div className="col-sm-12">
              <select className="form-control" value={item.PromotionalSchemeId ?? ''} onChange={(e) => dispatch('promotionalSchemeChange', { value: Number(e.target.value) })}>
                {(lookup.PromotionalScheme || []).map((opt) => (
                  <option key={opt.Id} value={opt.Id}>{opt.Text}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="form-group col-sm-3">
            <label className="col-sm-12 control-label">Card #</label>
            <div className="col-sm-12">
              <input type="text" className="form-control" placeholder="Card #" required
                value={item.CardNo ?? ''} onChange={(e) => dispatch('cardNoChange', { value: e.target.value.toUpperCase() })} />
            </div>
          </div>
          <div className="form-group col-sm-3">
            <label className="col-sm-12 control-label">Valid To </label>
            <div className="col-sm-12">
              <input type="date" className="form-control"
                value={item.ValidTo ? String(item.ValidTo).slice(0, 10) : ''}
                onChange={(e) => dispatch('validToChange', { value: e.target.value })} />
            </div>
          </div>
        </div>
        <div className="col-lg-12">
          <div className="form-group col-sm-3">
            <label className="col-sm-12 control-label">Title</label>
            <div className="col-sm-12 pdr0">
              <select className="form-control" value={item.TitleId ?? ''} required
                onChange={(e) => {
                  const opt = (lookup.Title || []).find((t) => t.Id === Number(e.target.value));
                  dispatch('titleChange', { Id: opt?.Id, Text: opt?.Text });
                }}>
                {(lookup.Title || []).map((opt) => (
                  <option key={opt.Id} value={opt.Id}>{opt.Text}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="form-group col-sm-3">
            <label className="col-sm-12 control-label">First Name</label>
            <div className="col-sm-12">
              <input type="text" className="form-control" placeholder="First Name" required
                value={item.FirstName ?? ''} onChange={(e) => dispatch('firstNameChange', { value: e.target.value.toUpperCase() })} />
            </div>
          </div>
          <div className="form-group col-sm-3">
            <label className="col-sm-12 control-label">Last Name</label>
            <div className="col-sm-12">
              <input type="text" className="form-control" placeholder="Last Name" required
                value={item.LastName ?? ''} onChange={(e) => dispatch('lastNameChange', { value: e.target.value.toUpperCase() })} />
            </div>
          </div>
          {showApproxAge && (
            <div className="form-group col-sm-3">
              <label className="col-sm-12 control-label">Approx. Age</label>
              <div className="col-sm-12 approxagediv">
                <div className="col-sm-4">
                  <input type="text" className="form-control" placeholder="Days" value={item.ApproxAgeDays ?? ''} onChange={(e) => dispatch('approxAgeDaysChange', { value: e.target.value })} />
                </div>
                <div className="col-sm-4">
                  <input type="text" className="form-control" placeholder="Months" value={item.ApproxAgeMonths ?? ''} onChange={(e) => dispatch('approxAgeMonthsChange', { value: e.target.value })} />
                </div>
                <div className="col-sm-4">
                  <input type="text" className="form-control" placeholder="Years" value={item.Age ?? ''} onChange={(e) => dispatch('approxAgeYearsChange', { value: e.target.value })} />
                </div>
              </div>
            </div>
          )}
          <div className="form-group col-sm-3">
            <label className="col-sm-12 control-label">Age</label>
            <div className="col-sm-12 pdr0">
              <input type="text" className="form-control" placeholder="Age" required
                value={item.Age ?? ''} onChange={(e) => dispatch('ageChange', { value: e.target.value })} />
            </div>
          </div>
          <div className="form-group col-sm-3">
            <label className="col-sm-12 control-label">Date of Birth</label>
            <div className="col-sm-12">
              <input type="date" className="form-control"
                value={item.DOB ? String(item.DOB).slice(0, 10) : ''}
                onChange={(e) => dispatch('dobChange', { value: e.target.value })} />
            </div>
          </div>
          <div className="form-group col-sm-3">
            <label className="col-sm-12 control-label">Mobile</label>
            <div className="col-sm-12">
              <input type="text" className="form-control" maxLength={10} required
                value={item.MobileNo ?? ''} onChange={(e) => dispatch('mobileNoChange', { value: e.target.value })} />
            </div>
          </div>
          <div className="form-group col-sm-3">
            <label className="col-sm-12 control-label">Gender</label>
            <div className="col-sm-12">
              <select className="form-control" value={item.GenderId ?? ''} required
                onChange={(e) => {
                  const opt = (lookup.Gender || []).find((g) => g.Id === Number(e.target.value));
                  dispatch('genderChange', { Id: opt?.Id, Text: opt?.Text });
                }}>
                {(lookup.Gender || []).map((opt) => (
                  <option key={opt.Id} value={opt.Id}>{opt.Text}</option>
                ))}
              </select>
            </div>
          </div>
          {/* native gm-places-autocomplete Location field + manual-address checkbox mounted alongside this component in the .html */}
          <div className="form-group col-sm-3">
            <label className="col-sm-12 control-label">Address</label>
            <div className="col-sm-12">
              <input type="text" className="form-control" disabled={!!item.candisable}
                value={item.Address ?? ''} onChange={(e) => dispatch('addressChange', { value: e.target.value })} />
            </div>
          </div>
        </div>
      </form>
    );
  }

  if (part === 'cardtable') {
    return (
      <>
        <div className="col-sm-12">
          <button type="button" className="draftbutton" onClick={() => dispatch('addCard')}>Add to Card</button>
        </div>
        <div className="col-sm-12" id="orderlisttb">
          <table style={{ border: 'solid 1px black', width: '100%', marginTop: 10 }}>
            <thead>
              <tr>
                <th>Patient Name</th>
                <th>Age</th>
                <th>DOB</th>
                <th>Gender</th>
                <th>Mobile #</th>
              </tr>
            </thead>
            <tbody>
              {cardDetails.map((row, idx) => (
                <tr key={idx}>
                  <td>{row.PatientName}</td>
                  <td>{row.Age}</td>
                  <td>{row.DOB ? new Date(row.DOB).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : ''}</td>
                  <td>{row.Gender}</td>
                  <td>{row.MobileNo}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </>
    );
  }

  // part === 'footer'
  return (
    <div className="fooder-bgs">
      <div className="row">
        <div className="pull-left">
          {/* Print dropdown: every item below is dead in the original (calls
              an undefined controller function) -- reproduced as a real,
              clickable, no-op dropdown to match. */}
          <ul className="nav navbar-nav" id="print">
            <li className="dropdown dropdown-list custom-li">
              <button className="draftbutton" type="button">
                <span>Print</span>
              </button>
              <ul className="dropdown-menu top" role="menu">
                <li><a onClick={() => dispatch('printRegistration')}><span>Print Registration</span></a></li>
                <li><a onClick={() => dispatch('printRegistrationIdlabel')}><span>Print Registration Id</span></a></li>
                <li><a onClick={() => dispatch('idcard')}><span>Print Registration Id Card</span></a></li>
                <li><a onClick={() => dispatch('printVisitSlip')}><span>Visit Slip</span></a></li>
                <li><a onClick={() => dispatch('printOPBill')}><span>OP Bill</span></a></li>
              </ul>
            </li>
          </ul>
          <button type="button" className="btn pyr-color10 btn-sm" tabIndex={-1} onClick={() => dispatch('backToList')}>
            <i className="fa fa-angle-left" aria-hidden="true"></i>
            <span className="btn-fontsize"> &nbsp; Back</span>
          </button>
        </div>
        <div className="pull-right">
          <button type="button" className="draftbutton" onClick={() => dispatch('saveAndApprove')}>Save &amp; Approve</button>
        </div>
      </div>
    </div>
  );
};
