import React from 'react';

interface PrivilegeCardFormScreenProps {
  reactProps?: {
    item?: {
      PatientId?: number;
      CardTypeId?: number;
      ValidTo?: string;
      CardNo?: string;
      MobileNo?: string;
      candisable?: boolean;
    };
    lookup?: {
      PromotionSchemeType?: Array<{ Id: number; Text: string }>;
    };
  };
  onAction?: (actionName: string, payload?: any) => void;
}

// React bridge migration (single mount) for privilegecardform.html.
//
// CONFIRMED PRE-EXISTING BROKEN SCREEN, reproduced as-is (not fixed):
// 1. The controller's `$scope.currentcontext` assignment is entirely
//    commented out (only the modal-mode lines remain, dead, inside an
//    `if (modalConfig...)` block that never runs since this state is not
//    opened as a modal). `$scope.currentcontext` is therefore `undefined`
//    for the life of this screen.
// 2. `initLookup()` always runs on load; its callback does
//    `if ($scope.currentcontext.Id > 0)` which throws a TypeError against
//    the undefined `currentcontext`, caught and logged by Angular's
//    $exceptionHandler on every load. Net effect: `getPramotionalScheme()`
//    (the edit-mode data load) can never run -- this form is always
//    effectively "add new", never "edit", regardless of intent.
// 3. `$scope.confirmCallback` is likewise only ever assigned inside that
//    same dead modal-mode block, so `saveItem()`'s callback
//    (`saveItemCallback`) shows the success toast and then throws calling
//    the undefined `confirmCallback()`.
// 4. Most tellingly: the original HTML template has NO Save, Save & Approve,
//    or Back button anywhere -- `$scope.save`, `$scope.saveandApprove`, and
//    `$scope.backToList` are all dead code, never wired to any control. The
//    footer div (`<div class="fooder-bgs"></div>`) is empty in the original.
// This mount faithfully reproduces only what actually renders: the title,
// the native <patientbanner>, and the four form fields -- with no submit
// affordance, exactly matching the original's non-functional form.
export const PrivilegeCardFormScreen: React.FC<PrivilegeCardFormScreenProps> = ({ reactProps, onAction }) => {
  const item = reactProps?.item || {};
  const lookup = reactProps?.lookup || {};

  const dispatch = (actionName: string, payload?: any) => {
    onAction?.(actionName, payload);
  };

  return (
    <>
      <div className="row">
        <h4 className="title">Manage Promotional Scheme</h4>
      </div>
      {/* native <patientbanner> mounted alongside this component in the .html */}
      <div className="row">
        <form id="item_form" name="item_form" className="form-horizontal" role="form">
          <div className="form-group col-sm-4">
            <label className="col-sm-12 control-label">Scheme Type</label>
            <div className="col-sm-12">
              <select
                className="filter-combo form-control"
                value={item.CardTypeId ?? ''}
                onChange={(e) => dispatch('cardTypeChange', { value: Number(e.target.value) })}
                required
              >
                {(lookup.PromotionSchemeType || []).map((opt) => (
                  <option key={opt.Id} value={opt.Id}>{opt.Text}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="form-group col-sm-4">
            <label className="col-sm-12 control-label">Eligibile Date</label>
            <div className="col-sm-12">
              <input
                type="date"
                className="form-control"
                value={item.ValidTo ? String(item.ValidTo).slice(0, 10) : ''}
                onChange={(e) => dispatch('validToChange', { value: e.target.value })}
                required
              />
            </div>
          </div>
          <div className="form-group col-sm-4">
            <label className="col-sm-12 control-label">Card #</label>
            <div className="col-sm-12">
              <input
                type="text"
                className="form-control"
                value={item.CardNo ?? ''}
                disabled={!!item.candisable}
                onChange={(e) => dispatch('cardNoChange', { value: e.target.value })}
              />
            </div>
          </div>
          <div className="form-group col-sm-4">
            <label className="col-sm-12 control-label">Phone#</label>
            <div className="col-sm-12">
              <input
                type="text"
                className="form-control"
                value={item.MobileNo ?? ''}
                disabled={!!item.candisable}
                onChange={(e) => dispatch('mobileNoChange', { value: e.target.value })}
              />
            </div>
          </div>
        </form>
      </div>
    </>
  );
};
