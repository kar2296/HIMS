import React from 'react';
import { colors, spacing, typography } from '../components/ui/tokens';
import { Textarea } from '../components/ui/Input';
import { Button } from './Button';

interface EncounterItem {
  BillingRemarks?: string;
  Name?: string;
  [key: string]: any;
}

interface ReactPropsShape {
  item?: EncounterItem;
  isModal?: boolean;
}

interface ScreenProps {
  reactProps?: ReactPropsShape;
  onAction?: (actionName: string, payload?: any) => void;
}

// ---------------------------------------------------------------------------
// billingremarks (app.billingremarks, modal). NOT called from anywhere inside
// the emr/registration/opbilllinking/ directory itself (its sibling
// opbilllinking.js/updateconsbilling.js are confirmed dead -- opbilllinking's
// own state, app.opvisitbilllink, has zero live callers anywhere). The real,
// live callers are elsewhere entirely: patientrecords-list.js
// (emr/patientemr/patientrecords) and two shared vendor banner widgets
// (public/vendor/components/consolidatebanner.js and emrpatientbanner.js,
// both mounted across many EMR screens), each calling
// utl.Modal.open('app.billingremarks', { params: { pid, eid }, confirmCallback }).
//
// Real business logic (unchanged in the Angular controller): on open,
// initLookup() fetches BillingStatus options then chains into getItem(),
// which GETs the real encounter (Visit/Visit/GetEncounterById) and replaces
// $scope.item wholesale with the fetched encounter object (its
// BillingRemarks field is what the textarea below edits). Save
// (Visit/Visit/UpdateEncounter) always hardcodes BillingStatusId: 1 on the
// posted item -- real behavior, not touched.
//
// Two real pre-existing bugs/quirks preserved faithfully, not fixed:
// 1. MISMATCHED LABEL BUG: the modal header title reads "Redo Reason" while
//    the only field in the body is labeled "Billing Remark" -- the header
//    text does not describe the form underneath it at all. Reproduced
//    verbatim below (do not "fix" the header to say "Billing Remarks").
// 2. DEAD FIELD: the real controller declares $scope.ordertat = [] but never
//    reads or writes it again, and no template ever rendered it -- an
//    orphaned scope field with no UI. Not reproduced in React (nothing to
//    reproduce -- it never had any visible effect), but disclosed here since
//    it's part of the original controller and future readers may wonder.
// ---------------------------------------------------------------------------
export const BillingRemarksScreen: React.FC<ScreenProps> = ({ reactProps, onAction }) => {
  const { item = {}, isModal } = reactProps || {};
  const dispatch = (action: string, payload?: any) => { if (onAction) onAction(action, payload); };

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: `${spacing.sm} ${spacing.md} ${spacing.xl}`, fontFamily: typography.fontFamily }}>
      {isModal && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md }}>
          {/* Real bug preserved: header says "Redo Reason", body is "Billing Remark" -- mismatched in the original template. */}
          <h4 style={{ margin: 0, color: colors.textMain }}>Redo Reason</h4>
          <button onClick={() => dispatch('cancel')} style={{ border: 'none', background: 'none', cursor: 'pointer' }} title="Close">
            <i className="fa fa-times" style={{ color: colors.textSubtle }} />
          </button>
        </div>
      )}

      <Textarea
        label="Billing Remark"
        rows={3}
        maxLength={4000}
        value={item.BillingRemarks ?? ''}
        onChange={(e) => dispatch('itemFieldChange', { field: 'BillingRemarks', value: e.target.value })}
      />

      <div style={{ marginTop: spacing.xl, display: 'flex', justifyContent: 'flex-end' }}>
        <Button variant="primary" text="Save" onClick={() => dispatch('saveItem')} />
      </div>
    </div>
  );
};
