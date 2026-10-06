import React from 'react';
import { colors, spacing, typography } from '../components/ui/tokens';
import { Textarea } from '../components/ui/Input';
import { Button } from './Button';

interface RemarksItem {
  DeactivateRemarks?: string;
  [key: string]: any;
}

interface ReactPropsShape {
  item?: RemarksItem;
  isModal?: boolean;
}

interface ScreenProps {
  reactProps?: ReactPropsShape;
  onAction?: (actionName: string, payload?: any) => void;
}

// ---------------------------------------------------------------------------
// deactivateremarks (app.deactiveremarks, modal, 4 real refs) -- opened from
// fullregistration/fullregistrationtab to record a reason before deactivating
// a patient record. All API calls/business logic (the confirm-then-save flow,
// PatientStatus/PatientStatusId/DeactivatedDate mutation, UpdatePatient call)
// stay in the untouched Angular controller; Save here only dispatches
// 'saveremarks', which the controller's real saveremarks() (with its real
// utl.Dialog.confirmDeactivate confirmation step) still owns.
// ---------------------------------------------------------------------------
export const DeactivateRemarksScreen: React.FC<ScreenProps> = ({ reactProps, onAction }) => {
  const { item = {}, isModal } = reactProps || {};
  const dispatch = (action: string, payload?: any) => { if (onAction) onAction(action, payload); };

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: `${spacing.sm} ${spacing.md} ${spacing.xl}`, fontFamily: typography.fontFamily }}>
      {isModal && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md }}>
          <h4 style={{ margin: 0, color: colors.textMain }}>Deactivate Remarks</h4>
          <button onClick={() => dispatch('cancel')} style={{ border: 'none', background: 'none', cursor: 'pointer' }} title="Close">
            <i className="fa fa-times" style={{ color: colors.textSubtle }} />
          </button>
        </div>
      )}

      <Textarea
        label="Remarks"
        rows={5}
        maxLength={4000}
        value={item.DeactivateRemarks ?? ''}
        onChange={(e) => dispatch('itemFieldChange', { field: 'DeactivateRemarks', value: e.target.value })}
      />

      <div style={{ marginTop: spacing.xl, display: 'flex', justifyContent: 'flex-end' }}>
        <Button variant="primary" text="Save" onClick={() => dispatch('saveremarks')} />
      </div>
    </div>
  );
};
