import React from 'react';
import { Button } from './Button';
import { spacing } from '../components/ui/tokens';

interface CurrentContext {
  pid?: number;
}

interface Flags {
  canUpdatePatientInfo?: boolean;
}

interface ReactPropsShape {
  currentcontext?: CurrentContext;
  flags?: Flags;
}

interface ScreenProps {
  reactProps?: ReactPropsShape;
  onAction?: (actionName: string, payload?: any) => void;
}

// ---------------------------------------------------------------------------
// familylink tab (app.fullregistrationtab.familylink, familylinking.html/.js).
//
// This screen's grid (one <autosearch> patient-search widget per repeated row,
// plus a Relationship ui-select and a delete button) is left as NATIVE Angular
// markup, unchanged from the original -- <autosearch> is a shared, config/
// callback-driven directive (debounce, searchbyid toggle, formatdisplay/
// presearch/postsearch hooks) instantiated once per ng-repeat row, and React
// cannot compile an Angular directive inside a React-rendered row. Reimplementing
// it would risk a subtle behavioral regression (search API 'registration/patient/
// GetPatients', debounce timing, keyboard nav) for no real functional gain --
// consistent with how the Doctor <autosearch> was already left native in
// registrationcumvisit.html. Only the two static, non-repeating chrome pieces
// are converted to React here: the top Add-member action and the bottom
// Back/Save/Clear/Cancel footer. Both dispatch straight through to the real,
// unchanged Angular functions (addNew/backTolist/saveItem/clear/saveCancelled).
// ---------------------------------------------------------------------------

export const FamilyLinkActionBar: React.FC<ScreenProps> = ({ reactProps, onAction }) => {
  const { flags = {} } = reactProps || {};
  const dispatch = (action: string) => { if (onAction) onAction(action); };

  if (!flags.canUpdatePatientInfo) return null;

  return (
    <div style={{ display: 'flex', justifyContent: 'flex-start', marginTop: spacing.xs, marginBottom: spacing.md }}>
      <Button
        variant="icon"
        icon="fa-plus"
        title="Add member"
        onClick={() => dispatch('addNew')}
      />
    </div>
  );
};

export const FamilyLinkFooter: React.FC<ScreenProps> = ({ reactProps, onAction }) => {
  const { flags = {} } = reactProps || {};
  const dispatch = (action: string) => { if (onAction) onAction(action); };

  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.lg }}>
      <div>
        <Button variant="secondary" icon="fa-angle-left" onClick={() => dispatch('backTolist')}>
          Back
        </Button>
      </div>
      <div style={{ display: 'flex', gap: spacing.sm }}>
        {flags.canUpdatePatientInfo && (
          <Button variant="primary" onClick={() => dispatch('saveItem')}>
            Save
          </Button>
        )}
        <Button variant="secondary" onClick={() => dispatch('clear')}>
          Clear
        </Button>
        {/* saveCancelled() is not defined anywhere in this controller's scope chain --
            preserved verbatim as a real, silent no-op (UNDEFINED-FUNCTION-ON-BUTTON). */}
        <Button variant="secondary" onClick={() => dispatch('saveCancelled')}>
          Cancel
        </Button>
      </div>
    </div>
  );
};
