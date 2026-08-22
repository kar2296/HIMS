import React from 'react';
import { colors, spacing, typography } from '../components/ui/tokens';
import { StatCard, ActionCard, DashboardSection, DashboardPageWrapper } from '../components/ui/DashboardComponents';

interface PrivilegeMap {
  canMedicineSales: boolean;
  canMedicineReturns: boolean;
  canStockIndent: boolean;
  canStockReceives: boolean;
  canStockStatus: boolean;
  canStockMovement: boolean;
  canMedicineCreditBills: boolean;
  canMedicineCreditReturns: boolean;
  canPharmacyReports: boolean;
  canDirectPharmacySales: boolean;
  canDirectMedicineReturns: boolean;
  canStaffCredits: boolean;
  canStaffCreditPayment: boolean;
  canStaffCreditReturns: boolean;
}

interface ReactProps {
  privileges: PrivilegeMap;
  context: { FacilityId: number; DoctorId: number; FromDate: string; ToDate: string };
}

interface PharmacyDashboardProps {
  navigateTo: (state: string, params?: any) => void;
  reactProps: ReactProps;
}

export const PharmacyDashboardComponent: React.FC<PharmacyDashboardProps> = ({ navigateTo, reactProps }) => {
  const { privileges } = reactProps;

  const salesCards = [
    { title: 'Medicine Sales', icon: 'fa-pills', color: '#2563eb', show: privileges.canMedicineSales, action: () => navigateTo('app.pharmacy-sales', { id: 0, context: 'pharmacy' }) },
    { title: 'Medicine Return', icon: 'fa-rotate-left', color: '#0ea5e9', show: privileges.canMedicineReturns, action: () => navigateTo('app.pharmacy-return', { id: 0, context: 'pharmacy' }) },
    { title: 'IP Pharmacy Sale', icon: 'fa-hospital', color: '#8b5cf6', show: privileges.canMedicineCreditBills, action: () => navigateTo('app.ip-pharmacy-sales', { context: 'pharmacy' }) },
    { title: 'IP Pharmacy Return', icon: 'fa-arrow-rotate-left', color: '#ec4899', show: privileges.canMedicineCreditReturns, action: () => navigateTo('app.ip-pharmacy-returns', { context: 'pharmacy' }) },
    { title: 'Direct Sales', icon: 'fa-cash-register', color: '#10b981', show: privileges.canDirectPharmacySales, action: () => navigateTo('app.pharmacy-directpatient-sales') },
    { title: 'Direct Returns', icon: 'fa-undo', color: '#f97316', show: privileges.canDirectMedicineReturns, action: () => navigateTo('app.direct-pharmacy-returns') },
  ].filter((c) => c.show);

  const stockCards = [
    { title: 'Stock Indent', icon: 'fa-file-arrow-down', color: '#f59e0b', show: privileges.canStockIndent, action: () => navigateTo('app.stockrequests', { context: 'pharmacy' }) },
    { title: 'Stock Receives', icon: 'fa-boxes-stacked', color: '#06b6d4', show: privileges.canStockReceives, action: () => navigateTo('app.stocktacceptencelist', { context: 'pharmacy' }) },
    { title: 'Stock Status', icon: 'fa-chart-bar', color: '#6366f1', show: privileges.canStockStatus, action: () => navigateTo('app.stockstatus', { context: 'pharmacy' }) },
    { title: 'Stock Movement', icon: 'fa-arrows-rotate', color: '#14b8a6', show: privileges.canStockMovement, action: () => navigateTo('app.stockmovement', { context: 'pharmacy' }) },
  ].filter((c) => c.show);

  const creditCards = [
    { title: 'Staff Credit', icon: 'fa-user-tie', color: '#8b5cf6', show: privileges.canStaffCredits, action: () => navigateTo('app.staffcreditbilllist') },
    { title: 'Credit Payment', icon: 'fa-money-check', color: '#10b981', show: privileges.canStaffCreditPayment, action: () => navigateTo('app.staffcreditpaymentlist') },
    { title: 'Credit Returns', icon: 'fa-rotate-right', color: '#ec4899', show: privileges.canStaffCreditReturns, action: () => navigateTo('app.staffcreditreturns') },
    { title: 'Reports', icon: 'fa-chart-column', color: '#84cc16', show: privileges.canPharmacyReports, action: () => navigateTo('app.pharmacytabreport.invoicecollectionreport', { context: 'pharmacy' }) },
  ].filter((c) => c.show);

  return (
    <DashboardPageWrapper title="Pharmacy Dashboard" subtitle="Medicine sales, stock management & staff credits">
      {salesCards.length > 0 && (
        <DashboardSection title="Sales & Returns">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: spacing.lg }}>
            {salesCards.map((card, i) => (
              <StatCard key={i} title={card.title} icon={card.icon} color={card.color} onClick={card.action} />
            ))}
          </div>
        </DashboardSection>
      )}

      {stockCards.length > 0 && (
        <DashboardSection title="Inventory & Stock">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: spacing.md }}>
            {stockCards.map((card, i) => (
              <ActionCard key={i} title={card.title} icon={card.icon} color={card.color} onClick={card.action} />
            ))}
          </div>
        </DashboardSection>
      )}

      {creditCards.length > 0 && (
        <DashboardSection title="Staff Credit & Reports">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: spacing.md }}>
            {creditCards.map((card, i) => (
              <ActionCard key={i} title={card.title} icon={card.icon} color={card.color} onClick={card.action} />
            ))}
          </div>
        </DashboardSection>
      )}
    </DashboardPageWrapper>
  );
};
