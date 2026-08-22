import React from 'react';
import { colors, spacing, typography } from '../components/ui/tokens';
import { DataTable, type DataTableColumn } from '../components/ui/DataTable';
import { Pagination } from '../components/ui/Pagination';

interface PersonName {
  Title?: { Description?: string };
  FirstName?: string;
  LastName?: string;
}

interface PayoutAttachmentEntity {
  Id: number;
  PatientId?: number;
  FilePath?: string;
  UserName?: string;
  CreatedAt?: string;
  DocumentType?: { Description?: string };
  CreatedUser?: PersonName;
  [key: string]: any;
}

interface Pager {
  totalItems?: number;
  currentPage?: number;
  pageSize?: number;
}

interface ReactPropsShape {
  items?: PayoutAttachmentEntity[];
  pager?: Pager;
}

interface ScreenProps {
  reactProps?: ReactPropsShape;
  onAction?: (actionName: string, payload?: any) => void;
}

// Mirrors the real cellTemplate's own `date : 'dd-MM-yyyy'` AngularJS filter
// (note: numeric month, NOT the 'dd-MMM-yyyy' used by several sibling list
// screens -- copied verbatim from this screen's own template).
function formatDate(val?: string): string {
  if (!val) return '';
  const d = new Date(val);
  if (isNaN(d.getTime())) return '';
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  return `${dd}-${mm}-${d.getFullYear()}`;
}

// ---------------------------------------------------------------------------
// payoutattachment-list (app.payoutattachments, modal-only, 3 real call
// sites: doctorpayoutip-list.js, doctorpayoutappip-list.js,
// dailycollection-list.js -- all via utl.Modal.open('app.payoutattachments',
// { params: { eid: <EncounterId> }, confirmCallback, cancelCallback })).
// Read-only list of clinical documents/attachments already uploaded against
// an encounter (emr/ClinicalDocument/GetClinicalDocuments, Key 3 = eid),
// with a single per-row action that downloads the file
// (emr/ClinicalDocument/GetDocumentFile via utl.Http.doDownload). All API
// calls, callbacks and validation stay in the untouched
// payoutAttachmentListController; this component only renders whatever
// vm.gridConfig.data / pagerObj the hollowed controller mirrors into
// reactProps, and dispatches back into the same unchanged functions.
//
// Real, disclosed pre-existing bugs/dead-code in the AngularJS original,
// preserved exactly, NOT fixed:
// - The grid's only action icon is literally `assets/svg/edit.svg` (a
//   pencil), but its ng-click dispatches actionType 'edit', which
//   handleEvents() routes straight to $scope.downloadFile(entity) --
//   clicking the pencil downloads the file, it never edits/navigates
//   anywhere. The commented-out `$state.go('app.patientform', ...)` call
//   right above it in the real controller is dead, never-run code.
//   Reproduced faithfully: the button below uses the same edit.svg icon and
//   only ever dispatches a download.
// - handleEvents('view', entity) (navigates to app.patientform) and
//   handleEvents('delete', entity) (utl.Dialog.confirmDelete(...)) are both
//   genuinely unreachable dead code -- no element anywhere in the real
//   template dispatches 'view' or 'delete'. Not rendered here either,
//   matching the live page exactly.
// - handleEvents('delete', entity) calls
//   `utl.Dialog.confirmDelete($scope.onDeleteConfirmed, entity.Id,
//   entity.UserName)` -- $scope.onDeleteConfirmed is never defined
//   anywhere in this controller. Since 'delete' is unreachable (see above)
//   this never actually throws in production today, but it is a real,
//   undefined-function reference left exactly as-is.
// - $scope.backToList is defined (dismisses the modal via confirmCallback
//   when currentcontext.ismodal) but has ZERO call sites anywhere in the
//   real template -- the header's close "X" icon calls cancelCallback()
//   directly instead. Dead code; not wired to anything here either.
// - The real pagination widget's `ng-change="getList()"` calls a function
//   this controller never defines (only getDocumentList() exists) -- in
//   AngularJS this silently no-ops, so clicking a page number has
//   literally never re-fetched anything in production. On top of that,
//   getDocumentList() itself hardcodes `PageContext.PageNumber: 1` on every
//   call regardless of the current page, so pagination could never have
//   worked here even if getList() existed. Reproduced faithfully: the
//   Pagination control below only updates the displayed page number
//   (dispatch 'pageChange') and intentionally does NOT trigger a re-fetch,
//   matching the real, broken, do-nothing behavior.
// - The modal title's translate key
//   (`registration.patientattachment-list.pagetitle.lbl`, resolving to
//   "Attachments") is shared verbatim with the sibling
//   patientattachment-list.html screen -- not a bug, just noted since the
//   key name says "patientattachment" while this screen is
//   "payoutattachment".
// ---------------------------------------------------------------------------
export const PayoutAttachmentListScreen: React.FC<ScreenProps> = ({ reactProps, onAction }) => {
  const { items = [], pager = {} } = reactProps || {};
  const dispatch = (action: string, payload?: any) => { if (onAction) onAction(action, payload); };

  const columns: DataTableColumn<PayoutAttachmentEntity>[] = [
    {
      key: 'date', header: 'Date', field: 'CreatedAt', sortable: true,
      render: (e) => formatDate(e.CreatedAt),
    },
    {
      key: 'doctype', header: 'Document Type', field: 'DocumentType.Description', sortable: true,
    },
    {
      key: 'createdby', header: 'Created By', field: 'CreatedUser.FirstName', sortable: true,
      render: (e) => (
        <span>
          {e.CreatedUser?.Title?.Description ? <>{e.CreatedUser.Title.Description}{' '}</> : null}
          {e.CreatedUser?.FirstName} {e.CreatedUser?.LastName}
        </span>
      ),
    },
  ];

  const pageSize = pager.pageSize || 25;
  const totalItems = pager.totalItems || 0;
  const currentPage = pager.currentPage || 1;

  return (
    <div style={{ padding: `${spacing.sm} ${spacing.md} ${spacing.xl}`, fontFamily: typography.fontFamily }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.lg }}>
        <h4 style={{ ...typography.sectionHeading, margin: 0, color: colors.textMain, fontFamily: typography.fontFamily }}>
          Attachments
        </h4>
        <button
          type="button"
          title="Close"
          onClick={() => dispatch('cancel')}
          style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: spacing.xs, lineHeight: 0 }}
        >
          <img src="assets/svg/close.svg" alt="Close" aria-hidden="true" style={{ width: 16, height: 16 }} />
        </button>
      </div>

      <DataTable<PayoutAttachmentEntity>
        columns={columns}
        rows={items}
        rowKey={(e) => e.Id}
        emptyText="No records"
        actions={(entity) => (
          // Real icon is `edit.svg` but the click dispatches a download --
          // see the disclosure block above. Reproduced verbatim, not "fixed"
          // into a download icon.
          <span
            className="grid-action"
            role="button"
            onClick={() => dispatch('edit', { entity })}
            style={{ cursor: 'pointer' }}
          >
            <img className="drhms-edit-button" src="assets/svg/edit.svg" alt="Download" aria-hidden="true" />
          </span>
        )}
      />

      <Pagination
        currentPage={currentPage}
        totalItems={totalItems}
        pageSize={pageSize}
        onPageChange={(page) => dispatch('pageChange', { page })}
      />
    </div>
  );
};
