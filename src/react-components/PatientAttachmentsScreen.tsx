import React, { useEffect, useState } from 'react';
import { colors, radii, spacing, shadows, typography } from '../components/ui/tokens';
import { DataTable, type DataTableColumn } from '../components/ui/DataTable';
import { Select } from '../components/ui/Select';
import { Input } from '../components/ui/Input';
import { FileUpload } from '../components/ui/FileUpload';
import { Button } from './Button';

interface AttachmentTypeOption {
  Id: number;
  Text: string;
}

interface AttachmentEntity {
  Id: number;
  AttachmentName?: string;
  AttachmentType?: string;
  Comments?: string;
  FilePath?: string;
  [key: string]: any;
}

interface DraftItem {
  AttachmentTypeId?: number;
  AttachmentType?: string;
  AttachmentName?: string;
  Comments?: string;
}

interface ReactPropsShape {
  attachmentTypeOptions?: AttachmentTypeOption[];
  item?: DraftItem;
  items?: AttachmentEntity[];
}

interface ScreenProps {
  reactProps?: ReactPropsShape;
  onAction?: (actionName: string, payload?: any) => void;
}

const MAX_FILE_SIZE_BYTES = 200 * 1024 * 1024; // 200MB, mirrors ngf-max-size="200MB"

// -----------------------------------------------------------------------------
// patientattachment-list (app.patientattachments, modal, 133 real call sites
// app-wide via utl.Modal.open/openFixedDialog('app.patientattachments',
// { params: { pid, itemid[, objecttypeid][, encounterid] }, confirmCallback,
// cancelCallback }) -- by far the heaviest-traffic screen migrated so far.
//
// *** IMPORTANT ARCHITECTURE NOTE, READ BEFORE TOUCHING THIS FILE AGAIN ***
// Unlike every other migrated screen, patientattachment-list.js itself never
// contained the real business logic. Its real template
// (patientattachment-list.html) rendered a single shared Angular COMPONENT,
// <attachmentcontrol config="attachmentconfig">, whose controller/template
// live at public/vendor/components/attachmentcontrol.js /
// attachmentcontrol.html -- a directory outside this migration's allowed
// file scope (only public/views/**, src/react-components/**, and src/main.tsx
// may be touched). That directive's grep footprint
// (`grep -rln "<attachmentcontrol " public --include=*.html`) shows it was
// used ONLY by patientattachment-list.html -- not shared with any other
// screen (the visually-similar work-order/inventory attachment modals each
// have their OWN separate directives, woattachmentcontrol.js/.html and
// inventoryattachmentcontrol.js/.html, genuinely untouched by this work).
// So: attachmentcontrol.js/.html are left completely byte-for-byte
// UNTOUCHED (per scope rules) but are now ORPHANED/dead code -- nothing
// references them any more after this migration. They were NOT deleted,
// only because deleting/editing anything under public/vendor is outside
// this migration's permitted scope.
//
// Because the real logic lived in that now-orphaned directive controller
// (`attachmentcontrolCtrl`), not in patientattachment-list.js's own $scope,
// there were no pre-existing $scope.xxx functions on THIS controller to
// "wrap" in the usual hollow-controller sense. Instead, every real function
// (getList, saveItem/Upload.upload, onDeleteConfirmed, downloadFile,
// initLookup/lookupCallback, attachmentTypeChange, fileSelected) has been
// PORTED VERBATIM into patientattachment-list.js -- same action endpoints,
// same Params Key/Value pairs, same payload shapes, same success/error
// messages, same pre-existing quirks/bugs (see below) -- with the
// React-bridge refresh calls layered on top, exactly the same technique the
// hollow-controller pattern uses elsewhere. Nothing about the underlying
// business logic was invented or "improved" in the port.
//
// Real, disclosed pre-existing bugs/quirks in the original, preserved
// exactly, NOT fixed:
// - DUPLICATE PARAMS KEY BUG: cvm.getList() always sends
//   `{ Key: 3, Value: cvm.config.objecttypeid }`, then, if
//   cvm.config.encounterid is set, pushes ANOTHER `{ Key: 3, Value:
//   cvm.config.encounterid }` onto the same Params array -- two entries
//   both keyed 3. This is dead in production TODAY: a grep of all 135
//   `app.patientattachments` references app-wide shows not one caller ever
//   passes an `encounterid` param (only `pid`/`itemid`/`objecttypeid`
//   appear), so the duplicate-key branch has apparently never actually
//   fired in this codebase. Reproduced faithfully regardless, in case a
//   future/removed caller relied on it.
// - INITIAL-LOAD GATED ON TRUTHY patientid: the original directive's
//   `$scope.$watch('cvm.config.patientid', function(newValue){ if(newValue)
//   cvm.getList(); })` only auto-loads the list when patientid is truthy.
//   Several real call sites (patientreturns-form.js, pharmacy-sales.js,
//   opbillmodifyform.js, and others) open this modal with `pid: 0`
//   literally -- for those, the attachment list never auto-loads on open;
//   it only loads once the user touches the Attachment Type filter (whose
//   handler calls getList() unconditionally, sending patientid=0 to the
//   backend regardless). Reproduced faithfully: the initial list fetch
//   below only fires when patientid is truthy, exactly mirroring the real
//   $watch's guard.
// - SILENT OVERSIZED-FILE DROP: the real file picker used
//   `ngf-select ngf-max-size="200MB"` (ng-file-upload). Reading that
//   library's own validateSync('maxSize', ...) (public/vendor/ng-file-upload
//   /ng-file-upload.js) shows an oversized file is silently excluded from
//   the model -- no `$error` is ever surfaced anywhere in
//   attachmentcontrol.html/js (no ng-messages, no error binding read
//   anywhere), so a user picking a file over 200MB today sees NOTHING
//   happen, no error message at all. Reproduced faithfully below: files
//   over 200MB are silently ignored (a console.warn is added purely for
//   developer debugging; it changes no visible/user-facing behavior).
// - `$scope.backToList` is ported (dismisses/confirms the modal) but, like
//   its sibling on payoutattachment-list.js, has ZERO call sites anywhere
//   in the real template -- the header's close "X" always calls
//   `cancelCallback()` directly. Dead code; not wired to anything here
//   either.
// - Real custom-table header-click-to-sort (`customTableController.reOrder`,
//   public/js/app.js) is bound via `ng-click="$ctrl.reOrder(name)"` to
//   EVERY column header, including the actions column (field: "Id"). Since
//   `reOrder` does `a.toLowerCase()` unconditionally, clicking the real
//   "Actions" column header would throw a TypeError (Id is numeric, not a
//   string) -- a genuine latent bug in the shared custom-table component.
//   Not reproduced as a crash here: this port's actions column is rendered
//   via DataTable's separate `actions` prop (no field, no header-click-sort
//   wired to it at all), the same judgment call already made for the
//   payoutattachment-list.js sibling migration.
// - The Attachment Type dropdown is genuinely dual-purpose in the original:
//   the exact same field both (a) tags the NEXT uploaded attachment's type
//   and (b) immediately re-filters the currently-displayed list (its
//   ng-change handler calls getList() using the same AttachmentTypeId as a
//   server-side filter). Not a bug -- reproduced faithfully: changing the
//   dropdown below both updates the pending upload's type AND reloads the
//   list filtered to that type.
// - Lookup-vs-list load ordering: on mount, the attachment list can (and,
//   per the $watch timing, normally does) load BEFORE the Attachment Type
//   dropdown's options finish loading (the original staggers
//   `initLookup()` behind a 100ms `$timeout`). Reproduced with the same
//   100ms delay for fidelity; harmless, just noted.
// - Also noted (not a bug): the modal title's translate key
//   ("registration.patientattachment-list.pagetitle.lbl") is shared
//   verbatim with the payoutattachment-list.js sibling, exactly as
//   disclosed in that screen's own migration.
// -----------------------------------------------------------------------------
export const PatientAttachmentsScreen: React.FC<ScreenProps> = ({ reactProps, onAction }) => {
  const { attachmentTypeOptions = [], item, items = [] } = reactProps || {};
  const dispatch = (action: string, payload?: any) => { if (onAction) onAction(action, payload); };

  const [attachmentTypeId, setAttachmentTypeId] = useState<number>(item?.AttachmentTypeId ?? -1);
  const [attachmentName, setAttachmentName] = useState<string>(item?.AttachmentName || '');
  const [comments, setComments] = useState<string>(item?.Comments || '');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Resyncs the draft form back to the controller's authoritative $scope.item
  // only when that object's identity actually changes -- which, in the
  // ported controller, happens at mount and exactly once more: right after
  // a successful upload resets $scope.item to its blank defaults. Any other
  // reactProps refresh (delete, lookup load, etc.) reuses the same $scope.item
  // reference, so it does not clobber whatever the user is still typing.
  useEffect(() => {
    setAttachmentTypeId(item?.AttachmentTypeId ?? -1);
    setAttachmentName(item?.AttachmentName || '');
    setComments(item?.Comments || '');
    setSelectedFile(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item]);

  const onAttachmentTypeChange = (raw: string | number) => {
    const id = Number(raw);
    const match = attachmentTypeOptions.find((o) => o.Id === id);
    setAttachmentTypeId(id);
    dispatch('attachmentTypeChange', { id, text: match ? match.Text : '' });
  };

  const onFilesSelected = (files: FileList) => {
    const file = files[0];
    if (!file) return;
    if (file.size > MAX_FILE_SIZE_BYTES) {
      // Silent drop, matching the real ngf-max-size behavior -- see
      // top-of-file disclosure. No user-visible error in the original either.
      console.warn('Selected file exceeds 200MB limit; ignored (matches original silent ngf-max-size behavior).');
      return;
    }
    setSelectedFile(file);
    setAttachmentName(file.name); // mirrors cvm.fileSelected()
  };

  const onSave = () => {
    dispatch('save', {
      attachmentTypeId,
      attachmentType: attachmentTypeOptions.find((o) => o.Id === attachmentTypeId)?.Text || '',
      attachmentName,
      comments,
      file: selectedFile,
    });
  };

  const columns: DataTableColumn<AttachmentEntity>[] = [
    { key: 'name', header: 'Attachment Name', field: 'AttachmentName', sortable: true },
    { key: 'type', header: 'Attachment Type', field: 'AttachmentType', sortable: true },
    { key: 'comments', header: 'Comments', field: 'Comments', sortable: true },
  ];

  const options = attachmentTypeOptions.map((o) => ({ value: o.Id, label: o.Text }));

  return (
    <div style={{ padding: `${spacing.sm} ${spacing.md} ${spacing.xl}`, fontFamily: typography.fontFamily, backgroundColor: colors.surfaceMuted }}>
      <div
        style={{
          background: 'linear-gradient(135deg, #00005c 0%, #1a0070 100%)',
          color: '#ffffff',
          padding: '14px 22px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderRadius: `${radii.lg} ${radii.lg} 0 0`,
          boxShadow: shadows.lg,
          margin: `-${spacing.sm} -${spacing.md} ${spacing.lg}`,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm }}>
          <div style={{ width: 34, height: 34, borderRadius: radii.md, background: 'rgba(255,255,255,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <i className="fa fa-paperclip" style={{ color: '#fff' }} />
          </div>
          <h4 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: '#fff', letterSpacing: 0.3 }}>Attachments</h4>
        </div>
        <button
          type="button"
          onClick={() => dispatch('cancel')}
          style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', fontSize: 20, width: 32, height: 32, borderRadius: radii.md, cursor: 'pointer', lineHeight: 1 }}
        >
          &times;
        </button>
      </div>

      <div style={{ background: colors.surface, borderRadius: radii.lg, border: `1px solid ${colors.border}`, boxShadow: shadows.sm, padding: spacing.lg, marginBottom: spacing.lg }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: colors.textMain, marginBottom: spacing.md, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${colors.surfaceSunken}`, paddingBottom: spacing.sm }}>
          <span><i className="fa fa-cloud-upload-alt" style={{ color: colors.primary, marginRight: spacing.xs }} />Upload New Attachment</span>
          <span style={{ fontSize: 11, fontWeight: 500, color: colors.textMuted, background: colors.surfaceSunken, padding: '3px 10px', borderRadius: radii.full }}>Max file size: 200MB</span>
        </div>

        <div style={{ display: 'flex', gap: spacing.lg, flexWrap: 'wrap', marginBottom: spacing.md }}>
          <div style={{ flex: '1 1 220px' }}>
            <Select
              label="Attachment Type"
              options={options}
              value={attachmentTypeId === -1 ? '' : attachmentTypeId}
              onChange={onAttachmentTypeChange}
              placeholder="Select Attachment Type..."
            />
          </div>
          <div style={{ flex: '1 1 260px' }}>
            <FileUpload
              label="Select File *"
              onFilesSelected={onFilesSelected}
              hint={selectedFile ? selectedFile.name : 'No file chosen'}
            />
          </div>
          <div style={{ flex: '1 1 220px' }}>
            <Input
              label="Attachment Name"
              value={attachmentName}
              onChange={(e) => setAttachmentName(e.target.value)}
              placeholder="Enter attachment title..."
            />
          </div>
        </div>

        <div style={{ display: 'flex', gap: spacing.lg, alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 320px' }}>
            <label style={{ ...typography.label, color: colors.textMain, marginBottom: spacing.xs, display: 'block' }}>Comments / Notes</label>
            <textarea
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              style={{
                width: '100%', minHeight: 60, borderRadius: radii.sm, border: `1px solid ${colors.border}`,
                padding: spacing.sm, fontFamily: typography.fontFamily, fontSize: 13, boxSizing: 'border-box',
              }}
            />
          </div>
          <div>
            <Button variant="primary" text="Upload & Save" icon="fa fa-cloud-upload-alt" onClick={onSave} />
          </div>
        </div>
      </div>

      <div style={{ background: colors.surface, borderRadius: radii.lg, border: `1px solid ${colors.border}`, boxShadow: shadows.sm, padding: spacing.lg }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: colors.textMain, marginBottom: spacing.md, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${colors.surfaceSunken}`, paddingBottom: spacing.sm }}>
          <span><i className="fa fa-list-alt" style={{ color: colors.primary, marginRight: spacing.xs }} />Attached Documents</span>
          <span style={{ fontSize: 12, fontWeight: 600, color: colors.primary, background: colors.primaryLight, padding: '3px 12px', borderRadius: radii.full }}>
            {items.length || 0} Attached
          </span>
        </div>

        <DataTable<AttachmentEntity>
          columns={columns}
          rows={items}
          rowKey={(e) => e.Id}
          emptyText="No attachments uploaded yet"
          actions={(entity) => (
            <>
              <button
                type="button"
                title="View / Download"
                onClick={() => dispatch('view', { entity })}
                style={{ padding: '4px 8px', borderRadius: radii.sm, border: `1px solid ${colors.borderStrong}`, background: colors.surface, color: colors.primary, fontWeight: 600, cursor: 'pointer', marginRight: spacing.xs }}
              >
                <i className="fa fa-download" style={{ marginRight: 4 }} /> View
              </button>
              <button
                type="button"
                title="Delete"
                onClick={() => dispatch('delete', { entity })}
                style={{ padding: '4px 8px', borderRadius: radii.sm, border: `1px solid ${colors.danger}`, background: colors.danger, color: '#fff', fontWeight: 600, cursor: 'pointer' }}
              >
                <i className="fa fa-trash" />
              </button>
            </>
          )}
        />
      </div>
    </div>
  );
};
