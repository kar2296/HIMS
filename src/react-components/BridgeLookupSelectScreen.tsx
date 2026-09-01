import React from 'react';
import { LookupSelect } from '../components/ui/LookupSelect';

interface Props {
  reactProps: any;
  onAction: (actionType: string, payload: any) => void;
}

/**
 * Shared renderer for a single <ui-select> bound to a lookup array, which is
 * by far the most repeated control in this migration (filter dropdowns and
 * simple form dropdowns alike). One component for all of them instead of a
 * near-duplicate per screen.
 *
 * The calling bridge supplies the real lookup array off $scope.lookup.<Key>,
 * the current model value and the disabled flag, and receives 'change' with
 * the numeric Id -- so the screen's existing ng-change handler function is
 * still what runs, unchanged, in its own controller.
 *
 * Multiple selects on one screen pass a `part` through reactProps and get
 * their own container; this component itself holds no screen-specific logic.
 */
export const BridgeLookupSelectScreen: React.FC<Props> = ({ reactProps, onAction }) => (
  <LookupSelect
    options={reactProps?.options}
    value={reactProps?.value}
    disabled={!!reactProps?.disabled}
    titlePrefixed={!!reactProps?.titlePrefixed}
    name={reactProps?.name}
    id={reactProps?.id}
    onChange={(id) => onAction('change', { id })}
    onKeyUp={reactProps?.keyUpId ? () => onAction('keyUp', { nextId: reactProps.keyUpId }) : undefined}
  />
);
