import React from 'react';
import { LookupSelect } from '../components/ui/LookupSelect';

interface Props {
  reactProps: any;
  onAction: (actionType: string, payload: any) => void;
}

/**
 * Billing > IP File Management > Transferred File Receive list filter.
 *
 * Replaces the single <ui-select> for the status filter
 * (currentfilter.MRDIPFileStatusId, ng-change="getList()"). No ng-disabled
 * in the original.
 *
 * UI-MODERNIZATION RETROFIT: now renders through the shared LookupSelect
 * (design-system Select + the standard {Id,Text} lookup adapter) instead of
 * a hand-rolled <select>. Same dispatch, same payload shape, same lookup
 * array -- the change is presentational only.
 */
export const TransferredFileReceiveStatusFilterScreen: React.FC<Props> = ({ reactProps, onAction }) => (
  <LookupSelect
    options={reactProps?.statusOptions}
    value={reactProps?.statusId}
    onChange={(id) => onAction('statusChange', { id })}
  />
);
