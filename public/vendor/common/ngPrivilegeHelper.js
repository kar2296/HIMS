(function () {
    'use strict';

    angular
        .module('common.utils')
        .factory('ngPrivilegeHelper', ['ngSessionHelper',
            function (ngSessionHelper) {

                var privileges = {
                    "CanItemDetails": CanItemDetails,
                    "CanUomConversion": CanUomConversion,
                    "CanStoreAssociation": CanStoreAssociation,
                    "CanHospitalMapping": CanHospitalMapping,
                    "CanSupplierMapping": CanSupplierMapping,
                    "CanContract": CanContract,
                    "CanPSDmPrint": CanPSDmPrint,
                    "CanPSDiscount": CanPSDiscount,
                    //grn button
                    "CanIndent_Authorize": CanIndent_Authorize,
                    "CanIndent_Approve": CanIndent_Approve,
                    "CanIndent_Save": CanIndent_Save,
                    "CanGRN_Approve_Button": CanGRN_Approve_Button,
                    "CanGRN_Authorize_Button": CanGRN_Authorize_Button,
                    "CanGRN_Save_Button": CanGRN_Save_Button,
                    "CanAmend": CanAmend,
                    // front office
                    "CanRegistration": CanRegistration,
                    "CanAppointments": CanAppointments,
                    "CanOPbilling": CanOPbilling,
                    "CanDirectBilling": CanDirectBilling,
                    "CanLabBilling": CanLabBilling,
                    "CanAdmissions": CanAdmissions,
                    "CanBedTransfer": CanBedTransfer,
                    "CanCurrentIpPatients": CanCurrentIpPatients,
                    "CanFrontOfficeReports": CanFrontOfficeReports,
                    //lab dashboard
                    "CanOrderAcceptances": CanOrderAcceptances,
                    "CanSpecimenCollection": CanSpecimenCollection,
                    "CanResultEntries": CanResultEntries,
                    "CanResultApprovals": CanResultApprovals,
                    "CanResultReleases": CanResultReleases,
                    "CanResultTemplates": CanResultTemplates,
                    "CanManageTests": CanManageTests,
                    "CanManageParameter": CanManageParameter,
                    "CanReports": CanReports,
                    //ris dashboard
                    "CanRis_OrderAcceptances": CanRis_OrderAcceptances,
                    "CanRis_RateEnquiry": CanRis_RateEnquiry,
                    "CanRis_ResultEntries": CanRis_ResultEntries,
                    "CanRis_ResultApprovals": CanRis_ResultApprovals,
                    "CanRis_ResultReleases": CanRis_ResultReleases,
                    "CanRis_ResultTemplates": CanRis_ResultTemplates,
                    "CanRis_ManageTests": CanRis_ManageTests,
                    "CanRis_ManageParameter": CanRis_ManageParameter,
                    "CanRis_Reports": CanRis_Reports,
                    "CanEquipmentUsage": CanEquipmentUsage,
                    "Canbloodbank":Canbloodbank,
                    "Canipform":Canipform,
                    // Requested by the patient EMR sidebar (app.js) but not configured for any role yet.
                    "CanLocalWellOrders": notConfigured,
                    "Cannew_born": notConfigured,
                    "Canpatient_Labour": notConfigured,
                    "CantaskAssignment": notConfigured,
                    "CanIncident": notConfigured,
                    "CanpackageeditButton": notConfigured,




                    //pharmacy dashboard
                    "CanMedicineSales": CanMedicineSales,
                    "CanMedicineReturns": CanMedicineReturns,
                    "CanInjuctionBilling": CanInjuctionBilling,
                    "CanInjuctionWorklist": CanInjuctionWorklist,
                    "CanStockIndent": CanStockIndent,
                    "CanStockReceives": CanStockReceives,
                    "CanStockStatus": CanStockStatus,
                    "CanStockMovement": CanStockMovement,
                    "CanPharmacyReports": CanPharmacyReports,
                    "CanMedicineCreditBills": CanMedicineCreditBills,
                    "CanMedicineCreditReturns": CanMedicineCreditReturns,
                    "CanDirectPharmacySales": CanDirectPharmacySales,
                    "CanDirectMedicineReturns": CanDirectMedicineReturns,
                    "CanStaffCredits": CanStaffCredits,
                    "CanStaffCreditPayment": CanStaffCreditPayment,
                    "CanStaffCreditReturns":CanStaffCreditReturns,
                    // store dashboard

                    "CanPurchaseOrders": CanPurchaseOrders,
                    "CanInvoiceEntry": CanInvoiceEntry,
                    "CanPurchase_Order_Pending_Approvals": CanPurchase_Order_Pending_Approvals,
                    "CanInvoice_Returns": CanInvoice_Returns,
                    "CanStock_Indents": CanStock_Indents,
                    "CanIndent_Work_Lists": CanIndent_Work_Lists,
                    "CanStock_Status": CanStock_Status,
                    "CanStock_Movement": CanStock_Movement,
                    "CanStock_Receives": CanStock_Receives,
                    "CanCustomer_Sales": CanCustomer_Sales,
                    "CanCustomer_Returns": CanCustomer_Returns,
                    "CanStoreReports": CanStoreReports,
                    "CanVendorPayment": CanVendorPayment,


                    //Nursing Dashboard
                    "CanWardManagement": CanWardManagement,
                    "CanNursingBedTransfer": CanNursingBedTransfer,
                    "CanNursingCurrentIpPatients": CanNursingCurrentIpPatients,
                    "CanNursingCurrentOpPatients": CanNursingCurrentOpPatients,
                    "CanNursingAppointments": CanNursingAppointments,
                    "CanNursingWardManagement": CanNursingWardManagement,
                    "CanNursing_StockIndents": CanNursing_StockIndents,
                    "CanNursing_StockReceives": CanNursing_StockReceives,
                    "CanNotifications": CanNotifications,
                    "CanMedicineAdministration": CanMedicineAdministration,
                    "CanPatientMedicineIndents": CanPatientMedicineIndents,
                    "CanNursingReports": CanNursingReports,
                    "CanNursingMytask":CanNursingMytask,
                    "CanNursingBedManagement":CanNursingBedManagement,
                    "CanNursingBedReceive":CanNursingBedReceive,
                    //billing
                    "CanQuickRegistration": CanQuickRegistration,
                    "CanBilling_OPPatients": CanBilling_OPPatients,
                    "CanBilling_DirectBilling": CanBilling_DirectBilling,
                    "CanBilling_LabBilling": CanBilling_LabBilling,
                    "Canbilling_CurrentIpBilling": Canbilling_CurrentIpBilling,
                    "CanDischarged_IP_Billing": CanDischarged_IP_Billing,
                    "CanBilling_Admissions": CanBilling_Admissions,
                    "CanBilling_CurrentIPPatients": CanBilling_CurrentIPPatients,
                    "CanBillingReports": CanBillingReports,
                    "CanDisount": CanDisount,
                    "CanDelete": CanDelete,
                    //Billing Reports
                    "CanOpbiillsReports": CanOpbiillsReports,
                    "Cancollectiondetailbycashierreport":Cancollectiondetailbycashierreport,
                    "Cancollectiondetailbyallcashierreport":Cancollectiondetailbyallcashierreport,
                    "Canopipcollectionsummarybycashier":Canopipcollectionsummarybycashier,
                    "Canopcollectionsummarybycashier":Canopcollectionsummarybycashier,
                    "Canoverallcollectionsummary":Canoverallcollectionsummary,
                    "Canoverallcollectioncashier":Canoverallcollectioncashier,
                    "Caninsurancecreditsummary":Caninsurancecreditsummary,
                    "Caninsuranceoutstandingsummary":Caninsuranceoutstandingsummary,
                    "Canoutstandingreports":Canoutstandingreports,
                    "Canopduecollectreport":Canopduecollectreport,
                    "Candiscount":Candiscount,
                    "Cancancelreport":Cancancelreport,
                    "Canrefundreport":Canrefundreport,
                    "Candirectbillreport":Candirectbillreport,
                    "Cancollectionsummaryopip":Cancollectionsummaryopip,
                    "Cangeneralexpensereport":Cangeneralexpensereport,
                    "Canadvancefunddetailsreport":Canadvancefunddetailsreport,
                    "Canpatientfundadjustmentreport":Canpatientfundadjustmentreport,
                    //billing report tab 2
                    "Canipbillreport":Canipbillreport,
                    "Canipcollectiondetailbycashierreport":Canipcollectiondetailbycashierreport,
                    "Canipcollectionsummarybycashier":Canipcollectionsummarybycashier,
                    "Caniprefundreport":Caniprefundreport,
                    "Canipduecollectreport":Canipduecollectreport,
                    "Cancurrentoccupancyreport":Cancurrentoccupancyreport,
                    "Canipcancelreport":Canipcancelreport,
                    "Canipdiscountreport":Canipdiscountreport,
                    "Canipinsurancereport":Canipinsurancereport,
                    "Canipdue":Canipdue,
                    "Canipadmissionreport":Canipadmissionreport,
                    "Canipdischargereport":Canipdischargereport,
                    "Canipoccupancyreportwithadvance":Canipoccupancyreportwithadvance,
                    //billing report TAB 3
                    "Canbillingservice":Canbillingservice,
                    "CanbillingGroup":CanbillingGroup,
                    "Canbillingpackage":Canbillingpackage,
                    //billing report Tab 4
                    "Canitemwisecollectionsummaryopreport":Canitemwisecollectionsummaryopreport,
                    "Canitemwisecollectionsummaryipreport":Canitemwisecollectionsummaryipreport,
                    "Canitemwisecollectionsummaryopandipreport":Canitemwisecollectionsummaryopandipreport,
                    "Canrevenuesummarybyserviceitem":Canrevenuesummarybyserviceitem,
                    "Canreferraldoctorrevenuedetailsreport":Canreferraldoctorrevenuedetailsreport,
                    //billing report tab 5
                    "Canotschedulereport":Canotschedulereport,
                    "Cansurgeryentry":Cansurgeryentry,
                    "Cansurgerysummarybyprocedure":Cansurgerysummarybyprocedure,
                    //pharmacy dashboard tab 1
                    "Canpharmacycollectionreport":Canpharmacycollectionreport,
                    "Canpharmacysalesreport":Canpharmacysalesreport,
                    "Canpharmacycollectionallcashier":Canpharmacycollectionallcashier,
                    "Canpharmacybilldetailreport":Canpharmacybilldetailreport,
                    "Canpharmacyreturnreportforotc":Canpharmacyreturnreportforotc,
                    "Canpharmacyduereport":Canpharmacyduereport,
                    "Canpharmacyduecollectreport":Canpharmacyduecollectreport,
                    "Canpharmacydiscountreport":Canpharmacydiscountreport,
                    "Canpharmacycollectionsummaryreport":Canpharmacycollectionsummaryreport,
                    "Canippharmacyissuevoucherreport":Canippharmacyissuevoucherreport,
                    "Canippharmacyreturnvoucherreport":Canippharmacyreturnvoucherreport,
                    "Canpharmacyschedulereport":Canpharmacyschedulereport,
                    "Canpharmacydmschedulereport":Canpharmacydmschedulereport,
                    "Canpendingprescriptionreport":Canpendingprescriptionreport,
                    "Canpharmacyschedulexreport":Canpharmacyschedulexreport,
                    "Canpharmacycollectionsummarycashier":Canpharmacycollectionsummarycashier,
                    "Canpharmacycardcollectionreport":Canpharmacycardcollectionreport,
                    "Canstaffcreditbillreport":Canstaffcreditbillreport,
                    "Canstaffpendingpaymentreport":Canstaffpendingpaymentreport,
                    "Canstaffcreditreturnreport":Canstaffcreditreturnreport,
                    "Canstaffcreditsummaryreport":Canstaffcreditsummaryreport,
                    "Candailystockmovementreport":Candailystockmovementreport,
                    "Candailysalessummarybyitem":Candailysalessummarybyitem,
                    "Canpatientmedicineindentreport":Canpatientmedicineindentreport,
                    "Canpatientindentpendingreport":Canpatientindentpendingreport,
                    "Canpatientipdispensedreport":Canpatientipdispensedreport,
                    "Canpatientipdispensedetailsreport":Canpatientipdispensedetailsreport,
                    //pharmacy dashboard tab 2
                    "Canpurchasesalesgstreport":Canpurchasesalesgstreport,
                    "Canpurchasereturngstreport":Canpurchasereturngstreport,
                    "Cansalesgstreport":Cansalesgstreport,
                    "Canreturngstreport":Canreturngstreport,
                    "Canconsolidatesalesgstreport":Canconsolidatesalesgstreport,
                    "Canconsolidatepurchasegstreport":Canconsolidatepurchasegstreport,
                    "Canconsolidateinputgstsummary":Canconsolidateinputgstsummary,
                    "Canconsolidateoutputgstsummary":Canconsolidateoutputgstsummary,
                    "Canstocksummaryproductgstreport":Canstocksummaryproductgstreport,
                    "Canconsolidategstreportfordeepam":Canconsolidategstreportfordeepam,
                    //pharmacy dashboard tab 3
                    "Canitemmasterreport":Canitemmasterreport,
                    "Canmasterprice":Canmasterprice,
                    "Canrackdetailsbystorereport":Canrackdetailsbystorereport,
                    "Canitemrolsetupreport":Canitemrolsetupreport,
                    //tab4
                    "Canstockstatusreport":Canstockstatusreport,
                    "Canstockindentreport":Canstockindentreport,
                    "Canstockmovementreport":Canstockmovementreport,
                    "Canstockstatusproductsummaryreport":Canstockstatusproductsummaryreport,
                    "Canmedicineexpiryreport":Canmedicineexpiryreport,
                    "Canmedicineexpiredreport":Canmedicineexpiredreport,
                    "Canstocknonmovementreport":Canstocknonmovementreport,
                    "Canstockissuevocherreport":Canstockissuevocherreport,
                    "Canstockstatusbatchreport":Canstockstatusbatchreport,
                    "Canitemwantedlist":Canitemwantedlist,
                    "Canopticalstockstatusreport":Canopticalstockstatusreport,
                    //store dashboard 
                    //tab1
                    "Canstockstatusreportstore":Canstockstatusreportstore,
                    "Canstockadjustmentreport":Canstockadjustmentreport,
                    "Canstockindentreportstore":Canstockindentreportstore,
                    "Canstockmovementreportstore":Canstockmovementreportstore,
                    "Canstockstatusproductsummaryreportstore":Canstockstatusproductsummaryreportstore,
                    "Canmedicineexpiryreportstore":Canmedicineexpiryreportstore,
                    "Canmedicineexpiredreportstore":Canmedicineexpiredreportstore,
                    "Canstocknonmovementreportstore":Canstocknonmovementreportstore,
                    "Canstockissuevocherreportstore":Canstockissuevocherreportstore,
                    "Canstockstatusbatchreportstore":Canstockstatusbatchreportstore,
                    "Canopeningstockentryreportstore":Canopeningstockentryreportstore,
                    //tab2
                    "Canpurchasesalesgstreportstore":Canpurchasesalesgstreportstore,
                    "Canpurchasereturngstreportstore":Canpurchasereturngstreportstore,
                    "Cansalesgstreportstore":Cansalesgstreportstore,
                    "Canreturngstreportstore":Canreturngstreportstore,
                    "Canconsolidatesalesgstreportstore":Canconsolidatesalesgstreportstore,
                    "Canconsolidatepurchasegstreportstore":Canconsolidatepurchasegstreportstore,
                    "Canconsolidateinputgstsummarystore":Canconsolidateinputgstsummarystore,
                    "Canconsolidateoutputgstsummarystore":Canconsolidateoutputgstsummarystore,
                    "Canstocksummaryproductgstreportstore":Canstocksummaryproductgstreportstore,
                    //tab3
                    "Canpurchaseorderreport":Canpurchaseorderreport,
                    "Canpurchaseorderdetailreport":Canpurchaseorderdetailreport,
                    "Canpendingporeport":Canpendingporeport,
                    "Canstockissuevocherreportstores":Canstockissuevocherreportstores,
                    "Cangrnreport":Cangrnreport,
                    "Cangrnreportbyitem":Cangrnreportbyitem,
                    "Canpurchasereturnreport":Canpurchasereturnreport,
                    "Canpurchasevendorreport":Canpurchasevendorreport,
                    "Canpurchasevendorpendingreport":Canpurchasevendorpendingreport,
                    "Canvendordetailreport":Canvendordetailreport,
                    "Canvendoroutstandingreport":Canvendoroutstandingreport,
                    //tab4
                    "Caninvoicesummarybysupplier":Caninvoicesummarybysupplier,
                    "Canpendingpaymentsummarybysupplier":Canpendingpaymentsummarybysupplier,
                    "Cansuppliermasterreport":Cansuppliermasterreport,
                    "Canitemmasterreportstore":Canitemmasterreportstore,
                    "Canmasterpricestore":Canmasterpricestore,
                    "Canstoremasterreport":Canstoremasterreport,
                    "Canusermasterreport":Canusermasterreport,
                    "Canrackdetailsbystorereportstore":Canrackdetailsbystorereportstore,
                    "Canitemreorderlistreport":Canitemreorderlistreport,
                    "Cangenericmasterreport":Cangenericmasterreport,
                    "Canmanufacturermasterreport":Canmanufacturermasterreport,
                    "Canproducttypereport":Canproducttypereport,
                    //tab5
                    "Canstockstatusgeneralreport":Canstockstatusgeneralreport,
                    "Canstockadjustmentgeneralreport":Canstockadjustmentgeneralreport,
                    "Canstockindentgeneralreport":Canstockindentgeneralreport,
                    "Canstockmovementgeneralreport":Canstockmovementgeneralreport,
                    "Canstockstatusproductsummarygeneralreport":Canstockstatusproductsummarygeneralreport,
                    "Canstockissuevochergeneralreport":Canstockissuevochergeneralreport,
                    "Canstockstatusbatchgeneralreport":Canstockstatusbatchgeneralreport,
                    "Canopeningstockentrygeneralreport":Canopeningstockentrygeneralreport,
                    //Front Office Dashboard Report
                    //tab1
                    "Canfrontofficeipadmissionreport": Canfrontofficeipadmissionreport,
                    "Canfrontofficeipdischargereport": Canfrontofficeipdischargereport,
                    "Canipadmissionsummarybydoctor": Canipadmissionsummarybydoctor,
                    "Canipoccupancyreport": Canipoccupancyreport,
                    "Canipoccupancybyward": Canipoccupancybyward,
                    "Canipadmissioninsurancereport": Canipadmissioninsurancereport,
                    "Canipadmissionsummarybyinsurance": Canipadmissionsummarybyinsurance,
                    "Canipreferraldoctorreport": Canipreferraldoctorreport,
                    "Candiagnosissummaryforippatient": Candiagnosissummaryforippatient,
                    "Canpatientlistbydiagnosis": Canpatientlistbydiagnosis,
                    "Cancovidstatisticsreport": Cancovidstatisticsreport,
                    "Canipstatisticsreport": Canipstatisticsreport,
                    "Candailywiseipstatisticsreport": Candailywiseipstatisticsreport,
                    "Canbedtransferreport": Canbedtransferreport,
                    //tab2
                    "Canpatientlist": Canpatientlist,
                    "Canoutpatientreport": Canoutpatientreport,
                    "Canoutpatientsummaryreport": Canoutpatientsummaryreport,
                    "Caninactivepatientreport": Caninactivepatientreport,
                    "Candeseasedpatientreport": Candeseasedpatientreport,
                    "Canopreferraldoctorreport": Canopreferraldoctorreport,
                    "Canoutpatientsummarybydoctor": Canoutpatientsummarybydoctor,
                    "Canoutpatientsummarybyinsurance": Canoutpatientsummarybyinsurance,
                    "Canappointmentschedulereport": Canappointmentschedulereport,
                    "Canappointmentcancelledreport": Canappointmentcancelledreport,
                    "Canappointmentreschedulereport": Canappointmentreschedulereport,
                    "Canappointmentpatientfromappreport": Canappointmentpatientfromappreport,
                    "Canvideoconsultationpatientlist": Canvideoconsultationpatientlist,
                    "Candaycarereport": Candaycarereport,
                    "Canmlcreport": Canmlcreport,
                    "Canemergencypatientreport": Canemergencypatientreport,
                    "Candaycaretoadmissionpatient": Candaycaretoadmissionpatient,
                    //tab3
                    "Canmrdotschedulereport": Canmrdotschedulereport,
                    "Canmrdsurgeryentryreports": Canmrdsurgeryentryreports,
                    //tab4
                    "Candoctorlistreport": Candoctorlistreport,
                    "Candepartmentlistreport": Candepartmentlistreport,
                    "Canwardandbedlist": Canwardandbedlist,
                    "Canavailablebeds": Canavailablebeds,
                    "Caninsurancelistreport": Caninsurancelistreport,
                    "Canopserviceitemreport": Canopserviceitemreport,
                    "Canipserviceitemreport": Canipserviceitemreport,
                    "Canreferraldoctorlistreport": Canreferraldoctorlistreport,
                    //inventorydashboard
                    "CanProductType": CanProductType,
                    "CanUnitofMeasurements": CanUnitofMeasurements,
                    "CanTaxMasters": CanTaxMasters,
                    "CanStores": CanStores,
                    "CanInventoryItems": CanInventoryItems,
                    "CanSuplliers": CanSuplliers,
                    "CanItemSupplierPrices": CanItemSupplierPrices,
                    "CanRackSelfTray": CanRackSelfTray,
                    "CanReorderSetup": CanReorderSetup,
                    //medicalmasterdashboard
                    "CanAllergies": CanAllergies,
                    "CanComplaints": CanComplaints,
                    "CanDiagnosis": CanDiagnosis,
                    "CanProcedures": CanProcedures,
                    "CanVitalParameters": CanVitalParameters,
                    "CanDrugFrequencies": CanDrugFrequencies,
                    "CanTemplates": CanTemplates,
                    "CanTemplate_Screens": CanTemplate_Screens,
                    "CanTemplate_Tabs": CanTemplate_Tabs,
                    "CanTemplate_Parameters": CanTemplate_Parameters,
                    "CanDischarge_Summary_Templates": CanDischarge_Summary_Templates,
                    "CanFavorites": CanFavorites,
                    //common master
                    "CanGeneral_Remarks": CanGeneral_Remarks,
                    "CanCities": CanCities,
                    "CanStates": CanStates,
                    "CanPostCodes": CanPostCodes,
                    "CanManageReferrals": CanManageReferrals,
                    "CanOccupations": CanOccupations,
                    //opbilling buttons
                    "CanOP_Cancel": CanOP_Cancel,
                    "CanOP_PartialCancel": CanOP_PartialCancel,
                    "CanOP_PreviousBills": CanOP_PreviousBills,
                    "CanOP_OutStandingBills": CanOP_OutStandingBills,
                    //Registration buttons
                    "CanReg_Billing": CanReg_Billing,
                    "CanReg_CheckOut": CanReg_CheckOut,
                    "CanReg_Deactivate": CanReg_Deactivate,
                    "CanReg_Attachment": CanReg_Attachment,
                    "CanReg_BarCode": CanReg_BarCode,
                    //ipbilling buttons
                    "CanIPSUM_PRINT": CanIPSUM_PRINT,
                    "CanIPSUM_INSURANCE": CanIPSUM_INSURANCE,
                    "CanIPSUM_PHARMACY": CanIPSUM_PHARMACY,
                    "CanIPSUM_DISCHARGE": CanIPSUM_DISCHARGE,
                    "CanIPSUM_FINALIZE": CanIPSUM_FINALIZE,
                    "CanIPSUM_BILL_LOCK": CanIPSUM_BILL_LOCK,
                    "CanCredit_Approver": CanCredit_Approver,

                    "CanIPDEL_PREVIOUS_ORDER": CanIPDEL_PREVIOUS_ORDER,
                    "CanIPDEL_ADDNEW": CanIPDEL_ADDNEW,
                    "CanIPRECEIPT_ADVANCE": CanIPRECEIPT_ADVANCE,
                    // "CanIPRECEIPT_REFUND": CanIPRECEIPT_REFUND,
                    "CanIPRECEIPT_CANCEL": CanIPRECEIPT_CANCEL,
                    "CanIPREF_REFUND": CanIPREF_REFUND,
                    "CanIPREF_PARTIAL_REFUND": CanIPREF_PARTIAL_REFUND,
                    "CanIP_UPDATE": CanIP_UPDATE,
                    "CanBillcorrection_Update": CanBillcorrection_Update,
                    "CanPharmacyBillcorrection_Update": CanPharmacyBillcorrection_Update,

                    "CanAllOutPatients": CanAllOutPatients,
                    "CanMyOutPatients": CanMyOutPatients,
                    "CanPreviousOutPatients": CanPreviousOutPatients,
                    "CanAllInPatients": CanAllInPatients,
                    "CanMyInPatients": CanMyInPatients,
                    "CanPreviousInPatients": CanPreviousInPatients,
                    /*ipbilling tabs*/
                    "CanSummaryBill": CanSummaryBill,
                    "CanIPBillDetails": CanIPBillDetails,
                    "CanAdvanceReceipts": CanAdvanceReceipts,
                    "CanRefund": CanRefund,
                    "CanCollectionModification": CanCollectionModification,
                    "CanNonPharmacyCollectionModification": CanNonPharmacyCollectionModification,
                    /*wardmanagementtab*/
                    "CanInPatient": CanInPatient,
                    "CanFloorView": CanFloorView,
                    /*manageserviceitem*/
                    "CanDetails": CanDetails,
                    "CanPerformingDoctors": CanPerformingDoctors,
                    "CanRate": CanRate,
                    "CanHealthCheckup": CanHealthCheckup,
                    "CanHospital": CanHospital,
                    /*surgerydashboard*/
                    "CanSurgerySchedule": CanSurgerySchedule,
                    "CanSurgeryConfirmation": CanSurgeryConfirmation,
                    "CanOT_Procedure_Entries": CanOT_Procedure_Entries,
                    "CanStockIndent": CanStockIndent,
                    "CanStockReceive": CanStockReceive,
                    "CanInPatients": CanInPatients,
                    "CanReport": CanReport,
                    /*surgerydashboard*/
                    /*doctordashboard*/
                    "CanOP_Patients": CanOP_Patients,
                    "CanIP_Patients": CanIP_Patients,
                    "CanAppointments": CanAppointments,
                    "CanSurgerySchedule": CanSurgerySchedule,
                    "CanReports": CanReports,
                    "CanPurchaseOrder_Amend": CanPurchaseOrder_Amend,
                    /*doctordashboard*/

                    /*admission*/
                    "CanAdmCancel": CanAdmCancel,
                    /*admission*/

                    /*Emr controls*/
                    "CanPatientRecords": CanPatientRecords,
                    "CanMedicalHistory": CanMedicalHistory,
                    "CanSymptoms": CanSymptoms,
                    "CanDiagnosis": CanDiagnosis,
                    "CanVitals": CanVitals,
                    "CanClinicalDocuments": CanClinicalDocuments,
                    "CanClinicalOrders": CanClinicalOrders,
                    "CanProcedureOrders": CanProcedureOrders,
                    "CanNotes": CanNotes,
                    "CaneMAR": CaneMAR,
                    "CanLabResults": CanLabResults,
                    "CanRadiologyResults": CanRadiologyResults,
                    "CanDentalChart": CanDentalChart,
                    "CanNursingCharts": CanNursingCharts,
                    "CanNursingNotes": CanNursingNotes,
                    "CanDoctorNotes": CanDoctorNotes,
                    "CanAdmissionRequest":CanAdmissionRequest,
                    "CanPhysiotheraphyTreatment": CanPhysiotheraphyTreatment,
                    "CanBillDetails": CanBillDetails,
                    "CanSummary": CanSummary,
                    "CanPrescriptions": CanPrescriptions,
                    "CanBillService": CanBillService,
                    "CanDischargeSummary": CanDischargeSummary,
                    "CanDischargeNotes": CanDischargeNotes,
                    "CanEMRCharts": CanEMRCharts,
                    "CanDoctorTransfer":CanDoctorTransfer,
                    "CanPositionBPChart": CanPositionBPChart,
                    "CanDiabetes": CanDiabetes,
                    "CanCD4CD8Chart": CanCD4CD8Chart,
                    "CanMedicineIndent": CanMedicineIndent,
                    "CanMedicinReturn": CanMedicinReturn,
                    "CanApprove": CanApprove,
                    "CanAuthorize": CanAuthorize,
                    "CanRedo": CanRedo,
                    "CanPurchaseOrder_Save": CanPurchaseOrder_Save,
                    "CanPurchaseOrder_Authorize": CanPurchaseOrder_Authorize,
                    "CanPurchaseOrder_Approve": CanPurchaseOrder_Approve,
                    "CanSave": CanSave,
                    "CanPrint": CanPrint,
                    "CanPrintWithoutHeader": CanPrintWithoutHeader,
                    "Cansendforapproval": Cansendforapproval,
                    "Cansendforapproval": Cansendforapproval,
                    "CanCredit_Approver": CanCredit_Approver,
                    "CanAddToCredit_Button": CanAddToCredit_Button,
                    "CanAddnewbutton": CanAddnewbutton,
                    "CanSickLeave": CanSickLeave,
                    "Canprescriptionpad": Canprescriptionpad,
                    "CanClinicalImage": CanClinicalImage,
                    "CanIVFHistory": CanIVFHistory,
                    "CanIVFConsultationNotes": CanIVFConsultationNotes,
                    "CanIPCaseFileSummary": CanIPCaseFileSummary,
                    "Candietorders": Candietorders,
                    "CanNotifiableDiseases": CanNotifiableDiseases,
                    "CanReferrals": CanReferrals,
                    "CanTreatmentPlan": CanTreatmentPlan,
                    "CanReversebutton": CanReversebutton,
                    "CanPrescriptionP1": CanPrescriptionP1,
                    "CanDeletedBillButton":CanDeletedBillButton,
                    "CanDeletereceiptsButton":CanDeletereceiptsButton,
                    "CanABGMaster": CanABGMaster

                    /*Emr controls*/

                }
                function CanDeletedBillButton() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }
                function CanDeletereceiptsButton() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }
                function CanABGMaster() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }
                function CanReversebutton() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }
                /*doctordashboard*/
                function CanOP_Patients() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }
                function CanAddnewbutton() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }
                function CanSickLeave() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }
                function Canprescriptionpad() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }
                function CanClinicalImage() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }
                function CanSurgerySchedule() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }

                function CanIP_Patients() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }

                function CanAppointments() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }

                function CanReports() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }
                /*doctordashboard*/
                /*surgerydashboard*/
                function CanSurgeryConfirmation() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }

                function CanSurgerySchedule() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }

                function CanOT_Procedure_Entries() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }

                function CanStockIndent() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }

                function CanStockReceive() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }

                function CanInPatients() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }

                function CanReport() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }
                /*surgerydashboard*/
                function CanPerformingDoctors() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }

                function CanDetails() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }

                function CanRate() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }

                function CanHealthCheckup() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }

                function CanHospital() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }

                function CanInPatient() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }

                function CanFloorView() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }

                function CanSummaryBill() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }

                function CanIPBillDetails() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }

                function CanAdvanceReceipts() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }

                function CanRefund() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }

                function CanCollectionModification() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }

                function CanNonPharmacyCollectionModification() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }

                function CanPreviousOutPatients() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }

                function CanMyOutPatients() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }

                function CanAllOutPatients() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }
                function CanPreviousInPatients() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }

                function CanMyInPatients() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }

                function CanAllInPatients() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }

                function CanIP_UPDATE() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }

                function CanBillcorrection_Update() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }

                function CanPharmacyBillcorrection_Update() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }

                function CanIPREF_PARTIAL_REFUND() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }

                function CanIPREF_REFUND() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }

                function CanIPRECEIPT_ADVANCE() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }
                // function CanIPRECEIPT_REFUND() {
                //     ngSessionHelper.getClinicalRoleId();
                //     ngSessionHelper.getUserTypeId();
                //     ngSessionHelper.getUserGroupId();
                //     return false;
                // }
                function CanIPRECEIPT_CANCEL() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }
                function CanIPDEL_PREVIOUS_ORDER() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }

                function CanIPDEL_ADDNEW() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }

                function CanIPSUM_PRINT() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }

                function CanIPSUM_INSURANCE() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }

                function CanIPSUM_PHARMACY() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }

                function CanIPSUM_DISCHARGE() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }

                function CanIPSUM_FINALIZE() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }

                function CanIPSUM_BILL_LOCK() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }

                function CanIndent_Authorize() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }
                function CanIndent_Approve() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }
                function CanIndent_Save() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }
                function CanGRN_Authorize_Button() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }
                function CanGRN_Save_Button() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }
                function CanGRN_Approve_Button() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }
                function CanAmend() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }

                function CanVendorPayment() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }

                function CanReg_Billing() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }

                function CanReg_CheckOut() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }

                function CanReg_Deactivate() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }

                function CanReg_Attachment() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }

                function CanReg_BarCode() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }

                function CanOP_Cancel() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }

                function CanOP_PartialCancel() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }

                function CanOP_PreviousBills() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }

                function CanOP_OutStandingBills() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }

                function CanGeneral_Remarks() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }

                function CanCities() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }

                function CanStates() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }

                function CanPostCodes() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }

                function CanManageReferrals() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }

                function CanOccupations() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }

                function CanAllergies() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }

                function CanComplaints() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }

                function CanDiagnosis() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }

                function CanProcedures() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }

                function CanVitalParameters() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }

                function CanDrugFrequencies() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }

                function CanTemplates() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }

                function CanTemplate_Screens() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }

                function CanTemplate_Tabs() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }

                function CanTemplate_Parameters() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }

                function CanDischarge_Summary_Templates() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }

                function CanFavorites() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }

                function CanProductType() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }

                function CanUnitofMeasurements() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }

                function CanTaxMasters() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }

                function CanStores() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }

                function CanInventoryItems() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }

                function CanSuplliers() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }

                function CanItemSupplierPrices() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }

                function CanRackSelfTray() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }

                function CanReorderSetup() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }

                function CanQuickRegistration() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }

                function CanBilling_OPPatients() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }

                function CanBilling_DirectBilling() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }

                function CanBilling_LabBilling() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }

                function Canbilling_CurrentIpBilling() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }

                function CanDischarged_IP_Billing() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }

                function CanBilling_CurrentIPPatients() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }

                function CanBillingReports() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }

                function CanBilling_Admissions() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }

                function CanWardManagement() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }

                function CanNursingBedTransfer() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }

                function CanNursingCurrentIpPatients() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }

                function CanNursingCurrentOpPatients() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }

                function CanNursingAppointments() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }

                function CanNursingWardManagement() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }

                function CanNursing_StockIndents() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }

                function CanNursing_StockReceives() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }

                function CanNotifications() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }

                function CanMedicineAdministration() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }

                function CanPatientMedicineIndents() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }
                function CanNursingMytask() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }
                function CanNursingBedManagement() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }
                function CanNursingBedReceive() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }

                function CanNursingReports() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }

                function CanItemDetails() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }

                function CanUomConversion() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }

                function CanStoreAssociation() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }

                function CanHospitalMapping() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }

                function CanSupplierMapping() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }

                function CanContract() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }

                function CanAppointments() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }

                function CanRegistration() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }

                function CanOPbilling() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }

                function CanDirectBilling() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }

                function CanLabBilling() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }

                function CanAdmissions() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }

                function CanBedTransfer() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }

                function CanCurrentIpPatients() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }

                function CanFrontOfficeReports() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }

                function CanOrderAcceptances() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }

                function CanSpecimenCollection() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }

                function CanResultEntries() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }

                function CanResultApprovals() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }

                function CanResultReleases() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }

                function CanManageTests() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }

                function CanManageParameter() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }

                function CanReports() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }

                function CanResultTemplates() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }
                //radiology dashboard
                function CanRis_OrderAcceptances() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }

                function CanRis_RateEnquiry() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }

                function CanRis_ResultEntries() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }

                function CanRis_ResultApprovals() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }

                function CanRis_ResultReleases() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }

                function CanRis_ManageTests() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }

                function CanRis_ManageParameter() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }

                function CanRis_Reports() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }

                function CanRis_ResultTemplates() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }

                //pharmacy dashboard

                function CanMedicineSales() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }

                function CanMedicineCreditBills() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }


                function CanMedicineCreditReturns() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }

                function CanMedicineReturns() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }

                function CanInjuctionBilling() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }

                function CanInjuctionWorklist() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }

                function CanStockIndent() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }

                function CanStockReceives() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }

                function CanStockStatus() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }

                function CanStockMovement() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }

                function CanPharmacyReports() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }

                function CanDirectPharmacySales() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }

                function CanDirectMedicineReturns() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }

                function CanStaffCreditPayment() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }
                function CanStaffCredits() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }
                function CanStaffCreditReturns() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }
                
                //store dashboard

                function CanPurchaseOrders() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }

                function CanInvoiceEntry() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }

                function CanPurchase_Order_Pending_Approvals() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }

                function CanInvoice_Returns() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }

                function CanStock_Indents() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }

                function CanIndent_Work_Lists() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }

                function CanStock_Status() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }

                function CanStock_Movement() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }

                function CanStock_Receives() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }

                function CanCustomer_Sales() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }

                function CanCustomer_Returns() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }

                function CanStoreReports() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }

                function CanPSDmPrint() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }

                function CanPSDiscount() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }
                /* admission */
                function CanAdmCancel() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }
                /* admission */


                /* Emr Control */
                function CanPatientRecords() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }
                function CanMedicalHistory() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }
                function CanSymptoms() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }
                function CanDiagnosis() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }
                function CanVitals() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }
                function CanClinicalDocuments() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }
                function CanClinicalOrders() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }
                function CanProcedureOrders() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }
                function CanNotes() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }
                function CaneMAR() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }
                function CanLabResults() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }
                function CanRadiologyResults() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }
                function CanDentalChart() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }
                function CanNursingCharts() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }
                function CanNursingNotes() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }
                function CanDoctorNotes() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }
                function CanAdmissionRequest() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }
                function CanPhysiotheraphyTreatment() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }
                function CanBillDetails() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }
                function CanSummary() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }
                function CanPrescriptions() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }
                function CanBillService() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }
                function CanDischargeSummary() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }
                function CanDischargeNotes() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }
                function CanEMRCharts() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }
                function CanDoctorTransfer() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }
                function CanPositionBPChart() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }
                function CanDiabetes() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }
                function CanCD4CD8Chart() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }
                function CanMedicineIndent() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }
                function CanMedicinReturn() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }
                function CanApprove() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }
                function CanAuthorize() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }
                function CanPurchaseOrder_Save() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }
                function CanDisount() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }
                function CanDelete() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }
                //BillingReports
                function CanOpbiillsReports() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }
                function Cancollectiondetailbycashierreport() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }
                function Cancollectiondetailbyallcashierreport() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }
                function Canopipcollectionsummarybycashier() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }
                function Canopcollectionsummarybycashier() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }
                function Canoverallcollectionsummary() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }
                function Canoverallcollectioncashier() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }
                function Caninsurancecreditsummary() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }
                function Caninsuranceoutstandingsummary() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }
                function Canoutstandingreports() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }
                function Canopduecollectreport() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }
                function Candiscount() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }
                function Cancancelreport() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }
                function Canrefundreport() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }
                function Candirectbillreport() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }
                function Cancollectionsummaryopip() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }
                function Cangeneralexpensereport() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }
                function Canadvancefunddetailsreport() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }
                function Canpatientfundadjustmentreport() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }
                //Billing report tab 1 end

                //billilng report tab 2
               function Canipbillreport() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }

                function Canipcollectiondetailbycashierreport() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }

                function Canipcollectionsummarybycashier() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }
                function Caniprefundreport() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }
                function Canipduecollectreport() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }
                function Cancurrentoccupancyreport() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }
                function Canipcancelreport() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }
                function Canipdiscountreport() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }
                function Canipinsurancereport() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }
                function Canipdue() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }
                function Canipadmissionreport() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }
                function Canipdischargereport() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }
                function Canipoccupancyreportwithadvance() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }
            //billing report tab 2 end  
            //tAB 3
                function Canbillingservice() {
                ngSessionHelper.getClinicalRoleId();
                ngSessionHelper.getUserTypeId();
                ngSessionHelper.getUserGroupId();
                return false;
                }

                function CanbillingGroup() {
                ngSessionHelper.getClinicalRoleId();
                ngSessionHelper.getUserTypeId();
                ngSessionHelper.getUserGroupId();
                return false;
                }

                function Canbillingpackage() {
                ngSessionHelper.getClinicalRoleId();
                ngSessionHelper.getUserTypeId();
                ngSessionHelper.getUserGroupId();
                return false;
                }
                
              //tab 4

                function Canitemwisecollectionsummaryopreport() {
                ngSessionHelper.getClinicalRoleId();
                ngSessionHelper.getUserTypeId();
                ngSessionHelper.getUserGroupId();
                return false;
                }

               function Canitemwisecollectionsummaryipreport() {
               ngSessionHelper.getClinicalRoleId();
               ngSessionHelper.getUserTypeId();
               ngSessionHelper.getUserGroupId();
               return false;
               }

               function Canitemwisecollectionsummaryopandipreport() {
               ngSessionHelper.getClinicalRoleId();
               ngSessionHelper.getUserTypeId();
               ngSessionHelper.getUserGroupId();
               return false;
               }

              function Canrevenuesummarybyserviceitem() {
              ngSessionHelper.getClinicalRoleId();
              ngSessionHelper.getUserTypeId();
              ngSessionHelper.getUserGroupId();
              return false;
              }

             function Canreferraldoctorrevenuedetailsreport() {
             ngSessionHelper.getClinicalRoleId();
             ngSessionHelper.getUserTypeId();
             ngSessionHelper.getUserGroupId();
             return false;
             }
             //tab 5
             function Canotschedulereport() {
             ngSessionHelper.getClinicalRoleId();
             ngSessionHelper.getUserTypeId();
             ngSessionHelper.getUserGroupId();
             return false;
             }
             function Cansurgeryentry() {
             ngSessionHelper.getClinicalRoleId();
             ngSessionHelper.getUserTypeId();
             ngSessionHelper.getUserGroupId();
             return false;
             }
            function Cansurgerysummarybyprocedure() {
            ngSessionHelper.getClinicalRoleId();
            ngSessionHelper.getUserTypeId();
            ngSessionHelper.getUserGroupId();
            return false;
            }

            //pharmacy dashboard tab 1

            function Canpharmacycollectionreport() {
                ngSessionHelper.getClinicalRoleId();
                ngSessionHelper.getUserTypeId();
                ngSessionHelper.getUserGroupId();
                return false;
            }
            
            function Canpharmacysalesreport() {
                ngSessionHelper.getClinicalRoleId();
                ngSessionHelper.getUserTypeId();
                ngSessionHelper.getUserGroupId();
                return false;
            }
            
            function Canpharmacycollectionallcashier() {
                ngSessionHelper.getClinicalRoleId();
                ngSessionHelper.getUserTypeId();
                ngSessionHelper.getUserGroupId();
                return false;
            }
            
            function Canpharmacybilldetailreport() {
                ngSessionHelper.getClinicalRoleId();
                ngSessionHelper.getUserTypeId();
                ngSessionHelper.getUserGroupId();
                return false;
            }
            
            function Canpharmacyreturnreportforotc() {
                ngSessionHelper.getClinicalRoleId();
                ngSessionHelper.getUserTypeId();
                ngSessionHelper.getUserGroupId();
                return false;
            }
            
            function Canpharmacyduereport() {
                ngSessionHelper.getClinicalRoleId();
                ngSessionHelper.getUserTypeId();
                ngSessionHelper.getUserGroupId();
                return false;
            }
            
            function Canpharmacyduecollectreport() {
                ngSessionHelper.getClinicalRoleId();
                ngSessionHelper.getUserTypeId();
                ngSessionHelper.getUserGroupId();
                return false;
            }
            
            function Canpharmacydiscountreport() {
                ngSessionHelper.getClinicalRoleId();
                ngSessionHelper.getUserTypeId();
                ngSessionHelper.getUserGroupId();
                return false;
            }
            
            function Canpharmacycollectionsummaryreport() {
                ngSessionHelper.getClinicalRoleId();
                ngSessionHelper.getUserTypeId();
                ngSessionHelper.getUserGroupId();
                return false;
            }
            
            function Canippharmacyissuevoucherreport() {
                ngSessionHelper.getClinicalRoleId();
                ngSessionHelper.getUserTypeId();
                ngSessionHelper.getUserGroupId();
                return false;
            }
            
            function Canippharmacyreturnvoucherreport() {
                ngSessionHelper.getClinicalRoleId();
                ngSessionHelper.getUserTypeId();
                ngSessionHelper.getUserGroupId();
                return false;
            }
            
            function Canpharmacyschedulereport() {
                ngSessionHelper.getClinicalRoleId();
                ngSessionHelper.getUserTypeId();
                ngSessionHelper.getUserGroupId();
                return false;
            }
            
            function Canpharmacydmschedulereport() {
                ngSessionHelper.getClinicalRoleId();
                ngSessionHelper.getUserTypeId();
                ngSessionHelper.getUserGroupId();
                return false;
            }
            
            function Canpendingprescriptionreport() {
                ngSessionHelper.getClinicalRoleId();
                ngSessionHelper.getUserTypeId();
                ngSessionHelper.getUserGroupId();
                return false;
            }
            
            function Canpharmacyschedulexreport() {
                ngSessionHelper.getClinicalRoleId();
                ngSessionHelper.getUserTypeId();
                ngSessionHelper.getUserGroupId();
                return false;
            }
            
            function Canpharmacycollectionsummarycashier() {
                ngSessionHelper.getClinicalRoleId();
                ngSessionHelper.getUserTypeId();
                ngSessionHelper.getUserGroupId();
                return false;
            }
            
            function Canpharmacycardcollectionreport() {
                ngSessionHelper.getClinicalRoleId();
                ngSessionHelper.getUserTypeId();
                ngSessionHelper.getUserGroupId();
                return false;
            }
            
            function Canstaffcreditbillreport() {
                ngSessionHelper.getClinicalRoleId();
                ngSessionHelper.getUserTypeId();
                ngSessionHelper.getUserGroupId();
                return false;
            }
            
            function Canstaffpendingpaymentreport() {
                ngSessionHelper.getClinicalRoleId();
                ngSessionHelper.getUserTypeId();
                ngSessionHelper.getUserGroupId();
                return false;
            }
            
            function Canstaffcreditreturnreport() {
                ngSessionHelper.getClinicalRoleId();
                ngSessionHelper.getUserTypeId();
                ngSessionHelper.getUserGroupId();
                return false;
            }
            
            function Canstaffcreditsummaryreport() {
                ngSessionHelper.getClinicalRoleId();
                ngSessionHelper.getUserTypeId();
                ngSessionHelper.getUserGroupId();
                return false;
            }
            
            function Candailystockmovementreport() {
                ngSessionHelper.getClinicalRoleId();
                ngSessionHelper.getUserTypeId();
                ngSessionHelper.getUserGroupId();
                return false;
            }
            
            function Candailysalessummarybyitem() {
                ngSessionHelper.getClinicalRoleId();
                ngSessionHelper.getUserTypeId();
                ngSessionHelper.getUserGroupId();
                return false;
            }
            
            function Canpatientmedicineindentreport() {
                ngSessionHelper.getClinicalRoleId();
                ngSessionHelper.getUserTypeId();
                ngSessionHelper.getUserGroupId();
                return false;
            }
            
            function Canpatientindentpendingreport() {
                ngSessionHelper.getClinicalRoleId();
                ngSessionHelper.getUserTypeId();
                ngSessionHelper.getUserGroupId();
                return false;
            }
            
            function Canpatientipdispensedreport() {
                ngSessionHelper.getClinicalRoleId();
                ngSessionHelper.getUserTypeId();
                ngSessionHelper.getUserGroupId();
                return false;
            }
            
            function Canpatientipdispensedetailsreport() {
                ngSessionHelper.getClinicalRoleId();
                ngSessionHelper.getUserTypeId();
                ngSessionHelper.getUserGroupId();
                return false;
            }

            //pd tab 2
            function Canpurchasesalesgstreport() {
                ngSessionHelper.getClinicalRoleId();
                ngSessionHelper.getUserTypeId();
                ngSessionHelper.getUserGroupId();
                return false;
            }
            function Canpurchasereturngstreport() {
                ngSessionHelper.getClinicalRoleId();
                ngSessionHelper.getUserTypeId();
                ngSessionHelper.getUserGroupId();
                return false;
            }

            function Cansalesgstreport() {
                ngSessionHelper.getClinicalRoleId();
                ngSessionHelper.getUserTypeId();
                ngSessionHelper.getUserGroupId();
                return false;
            }

            function Canreturngstreport() {
                ngSessionHelper.getClinicalRoleId();
                ngSessionHelper.getUserTypeId();
                ngSessionHelper.getUserGroupId();
                return false;
            }

            function Canconsolidatesalesgstreport() {
                ngSessionHelper.getClinicalRoleId();
                ngSessionHelper.getUserTypeId();
                ngSessionHelper.getUserGroupId();
                return false;
            }

            function Canconsolidatepurchasegstreport() {
                ngSessionHelper.getClinicalRoleId();
                ngSessionHelper.getUserTypeId();
                ngSessionHelper.getUserGroupId();
                return false;
            }
            function Canconsolidateinputgstsummary() {
                ngSessionHelper.getClinicalRoleId();
                ngSessionHelper.getUserTypeId();
                ngSessionHelper.getUserGroupId();
                return false;
            }

            function Canconsolidateoutputgstsummary() {
                ngSessionHelper.getClinicalRoleId();
                ngSessionHelper.getUserTypeId();
                ngSessionHelper.getUserGroupId();
                return false;
            }

            function Canstocksummaryproductgstreport() {
                ngSessionHelper.getClinicalRoleId();
                ngSessionHelper.getUserTypeId();
                ngSessionHelper.getUserGroupId();
                return false;
            }

            function Canconsolidategstreportfordeepam() {
                ngSessionHelper.getClinicalRoleId();
                ngSessionHelper.getUserTypeId();
                ngSessionHelper.getUserGroupId();
                return false;
            }
            //pharmacy dashboard tab 3
            function Canitemmasterreport() {
                ngSessionHelper.getClinicalRoleId();
                ngSessionHelper.getUserTypeId();
                ngSessionHelper.getUserGroupId();
                return false;
            }
            function Canmasterprice() {
                ngSessionHelper.getClinicalRoleId();
                ngSessionHelper.getUserTypeId();
                ngSessionHelper.getUserGroupId();
                return false;
            }
            function Canrackdetailsbystorereport() {
                ngSessionHelper.getClinicalRoleId();
                ngSessionHelper.getUserTypeId();
                ngSessionHelper.getUserGroupId();
                return false;
            }
            function Canitemrolsetupreport() {
                ngSessionHelper.getClinicalRoleId();
                ngSessionHelper.getUserTypeId();
                ngSessionHelper.getUserGroupId();
                return false;
            }

            function Canstockstatusreport() {
                ngSessionHelper.getClinicalRoleId();
                ngSessionHelper.getUserTypeId();
                ngSessionHelper.getUserGroupId();
                return false;
            }
            function Canstockindentreport() {
                ngSessionHelper.getClinicalRoleId();
                ngSessionHelper.getUserTypeId();
                ngSessionHelper.getUserGroupId();
                return false;
            }
            function Canstockmovementreport() {
                ngSessionHelper.getClinicalRoleId();
                ngSessionHelper.getUserTypeId();
                ngSessionHelper.getUserGroupId();
                return false;
            }
            function Canstockstatusproductsummaryreport() {
                ngSessionHelper.getClinicalRoleId();
                ngSessionHelper.getUserTypeId();
                ngSessionHelper.getUserGroupId();
                return false;
            }
            function Canmedicineexpiryreport() {
                ngSessionHelper.getClinicalRoleId();
                ngSessionHelper.getUserTypeId();
                ngSessionHelper.getUserGroupId();
                return false;
            }
            function Canmedicineexpiredreport() {
                ngSessionHelper.getClinicalRoleId();
                ngSessionHelper.getUserTypeId();
                ngSessionHelper.getUserGroupId();
                return false;
            }
            function Canstocknonmovementreport() {
                ngSessionHelper.getClinicalRoleId();
                ngSessionHelper.getUserTypeId();
                ngSessionHelper.getUserGroupId();
                return false;
            }
            function Canstockissuevocherreport() {
                ngSessionHelper.getClinicalRoleId();
                ngSessionHelper.getUserTypeId();
                ngSessionHelper.getUserGroupId();
                return false;
            }
            function Canstockstatusbatchreport() {
                ngSessionHelper.getClinicalRoleId();
                ngSessionHelper.getUserTypeId();
                ngSessionHelper.getUserGroupId();
                return false;
            }
            function Canitemwantedlist() {
                ngSessionHelper.getClinicalRoleId();
                ngSessionHelper.getUserTypeId();
                ngSessionHelper.getUserGroupId();
                return false;
            }
            function Canopticalstockstatusreport() {
                ngSessionHelper.getClinicalRoleId();
                ngSessionHelper.getUserTypeId();
                ngSessionHelper.getUserGroupId();
                return false;
            }
            //pharacy dashboard end
            //Store dashboard
            //tab1
            function Canstockstatusreportstore() {
                ngSessionHelper.getClinicalRoleId();
                ngSessionHelper.getUserTypeId();
                ngSessionHelper.getUserGroupId();
                return false;
            }
            function Canstockadjustmentreport() {
                ngSessionHelper.getClinicalRoleId();
                ngSessionHelper.getUserTypeId();
                ngSessionHelper.getUserGroupId();
                return false;
            }
            function Canstockindentreportstore() {
                ngSessionHelper.getClinicalRoleId();
                ngSessionHelper.getUserTypeId();
                ngSessionHelper.getUserGroupId();
                return false;
            }
            function Canstockmovementreportstore() {
                ngSessionHelper.getClinicalRoleId();
                ngSessionHelper.getUserTypeId();
                ngSessionHelper.getUserGroupId();
                return false;
            }
            function Canstockstatusproductsummaryreportstore() {
                ngSessionHelper.getClinicalRoleId();
                ngSessionHelper.getUserTypeId();
                ngSessionHelper.getUserGroupId();
                return false;
            }
            function Canmedicineexpiryreportstore() {
                ngSessionHelper.getClinicalRoleId();
                ngSessionHelper.getUserTypeId();
                ngSessionHelper.getUserGroupId();
                return false;
            }
            function Canmedicineexpiredreportstore() {
                ngSessionHelper.getClinicalRoleId();
                ngSessionHelper.getUserTypeId();
                ngSessionHelper.getUserGroupId();
                return false;
            }
            function Canstocknonmovementreportstore() {
                ngSessionHelper.getClinicalRoleId();
                ngSessionHelper.getUserTypeId();
                ngSessionHelper.getUserGroupId();
                return false;
            }
            function Canstockissuevocherreportstore() {
                ngSessionHelper.getClinicalRoleId();
                ngSessionHelper.getUserTypeId();
                ngSessionHelper.getUserGroupId();
                return false;
            }
            function Canstockstatusbatchreportstore() {
                ngSessionHelper.getClinicalRoleId();
                ngSessionHelper.getUserTypeId();
                ngSessionHelper.getUserGroupId();
                return false;
            }
            function Canopeningstockentryreportstore() {
                ngSessionHelper.getClinicalRoleId();
                ngSessionHelper.getUserTypeId();
                ngSessionHelper.getUserGroupId();
                return false;
            }
            //tab2
            function Canpurchasesalesgstreportstore() {
                ngSessionHelper.getClinicalRoleId();
                ngSessionHelper.getUserTypeId();
                ngSessionHelper.getUserGroupId();
                return false;
            }
            function Canpurchasereturngstreportstore() {
                ngSessionHelper.getClinicalRoleId();
                ngSessionHelper.getUserTypeId();
                ngSessionHelper.getUserGroupId();
                return false;
            } function Cansalesgstreportstore() {
                ngSessionHelper.getClinicalRoleId();
                ngSessionHelper.getUserTypeId();
                ngSessionHelper.getUserGroupId();
                return false;
            } function Canreturngstreportstore() {
                ngSessionHelper.getClinicalRoleId();
                ngSessionHelper.getUserTypeId();
                ngSessionHelper.getUserGroupId();
                return false;
            } function Canconsolidatesalesgstreportstore() {
                ngSessionHelper.getClinicalRoleId();
                ngSessionHelper.getUserTypeId();
                ngSessionHelper.getUserGroupId();
                return false;
            } function Canconsolidatepurchasegstreportstore() {
                ngSessionHelper.getClinicalRoleId();
                ngSessionHelper.getUserTypeId();
                ngSessionHelper.getUserGroupId();
                return false;
            } function Canconsolidateinputgstsummarystore() {
                ngSessionHelper.getClinicalRoleId();
                ngSessionHelper.getUserTypeId();
                ngSessionHelper.getUserGroupId();
                return false;
            } function Canconsolidateoutputgstsummarystore() {
                ngSessionHelper.getClinicalRoleId();
                ngSessionHelper.getUserTypeId();
                ngSessionHelper.getUserGroupId();
                return false;
            } function Canstocksummaryproductgstreportstore() {
                ngSessionHelper.getClinicalRoleId();
                ngSessionHelper.getUserTypeId();
                ngSessionHelper.getUserGroupId();
                return false;
            }
            //tab3
            function Canpurchaseorderreport() {
                ngSessionHelper.getClinicalRoleId();
                ngSessionHelper.getUserTypeId();
                ngSessionHelper.getUserGroupId();
                return false;
            }
            function Canpurchaseorderdetailreport() {
                ngSessionHelper.getClinicalRoleId();
                ngSessionHelper.getUserTypeId();
                ngSessionHelper.getUserGroupId();
                return false;
            }
            function Canpendingporeport() {
                ngSessionHelper.getClinicalRoleId();
                ngSessionHelper.getUserTypeId();
                ngSessionHelper.getUserGroupId();
                return false;
            }
            function Canstockissuevocherreportstores() {
                ngSessionHelper.getClinicalRoleId();
                ngSessionHelper.getUserTypeId();
                ngSessionHelper.getUserGroupId();
                return false;
            }
            function Cangrnreport() {
                ngSessionHelper.getClinicalRoleId();
                ngSessionHelper.getUserTypeId();
                ngSessionHelper.getUserGroupId();
                return false;
            }
            function Cangrnreportbyitem() {
                ngSessionHelper.getClinicalRoleId();
                ngSessionHelper.getUserTypeId();
                ngSessionHelper.getUserGroupId();
                return false;
            }
            function Canpurchasereturnreport() {
                ngSessionHelper.getClinicalRoleId();
                ngSessionHelper.getUserTypeId();
                ngSessionHelper.getUserGroupId();
                return false;
            }
            function Canpurchasevendorreport() {
                ngSessionHelper.getClinicalRoleId();
                ngSessionHelper.getUserTypeId();
                ngSessionHelper.getUserGroupId();
                return false;
            }
            function Canpurchasevendorpendingreport() {
                ngSessionHelper.getClinicalRoleId();
                ngSessionHelper.getUserTypeId();
                ngSessionHelper.getUserGroupId();
                return false;
            }
            function Canvendordetailreport() {
                ngSessionHelper.getClinicalRoleId();
                ngSessionHelper.getUserTypeId();
                ngSessionHelper.getUserGroupId();
                return false;
            }
            function Canvendoroutstandingreport() {
                ngSessionHelper.getClinicalRoleId();
                ngSessionHelper.getUserTypeId();
                ngSessionHelper.getUserGroupId();
                return false;
            }
            function Caninvoicesummarybysupplier() {
                ngSessionHelper.getClinicalRoleId();
                ngSessionHelper.getUserTypeId();
                ngSessionHelper.getUserGroupId();
                return false;
            }
            function Canpendingpaymentsummarybysupplier() {
                ngSessionHelper.getClinicalRoleId();
                ngSessionHelper.getUserTypeId();
                ngSessionHelper.getUserGroupId();
                return false;
            }
            function Cansuppliermasterreport() {
                ngSessionHelper.getClinicalRoleId();
                ngSessionHelper.getUserTypeId();
                ngSessionHelper.getUserGroupId();
                return false;
            }
            function Canitemmasterreportstore() {
                ngSessionHelper.getClinicalRoleId();
                ngSessionHelper.getUserTypeId();
                ngSessionHelper.getUserGroupId();
                return false;
            }
            function Canmasterpricestore() {
                ngSessionHelper.getClinicalRoleId();
                ngSessionHelper.getUserTypeId();
                ngSessionHelper.getUserGroupId();
                return false;
            }
            function Canstoremasterreport() {
                ngSessionHelper.getClinicalRoleId();
                ngSessionHelper.getUserTypeId();
                ngSessionHelper.getUserGroupId();
                return false;
            }
            function Canusermasterreport() {
                ngSessionHelper.getClinicalRoleId();
                ngSessionHelper.getUserTypeId();
                ngSessionHelper.getUserGroupId();
                return false;
            }
            function Canrackdetailsbystorereportstore() {
                ngSessionHelper.getClinicalRoleId();
                ngSessionHelper.getUserTypeId();
                ngSessionHelper.getUserGroupId();
                return false;
            }
            function Canitemreorderlistreport() {
                ngSessionHelper.getClinicalRoleId();
                ngSessionHelper.getUserTypeId();
                ngSessionHelper.getUserGroupId();
                return false;
            }
            function Cangenericmasterreport() {
                ngSessionHelper.getClinicalRoleId();
                ngSessionHelper.getUserTypeId();
                ngSessionHelper.getUserGroupId();
                return false;
            }
            function Canmanufacturermasterreport() {
                ngSessionHelper.getClinicalRoleId();
                ngSessionHelper.getUserTypeId();
                ngSessionHelper.getUserGroupId();
                return false;
            }
            function Canproducttypereport() {
                ngSessionHelper.getClinicalRoleId();
                ngSessionHelper.getUserTypeId();
                ngSessionHelper.getUserGroupId();
                return false;
            }
            function Canstockstatusgeneralreport() {
                ngSessionHelper.getClinicalRoleId();
                ngSessionHelper.getUserTypeId();
                ngSessionHelper.getUserGroupId();
                return false;
            }
            function Canstockadjustmentgeneralreport() {
                ngSessionHelper.getClinicalRoleId();
                ngSessionHelper.getUserTypeId();
                ngSessionHelper.getUserGroupId();
                return false;
            }
            function Canstockindentgeneralreport() {
                ngSessionHelper.getClinicalRoleId();
                ngSessionHelper.getUserTypeId();
                ngSessionHelper.getUserGroupId();
                return false;
            }
            function Canstockmovementgeneralreport() {
                ngSessionHelper.getClinicalRoleId();
                ngSessionHelper.getUserTypeId();
                ngSessionHelper.getUserGroupId();
                return false;
            }
            function Canstockstatusproductsummarygeneralreport() {
                ngSessionHelper.getClinicalRoleId();
                ngSessionHelper.getUserTypeId();
                ngSessionHelper.getUserGroupId();
                return false;
            }
            function Canstockissuevochergeneralreport() {
                ngSessionHelper.getClinicalRoleId();
                ngSessionHelper.getUserTypeId();
                ngSessionHelper.getUserGroupId();
                return false;
            }
            function Canstockstatusbatchgeneralreport() {
                ngSessionHelper.getClinicalRoleId();
                ngSessionHelper.getUserTypeId();
                ngSessionHelper.getUserGroupId();
                return false;
            }
            function Canopeningstockentrygeneralreport() {
                ngSessionHelper.getClinicalRoleId();
                ngSessionHelper.getUserTypeId();
                ngSessionHelper.getUserGroupId();
                return false;
            }
            //Store dashboard end

            function CanPurchaseOrder_Authorize() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }
                function CanPurchaseOrder_Approve() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }
                function CanRedo() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }
                function CanSave() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }
                function CanPrint() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }
                function CanPrintWithoutHeader() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }
                function Cansendforapproval() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }
                function CanReject() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }
                function CanPurchaseOrder_Amend() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }
                function CanCredit_Approver() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }
                function CanCredit_Approver() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }
                function CanAddToCredit_Button() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }
                function CanIVFHistory() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }
                function CanIVFConsultationNotes() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }
                function CanIPCaseFileSummary() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }
                function CanEquipmentUsage() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }
                function Canbloodbank() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }
                function Canipform() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }
                function Candietorders() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }
                function CanNotifiableDiseases() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }
                function CanReferrals() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }
                function CanTreatmentPlan() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }
                function CanPrescriptionP1() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }
                /* Emr Control */
                //Front Office Dashboard Report
                //tab1
                function Canfrontofficeipadmissionreport() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }
                function Canfrontofficeipdischargereport() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }
                function Canipadmissionsummarybydoctor() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }
                function Canipoccupancyreport() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }
                function Canipoccupancybyward() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }
                function Canipadmissioninsurancereport() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }
                function Canipadmissionsummarybyinsurance() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }
                function Canipreferraldoctorreport() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }
                function Candiagnosissummaryforippatient() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }
                function Canpatientlistbydiagnosis() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }
                function Cancovidstatisticsreport() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }
                function Canipstatisticsreport() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }
                function Candailywiseipstatisticsreport() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }
                function Canbedtransferreport() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }
                //tab2
                function Canpatientlist() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }
                function Canoutpatientreport() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }
                function Canoutpatientsummaryreport() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }
                function Caninactivepatientreport() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }
                function Candeseasedpatientreport() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }
                function Canopreferraldoctorreport() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }
                function Canoutpatientsummarybydoctor() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }
                function Canoutpatientsummarybyinsurance() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }
                function Canappointmentschedulereport() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }
                function Canappointmentcancelledreport() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }
                function Canappointmentreschedulereport() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }
                function Canappointmentpatientfromappreport() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }
                function Canvideoconsultationpatientlist() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }
                function Candaycarereport() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }
                function Canmlcreport() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }
                function Canemergencypatientreport() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }
                function Candaycaretoadmissionpatient() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }
                //tab3
                function Canmrdotschedulereport() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }
                function Canmrdsurgeryentryreports() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }
                //tab4
                function Candoctorlistreport() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }
                function Candepartmentlistreport() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }
                function Canwardandbedlist() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }
                function Canavailablebeds() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }
                function Caninsurancelistreport() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }
                function Canopserviceitemreport() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }
                function Canipserviceitemreport() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }
                function Canreferraldoctorlistreport() {
                    ngSessionHelper.getClinicalRoleId();
                    ngSessionHelper.getUserTypeId();
                    ngSessionHelper.getUserGroupId();
                    return false;
                }


                /** Known key with no role configuration: not granted (same result as before, without the log). */
                function notConfigured() {
                    return false;
                }

                var hasAccess = function (key) {
                    try {
                        var func = privileges[key];
                        if (typeof func === 'function') {
                            return func();
                        } else {
                            console.log("Missing key : " + key);
                            return false;
                        }
                    } catch (ex) {
                        console.log("Exception evaluating privilege key: " + key, ex);
                        return false;
                    }
                }
                /**
                 * Role-based check used by screens as utl.Privilege.hasPrivilege(...).
                 *   hasPrivilege(entity, action) -> session-roleprivmap[role][entity][action]
                 *   hasPrivilege(action)         -> that action under any entity of the user's roles
                 * Same rule as privilegeController.HasAccess: a value configured for any of the user's
                 * roles decides (true wins); when nothing is configured the action is allowed.
                 * Server-side authorization still applies to every request.
                 */
                var hasPrivilege = function (entityOrAction, action) {
                    try {
                        var map = ngSessionHelper.getObject('session-roleprivmap') || {};
                        var roles = ngSessionHelper.getUserRoles();
                        if (!Array.isArray(roles)) {
                            roles = roles ? [roles] : [];
                        }
                        var configured = false;
                        var allowed = false;
                        var check = function (entityMap, key) {
                            if (entityMap && typeof entityMap[key] === 'boolean') {
                                configured = true;
                                allowed = allowed || entityMap[key];
                            }
                        };
                        roles.forEach(function (role) {
                            var roleMap = map[role];
                            if (!roleMap || typeof roleMap !== 'object') {
                                return;
                            }
                            if (action !== undefined) {
                                check(roleMap[entityOrAction], action);
                            } else {
                                Object.keys(roleMap).forEach(function (entity) {
                                    check(roleMap[entity], entityOrAction);
                                });
                            }
                        });
                        return configured ? allowed : true;
                    } catch (ex) {
                        console.log('Exception evaluating privilege: ' + entityOrAction + (action ? '/' + action : ''), ex);
                        return false;
                    }
                };

                return {
                    hasAccess: hasAccess,
                    hasPrivilege: hasPrivilege
                };
            }
        ]);

})();