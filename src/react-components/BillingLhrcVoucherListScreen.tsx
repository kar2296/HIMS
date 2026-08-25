import React from 'react';
import { Pagination } from '../components/ui/Pagination';
import { PageHeader } from '../components/ui/Breadcrumb';
import { Card } from '../components/ui/Card';
import { Button } from './Button';
import { colors, spacing, typography } from '../components/ui/tokens';

interface PersonRef {
  Title?: { Description?: string };
  FirstName?: string;
  LastName?: string;
}

interface VoucherRow {
  Id: number;
  VoucherDate?: string;
  LHRCVoucherNo?: string;
  VoucherAmount?: number;
  CreatedUser?: PersonRef;
  VoucherType?: { Description?: string };
  VoucherStatus?: { Description?: string };
  VoucherStatusId?: number;
}

interface PagerObj {
  totalItems?: number;
  currentPage?: number;
  startIndex?: number;
  pageSize?: number;
}

interface BillingLhrcVoucherListScreenProps {
  reactProps?: {
    items?: VoucherRow[];
    pagerObj?: PagerObj;
  };
  onAction?: (actionName: string, payload?: any) => void;
}

function formatVoucherDate(val?: string): string {
  if (!val) return '';
  const d = new Date(val);
  if (isNaN(d.getTime())) return '';
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const dd = String(d.getDate()).padStart(2, '0');
  const mmm = months[d.getMonth()];
  const yyyy = d.getFullYear();
  const hh = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${dd}-${mmm}-${yyyy} ${hh}:${min}`;
}

function formatCurrency(val?: number): string {
  if (val == null) return '';
  return val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatUserName(u?: PersonRef): string {
  if (!u) return '';
  return `${u.Title?.Description || ''} ${u.FirstName || ''} ${u.LastName || ''}`;
}

const thStyle: React.CSSProperties = {
  textAlign: 'left', padding: `${spacing.sm} ${spacing.md}`, borderBottom: `1px solid ${colors.border}`,
  ...typography.label, color: colors.textMuted, fontFamily: typography.fontFamily,
};
const tdStyle: React.CSSProperties = {
  padding: `${spacing.sm} ${spacing.md}`, borderBottom: `1px solid ${colors.border}`,
  ...typography.body, color: colors.textMain, fontFamily: typography.fontFamily,
};

// UI-MODERNIZATION RETROFIT (Billing / LHRC Voucher list, app.lhrcvoucher,
// LHRCVoucherListController). Real state registered in hims-states.js
// (with a real modal app.lhrcvoucherform opened from this list's own
// addNew()/handleEvents('edit',...)). NOTE ON REACHABILITY: unlike most
// screens migrated earlier this session, no $state.go/ui-sref reference
// to app.lhrcvoucher was found anywhere in the codebase via static
// search. This module's navigation (like several other Billing screens)
// appears to be driven by a database-backed Control/menu system
// (SystemSettings/Control/GetControls in public/js/app.js) that static
// analysis cannot inspect -- the real state and modal registrations are
// treated as sufficient evidence this screen is live, consistent with
// how this migration has handled other Billing screens with the same
// profile. Flagged here for the record rather than silently assumed.
//
// DELIBERATE PARTIAL MIGRATION: the entire filter row (Voucher No, Date,
// Created By, Status) is left as native, untouched AngularJS markup in
// lhrcvoucher-list.html rather than migrated here. The "Created By"
// field uses the real <autosearch> component
// (public/vendor/components/autosearch.js), a generic, reusable
// AngularJS-only typeahead mechanism used across many unrelated screens
// -- splitting that one field out of its row while migrating its three
// siblings would fragment a single visual row across two rendering
// frameworks for no real benefit, so the whole filter row stays native,
// matching the same hybrid-migration precedent already used for
// creditnote-list.js's "Fetch" popover and the cnpicker/
// outstandingreceipt-list modals' dynamicform filter areas. Only the
// header, results grid, and pagination are rebuilt in React.
//
// AngularJS remains authoritative for the real
// Billing/LHRCVoucher/GetLHRCVouchers/DeleteLHRCVoucher calls and the
// modal open/confirm lifecycle. React only renders reactProps and
// dispatches action names via handleReactAction.
export const BillingLhrcVoucherListScreen: React.FC<BillingLhrcVoucherListScreenProps> = ({ onAction }) => {
  const dispatch = (action: string, payload?: any) => {
    if (onAction) onAction(action, payload);
  };

  return (
    <div style={{ maxWidth: 1300, margin: '0 auto', padding: `${spacing.lg} ${spacing.xl} 0` }}>
      <PageHeader
        title="LHRC Voucher"
        actions={
          <Button variant="primary" icon="fa-plus" onClick={() => dispatch('addNew')}>Add New</Button>
        }
      />
    </div>
  );
};

// A second mount, BillingLhrcVoucherGridScreen, renders the grid and
// pagination below the native filter row -- see lhrcvoucher-list.html.
export const BillingLhrcVoucherGridScreen: React.FC<BillingLhrcVoucherListScreenProps> = ({ reactProps, onAction }) => {
  const { items = [], pagerObj = {} } = reactProps || {};

  const dispatch = (action: string, payload?: any) => {
    if (onAction) onAction(action, payload);
  };

  const totalItems = pagerObj.totalItems || 0;
  const pageSize = pagerObj.pageSize || 25;
  const currentPage = pagerObj.currentPage || 1;

  return (
    <div style={{ maxWidth: 1300, margin: '0 auto', padding: `0 ${spacing.xl} 40px` }}>
      <Card>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={thStyle}>S.No.</th>
                <th style={thStyle}>Date</th>
                <th style={thStyle}>Voucher No</th>
                <th style={thStyle}>Amount</th>
                <th style={thStyle}>User Name</th>
                <th style={thStyle}>Type</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 && (
                <tr><td style={tdStyle} colSpan={8}>No records found.</td></tr>
              )}
              {items.map((row, idx) => (
                <tr key={row.Id}>
                  <td style={tdStyle}>{idx + 1}</td>
                  <td style={tdStyle}>{formatVoucherDate(row.VoucherDate)}</td>
                  <td style={tdStyle}>{row.LHRCVoucherNo}</td>
                  <td style={tdStyle}>{formatCurrency(row.VoucherAmount)}</td>
                  <td style={tdStyle}>{formatUserName(row.CreatedUser)}</td>
                  <td style={tdStyle}>{row.VoucherType?.Description}</td>
                  <td style={tdStyle}>{row.VoucherStatus?.Description}</td>
                  <td style={tdStyle}>
                    <div style={{ display: 'flex', gap: spacing.sm }}>
                      {(row.VoucherStatusId === 2 || row.VoucherStatusId === 3) && (
                        <span style={{ cursor: 'pointer', color: colors.primary }} title="View" onClick={() => dispatch('view', row)}>
                          <i className="fas fa-eye" aria-hidden="true" />
                        </span>
                      )}
                      {row.VoucherStatusId === 1 && (
                        <>
                          <span style={{ cursor: 'pointer' }} title="Edit" onClick={() => dispatch('edit', row)}>
                            <i className="fas fa-pen" aria-hidden="true" />
                          </span>
                          <span style={{ cursor: 'pointer' }} title="Delete" onClick={() => dispatch('delete', row)}>
                            <i className="fas fa-trash" aria-hidden="true" />
                          </span>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Pagination
          currentPage={currentPage}
          totalItems={totalItems}
          pageSize={pageSize}
          onPageChange={(page) => dispatch('pageChange', { page })}
        />
      </Card>
    </div>
  );
};
