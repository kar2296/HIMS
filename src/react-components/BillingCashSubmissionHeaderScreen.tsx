import React from 'react';
import { spacing, typography } from '../components/ui/tokens';

interface BillingCashSubmissionHeaderScreenProps {
  reactProps?: any;
  onAction?: (actionName: string, payload?: any) => void;
}

// UI-MODERNIZATION RETROFIT (Billing / Cash Submissions List,
// app.cashsubmission-list) -- header half of the hybrid bridge; see
// cashsubmission-list.html's top-of-file disclosure for the full
// rationale (the native <autosearch> field between this mount and
// BillingCashSubmissionListScreen cannot run inside React).
//
// Confirmed pre-existing quirk, preserved exactly (not "fixed"): the
// advance-filter button's tooltip binding
// "{{ '  clinicalmaster.serviceitem-list.filter-tooltip.lbl' | translate }}"
// has two leading spaces INSIDE the string literal, so it can never
// match a real i18n key -- reproduced verbatim as a literal tooltip
// string. The button has never shown a visible text label (its
// <span translate="clinicalmaster.serviceitem-list.filter.lbl"> was
// already HTML-commented out in the original).
export const BillingCashSubmissionHeaderScreen: React.FC<BillingCashSubmissionHeaderScreenProps> = ({ onAction }) => {
  const dispatch = (action: string, payload?: any) => {
    if (onAction) onAction(action, payload);
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: `${spacing.sm} ${spacing.md} 0`, fontFamily: typography.fontFamily }}>
      <h4 style={{ margin: 0, ...typography.h4 }}>Cash Submissions</h4>
      <button
        type="button"
        title="  clinicalmaster.serviceitem-list.filter-tooltip.lbl"
        onClick={() => dispatch('openAdvancedFilter')}
        className="drhms-billing-btn drhms-previousbill-btn"
      >
        <i className="fas fa-search" aria-hidden="true"></i>
      </button>
    </div>
  );
};
