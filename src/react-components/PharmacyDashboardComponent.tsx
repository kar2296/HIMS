import React from 'react';
import './PharmacyDashboardComponent.css'; // Import the modern CSS

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
    
    return (
        <div className="pharmacy-dashboard-container">
            <h2 style={{ marginBottom: '24px', fontWeight: 600, color: '#333' }}>
                <i className="fa fa-medkit" style={{ marginRight: '12px', color: '#11998e' }}></i>
                Pharmacy Dashboard
            </h2>

            <div className="pharmacy-grid">
                {privileges.canMedicineSales && (
                    <div className="pharmacy-card gradient-sales" onClick={() => navigateTo('app.pharmacy-sales', { id: 0, context: 'pharmacy' })}>
                        <div className="pharmacy-card-header">
                            <div className="pharmacy-card-icon">
                                <i className="fa fa-registered" aria-hidden="true"></i>
                            </div>
                            <div className="pharmacy-card-title">Medicine Sales</div>
                        </div>
                        <i className="fa fa-arrow-right pharmacy-card-arrow"></i>
                    </div>
                )}
                
                {privileges.canMedicineReturns && (
                    <div className="pharmacy-card gradient-returns" onClick={() => navigateTo('app.pharmacy-return', { id: 0, context: 'pharmacy' })}>
                        <div className="pharmacy-card-header">
                            <div className="pharmacy-card-icon">
                                <i className="fa fa-user" aria-hidden="true"></i>
                            </div>
                            <div className="pharmacy-card-title">Medicine Return</div>
                        </div>
                        <i className="fa fa-arrow-right pharmacy-card-arrow"></i>
                    </div>
                )}

                {privileges.canStockIndent && (
                    <div className="pharmacy-card gradient-indent" onClick={() => navigateTo('app.stockrequests', { context: 'pharmacy' })}>
                        <div className="pharmacy-card-header">
                            <div className="pharmacy-card-icon">
                                <i className="fa fa-file-text-o" aria-hidden="true"></i>
                            </div>
                            <div className="pharmacy-card-title">Stock Indent</div>
                        </div>
                        <i className="fa fa-arrow-right pharmacy-card-arrow"></i>
                    </div>
                )}

                {privileges.canStockReceives && (
                    <div className="pharmacy-card gradient-receives" onClick={() => navigateTo('app.stocktacceptencelist', { context: 'pharmacy' })}>
                        <div className="pharmacy-card-header">
                            <div className="pharmacy-card-icon">
                                <i className="fa fa-usd" aria-hidden="true"></i>
                            </div>
                            <div className="pharmacy-card-title">Stock Receives</div>
                        </div>
                        <i className="fa fa-arrow-right pharmacy-card-arrow"></i>
                    </div>
                )}

                {privileges.canStockStatus && (
                    <div className="pharmacy-card gradient-status" onClick={() => navigateTo('app.stockstatus', { context: 'pharmacy' })}>
                        <div className="pharmacy-card-header">
                            <div className="pharmacy-card-icon">
                                <i className="fa fa-list" aria-hidden="true"></i>
                            </div>
                            <div className="pharmacy-card-title">Stock Status</div>
                        </div>
                        <i className="fa fa-arrow-right pharmacy-card-arrow"></i>
                    </div>
                )}

                {privileges.canStockMovement && (
                    <div className="pharmacy-card gradient-movement" onClick={() => navigateTo('app.stockmovement', { context: 'pharmacy' })}>
                        <div className="pharmacy-card-header">
                            <div className="pharmacy-card-icon">
                                <i className="fa fa-inr" aria-hidden="true"></i>
                            </div>
                            <div className="pharmacy-card-title">Stock Movement</div>
                        </div>
                        <i className="fa fa-arrow-right pharmacy-card-arrow"></i>
                    </div>
                )}

                {privileges.canMedicineCreditBills && (
                    <div className="pharmacy-card gradient-credit-sales" onClick={() => navigateTo('app.ip-pharmacy-sales', { context: 'pharmacy' })}>
                        <div className="pharmacy-card-header">
                            <div className="pharmacy-card-icon">
                                <i className="fa fa-percent" aria-hidden="true"></i>
                            </div>
                            <div className="pharmacy-card-title">IP Pharmacy Sale</div>
                        </div>
                        <i className="fa fa-arrow-right pharmacy-card-arrow"></i>
                    </div>
                )}

                {privileges.canMedicineCreditReturns && (
                    <div className="pharmacy-card gradient-credit-returns" onClick={() => navigateTo('app.ip-pharmacy-returns', { context: 'pharmacy' })}>
                        <div className="pharmacy-card-header">
                            <div className="pharmacy-card-icon">
                                <i className="fa fa-briefcase" aria-hidden="true"></i>
                            </div>
                            <div className="pharmacy-card-title">IP Pharmacy Return</div>
                        </div>
                        <i className="fa fa-arrow-right pharmacy-card-arrow"></i>
                    </div>
                )}

                {privileges.canPharmacyReports && (
                    <div className="pharmacy-card gradient-reports" onClick={() => navigateTo('app.pharmacytabreport.invoicecollectionreport', { context: 'pharmacy' })}>
                        <div className="pharmacy-card-header">
                            <div className="pharmacy-card-icon">
                                <i className="fa fa-file-text-o" aria-hidden="true"></i>
                            </div>
                            <div className="pharmacy-card-title">Reports</div>
                        </div>
                        <i className="fa fa-arrow-right pharmacy-card-arrow"></i>
                    </div>
                )}

                {privileges.canDirectPharmacySales && (
                    <div className="pharmacy-card gradient-direct-sales" onClick={() => navigateTo('app.pharmacy-directpatient-sales')}>
                        <div className="pharmacy-card-header">
                            <div className="pharmacy-card-icon">
                                <i className="fa fa-file-text-o" aria-hidden="true"></i>
                            </div>
                            <div className="pharmacy-card-title">Direct Patient Pharmacy Sales</div>
                        </div>
                        <i className="fa fa-arrow-right pharmacy-card-arrow"></i>
                    </div>
                )}

                {privileges.canDirectMedicineReturns && (
                    <div className="pharmacy-card gradient-direct-returns" onClick={() => navigateTo('app.direct-pharmacy-returns')}>
                        <div className="pharmacy-card-header">
                            <div className="pharmacy-card-icon">
                                <i className="fa fa-usd" aria-hidden="true"></i>
                            </div>
                            <div className="pharmacy-card-title">Direct Medicine Return</div>
                        </div>
                        <i className="fa fa-arrow-right pharmacy-card-arrow"></i>
                    </div>
                )}

                {privileges.canStaffCredits && (
                    <div className="pharmacy-card gradient-staff" onClick={() => navigateTo('app.staffcreditbilllist')}>
                        <div className="pharmacy-card-header">
                            <div className="pharmacy-card-icon">
                                <i className="fa fa-usd" aria-hidden="true"></i>
                            </div>
                            <div className="pharmacy-card-title">Staff Credit</div>
                        </div>
                        <i className="fa fa-arrow-right pharmacy-card-arrow"></i>
                    </div>
                )}

                {privileges.canStaffCreditPayment && (
                    <div className="pharmacy-card gradient-staff-payment" onClick={() => navigateTo('app.staffcreditpaymentlist')}>
                        <div className="pharmacy-card-header">
                            <div className="pharmacy-card-icon">
                                <i className="fa fa-list" aria-hidden="true"></i>
                            </div>
                            <div className="pharmacy-card-title">Staff Credit Payment</div>
                        </div>
                        <i className="fa fa-arrow-right pharmacy-card-arrow"></i>
                    </div>
                )}

                {privileges.canStaffCreditReturns && (
                    <div className="pharmacy-card gradient-staff-return" onClick={() => navigateTo('app.staffcreditreturns')}>
                        <div className="pharmacy-card-header">
                            <div className="pharmacy-card-icon">
                                <i className="fa fa-inr" aria-hidden="true"></i>
                            </div>
                            <div className="pharmacy-card-title">Staff Credit Returns</div>
                        </div>
                        <i className="fa fa-arrow-right pharmacy-card-arrow"></i>
                    </div>
                )}
            </div>
        </div>
    );
};
