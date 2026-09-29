import { HtmlToPdf, Template, PdfOptions, FileInfo } from '../Wrapper/Index';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
// import { AppConfig } from '../../../config/index';
/*
Handlebar Playground
http://tryhandlebarsjs.com/
*/

export const TemplateRepo: { [key: string]: string } = {
    'header': '/common/header.tpl.html',
    'header1': '/common/header1.tpl.html',
    'footer': '/common/footer.tpl.html',
    'prescription': '/emr/prescription.tpl.html',
    'admissionrequest': '/inpatient/admissionrequest/admissionrequest.tpl.html',
    'patient': '/emr/registration.tpl.html',
    'registrationlabel': '/emr/registrationlabel.tpl.html',
    'Encounter': '/inpatient/admissionrequest/admission.tpl.html',
    'admissionlabel': '/inpatient/admissionrequest/admissionlabel.tpl.html',
    'medicolegalcertificate': '/inpatient/admissionrequest/medicolegalcertificate.tpl.html',
    'PatientOrder': '/emr/patientorder.tpl.html',
    'outpatientbill': '/billing/outpatientbill.tpl.html',
    'outpatientbill1': '/billing/outpatientbill1.tpl.html',
    'thermaloutpatientbill': '/billing/thermaloutpatientbill.tpl.html',
    'pharmacybill': '/billing/pharmacybill.tpl.html',
    'pharmacycreditbill': '/billing/pharmacycreditbill.tpl.html',
    'consumerbill': '/billing/consumerbill.tpl.html',
    'pharmacysmall': '/billing/pharmacysmall.tpl.html',
    'InpatientBillDetail': '/billing/InpatientBillDetail.tpl.html',
    'InpatientBillDetail(i)': '/billing/InpatientBillDetail(i).tpl.html',
    'Inpatientbillsummary': '/billing/Inpatientbillsummary.tpl.html',
    'Inpatientbillsummary(i)': '/billing/Inpatientbillsummary(i).tpl.html',
    'breakup': '/billing/breakup.tpl.html',
    'refund': '/billing/refund.tpl.html',
    'receipt': '/billing/receipt.tpl.html',
    'creditnotes': '/billing/creditnotes.tpl.html',
    'advance': '/billing/advance.tpl.html',
    'dischargesummary': '/patientcertificate/dischargesummary.tpl.html',
    'dischargesummarywithoutheader': '/patientcertificate/dischargesummarywithoutheader.tpl.html',
    'patientestimation': '/patientestimationprint/patientestimation.tpl.html',
    'patientestimationwithoutheader': '/patientestimationprint/patientestimationwithoutheader.tpl.html',
    'cancelbill': '/billing/cancelbill.tpl.html',
    'purchaserequest': '/inventorymanagement/purchaserequest.tpl.html',
    'purchaseorder': '/inventorymanagement/purchaseorder.tpl.html',
    'purchaseorderlist': '/inventorymanagement/purchaseorderlist.tpl.html',
    'purchasereturnlist': '/inventorymanagement/purchasereturnlist.tpl.html',
    'dailybillreport': '/reports/dailybillreport.tpl.html',
    'opticaldailybillreport': '/reports/opticaldailybillreport.tpl.html',
    'collectionreport': '/reports/collectionreport.tpl.html',
    'discountreport': '/reports/discountreport.tpl.html',
    'patientlist': '/reports/patientlist.tpl.html',
    'outstandingreport': '/reports/outstandingreport.tpl.html',
    'labtatreport': '/reports/labtatreport.tpl.html',
    'labsummaryreport': '/reports/labsummaryreport.tpl.html',
    'cancelreport': '/reports/cancelreport.tpl.html',
    'refundreport': '/reports/refundreport.tpl.html',
    'usermasterreport': '/reports/usermasterreport.tpl.html',
    'Grn': '/inventorymanagement/Grn.tpl.html',
    'Grn1': '/inventorymanagement/Grnlandscape.tpl.html',
    'opticalGrn': '/inventorymanagement/opticalGrn.tpl.html',
    'stockrequest': '/inventorymanagement/stockrequest.tpl.html',
    'stockbeforetransfer': '/inventorymanagement/stockbeforetransfer.tpl.html',
    'Initialstockentry': '/inventorymanagement/Initialstockentry.tpl.html',
    'stocktransfer': '/inventorymanagement/stocktransfer.tpl.html',
    'stockacceptance': '/inventorymanagement/stockacceptance.tpl.html',
    'workorder': '/lis/workorder.tpl.html',
    'workorder1': '/lis/workorder1.tpl.html',
    'echo1': '/lis/echo1.tpl.html',
    'echo': '/lis/echo.tpl.html',
    'printercp': '/lis/printercp.tpl.html',
    'externallab': '/lis/externallab.tpl.html',
    'externallabwithoutheader': '/lis/externallabwithoutheader.tpl.html',
    'microbiology': '/lis/microbiology.tpl.html',
    'pathaology': '/lis/pathaology.tpl.html',
    'radiologylabresult': '/lis/radiologylabresult.tpl.html',
    'endoscopy': '/lis/endoscopy.tpl.html',
    'endoscopylabresults': '/lis/endoscopylabresults.tpl.html',
    'consolidatelabresult': '/lis/consolidatelabresult.tpl.html',
    'serviceworkorder': '/assetss/serviceworkorder.tpl.html',
    'opvisit': '/appointments/opvisit.tpl.html',
    'directpharmacybill': '/billing/directpharmacybill.tpl.html',
    'pharmacybillreturns': '/billing/pharmacybillreturns.tpl.html',
    'pharmacybillreturns1': '/billing/pharmacybillreturns1.tpl.html',
    'dgbilling': '/billing/dgbilling.tpl.html',
    'dgbilling1': '/billing/dgbilling1.tpl.html',
    'ipbillingpharmacy': '/billing/ipbillingpharmacy.tpl.html',
    'opbillingpharmacyforip': '/billing/opbillingpharmacyforip.tpl.html',
    'opconsolidatedprint': '/billing/opconsolidatedprint.tpl.html',
    'ippharmacy': '/billing/ippharmacy.tpl.html',
    'InpatientbillDetailsGuarantor': '/billing/InpatientbillDetailsGuarantor.tpl.html',
    'InpatientbillDetailsGuarantor(i)': '/billing/InpatientbillDetailsGuarantor(i).tpl.html',
    'InpatientbillsummaryGuarantor': '/billing/InpatientbillsummaryGuarantor.tpl.html',
    'InpatientbillsummaryGuarantor(i)': '/billing/InpatientbillsummaryGuarantor(i).tpl.html',
    'Supplementry': '/billing/Supplementry.tpl.html',
    'newborndetail': '/emr/newborndetail.tpl.html',
    'labourdetail': '/emr/labourdetail.tpl.html',
    'stockadjustment': '/inventorymanagement/stockadjustment.tpl.html',
    'patientheader': '/lis/patientheader.tpl.html',
    'dietorder': '/diet/dietorder.tpl.html',
    'kitchendiet': '/diet/kitchendiet.tpl.html',
    'ippharmacybillreturns': '/billing/ippharmacybillreturns.tpl.html',
    'doctorinvoice': '/doctorinvoice/doctorinvoice.tpl.html',
    'doctorinvoicewithvoucher': '/doctorinvoice/doctorinvoicewithvoucher.tpl.html',
    'doctorpayment': '/doctorinvoice/doctorpayment.tpl.html',
    'labbydept': '/lis/labbydept.tpl.html',
    'otregister': '/otmanagement/otregister.tpl.html',
    'otschedule': '/otmanagement/otschedule.tpl.html',
    'claimreceipt': '/claim/claimreceipt.tpl.html',
    'purchasereturn': '/inventorymanagement/purchasereturn.tpl.html',
    'admissionlabel5': '/inpatient/admissionrequest/admissionlabel5.tpl.html',
    'directpharmacyreturn': '/billing/directpharmacyreturn.tpl.html',
    'directpharmacyreturn1': '/billing/directpharmacyreturn1.tpl.html',
    'stockconsumption': '/inventorymanagement/stockconsumption.tpl.html',
    'fitnesscertificate': '/medicalfitness/fitnesscertificate.tpl.html',
    'reviewnotes': '/emr/reviewnotes.tpl.html',
    'dischargelabresult': '/emr/dischargelabresult.tpl.html',
    'reviewnotesdischargecasesheet': '/emr/reviewnotesdischargecasesheet.tpl.html',
    'reviewnotesdischargecasesheetwoh': '/emr/reviewnotesdischargecasesheetwoh.tpl.html',
    'ipcasesheet': '/emr/ipcasesheet.tpl.html',
    'Patientreturn': '/Returnworklist/Patientreturn.tpl.html',
    'patientrequest': '/Patientrequest/patientrequest.tpl.html',
    'patientreceive': '/Patientreceive/patientreceive.tpl.html',
    'dispenseworklist': '/medicaldispense/dispenseworklist.tpl.html',
    'ventilatorchart': '/criticalchart/ventilatorchart.tpl.html',
    'ventilatorchartwithoutheader': '/criticalchart/ventilatorchartwithoutheader.tpl.html',
    'dialysischart': '/criticalchart/dialysischart.tpl.html',
    'dialysischartwithoutheader': '/criticalchart/dialysischartwithoutheader.tpl.html',
    'intakeoutput': '/patientintakeoutput/intakeoutput.tpl.html',
    'monitorchart': '/patientmonitorchart/monitorchart.tpl.html',
    'monitorchartwithoutheader': '/patientmonitorchart/monitorchartwithoutheader.tpl.html',
    'patientidcard': '/emr/patientidcard.tpl.html',
    'patientcardprint': '/emr/patientcardprint.tpl.html',
    'otbillingpharmacy': '/billing/otbillingpharmacy.tpl.html',
    'bpcharts': '/patientbpchart/bpcharts.tpl.html',
    'bpchartswithoutheader': '/patientbpchart/bpchartswithoutheader.tpl.html',
    'positionbpchart': '/positionbpchart/positionbpchart.tpl.html',
    'positionbpchartwithoutheader': '/positionbpchart/positionbpchartwithoutheader.tpl.html',
    'cdchart': '/cdchart/cdchart.tpl.html',
    'cdchartwithoutheader': '/cdchart/cdchartwithoutheader.tpl.html',
    'diabetchart': '/patientdiabetchart/diabetchart.tpl.html',
    'diabetchartwithoutheader': '/patientdiabetchart/diabetchartwithoutheader.tpl.html',
    'bankstatement': '/billing/bankstatement.tpl.html',
    'cashsubmission': '/billing/cashsubmission.tpl.html',
    'abgchart': '/criticalchart/abgchart.tpl.html',
    'abgchartwithoutheader': '/criticalchart/abgchartwithoutheader.tpl.html',
    'timesheet': '/hrm/timesheet.tpl.html',
    'hrmemployeesalarys': '/hrm/hrmemployeesalarys.tpl.html',
    'dailynotes': '/criticalchart/dailynotes.tpl.html',
    'intakeoutputchart': '/criticalchart/intakeoutputchart.tpl.html',
    'intakeoutputchartwithoutheader': '/criticalchart/intakeoutputchartwithoutheader.tpl.html',
    'vitalchart': '/criticalchart/vitalchart.tpl.html',
    'vitalchartwithoutheader': '/criticalchart/vitalchartwithoutheader.tpl.html',
    'expensedetails': '/hrm/expensedetails.tpl.html',
    'dailywisebreakup': '/billing/dailywisebreakup.tpl.html',
    'physiotheraphy': '/emr/physiotheraphy.tpl.html',
    'nosoinfection': '/infectioncontroll/nosoinfection.tpl.html',
    'consolidatelabresultwithoutheader': '/lis/consolidatelabresultwithoutheader.tpl.html',
    'reviewnoteswithoutheader': '/emr/reviewnoteswithoutheader.tpl.html',
    'outpatientbillwithoutheader': '/billing/outpatientbillwithoutheader.tpl.html',
    'outpatientcreditbill': '/billing/outpatientcreditbill.tpl.html',
    'pharmacybilldetail': '/billing/pharmacybilldetail.tpl.html',
    'facilitydashboard': '/emr/facilitydashboard.tpl.html',
    'lensprescription': '/emr/lensprescription.tpl.html',
    'inpatientpackagebillsummary(i)': '/billing/inpatientpackagebillsummary(i).tpl.html',
    'inpatientpackagebillsummary': '/billing/inpatientpackagebillsummary.tpl.html',
    'InpatientpackagebillsummaryGuarantor': '/billing/InpatientpackagebillsummaryGuarantor.tpl.html',
    'InpatientpackagebillsummaryGuarantor(i)': '/billing/InpatientpackagebillsummaryGuarantor(i).tpl.html',
    'ortho': '/emr/ortho.tpl.html',
    'generalexpense': '/billing/generalexpense.tpl.html',
    'generalexpenselist': '/reports/generalexpenselist.tpl.html',
    'ipdiscountreport': '/reports/ipdiscountreport.tpl.html',
    'ipinsurancereport': '/reports/ipinsurancereport.tpl.html',
    'ipduereport': '/reports/ipduereport.tpl.html',
    'inpatientpackagedetails': '/billing/inpatientpackagedetails.tpl.html',
    'inpatientpackagedetails(i)': '/billing/inpatientpackagedetails(i).tpl.html',
    'inpatientpackagedetailsGuarantor': '/billing/inpatientpackagedetailsGuarantor.tpl.html',
    'inpatientpackagedetailsGuarantor(i)': '/billing/inpatientpackagedetailsGuarantor(i).tpl.html',
    'inpatientinclusionpackagedetails': '/billing/inpatientinclusionpackagedetails.tpl.html',
    'pharmacycontactlensbill': '/billing/pharmacycontactlensbill.tpl.html',
    'otdocuments': '/otmanagement/otdocuments.tpl.html',
    'consolidateradiologyresult': '/lis/consolidateradiologyresult.tpl.html',
    'patientworksheet': '/lis/patientworksheet.tpl.html',
    'dgbillingwithoutheader': '/billing/dgbillingwithoutheader.tpl.html',
    'regprintform': '/emr/registrationrequestform.tpl.html',
    'invworkorder': '/inventorymanagement/invworkorder.tpl.html',
    'invworkorderwithoutheader': '/inventorymanagement/invworkorderwithoutheader.tpl.html',
    'wagesservicesbill': '/inventorymanagement/wagesservicesbill.tpl.html',
    'lhrcvoucher': '/billing/lhrcvoucher.tpl.html',
    'customerbill': '/billing/customerbill.tpl.html',
    'customersmall': '/billing/customersmall.tpl.html',
    'patientconsent': '/inpatient/admissionrequest/patientconsent.tpl.html',
    'dischargeslip': '/inpatient/admissionrequest/dischargeslip.tpl.html',
    'pharmacyconsolidatebilldetails': '/billing/pharmacyconsolidatebilldetails.tpl.html',
    'allpharmacyconsolidatebilldetails': '/billing/allpharmacyconsolidatebilldetails.tpl.html',
    'pharmacyconsolidateopbilldetails': '/billing/pharmacyconsolidateopbilldetails.tpl.html',
    'pharmacyconsolidateallbilldetails': '/billing/pharmacyconsolidateallbilldetails.tpl.html',
    'pharmacyconsolidatebillprint': '/billing/pharmacyconsolidatebillprint.tpl.html',
    'vendorpayment': '/vendorpayment/vendorpayment.tpl.html',
    'purchaseorderreport': '/reports/purchaseorderreport.tpl.html',
    'grnreport': '/reports/grnreport.tpl.html',
    'pendingporeport': '/reports/pendingporeport.tpl.html',
    'stockissuevocherreport': '/reports/stockissuevocherreport.tpl.html',
    'stocktransistreport': '/reports/stocktransistreport.tpl.html',
    'stockindentreport': '/reports/stockindentreport.tpl.html',
    'medicineexpiryreport': '/reports/medicineexpiryreport.tpl.html',
    'medicineexpiredreport': '/reports/medicineexpiredreport.tpl.html',
    'pharmacystockreport': '/reports/pharmacystockreport.tpl.html',
    'pharmacybilldetailreport': '/reports/pharmacybilldetailreport.tpl.html',
    'pharmacydiscountreport': '/reports/pharmacydiscountreport.tpl.html',
    'pharmacyduereport': '/reports/pharmacyduereport.tpl.html',
    'pharmacyreturnreport': '/reports/pharmacyreturnreport.tpl.html',
    'pharmacyschedulereport': '/reports/pharmacyschedulereport.tpl.html',
    'pharmacyschedulexreport': '/reports/pharmacyschedulexreport.tpl.html',
    'pharmacycardcollectionreport': '/reports/pharmacycardcollectionreport.tpl.html',
    'pharmacycollectionreport': '/reports/pharmacycollectionreport.tpl.html',
    'pharmacyrefundreport': '/reports/pharmacyrefundreport.tpl.html',
    'vendorpaymentreport': '/reports/vendorpaymentreport.tpl.html',
    'vendorpendingpaymentreport': '/reports/vendorpendingpaymentreport.tpl.html',
    'itemmasterreport': '/reports/itemmasterreport.tpl.html',
    'suppliermasterreport': '/reports/suppliermasterreport.tpl.html',
    'storemasterreport': '/reports/storemasterreport.tpl.html',
    'stockmovementreport': '/reports/stockmovementreport.tpl.html',
    'purchasereturnreport': '/reports/purchasereturnreport.tpl.html',
    'ipadmissionreport': '/reports/ipadmissionreport.tpl.html',
    'ipdischargereport': '/reports/ipdischargereport.tpl.html',
    'deseasedpatientreport': '/reports/deseasedpatientreport.tpl.html',
    'bedtransferreport': '/reports/bedtransferreport.tpl.html',
    'outpatientreport': '/reports/outpatientreport.tpl.html',
    'ipadmissioninsurancereport': '/reports/ipadmissioninsurancereport.tpl.html',
    'doctorlistreport': '/reports/doctorlistreport.tpl.html',
    'insurancelistreport': '/reports/insurancelistreport.tpl.html',
    'ippatientreferralreport': '/reports/ippatientreferralreport.tpl.html',
    'oppatientreferralreport': '/reports/oppatientreferralreport.tpl.html',
    'opbillreport': '/reports/opbillreport.tpl.html',
    'directbillreport': '/reports/directbillreport.tpl.html',
    'ipbillreport': '/reports/ipbillreport.tpl.html',
    'currentoccupancyreport': '/reports/currentoccupancyreport.tpl.html',
    'ipoccupancyreportwithadvance': '/reports/ipoccupancyreportwithadvance.tpl.html',
    'iprefundreport': '/reports/iprefundreport.tpl.html',
    'ipcancelreport': '/reports/ipcancelreport.tpl.html',
    'collectionsummaryopipreport': '/reports/collectionsummaryopipreport.tpl.html',
    'revenuesummarycategoryreport': '/reports/revenuesummarycategoryreport.tpl.html',
    'doctorinvoicereport': '/reports/doctorinvoicereport.tpl.html',
    'doctorpaymentreport': '/reports/doctorpaymentreport.tpl.html',
    'outstandingpaymentreport': '/reports/outstandingpaymentreport.tpl.html',
    'collectiondetailcashierreport': '/reports/collectiondetailcashierreport.tpl.html',
    'ipcollectiondetailcashierreport': '/reports/ipcollectiondetailcashierreport.tpl.html',
    'revenuesummarydoctorreport': '/reports/revenuesummarydoctorreport.tpl.html',
    'servicegroups': '/reports/servicegroups.tpl.html',
    'packagedetailsreport': '/reports/packagedetailsreport.tpl.html',
    'itempricedetailsreport': '/reports/itempricedetailsreport.tpl.html',
    'ippharmacyissuevoucherreport': '/reports/ippharmacyissuevoucherreport.tpl.html',
    'patientmedicineindentreport': '/reports/medicineindent/patientmedicineindentreport.tpl.html',
    'patientindentpendingreport': '/reports/medicineindent/patientindentpendingreport.tpl.html',
    'patientipdispensedreport': '/reports/medicineindent/patientipdispensedreport.tpl.html',
    'patientipdispensedetailsreport': '/reports/medicineindent/patientipdispensedetailsreport.tpl.html',
    'ippharmacyreturnvoucherreport': '/reports/ippharmacyreturnvoucherreport.tpl.html',
    'wardandbedlistreport': '/reports/wardandbedlistreport.tpl.html',
    'doctorrevenuereport': '/reports/doctorrevenuereport.tpl.html',
    'stockstatusreport': '/reports/stockstatusreport.tpl.html',
    'stockstatusgeneralreport': '/reports/stockstatusgeneralreport.tpl.html',
    'pharmacycollectionsummaryreport': '/reports/pharmacycollectionsummaryreport.tpl.html',
    'stockstatusbatchreport': '/reports/stockstatusbatchreport.tpl.html',
    'stockstatusbatchgeneralreport': '/reports/stockstatusbatchgeneralreport.tpl.html',
    'stocknonmovementreport': '/reports/stocknonmovementreport.tpl.html',
    'availablebedreport': '/reports/availablebedreport.tpl.html',
    'opserviceitemreport': '/reports/opserviceitemreport.tpl.html',
    'ipserviceitemreport': '/reports/ipserviceitemreport.tpl.html',
    'serviceitemreport': 'reports/serviceitemreport.tpl.html',
    'bedoccupancyhistory': 'reports/bedoccupancyhistory.tpl.html',
    'doctorinvoicetdsreport': 'reports/doctorinvoicetdsreport.tpl.html',
    'inactivepatientlist': 'reports/inactivepatientlist.tpl.html',
    'revenuesummarydeptreport': 'reports/revenuesummarydeptreport.tpl.html',
    'itemwisecollectionsummaryipreport': 'reports/itemwisecollectionsummaryipreport.tpl.html',
    'otschedulereport': 'reports/otschedulereport.tpl.html',
    'surgeryentryreport': 'reports/surgeryentryreport.tpl.html',
    'ipoccupancybyward': 'reports/ipoccupancybyward.tpl.html',
    'revenuesummarydepartmentreport': 'reports/revenuesummarydepartmentreport.tpl.html',
    'staffbill': '/billing/staffbill.tpl.html',
    'outpatientsummary': 'reports/outpatientsummary.tpl.html',
    'pharmacyreturnreportforotc': 'reports/pharmacyreturnreportforotc.tpl.html',
    'rackdetailsbystorereport': 'reports/rackdetailsbystorereport.tpl.html',
    'itemreorderlistreport': 'reports/itemreorderlistreport.tpl.html',
    'producttypereport': 'reports/producttypereport.tpl.html',
    'pharmacycollectionsummarybycashier': 'reports/pharmacycollectionsummarybycashier.tpl.html',
    'genericmasterreport': 'reports/genericmasterreport.tpl.html',
    'manufacturermasterreport': 'reports/manufacturermasterreport.tpl.html',
    'opipcollectionsummarybycashier': 'reports/opipcollectionsummarybycashier.tpl.html',
    'opcollectionsummarybycashier': 'reports/opcollectionsummarybycashier.tpl.html',
    'ipcollectionsummarybycashier': 'reports/ipcollectionsummarybycashier.tpl.html',
    'grnreportbyitem': 'reports/grnreportbyitem.tpl.html',
    'stockadjustmentreport': 'reports/stockadjustmentreport.tpl.html',
    'stockconsumptionreport': 'reports/stockconsumptionreport.tpl.html',
    'itemwisecollectionsummaryopreport': 'reports/itemwisecollectionsummaryopreport.tpl.html',
    'overallcollectionsummary': 'reports/overallcollectionsummary.tpl.html',
    'staffcreditbillreport': 'reports/staffcreditbillreport.tpl.html',
    'staffpendingpaymentreport': 'reports/staffpendingpaymentreport.tpl.html',
    'staffcreditreturnreport': 'reports/staffcreditreturnreport.tpl.html',
    'overallcollectioncashier': 'reports/overallcollectioncashier.tpl.html',
    'userwisecollectionsummary': 'reports/userwisecollectionsummary.tpl.html',
    'stockstatusproductsummaryreport': 'reports/stockstatusproductsummaryreport.tpl.html',
    'insurancecreditsummary': 'reports/insurancecreditsummary.tpl.html',
    'staffcreditsummary': 'reports/staffcreditsummary.tpl.html',
    'labdetailreport': 'reports/labdetailreport.tpl.html',
    'radiologydetailreport': 'reports/radiologydetailreport.tpl.html',
    'radiologyrevenuereport': 'reports/radiologyrevenuereport.tpl.html',
    'labrevenuereport': 'reports/labrevenuereport.tpl.html',
    'Radtatreport': 'reports/Radtatreport.tpl.html',
    'orderstatisticspathologistreport': 'reports/orderstatisticspathologistreport.tpl.html',
    'orderstatisticsradiologistreport': 'reports/orderstatisticsradiologistreport.tpl.html',
    'labsummarybytest': 'reports/labsummarybytest.tpl.html',
    'radiologysummarybytest': 'reports/radiologysummarybytest.tpl.html',
    'labsummarybysample': 'reports/labsummarybysample.tpl.html',
    'labstatisticssummaryreport': 'reports/labstatisticssummaryreport.tpl.html',
    'radiologystatisticssummaryreport': 'reports/radiologystatisticssummaryreport.tpl.html',
    'salesgstreport': 'reports/salesgstreport.tpl.html',
    'returngstreport': 'reports/returngstreport.tpl.html',
    'purchasesalesgstreport': 'reports/purchasesalesgstreport.tpl.html',
    'purchasereturngstreport': 'reports/purchasereturngstreport.tpl.html',
    'consolidatesalesgstreport': 'reports/consolidatesalesgstreport.tpl.html',
    'consolidatepurchasegstreport': 'reports/consolidatepurchasegstreport.tpl.html',
    'invoicesummarybysupplier': 'reports/invoicesummarybysupplier.tpl.html',
    'pendingpaymentsummarybysupplier': 'reports/pendingpaymentsummarybysupplier.tpl.html',
    'ipadmissionsummarybydoctor': 'reports/ipadmissionsummarybydoctor.tpl.html',
    'outpatientsummarybydoctor': 'reports/outpatientsummarybydoctor.tpl.html',
    'ipadmissionsummarybyinsurance': 'reports/ipadmissionsummarybyinsurance.tpl.html',
    'outpatientsummarybyinsurance': 'reports/outpatientsummarybyinsurance.tpl.html',
    'stocksummaryproductgstreport': 'reports/stocksummaryproductgstreport.tpl.html',
    'insuranceoutstandingsummary': 'reports/insuranceoutstandingsummary.tpl.html',
    'departmentlistreport': 'reports/departmentlistreport.tpl.html',
    'diagnosissummaryforippatient': 'reports/diagnosissummaryforippatient.tpl.html',
    'revenuesummarybyserviceitem': 'reports/revenuesummarybyserviceitem.tpl.html',
    'pharmacyduecollectionreport': 'reports/pharmacyduecollectionreport.tpl.html',
    'opduecollectreport': 'reports/opduecollectreport.tpl.html',
    'ipduecollectreport': 'reports/ipduecollectreport.tpl.html',
    'consolidateinputgstsummary': 'reports/consolidateinputgstsummary.tpl.html',
    'consolidateoutputgstsummary': 'reports/consolidateoutputgstsummary.tpl.html',
    'overallconsolidategst': 'reports/overallconsolidategst.tpl.html',
    'vendoroutstandingreport': 'reports/vendoroutstandingreport.tpl.html',
    'pharmacycollectionallcashier': 'reports/pharmacycollectionallcashier.tpl.html',
    'patientlistbydiagnosis': 'reports/patientlistbydiagnosis.tpl.html',
    'itemwantedlist': 'reports/itemwantedlist.tpl.html',
    'openingstockentryreport': 'reports/openingstockentryreport.tpl.html',
    'insurancereceiptreport': 'reports/insurancereceiptreport.tpl.html',
    'insurancepaymentdetailswithpatient': 'reports/insurancepaymentdetailswithpatient.tpl.html',
    'insurancetdsreport': 'reports/insurancetdsreport.tpl.html',
    'insurancedisallowancereport': 'reports/insurancedisallowancereport.tpl.html',
    'itemwisesalesprofitreport': 'reports/itemwisesalesprofitreport.tpl.html',
    'dailystockmovementreport': 'reports/dailystockmovementreport.tpl.html',
    'dailypurchasesummary': 'reports/dailypurchasesummary.tpl.html',
    'surgerysummarybyprocedure': 'reports/surgerysummarybyprocedure.tpl.html',
    'surgerysummarybysurgeon': 'reports/surgerysummarybysurgeon.tpl.html',
    'surgerysummarybyanaesthesist': 'reports/surgerysummarybyanaesthesist.tpl.html',
    'dailysalessummarybyitem': 'reports/dailysalessummarybyitem.tpl.html',
    'consolidategstreportfordeepam': 'reports/consolidategstreportfordeepam.tpl.html',
    'covidstatisticsreport': '/reports/covidreport/covidstatisticsreport.tpl.html',
    'advancefunddetailsreport': '/reports/advancefundreport/advancefunddetailsreport.tpl.html',
    'patientfundadjustmentreport': '/reports/advancefundreport/patientfundadjustmentreport.tpl.html',
    'referraldoctorlistreport': '/reports/referraldoctorlistreport.tpl.html',
    'itemrolsetupreport': 'reports/itemrolsetupreport.tpl.html',
    'ipstatisticsreport': 'reports/ipstatisticsreport.tpl.html',
    'assetdetailreport': '/reports/assetreports/assetdetailreport.tpl.html',
    'assetwarrantyexpiredreport': '/reports/assetreports/assetwarrantyexpiredreport.tpl.html',
    'assetmaintenancereport': '/reports/assetreports/assetmaintenancereport.tpl.html',
    'assetinsurancereport': '/reports/assetreports/assetinsurancereport.tpl.html',
    'assettransferdetailreport': '/reports/assetreports/assettransferdetailreport.tpl.html',
    'assetmovementreport': '/reports/assetreports/assetmovementreport.tpl.html',
    'assetaccessoriesreport': '/reports/assetreports/assetaccessoriesreport.tpl.html',
    'assetauditreport': '/reports/assetreports/assetauditreport.tpl.html',
    'assetreconcilereport': '/reports/assetreports/assetreconcilereport.tpl.html',
    'assetgatepassreport': '/reports/assetreports/assetgatepassreport.tpl.html',
    'newassetrequestreport': '/reports/assetreports/newassetrequestreport.tpl.html',
    'assetsummarybydepartmentreport': '/reports/assetreports/assetsummarybydepartmentreport.tpl.html',
    'assetwarrantyexpiryreport': '/reports/assetreports/assetwarrantyexpiryreport.tpl.html',
    'insuranceagingreport': '/reports/insurancereports/insuranceagingreport.tpl.html',
    'mlcpatientlistreport': '/reports/inpatient/mlcpatientlistreport.tpl.html',
    'dailywiseipstatisticsreport': '/reports/inpatient/dailywiseipstatisticsreport.tpl.html',
    'equipmentusage': '/emr/equipmentusage.tpl.html',
    'patientdispensereturn': '/returndispense/patientdispensereturn.tpl.html',
    'pendingprescriptionreport': '/reports/pharmacy/pendingprescriptionreport.tpl.html',
    'appointmentschedulereport': '/reports/appointmentreport/appointmentschedulereport.tpl.html',
    'appointmentreschedulereport': '/reports/appointmentreport/appointmentreschedulereport.tpl.html',
    'appointmentcancelledreport': '/reports/appointmentreport/appointmentcancelledreport.tpl.html',
    'appointmentpatientfromappreport': '/reports/appointmentreport/appointmentpatientfromappreport.tpl.html',
    'videoconsultationpatientlist': '/reports/appointmentreport/videoconsultationpatientlist.tpl.html',
    'ipstatisticsbyward': 'reports/ipstatisticsbyward.tpl.html',
    'departmentwisestatisticsreport': 'reports/departmentwisestatisticsreport.tpl.html',
    'referraldoctorrevenuedetailsreport': 'reports/referraldoctorrevenuedetailsreport.tpl.html',
    'notifyincompletefilereport': 'reports/mrdreports/notifyincompletefilereport.tpl.html',
    'mrdfilesubmitdetailsreport': 'reports/mrdreports/mrdfilesubmitdetailsreport.tpl.html',
    'dailysalesandrevenuedetails': 'reports/dietreports/dailysalesandrevenuedetails.tpl.html',
    'monthlysalesandrevenuedetails': 'reports/dietreports/monthlysalesandrevenuedetails.tpl.html',
    'labredoreport': 'reports/labredoreport.tpl.html',
    'irdsalereport': 'reports/irdreport/irdsalereport.tpl.html',
    'doctorsharereferperformdetailsreport': '/reports/doctorsharereferperformdetailsreport.tpl.html',
    'doctorsharesummaryreport': '/reports/doctorsharesummaryreport.tpl.html',
    'dailywisedoctorsharesummaryreport': '/reports/dailywisedoctorsharesummaryreport.tpl.html',
    'drshareitemwisecollectionsummaryop': 'reports/doctorshare/drshareitemwisecollectionsummaryop.tpl.html',
    'drshareitemwisecollectionsummaryip': 'reports/doctorshare/drshareitemwisecollectionsummaryip.tpl.html',
    'drsharerevenuesummarydepartment': 'reports/doctorshare/drsharerevenuesummarydepartment.tpl.html',
    'drsharerevenuesummarydoctor': 'reports/doctorshare/drsharerevenuesummarydoctor.tpl.html',
    'drsharerevenuesummarybycategory': 'reports/doctorshare/drsharerevenuesummarybycategory.tpl.html',
    'claimcoveringletter': '/claim/claimcoveringletter.tpl.html',
    'purchaseorderdetailreport': '/reports/purchaseorderdetailreport.tpl.html',
    'pharmacybill1': '/billing/pharmacybill1.tpl.html',
    'directpharmacybill1': '/billing/directpharmacybill1.tpl.html',
    'sickleaveform': '/emr/sickleaveform.tpl.html',
    'medicialcertificate': '/emr/medicialcertificate.tpl.html',
    'externallabslip': '/lis/externallabslip.tpl.html',
    'daycarereport': '/reports/daycarereport.tpl.html',
    'mlcreport': '/reports/mlcreport.tpl.html',
    'emergencypatientreport': '/reports/emergencypatientreport.tpl.html',
    'daycaretoadmissionpatientreport': '/reports/daycaretoadmissionpatientreport.tpl.html',
    'ipcasesheetsummary': '/emr/ipcasesheetsummary.tpl.html',
    'feedbacksummaryforopreport': '/reports/feedbackreport/feedbacksummaryforopreport.tpl.html',
    'feedbacksummaryforipreport': '/reports/feedbackreport/feedbacksummaryforipreport.tpl.html',
    'admissionhistory': '/ipforms/admissionhistory.tpl.html',
    'anaesthesiarecord': '/ipforms/anaesthesiarecord.tpl.html',
    'anestheticchecklist': '/ipforms/anestheticchecklist.tpl.html',
    'bloodrequisition': '/ipforms/bloodrequisition.tpl.html',
    'checklistfordischargeofpatient': '/ipforms/checklistfordischargeofpatient.tpl.html',
    'clinicalchart': '/ipforms/clinicalchart.tpl.html',
    'consentforanesthesia': '/ipforms/consentforanesthesia.tpl.html',
    'consentform': '/ipforms/consentform.tpl.html',
    'consentforsurgical': '/ipforms/consentforsurgical.tpl.html',
    'consultingpage': '/ipforms/consultingpage.tpl.html',
    'ctscanrequisition': '/ipforms/ctscanrequisition.tpl.html',
    'd&cnotes': '/ipforms/d&cnotes.tpl.html',
    'dailyorderform': '/ipforms/dailyorderform.tpl.html',
    'dischargeagainstmedicaladvice': '/ipforms/dischargeagainstmedicaladvice.tpl.html',
    'doctorvisitchargesheet': '/ipforms/doctorvisitchargesheet.tpl.html',
    'intraoperativemonitoring': '/ipforms/intraoperativemonitoring.tpl.html',
    'medicationsheet': '/ipforms/medicationsheet.tpl.html',
    'patientdata': '/ipforms/patientdata.tpl.html',
    'dischargeclearance': '/ipforms/dischargeclearance.tpl.html',
    'icuinitialassessment': '/ipforms/icuinitialassessment.tpl.html',
    'informedconsent': '/ipforms/informedconsent.tpl.html',
    'patientregistration': '/ipforms/patientregistration.tpl.html',
    'pdf1': '/ipforms/pdf1.tpl.html',
    'pdf2': '/ipforms/pdf2.tpl.html',
    'consentadmission': '/ipforms/consentadmission.tpl.html',
    'histopathology': '/lis/histopathology.tpl.html',
    'pharmacysalesandreturndetails': '/billing/pharmacysalesandreturndetails.tpl.html',
    'corporatecoveringletter': '/claim/corporatecoveringletter.tpl.html',
    'opcoveringletter': '/claim/opcoveringletter.tpl.html',
    'tpacoveringletter': '/claim/tpacoveringletter.tpl.html',
    'claimsubmissions': '/claim/claimsubmissions.tpl.html',
    'consignmentinvoice': '/consignment/consignmentinvoice.tpl.html',
    'consignmentgrn': '/consignment/consignmentgrn.tpl.html',
    'consignmentpurchase': '/consignment/consignmentpurchase.tpl.html',
    'consignmentbilling': '/consignment/consignmentbilling.tpl.html',
    'InpatientBillDetailxl(i)': '/billing/InpatientBillDetailxl(i).tpl.html',
    'InpatientBillDetailxl': '/billing/InpatientBillDetailxl.tpl.html',
    'breakupxl': '/billing/breakupxl.tpl.html',
    'inpatientfullpackagedetails': '/billing/inpatientfullpackagedetails.tpl.html',
    'Inpatientbillfullsummary': '/billing/Inpatientbillfullsummary.tpl.html',
    'Inpatientbillsummaryph': '/billing/Inpatientbillsummaryph.tpl.html',
    'InpatientBillDetailph': '/billing/InpatientBillDetailph.tpl.html',
    'previousopvisit': '/appointments/previousopvisit.tpl.html',
};

export class Report {
    public static GetDefaultPdfOption(): PdfOptions {
        return {
            format: 'A4',
            orientation: 'portrait',
            border: '0',
            header: {
                height: '1.5in',
                contents: '',
            },
            footer: {
                height: '0.5in',
                contents: {
                    first: '',
                    default: '',
                    last: '',
                },
            },
            type: 'pdf',
            base: 'file://' + join(__dirname, '/../../Templates/assets/')
        };
    }
    public static GetCompileOptions(): CompileOptions {
        return {};
    }

    public static async Generate(key: string,
        data: { header: any, body: any, watermark?: string },
        compileOptions?: CompileOptions,
        pdfOption?: PdfOptions): Promise<FileInfo> {

        data = data || { header: {}, body: {}, watermark: '' };
        data.body.watermark = data.watermark || '';
        compileOptions = compileOptions || Report.GetCompileOptions();
        pdfOption = pdfOption || Report.GetDefaultPdfOption();
        let bodyTemplate = Report.GetCompiledTemplate(key, data.body, compileOptions);
        return await HtmlToPdf.CreatePdf(bodyTemplate, pdfOption);
        // let fileName = AppConfig.WEB_UI_PATH + '/DOCS/' + 'sample' + '.pdf';
        // return await HtmlToPdf.CreatePdfFile(bodyTemplate, pdfOption, fileName);
    }

    public static async GeneratePdf(key: string,
        data: { header: any, body: any, watermark?: string }, filename: string,
        compileOptions?: CompileOptions,
        pdfOption?: PdfOptions): Promise<FileInfo> {

        data = data || { header: {}, body: {}, watermark: '' };
        data.body.watermark = data.watermark || '';
        compileOptions = compileOptions || Report.GetCompileOptions();
        pdfOption = pdfOption || Report.GetDefaultPdfOption();
        let bodyTemplate = Report.GetCompiledTemplate(key, data.body, compileOptions);
        // return await HtmlToPdf.CreatePdf(bodyTemplate, pdfOption);
        let fileName = process.cwd() + '/ui/docs/' + filename;
        return await HtmlToPdf.CreatePdfFile(bodyTemplate, pdfOption, fileName);
    }

    public static GenerateHtml(key: string,
        data: { header: any, body: any, watermark?: string },
        compileOptions?: CompileOptions,
        pdfOption?: PdfOptions): string {

        data = data || { header: {}, body: {}, watermark: '' };
        data.body.watermark = data.watermark || '';
        compileOptions = compileOptions || Report.GetCompileOptions();
        let bodyTemplate = Report.GetCompiledTemplate(key, data.body, compileOptions);
        return bodyTemplate;
    }

    public static GetPdfOption(key: string): string {
        let filePartialPath = TemplateRepo[key];
        let re = /tpl.html/gi;
        filePartialPath = filePartialPath.replace(re, 'json');
        // console.log('json file path');
        // console.log(filePartialPath);

        let clientCode = process.env.CLIENT_CODE || 'pkv';
        let path = join(__dirname, '/../../Templates/', clientCode, filePartialPath);
        if (!existsSync(path)) {
            path = join(__dirname, '/../../Templates/', 'pkv', filePartialPath);
        }
        if (!existsSync(path)) {
            return null;
        }
        let jsonFile = readFileSync(path, 'utf-8');
        console.log('jsonFile');
        console.log(jsonFile);
        return jsonFile;
    }
    public static GetPdfOptionWoh(key: string): string {
        let filePartialPath = TemplateRepo[key];
        console.log(filePartialPath, 'json file pathsss');
        let re = /tpl.html/gi;
        filePartialPath = filePartialPath.replace(re, 'woh.json');
        console.log(filePartialPath, 'json file name');
        // console.log('json file path');
        // console.log(filePartialPath);

        let clientCode = process.env.CLIENT_CODE || 'pkv';
        let path = join(__dirname, '/../../Templates/', clientCode, filePartialPath);
        if (!existsSync(path)) {
            path = join(__dirname, '/../../Templates/', 'pkv', filePartialPath);
        }
        if (!existsSync(path)) {
            return null;
        }
        let jsonFile = readFileSync(path, 'utf-8');
        console.log('jsonFile');
        console.log(jsonFile);
        return jsonFile;
    }

    private static GetCompiledTemplate(key: string, data: any, compileOptions?: CompileOptions): string {
        let filePartialPath = TemplateRepo[key];
        let clientCode = process.env.CLIENT_CODE || 'pkv';
        let path = join(__dirname, '/../../Templates/', clientCode, filePartialPath);
        if (!existsSync(path)) {
            path = join(__dirname, '/../../Templates/', 'pkv', filePartialPath);
        }
        if (!existsSync(path)) {
            throw new Error(`Template path is not configured for given key '` + key + `' = ` + path);
        }
        let template = readFileSync(path, 'utf-8');
        return Template.Compile(template, { data: data }, compileOptions);
    }
}

//var fileinfo = Report.Generate('printkey', { name: 'Test', place: 'Chennai' });
