import React from 'react';
import { colors, spacing, typography } from '../components/ui/tokens';
import { DataTable, type DataTableColumn } from '../components/ui/DataTable';
import { formatter } from './utils/formatter';

interface SubDepartmentInfo {
  DepartmentName?: string;
}

interface PatientOrderInfo {
  TestTypeId?: number;
  SubDeparement?: SubDepartmentInfo; // NOTE: misspelled exactly like this in the real API payload
                                      // (PatientOrder.SubDeparement, not "SubDepartment") -- kept
                                      // verbatim, not "corrected".
}

interface OrderTrackerRow {
  PatientOrder?: PatientOrderInfo;
  TestName?: string;
  OrderedOn?: string;
  AcceptedOn?: string;
  SampleCollectedOn?: string;
  SampleReceivedOn?: string;
  AssignedOn?: string;
  TechValidationOn?: string;
  MedValidationOn?: string;
  ReleasedOn?: string;
  TAT?: string;
  [key: string]: any;
}

interface ReactPropsShape {
  ordertracker?: OrderTrackerRow[];
}

interface ScreenProps {
  reactProps?: ReactPropsShape;
  onAction?: (actionName: string, payload?: any) => void;
}

// Mirrors the real <displaydate datetime-val="..."> directive's own
// `date : 'dd-MMM-yyyy HH:mm'` AngularJS filter exactly (formatter.getDateTimeString
// already uses this same "DD-MMM-YYYY HH:mm" pattern elsewhere in this codebase).
function formatDateTime(val?: string): string {
  if (!val) return '';
  return formatter.getDateTimeString(val);
}

// Mirrors the real template's three `ng-if="item.PatientOrder.TestTypeId==N"` <td>s
// verbatim (only 1 / 2 / 4 are handled; any other TestTypeId -- including the
// "missing" 3 -- renders blank, exactly as in the real page).
function departmentLabel(row: OrderTrackerRow): string {
  const id = row.PatientOrder?.TestTypeId;
  if (id === 1) return 'Clinical Laboratory';
  if (id === 2) return 'Radiology';
  if (id === 4) return 'Endoscopy';
  return '';
}

// ---------------------------------------------------------------------------
// ordertracker (app.ordertracker, OrderTrackerController, modal-only, size
// 'lg'). Read-only TAT (turn-around-time) report for a patient's LIS orders:
// $scope.initLookup() (General/Options/getoptions, real payload []) gates
// $scope.getList() (lis/ordertat/GetOrderTATs, Key 4 = pid only), whose
// getListCallback groups the response by PatientOrder.TestTypeId, computes a
// per-row TAT string from OrderedOn/ReleasedOn, and pushes every row into
// $scope.ordertracker. All of that -- initLookup/lookupCallback/getList/
// getListCallback/backToList -- is 100% unchanged; this component only
// renders whatever $scope.ordertracker the hollowed controller mirrors into
// reactProps, and its one dispatch ('print') calls straight back into the
// controller's own (pre-existing, broken -- see below) $scope.print().
// <patientbanner> stays native in the .html (real, shared, async-fetching
// directive -- same treatment as every other migrated screen that uses it).
//
// Real, disclosed pre-existing bugs/dead-code in the untouched AngularJS
// controller + template, reproduced faithfully and NOT fixed:
//
// - $scope.print is REFERENCED by the template's only button
//   (`ng-click="print()"`, translate key `common.printaction.lbl`) but is
//   NEVER DEFINED anywhere in OrderTrackerController. Clicking "Print" today
//   throws "$scope.print is not a function" in the browser console and does
//   nothing else. Reproduced verbatim: the Print button below dispatches
//   'print', and the hollowed handleReactAction's 'print' case calls
//   $scope.print() exactly as the original ng-click did -- it will throw
//   the same way, on purpose, not patched into a working print.
//
// - The TAT calculation in getListCallback has a real copy/paste bug:
//     var totalMinutes  = endTime.diff(startTime, 'minutes');
//     var totalseconds  = endTime.diff(startTime, 'minutes');   // should almost
//                                                                 // certainly be 'seconds'
//     var clearMinutes  = totalMinutes % 60;
//     var clearseconds  = totalseconds % 60;
//   `totalseconds` is computed with the SAME diff unit as `totalMinutes`, so
//   `clearseconds` is always numerically identical to `clearMinutes` -- the
//   "seconds" segment of the displayed `H:M:S` TAT string is never actually
//   seconds. Left completely unchanged; this component just renders
//   whatever string `item.TAT` the untouched controller already computed.
//
// - Both diff() calls parse OrderedOn/ReleasedOn with
//   `moment(data.OrderedOn, 'hh:mm:ss a')` / `moment(data.ReleasedOn, 'hh:mm:ss a')`
//   -- a bare 12-hour TIME format, even though every other date field on this
//   same row (and the real <displaydate> directive used elsewhere in this
//   template) treats these as full date+time values. If OrderedOn/ReleasedOn
//   are full datetime strings, moment's non-strict parse against a
//   time-only format is unreliable and can silently yield an incorrect (or
//   Invalid Date-derived) TAT. Not touched -- the existing computation is
//   reused as-is.
//
// - $scope.currentcontext.pid is read via
//   `parseInt(modalConfig.params.pid)` with NO guard on `modalConfig.params`
//   itself (only `$scope.currentcontext.ismodal` above it is guarded, one
//   line earlier, by `modalConfig && modalConfig.params`). If this modal were
//   ever opened without a `params` object, this line would throw immediately
//   on controller init. In production today the only real (non-commented)
//   caller -- checkedinpatients.js's `ordertracker` action -- always passes
//   `params: { eid, pid }`, so this never fires live, but it is a real,
//   unguarded landmine kept exactly as-is (sibling screens, e.g.
//   payoutattachment-list.js, guard this the same way QMS/Payout screens do;
//   this controller does not).
//
// - Of the 8 places `app.ordertracker` is referenced in this codebase, 6 are
//   commented-out dead call sites (currentinpatients.js, myoppatientlist.js,
//   previousoppatientslist.js, followuptrackers.js,
//   previousemergencypatientslist.js, virtualpendingorder.js,
//   virtualcompleteorder.js all have a commented-out
//   `utl.Modal.open('app.ordertracker', ...)`), leaving checkedinpatients.js
//   as the only live entry point into this screen.
//
// - $scope.backToList (dismisses via confirmCallback) and $scope.cancelCallback
//   (= $uibModalInstance.dismiss) are both defined but have ZERO live call
//   sites in the real template -- the only button that could have called
//   cancelCallback is commented out
//   (`<!--<button ... ng-click="cancelCallback()" ...>-->`). Dead code;
//   not wired to anything here either. There is consequently no working
//   close/X control on this screen at all today (only Print, which itself
//   throws -- see above) -- the browser modal backdrop/escape is the only
//   way out in production.
//
// - The commented-out header block at the top of the real template
//   (`<div class="row page-header">...<patientbanner .../></div>`) is dead
//   markup superseded by the live `.modal-header` block directly below it,
//   which renders its own `<patientbanner>`. Not reproduced (nothing to
//   reproduce -- it's inert).
//
// - `$scope.initLookup()` / `$scope.lookupCallback` fetch
//   'General/Options/getoptions' with an empty `[]` payload and store the
//   result on `$scope.lookup`, but `$scope.lookup` is never read anywhere
//   else in this controller or template -- exactly like the QMSPatientsScreen
//   lookup round-trip, this entire request exists only as a side-effecting
//   gate before lookupCallback unconditionally calls `$scope.getList()`. Not
//   exposed via reactProps; nothing fabricated for it.
//
// - `$scope.getList()`'s real `Params` array only ever sends `Key 4` (pid);
//   `Key 5` (oid), `Key 6` (odid) and `Key 7` (TestId) are present in the
//   source only as commented-out lines, so this screen can never actually
//   filter by a specific order / order-detail / test despite the API
//   supporting it. Left exactly as scaffolded, non-functional.
//
// - The commented-out top-level `loadData()` function (`$scope.getList()`)
//   and its commented-out call are dead code, fully superseded by the live
//   `initLookup() -> lookupCallback -> getList()` chain.
//
// - `vm = this` and the `$stateParams` / `$state` / `$translate` DI
//   injections are all unused in this controller (no `vm.*` assignment, no
//   `$stateParams`/`$state`/`$translate` reference anywhere in the body).
//   Left exactly as injected/declared.
//
// - The outer `var ordertat = []` declared at the top of the controller is
//   dead/unused -- the only `ordertat` actually used is the DIFFERENT local
//   `var ordertat = res.Data` re-declared inside getListCallback, which
//   shadows it.
//
// - The real TAT cell's inline style is malformed CSS:
//   `style="font-weight: 500color: orangered;"` (missing a semicolon after
//   `500`). Browsers parse this as one declaration --
//   `font-weight: 500color: orangered` -- an invalid value, so the ENTIRE
//   declaration is dropped: no bold, no orange color is ever actually
//   applied to the TAT column in production despite the visual intent.
//   Reproduced faithfully: the TAT column below is rendered as plain,
//   unstyled text, matching what the browser actually renders today, not
//   what the broken style attribute appears to intend.
//
// - The modal header's `class="modal-header custom-modal-header 2"` has a
//   stray, meaningless literal `2` token sitting in the class list (a
//   harmless typo -- there is no `.2` selector anywhere in this codebase).
//
// - The header's `translate="Order Tracker"` uses a bare literal English
//   string as the i18n key (not a real dotted key like
//   `registration.ordertracker.pagetitle.lbl`), the same literal-as-key
//   pattern already disclosed on several sibling screens. $translate falls
//   back to the key text itself, so "Order Tracker" happens to display
//   correctly anyway.
//
// - `$scope.ordertracker` is only ever pushed onto, never reset/cleared
//   before `getList()` runs. In production this modal only calls
//   `getList()` once per open (via the initLookup gate, with no
//   filter/refresh control anywhere on the page), so this never actually
//   duplicates rows today -- but the accumulate-without-reset pattern is a
//   real latent bug if `getList()` were ever called a second time in the
//   same controller instance. Left completely unchanged.
// ---------------------------------------------------------------------------
export const OrderTrackerScreen: React.FC<ScreenProps> = ({ reactProps, onAction }) => {
  const { ordertracker = [] } = reactProps || {};
  const dispatch = (action: string, payload?: any) => { if (onAction) onAction(action, payload); };

  const columns: DataTableColumn<OrderTrackerRow>[] = [
    { key: 'department', header: 'Department', render: (r) => departmentLabel(r) },
    { key: 'subdepartment', header: 'Sub Department', field: 'PatientOrder.SubDeparement.DepartmentName' },
    { key: 'testname', header: 'Test Name', field: 'TestName' },
    { key: 'ordereddate', header: 'Order Date', render: (r) => formatDateTime(r.OrderedOn) },
    { key: 'accepteddate', header: 'Accepted Date', render: (r) => formatDateTime(r.AcceptedOn) },
    { key: 'samplecollecteddate', header: 'Sample Collection Date', render: (r) => formatDateTime(r.SampleCollectedOn) },
    { key: 'samplereceiveddate', header: 'Sample Receive Date', render: (r) => formatDateTime(r.SampleReceivedOn) },
    { key: 'assigneddate', header: 'Assigned Date', render: (r) => formatDateTime(r.AssignedOn) },
    { key: 'processdate', header: 'Process Date', render: (r) => formatDateTime(r.TechValidationOn) },
    { key: 'approveddate', header: 'Approved Date', render: (r) => formatDateTime(r.MedValidationOn) },
    { key: 'releaseddate', header: 'Released Date', render: (r) => formatDateTime(r.ReleasedOn) },
    {
      key: 'tat', header: 'TAT', align: 'center',
      // Real inline style here is malformed CSS and never actually applies
      // (see disclosure block above) -- rendered as plain text, matching
      // what the browser really shows today.
      render: (r) => <span>{r.TAT}</span>,
    },
  ];

  return (
    <div style={{ fontFamily: typography.fontFamily }}>
      <div style={{ padding: `${spacing.sm} ${spacing.md} 0` }}>
        <DataTable<OrderTrackerRow>
          columns={columns}
          rows={ordertracker}
          rowKey={(r) => `${r.PatientOrder?.TestTypeId ?? 'x'}-${r.TestName ?? 'x'}-${r.OrderedOn ?? 'x'}-${r.ReleasedOn ?? 'x'}`}
          emptyText="No records"
          clientSort={false}
        />
      </div>

      <div className="col-sm-12 panel-footer formactionbar">
        <div className="row">
          <div className="col-sm-12">
            <div className="pull-right">
              <button
                type="button"
                className="draftbutton"
                onClick={() => dispatch('print')}
                style={{ color: colors.textMain }}
              >
                Print
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
