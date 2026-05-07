export class PrivilegeHelper {
  private static readonly privileges: Record<string, () => boolean> = {
    "CanItemDetails": PrivilegeHelper.CanItemDetails,
    "CanUomConversion": PrivilegeHelper.CanUomConversion,
    "CanStoreAssociation": PrivilegeHelper.CanStoreAssociation,
    "CanHospitalMapping": PrivilegeHelper.CanHospitalMapping,
    "CanSupplierMapping": PrivilegeHelper.CanSupplierMapping,
    "CanContract": PrivilegeHelper.CanContract,
    "CanPSDmPrint": PrivilegeHelper.CanPSDmPrint,
    "CanPSDiscount": PrivilegeHelper.CanPSDiscount,
    "CanIndent_Authorize": PrivilegeHelper.CanIndent_Authorize,
    "CanIndent_Approve": PrivilegeHelper.CanIndent_Approve,
    "CanIndent_Save": PrivilegeHelper.CanIndent_Save,
    "CanGRN_Approve_Button": PrivilegeHelper.CanGRN_Approve_Button,
    "CanGRN_Authorize_Button": PrivilegeHelper.CanGRN_Authorize_Button,
    "CanGRN_Save_Button": PrivilegeHelper.CanGRN_Save_Button,
    "CanAmend": PrivilegeHelper.CanAmend,
    "CanRegistration": PrivilegeHelper.CanRegistration,
    "CanAppointments": PrivilegeHelper.CanAppointments,
    "CanOPbilling": PrivilegeHelper.CanOPbilling,
    "CanDirectBilling": PrivilegeHelper.CanDirectBilling,
    "CanLabBilling": PrivilegeHelper.CanLabBilling,
    "CanAdmissions": PrivilegeHelper.CanAdmissions,
    "CanBedTransfer": PrivilegeHelper.CanBedTransfer,
    "CanCurrentIpPatients": PrivilegeHelper.CanCurrentIpPatients,
    "CanFrontOfficeReports": PrivilegeHelper.CanFrontOfficeReports,
    "CanOrderAcceptances": PrivilegeHelper.CanOrderAcceptances,
    "CanSpecimenCollection": PrivilegeHelper.CanSpecimenCollection,
    "CanResultEntries": PrivilegeHelper.CanResultEntries,
    "CanResultApprovals": PrivilegeHelper.CanResultApprovals,
    "CanResultReleases": PrivilegeHelper.CanResultReleases,
    "CanResultTemplates": PrivilegeHelper.CanResultTemplates,
    "CanManageTests": PrivilegeHelper.CanManageTests,
    "CanManageParameter": PrivilegeHelper.CanManageParameter,
    "CanReports": PrivilegeHelper.CanReports,
    "CanRis_OrderAcceptances": PrivilegeHelper.CanRis_OrderAcceptances,
    "CanRis_RateEnquiry": PrivilegeHelper.CanRis_RateEnquiry,
    "CanRis_ResultEntries": PrivilegeHelper.CanRis_ResultEntries,
    "CanRis_ResultApprovals": PrivilegeHelper.CanRis_ResultApprovals,
    "CanRis_ResultReleases": PrivilegeHelper.CanRis_ResultReleases,
    "CanRis_ResultTemplates": PrivilegeHelper.CanRis_ResultTemplates,
    "CanRis_ManageTests": PrivilegeHelper.CanRis_ManageTests,
    "CanRis_ManageParameter": PrivilegeHelper.CanRis_ManageParameter,
    "CanRis_Reports": PrivilegeHelper.CanRis_Reports,
    "CanEquipmentUsage": PrivilegeHelper.CanEquipmentUsage,
    "Canbloodbank": PrivilegeHelper.Canbloodbank,
    "Canipform": PrivilegeHelper.Canipform,
    "CanMedicineSales": PrivilegeHelper.CanMedicineSales,
    "CanMedicineReturns": PrivilegeHelper.CanMedicineReturns,
    "CanInjuctionBilling": PrivilegeHelper.CanInjuctionBilling,
    "CanInjuctionWorklist": PrivilegeHelper.CanInjuctionWorklist,
    "CanStockIndent": PrivilegeHelper.CanStockIndent,
    "CanStockReceives": PrivilegeHelper.CanStockReceives,
    "CanStockStatus": PrivilegeHelper.CanStockStatus,
    "CanStockMovement": PrivilegeHelper.CanStockMovement,
    "CanPharmacyReports": PrivilegeHelper.CanPharmacyReports,
    "CanMedicineCreditBills": PrivilegeHelper.CanMedicineCreditBills,
    "CanMedicineCreditReturns": PrivilegeHelper.CanMedicineCreditReturns,
    "CanDirectPharmacySales": PrivilegeHelper.CanDirectPharmacySales,
    "CanDirectMedicineReturns": PrivilegeHelper.CanDirectMedicineReturns,
    "CanStaffCredits": PrivilegeHelper.CanStaffCredits,
    "CanStaffCreditPayment": PrivilegeHelper.CanStaffCreditPayment,
    "CanStaffCreditReturns": PrivilegeHelper.CanStaffCreditReturns,
    "CanPurchaseOrders": PrivilegeHelper.CanPurchaseOrders,
    "CanInvoiceEntry": PrivilegeHelper.CanInvoiceEntry,
    "CanPurchase_Order_Pending_Approvals": PrivilegeHelper.CanPurchase_Order_Pending_Approvals,
    "CanInvoice_Returns": PrivilegeHelper.CanInvoice_Returns,
    "CanStock_Indents": PrivilegeHelper.CanStock_Indents,
    "CanIndent_Work_Lists": PrivilegeHelper.CanIndent_Work_Lists,
    "CanStock_Status": PrivilegeHelper.CanStock_Status,
    "CanStock_Movement": PrivilegeHelper.CanStock_Movement,
    "CanStock_Receives": PrivilegeHelper.CanStock_Receives,
    "CanCustomer_Sales": PrivilegeHelper.CanCustomer_Sales,
    "CanCustomer_Returns": PrivilegeHelper.CanCustomer_Returns,
    "CanStoreReports": PrivilegeHelper.CanStoreReports,
    "CanVendorPayment": PrivilegeHelper.CanVendorPayment,
    "CanWardManagement": PrivilegeHelper.CanWardManagement,
    "CanNursingBedTransfer": PrivilegeHelper.CanNursingBedTransfer,
    "CanNursingCurrentIpPatients": PrivilegeHelper.CanNursingCurrentIpPatients,
    "CanNursingCurrentOpPatients": PrivilegeHelper.CanNursingCurrentOpPatients,
    "CanNursingAppointments": PrivilegeHelper.CanNursingAppointments,
    "CanNursingWardManagement": PrivilegeHelper.CanNursingWardManagement,
    "CanNursing_StockIndents": PrivilegeHelper.CanNursing_StockIndents,
    "CanNursing_StockReceives": PrivilegeHelper.CanNursing_StockReceives,
    "CanNotifications": PrivilegeHelper.CanNotifications,
    "CanMedicineAdministration": PrivilegeHelper.CanMedicineAdministration,
    "CanPatientMedicineIndents": PrivilegeHelper.CanPatientMedicineIndents,
    "CanNursingReports": PrivilegeHelper.CanNursingReports,
    "CanNursingMytask": PrivilegeHelper.CanNursingMytask,
    "CanNursingBedManagement": PrivilegeHelper.CanNursingBedManagement,
    "CanNursingBedReceive": PrivilegeHelper.CanNursingBedReceive,
    "CanQuickRegistration": PrivilegeHelper.CanQuickRegistration,
    "CanBilling_OPPatients": PrivilegeHelper.CanBilling_OPPatients,
    "CanBilling_DirectBilling": PrivilegeHelper.CanBilling_DirectBilling,
    "CanBilling_LabBilling": PrivilegeHelper.CanBilling_LabBilling,
    "Canbilling_CurrentIpBilling": PrivilegeHelper.Canbilling_CurrentIpBilling,
    "CanDischarged_IP_Billing": PrivilegeHelper.CanDischarged_IP_Billing,
    "CanBilling_Admissions": PrivilegeHelper.CanBilling_Admissions,
    "CanBilling_CurrentIPPatients": PrivilegeHelper.CanBilling_CurrentIPPatients,
    "CanBillingReports": PrivilegeHelper.CanBillingReports,
    "CanDisount": PrivilegeHelper.CanDisount,
    "CanDelete": PrivilegeHelper.CanDelete,
    "CanOpbiillsReports": PrivilegeHelper.CanOpbiillsReports,
    "Cancollectiondetailbycashierreport": PrivilegeHelper.Cancollectiondetailbycashierreport,
    "Cancollectiondetailbyallcashierreport": PrivilegeHelper.Cancollectiondetailbyallcashierreport,
    "Canopipcollectionsummarybycashier": PrivilegeHelper.Canopipcollectionsummarybycashier,
    "Canopcollectionsummarybycashier": PrivilegeHelper.Canopcollectionsummarybycashier,
    "Canoverallcollectionsummary": PrivilegeHelper.Canoverallcollectionsummary,
    "Canoverallcollectioncashier": PrivilegeHelper.Canoverallcollectioncashier,
    "Caninsurancecreditsummary": PrivilegeHelper.Caninsurancecreditsummary,
    "Caninsuranceoutstandingsummary": PrivilegeHelper.Caninsuranceoutstandingsummary,
    "Canoutstandingreports": PrivilegeHelper.Canoutstandingreports,
    "Canopduecollectreport": PrivilegeHelper.Canopduecollectreport,
    "Candiscount": PrivilegeHelper.Candiscount,
    "Cancancelreport": PrivilegeHelper.Cancancelreport,
    "Canrefundreport": PrivilegeHelper.Canrefundreport,
    "Candirectbillreport": PrivilegeHelper.Candirectbillreport,
    "Cancollectionsummaryopip": PrivilegeHelper.Cancollectionsummaryopip,
    "Cangeneralexpensereport": PrivilegeHelper.Cangeneralexpensereport,
    "Canadvancefunddetailsreport": PrivilegeHelper.Canadvancefunddetailsreport,
    "Canpatientfundadjustmentreport": PrivilegeHelper.Canpatientfundadjustmentreport,
    "Canipbillreport": PrivilegeHelper.Canipbillreport,
    "Canipcollectiondetailbycashierreport": PrivilegeHelper.Canipcollectiondetailbycashierreport,
    "Canipcollectionsummarybycashier": PrivilegeHelper.Canipcollectionsummarybycashier,
    "Caniprefundreport": PrivilegeHelper.Caniprefundreport,
    "Canipduecollectreport": PrivilegeHelper.Canipduecollectreport,
    "Cancurrentoccupancyreport": PrivilegeHelper.Cancurrentoccupancyreport,
    "Canipcancelreport": PrivilegeHelper.Canipcancelreport,
    "Canipdiscountreport": PrivilegeHelper.Canipdiscountreport,
    "Canipinsurancereport": PrivilegeHelper.Canipinsurancereport,
    "Canipdue": PrivilegeHelper.Canipdue,
    "Canipadmissionreport": PrivilegeHelper.Canipadmissionreport,
    "Canipdischargereport": PrivilegeHelper.Canipdischargereport,
    "Canipoccupancyreportwithadvance": PrivilegeHelper.Canipoccupancyreportwithadvance,
    "Canbillingservice": PrivilegeHelper.Canbillingservice,
    "CanbillingGroup": PrivilegeHelper.CanbillingGroup,
    "Canbillingpackage": PrivilegeHelper.Canbillingpackage,
    "Canitemwisecollectionsummaryopreport": PrivilegeHelper.Canitemwisecollectionsummaryopreport,
    "Canitemwisecollectionsummaryipreport": PrivilegeHelper.Canitemwisecollectionsummaryipreport,
    "Canitemwisecollectionsummaryopandipreport": PrivilegeHelper.Canitemwisecollectionsummaryopandipreport,
    "Canrevenuesummarybyserviceitem": PrivilegeHelper.Canrevenuesummarybyserviceitem,
    "Canreferraldoctorrevenuedetailsreport": PrivilegeHelper.Canreferraldoctorrevenuedetailsreport,
    "Canotschedulereport": PrivilegeHelper.Canotschedulereport,
    "Cansurgeryentry": PrivilegeHelper.Cansurgeryentry,
    "Cansurgerysummarybyprocedure": PrivilegeHelper.Cansurgerysummarybyprocedure,
    "Canpharmacycollectionreport": PrivilegeHelper.Canpharmacycollectionreport,
    "Canpharmacysalesreport": PrivilegeHelper.Canpharmacysalesreport,
    "Canpharmacycollectionallcashier": PrivilegeHelper.Canpharmacycollectionallcashier,
    "Canpharmacybilldetailreport": PrivilegeHelper.Canpharmacybilldetailreport,
    "Canpharmacyreturnreportforotc": PrivilegeHelper.Canpharmacyreturnreportforotc,
    "Canpharmacyduereport": PrivilegeHelper.Canpharmacyduereport,
    "Canpharmacyduecollectreport": PrivilegeHelper.Canpharmacyduecollectreport,
    "Canpharmacydiscountreport": PrivilegeHelper.Canpharmacydiscountreport,
    "Canpharmacycollectionsummaryreport": PrivilegeHelper.Canpharmacycollectionsummaryreport,
    "Canippharmacyissuevoucherreport": PrivilegeHelper.Canippharmacyissuevoucherreport,
    "Canippharmacyreturnvoucherreport": PrivilegeHelper.Canippharmacyreturnvoucherreport,
    "Canpharmacyschedulereport": PrivilegeHelper.Canpharmacyschedulereport,
    "Canpharmacydmschedulereport": PrivilegeHelper.Canpharmacydmschedulereport,
    "Canpendingprescriptionreport": PrivilegeHelper.Canpendingprescriptionreport,
    "Canpharmacyschedulexreport": PrivilegeHelper.Canpharmacyschedulexreport,
    "Canpharmacycollectionsummarycashier": PrivilegeHelper.Canpharmacycollectionsummarycashier,
    "Canpharmacycardcollectionreport": PrivilegeHelper.Canpharmacycardcollectionreport,
    "Canstaffcreditbillreport": PrivilegeHelper.Canstaffcreditbillreport,
    "Canstaffpendingpaymentreport": PrivilegeHelper.Canstaffpendingpaymentreport,
    "Canstaffcreditreturnreport": PrivilegeHelper.Canstaffcreditreturnreport,
    "Canstaffcreditsummaryreport": PrivilegeHelper.Canstaffcreditsummaryreport,
    "Candailystockmovementreport": PrivilegeHelper.Candailystockmovementreport,
    "Candailysalessummarybyitem": PrivilegeHelper.Candailysalessummarybyitem,
    "Canpatientmedicineindentreport": PrivilegeHelper.Canpatientmedicineindentreport,
    "Canpatientindentpendingreport": PrivilegeHelper.Canpatientindentpendingreport,
    "Canpatientipdispensedreport": PrivilegeHelper.Canpatientipdispensedreport,
    "Canpatientipdispensedetailsreport": PrivilegeHelper.Canpatientipdispensedetailsreport,
    "Canpurchasesalesgstreport": PrivilegeHelper.Canpurchasesalesgstreport,
    "Canpurchasereturngstreport": PrivilegeHelper.Canpurchasereturngstreport,
    "Cansalesgstreport": PrivilegeHelper.Cansalesgstreport,
    "Canreturngstreport": PrivilegeHelper.Canreturngstreport,
    "Canconsolidatesalesgstreport": PrivilegeHelper.Canconsolidatesalesgstreport,
    "Canconsolidatepurchasegstreport": PrivilegeHelper.Canconsolidatepurchasegstreport,
    "Canconsolidateinputgstsummary": PrivilegeHelper.Canconsolidateinputgstsummary,
    "Canconsolidateoutputgstsummary": PrivilegeHelper.Canconsolidateoutputgstsummary,
    "Canstocksummaryproductgstreport": PrivilegeHelper.Canstocksummaryproductgstreport,
    "Canconsolidategstreportfordeepam": PrivilegeHelper.Canconsolidategstreportfordeepam,
    "Canitemmasterreport": PrivilegeHelper.Canitemmasterreport,
    "Canmasterprice": PrivilegeHelper.Canmasterprice,
    "Canrackdetailsbystorereport": PrivilegeHelper.Canrackdetailsbystorereport,
    "Canitemrolsetupreport": PrivilegeHelper.Canitemrolsetupreport,
    "Canstockstatusreport": PrivilegeHelper.Canstockstatusreport,
    "Canstockindentreport": PrivilegeHelper.Canstockindentreport,
    "Canstockmovementreport": PrivilegeHelper.Canstockmovementreport,
    "Canstockstatusproductsummaryreport": PrivilegeHelper.Canstockstatusproductsummaryreport,
    "Canmedicineexpiryreport": PrivilegeHelper.Canmedicineexpiryreport,
    "Canmedicineexpiredreport": PrivilegeHelper.Canmedicineexpiredreport,
    "Canstocknonmovementreport": PrivilegeHelper.Canstocknonmovementreport,
    "Canstockissuevocherreport": PrivilegeHelper.Canstockissuevocherreport,
    "Canstockstatusbatchreport": PrivilegeHelper.Canstockstatusbatchreport,
    "Canitemwantedlist": PrivilegeHelper.Canitemwantedlist,
    "Canopticalstockstatusreport": PrivilegeHelper.Canopticalstockstatusreport,
    "Canstockstatusreportstore": PrivilegeHelper.Canstockstatusreportstore,
    "Canstockadjustmentreport": PrivilegeHelper.Canstockadjustmentreport,
    "Canstockindentreportstore": PrivilegeHelper.Canstockindentreportstore,
    "Canstockmovementreportstore": PrivilegeHelper.Canstockmovementreportstore,
    "Canstockstatusproductsummaryreportstore": PrivilegeHelper.Canstockstatusproductsummaryreportstore,
    "Canmedicineexpiryreportstore": PrivilegeHelper.Canmedicineexpiryreportstore,
    "Canmedicineexpiredreportstore": PrivilegeHelper.Canmedicineexpiredreportstore,
    "Canstocknonmovementreportstore": PrivilegeHelper.Canstocknonmovementreportstore,
    "Canstockissuevocherreportstore": PrivilegeHelper.Canstockissuevocherreportstore,
    "Canstockstatusbatchreportstore": PrivilegeHelper.Canstockstatusbatchreportstore,
    "Canopeningstockentryreportstore": PrivilegeHelper.Canopeningstockentryreportstore,
    "Canpurchasesalesgstreportstore": PrivilegeHelper.Canpurchasesalesgstreportstore,
    "Canpurchasereturngstreportstore": PrivilegeHelper.Canpurchasereturngstreportstore,
    "Cansalesgstreportstore": PrivilegeHelper.Cansalesgstreportstore,
    "Canreturngstreportstore": PrivilegeHelper.Canreturngstreportstore,
    "Canconsolidatesalesgstreportstore": PrivilegeHelper.Canconsolidatesalesgstreportstore,
    "Canconsolidatepurchasegstreportstore": PrivilegeHelper.Canconsolidatepurchasegstreportstore,
    "Canconsolidateinputgstsummarystore": PrivilegeHelper.Canconsolidateinputgstsummarystore,
    "Canconsolidateoutputgstsummarystore": PrivilegeHelper.Canconsolidateoutputgstsummarystore,
    "Canstocksummaryproductgstreportstore": PrivilegeHelper.Canstocksummaryproductgstreportstore,
    "Canpurchaseorderreport": PrivilegeHelper.Canpurchaseorderreport,
    "Canpurchaseorderdetailreport": PrivilegeHelper.Canpurchaseorderdetailreport,
    "Canpendingporeport": PrivilegeHelper.Canpendingporeport,
    "Canstockissuevocherreportstores": PrivilegeHelper.Canstockissuevocherreportstores,
    "Cangrnreport": PrivilegeHelper.Cangrnreport,
    "Cangrnreportbyitem": PrivilegeHelper.Cangrnreportbyitem,
    "Canpurchasereturnreport": PrivilegeHelper.Canpurchasereturnreport,
    "Canpurchasevendorreport": PrivilegeHelper.Canpurchasevendorreport,
    "Canpurchasevendorpendingreport": PrivilegeHelper.Canpurchasevendorpendingreport,
    "Canvendordetailreport": PrivilegeHelper.Canvendordetailreport,
    "Canvendoroutstandingreport": PrivilegeHelper.Canvendoroutstandingreport,
    "Caninvoicesummarybysupplier": PrivilegeHelper.Caninvoicesummarybysupplier,
    "Canpendingpaymentsummarybysupplier": PrivilegeHelper.Canpendingpaymentsummarybysupplier,
    "Cansuppliermasterreport": PrivilegeHelper.Cansuppliermasterreport,
    "Canitemmasterreportstore": PrivilegeHelper.Canitemmasterreportstore,
    "Canmasterpricestore": PrivilegeHelper.Canmasterpricestore,
    "Canstoremasterreport": PrivilegeHelper.Canstoremasterreport,
    "Canusermasterreport": PrivilegeHelper.Canusermasterreport,
    "Canrackdetailsbystorereportstore": PrivilegeHelper.Canrackdetailsbystorereportstore,
    "Canitemreorderlistreport": PrivilegeHelper.Canitemreorderlistreport,
    "Cangenericmasterreport": PrivilegeHelper.Cangenericmasterreport,
    "Canmanufacturermasterreport": PrivilegeHelper.Canmanufacturermasterreport,
    "Canproducttypereport": PrivilegeHelper.Canproducttypereport,
    "Canstockstatusgeneralreport": PrivilegeHelper.Canstockstatusgeneralreport,
    "Canstockadjustmentgeneralreport": PrivilegeHelper.Canstockadjustmentgeneralreport,
    "Canstockindentgeneralreport": PrivilegeHelper.Canstockindentgeneralreport,
    "Canstockmovementgeneralreport": PrivilegeHelper.Canstockmovementgeneralreport,
    "Canstockstatusproductsummarygeneralreport": PrivilegeHelper.Canstockstatusproductsummarygeneralreport,
    "Canstockissuevochergeneralreport": PrivilegeHelper.Canstockissuevochergeneralreport,
    "Canstockstatusbatchgeneralreport": PrivilegeHelper.Canstockstatusbatchgeneralreport,
    "Canopeningstockentrygeneralreport": PrivilegeHelper.Canopeningstockentrygeneralreport,
    "Canfrontofficeipadmissionreport": PrivilegeHelper.Canfrontofficeipadmissionreport,
    "Canfrontofficeipdischargereport": PrivilegeHelper.Canfrontofficeipdischargereport,
    "Canipadmissionsummarybydoctor": PrivilegeHelper.Canipadmissionsummarybydoctor,
    "Canipoccupancyreport": PrivilegeHelper.Canipoccupancyreport,
    "Canipoccupancybyward": PrivilegeHelper.Canipoccupancybyward,
    "Canipadmissioninsurancereport": PrivilegeHelper.Canipadmissioninsurancereport,
    "Canipadmissionsummarybyinsurance": PrivilegeHelper.Canipadmissionsummarybyinsurance,
    "Canipreferraldoctorreport": PrivilegeHelper.Canipreferraldoctorreport,
    "Candiagnosissummaryforippatient": PrivilegeHelper.Candiagnosissummaryforippatient,
    "Canpatientlistbydiagnosis": PrivilegeHelper.Canpatientlistbydiagnosis,
    "Cancovidstatisticsreport": PrivilegeHelper.Cancovidstatisticsreport,
    "Canipstatisticsreport": PrivilegeHelper.Canipstatisticsreport,
    "Candailywiseipstatisticsreport": PrivilegeHelper.Candailywiseipstatisticsreport,
    "Canbedtransferreport": PrivilegeHelper.Canbedtransferreport,
    "Canpatientlist": PrivilegeHelper.Canpatientlist,
    "Canoutpatientreport": PrivilegeHelper.Canoutpatientreport,
    "Canoutpatientsummaryreport": PrivilegeHelper.Canoutpatientsummaryreport,
    "Caninactivepatientreport": PrivilegeHelper.Caninactivepatientreport,
    "Candeseasedpatientreport": PrivilegeHelper.Candeseasedpatientreport,
    "Canopreferraldoctorreport": PrivilegeHelper.Canopreferraldoctorreport,
    "Canoutpatientsummarybydoctor": PrivilegeHelper.Canoutpatientsummarybydoctor,
    "Canoutpatientsummarybyinsurance": PrivilegeHelper.Canoutpatientsummarybyinsurance,
    "Canappointmentschedulereport": PrivilegeHelper.Canappointmentschedulereport,
    "Canappointmentcancelledreport": PrivilegeHelper.Canappointmentcancelledreport,
    "Canappointmentreschedulereport": PrivilegeHelper.Canappointmentreschedulereport,
    "Canappointmentpatientfromappreport": PrivilegeHelper.Canappointmentpatientfromappreport,
    "Canvideoconsultationpatientlist": PrivilegeHelper.Canvideoconsultationpatientlist,
    "Candaycarereport": PrivilegeHelper.Candaycarereport,
    "Canmlcreport": PrivilegeHelper.Canmlcreport,
    "Canemergencypatientreport": PrivilegeHelper.Canemergencypatientreport,
    "Candaycaretoadmissionpatient": PrivilegeHelper.Candaycaretoadmissionpatient,
    "Canmrdotschedulereport": PrivilegeHelper.Canmrdotschedulereport,
    "Canmrdsurgeryentryreports": PrivilegeHelper.Canmrdsurgeryentryreports,
    "Candoctorlistreport": PrivilegeHelper.Candoctorlistreport,
    "Candepartmentlistreport": PrivilegeHelper.Candepartmentlistreport,
    "Canwardandbedlist": PrivilegeHelper.Canwardandbedlist,
    "Canavailablebeds": PrivilegeHelper.Canavailablebeds,
    "Caninsurancelistreport": PrivilegeHelper.Caninsurancelistreport,
    "Canopserviceitemreport": PrivilegeHelper.Canopserviceitemreport,
    "Canipserviceitemreport": PrivilegeHelper.Canipserviceitemreport,
    "Canreferraldoctorlistreport": PrivilegeHelper.Canreferraldoctorlistreport,
    "CanProductType": PrivilegeHelper.CanProductType,
    "CanUnitofMeasurements": PrivilegeHelper.CanUnitofMeasurements,
    "CanTaxMasters": PrivilegeHelper.CanTaxMasters,
    "CanStores": PrivilegeHelper.CanStores,
    "CanInventoryItems": PrivilegeHelper.CanInventoryItems,
    "CanSuplliers": PrivilegeHelper.CanSuplliers,
    "CanItemSupplierPrices": PrivilegeHelper.CanItemSupplierPrices,
    "CanRackSelfTray": PrivilegeHelper.CanRackSelfTray,
    "CanReorderSetup": PrivilegeHelper.CanReorderSetup,
    "CanAllergies": PrivilegeHelper.CanAllergies,
    "CanComplaints": PrivilegeHelper.CanComplaints,
    "CanDiagnosis": PrivilegeHelper.CanDiagnosis,
    "CanProcedures": PrivilegeHelper.CanProcedures,
    "CanVitalParameters": PrivilegeHelper.CanVitalParameters,
    "CanDrugFrequencies": PrivilegeHelper.CanDrugFrequencies,
    "CanTemplates": PrivilegeHelper.CanTemplates,
    "CanTemplate_Screens": PrivilegeHelper.CanTemplate_Screens,
    "CanTemplate_Tabs": PrivilegeHelper.CanTemplate_Tabs,
    "CanTemplate_Parameters": PrivilegeHelper.CanTemplate_Parameters,
    "CanDischarge_Summary_Templates": PrivilegeHelper.CanDischarge_Summary_Templates,
    "CanFavorites": PrivilegeHelper.CanFavorites,
    "CanGeneral_Remarks": PrivilegeHelper.CanGeneral_Remarks,
    "CanCities": PrivilegeHelper.CanCities,
    "CanStates": PrivilegeHelper.CanStates,
    "CanPostCodes": PrivilegeHelper.CanPostCodes,
    "CanManageReferrals": PrivilegeHelper.CanManageReferrals,
    "CanOccupations": PrivilegeHelper.CanOccupations,
    "CanOP_Cancel": PrivilegeHelper.CanOP_Cancel,
    "CanOP_PartialCancel": PrivilegeHelper.CanOP_PartialCancel,
    "CanOP_PreviousBills": PrivilegeHelper.CanOP_PreviousBills,
    "CanOP_OutStandingBills": PrivilegeHelper.CanOP_OutStandingBills,
    "CanReg_Billing": PrivilegeHelper.CanReg_Billing,
    "CanReg_CheckOut": PrivilegeHelper.CanReg_CheckOut,
    "CanReg_Deactivate": PrivilegeHelper.CanReg_Deactivate,
    "CanReg_Attachment": PrivilegeHelper.CanReg_Attachment,
    "CanReg_BarCode": PrivilegeHelper.CanReg_BarCode,
    "CanIPSUM_PRINT": PrivilegeHelper.CanIPSUM_PRINT,
    "CanIPSUM_INSURANCE": PrivilegeHelper.CanIPSUM_INSURANCE,
    "CanIPSUM_PHARMACY": PrivilegeHelper.CanIPSUM_PHARMACY,
    "CanIPSUM_DISCHARGE": PrivilegeHelper.CanIPSUM_DISCHARGE,
    "CanIPSUM_FINALIZE": PrivilegeHelper.CanIPSUM_FINALIZE,
    "CanIPSUM_BILL_LOCK": PrivilegeHelper.CanIPSUM_BILL_LOCK,
    "CanCredit_Approver": PrivilegeHelper.CanCredit_Approver,
    "CanIPDEL_PREVIOUS_ORDER": PrivilegeHelper.CanIPDEL_PREVIOUS_ORDER,
    "CanIPDEL_ADDNEW": PrivilegeHelper.CanIPDEL_ADDNEW,
    "CanIPRECEIPT_ADVANCE": PrivilegeHelper.CanIPRECEIPT_ADVANCE,
    "CanIPRECEIPT_REFUND": PrivilegeHelper.CanIPRECEIPT_REFUND,
    "CanIPRECEIPT_CANCEL": PrivilegeHelper.CanIPRECEIPT_CANCEL,
    "CanIPREF_REFUND": PrivilegeHelper.CanIPREF_REFUND,
    "CanIPREF_PARTIAL_REFUND": PrivilegeHelper.CanIPREF_PARTIAL_REFUND,
    "CanIP_UPDATE": PrivilegeHelper.CanIP_UPDATE,
    "CanBillcorrection_Update": PrivilegeHelper.CanBillcorrection_Update,
    "CanPharmacyBillcorrection_Update": PrivilegeHelper.CanPharmacyBillcorrection_Update,
    "CanAllOutPatients": PrivilegeHelper.CanAllOutPatients,
    "CanMyOutPatients": PrivilegeHelper.CanMyOutPatients,
    "CanPreviousOutPatients": PrivilegeHelper.CanPreviousOutPatients,
    "CanAllInPatients": PrivilegeHelper.CanAllInPatients,
    "CanMyInPatients": PrivilegeHelper.CanMyInPatients,
    "CanPreviousInPatients": PrivilegeHelper.CanPreviousInPatients,
    "CanSummaryBill": PrivilegeHelper.CanSummaryBill,
    "CanIPBillDetails": PrivilegeHelper.CanIPBillDetails,
    "CanAdvanceReceipts": PrivilegeHelper.CanAdvanceReceipts,
    "CanRefund": PrivilegeHelper.CanRefund,
    "CanCollectionModification": PrivilegeHelper.CanCollectionModification,
    "CanNonPharmacyCollectionModification": PrivilegeHelper.CanNonPharmacyCollectionModification,
    "CanInPatient": PrivilegeHelper.CanInPatient,
    "CanFloorView": PrivilegeHelper.CanFloorView,
    "CanDetails": PrivilegeHelper.CanDetails,
    "CanPerformingDoctors": PrivilegeHelper.CanPerformingDoctors,
    "CanRate": PrivilegeHelper.CanRate,
    "CanHealthCheckup": PrivilegeHelper.CanHealthCheckup,
    "CanHospital": PrivilegeHelper.CanHospital,
    "CanSurgerySchedule": PrivilegeHelper.CanSurgerySchedule,
    "CanSurgeryConfirmation": PrivilegeHelper.CanSurgeryConfirmation,
    "CanOT_Procedure_Entries": PrivilegeHelper.CanOT_Procedure_Entries,
    "CanStockIndent": PrivilegeHelper.CanStockIndent,
    "CanStockReceive": PrivilegeHelper.CanStockReceive,
    "CanInPatients": PrivilegeHelper.CanInPatients,
    "CanReport": PrivilegeHelper.CanReport,
    "CanOP_Patients": PrivilegeHelper.CanOP_Patients,
    "CanIP_Patients": PrivilegeHelper.CanIP_Patients,
    "CanAppointments": PrivilegeHelper.CanAppointments,
    "CanSurgerySchedule": PrivilegeHelper.CanSurgerySchedule,
    "CanReports": PrivilegeHelper.CanReports,
    "CanPurchaseOrder_Amend": PrivilegeHelper.CanPurchaseOrder_Amend,
    "CanAdmCancel": PrivilegeHelper.CanAdmCancel,
    "CanPatientRecords": PrivilegeHelper.CanPatientRecords,
    "CanMedicalHistory": PrivilegeHelper.CanMedicalHistory,
    "CanSymptoms": PrivilegeHelper.CanSymptoms,
    "CanDiagnosis": PrivilegeHelper.CanDiagnosis,
    "CanVitals": PrivilegeHelper.CanVitals,
    "CanClinicalDocuments": PrivilegeHelper.CanClinicalDocuments,
    "CanClinicalOrders": PrivilegeHelper.CanClinicalOrders,
    "CanProcedureOrders": PrivilegeHelper.CanProcedureOrders,
    "CanNotes": PrivilegeHelper.CanNotes,
    "CaneMAR": PrivilegeHelper.CaneMAR,
    "CanLabResults": PrivilegeHelper.CanLabResults,
    "CanRadiologyResults": PrivilegeHelper.CanRadiologyResults,
    "CanDentalChart": PrivilegeHelper.CanDentalChart,
    "CanNursingCharts": PrivilegeHelper.CanNursingCharts,
    "CanNursingNotes": PrivilegeHelper.CanNursingNotes,
    "CanDoctorNotes": PrivilegeHelper.CanDoctorNotes,
    "CanAdmissionRequest": PrivilegeHelper.CanAdmissionRequest,
    "CanPhysiotheraphyTreatment": PrivilegeHelper.CanPhysiotheraphyTreatment,
    "CanBillDetails": PrivilegeHelper.CanBillDetails,
    "CanSummary": PrivilegeHelper.CanSummary,
    "CanPrescriptions": PrivilegeHelper.CanPrescriptions,
    "CanBillService": PrivilegeHelper.CanBillService,
    "CanDischargeSummary": PrivilegeHelper.CanDischargeSummary,
    "CanDischargeNotes": PrivilegeHelper.CanDischargeNotes,
    "CanEMRCharts": PrivilegeHelper.CanEMRCharts,
    "CanDoctorTransfer": PrivilegeHelper.CanDoctorTransfer,
    "CanPositionBPChart": PrivilegeHelper.CanPositionBPChart,
    "CanDiabetes": PrivilegeHelper.CanDiabetes,
    "CanCD4CD8Chart": PrivilegeHelper.CanCD4CD8Chart,
    "CanMedicineIndent": PrivilegeHelper.CanMedicineIndent,
    "CanMedicinReturn": PrivilegeHelper.CanMedicinReturn,
    "CanApprove": PrivilegeHelper.CanApprove,
    "CanAuthorize": PrivilegeHelper.CanAuthorize,
    "CanRedo": PrivilegeHelper.CanRedo,
    "CanPurchaseOrder_Save": PrivilegeHelper.CanPurchaseOrder_Save,
    "CanPurchaseOrder_Authorize": PrivilegeHelper.CanPurchaseOrder_Authorize,
    "CanPurchaseOrder_Approve": PrivilegeHelper.CanPurchaseOrder_Approve,
    "CanSave": PrivilegeHelper.CanSave,
    "CanPrint": PrivilegeHelper.CanPrint,
    "CanPrintWithoutHeader": PrivilegeHelper.CanPrintWithoutHeader,
    "Cansendforapproval": PrivilegeHelper.Cansendforapproval,
    "Cansendforapproval": PrivilegeHelper.Cansendforapproval,
    "CanCredit_Approver": PrivilegeHelper.CanCredit_Approver,
    "CanAddToCredit_Button": PrivilegeHelper.CanAddToCredit_Button,
    "CanAddnewbutton": PrivilegeHelper.CanAddnewbutton,
    "CanSickLeave": PrivilegeHelper.CanSickLeave,
    "Canprescriptionpad": PrivilegeHelper.Canprescriptionpad,
    "CanClinicalImage": PrivilegeHelper.CanClinicalImage,
    "CanIVFHistory": PrivilegeHelper.CanIVFHistory,
    "CanIVFConsultationNotes": PrivilegeHelper.CanIVFConsultationNotes,
    "CanIPCaseFileSummary": PrivilegeHelper.CanIPCaseFileSummary,
    "Candietorders": PrivilegeHelper.Candietorders,
    "CanNotifiableDiseases": PrivilegeHelper.CanNotifiableDiseases,
    "CanReferrals": PrivilegeHelper.CanReferrals,
    "CanTreatmentPlan": PrivilegeHelper.CanTreatmentPlan,
    "CanReversebutton": PrivilegeHelper.CanReversebutton,
    "CanPrescriptionP1": PrivilegeHelper.CanPrescriptionP1,
    "CanDeletedBillButton": PrivilegeHelper.CanDeletedBillButton,
    "CanDeletereceiptsButton": PrivilegeHelper.CanDeletereceiptsButton,
    "CanABGMaster": PrivilegeHelper.CanABGMaster,
  };

  private static CanItemDetails(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static CanUomConversion(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static CanStoreAssociation(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static CanHospitalMapping(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static CanSupplierMapping(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static CanContract(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static CanPSDmPrint(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static CanPSDiscount(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static CanIndent_Authorize(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static CanIndent_Approve(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static CanIndent_Save(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static CanGRN_Approve_Button(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static CanGRN_Authorize_Button(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static CanGRN_Save_Button(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static CanAmend(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static CanRegistration(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static CanAppointments(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static CanOPbilling(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static CanDirectBilling(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static CanLabBilling(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static CanAdmissions(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static CanBedTransfer(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static CanCurrentIpPatients(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static CanFrontOfficeReports(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static CanOrderAcceptances(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static CanSpecimenCollection(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static CanResultEntries(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static CanResultApprovals(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static CanResultReleases(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static CanResultTemplates(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static CanManageTests(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static CanManageParameter(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static CanReports(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static CanRis_OrderAcceptances(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static CanRis_RateEnquiry(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static CanRis_ResultEntries(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static CanRis_ResultApprovals(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static CanRis_ResultReleases(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static CanRis_ResultTemplates(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static CanRis_ManageTests(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static CanRis_ManageParameter(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static CanRis_Reports(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static CanEquipmentUsage(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static Canbloodbank(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static Canipform(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static CanMedicineSales(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static CanMedicineReturns(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static CanInjuctionBilling(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static CanInjuctionWorklist(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static CanStockIndent(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static CanStockReceives(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static CanStockStatus(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static CanStockMovement(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static CanPharmacyReports(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static CanMedicineCreditBills(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static CanMedicineCreditReturns(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static CanDirectPharmacySales(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static CanDirectMedicineReturns(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static CanStaffCredits(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static CanStaffCreditPayment(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static CanStaffCreditReturns(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static CanPurchaseOrders(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static CanInvoiceEntry(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static CanPurchase_Order_Pending_Approvals(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static CanInvoice_Returns(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static CanStock_Indents(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static CanIndent_Work_Lists(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static CanStock_Status(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static CanStock_Movement(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static CanStock_Receives(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static CanCustomer_Sales(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static CanCustomer_Returns(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static CanStoreReports(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static CanVendorPayment(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static CanWardManagement(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static CanNursingBedTransfer(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static CanNursingCurrentIpPatients(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static CanNursingCurrentOpPatients(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static CanNursingAppointments(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static CanNursingWardManagement(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static CanNursing_StockIndents(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static CanNursing_StockReceives(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static CanNotifications(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static CanMedicineAdministration(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static CanPatientMedicineIndents(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static CanNursingReports(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static CanNursingMytask(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static CanNursingBedManagement(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static CanNursingBedReceive(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static CanQuickRegistration(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static CanBilling_OPPatients(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static CanBilling_DirectBilling(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static CanBilling_LabBilling(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static Canbilling_CurrentIpBilling(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static CanDischarged_IP_Billing(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static CanBilling_Admissions(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static CanBilling_CurrentIPPatients(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static CanBillingReports(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static CanDisount(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static CanDelete(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static CanOpbiillsReports(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static Cancollectiondetailbycashierreport(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static Cancollectiondetailbyallcashierreport(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static Canopipcollectionsummarybycashier(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static Canopcollectionsummarybycashier(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static Canoverallcollectionsummary(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static Canoverallcollectioncashier(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static Caninsurancecreditsummary(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static Caninsuranceoutstandingsummary(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static Canoutstandingreports(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static Canopduecollectreport(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static Candiscount(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static Cancancelreport(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static Canrefundreport(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static Candirectbillreport(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static Cancollectionsummaryopip(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static Cangeneralexpensereport(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static Canadvancefunddetailsreport(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static Canpatientfundadjustmentreport(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static Canipbillreport(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static Canipcollectiondetailbycashierreport(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static Canipcollectionsummarybycashier(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static Caniprefundreport(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static Canipduecollectreport(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static Cancurrentoccupancyreport(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static Canipcancelreport(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static Canipdiscountreport(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static Canipinsurancereport(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static Canipdue(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static Canipadmissionreport(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static Canipdischargereport(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static Canipoccupancyreportwithadvance(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static Canbillingservice(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static CanbillingGroup(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static Canbillingpackage(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static Canitemwisecollectionsummaryopreport(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static Canitemwisecollectionsummaryipreport(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static Canitemwisecollectionsummaryopandipreport(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static Canrevenuesummarybyserviceitem(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static Canreferraldoctorrevenuedetailsreport(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static Canotschedulereport(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static Cansurgeryentry(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static Cansurgerysummarybyprocedure(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static Canpharmacycollectionreport(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static Canpharmacysalesreport(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static Canpharmacycollectionallcashier(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static Canpharmacybilldetailreport(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static Canpharmacyreturnreportforotc(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static Canpharmacyduereport(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static Canpharmacyduecollectreport(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static Canpharmacydiscountreport(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static Canpharmacycollectionsummaryreport(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static Canippharmacyissuevoucherreport(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static Canippharmacyreturnvoucherreport(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static Canpharmacyschedulereport(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static Canpharmacydmschedulereport(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static Canpendingprescriptionreport(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static Canpharmacyschedulexreport(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static Canpharmacycollectionsummarycashier(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static Canpharmacycardcollectionreport(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static Canstaffcreditbillreport(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static Canstaffpendingpaymentreport(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static Canstaffcreditreturnreport(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static Canstaffcreditsummaryreport(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static Candailystockmovementreport(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static Candailysalessummarybyitem(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static Canpatientmedicineindentreport(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static Canpatientindentpendingreport(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static Canpatientipdispensedreport(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static Canpatientipdispensedetailsreport(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static Canpurchasesalesgstreport(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static Canpurchasereturngstreport(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static Cansalesgstreport(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static Canreturngstreport(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static Canconsolidatesalesgstreport(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static Canconsolidatepurchasegstreport(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static Canconsolidateinputgstsummary(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static Canconsolidateoutputgstsummary(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static Canstocksummaryproductgstreport(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static Canconsolidategstreportfordeepam(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static Canitemmasterreport(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static Canmasterprice(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static Canrackdetailsbystorereport(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static Canitemrolsetupreport(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static Canstockstatusreport(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static Canstockindentreport(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static Canstockmovementreport(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static Canstockstatusproductsummaryreport(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static Canmedicineexpiryreport(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static Canmedicineexpiredreport(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static Canstocknonmovementreport(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static Canstockissuevocherreport(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static Canstockstatusbatchreport(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static Canitemwantedlist(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static Canopticalstockstatusreport(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static Canstockstatusreportstore(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static Canstockadjustmentreport(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static Canstockindentreportstore(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static Canstockmovementreportstore(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static Canstockstatusproductsummaryreportstore(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static Canmedicineexpiryreportstore(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static Canmedicineexpiredreportstore(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static Canstocknonmovementreportstore(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static Canstockissuevocherreportstore(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static Canstockstatusbatchreportstore(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static Canopeningstockentryreportstore(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static Canpurchasesalesgstreportstore(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static Canpurchasereturngstreportstore(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static Cansalesgstreportstore(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static Canreturngstreportstore(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static Canconsolidatesalesgstreportstore(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static Canconsolidatepurchasegstreportstore(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static Canconsolidateinputgstsummarystore(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static Canconsolidateoutputgstsummarystore(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static Canstocksummaryproductgstreportstore(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static Canpurchaseorderreport(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static Canpurchaseorderdetailreport(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static Canpendingporeport(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static Canstockissuevocherreportstores(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static Cangrnreport(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static Cangrnreportbyitem(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static Canpurchasereturnreport(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static Canpurchasevendorreport(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static Canpurchasevendorpendingreport(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static Canvendordetailreport(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static Canvendoroutstandingreport(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static Caninvoicesummarybysupplier(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static Canpendingpaymentsummarybysupplier(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static Cansuppliermasterreport(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static Canitemmasterreportstore(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static Canmasterpricestore(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static Canstoremasterreport(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static Canusermasterreport(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static Canrackdetailsbystorereportstore(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static Canitemreorderlistreport(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static Cangenericmasterreport(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static Canmanufacturermasterreport(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static Canproducttypereport(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static Canstockstatusgeneralreport(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static Canstockadjustmentgeneralreport(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static Canstockindentgeneralreport(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static Canstockmovementgeneralreport(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static Canstockstatusproductsummarygeneralreport(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static Canstockissuevochergeneralreport(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static Canstockstatusbatchgeneralreport(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static Canopeningstockentrygeneralreport(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static Canfrontofficeipadmissionreport(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static Canfrontofficeipdischargereport(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static Canipadmissionsummarybydoctor(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static Canipoccupancyreport(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static Canipoccupancybyward(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static Canipadmissioninsurancereport(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static Canipadmissionsummarybyinsurance(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static Canipreferraldoctorreport(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static Candiagnosissummaryforippatient(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static Canpatientlistbydiagnosis(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static Cancovidstatisticsreport(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static Canipstatisticsreport(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static Candailywiseipstatisticsreport(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static Canbedtransferreport(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static Canpatientlist(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static Canoutpatientreport(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static Canoutpatientsummaryreport(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static Caninactivepatientreport(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static Candeseasedpatientreport(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static Canopreferraldoctorreport(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static Canoutpatientsummarybydoctor(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static Canoutpatientsummarybyinsurance(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static Canappointmentschedulereport(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static Canappointmentcancelledreport(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static Canappointmentreschedulereport(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static Canappointmentpatientfromappreport(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static Canvideoconsultationpatientlist(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static Candaycarereport(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static Canmlcreport(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static Canemergencypatientreport(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static Candaycaretoadmissionpatient(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static Canmrdotschedulereport(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static Canmrdsurgeryentryreports(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static Candoctorlistreport(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static Candepartmentlistreport(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static Canwardandbedlist(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static Canavailablebeds(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static Caninsurancelistreport(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static Canopserviceitemreport(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static Canipserviceitemreport(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static Canreferraldoctorlistreport(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static CanProductType(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static CanUnitofMeasurements(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static CanTaxMasters(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static CanStores(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static CanInventoryItems(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static CanSuplliers(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static CanItemSupplierPrices(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static CanRackSelfTray(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static CanReorderSetup(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static CanAllergies(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static CanComplaints(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static CanDiagnosis(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static CanProcedures(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static CanVitalParameters(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static CanDrugFrequencies(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static CanTemplates(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static CanTemplate_Screens(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static CanTemplate_Tabs(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static CanTemplate_Parameters(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static CanDischarge_Summary_Templates(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static CanFavorites(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static CanGeneral_Remarks(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static CanCities(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static CanStates(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static CanPostCodes(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static CanManageReferrals(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static CanOccupations(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static CanOP_Cancel(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static CanOP_PartialCancel(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static CanOP_PreviousBills(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static CanOP_OutStandingBills(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static CanReg_Billing(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static CanReg_CheckOut(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static CanReg_Deactivate(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static CanReg_Attachment(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static CanReg_BarCode(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static CanIPSUM_PRINT(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static CanIPSUM_INSURANCE(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static CanIPSUM_PHARMACY(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static CanIPSUM_DISCHARGE(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static CanIPSUM_FINALIZE(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static CanIPSUM_BILL_LOCK(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static CanCredit_Approver(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static CanIPDEL_PREVIOUS_ORDER(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static CanIPDEL_ADDNEW(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static CanIPRECEIPT_ADVANCE(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static CanIPRECEIPT_REFUND(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static CanIPRECEIPT_CANCEL(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static CanIPREF_REFUND(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static CanIPREF_PARTIAL_REFUND(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static CanIP_UPDATE(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static CanBillcorrection_Update(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static CanPharmacyBillcorrection_Update(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static CanAllOutPatients(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static CanMyOutPatients(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static CanPreviousOutPatients(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static CanAllInPatients(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static CanMyInPatients(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static CanPreviousInPatients(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static CanSummaryBill(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static CanIPBillDetails(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static CanAdvanceReceipts(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static CanRefund(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static CanCollectionModification(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static CanNonPharmacyCollectionModification(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static CanInPatient(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static CanFloorView(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static CanDetails(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static CanPerformingDoctors(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static CanRate(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static CanHealthCheckup(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static CanHospital(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static CanSurgerySchedule(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static CanSurgeryConfirmation(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static CanOT_Procedure_Entries(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static CanStockIndent(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static CanStockReceive(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static CanInPatients(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static CanReport(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static CanOP_Patients(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static CanIP_Patients(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static CanAppointments(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static CanSurgerySchedule(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static CanReports(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static CanPurchaseOrder_Amend(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static CanAdmCancel(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static CanPatientRecords(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static CanMedicalHistory(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static CanSymptoms(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static CanDiagnosis(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static CanVitals(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static CanClinicalDocuments(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static CanClinicalOrders(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static CanProcedureOrders(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static CanNotes(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static CaneMAR(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static CanLabResults(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static CanRadiologyResults(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static CanDentalChart(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static CanNursingCharts(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static CanNursingNotes(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static CanDoctorNotes(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static CanAdmissionRequest(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static CanPhysiotheraphyTreatment(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static CanBillDetails(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static CanSummary(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static CanPrescriptions(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static CanBillService(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static CanDischargeSummary(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static CanDischargeNotes(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static CanEMRCharts(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static CanDoctorTransfer(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static CanPositionBPChart(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static CanDiabetes(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static CanCD4CD8Chart(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static CanMedicineIndent(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static CanMedicinReturn(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static CanApprove(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static CanAuthorize(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static CanRedo(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static CanPurchaseOrder_Save(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static CanPurchaseOrder_Authorize(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static CanPurchaseOrder_Approve(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static CanSave(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static CanPrint(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static CanPrintWithoutHeader(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static Cansendforapproval(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static Cansendforapproval(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static CanCredit_Approver(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static CanAddToCredit_Button(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static CanAddnewbutton(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static CanSickLeave(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static Canprescriptionpad(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static CanClinicalImage(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static CanIVFHistory(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static CanIVFConsultationNotes(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static CanIPCaseFileSummary(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static Candietorders(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static CanNotifiableDiseases(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static CanReferrals(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static CanTreatmentPlan(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static CanReversebutton(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static CanPrescriptionP1(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static CanDeletedBillButton(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static CanDeletereceiptsButton(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  private static CanABGMaster(): boolean {
    // TODO: Implement actual session checks when SessionHelper is available
    return false;
  }

  public static hasAccess(key: string): boolean {
    try {
      const func = PrivilegeHelper.privileges[key];
      if (typeof func === "function") {
        return func();
      } else {
        console.warn("Missing privilege key: " + key);
        return false;
      }
    } catch (ex) {
      console.error("Exception evaluating privilege key: " + key, ex);
      return false;
    }
  }
}


export function usePrivilege(key: string): boolean {
  return PrivilegeHelper.hasAccess(key);
}

