import React from 'react';
import { colors, radii, spacing, typography } from '../components/ui/tokens';
import { Button } from './Button';

interface ReactPropsShape {
  pid?: number;
}

interface ScreenProps {
  reactProps?: ReactPropsShape;
  onAction?: (actionName: string, payload?: any) => void;
}

interface PrintRow {
  label: string;
  action: string;
}

// ---------------------------------------------------------------------------
// patientprints (app.patientprints, modal, 1 real ref -- opened from
// patientsearch.js's `utl.Modal.open('app.patientprints', { params: { pid } })`).
// The controller only fires GetPatients on open (to populate $scope.Patientdata,
// consumed by mrdlabel/patientlabel/visitprint for barcode-label field values)
// and each row button triggers a download (registrationprint/registrationlabel/
// patientidcard/opbill via utl.Http.doDownload) or a raw barcode-printer job
// (mrdlabel/patientlabel via the shared getBarcodePrintCtrl mixin's printRaw,
// left untouched in the Angular controller) or visitprint's appointment-print
// download. All API calls/business logic stay in the untouched controller;
// this component only dispatches action names.
//
// Real pre-existing bugs found in the original template, preserved exactly
// (NOT fixed), disclosed here:
// 1. The footer's first button (`<button ... translate="common.printaction.lbl">`)
//    has NO ng-click at all in the original -- it renders a "Print" label that
//    does nothing when clicked. Reproduced below as a button with no dispatch,
//    matching the original's dead control exactly.
// 2. The original template ends with a stray, unmatched `</form>` closing tag
//    (no corresponding `<form>` was ever opened) -- cosmetically irrelevant
//    (browsers ignore it) and not reproducible/meaningful in JSX, so omitted.
// 3. Button-to-action naming is inconsistent with real behavior: the
//    "Registration Label" row calls `registrationlabel()`, which hits the same
//    `PrintPatient` action as `registrationprint()` (just with `Data: true`),
//    while "Patient ID Card" calls `patientidcard()`, which actually hits a
//    different action, `PrintPatientLabel`. This mismatch is pre-existing and
//    preserved as-is; not corrected here.
// 4. `visitprint()` in the real controller reads `Patientdata.Encounters` via a
//    `for...in` loop that leaves a stray unused `encounters` var assigned on
//    each iteration, then reads the *last* iterated encounter outside the loop
//    (relying on `var` function-scoping, not block-scoping) to decide whether
//    to print. Preserved verbatim in the Angular controller; irrelevant to this
//    component's own logic since visitprint is just a plain dispatch.
// ---------------------------------------------------------------------------
const PRINT_ROWS: PrintRow[] = [
  { label: 'Registration', action: 'registrationprint' },
  { label: 'Registration Label', action: 'registrationlabel' },
  { label: 'Patient ID Card', action: 'patientidcard' },
  { label: 'MRD Label', action: 'mrdlabel' },
  { label: 'Patient Label', action: 'patientlabel' },
  { label: 'Visit Slip', action: 'visitprint' },
  { label: 'OP Bill', action: 'opbill' },
];

export const PatientPrintsScreen: React.FC<ScreenProps> = ({ onAction }) => {
  const dispatch = (action: string, payload?: any) => { if (onAction) onAction(action, payload); };

  return (
    <div style={{ fontFamily: typography.fontFamily }}>
      <div style={{ padding: `0 ${spacing.md}` }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${colors.border}` }}>
                <th style={{ textAlign: 'left', padding: spacing.sm, color: colors.textSubtle, fontWeight: typography.sectionHeading.fontWeight }}>Print Template</th>
                <th style={{ padding: spacing.sm }} />
              </tr>
            </thead>
            <tbody>
              {PRINT_ROWS.map((row) => (
                <tr key={row.action} style={{ borderBottom: `1px solid ${colors.border}` }}>
                  <td style={{ padding: spacing.sm, color: colors.textMain }}>{row.label}</td>
                  <td style={{ padding: spacing.sm, textAlign: 'right' }}>
                    <button
                      type="button"
                      title="Print"
                      onClick={() => dispatch(row.action)}
                      style={{
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        width: 28, height: 28, borderRadius: radii.sm, border: `1px solid ${colors.border}`,
                        backgroundColor: colors.surfaceMuted, color: colors.textMain, cursor: 'pointer',
                      }}
                    >
                      <i className="fa fa-print" aria-hidden="true" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: spacing.sm, padding: spacing.md, borderTop: `1px solid ${colors.border}`, marginTop: spacing.md }}>
        {/* Faithfully broken, per original: this button has no ng-click in the
            source template at all -- it has never done anything on click. */}
        <Button variant="secondary" text="Print" onClick={() => {}} />
        <Button variant="danger" text="Cancel" onClick={() => dispatch('cancelCallback')} />
      </div>
    </div>
  );
};
