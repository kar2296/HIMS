import React from 'react';
import { PageHeader } from '../components/ui/Breadcrumb';
import { Card } from '../components/ui/Card';
import { colors, radii, spacing, typography } from '../components/ui/tokens';

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
    context: {
        FacilityId: number;
        DoctorId: number;
        FromDate: string;
        ToDate: string;
    };
}

interface PharmacyDashboardProps {
    navigateTo: (state: string, params?: any) => void;
    reactProps: ReactProps;
}

export const PharmacyDashboardComponent: React.FC<PharmacyDashboardProps> = ({ navigateTo, reactProps }) => {
    const { privileges } = reactProps;

    const cards = [
        {
            title: 'Medicine Sales',
            icon: 'fa-registered',
            show: privileges.canMedicineSales,
            color: '#4a90e2',
            action: () => navigateTo('app.pharmacy-sales', { id: 0, context: 'pharmacy' })
        },
        {
            title: 'Medicine Return',
            icon: 'fa-user',
            show: privileges.canMedicineReturns,
            color: '#50e3c2',
            action: () => navigateTo('app.pharmacy-return', { id: 0, context: 'pharmacy' })
        },
        {
            title: 'Stock Indent',
            icon: 'fa-file-text-o',
            show: privileges.canStockIndent,
            color: '#f5a623',
            action: () => navigateTo('app.stockrequests', { context: 'pharmacy' })
        },
        {
            title: 'Stock Receives',
            icon: 'fa-usd',
            show: privileges.canStockReceives,
            color: '#7ed321',
            action: () => navigateTo('app.stocktacceptencelist', { context: 'pharmacy' })
        },
        {
            title: 'Stock Status',
            icon: 'fa-list',
            show: privileges.canStockStatus,
            color: '#bd10e0',
            action: () => navigateTo('app.stockstatus', { context: 'pharmacy' })
        },
        {
            title: 'Stock Movement',
            icon: 'fa-inr',
            show: privileges.canStockMovement,
            color: '#ff5a5f',
            action: () => navigateTo('app.stockmovement', { context: 'pharmacy' })
        },
        {
            title: 'IP Pharmacy Sale',
            icon: 'fa-percent',
            show: privileges.canMedicineCreditBills,
            color: '#8b572a',
            action: () => navigateTo('app.ip-pharmacy-sales', { context: 'pharmacy' })
        },
        {
            title: 'IP Pharmacy Return',
            icon: 'fa-briefcase',
            show: privileges.canMedicineCreditReturns,
            color: '#e46a76',
            action: () => navigateTo('app.ip-pharmacy-returns', { context: 'pharmacy' })
        },
        {
            title: 'Reports',
            icon: 'fa-file-text-o',
            show: privileges.canPharmacyReports,
            color: '#00c292',
            action: () => navigateTo('app.pharmacytabreport.invoicecollectionreport', { context: 'pharmacy' })
        },
        {
            title: 'Direct Patient Pharmacy Sales',
            icon: 'fa-file-text-o',
            show: privileges.canDirectPharmacySales,
            color: '#4a90e2',
            action: () => navigateTo('app.pharmacy-directpatient-sales')
        },
        {
            title: 'Direct Medicine Return',
            icon: 'fa-usd',
            show: privileges.canDirectMedicineReturns,
            color: '#f5a623',
            action: () => navigateTo('app.direct-pharmacy-returns')
        },
        {
            title: 'Staff Credit',
            icon: 'fa-usd',
            show: privileges.canStaffCredits,
            color: '#bd10e0',
            action: () => navigateTo('app.staffcreditbilllist')
        },
        {
            title: 'Staff Credit Payment',
            icon: 'fa-list',
            show: privileges.canStaffCreditPayment,
            color: '#50e3c2',
            action: () => navigateTo('app.staffcreditpaymentlist')
        },
        {
            title: 'Staff Credit Returns',
            icon: 'fa-inr',
            show: privileges.canStaffCreditReturns,
            color: '#e46a76',
            action: () => navigateTo('app.staffcreditreturns')
        }
    ];

    return (
        <div style={{ padding: spacing.xl, fontFamily: typography.fontFamily, backgroundColor: colors.surfaceMuted, minHeight: '100vh' }}>

            {/* Header */}
            <PageHeader title="Pharmacy Dashboard" />

            {/* Cards Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                gap: spacing.lg
            }}>
                {cards.filter(c => c.show).map((card, idx) => (
                    <div
                        key={idx}
                        onClick={card.action}
                        style={{
                            cursor: 'pointer',
                            transition: 'transform 0.2s',
                            height: '140px'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-4px)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                        }}
                    >
                        <Card
                            style={{
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                borderTop: `4px solid ${card.color}`
                            }}
                        >
                            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div style={{
                                        width: '45px',
                                        height: '45px',
                                        borderRadius: radii.md,
                                        backgroundColor: `${card.color}15`,
                                        color: card.color,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '20px'
                                    }}>
                                        <i className={`fas ${card.icon}`}></i>
                                    </div>
                                </div>

                                <div style={{ ...typography.label, color: colors.textMuted, fontFamily: typography.fontFamily, marginTop: 'auto' }}>
                                    {card.title}
                                </div>
                            </div>
                        </Card>
                    </div>
                ))}
            </div>

        </div>
    );
};
