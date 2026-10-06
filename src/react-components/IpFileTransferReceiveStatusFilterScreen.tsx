import React from 'react';
import { LookupSelect } from '../components/ui/LookupSelect';

interface Props {
  reactProps: any;
  onAction: (actionType: string, payload: any) => void;
}

/**
 * Billing > IP File Management > IP File Transfer Receive list filter.
 *
 * Replaces the single <ui-select> for the status filter
 * (currentfilter.MRDIPFileStatusId, ng-change="getList()"). No ng-disabled
 * in the original.
 *
 * UI-MODERNIZATION RETROFIT: renders through the shared LookupSelect, same
 * as the sibling Transferred File Receive filter. Same dispatch/payload.
 *
 * Pre-existing quirk kept: this controller's default
 * currentfilter.MRDIPFileStatusId is the array [4, 5] (a multi-status filter
 * used only for the first getList() call), which never matches a single
 * option -- so the control shows no selection until the user picks one,
 * exactly as the original ui-select bound to the same model did.
 */
export const IpFileTransferReceiveStatusFilterScreen: React.FC<Props> = ({ reactProps, onAction }) => (
  <LookupSelect
    options={reactProps?.statusOptions}
    value={reactProps?.statusId}
    onChange={(id) => onAction('statusChange', { id })}
  />
);
