import React, { useEffect, useState } from 'react';

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

import { apiFetch } from './utils/api';

export const PharmacyDashboardComponent: React.FC<PharmacyDashboardProps> = ({ navigateTo, reactProps }) => {
    const { privileges, context } = reactProps;
    
    // In legacy, Items.checkedincount was used as a fallback for almost all cards
    // Items.appoinmentCount was used for one card
    const [counts, setCounts] = useState({
        appointmentCount: '0',
        checkedInCount: '0',
    });

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // Fetch Dashboard Options
                const dashboardOptionsData = {
                    Data: {
                        Keys: [
                            { Key: 'appointment' },
                            { Key: 'mycheckedin' }
                        ]
                    },
                    Attributes: context
                };

                const dashboardRes = await apiFetch({
                    action: 'Visit/DoctorDashboard/GetDashboardOptions',
                    data: dashboardOptionsData,
                    type: 'post'
                });

                setCounts({
                    appointmentCount: dashboardRes?.appointment?.appoinmentCount || '0',
                    checkedInCount: dashboardRes?.mycheckedin?.checkedincount || '0',
                });
            } catch (error) {
                console.error("Failed to fetch pharmacy dashboard data", error);
            }
        };

        fetchDashboardData();
    }, [context]);

    return (
        <div id="cemr_dashboard" style={{ marginTop: '20px' }}>
            <div className="col-sm-12">
                <div className="card-flex-box-billing">
                    {privileges.canMedicineSales && (
                        <div className="card-box-item box-bg-color1" onClick={() => navigateTo('app.pharmacy-sales', { id: 0, context: 'pharmacy' })}>
                            <div className="card-box-header">
                                <i className="fa fa-registered" aria-hidden="true"></i>
                                <div>Medicine Sales</div>
                            </div>
                            <div>{counts.checkedInCount}</div>
                        </div>
                    )}
                    
                    {privileges.canMedicineReturns && (
                        <div className="card-box-item box-bg-color2" onClick={() => navigateTo('app.pharmacy-return', { id: 0, context: 'pharmacy' })}>
                            <div className="card-box-header">
                                <div> <i className="fa fa-user" aria-hidden="true"></i></div>
                                <div>Medicine Return</div>
                            </div>
                            <div>{counts.appointmentCount}</div>
                        </div>
                    )}

                    {privileges.canStockIndent && (
                        <div className="card-box-item box-bg-color3" onClick={() => navigateTo('app.stockrequests', { context: 'pharmacy' })}>
                            <div className="card-box-header">
                                <div><i className="fa fa-file-text-o" aria-hidden="true"></i></div>
                                <div>Stock Indent</div>
                            </div>
                            <div>{counts.checkedInCount}</div>
                        </div>
                    )}

                    {privileges.canStockReceives && (
                        <div className="card-box-item box-bg-color4" onClick={() => navigateTo('app.stocktacceptencelist', { context: 'pharmacy' })}>
                            <div className="card-box-header">
                                <div> <i className="fa fa-usd" aria-hidden="true"></i></div>
                                <div>Stock Receives</div>
                            </div>
                            <div>{counts.checkedInCount}</div>
                        </div>
                    )}

                    {privileges.canStockStatus && (
                        <div className="card-box-item box-bg-color5" onClick={() => navigateTo('app.stockstatus', { context: 'pharmacy' })}>
                            <div className="card-box-header">
                                <div><i className="fa fa-list" aria-hidden="true"></i></div>
                                <div>Stock Status</div>
                            </div>
                            <div>{counts.checkedInCount}</div>
                        </div>
                    )}

                    {privileges.canStockMovement && (
                        <div className="card-box-item box-bg-color6" onClick={() => navigateTo('app.stockmovement', { context: 'pharmacy' })}>
                            <div className="card-box-header">
                                <div><i className="fa fa-inr" aria-hidden="true"></i></div>
                                <div>Stock Movement</div>
                            </div>
                            <div>{counts.checkedInCount}</div>
                        </div>
                    )}

                    {privileges.canMedicineCreditBills && (
                        <div className="card-box-item box-bg-color7" onClick={() => navigateTo('app.ip-pharmacy-sales', { context: 'pharmacy' })}>
                            <div className="card-box-header">
                                <div><i className="fa fa-percent" aria-hidden="true"></i></div>
                                <div>IP Pharmacy Sale</div>
                            </div>
                            <div>{counts.checkedInCount}</div>
                        </div>
                    )}

                    {privileges.canMedicineCreditReturns && (
                        <div className="card-box-item box-bg-color8" onClick={() => navigateTo('app.ip-pharmacy-returns', { context: 'pharmacy' })}>
                            <div className="card-box-header">
                                <div><i className="fa fa-briefcase" aria-hidden="true"></i></div>
                                <div>IP Pharmacy Return</div>
                            </div>
                            <div>{counts.checkedInCount}</div>
                        </div>
                    )}

                    {privileges.canPharmacyReports && (
                        <div className="card-box-item box-bg-color9" onClick={() => navigateTo('app.pharmacytabreport.invoicecollectionreport', { context: 'pharmacy' })}>
                            <div className="card-box-header">
                                <div><i className="fa fa-file-text-o" aria-hidden="true"></i></div>
                                <div>Reports</div>
                            </div>
                            <div>{counts.checkedInCount}</div>
                        </div>
                    )}

                    {privileges.canDirectPharmacySales && (
                        <div className="card-box-item box-bg-color3" onClick={() => navigateTo('app.pharmacy-directpatient-sales')}>
                            <div className="card-box-header">
                                <div><i className="fa fa-file-text-o" aria-hidden="true"></i></div>
                                <div>Direct Patient Pharmacy Sales</div>
                            </div>
                            <div>{counts.checkedInCount}</div>
                        </div>
                    )}

                    {privileges.canDirectMedicineReturns && (
                        <div className="card-box-item box-bg-color4" onClick={() => navigateTo('app.direct-pharmacy-returns')}>
                            <div className="card-box-header">
                                <div> <i className="fa fa-usd" aria-hidden="true"></i></div>
                                <div>Direct Medicine Return</div>
                            </div>
                            <div>{counts.checkedInCount}</div>
                        </div>
                    )}

                    {privileges.canStaffCredits && (
                        <div className="card-box-item box-bg-color4" onClick={() => navigateTo('app.staffcreditbilllist')}>
                            <div className="card-box-header">
                                <div> <i className="fa fa-usd" aria-hidden="true"></i></div>
                                <div>Staff Credit</div>
                            </div>
                            <div>{counts.checkedInCount}</div>
                        </div>
                    )}

                    {privileges.canStaffCreditPayment && (
                        <div className="card-box-item box-bg-color5" onClick={() => navigateTo('app.staffcreditpaymentlist')}>
                            <div className="card-box-header">
                                <div><i className="fa fa-list" aria-hidden="true"></i></div>
                                <div>Staff Credit Payment</div>
                            </div>
                            <div>{counts.checkedInCount}</div>
                        </div>
                    )}

                    {privileges.canStaffCreditReturns && (
                        <div className="card-box-item box-bg-color6" onClick={() => navigateTo('app.staffcreditreturns')}>
                            <div className="card-box-header">
                                <div><i className="fa fa-inr" aria-hidden="true"></i></div>
                                <div>Staff Credit Returns</div>
                            </div>
                            <div>{counts.checkedInCount}</div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
