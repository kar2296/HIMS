import React from 'react';
import { Select, type SelectOption } from '../components/ui/Select';
import { Input } from '../components/ui/Input';

interface LookupOption {
  Id: number;
  Text: string;
}

interface LookupShape {
  Department?: LookupOption[];
  OPDRoom?: LookupOption[];
  DisplayNo?: LookupOption[];
  QmsLocation?: LookupOption[];
  TokenStatus?: LookupOption[];
}

interface ItemShape {
  DepartmentId?: number | string;
  TokenNo?: string;
  RoomNoId?: number | string;
  DisplayNo?: number | string;
  LocationId?: number | string;
  TokenStatusId?: number;
}

interface ReactPropsShape {
  item?: ItemShape;
  lookup?: LookupShape;
}

interface ScreenProps {
  reactProps?: ReactPropsShape;
  onAction?: (actionName: string, payload?: any) => void;
}

const toOptions = (list?: LookupOption[]): SelectOption[] =>
  (list || []).map((l) => ({ value: l.Id, label: l.Text }));

const dispatchOf = (onAction?: (a: string, p?: any) => void) => (action: string, payload?: any) => {
  onAction?.(action, payload);
};

// React bridge migration for appttoken.js / appttoken.html -- the "Doctor
// QMS Token" modal (utl.Modal.open('app.appnmttoken', {...})) opened from
// 18 confirmed live callers: appointment lists (appointment-list.js,
// appointment-list-sch.js, appointmentnew/appointments-list.js,
// viewappoitment.js, appappointments.js), checked-in patient lists
// (checkedinpatients.js, myoppatientlist.js, alloppatientlist.js,
// previousoppatientslist.js), the future-appointments/followup trackers,
// the QMS display list + filter, surgery calendar, A&E dashboards, and the
// virtual-services order trackers. It lets front-desk/QMS staff
// generate/call/receive/mark-missed a display token tied to an appointment.
//
// Two mounts share one reactProps/handleReactAction, matching the modal's
// two native regions:
//  - AppttokenFormPanel: the 5-field form (Department/Token No/Room No/
//    Display No/Location).
//  - AppttokenFooter: the 4 status-dependent action buttons (Generate/Call/
//    Receive/Missed).
// The modal header (title + close "X", native ng-click="backToList()") and
// the <form id="item_form" name="item_form"> wrapper are left untouched in
// the .html around these mounts.
//
// CONFIRMED PRE-EXISTING QUIRKS reproduced as-is (not fixed):
// - The Department select has NO ng-change and NO `required` attribute in
//   the original -- reproduced with no required marker and no side effect
//   dispatched beyond updating item.DepartmentId.
// - $scope.save() (sets TokenStatusId=1, then calls saveItem()) is DEAD
//   CODE -- no element in the template ever calls it. The "Generate" button
//   calls saveItem() directly. Reproduced faithfully: no unused "save"
//   action is wired here, "generate" dispatches straight to saveItem().
// - As with every other hollow-controller screen in this migration,
//   utl.Validator.validate($scope) (called from saveItem()) reads Angular
//   ngModel/FormController state off the real "item_form". React-rendered
//   inputs are plain controlled elements (no ngModel), so client-side
//   required/minlength validation is weaker post-migration than before;
//   the backend's own validation on AddAppointmentDisplay/
//   UpdateAppointmentDisplay is unchanged and still the authoritative
//   check. This matches the disclosed trade-off already accepted across
//   every other migrated screen with required fields (e.g.
//   AppointmentFormScreen, VisitCreateFormScreen).
export const AppttokenFormPanel: React.FC<ScreenProps> = ({ reactProps, onAction }) => {
  const item = reactProps?.item || {};
  const lookup = reactProps?.lookup || {};
  const dispatch = dispatchOf(onAction);

  return (
    <>
      <div className="col-sm-6 form-group">
        <Select
          label="Department"
          options={toOptions(lookup.Department)}
          value={item.DepartmentId ?? ''}
          onChange={(v) => dispatch('departmentChange', { value: v })}
        />
      </div>
      <div className="col-sm-6 form-group">
        <Input
          label="Token No"
          required
          minLength={1}
          value={item.TokenNo ?? ''}
          onChange={(e) => dispatch('tokenNoChange', { value: e.target.value })}
        />
      </div>
      <div className="col-sm-6 form-group">
        <Select
          label="Room No"
          required
          options={toOptions(lookup.OPDRoom)}
          value={item.RoomNoId ?? ''}
          onChange={(v) => dispatch('roomNoChange', { value: v })}
        />
      </div>
      <div className="col-sm-6 form-group">
        <Select
          label="Display No"
          required
          options={toOptions(lookup.DisplayNo)}
          value={item.DisplayNo ?? ''}
          onChange={(v) => dispatch('displayNoChange', { value: v })}
        />
      </div>
      <div className="col-sm-6 form-group">
        <Select
          label="Location"
          required
          options={toOptions(lookup.QmsLocation)}
          value={item.LocationId ?? ''}
          onChange={(v) => dispatch('locationChange', { value: v })}
        />
      </div>
    </>
  );
};

export const AppttokenFooter: React.FC<ScreenProps> = ({ reactProps, onAction }) => {
  const item = reactProps?.item || {};
  const dispatch = dispatchOf(onAction);
  const status = item.TokenStatusId;

  // Reproduces the original ng-hide/ng-if conditions exactly (loose ==
  // comparisons, since TokenStatusId may arrive as a string via the native
  // <select> bridge just like every other migrated numeric-id field).
  /* eslint-disable eqeqeq */
  const showGenerate = !(status == 1 || status == 2 || status == 3 || status == 4);
  const showCall = status == 1 || status == 4;
  const showReceive = status == 2;
  const showMiss = status == 2;
  /* eslint-enable eqeqeq */

  return (
    <div className="row">
      <div className="pull-right">
        {showGenerate && (
          <button type="button" className="draftbutton" onClick={() => dispatch('generate')}>
            Generate
          </button>
        )}
        {showCall && (
          <button type="button" className="draftbutton" onClick={() => dispatch('call')}>
            Call
          </button>
        )}
        {showReceive && (
          <button type="button" className="draftbutton" onClick={() => dispatch('receive')}>
            Receive
          </button>
        )}
        {showMiss && (
          <button type="button" className="draftbutton" onClick={() => dispatch('missed')}>
            Missed
          </button>
        )}
      </div>
    </div>
  );
};
