import React, { useEffect, useState } from 'react';
import { colors, spacing, typography } from '../components/ui/tokens';
import { Button } from './Button';

interface IdDocItem {
  ImagePath?: string;
  [key: string]: any;
}

interface ReactPropsShape {
  item?: IdDocItem;
  photo?: string; // base64, matches currentcontext.Photo (fetched only when item.ImagePath is set)
}

interface ScreenProps {
  reactProps?: ReactPropsShape;
  onAction?: (actionName: string, payload?: any) => void;
}

// ---------------------------------------------------------------------------
// patientid-documents (app.patientiddocs, modal, 1 real ref) -- the real
// target of the Upload button already dispatched natively from the
// already-migrated PatientIdentityListScreen. All API calls (GetPatientIdDocs,
// AddPatientIdentity/UpdatePatientIdentity via ng-file-upload's Upload.upload)
// stay in the untouched Angular controller.
//
// Real, disclosed bug preserved exactly, NOT fixed: the original template's
// Save button calls `save()`, which this controller never defines (only
// `saveItem` exists) -- in AngularJS this silently no-ops on click. The
// button has therefore never actually submitted anything in production.
// Reproduced faithfully here: the Save button dispatches 'save', for which
// the hollowed controller (matching the original) has no handler, so it is a
// genuine no-op, exactly like the AngularJS original. Selecting a file still
// works (that part used a real two-way ng-model binding, not the broken
// ngf-change handler) and is reproduced via the 'fileSelected' dispatch.
// ---------------------------------------------------------------------------
export const PatientIdDocumentsScreen: React.FC<ScreenProps> = ({ reactProps, onAction }) => {
  const { photo } = reactProps || {};
  const dispatch = (action: string, payload?: any) => { if (onAction) onAction(action, payload); };
  const [localPreview, setLocalPreview] = useState<string | null>(null);

  useEffect(() => {
    return () => { if (localPreview) URL.revokeObjectURL(localPreview); };
  }, [localPreview]);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (localPreview) URL.revokeObjectURL(localPreview);
    setLocalPreview(URL.createObjectURL(file));
    dispatch('fileSelected', { file });
  };

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', padding: `${spacing.sm} ${spacing.md} ${spacing.xl}`, fontFamily: typography.fontFamily }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: spacing.md, height: 200 }}>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', overflow: 'hidden' }}>
          {localPreview ? (
            <img src={localPreview} alt="Selected document" style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} />
          ) : photo ? (
            <img src={`data:image/png;base64,${photo}`} alt="ID document" style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} />
          ) : (
            <span style={{ color: colors.textSubtle }}>No document uploaded</span>
          )}
        </div>
        <label
          title="Upload"
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', width: 48, height: 48,
            borderRadius: '50%', backgroundColor: colors.primary, color: '#fff', cursor: 'pointer', flexShrink: 0,
          }}
        >
          <i className="fa fa-cloud-upload" aria-hidden="true" />
          <input type="file" onChange={onFileChange} style={{ display: 'none' }} />
        </label>
      </div>

      <div style={{ marginTop: spacing.xl, display: 'flex', justifyContent: 'flex-end', gap: spacing.sm }}>
        {/* Faithfully broken, per original: this button's target action (`save`)
            has no handler on the Angular side either, so clicking it does nothing. */}
        <Button variant="primary" text="Save" onClick={() => dispatch('save')} />
        <Button variant="danger" text="Cancel" onClick={() => dispatch('backToList')} />
      </div>
    </div>
  );
};
