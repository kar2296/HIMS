import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions, Report, FileInfo, Template } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest } from '../../../Common/Index';
import { PatientPaymentDetailsInstance, PatientPaymentDetailsAttributes } from '../Model/Interface/Index';
import { SequenceKeys } from '../../General/Common/Sequence.s';
// import {
//     PatientPaymentDetailsFilters, PatientBillsFilters,
//     PatientDoctorShareDetailsFilters
// } from '../Common/Filters.e';
import {
    PatientPaymentDetailsFilters,
    PatientDoctorShareDetailsFilters
} from '../Common/Filters.e';
import { EncounterFilters } from '../../Visit/Common/Filters.e';
import { PatientRefundFilters } from '../../Billing/Common/Filters.e';
import { BoFactory } from '../../Base/Business/Index';
import * as regbo from '../../Registration/Business/Index';
import * as userbo from '../../SystemSettings/Business/Index';
import { join } from 'path';
import * as generalBO from '../../General/Business/Index';
import * as billingbo from '../../Billing/Business/Index';
import * as doctorinvoicebo from '../../DoctorInvoice/Business/Index';
import * as orderbo from '../../EMR/Business/Index';
import * as encbo from '../../Visit/Business/Index';
import * as _ from 'lodash';
import * as moment from 'moment';
import { NotificationService } from '../../../Notification/OneSignalNotification';
import { ReferenceValueFilters } from '../../SystemSettings/Common/Filters.e';
import * as generalMasterBo from '../../GeneralMaster/Business/Index';
// import { Transaction } from 'sequelize'; // Make sure you import this

export class PatientPaymentDetailsBo extends BaseBo<PatientPaymentDetailsInstance, PatientPaymentDetailsAttributes> {
    // public async AddPatientPaymentDetails(req: BaseRequest): Promise<number> {
    //     let generateReceiptNr = 0;
    //     if (!req.Data.ReceiptNumber && req.Data.ReceiptStatusId === 1) {
    //         generateReceiptNr = 1;
    //         req.Data.ReceiptNumber = null; //await Sequence.Next(SequenceKeys.ReceiptNrId);
    //         req.Data.ReceiptDateTime = new Date();
    //     }
    //     if (req.Data.PatientBillId && req.Data.PatientBillId > 0 && req.Data.ReceiptStatusId !== 2) {
    //         let billBO = BoFactory.GetBo(billingbo.PatientBillsBo, this.Request);
    //         let PatientBill = await billBO.GetPatientBillsById({ Id: req.Data.PatientBillId });
    //         let totalReceivedAmount: number = 0;
    //         PatientBill.PaidAmount = PatientBill.PaidAmount !== null ? PatientBill.PaidAmount : 0;
    //         PatientBill.TDSAmount = PatientBill.TDSAmount !== null ? PatientBill.TDSAmount : 0;
    //         PatientBill.Disallowed = PatientBill.Disallowed !== null ? PatientBill.Disallowed : 0;
    //         if (PatientBill.OutStandingAmount !== 0) {
    //             totalReceivedAmount = parseFloat(req.Data.AmountPaid.toString())
    //                 + parseFloat(req.Data.TDSAmount.toString()) + parseFloat(req.Data.AgreementDiscountAmt.toString())
    //                 + parseFloat(req.Data.Disallowance.toString());
    //             PatientBill.OutStandingAmount = parseFloat(PatientBill.OutStandingAmount.toString())
    //                 - parseFloat(totalReceivedAmount.toString());
    //             PatientBill.PaidAmount = parseFloat(PatientBill.PaidAmount.toString())
    //                 + parseFloat(req.Data.AmountPaid.toString());
    //             PatientBill.IsPaidFully = PatientBill.OutStandingAmount === 0;
    //             if (PatientBill.OutStandingAmount === 0) {
    //                 PatientBill.IsPaidFully = true;
    //             }
    //         } else {
    //             PatientBill.IsPaidFully = true;
    //         }
    //         if (PatientBill.TDSAmount >= 0) {
    //             PatientBill.TDSAmount = parseFloat(PatientBill.TDSAmount.toString())
    //                 + parseFloat(req.Data.TDSAmount.toString());
    //         }
    //         if (PatientBill.Disallowed >= 0) {
    //             PatientBill.Disallowed = parseFloat(PatientBill.Disallowed.toString())
    //                 + parseFloat(req.Data.Disallowance.toString());
    //         }
    //         if (PatientBill.AgreementDiscountAmt >= 0) {
    //             PatientBill.AgreementDiscountAmt = parseFloat(PatientBill.AgreementDiscountAmt.toString())
    //                 + parseFloat(req.Data.AgreementDiscountAmt.toString());
    //         }
    //         await billBO.Update(PatientBill);
    //     }
    //     const patientBO = BoFactory.GetBo(regbo.PatientBo, this.Request);
    //     const patient: any = await patientBO.GetById(req.Data.PatientId);
    //     let vPatientName = '';
    //     if (patient.FirstName) vPatientName += patient.FirstName;
    //     if (patient.LastName) vPatientName += ' ' + patient.LastName;
    //     if (patient && (patient.NotificationToken && req.Data.ReceiptTypeId === 1)) {
    //         /* tslint:disable-next-line */
    //         const pushMessage: string = 'Dear ' +
    // vPatientName + ', ' + ' You Paid' +
    // 'Rs.' + req.Data.AmountPaid + ' ' + 'for advance' + '.';
    //         const notificationService: any = new NotificationService();
    //         const body = {
    //             type: 'appoinment_booking',
    //         };
    //         const pushTokens: string[] = [];
    //         if (patient.NotificationToken) {
    //             pushTokens.push(patient.NotificationToken);
    //         }
    //         await notificationService.sendNotification(pushMessage, pushTokens, body);
    //         console.log('*************************pushMessage**********************', pushMessage);
    //         console.log('*************************pushTokens**********************', pushTokens);
    //     }
    //     if (patient && (patient.NotificationToken && req.Data.ReceiptTypeId === 5)) {
    //         /* tslint:disable-next-line */
    //         const pushMessage: string = 'Dear ' +
    // vPatientName + ',' + ' You Paid' + 'Rs.'
    // + req.Data.AmountPaid + ' ' + 'for receipt' + '.';
    //         const notificationService: any = new NotificationService();
    //         const body = {
    //             type: 'appoinment_booking',
    //         };
    //         const pushTokens: string[] = [];
    //         if (patient.NotificationToken) {
    //             pushTokens.push(patient.NotificationToken);
    //         }
    //         await notificationService.sendNotification(pushMessage, pushTokens, body);
    //         console.log('*************************pushMessage**********************', pushMessage);
    //         console.log('*************************pushTokens**********************', pushTokens);
    //     }
    //     let result = await this.Save(req.Data);
    //     if (patient.Mobile && req.Data.ReceiptTypeId === 1) {
    //         let apiReqTitle = {
    //             Id: 0,
    //             PageContext: { PageSize: 50, PageNumber: 1 },
    //             Params: [
    //                 { Key: ReferenceValueFilters.ReferenceGroupCode, Value: 'Title' },
    //                 { Key: ReferenceValueFilters.ReferenceValueCodeId, Value: patient.TitleId }
    //             ]
    //         };
    //         let refTitleBo = BoFactory.GetBo(userbo.ReferenceValueBo, this.Request);
    //         let TitleData = await refTitleBo.GetReferenceValues(apiReqTitle);
    //         let title = TitleData.Data[0].Description;
    //         let apiReq = {
    //             Id: 0,
    //             PageContext: { PageSize: 50, PageNumber: 1 },
    //             Params: [
    //                 { Key: ReferenceValueFilters.ReferenceGroupCode, Value: 'PaymentType' },
    //                 { Key: ReferenceValueFilters.ReferenceValueCodeId, Value: req.Data.PaymentTypeId }
    //             ]
    //         };
    //         let payData = await refTitleBo.GetReferenceValues(apiReq);
    //         let paymentType = payData.Data[0].Description;
    //         let DisplayWard = '';
    //         let encdata: any;
    //         if (req.Data.EncounterTypeId === 2) {
    //             let encounterbo = BoFactory.GetBo(encbo.EncounterBo, this.Request);
    //             encdata = await encounterbo.GetEncounterById({ Id: req.Data.EncounterId });
    //             let wardMasterBO = BoFactory.GetBo(generalMasterBo.WardMasterBo, this.Request);
    //             let warddata = await wardMasterBO.GetWardMasterById({ Id: encdata.WardId });
    //             DisplayWard = warddata.WardName;
    //         }
    //         let department = '';
    //         if (req.Data.DepartmentID) {
    //             let departmentBO = BoFactory.GetBo(userbo.DepartmentBo, this.Request);
    //             let departmentData = await departmentBO.GetDepartmentById({ Id: req.Data.DepartmentID });
    //             department = departmentData.DepartmentName;
    //         }
    //         let eventTemplateBO = BoFactory.GetBo(userbo.EventTemplateBo, this.Request);
    //         let smsTemplateInfo = null;
    //         if (req.Data.EncounterTypeId === 1) {
    //             smsTemplateInfo = await eventTemplateBO.GetTemplateInfo('OPAdvance', 'OPAdvance', 1);
    //         } else {
    //             smsTemplateInfo = await eventTemplateBO.GetTemplateInfo('patientAdvance', 'patientAdvance', 1);
    //         }
    //         if (smsTemplateInfo) {
    //             let smsmodel: any = {};
    //             if (SmsConfig['PROVIDER'] === 'HOSMAT') {
    //                 smsmodel = {
    //                     numbers: [patient.Mobile],
    //                     message: Template.Compile(smsTemplateInfo.TemplateContent,
    //                         {
    //                             patientName: vPatientName,
    //                             mrn: patient.MRN,
    //                             advancePayment: req.Data.AmountPaid,
    //                             contactNo: this.Session.FacilityContact

    //                         })
    //                 };
    //             } else if (SmsConfig['PROVIDER'] === 'SHUVADHARSHINI') {
    //                 try {
    //                     if (req.Data.EncounterTypeId === 1) {
    //                         smsmodel = {
    //                             numbers: [patient.Mobile],
    //                             message: Template.Compile(smsTemplateInfo.TemplateContent,
    //                                 {
    //                                     originCurrency: 'INR',
    //                                     Amount: req.Data.AmountPaid,
    //                                     title: title,
    //                                     patientName: vPatientName,
    //                                     PaymentMode: paymentType,
    //                                     department: department,
    //                                     mrn: patient.MRN,
    //                                 }),
    //                             templateId: smsTemplateInfo.ModuleId
    //                         };
    //                     } else {
    //                         smsmodel = {
    //                             numbers: [patient.Mobile],
    //                             message: Template.Compile(smsTemplateInfo.TemplateContent,
    //                                 {
    //                                     originCurrency: 'INR',
    //                                     Amount: req.Data.AmountPaid,
    //                                     title: title,
    //                                     patientName: vPatientName,
    //                                     PaymentMode: paymentType,
    //                                     ward: DisplayWard,
    //                                     visitIdentifier: encdata.VisitIdentifier,
    //                                     mrn: patient.MRN,
    //                                 }),
    //                             templateId: smsTemplateInfo.ModuleId
    //                         };
    //                     }
    //                 } catch (error) {
    //                     console.log('Error Processing SMS:', error);
    //                 }
    //             } else {
    //                 smsmodel = {
    //                     numbers: [patient.Mobile],
    //                     message: Template.Compile(smsTemplateInfo.TemplateContent,
    //                         {
    //                             patientName: vPatientName,
    //                             mrn: patient.MRN,
    //                             advancePayment: req.Data.AmountPaid,
    //                             contactNo: this.Session.FacilityContact

    //                         })
    //                 };
    //             }
    //             let smsProvider = this.GetSmsProvider();
    //             if (smsProvider) {
    //                 let SMSStatus = await smsProvider.send(smsmodel);
    //                 let eventDashboardOutboundBo = BoFactory.GetBo(userbo.EventDashboardBo, this.Request);
    //                 await eventDashboardOutboundBo.ManageSMSOutBound(SMSStatus, smsmodel.message + ' To : ' + patient.Mobile);
    //             }
    //         }
    //     }
    //     if (result) {
    //         let patientaccountsBO = BoFactory.GetBo(billingbo.PatientAccountsBo, this.Request);
    //         let PatientReceiptId = result.dataValues.Id;
    //         if (generateReceiptNr === 1) {
    //             this.deferSequenceKey(PatientReceiptId, 'ReceiptNumber',
    //                 this.getFacilitySequenceIdentifier(SequenceKeys.ReceiptNrId,
    //                     (req.Data.FacilityId ? req.Data.FacilityId : -1)
    //                 ));
    //             if ((req.Data.EncounterTypeId === 2 || req.Data.EncounterTypeId === 5) && req.Data.ReceiptTypeId === 1) {
    //                 this.deferSequenceKey(PatientReceiptId, 'ReceiptNumber',
    //                     this.getFacilitySequenceIdentifier(SequenceKeys.IpAdvanceNrId,
    //                         (req.Data.FacilityId ? req.Data.FacilityId : -1)
    //                     ));
    //             } if ((req.Data.EncounterTypeId === 2 || req.Data.EncounterTypeId === 5) && req.Data.ReceiptTypeId === 2) {
    //                 this.deferSequenceKey(PatientReceiptId, 'ReceiptNumber',
    //                     this.getFacilitySequenceIdentifier(SequenceKeys.IPReceiptNrId,
    //                         (req.Data.FacilityId ? req.Data.FacilityId : -1)
    //                     ));
    //             }
    //         }

    //         if (req.Data.ReceiptStatusId === 1 && req.Data.ReceiptTypeId === 1) {
    //             let patientaccount = {};
    //             patientaccount = {
    //                 Id: 0,
    //                 PatientId: req.Data.PatientId,
    //                 EncounterId: req.Data.EncounterId,
    //                 TransactionTypeId: 1,
    //                 TransactionId: PatientReceiptId,
    //                 TransactionNumber: req.Data.ReceiptNumber,
    //                 TransactionDate: new Date(),
    //                 BillAmount: 0,
    //                 PaidAmount: req.Data.AmountPaid,
    //                 AdjustedAmount: 0,
    //                 UnAdjustedAmount: req.Data.AmountPaid,
    //                 DueAmount: 0,
    //                 DebitAmount: 0,
    //                 CreditAmount: req.Data.AmountPaid,
    //                 IsAdvance: 1
    //             };

    //             await patientaccountsBO.ManagePatientAccounts(1, patientaccount as any);
    //         }


    //         return PatientReceiptId;
    //     }
    //     return 0;
    // }

    public async AddPatientPaymentDetails(req: BaseRequest): Promise<number> {
        let generateReceiptNr = 0;
        if (!req.Data.ReceiptNumber && req.Data.ReceiptStatusId === 1) {
            generateReceiptNr = 1;
            req.Data.ReceiptNumber = null; //await Sequence.Next(SequenceKeys.ReceiptNrId);
            req.Data.ReceiptDateTime = new Date();
        }
        if (req.Data.PatientBillId && req.Data.PatientBillId > 0 && req.Data.ReceiptStatusId !== 2) {
            let billBO = BoFactory.GetBo(billingbo.PatientBillsBo, this.Request);
            let PatientBill = await billBO.GetPatientBillsById({ Id: req.Data.PatientBillId });
            let totalReceivedAmount: number = 0;
            // PatientBill.PaidAmount = PatientBill.PaidAmount !== null ? PatientBill.PaidAmount : 0;
            // PatientBill.TDSAmount = PatientBill.TDSAmount !== null ? PatientBill.TDSAmount : 0;
            // PatientBill.Disallowed = PatientBill.Disallowed !== null ? PatientBill.Disallowed : 0;
            PatientBill.PaidAmount = (PatientBill.PaidAmount) ? PatientBill.PaidAmount : 0;
            PatientBill.TDSAmount = (PatientBill.TDSAmount) ? PatientBill.TDSAmount : 0;
            PatientBill.Disallowed = (PatientBill.Disallowed) ? PatientBill.Disallowed : 0;
            if (PatientBill.OutStandingAmount !== 0) {
                totalReceivedAmount = parseFloat(req.Data.AmountPaid.toString())
                    + parseFloat(req.Data.TDSAmount.toString()) + parseFloat(req.Data.AgreementDiscountAmt.toString())
                    + parseFloat(req.Data.Disallowance.toString());
                PatientBill.OutStandingAmount = parseFloat(PatientBill.OutStandingAmount.toString())
                    - parseFloat(totalReceivedAmount.toString());
                PatientBill.PaidAmount = parseFloat(PatientBill.PaidAmount.toString())
                    + parseFloat(req.Data.AmountPaid.toString());
                PatientBill.IsPaidFully = PatientBill.OutStandingAmount === 0;
                if (PatientBill.OutStandingAmount === 0) {
                    PatientBill.IsPaidFully = true;
                }
            } else {
                PatientBill.IsPaidFully = true;
            }
            if (PatientBill.TDSAmount >= 0) {
                PatientBill.TDSAmount = parseFloat(PatientBill.TDSAmount.toString())
                    + parseFloat(req.Data.TDSAmount.toString());
            }
            if (PatientBill.Disallowed >= 0) {
                PatientBill.Disallowed = parseFloat(PatientBill.Disallowed.toString())
                    + parseFloat(req.Data.Disallowance.toString());
            }
            if (PatientBill.AgreementDiscountAmt >= 0) {
                PatientBill.AgreementDiscountAmt = parseFloat(PatientBill.AgreementDiscountAmt.toString())
                    + parseFloat(req.Data.AgreementDiscountAmt.toString());
            }
            await billBO.Update(PatientBill);
        }
        const patientBO = BoFactory.GetBo(regbo.PatientBo, this.Request);
        const patient: any = await patientBO.GetById(req.Data.PatientId);
        let vPatientName = '';
        if (patient.FirstName) vPatientName += patient.FirstName;
        if (patient.LastName) vPatientName += ' ' + patient.LastName;
        if (patient && (patient.NotificationToken && req.Data.ReceiptTypeId === 1)) {
            /* tslint:disable-next-line */
            const pushMessage: string = 'Dear ' + vPatientName + ', ' + ' You Paid' + 'Rs.' + req.Data.AmountPaid + ' ' + 'for advance' + '.';
            const notificationService: any = new NotificationService();
            const body = {
                type: 'appoinment_booking',
            };
            const pushTokens: string[] = [];
            if (patient.NotificationToken) {
                pushTokens.push(patient.NotificationToken);
            }
            await notificationService.sendNotification(pushMessage, pushTokens, body);
            console.log('*************************pushMessage**********************', pushMessage);
            console.log('*************************pushTokens**********************', pushTokens);
        }
        if (patient && (patient.NotificationToken && req.Data.ReceiptTypeId === 5)) {
            /* tslint:disable-next-line */
            const pushMessage: string = 'Dear ' + vPatientName + ',' + ' You Paid' + 'Rs.' + req.Data.AmountPaid + ' ' + 'for receipt' + '.';
            const notificationService: any = new NotificationService();
            const body = {
                type: 'appoinment_booking',
            };
            const pushTokens: string[] = [];
            if (patient.NotificationToken) {
                pushTokens.push(patient.NotificationToken);
            }
            await notificationService.sendNotification(pushMessage, pushTokens, body);
            console.log('*************************pushMessage**********************', pushMessage);
            console.log('*************************pushTokens**********************', pushTokens);
        }
        let result = await this.Save(req.Data);
        if (patient.Mobile && req.Data.ReceiptTypeId === 1) {
            let title = '';
            if (patient.TitleId) {
                try {
                    let apiReqTitle = {
                        Id: 0,
                        PageContext: { PageSize: 50, PageNumber: 1 },
                        Params: [
                            { Key: ReferenceValueFilters.ReferenceGroupCode, Value: 'Title' },
                            { Key: ReferenceValueFilters.ReferenceValueCodeId, Value: patient.TitleId }
                        ]
                    };
                    let refTitleBo = BoFactory.GetBo(userbo.ReferenceValueBo, this.Request);
                    let TitleData = await refTitleBo.GetReferenceValues(apiReqTitle);
                    if (TitleData && TitleData.Data && TitleData.Data.length > 0) {
                        title = TitleData.Data[0].Description;
                    }
                } catch (e) {
                    console.log('Title fetch failed:', e);
                }
            }

            let paymentType = '';
            try {
                let apiReq = {
                    Id: 0,
                    PageContext: { PageSize: 50, PageNumber: 1 },
                    Params: [
                        { Key: ReferenceValueFilters.ReferenceGroupCode, Value: 'PaymentType' },
                        { Key: ReferenceValueFilters.ReferenceValueCodeId, Value: req.Data.PaymentTypeId }
                    ]
                };
                let refTitleBo = BoFactory.GetBo(userbo.ReferenceValueBo, this.Request);
                let payData = await refTitleBo.GetReferenceValues(apiReq);
                if (payData && payData.Data && payData.Data.length > 0) {
                    paymentType = payData.Data[0].Description;
                }
            } catch (e) {
                console.log('Payment type fetch failed:', e);
            }

            let DisplayWard = '';
            let encdata: any = null;
            try {
                if (req.Data.EncounterTypeId === 2 && req.Data.EncounterId) {
                    let encounterbo = BoFactory.GetBo(encbo.EncounterBo, this.Request);
                    encdata = await encounterbo.GetEncounterById({ Id: req.Data.EncounterId });
                    if (encdata && encdata.WardId) {
                        let wardMasterBO = BoFactory.GetBo(generalMasterBo.WardMasterBo, this.Request);
                        let warddata = await wardMasterBO.GetWardMasterById({ Id: encdata.WardId });
                        if (warddata && warddata.WardName) {
                            DisplayWard = warddata.WardName;
                        }
                    }
                }
            } catch (e) {
                console.log('Ward fetch failed:', e);
            }

            let department = '';
            try {
                if (req.Data.DepartmentID) {
                    let departmentBO = BoFactory.GetBo(userbo.DepartmentBo, this.Request);
                    let departmentData = await departmentBO.GetDepartmentById({ Id: req.Data.DepartmentID });
                    if (departmentData && departmentData.DepartmentName) {
                        department = departmentData.DepartmentName;
                    }
                }
            } catch (e) {
                console.log('Department fetch failed:', e);
            }

            let eventTemplateBO = BoFactory.GetBo(userbo.EventTemplateBo, this.Request);
            let smsTemplateInfo = null;
            try {
                if (req.Data.EncounterTypeId === 1) {
                    smsTemplateInfo = await eventTemplateBO.GetTemplateInfo('OPAdvance', 'OPAdvance', 1);
                } else {
                    smsTemplateInfo = await eventTemplateBO.GetTemplateInfo('patientAdvance', 'patientAdvance', 1);
                }
            } catch (e) {
                console.log('Template fetch failed:', e);
            }

            if (smsTemplateInfo) {
                try {
                    let smsmodel: any = {};
                    if (SmsConfig['PROVIDER'] === 'HOSMAT') {
                        smsmodel = {
                            numbers: [patient.Mobile],
                            message: Template.Compile(smsTemplateInfo.TemplateContent,
                                {
                                    patientName: vPatientName,
                                    mrn: patient.MRN,
                                    advancePayment: req.Data.AmountPaid,
                                    contactNo: this.Session.FacilityContact

                                })
                        };
                    } else if (SmsConfig['PROVIDER'] === 'SHUVADHARSHINI') {
                        if (req.Data.EncounterTypeId === 1) {
                            smsmodel = {
                                numbers: [patient.Mobile],
                                message: Template.Compile(smsTemplateInfo.TemplateContent, {
                                    originCurrency: 'INR',
                                    Amount: req.Data.AmountPaid,
                                    title: title,
                                    patientName: vPatientName,
                                    PaymentMode: paymentType,
                                    department: department,
                                    mrn: patient.MRN
                                }),
                                templateId: smsTemplateInfo.ModuleId
                            };
                        } else {
                            smsmodel = {
                                numbers: [patient.Mobile],
                                message: Template.Compile(smsTemplateInfo.TemplateContent, {
                                    originCurrency: 'INR',
                                    Amount: req.Data.AmountPaid,
                                    title: title,
                                    patientName: vPatientName,
                                    PaymentMode: paymentType,
                                    ward: DisplayWard,
                                    visitIdentifier: (encdata && encdata.VisitIdentifier) ? encdata.VisitIdentifier : '',
                                    mrn: patient.MRN
                                }),
                                templateId: smsTemplateInfo.ModuleId
                            };
                        }
                    } else {
                        smsmodel = {
                            numbers: [patient.Mobile],
                            message: Template.Compile(smsTemplateInfo.TemplateContent, {
                                patientName: vPatientName,
                                mrn: patient.MRN,
                                advancePayment: req.Data.AmountPaid,
                                contactNo: this.Session.FacilityContact
                            })
                        };
                    }

                    let smsProvider = this.GetSmsProvider();
                    if (smsProvider) {
                        let SMSStatus = await smsProvider.send(smsmodel);
                        let eventDashboardOutboundBo = BoFactory.GetBo(userbo.EventDashboardBo, this.Request);
                        await eventDashboardOutboundBo.ManageSMSOutBound(SMSStatus, smsmodel.message + ' To : ' + patient.Mobile);
                    }
                } catch (e) {
                    console.log('SMS Send Failed:', e);
                }
            }
        }

        if (result) {
            let patientaccountsBO = BoFactory.GetBo(billingbo.PatientAccountsBo, this.Request);
            let PatientReceiptId = result.dataValues.Id;
            if (generateReceiptNr === 1) {
                this.deferSequenceKey(PatientReceiptId, 'ReceiptNumber',
                    this.getFacilitySequenceIdentifier(SequenceKeys.ReceiptNrId,
                        (req.Data.FacilityId ? req.Data.FacilityId : -1)
                    ));
                if ((req.Data.EncounterTypeId === 2 || req.Data.EncounterTypeId === 5) && req.Data.ReceiptTypeId === 1) {
                    this.deferSequenceKey(PatientReceiptId, 'ReceiptNumber',
                        this.getFacilitySequenceIdentifier(SequenceKeys.IpAdvanceNrId,
                            (req.Data.FacilityId ? req.Data.FacilityId : -1)
                        ));
                } if ((req.Data.EncounterTypeId === 2 || req.Data.EncounterTypeId === 5) && req.Data.ReceiptTypeId === 2) {
                    this.deferSequenceKey(PatientReceiptId, 'ReceiptNumber',
                        this.getFacilitySequenceIdentifier(SequenceKeys.IPReceiptNrId,
                            (req.Data.FacilityId ? req.Data.FacilityId : -1)
                        ));
                }
            }

            if (req.Data.ReceiptStatusId === 1 && req.Data.ReceiptTypeId === 1) {
                let patientaccount = {};
                patientaccount = {
                    Id: 0,
                    PatientId: req.Data.PatientId,
                    EncounterId: req.Data.EncounterId,
                    TransactionTypeId: 1,
                    TransactionId: PatientReceiptId,
                    TransactionNumber: req.Data.ReceiptNumber,
                    TransactionDate: new Date(),
                    BillAmount: 0,
                    PaidAmount: req.Data.AmountPaid,
                    AdjustedAmount: 0,
                    UnAdjustedAmount: req.Data.AmountPaid,
                    DueAmount: 0,
                    DebitAmount: 0,
                    CreditAmount: req.Data.AmountPaid,
                    IsAdvance: 1
                };

                await patientaccountsBO.ManagePatientAccounts(1, patientaccount as any);
            }


            return PatientReceiptId;
        }
        return 0;
    }

    public async AddStaffPatientPaymentDetails(req: BaseRequest): Promise<number> {
        let generateReceiptNr = 0;
        if (!req.Data.ReceiptNumber && req.Data.ReceiptStatusId === 1) {
            generateReceiptNr = 1;
            req.Data.ReceiptNumber = null; //await Sequence.Next(SequenceKeys.ReceiptNrId);
            req.Data.ReceiptDateTime = new Date();
        }
        // if (req.Data.PatientBillId && req.Data.PatientBillId > 0 && req.Data.ReceiptStatusId !== 2) {
        //     let billBO = BoFactory.GetBo(billingbo.PatientBillsBo, this.Request);
        //     let PatientBill = await billBO.GetPatientBillsById({ Id: req.Data.PatientBillId });
        //     let totalReceivedAmount: number = 0;
        //     if (PatientBill.OutStandingAmount !== 0) {
        //         totalReceivedAmount = parseFloat(req.Data.AmountPaid)
        //             + parseFloat(req.Data.TDSAmount)
        //             + parseFloat(req.Data.Disallowance);
        //         PatientBill.OutStandingAmount = parseFloat(PatientBill.OutStandingAmount)
        //             - parseFloat(totalReceivedAmount);
        //         PatientBill.PaidAmount = parseFloat(PatientBill.PaidAmount)
        //             + parseFloat(req.Data.AmountPaid);
        //         PatientBill.IsPaidFully = PatientBill.OutStandingAmount === 0;
        //     } else {
        //         PatientBill.IsPaidFully = true;
        //     }

        //     PatientBill.PaidAmount = PatientBill.PaidAmount !== null ? PatientBill.PaidAmount : 0;
        //     PatientBill.TDSAmount = PatientBill.TDSAmount !== null ? PatientBill.TDSAmount : 0;
        //     PatientBill.Disallowed = PatientBill.Disallowed !== null ? PatientBill.Disallowed : 0;
        //     PatientBill.TDSAmount = parseFloat(PatientBill.TDSAmount.toString())
        //         + parseFloat(req.Data.TDSAmount.toString());
        //     PatientBill.Disallowed = parseFloat(PatientBill.Disallowed.toString())
        //         + parseFloat(req.Data.Disallowance.toString());
        //     await billBO.Update(PatientBill);
        // }
        let result = await this.Save(req.Data);
        if (result) {
            let patientaccountsBO = BoFactory.GetBo(billingbo.PatientAccountsBo, this.Request);
            let PatientReceiptId = result.dataValues.Id;
            if (generateReceiptNr === 1) {
                this.deferSequenceKey(PatientReceiptId, 'ReceiptNumber',
                    this.getFacilitySequenceIdentifier(SequenceKeys.ReceiptNrId,
                        (req.Data.FacilityId ? req.Data.FacilityId : -1)
                    ));
            }

            if (req.Data.ReceiptStatusId === 1 && req.Data.ReceiptTypeId === 1) {
                let patientaccount = {};
                patientaccount = {
                    Id: 0,
                    PatientId: req.Data.PatientId,
                    EncounterId: req.Data.EncounterId,
                    TransactionTypeId: 1,
                    TransactionId: PatientReceiptId,
                    TransactionNumber: req.Data.ReceiptNumber,
                    TransactionDate: new Date(),
                    BillAmount: 0,
                    PaidAmount: req.Data.AmountPaid,
                    AdjustedAmount: 0,
                    UnAdjustedAmount: req.Data.AmountPaid,
                    DueAmount: 0,
                    DebitAmount: 0,
                    CreditAmount: req.Data.AmountPaid,
                    IsAdvance: 1
                };

                await patientaccountsBO.ManagePatientAccounts(1, patientaccount as any);
            }


            return PatientReceiptId;
        }
        if (result) {
            let receiptidentifier: any = null;
            receiptidentifier = this.getFacilitySequenceIdentifier(SequenceKeys.ReceiptNrId,
                (req.Data.FacilityId ? req.Data.FacilityId : -1)
            );
            let receiptid = result.dataValues.Id;
            if (receiptidentifier) {
                const afterO: any = () => {
                    return ((bo, request, receiptid) => {
                        return {
                            UpdateRecNumber: async (code: string) => {
                                request.Data.PatientReceiptId = receiptid;
                                request.Data.ReceiptNumber = code;
                                await bo.UpdateRecNumber(request);
                            },
                        };
                    })(this, req, receiptid);
                };

                this.deferSequenceKey(receiptid, 'ReceiptNumber', receiptidentifier,
                    [
                        afterO().UpdateRecNumber,
                    ]);

            }
        }
        return 0;
    }


    public async ManageReceiptWithAdjustment(req: BaseRequest): Promise<boolean> {
        if (req && req.Data && req.Data.length > 0) {
            let receiptdata = req.Data[0].Receipt;
            let adjustmentdata = req.Data[0].Adjustment;
            receiptdata.IsAdjustmentReceipt = true;
            if (adjustmentdata && adjustmentdata.length > 0) {
                receiptdata.AdjustmentReceiptId = adjustmentdata[0].Id;
            }
            let newrept: any = {
                Data: receiptdata
            };
            let PatientReceiptId = await this.AddPatientPaymentDetails(newrept);
            if (adjustmentdata && adjustmentdata.length > 0) {
                let newadj: any = {
                    Data: adjustmentdata
                };
                await this.ManagePatPaymentAdjustment(PatientReceiptId, newadj);
            }
        }

        return true;
    }

    public async ManagePatPaymentAdjustment(CurrentReceiptId: number,
        req: BaseRequest): Promise<boolean> {
        for (let j = 0, len = req.Data.length; j < len; j++) {
            req.Data[j].ParentReceiptId = req.Data[j].Id;
            req.Data[j].AdvanceAdjusted = req.Data[j].AdjustAmount;
            req.Data[j].Id = 0;
        }
        let PaymentadjustmentBO = BoFactory.GetBo(billingbo.PatientPaymentAdjustmentsBo, this.Request);
        await PaymentadjustmentBO.ManagePatientPaymentAdjustments(0, req.Data);
        return true;
    }

    public async ManagePatPaymentFundReturn(req: BaseRequest): Promise<boolean> {
        if (req.Data.AdjustmentReceiptId) {
            let newreq: any = await this.GetPatientPaymentDetailsById({ Id: req.Data.AdjustmentReceiptId });
            newreq.AmountAdjusted = (newreq.AmountAdjusted + (-1 * req.Data.AmountPaid));
            await this.Update(newreq);
            let newreqAdj = [];
            newreq.ParentReceiptId = 0;
            newreq.AdvanceAdjusted = -1 * req.Data.AmountPaid;
            newreq.Id = 0;
            newreq.RoundOffValue = 0;
            newreq.EncounterTypeId = req.Data.EncounterTypeId;
            newreqAdj.push(newreq);
            let PaymentadjustmentBO = BoFactory.GetBo(billingbo.PatientPaymentAdjustmentsBo, this.Request);
            await PaymentadjustmentBO.ManagePatientPaymentAdjustments(0, newreqAdj);
        }
        return true;
    }

    public async ManagePaymodeChange(req: BaseRequest): Promise<boolean> {
        let result = false;
        if (req.Data.Id) {
            result = await this.Update(req.Data);
        }
        return result;
    }

    public async UpdatePatientPaymentDetails(req: BaseRequest): Promise<boolean> {
        let generateReceiptNr = 0;
        if (!req.Data.ReceiptNumber && req.Data.ReceiptStatusId === 1) {
            generateReceiptNr = 1;
            req.Data.ReceiptNumber = null; //await Sequence.Next(SequenceKeys.ReceiptNrId);
            req.Data.ReceiptDateTime = new Date();
        }
        if (req.Data.PatientBillId && req.Data.PatientBillId > 0) {
            let billBO = BoFactory.GetBo(billingbo.PatientBillsBo, this.Request);
            let billdetailBO = BoFactory.GetBo(billingbo.PatientBillDetailsBo, this.Request);
            let PatientBill = await billBO.GetPatientBillsById({ Id: req.Data.PatientBillId });
            let totalReceivedAmount: number = 0;
            if (PatientBill.OutStandingAmount !== 0) {
                totalReceivedAmount = parseFloat(req.Data.AmountPaid.toString())
                    + parseFloat(req.Data.TDSAmount.toString())
                    + parseFloat(req.Data.Disallowance.toString());
                PatientBill.OutStandingAmount = parseFloat(PatientBill.OutStandingAmount.toString())
                    - parseFloat(totalReceivedAmount.toString());
                PatientBill.PaidAmount = parseFloat(PatientBill.PaidAmount.toString())
                    + parseFloat(req.Data.AmountPaid.toString());
                PatientBill.IsPaidFully = PatientBill.OutStandingAmount === 0;
            } else {
                PatientBill.IsPaidFully = true;
            }
            PatientBill.PaidAmount = PatientBill.PaidAmount !== null ? PatientBill.PaidAmount : 0;
            PatientBill.TDSAmount = PatientBill.TDSAmount !== null ? PatientBill.TDSAmount : 0;
            PatientBill.Disallowed = PatientBill.Disallowed !== null ? PatientBill.Disallowed : 0;
            PatientBill.TDSAmount = parseFloat(PatientBill.TDSAmount.toString())
                + parseFloat(req.Data.TDSAmount.toString());
            PatientBill.Disallowed = parseFloat(PatientBill.Disallowed.toString())
                + parseFloat(req.Data.Disallowance.toString());

            await billdetailBO.UpdateBillingStaus(PatientBill.Id, 2);
            await billBO.Update(PatientBill);
        }
        let result = await this.Update(req.Data);
        if (req.Data.AdjustmentReceiptId > 0 && req.Data.ReceiptStatusId === 3) {
            await this.ManagePatPaymentFundReturn(req);
        }
        if (generateReceiptNr === 1) {
            this.deferSequenceKey(req.Data.Id, 'ReceiptNumber',
                this.getFacilitySequenceIdentifier(SequenceKeys.ReceiptNrId,
                    (req.Data.FacilityId ? req.Data.FacilityId : -1)
                ));
        }

        return result;
    }

    public async FullBillCancel(req: BaseRequest): Promise<boolean> {
        for (let idx in req.Data) {
            if (req.Data[idx].PatientBillId && req.Data[idx].PatientBillId > 0) {
                let billBO = BoFactory.GetBo(billingbo.PatientBillsBo, this.Request);
                let billdetailBO = BoFactory.GetBo(billingbo.PatientBillDetailsBo, this.Request);
                let PatientBill = await billBO.GetPatientBillsById({ Id: req.Data[idx].PatientBillId });
                await billdetailBO.UpdateBillingStaus(PatientBill.Id, 2);
                PatientBill.RefundAmount = PatientBill.PaidAmount;
                PatientBill.CancelReason = req.Data[idx].Comments;
                PatientBill.PatientBillStatusId = 2;
                await billBO.Update(PatientBill);
                await this.ManageFullOrderCanallation(PatientBill.Id); // Full order cancel
                let docShareBO = BoFactory.GetBo(billingbo.PatientDoctorShareDetailsBo, this.Request);
                let apipatdrshareReq = {
                    Id: 0,
                    Params: [
                        { Key: PatientDoctorShareDetailsFilters.PatientBillId, Value: req.Data[idx].PatientBillId },
                    ],
                    PageContext: { PageSize: -1, PageNumber: 1 }
                };
                let doctorShareData: any = await docShareBO.GetPatientDoctorShareDetails(apipatdrshareReq);
                for (let jdx in doctorShareData.Data) {
                    let shareInfo = doctorShareData.Data[jdx];
                    let shareupdate: any = {
                        Id: shareInfo.Id,
                        DoctorShareStatusId: 2
                    };
                    await docShareBO.Update(shareupdate);
                }
            }
            await this.Update(req.Data[idx]);
        }
        return true;
    }

    public async ManageFullOrderCanallation(BillingID: number): Promise<any> {
        let OrderBo = BoFactory.GetBo(orderbo.PatientOrderBo, this.Request);
        let OrderDetailBo = BoFactory.GetBo(orderbo.PatientOrderDetailBo, this.Request);
        let apiorderReq = {
            Id: 0,
            PageContext: { PageSize: 10000, PageNumber: 1 },
            Params: [{ Key: 5, Value: BillingID }]
        };
        let orderdata = await OrderBo.GetPatientOrderWithDetailsByBillingId(apiorderReq);
        for (let idx in orderdata.Data) {
            let id = orderdata.Data[idx].Id;
            await OrderBo.UpdateBillingStaus(id, 2); // patientbillstatusid cancelled
            await OrderBo.UpdateOrderStatus(id, 2); // Order canceled
            let apiorderDetailReq = {
                Id: 0,
                PageContext: { PageSize: 10000, PageNumber: 1 },
                Params: [{ Key: 2, Value: orderdata.Data[idx].Id }]
            };
            let orderdetaildata = await OrderDetailBo.GetPatientOrderDetails(apiorderDetailReq);
            for (let idx1 in orderdetaildata.Data) {
                let id = orderdetaildata.Data[idx1].Id;
                await OrderDetailBo.UpdateBillingStaus(id, 2);
            }
        }
    }

    public async IsAlreadyExist(req: any): Promise<number> {
        let billDate = new Date();
        // let FromDate = billDate.setMinutes(billDate.getMinutes() - 2);
        // let ToDate = billDate.setMinutes(billDate.getMinutes() + 2);
        let FromDate = billDate.setSeconds(billDate.getSeconds() - 40);
        let ToDate = billDate.setSeconds(billDate.getSeconds() + 40);
        let frmDate = moment(FromDate);
        let todate = moment(ToDate);
        let apiReq = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [{ Key: PatientPaymentDetailsFilters.OnlyPID, Value: req.PatientId },
            { Key: PatientPaymentDetailsFilters.PatientBillId, Value: req.PatientBillId },
            { Key: PatientPaymentDetailsFilters.From, Value: frmDate },
            { Key: PatientPaymentDetailsFilters.To, Value: todate },
            { Key: PatientPaymentDetailsFilters.AmountPaid, Value: req.AmountPaid }]
        };
        let data = await this.GetPatientPaymentDetails(apiReq);
        if (data.Data && data.Data.length > 0) {
            // return (data.Data.length * -1);
            return -1;
        }
        return 1;
    }

    public async ManagePatientPaymentDetails(PatientBillId: number, billInfo: any, details: PatientPaymentDetailsAttributes[]):
        Promise<any> {
        details = details || [];
        await Promise.all(details.map((DetailItem): Promise<any> => {
            return (async (detail): Promise<any> => {
                detail.Id = detail.Id || 0;
                detail.PatientBillId = PatientBillId;
                detail.ReceiptDateTime = new Date();
                detail.ReferenceNumber = billInfo.ReferenceNumber;
                detail.ErpTransactionId = billInfo.ErpTransactionId;
                detail.UPIRefNumber = billInfo.UPIRefNumber || details[0].UPIRefNumber;
                detail.AuthorizedCode = billInfo.AuthorizedCode || details[0].AuthorizedCode;
                if (detail.Status === 2 && detail.Id !== 0) {
                    await this.MarkAsDelete(detail.Id);
                } else if (detail.Id === 0) {
                    // let totamt = 0;
                    // totamt = billInfo.BillAmount + billInfo.RoundOffValue;
                    if (detail.AmountPaid > billInfo.NetAmount) {
                        // return;
                        return Promise.reject(new Error('Error in Generating Receipt'));
                    } else {
                        let checkEntry = 1;
                        if (detail.IsMultiplePayment === false || !detail.IsMultiplePayment) {
                            checkEntry = await this.IsAlreadyExist(detail);
                        }
                        if (checkEntry === 1) {
                            if (!detail.ReceiptGeneratedById || detail.ReceiptGeneratedById < 1) {
                                detail.ReceiptGeneratedById = this.Session.UserId;
                            }
                            if (!detail.FacilityId || detail.FacilityId < 1) detail.FacilityId = this.Session.FacilityId;
                            let result = await this.Save(detail);
                            detail.Id = result.dataValues.Id;
                            if (billInfo.IsStoreSeparateSequence && billInfo.IsStoreSeparateSequence === true) {
                                this.deferSequenceKey(detail.Id, 'ReceiptNumber',
                                    this.getSepStoreSequenceIdentifier(SequenceKeys.ReceiptNrId,
                                        billInfo.StoreMasterId
                                    ));
                            } else {
                                this.deferSequenceKey(detail.Id, 'ReceiptNumber',
                                    this.getFacilitySequenceIdentifier(SequenceKeys.ReceiptNrId,
                                        (detail.FacilityId ? detail.FacilityId : -1)
                                    ));
                                if ((detail.EncounterTypeId === 2 || detail.EncounterTypeId === 5) && detail.ReceiptTypeId === 1) {
                                    this.deferSequenceKey(detail.Id, 'ReceiptNumber',
                                        this.getFacilitySequenceIdentifier(SequenceKeys.IpAdvanceNrId,
                                            (detail.FacilityId ? detail.FacilityId : -1)
                                        ));
                                } if ((detail.EncounterTypeId === 2 || detail.EncounterTypeId === 5) && detail.ReceiptTypeId === 2) {
                                    this.deferSequenceKey(detail.Id, 'ReceiptNumber',
                                        this.getFacilitySequenceIdentifier(SequenceKeys.IPReceiptNrId,
                                            (detail.FacilityId ? detail.FacilityId : -1)
                                        ));
                                }
                            }
                        } else {
                            try {
                                // return {'error': 'Receipt not Generated'};
                                return Promise.reject(new Error('Error in Generating Receipt'));
                            } catch (error) {
                                console.error(error); // Passes error to the global error handler
                            }
                        }
                    }
                }
            })(DetailItem);
        }));
        return details;
    }



    // public async ManagePatientPaymentDetails(
    //     PatientBillId: number,
    //     billInfo: any,
    //     details: PatientPaymentDetailsAttributes[]
    // ): Promise<any> {
    //     details = details || [];

    //     const transaction: Transaction = await this.sequelize.transaction();

    //     try {
    //         await Promise.all(details.map(async (detailItem): Promise<any> => {
    //             const detail = detailItem;
    //             detail.Id = detail.Id || 0;
    //             detail.PatientBillId = PatientBillId;
    //             detail.ReceiptDateTime = new Date();
    //             detail.ReferenceNumber = billInfo.ReferenceNumber;
    //             detail.ErpTransactionId = billInfo.ErpTransactionId;
    //             detail.UPIRefNumber = billInfo.UPIRefNumber || details[0]?.UPIRefNumber;
    //             detail.AuthorizedCode = billInfo.AuthorizedCode || details[0]?.AuthorizedCode;

    //             if (detail.Status === 2 && detail.Id !== 0) {
    //                 await this.MarkAsDelete(detail.Id, transaction); // Pass transaction to MarkAsDelete
    //             } else if (detail.Id === 0) {
    //                 if (detail.AmountPaid > billInfo.NetAmount) {
    //                     throw new Error('Error in Generating Receipt: Amount paid exceeds Net Amount.');
    //                 }

    //                 let checkEntry = 1;
    //                 if (detail.IsMultiplePayment === false || !detail.IsMultiplePayment) {
    //                     checkEntry = await this.IsAlreadyExist(detail, transaction); // Check with transaction if needed
    //                 }

    //                 if (checkEntry === 1) {
    //                     detail.ReceiptGeneratedById = detail.ReceiptGeneratedById && detail.ReceiptGeneratedById > 0
    //                         ? detail.ReceiptGeneratedById
    //                         : this.Session.UserId;
    //                     detail.FacilityId = detail.FacilityId && detail.FacilityId > 0
    //                         ? detail.FacilityId
    //                         : this.Session.FacilityId;

    //                     const result = await this.Save(detail, transaction); // Save with transaction
    //                     detail.Id = result.dataValues.Id;

    //                     if (billInfo.IsStoreSeparateSequence) {
    //                         this.deferSequenceKey(
    //                             detail.Id,
    //                             'ReceiptNumber',
    //                             this.getSepStoreSequenceIdentifier(SequenceKeys.ReceiptNrId, billInfo.StoreMasterId)
    //                         );
    //                     } else {
    //                         this.deferSequenceKey(
    //                             detail.Id,
    //                             'ReceiptNumber',
    //                             this.getFacilitySequenceIdentifier(SequenceKeys.ReceiptNrId, detail.FacilityId ?? -1)
    //                         );

    //                         if ((detail.EncounterTypeId === 2 || detail.EncounterTypeId === 5)) {
    //                             if (detail.ReceiptTypeId === 1) {
    //                                 this.deferSequenceKey(
    //                                     detail.Id,
    //                                     'ReceiptNumber',
    //                                     this.getFacilitySequenceIdentifier(SequenceKeys.IpAdvanceNrId, detail.FacilityId ?? -1)
    //                                 );
    //                             } else if (detail.ReceiptTypeId === 2) {
    //                                 this.deferSequenceKey(
    //                                     detail.Id,
    //                                     'ReceiptNumber',
    //                                     this.getFacilitySequenceIdentifier(SequenceKeys.IPReceiptNrId, detail.FacilityId ?? -1)
    //                                 );
    //                             }
    //                         }
    //                     }
    //                 } else {
    //                     throw new Error('Error in Generating Receipt: Duplicate Entry Detected.');
    //                 }
    //             }
    //         }));

    //         await transaction.commit(); // Commit if everything passed
    //         return details;

    //     } catch (error) {
    //         await transaction.rollback(); // Rollback if ANYTHING fails
    //         console.error('Transaction Rolled Back:', error);
    //         throw error; // Rethrow the error to propagate
    //     }
    // }

    public async GetPatientPaymentDetailsById(req: BaseRequest): Promise<PatientPaymentDetailsAttributes> {
        let include: Array<IncludeOptions> = [];
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName', 'SignPath'], as: 'CreatedUser', required: false,
            include: [this.GetReference('Title')]
        });
        include.push(this.GetReference('ReceiptStatus'));
        let result = await this.GetById(req.Id, { include: include });
        return this.GetAttribute(result);
    }

    public async GetPatientPaymentDetails(apiReq?: ApiRequest<PatientPaymentDetailsFilters>):
        Promise<ApiResponse<PatientPaymentDetailsAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        let patientWhere: WhereOptions<any> = {};
        let patientBillWhere: WhereOptions<any> = {};
        let isReqPatientSearch: boolean = false;
        let isReqPatientBillSearch: boolean = false;
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName'], required: false,
            include: [this.GetReference('Title')]
        });
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName', 'UserName', 'SignPath'], as: 'CreatedUser', required: false,
            include: [
                this.GetReference('Title')
            ]
        });
        include.push({
            model: this.Models.Department, attributes: ['DepartmentName', 'DepartmentCode'], required: false,
        });
        include.push({
            model: this.Models.Facility, required: false,
        });
        include.push(this.GetReference('PaymentType'));
        include.push({ model: this.Models.Encounter, attributes: ['VisitIdentifier'], required: false });
        include.push(this.GetReference('ReceiptStatus'));
        include.push(this.GetReference('CardType'));
        include.push(this.GetReference('Terminal'));
        include.push(this.GetReference('Bank'));
        include.push(this.GetReference('ReceiptType'));
        include.push(this.GetReference('GuarantorType'));
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case PatientPaymentDetailsFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case PatientPaymentDetailsFilters.ReceiptNumber:
                        where['ReceiptNumber'] = param.Value;
                        break;
                    case PatientPaymentDetailsFilters.OnlyPID:
                        where['PatientId'] = param.Value;
                        break;
                    case PatientPaymentDetailsFilters.ReceiptDatetime:
                        where['ReceiptDateTime'] = { '$between': param.Value };
                        break;
                    case PatientPaymentDetailsFilters.ReceiptType:
                        where['ReceiptTypeId'] = param.Value;
                        break;
                    case PatientPaymentDetailsFilters.ReceiptStatus:
                        where['ReceiptStatusId'] = param.Value;
                        break;
                    case PatientPaymentDetailsFilters.FirstName:
                        (patientWhere as any)['$or'] = [{ 'FirstName': { '$like': '%' + (param.Value || '') + '%' } },
                        { 'LastName': { '$like': '%' + (param.Value || '') + '%' } },
                        { 'MRN': { '$like': '%' + (param.Value || '') + '%' } }];
                        isReqPatientSearch = true;
                        break;
                    case PatientPaymentDetailsFilters.LastName:
                        (patientWhere as any)['$or'] = [{ 'FirstName': { '$like': '%' + (param.Value || '') + '%' } },
                        { 'LastName': { '$like': '%' + (param.Value || '') + '%' } },
                        { 'MRN': { '$like': '%' + (param.Value || '') + '%' } }];
                        isReqPatientSearch = true;
                        break;
                    case PatientPaymentDetailsFilters.PatientNameMRN:
                        (patientWhere as any)['$or'] = [{ 'FirstName': { '$like': '%' + (param.Value || '') + '%' } },
                        { 'LastName': { '$like': '%' + (param.Value || '') + '%' } },
                        { 'MRN': { '$like': '%' + (param.Value || '') + '%' } }];
                        isReqPatientSearch = true;
                        break;
                    case PatientPaymentDetailsFilters.PatientBillId:
                        where['PatientBillId'] = param.Value;
                        break;
                    case PatientPaymentDetailsFilters.EncounterId:
                        where['EncounterId'] = param.Value;
                        break;
                    case PatientPaymentDetailsFilters.EncounterTypeId:
                        if (param.Value) {
                            let paramArr: Array<number> = [];
                            if (param.Value.toString().indexOf(',') > -1) {
                                paramArr = param.Value.toString().split(',');
                            } else {
                                paramArr = [param.Value];
                            }
                            where['EncounterTypeId'] = { '$in': paramArr };
                        }
                        break;
                    case PatientPaymentDetailsFilters.BillTypeId:
                        where['BillTypeId'] = param.Value;
                        break;
                    case PatientPaymentDetailsFilters.IsPharmacyReceipt:
                        where['IsPharmacyReceipt'] = param.Value;
                        break;
                    case PatientPaymentDetailsFilters.PharmacyReceiptTypeId:
                        where['PharmacyReceiptTypeId'] = param.Value;
                        break;
                    case PatientPaymentDetailsFilters.IsConsolidatePay:
                        where['IsConsolidatePay'] = param.Value;
                        break;
                    case PatientPaymentDetailsFilters.IsPharmacyClearance:
                        where['IsPharmacyClearance'] = param.Value;
                        break;
                    case PatientPaymentDetailsFilters.IsClaimed:
                        where['IsClaimed'] = param.Value;
                        break;
                    case PatientPaymentDetailsFilters.IsClaimReceipt:
                        where['IsClaimReceipt'] = param.Value;
                        break;
                    case PatientPaymentDetailsFilters.StatusOfReceipts:
                        if (param.Value) {
                            let paramArr: Array<number> = [];
                            if (param.Value.toString().indexOf(',') > -1) {
                                paramArr = param.Value.toString().split(',');
                            } else {
                                paramArr = [param.Value];
                            }
                            where['ReceiptStatusId'] = { '$in': paramArr };
                        }
                        break;
                    case PatientPaymentDetailsFilters.EncounterNotIn:
                        where['EncounterId'] = { '$notIn': param.Value };
                        break;
                    case PatientPaymentDetailsFilters.CreatedBy:
                        where['ReceiptGeneratedById'] = param.Value;
                        break;
                    case PatientPaymentDetailsFilters.CanIncludeBill:
                        include.push({
                            model: this.Models.PatientBills,
                            required: false
                        });
                        break;
                    case PatientPaymentDetailsFilters.PaymentStatus:
                        where['PaymentStatusId'] = param.Value;
                        break;
                    case PatientPaymentDetailsFilters.BillNum:
                        (patientBillWhere as any)['$or'] = [{ 'BillNumber': { '$like': '%' + (param.Value || '') + '%' } }];
                        isReqPatientBillSearch = true;
                        break;
                    case PatientPaymentDetailsFilters.PaymentTypeId:
                        where['PaymentTypeId'] = param.Value;
                        break;
                    case PatientPaymentDetailsFilters.AdjustmentReceiptId:
                        where['AdjustmentReceiptId'] = param.Value;
                        break;
                    case PatientPaymentDetailsFilters.IsAdjustmentReceipt:
                        where['IsAdjustmentReceipt'] = param.Value;
                        break;
                    case PatientPaymentDetailsFilters.FacilityId:
                        where['FacilityId'] = param.Value;
                        break;
                    case PatientPaymentDetailsFilters.From:
                        where['ReceiptDateTime'] = where['ReceiptDateTime'] || {};
                        (where['ReceiptDateTime'] as any)['$gte'] = param.Value;
                        break;
                    case PatientPaymentDetailsFilters.To:
                        where['ReceiptDateTime'] = where['ReceiptDateTime'] || {};
                        (where['ReceiptDateTime'] as any)['$lte'] = param.Value;
                        break;
                    case PatientPaymentDetailsFilters.NeqReceiptStatus:
                        where['ReceiptStatusId'] = { '$ne': param.Value };
                        break;
                    case PatientPaymentDetailsFilters.ReceiptTypes:
                        if (param.Value) {
                            let paramArr: Array<number> = [];
                            if (param.Value.toString().indexOf(',') > -1) {
                                paramArr = param.Value.toString().split(',');
                            } else {
                                paramArr = [param.Value];
                            }
                            where['ReceiptTypeId'] = { '$in': paramArr };
                        }
                        break;
                    case PatientPaymentDetailsFilters.StoreMasterId:
                        patientBillWhere['StoreMasterId'] = param.Value;
                        isReqPatientBillSearch = true;
                        break;
                    case PatientPaymentDetailsFilters.DepartmentID:
                        where['DepartmentID'] = param.Value;
                        break;
                    case PatientPaymentDetailsFilters.BillType:
                        patientBillWhere['BillTypeId'] = param.Value;
                        isReqPatientBillSearch = true;
                        break;
                    case PatientPaymentDetailsFilters.NeqPaymentTypeId:
                        where['PaymentTypeId'] = { '$ne': param.Value };
                        break;
                    case PatientPaymentDetailsFilters.AmountPaid:
                        where['AmountPaid'] = param.Value;
                        break;
                    case PatientPaymentDetailsFilters.ReceiptTypeId:
                        where['ReceiptTypeId'] = param.Value;
                        break;
                    case PatientPaymentDetailsFilters.MultiUser:
                        if (param.Value) {
                            let paramArr: Array<number> = [];
                            if (param.Value.toString().indexOf(',') > -1) {
                                paramArr = param.Value.toString().split(',');
                            } else {
                                paramArr = [param.Value];
                            }
                            where['ReceiptGeneratedById'] = { '$in': paramArr };
                        }
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        include.push({
            model: this.Models.Patient,
            attributes: ['Id', 'TitleId', 'FirstName', 'MiddleName', 'LastName', 'MRN', 'Age', 'GenderId'
                , 'AddressLine1', 'AddressLine2', 'City', 'mobile', 'Email'],
            required: isReqPatientSearch,
            where: patientWhere,
            include: [this.GetReference('Title'), this.GetReference('Gender')]
        });
        include.push({
            model: this.Models.PatientBills,
            required: isReqPatientBillSearch,
            where: patientBillWhere,
            include: [this.GetReference('Gender'),
            {
                model: this.Models.PatientBillDetails, required: false,
            },
            {
                model: this.Models.User, attributes: ['FirstName', 'LastName', 'UserName', 'SignPath'], as: 'CreatedUser', required: false,
                include: [
                    this.GetReference('Title')
                ]
            }]
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async GetMinPatientPaymentDetails(apiReq?: ApiRequest<PatientPaymentDetailsFilters>):
        Promise<ApiResponse<PatientPaymentDetailsAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        let patientWhere: WhereOptions<any> = {};
        let patientBillWhere: WhereOptions<any> = {};
        let isReqPatientSearch: boolean = false;
        let isReqPatientBillSearch: boolean = false;
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName'], required: false,
            include: [this.GetReference('Title')]
        });
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName', 'UserName', 'SignPath'], as: 'CreatedUser', required: false,
            include: [
                this.GetReference('Title')
            ]
        });
        include.push({
            model: this.Models.Department, attributes: ['DepartmentName', 'DepartmentCode'], required: false,
        });
        include.push({
            model: this.Models.Facility, required: false,
        });
        include.push(this.GetReference('PaymentType'));
        include.push({
            model: this.Models.Encounter,
            attributes: ['VisitIdentifier', 'AdmissionDate', 'DischargeDate',
                'RoomId', 'BedId', 'WardId'
            ],
            include: [
                {
                    model: this.Models.WardRoomMaster, attributes: ['RoomNo'], required: false,
                },
                {
                    model: this.Models.WardRoomBedMaster, attributes: ['BedNo', 'Description', 'ServiceRateCategoryId'], required: false,
                },
                {
                    model: this.Models.WardMaster, attributes: ['WardName'], required: false,
                },
                // { model: this.Models.EncounterGuarantor, required: false },
            ],
            required: false
        });
        include.push(this.GetReference('ReceiptStatus'));
        // include.push(this.GetReference('CardType'));
        // include.push(this.GetReference('Terminal'));
        // include.push(this.GetReference('Bank'));
        // include.push(this.GetReference('ReceiptType'));
        // include.push(this.GetReference('GuarantorType'));
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case PatientPaymentDetailsFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case PatientPaymentDetailsFilters.ReceiptNumber:
                        where['ReceiptNumber'] = param.Value;
                        break;
                    case PatientPaymentDetailsFilters.OnlyPID:
                        where['PatientId'] = param.Value;
                        break;
                    case PatientPaymentDetailsFilters.ReceiptDatetime:
                        where['ReceiptDateTime'] = { '$between': param.Value };
                        break;
                    case PatientPaymentDetailsFilters.ReceiptType:
                        where['ReceiptTypeId'] = param.Value;
                        break;
                    case PatientPaymentDetailsFilters.ReceiptStatus:
                        where['ReceiptStatusId'] = param.Value;
                        break;
                    case PatientPaymentDetailsFilters.FirstName:
                        (patientWhere as any)['$or'] = [{ 'FirstName': { '$like': '%' + (param.Value || '') + '%' } },
                        { 'LastName': { '$like': '%' + (param.Value || '') + '%' } },
                        { 'MRN': { '$like': '%' + (param.Value || '') + '%' } }];
                        isReqPatientSearch = true;
                        break;
                    case PatientPaymentDetailsFilters.LastName:
                        (patientWhere as any)['$or'] = [{ 'FirstName': { '$like': '%' + (param.Value || '') + '%' } },
                        { 'LastName': { '$like': '%' + (param.Value || '') + '%' } },
                        { 'MRN': { '$like': '%' + (param.Value || '') + '%' } }];
                        isReqPatientSearch = true;
                        break;
                    case PatientPaymentDetailsFilters.PatientNameMRN:
                        (patientWhere as any)['$or'] = [{ 'FirstName': { '$like': '%' + (param.Value || '') + '%' } },
                        { 'LastName': { '$like': '%' + (param.Value || '') + '%' } },
                        { 'MRN': { '$like': '%' + (param.Value || '') + '%' } }];
                        isReqPatientSearch = true;
                        break;
                    case PatientPaymentDetailsFilters.PatientBillId:
                        where['PatientBillId'] = param.Value;
                        break;
                    case PatientPaymentDetailsFilters.EncounterId:
                        where['EncounterId'] = param.Value;
                        break;
                    case PatientPaymentDetailsFilters.EncounterTypeId:
                        where['EncounterTypeId'] = param.Value;
                        break;
                    case PatientPaymentDetailsFilters.BillTypeId:
                        where['BillTypeId'] = param.Value;
                        break;
                    case PatientPaymentDetailsFilters.IsPharmacyReceipt:
                        where['IsPharmacyReceipt'] = param.Value;
                        break;
                    case PatientPaymentDetailsFilters.PharmacyReceiptTypeId:
                        where['PharmacyReceiptTypeId'] = param.Value;
                        break;
                    case PatientPaymentDetailsFilters.IsConsolidatePay:
                        where['IsConsolidatePay'] = param.Value;
                        break;
                    case PatientPaymentDetailsFilters.IsPharmacyClearance:
                        where['IsPharmacyClearance'] = param.Value;
                        break;
                    case PatientPaymentDetailsFilters.IsClaimed:
                        where['IsClaimed'] = param.Value;
                        break;
                    case PatientPaymentDetailsFilters.StatusOfReceipts:
                        if (param.Value) {
                            let paramArr: Array<number> = [];
                            if (param.Value.toString().indexOf(',') > -1) {
                                paramArr = param.Value.toString().split(',');
                            } else {
                                paramArr = [param.Value];
                            }
                            where['ReceiptStatusId'] = { '$in': paramArr };
                        }
                        break;
                    case PatientPaymentDetailsFilters.EncounterNotIn:
                        where['EncounterId'] = { '$notIn': param.Value };
                        break;
                    case PatientPaymentDetailsFilters.CreatedBy:
                        where['ReceiptGeneratedById'] = param.Value;
                        break;
                    case PatientPaymentDetailsFilters.CanIncludeBill:
                        include.push({
                            model: this.Models.PatientBills,
                            required: false
                        });
                        break;
                    case PatientPaymentDetailsFilters.PaymentStatus:
                        where['PaymentStatusId'] = param.Value;
                        break;
                    case PatientPaymentDetailsFilters.BillNum:
                        (patientBillWhere as any)['$or'] = [{ 'BillNumber': { '$like': '%' + (param.Value || '') + '%' } }];
                        isReqPatientBillSearch = true;
                        break;
                    case PatientPaymentDetailsFilters.PaymentTypeId:
                        where['PaymentTypeId'] = param.Value;
                        break;
                    case PatientPaymentDetailsFilters.AdjustmentReceiptId:
                        where['AdjustmentReceiptId'] = param.Value;
                        break;
                    case PatientPaymentDetailsFilters.IsAdjustmentReceipt:
                        where['IsAdjustmentReceipt'] = param.Value;
                        break;
                    case PatientPaymentDetailsFilters.FacilityId:
                        where['FacilityId'] = param.Value;
                        break;
                    case PatientPaymentDetailsFilters.From:
                        where['ReceiptDateTime'] = where['ReceiptDateTime'] || {};
                        (where['ReceiptDateTime'] as any)['$gte'] = param.Value;
                        break;
                    case PatientPaymentDetailsFilters.To:
                        where['ReceiptDateTime'] = where['ReceiptDateTime'] || {};
                        (where['ReceiptDateTime'] as any)['$lte'] = param.Value;
                        break;
                    case PatientPaymentDetailsFilters.NeqReceiptStatus:
                        where['ReceiptStatusId'] = { '$ne': param.Value };
                        break;
                    case PatientPaymentDetailsFilters.ReceiptTypes:
                        if (param.Value) {
                            let paramArr: Array<number> = [];
                            if (param.Value.toString().indexOf(',') > -1) {
                                paramArr = param.Value.toString().split(',');
                            } else {
                                paramArr = [param.Value];
                            }
                            where['ReceiptTypeId'] = { '$in': paramArr };
                        }
                        break;
                    case PatientPaymentDetailsFilters.StoreMasterId:
                        patientBillWhere['StoreMasterId'] = param.Value;
                        isReqPatientBillSearch = true;
                        break;
                    case PatientPaymentDetailsFilters.DepartmentID:
                        where['DepartmentID'] = param.Value;
                        break;
                    case PatientPaymentDetailsFilters.BillType:
                        patientBillWhere['BillTypeId'] = param.Value;
                        isReqPatientBillSearch = true;
                        break;
                    case PatientPaymentDetailsFilters.NeqPaymentTypeId:
                        where['PaymentTypeId'] = { '$ne': param.Value };
                        break;
                    case PatientPaymentDetailsFilters.AmountPaid:
                        where['AmountPaid'] = param.Value;
                        break;
                    case PatientPaymentDetailsFilters.ReceiptTypeId:
                        where['ReceiptTypeId'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        include.push({
            model: this.Models.Patient,
            attributes: ['Id', 'TitleId', 'FirstName', 'MiddleName', 'LastName', 'MRN', 'Age', 'GenderId'
                , 'AddressLine1', 'AddressLine2', 'City', 'mobile', 'Email'],
            required: isReqPatientSearch,
            where: patientWhere,
            include: [this.GetReference('Title'), this.GetReference('Gender')]
        });
        // include.push({
        //     model: this.Models.PatientBills,
        //     required: isReqPatientBillSearch,
        //     where: patientBillWhere,
        //     include: [this.GetReference('Gender'),
        //     {
        //         model: this.Models.PatientBillDetails, required: false,
        //     },
        //     {
        //         model: this.Models.User,
        //attributes: ['FirstName', 'LastName', 'UserName', 'SignPath'],
        //as: 'CreatedUser', required: false,
        //         include: [
        //             this.GetReference('Title')
        //         ]
        //     }]
        // });
        apiReq.Attributes = ['Id', 'ReceiptDateTime', 'ReceiptNumber',
            'AmountPaid', 'AuthorizedCode', 'ChequeNo',
            'AuthorizeNumber', 'PaymentTypeId', 'CreatedBy',
            'EncounterId', 'PatientId', 'FacilityId',
            'ReceiptTypeId', 'UPIRefNumber'
        ];
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async GetMinPatientPaymentDetailsforLock(apiReq?: ApiRequest<PatientPaymentDetailsFilters>):
        Promise<ApiResponse<PatientPaymentDetailsAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        let patientWhere: WhereOptions<any> = {};
        let patientBillWhere: WhereOptions<any> = {};
        // let isReqPatientSearch: boolean = false;
        // let isReqPatientBillSearch: boolean = false;
        // include.push({
        //     model: this.Models.User, attributes: ['FirstName', 'LastName'], required: false,
        //     include: [this.GetReference('Title')]
        // });
        // include.push({
        //     model: this.Models.User, attributes: ['FirstName', 'LastName', 'UserName', 'SignPath'], as: 'CreatedUser', required: false,
        //     include: [
        //         this.GetReference('Title')
        //     ]
        // });
        // include.push({
        //     model: this.Models.Department, attributes: ['DepartmentName', 'DepartmentCode'], required: false,
        // });
        // include.push({
        //     model: this.Models.Facility, required: false,
        // });
        include.push(this.GetReference('PaymentType'));
        include.push({
            model: this.Models.Encounter,
            attributes: ['VisitIdentifier', 'AdmissionDate', 'DischargeDate',
                'RoomId', 'BedId', 'WardId'
            ],
            // include: [
            //     {
            //         model: this.Models.WardRoomMaster, attributes: ['RoomNo'], required: false,
            //     },
            //     {
            //         model: this.Models.WardRoomBedMaster, attributes: ['BedNo', 'Description', 'ServiceRateCategoryId'], required: false,
            //     },
            //     {
            //         model: this.Models.WardMaster, attributes: ['WardName'], required: false,
            //     },
            //     // { model: this.Models.EncounterGuarantor, required: false },
            // ],
            required: false
        });
        include.push(this.GetReference('ReceiptStatus'));
        // include.push(this.GetReference('CardType'));
        // include.push(this.GetReference('Terminal'));
        // include.push(this.GetReference('Bank'));
        // include.push(this.GetReference('ReceiptType'));
        // include.push(this.GetReference('GuarantorType'));
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case PatientPaymentDetailsFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case PatientPaymentDetailsFilters.ReceiptNumber:
                        where['ReceiptNumber'] = param.Value;
                        break;
                    case PatientPaymentDetailsFilters.OnlyPID:
                        where['PatientId'] = param.Value;
                        break;
                    case PatientPaymentDetailsFilters.ReceiptDatetime:
                        where['ReceiptDateTime'] = { '$between': param.Value };
                        break;
                    case PatientPaymentDetailsFilters.ReceiptType:
                        where['ReceiptTypeId'] = param.Value;
                        break;
                    case PatientPaymentDetailsFilters.ReceiptStatus:
                        where['ReceiptStatusId'] = param.Value;
                        break;
                    case PatientPaymentDetailsFilters.FirstName:
                        (patientWhere as any)['$or'] = [{ 'FirstName': { '$like': '%' + (param.Value || '') + '%' } },
                        { 'LastName': { '$like': '%' + (param.Value || '') + '%' } },
                        { 'MRN': { '$like': '%' + (param.Value || '') + '%' } }];
                        // isReqPatientSearch = true;
                        break;
                    case PatientPaymentDetailsFilters.LastName:
                        (patientWhere as any)['$or'] = [{ 'FirstName': { '$like': '%' + (param.Value || '') + '%' } },
                        { 'LastName': { '$like': '%' + (param.Value || '') + '%' } },
                        { 'MRN': { '$like': '%' + (param.Value || '') + '%' } }];
                        // isReqPatientSearch = true;
                        break;
                    case PatientPaymentDetailsFilters.PatientNameMRN:
                        (patientWhere as any)['$or'] = [{ 'FirstName': { '$like': '%' + (param.Value || '') + '%' } },
                        { 'LastName': { '$like': '%' + (param.Value || '') + '%' } },
                        { 'MRN': { '$like': '%' + (param.Value || '') + '%' } }];
                        // isReqPatientSearch = true;
                        break;
                    case PatientPaymentDetailsFilters.PatientBillId:
                        where['PatientBillId'] = param.Value;
                        break;
                    case PatientPaymentDetailsFilters.EncounterId:
                        where['EncounterId'] = param.Value;
                        break;
                    case PatientPaymentDetailsFilters.EncounterTypeId:
                        where['EncounterTypeId'] = param.Value;
                        break;
                    case PatientPaymentDetailsFilters.BillTypeId:
                        where['BillTypeId'] = param.Value;
                        break;
                    case PatientPaymentDetailsFilters.IsPharmacyReceipt:
                        where['IsPharmacyReceipt'] = param.Value;
                        break;
                    case PatientPaymentDetailsFilters.PharmacyReceiptTypeId:
                        where['PharmacyReceiptTypeId'] = param.Value;
                        break;
                    case PatientPaymentDetailsFilters.IsConsolidatePay:
                        where['IsConsolidatePay'] = param.Value;
                        break;
                    case PatientPaymentDetailsFilters.IsPharmacyClearance:
                        where['IsPharmacyClearance'] = param.Value;
                        break;
                    case PatientPaymentDetailsFilters.IsClaimed:
                        where['IsClaimed'] = param.Value;
                        break;
                    case PatientPaymentDetailsFilters.StatusOfReceipts:
                        if (param.Value) {
                            let paramArr: Array<number> = [];
                            if (param.Value.toString().indexOf(',') > -1) {
                                paramArr = param.Value.toString().split(',');
                            } else {
                                paramArr = [param.Value];
                            }
                            where['ReceiptStatusId'] = { '$in': paramArr };
                        }
                        break;
                    case PatientPaymentDetailsFilters.EncounterNotIn:
                        where['EncounterId'] = { '$notIn': param.Value };
                        break;
                    case PatientPaymentDetailsFilters.CreatedBy:
                        where['ReceiptGeneratedById'] = param.Value;
                        break;
                    case PatientPaymentDetailsFilters.CanIncludeBill:
                        include.push({
                            model: this.Models.PatientBills,
                            required: false
                        });
                        break;
                    case PatientPaymentDetailsFilters.PaymentStatus:
                        where['PaymentStatusId'] = param.Value;
                        break;
                    case PatientPaymentDetailsFilters.BillNum:
                        (patientBillWhere as any)['$or'] = [{ 'BillNumber': { '$like': '%' + (param.Value || '') + '%' } }];
                        // isReqPatientBillSearch = true;
                        break;
                    case PatientPaymentDetailsFilters.PaymentTypeId:
                        where['PaymentTypeId'] = param.Value;
                        break;
                    case PatientPaymentDetailsFilters.AdjustmentReceiptId:
                        where['AdjustmentReceiptId'] = param.Value;
                        break;
                    case PatientPaymentDetailsFilters.IsAdjustmentReceipt:
                        where['IsAdjustmentReceipt'] = param.Value;
                        break;
                    case PatientPaymentDetailsFilters.FacilityId:
                        where['FacilityId'] = param.Value;
                        break;
                    case PatientPaymentDetailsFilters.From:
                        where['ReceiptDateTime'] = where['ReceiptDateTime'] || {};
                        (where['ReceiptDateTime'] as any)['$gte'] = param.Value;
                        break;
                    case PatientPaymentDetailsFilters.To:
                        where['ReceiptDateTime'] = where['ReceiptDateTime'] || {};
                        (where['ReceiptDateTime'] as any)['$lte'] = param.Value;
                        break;
                    case PatientPaymentDetailsFilters.NeqReceiptStatus:
                        where['ReceiptStatusId'] = { '$ne': param.Value };
                        break;
                    case PatientPaymentDetailsFilters.ReceiptTypes:
                        if (param.Value) {
                            let paramArr: Array<number> = [];
                            if (param.Value.toString().indexOf(',') > -1) {
                                paramArr = param.Value.toString().split(',');
                            } else {
                                paramArr = [param.Value];
                            }
                            where['ReceiptTypeId'] = { '$in': paramArr };
                        }
                        break;
                    case PatientPaymentDetailsFilters.StoreMasterId:
                        patientBillWhere['StoreMasterId'] = param.Value;
                        // isReqPatientBillSearch = true;
                        break;
                    case PatientPaymentDetailsFilters.DepartmentID:
                        where['DepartmentID'] = param.Value;
                        break;
                    case PatientPaymentDetailsFilters.BillType:
                        patientBillWhere['BillTypeId'] = param.Value;
                        // isReqPatientBillSearch = true;
                        break;
                    case PatientPaymentDetailsFilters.NeqPaymentTypeId:
                        where['PaymentTypeId'] = { '$ne': param.Value };
                        break;
                    case PatientPaymentDetailsFilters.AmountPaid:
                        where['AmountPaid'] = param.Value;
                        break;
                    case PatientPaymentDetailsFilters.ReceiptTypeId:
                        where['ReceiptTypeId'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        // include.push({
        //     model: this.Models.Patient,
        //     attributes: ['Id', 'TitleId', 'FirstName', 'MiddleName', 'LastName', 'MRN', 'Age', 'GenderId'
        //         , 'AddressLine1', 'AddressLine2', 'City', 'mobile', 'Email'],
        //     required: isReqPatientSearch,
        //     where: patientWhere,
        //     include: [this.GetReference('Title'), this.GetReference('Gender')]
        // });
        // include.push({
        //     model: this.Models.PatientBills,
        //     required: isReqPatientBillSearch,
        //     where: patientBillWhere,
        //     include: [this.GetReference('Gender'),
        //     {
        //         model: this.Models.PatientBillDetails, required: false,
        //     },
        //     {
        //         model: this.Models.User,
        //attributes: ['FirstName', 'LastName', 'UserName', 'SignPath'],
        //as: 'CreatedUser', required: false,
        //         include: [
        //             this.GetReference('Title')
        //         ]
        //     }]
        // });
        apiReq.Attributes = ['Id', 'ReceiptDateTime', 'ReceiptNumber',
            'AmountPaid', 'AuthorizedCode', 'ChequeNo',
            'AuthorizeNumber', 'PaymentTypeId', 'CreatedBy',
            'EncounterId', 'PatientId', 'FacilityId',
            'ReceiptTypeId',
            'ReceiptStatusId', 'IsPharmacyReceipt'
        ];
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeletePatientPaymentDetails(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public async CancelIPBillPayments(req: BaseRequest): Promise<Boolean> {
        let ipbillpayments = [];
        let apiReq = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [{ Key: PatientPaymentDetailsFilters.PatientBillId, Value: req.Id }]
        };
        let data = await this.GetPatientPaymentDetails(apiReq);
        ipbillpayments = data.Data || [];
        if (ipbillpayments.length > 0) {
            await this.ManageCancelledIPReceipts(req.Id, ipbillpayments, req.Data.PatientBill);
        }
        return true;
    }

    public async ManageCancelledIPReceipts(PatientBillId: number, details: PatientPaymentDetailsAttributes[], billInfo?: any):
        Promise<boolean> {
        details = details || [];
        let refundFinalbill = 0;
        console.log('*************RHere efund************');
        console.log(refundFinalbill);
        try {
            let facilityPreferenceBO = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
            let billingPreferencesData = await facilityPreferenceBO.GetPrintPreferences('billing', null, this.Session.FacilityId);
            refundFinalbill = parseInt(billingPreferencesData.refundentry);
        } catch (ex) { refundFinalbill = 0; }
        console.log('*************Refund************');
        console.log(refundFinalbill);
        await Promise.all(details.map((DetailItem): Promise<void> => {
            return (async (detail): Promise<void> => {
                detail.Id = detail.Id || 0;
                if (refundFinalbill === 1) {
                    let refundBo = BoFactory.GetBo(billingbo.PatientRefundBo, this.Request);
                    let creditNotebo = BoFactory.GetBo(billingbo.PatientCreditNoteBo, this.Request); // Credit Note
                    let refundDetails: any = [];
                    refundDetails.push({
                        Id: 0,
                        RefundDetailsDateTime: new Date(),
                        CreditNoteDetailDateTime: new Date(),
                        NetAmount: detail.AmountPaid,
                        CreditNoteAmount: detail.AmountPaid,
                        CreditNoteTypeId: 4,
                        // PatientRefundId: number;
                        FacilityId: detail.FacilityId,
                        // OrganizationId: number;
                        PatientId: detail.PatientId,
                        EncounterId: detail.EncounterId,
                        EncounterTypeId: detail.EncounterTypeId,
                        RefundAmount: detail.AmountPaid,
                        PatientBillId: PatientBillId,
                    });
                    let refundInfo: any = {
                        Data: {
                            Header: {
                                Id: 0,
                                RefundDateTime: new Date(),
                                // RefundIdentifier: '',
                                FacilityId: detail.FacilityId,
                                //OrganizationId: number;
                                PatientId: detail.PatientId,
                                RefundTypeId: 4,
                                RefundStatusId: 1,
                                EncounterId: detail.EncounterId,
                                EncounterTypeId: detail.EncounterTypeId,
                                PatientName: '',
                                PatientReceiptId: detail.Id,
                                RefundAmount: detail.AmountPaid,
                                // CreditNoteAmount: detail.AmountPaid,
                                // DepartmentID: number;
                                //  PaymentcounterID: number;
                                // GuarantorId: number;
                                // GuarantorTypeId: number;
                                RefundGeneratedById: this.Session.UserId,
                                RefundApprovedById: this.Session.UserId,
                                // DoctorId: req.Dat;
                                PatientBillId: PatientBillId,
                                PaymentTypeId: 1

                            },
                            Details: refundDetails
                        }
                    };
                    await refundBo.AddPatientRefund(refundInfo, 1);
                    //Entries for CreditNote
                    refundInfo.Data.Header.CreditNoteDateTime = new Date();
                    refundInfo.Data.Header.CreditNoteTypeId = 4;
                    refundInfo.Data.Header.CreditNoteStatusId = 2;
                    refundInfo.Data.Header.CreditNoteStatusId = 2;
                    refundInfo.Data.Header.CreditNoteAmount = billInfo.BillAmount;
                    refundInfo.Data.Header.DoctorId = 0;
                    await creditNotebo.ManagePatientCreditNoteBillCancel(refundInfo);
                } else {
                    detail.ReceiptStatusId = 3;
                }
                if (detail.Status === 2 && detail.Id !== 0) {
                    await this.MarkAsDelete(detail.Id);
                } else if (detail.Id > 0) {
                    await this.Update(detail);
                }
            })(DetailItem);
        }));
        return true;
    }

    public async CancelEncIPBillPayments(req: BaseRequest): Promise<Boolean> {
        let ipbillpayments = [];
        let apiReq = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [{ Key: PatientPaymentDetailsFilters.EncounterId, Value: req.Data.Id },
            { Key: PatientPaymentDetailsFilters.EncounterTypeId, Value: 2 }]
        };
        let data = await this.GetPatientPaymentDetails(apiReq);
        ipbillpayments = data.Data || [];
        if (ipbillpayments.length > 0) {
            await this.ManageEncCancelledIPReceipts(req.Id, ipbillpayments);
        }

        return true;
    }

    public async ManageEncCancelledIPReceipts(EncId: number, details: PatientPaymentDetailsAttributes[]):
        Promise<boolean> {
        details = details || [];
        await Promise.all(details.map((DetailItem): Promise<void> => {
            return (async (detail): Promise<void> => {
                detail.Id = detail.Id || 0;
                detail.ReceiptStatusId = 3;
                if (detail.Status === 2 && detail.Id !== 0) {
                    await this.MarkAsDelete(detail.Id);
                } else if (detail.Id > 0) {
                    await this.Update(detail);
                }
            })(DetailItem);
        }));
        return true;
    }
    public async PrintIRDSalesReport(apiReq?: ApiRequest<PatientPaymentDetailsFilters>): Promise<any> {
        let data = await this.GetPatientPaymentDetails(apiReq);
        let IrdSaleData = data.Data;
        let FromDate = apiReq.Data.FromDate;
        let ToDate = apiReq.Data.ToDate;
        let FacilityName = apiReq.Data.FacilityName;
        let FacilityId = apiReq.Data.FacilityId;
        let DoctorName = apiReq.Data.DoctorName;
        let GuarantorName = apiReq.Data.GuarantorName;
        let DepartmentName = apiReq.Data.DepartmentName;
        // let IrdSaleDataData = data.Data[0];
        let IrdData: any = [];
        let TotalBillAmount: number = 0;
        let TotalDisAmount: number = 0;
        let TotalNetAmount: number = 0;
        let TotalGstAmount: number = 0;
        let TotalAmount: number = 0;
        let totalbillamount = 0;
        let totalbilldiscount = 0;
        let totalnetamount = 0;
        let totalgstamount = 0;
        let totalamount = 0;
        let item: any = {};
        for (let idx in IrdSaleData) {
            item = IrdSaleData[idx];
            if (item.PatientBill) {
                if (item.PatientBill.PatientBillDetails.length > 0) {
                    for (let pdx in item.PatientBill.PatientBillDetails) {
                        let detail = item.PatientBill.PatientBillDetails[pdx];
                        let irdData: any = {};
                        irdData.ServiceName = '';
                        irdData.PatientName = '';
                        irdData.EnteredBy = '';
                        irdData.GrossAmount = 0;
                        irdData.DiscAmount = 0;
                        irdData.GstAmount = 0;
                        irdData.NetAmountBeforeGST = 0;
                        irdData.NetAmount = 0;
                        irdData.FacilityName = item.Facility.FacilityName;
                        irdData.FacilityPAN = item.Facility.PAN;
                        // irdData.SyncWithIRD = 'Yes';
                        irdData.IsBillPrinted = 'Yes';
                        irdData.IsBillActive = 'Yes';
                        irdData.IsRealTime = 'Yes';
                        irdData.FiscalYear = '2021/2022';
                        if (item.Patient) {
                            irdData.PatientMrn = item.Patient.MRN;
                        }
                        irdData.PaymentType = item.PaymentType.Description;
                        irdData.TrnxRefNo = item.ReceiptNumber;
                        irdData.TrnxStatus = item.ReceiptStatus.Description;
                        irdData.BillNumber = item.PatientBill.BillNumber;
                        if (item.PatientBill.IntegrationStatus === true) {
                            irdData.SyncWithIRD = 'Yes';
                        } else if (item.PatientBill.IntegrationStatus === false) {
                            irdData.SyncWithIRD = 'No';
                        }
                        irdData.BillDateTime = item.PatientBill.BillDateTime;
                        if (item.Patient) {
                            if (item.Patient.Title) {
                                if (item.Patient.Title.Description) {
                                    irdData.PatientName = item.Patient.Title.Description;
                                }
                            }
                            if (item.Patient.FirstName) {
                                irdData.PatientName += ' ' + item.Patient.FirstName;
                            }
                            if (item.Patient.LastName) {
                                irdData.PatientName += ' ' + item.Patient.LastName;
                            }
                        }
                        if (item.PatientBill.CreatedUser) {
                            if (item.PatientBill.CreatedUser.Title) {
                                if (item.PatientBill.CreatedUser.Title.Description) {
                                    irdData.EnteredBy = item.PatientBill.CreatedUser.Title.Description;
                                }
                            }
                            if (item.PatientBill.CreatedUser.FirstName) {
                                irdData.EnteredBy += ' ' + item.PatientBill.CreatedUser.FirstName;
                            }
                            if (item.PatientBill.CreatedUser.LastName) {
                                irdData.EnteredBy += ' ' + item.PatientBill.CreatedUser.LastName;
                            }
                        }
                        irdData.ServiceName = detail.ServiceName;
                        irdData.GrossAmount = detail.GrossAmount;
                        irdData.DiscAmount = detail.DiscountAmount;
                        irdData.GstAmount = detail.GSTAmount;
                        irdData.NetAmountBeforeGST = parseFloat(detail.GrossAmount || 0) - parseFloat(detail.DiscountAmount || 0);
                        irdData.NetAmount = detail.NetAmount;
                        IrdData.push(irdData);
                    }
                }
            }
        }
        for (let gdx in IrdData) {
            let totData = IrdData[gdx];
            totalbillamount = totalbillamount + (totData.GrossAmount);
            totalbilldiscount = totalbilldiscount + (totData.DiscAmount);
            totalgstamount = totalgstamount + (totData.GstAmount);
            totalamount = totalamount + (totData.NetAmountBeforeGST);
            totalnetamount = totalnetamount + (totData.NetAmount);
        }
        TotalBillAmount = totalbillamount;
        TotalDisAmount = totalbilldiscount;
        TotalNetAmount = totalnetamount;
        TotalGstAmount = totalgstamount;
        TotalAmount = totalamount;

        let facilityPreferenceBO = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(FacilityId);
        let info = {
            IrdSaleData: IrdData,
            Preferences: printPreferencesData,
            FromDate: FromDate,
            ToDate: ToDate,
            FacilityName: FacilityName,
            TotalBillAmount: TotalBillAmount,
            TotalDisAmount: TotalDisAmount,
            TotalNetAmount: TotalNetAmount,
            TotalGstAmount: TotalGstAmount,
            TotalAmount: TotalAmount,
            DoctorName: DoctorName,
            GuarantorName: GuarantorName,
            DepartmentName: DepartmentName

        };
        let pdfOption: any = null;
        let key = 'irdsalereport';
        let pdfOptionJSON = await Report.GetPdfOption(key);
        if (!pdfOptionJSON) {
            pdfOption = {
                format: 'A4',
                orientation: 'landscape',
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
        } else {
            pdfOption = JSON.parse(pdfOptionJSON);
            pdfOption.base = 'file://' + join(__dirname, '/../../Templates/assets/');
        }
        return await Report.Generate(key, { header: {}, body: info }, null, pdfOption);
    }
    public async PrintCollectionReport(apiReq?: ApiRequest<PatientPaymentDetailsFilters>): Promise<any> {
        let data = await this.GetPatientPaymentDetails(apiReq);
        let PatientPaymentDetails = data.Data;
        let FromDate = apiReq.Data.FromDate;
        let ToDate = apiReq.Data.ToDate;
        let FacilityName = apiReq.Data.FacilityName;
        let UserName = apiReq.Data.UserName;
        let PaymentType = apiReq.Data.PaymentType;
        let PatientPaymentDetailsData = data.Data[0];
        let TotalAmountPaid: number = 0;
        let TotalRefund: number = 0;
        let BillId: number = 0;
        for (var idx in PatientPaymentDetails) {
            var item = PatientPaymentDetails[idx];
            TotalAmountPaid += item.AmountPaid;
            BillId = item.PatientBillId;
            let billBO = BoFactory.GetBo(billingbo.PatientBillsBo, this.Request);
            let PatBillData = await billBO.GetPatientBillsById({ Id: BillId });
            TotalRefund += PatBillData.RefundAmount;
        }
        let facilityPreferenceBO = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(PatientPaymentDetailsData.FacilityId);
        let info = {
            PatientPaymentDetails: PatientPaymentDetails,
            Preferences: printPreferencesData,
            TotalAmountPaid: TotalAmountPaid,
            TotalRefund: TotalRefund,
            FromDate: FromDate,
            ToDate: ToDate,
            FacilityName: FacilityName,
            UserName: UserName,
            PaymentType: PaymentType
        };
        let pdfOption: any = null;
        let key = 'collectionreport';
        let pdfOptionJSON = await Report.GetPdfOption(key);
        if (!pdfOptionJSON) {
            pdfOption = {
                format: 'A4',
                orientation: 'landscape',
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
        } else {
            pdfOption = JSON.parse(pdfOptionJSON);
            pdfOption.base = 'file://' + join(__dirname, '/../../Templates/assets/');
        }
        return await Report.Generate(key, { header: {}, body: info }, null, pdfOption);
    }
    public async PrintCollectionSummaryOPIP(req: BaseRequest): Promise<any> {

        let FromDate = req.Data.FromDate;
        let ToDate = req.Data.ToDate;
        let CollectionData: any = [];
        let RefundData: any = [];
        let DocPayment: any = [];
        let BillReceipt: any = [];
        let CollectionSummary: any = [];
        let CollectionReq = req;

        CollectionData = await this.GetFacilityCollectionDashBoard(CollectionReq);

        let PatientRefundBo = BoFactory.GetBo(billingbo.PatientRefundBo, this.Request);
        RefundData = await PatientRefundBo.GetFacilityCollectionDashBoard(CollectionReq);

        let docPayBO = BoFactory.GetBo(doctorinvoicebo.DoctorPaymentBo, this.Request);
        DocPayment = await docPayBO.GetFacilityCollectionDashBoard(CollectionReq);

        for (let idx in CollectionData) {
            BillReceipt.push(CollectionData[idx]);
        }

        for (let jdx in RefundData) {
            BillReceipt.push(RefundData[jdx]);
        }

        for (let jdx in DocPayment) {
            BillReceipt.push(DocPayment[jdx]);
        }

        let custom_sort = function (a: any, b: any) {
            return parseInt(a.Value.DisplayOrder) - parseInt(b.Value.DisplayOrder);
        };
        BillReceipt.sort(custom_sort);

        for (let idx in BillReceipt) {
            let collectiondata = BillReceipt[idx];
            if (collectiondata.Key !== 'Net Amount OP' && collectiondata.Key !== 'Net Amount IP') {
                CollectionSummary.push(collectiondata);
            } else if (collectiondata.Key === 'Net Amount OP') {
                collectiondata.Value.CashAmount = collectiondata.Value.CashAmount - BillReceipt[2].Value.CashAmount;
                collectiondata.Value.CardAmount = collectiondata.Value.CardAmount - BillReceipt[2].Value.CardAmount;
                collectiondata.Value.OtherAmount = collectiondata.Value.OtherAmount - BillReceipt[2].Value.OtherAmount;
                collectiondata.Value.UPIAmount = collectiondata.Value.UPIAmount - BillReceipt[2].Value.UPIAmount;
                collectiondata.Value.BillAmount = collectiondata.Value.BillAmount - BillReceipt[2].Value.BillAmount;
                CollectionSummary.push(collectiondata);
            } else if (collectiondata.Key === 'Net Amount IP') {
                collectiondata.Value.CashAmount = collectiondata.Value.CashAmount - BillReceipt[8].Value.CashAmount;
                collectiondata.Value.CardAmount = collectiondata.Value.CardAmount - BillReceipt[8].Value.CardAmount;
                collectiondata.Value.OtherAmount = collectiondata.Value.OtherAmount - BillReceipt[8].Value.OtherAmount;
                collectiondata.Value.UPIAmount = collectiondata.Value.UPIAmount - BillReceipt[8].Value.UPIAmount;
                collectiondata.Value.BillAmount = collectiondata.Value.BillAmount - BillReceipt[8].Value.BillAmount;
                CollectionSummary.push(collectiondata);
            }
        }

        let Totalbillcollection: any = {
            TotalBillAmt: 0,
            TotalCashAmt: 0,
            TotalCardAmt: 0,
            TotalOtherAmt: 0,
            Key: '',
        };
        let totalopcollection = CollectionSummary[4].Value;
        let totalipcollection = CollectionSummary[10].Value;
        let doccollection = CollectionSummary[11].Value;

        Totalbillcollection.Key = 'Total';
        Totalbillcollection.TotalBillAmt = (totalopcollection.BillAmount + totalipcollection.BillAmount) - (doccollection.BillAmount);
        Totalbillcollection.TotalCashAmt = (totalopcollection.CashAmount + totalipcollection.CashAmount) - (doccollection.CashAmount);
        Totalbillcollection.TotalCardAmt = (totalopcollection.CardAmount + totalipcollection.CardAmount) - (doccollection.CardAmount);
        Totalbillcollection.TotalOtherAmt = (totalopcollection.OtherAmount + totalipcollection.OtherAmount) - (doccollection.OtherAmount);
        Totalbillcollection.TotalUPIAmt = (totalopcollection.UPIAmount + totalipcollection.UPIAmount) - (doccollection.UPIAmount);

        let facilityPreferenceBO = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(CollectionReq.Data.FacilityId);
        let info = {
            FromDate: FromDate,
            ToDate: ToDate,
            BillReceipt: BillReceipt,
            CollectionSummary: CollectionSummary,
            Preferences: printPreferencesData,
            Totalbillcollection: Totalbillcollection,
            // TotalRefund: TotalRefund,
            // Summary: Summary
        };
        let pdfOption: any = null;
        let key = 'collectionsummaryopipreport';
        let pdfOptionJSON = await Report.GetPdfOption(key);
        if (!pdfOptionJSON) {
            pdfOption = {
                format: 'A4',
                orientation: 'landscape',
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
        } else {
            pdfOption = JSON.parse(pdfOptionJSON);
            pdfOption.base = 'file://' + join(__dirname, '/../../Templates/assets/');
        }
        return await Report.Generate(key, { header: {}, body: info }, null, pdfOption);
    }
    public async PrintIPCollectionReportByCashier(req: BaseRequest): Promise<any> {
        let dateformat = 'DD/MM/YYYY';
        let timeformat = 'HH:mm:ss';
        let fromdate = moment(req.Data.FromDate).format(dateformat);
        let FromTime = moment(req.Data.FromDate).format(timeformat);
        let FromDate = fromdate + ' ' + FromTime;

        let todate = moment(req.Data.ToDate).format(dateformat);
        let totime = moment(req.Data.ToDate).format(timeformat);
        let ToDate = todate + ' ' + totime;

        let User = req.Data.User;
        let FacilityId = req.Data.FacilityId;
        let FacilityName = req.Data.FacilityName;
        let UserName = req.Data.UserName;
        let PatientAdvanceData: any = [];
        let PatientRefundData: any = [];
        let PatientReceiptData: any = [];
        let PatientDueData: any = [];
        let PatientCollectionBills: any = [];
        let CollectionAdvance: any = [];
        let CollectionReceipt: any = [];
        let PaymentOPDueCollections: any = [];
        let RefundDetail: any = [];
        let DoctorName: any = [];
        // let Cash: number = 0;
        let TotalCash: number = 0;
        let TotalCard: number = 0;
        let TotalCheque: number = 0;
        let TotalNetBanking: number = 0;
        let TotalUPI: number = 0;
        let TotalCashAdvance: number = 0;
        let TotalCardReceipt: number = 0;
        let TotalCashReceipt: number = 0;
        let TotalChequeOthersReceipt: number = 0;
        let TotalNetBankingReceipt: number = 0;
        let TotalUPIReceipt: number = 0;
        let TotalCashDue: number = 0;
        let TotalCardDue: number = 0;
        let TotalChequeOthersDue: number = 0;
        let TotalNetBankingDue: number = 0;
        let TotalUPIDue: number = 0;
        let TotalCashRefund: number = 0;
        let TotalCardRefund: number = 0;
        let TotalChequeOthersRefund: number = 0;
        let TotalNetBankingRefund: number = 0;
        let TotalUPIRefund: number = 0;
        let TotalRefund: number = 0;
        let TotalReceipt: number = 0;
        let TotalDues: number = 0;
        // let Card: number = 0;
        let TotalCardAdvance: number = 0;
        // let ChequeOthers: number = 0;
        let TotalChequeOthersAdvance: number = 0;
        let TotalNetBankingAdvance: number = 0;
        let TotalUPIAdvance: number = 0;
        let TotalAdvance: number = 0;
        let Advancereq = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [{ Key: PatientPaymentDetailsFilters.From, Value: req.Data.FromDate },
            { Key: PatientPaymentDetailsFilters.To, Value: req.Data.ToDate },
            { Key: PatientPaymentDetailsFilters.ReceiptType, Value: 1 },
            { Key: PatientPaymentDetailsFilters.ReceiptStatus, Value: 1 },
            { Key: PatientPaymentDetailsFilters.EncounterTypeId, Value: 2 },
            { Key: PatientPaymentDetailsFilters.CreatedBy, Value: User }]
        };
        PatientAdvanceData = await this.GetPatientPaymentDetails(Advancereq);
        // let PatientBill = PatientAdvanceData.Data[0];
        let facilityPreferenceBO = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(FacilityId);
        for (let idx in PatientAdvanceData.Data) {
            let Cash: number = 0;
            let Card: number = 0;
            let ChequeOthers: number = 0;
            let NetBanking: number = 0;
            let UPI: number = 0;
            let patientbillinfo = PatientAdvanceData.Data[idx];
            let ReceiptDateTime = patientbillinfo.ReceiptDateTime;
            let ReceiptNumber = patientbillinfo.ReceiptNumber;
            let VisitIdentifier = patientbillinfo.Encounter.VisitIdentifier;
            let PatientName = '';
            if (patientbillinfo.Patient && patientbillinfo.Patient.Title && patientbillinfo.Patient.Title.Description) {
                PatientName = patientbillinfo.Patient.Title.Description;
            }
            if (patientbillinfo.Patient && patientbillinfo.Patient.FirstName) {
                PatientName += ' ' + patientbillinfo.Patient.FirstName;
            }
            if (patientbillinfo.Patient && patientbillinfo.Patient.LastName) {
                PatientName += ' ' + patientbillinfo.Patient.LastName;
            }
            if (patientbillinfo.Patient && patientbillinfo.Patient.MRN) {
                PatientName += ' ' + patientbillinfo.Patient.MRN;
            }
            if (patientbillinfo.User && patientbillinfo.User.Title && patientbillinfo.User.Title.Description) {
                DoctorName = patientbillinfo.User.Title.Description;
            }
            if (patientbillinfo.User && patientbillinfo.User.FirstName) {
                DoctorName += ' ' + patientbillinfo.User.FirstName;
            }
            if (patientbillinfo.User && patientbillinfo.User.LastName) {
                DoctorName += ' ' + patientbillinfo.User.LastName;
            }
            if (User === -1 || User === patientbillinfo.CreatedBy) {
                if (patientbillinfo.PaymentTypeId === 1 && patientbillinfo.ReceiptStatusId === 1) {
                    Cash = patientbillinfo.AmountPaid;
                    TotalCashAdvance += patientbillinfo.AmountPaid;
                    TotalCash += patientbillinfo.AmountPaid;
                }
                if ((patientbillinfo.PaymentTypeId === 5 || patientbillinfo.PaymentTypeId === 6) &&
                    patientbillinfo.ReceiptStatusId === 1) {
                    Card = patientbillinfo.AmountPaid;
                    TotalCardAdvance += patientbillinfo.AmountPaid;
                    TotalCard += patientbillinfo.AmountPaid;
                }
                if ((patientbillinfo.PaymentTypeId !== 1 && patientbillinfo.PaymentTypeId !== 5 &&
                    patientbillinfo.PaymentTypeId !== 6 && patientbillinfo.PaymentTypeId !== 10 &&
                    patientbillinfo.PaymentTypeId !== 11) && patientbillinfo.ReceiptStatusId === 1) {
                    ChequeOthers = patientbillinfo.AmountPaid;
                    TotalChequeOthersAdvance += patientbillinfo.AmountPaid;
                    TotalCheque += patientbillinfo.AmountPaid;
                }
                if ((patientbillinfo.PaymentTypeId === 10) && patientbillinfo.ReceiptStatusId === 1) {
                    NetBanking = patientbillinfo.AmountPaid;
                    TotalNetBankingAdvance += patientbillinfo.AmountPaid;
                    TotalNetBanking += patientbillinfo.AmountPaid;
                }
                if ((patientbillinfo.PaymentTypeId === 11) && patientbillinfo.ReceiptStatusId === 1) {
                    UPI = patientbillinfo.AmountPaid;
                    TotalUPIAdvance += patientbillinfo.AmountPaid;
                    TotalUPI += patientbillinfo.AmountPaid;
                }
            }

            let payAdvanceData: any = {
                ReceiptDateTime: ReceiptDateTime,
                ReceiptNumber: ReceiptNumber,
                VisitIdentifier: VisitIdentifier,
                PatientName: PatientName,
                DoctorName: DoctorName,
                Cash: Cash,
                Card: Card,
                ChequeOthers: ChequeOthers,
                NetBanking: NetBanking,
                UPI: UPI,
            };
            CollectionAdvance.push(payAdvanceData);
        }
        let ReceiptReq = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [{ Key: PatientPaymentDetailsFilters.From, Value: req.Data.FromDate },
            { Key: PatientPaymentDetailsFilters.To, Value: req.Data.ToDate },
            { Key: PatientPaymentDetailsFilters.ReceiptType, Value: 2 },
            { Key: PatientPaymentDetailsFilters.ReceiptStatus, Value: 1 },
            { Key: PatientPaymentDetailsFilters.EncounterTypeId, Value: 2 },
            { Key: PatientPaymentDetailsFilters.PaymentStatus, Value: 3 },
            { Key: PatientPaymentDetailsFilters.CreatedBy, Value: User }]
        };
        PatientReceiptData = await this.GetPatientPaymentDetails(ReceiptReq);
        for (let idx in PatientReceiptData.Data) {
            let Cash: number = 0;
            let Card: number = 0;
            let ChequeOthers: number = 0;
            let NetBanking: number = 0;
            let UPI: number = 0;
            let patientbillinfo = PatientReceiptData.Data[idx];
            let ReceiptDateTime = patientbillinfo.ReceiptDateTime;
            let ReceiptNumber = patientbillinfo.ReceiptNumber;
            let BillNumber = patientbillinfo.PatientBill.BillNumber;
            // let PatientName = patientbillinfo.Patient.Title.Description + ' ' +
            //     patientbillinfo.Patient.FirstName + ' ' + patientbillinfo.Patient.LastName
            //     + ' '+ patientbillinfo.Patient.MRN;
            let PatientName = '';
            if (patientbillinfo.Patient && patientbillinfo.Patient.Title && patientbillinfo.Patient.Title.Description) {
                PatientName += patientbillinfo.Patient.Title.Description;
            }
            if (patientbillinfo.Patient && patientbillinfo.Patient.FirstName) {
                PatientName += ' ' + patientbillinfo.Patient.FirstName;
            }
            if (patientbillinfo.Patient && patientbillinfo.Patient.LastName) {
                PatientName += ' ' + patientbillinfo.Patient.LastName;
            }
            if (patientbillinfo.Patient && patientbillinfo.Patient.MRN) {
                PatientName += ' ' + patientbillinfo.Patient.MRN;
            }
            if (patientbillinfo.User.Title) {
                DoctorName = patientbillinfo.User.Title.Description;
            }
            if (patientbillinfo.User.FirstName) {
                DoctorName += ' ' + patientbillinfo.User.FirstName;
            }
            if (patientbillinfo.User.LastName) {
                DoctorName += ' ' + patientbillinfo.User.LastName;
            }
            if (User === -1 || User === patientbillinfo.CreatedBy) {
                if (patientbillinfo.PaymentTypeId === 1 && patientbillinfo.ReceiptStatusId === 1) {
                    Cash = patientbillinfo.AmountPaid;
                    TotalCashReceipt += patientbillinfo.AmountPaid;
                    TotalCash += patientbillinfo.AmountPaid;
                }
                if ((patientbillinfo.PaymentTypeId === 5 || patientbillinfo.PaymentTypeId === 6) &&
                    patientbillinfo.ReceiptStatusId === 1) {
                    Card = patientbillinfo.AmountPaid;
                    TotalCardReceipt += patientbillinfo.AmountPaid;
                    TotalCard += patientbillinfo.AmountPaid;
                }
                if ((patientbillinfo.PaymentTypeId !== 1 && patientbillinfo.PaymentTypeId !== 5 &&
                    patientbillinfo.PaymentTypeId !== 6 && patientbillinfo.PaymentTypeId !== 10 &&
                    patientbillinfo.PaymentTypeId !== 11) && patientbillinfo.ReceiptStatusId === 1) {
                    ChequeOthers = patientbillinfo.AmountPaid;
                    TotalChequeOthersReceipt += patientbillinfo.AmountPaid;
                    TotalCheque += patientbillinfo.AmountPaid;
                }
                if ((patientbillinfo.PaymentTypeId === 10) && patientbillinfo.ReceiptStatusId === 1) {
                    NetBanking = patientbillinfo.AmountPaid;
                    TotalNetBankingReceipt += patientbillinfo.AmountPaid;
                    TotalNetBanking += patientbillinfo.AmountPaid;
                }
                if ((patientbillinfo.PaymentTypeId === 11) && patientbillinfo.ReceiptStatusId === 1) {
                    UPI = patientbillinfo.AmountPaid;
                    TotalUPIReceipt += patientbillinfo.AmountPaid;
                    TotalUPI += patientbillinfo.AmountPaid;
                }
            }

            let payReceiptData: any = {
                ReceiptDateTime: ReceiptDateTime,
                ReceiptNumber: ReceiptNumber,
                BillNumber: BillNumber,
                PatientName: PatientName,
                DoctorName: DoctorName,
                Cash: Cash,
                Card: Card,
                ChequeOthers: ChequeOthers,
                NetBanking: NetBanking,
                UPI: UPI,
            };
            CollectionReceipt.push(payReceiptData);
        }
        let DueReq = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [{ Key: PatientPaymentDetailsFilters.From, Value: req.Data.FromDate },
            { Key: PatientPaymentDetailsFilters.To, Value: req.Data.ToDate },
            { Key: PatientPaymentDetailsFilters.ReceiptType, Value: 3 },
            { Key: PatientPaymentDetailsFilters.ReceiptStatus, Value: 1 },
            { Key: PatientPaymentDetailsFilters.EncounterTypeId, Value: 2 },
            { Key: PatientPaymentDetailsFilters.CreatedBy, Value: User }]
        };
        PatientDueData = await this.GetPatientPaymentDetails(DueReq);
        for (let idx in PatientDueData.Data) {
            let Cash: number = 0;
            let Card: number = 0;
            let ChequeOthers: number = 0;
            let NetBanking: number = 0;
            let UPI: number = 0;
            let PatientDue = PatientDueData.Data[idx];
            let ReceiptDateTime = PatientDue.ReceiptDateTime;
            let ReceiptNumber = PatientDue.ReceiptNumber;
            let VisitIdentifier = PatientDue.Encounter.VisitIdentifier;
            let PatientName = '';
            if (PatientDue.Patient && PatientDue.Patient.Title && PatientDue.Patient.Title.Description) {
                PatientName += PatientDue.Patient.Title.Description;
            }
            if (PatientDue.Patient && PatientDue.Patient.FirstName) {
                PatientName += ' ' + PatientDue.Patient.FirstName;
            }
            if (PatientDue.Patient && PatientDue.Patient.LastName) {
                PatientName += ' ' + PatientDue.Patient.LastName;
            }
            if (PatientDue.Patient && PatientDue.Patient.MRN) {
                PatientName += ' ' + PatientDue.Patient.MRN;
            }
            if (PatientDue.User && PatientDue.User.Title && PatientDue.User.Title.Description) {
                DoctorName = PatientDue.User.Title.Description;
            }
            if (PatientDue.User && PatientDue.User.FirstName) {
                DoctorName += ' ' + PatientDue.User.FirstName;
            }
            if (PatientDue.User && PatientDue.User.LastName) {
                DoctorName += ' ' + PatientDue.User.LastName;
            }
            if (User === -1 || User === PatientDue.CreatedBy) {
                if (PatientDue.PaymentTypeId === 1 && PatientDue.ReceiptStatusId === 1) {
                    Cash = PatientDue.AmountPaid;
                    TotalCashDue += PatientDue.AmountPaid;
                    TotalCash += PatientDue.AmountPaid;
                }
                if ((PatientDue.PaymentTypeId === 5 || PatientDue.PaymentTypeId === 6) &&
                    PatientDue.ReceiptStatusId === 1) {
                    Card = PatientDue.AmountPaid;
                    TotalCardDue += PatientDue.AmountPaid;
                    TotalCard += PatientDue.AmountPaid;
                }
                if ((PatientDue.PaymentTypeId !== 1 && PatientDue.PaymentTypeId !== 5 &&
                    PatientDue.PaymentTypeId !== 6 && PatientDue.PaymentTypeId !== 10 &&
                    PatientDue.PaymentTypeId !== 11) && PatientDue.ReceiptStatusId === 1) {
                    ChequeOthers = PatientDue.AmountPaid;
                    TotalChequeOthersDue += PatientDue.AmountPaid;
                    TotalCheque += PatientDue.AmountPaid;
                }
                if ((PatientDue.PaymentTypeId === 10) && PatientDue.ReceiptStatusId === 1) {
                    NetBanking = PatientDue.AmountPaid;
                    TotalNetBankingDue += PatientDue.AmountPaid;
                    TotalNetBanking += PatientDue.AmountPaid;
                }
                if ((PatientDue.PaymentTypeId === 11) && PatientDue.ReceiptStatusId === 1) {
                    UPI = PatientDue.AmountPaid;
                    TotalUPIDue += PatientDue.AmountPaid;
                    TotalUPI += PatientDue.AmountPaid;
                }
            }

            let PaymentCollectionModel = {
                ReceiptDateTime: ReceiptDateTime,
                ReceiptNumber: ReceiptNumber,
                VisitIdentifier: VisitIdentifier,
                PatientName: PatientName,
                DoctorName: DoctorName,
                Cash: Cash,
                Card: Card,
                ChequeOthers: ChequeOthers,
                NetBanking: NetBanking,
                UPI: UPI,
            };
            PaymentOPDueCollections.push(PaymentCollectionModel);


        }
        let PatientRefundBo = BoFactory.GetBo(billingbo.PatientRefundBo, this.Request);
        let refundReq = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [{ Key: PatientRefundFilters.EncounterTypeId, Value: 2 },
            { Key: PatientRefundFilters.RefundStatus, Value: 1 },
            { Key: PatientRefundFilters.CreatedBy, Value: User },
            { Key: PatientRefundFilters.fromDate, Value: req.Data.FromDate },
            { Key: PatientRefundFilters.toDate, Value: req.Data.ToDate }]
        };
        PatientRefundData = await PatientRefundBo.GetPatientRefund(refundReq);
        for (let idx in PatientRefundData.Data) {
            let Cash: number = 0;
            let Card: number = 0;
            let ChequeOthers: number = 0;
            let NetBanking: number = 0;
            let UPI: number = 0;
            let refData = PatientRefundData.Data[idx];
            let RefundDate = refData.RefundDateTime;
            let RefundNumber = refData.RefundIdentifier;
            let RefundType = refData.RefundType.Description;
            let BillNum = ''; let BillDate = ''; let DoctorName = '';
            let PatientName = '';
            if (refData.PatientBill) {
                BillNum = refData.PatientBill.BillNumber;
                BillDate = refData.PatientBill.BillDateTime;
                DoctorName = refData.PatientBill.DoctorName;
            }
            if (refData.Patient && refData.Patient.Title && refData.Patient.Title.Description) {
                PatientName += refData.Patient.Title.Description;
            }
            if (refData.Patient && refData.Patient.FirstName) {
                PatientName += ' ' + refData.Patient.FirstName;
            }
            if (refData.Patient && refData.Patient.LastName) {
                PatientName += ' ' + refData.Patient.LastName;
            }
            if (refData.Patient && refData.Patient.MRN) {
                PatientName += ' ' + refData.Patient.MRN;
            }

            if (refData.PaymentTypeId === 1 && refData.RefundStatusId === 1) {
                Cash = refData.RefundAmount;
                TotalCashRefund += refData.RefundAmount;
            }
            if ((refData.PaymentTypeId === 5 || refData.PaymentTypeId === 6) &&
                refData.RefundStatusId === 1) {
                Card = refData.RefundAmount;
                TotalCardRefund += refData.RefundAmount;
            }
            if ((refData.PaymentTypeId !== 1 && refData.PaymentTypeId !== 5 &&
                refData.PaymentTypeId !== 6 && refData.PaymentTypeId !== 10 &&
                refData.PaymentTypeId !== 11) && refData.RefundStatusId === 1) {
                ChequeOthers = refData.RefundAmount;
                TotalChequeOthersRefund += refData.RefundAmount;
            }
            if ((refData.PaymentTypeId === 10) && refData.RefundStatusId === 1) {
                NetBanking = refData.RefundAmount;
                TotalNetBankingRefund += refData.RefundAmount;
            }
            if ((refData.PaymentTypeId === 11) && refData.RefundStatusId === 1) {
                UPI = refData.RefundAmount;
                TotalUPIRefund += refData.RefundAmount;
            }
            let refundData: any = {
                RefundDate: RefundDate,
                RefundNumber: RefundNumber,
                BillNum: BillNum,
                RefundType: RefundType,
                BillDate: BillDate,
                PatientName: PatientName,
                DoctorName: DoctorName,
                Cash: Cash,
                Card: Card,
                ChequeOthers: ChequeOthers,
                NetBanking: NetBanking,
                UPI: UPI,

            };
            RefundDetail.push(refundData);
        }
        let TotalNetCash = TotalCash - TotalCashRefund;
        let TotalNetCard = TotalCard - TotalCardRefund;
        let TotalNetCheque = TotalCheque - TotalChequeOthersRefund;
        let TotalNetNetBanking = TotalNetBanking - TotalNetBankingRefund;
        let TotalNetUPI = TotalUPI - TotalUPIRefund;
        let TotalNetSubmission = TotalNetCash + TotalNetCard + TotalNetCheque + TotalNetNetBanking + TotalNetUPI;

        let info = {
            PatientAdvanceData: PatientAdvanceData,
            RefundDetail: RefundDetail,
            PaymentOPDueCollections: PaymentOPDueCollections,
            PatientCollectionBills: PatientCollectionBills,
            CollectionAdvance: CollectionAdvance,
            CollectionReceipt: CollectionReceipt,
            Preferences: printPreferencesData,
            TotalCashAdvance: TotalCashAdvance,
            TotalCardAdvance: TotalCardAdvance,
            TotalChequeOthersAdvance: TotalChequeOthersAdvance,
            TotalNetBankingAdvance: TotalNetBankingAdvance,
            TotalUPIAdvance: TotalUPIAdvance,
            FromDate: FromDate,
            ToDate: ToDate,
            TotalCashRefund: TotalCashRefund,
            TotalCardRefund: TotalCardRefund,
            TotalChequeOthersRefund: TotalChequeOthersRefund,
            TotalNetBankingRefund: TotalNetBankingRefund,
            TotalUPIRefund: TotalUPIRefund,
            TotalCashDue: TotalCashDue,
            TotalCardDue: TotalCardDue,
            TotalChequeOthersDue: TotalChequeOthersDue,
            TotalNetBankingDue: TotalNetBankingDue,
            TotalUPIDue: TotalUPIDue,
            TotalRefund: TotalRefund,
            TotalCashReceipt: TotalCashReceipt,
            TotalCardReceipt: TotalCardReceipt,
            TotalChequeOthersReceipt: TotalChequeOthersReceipt,
            TotalNetBankingReceipt: TotalNetBankingReceipt,
            TotalUPIReceipt: TotalUPIReceipt,
            TotalReceipt: TotalReceipt,
            TotalAdvance: TotalAdvance,
            TotalDues: TotalDues,
            FacilityName: FacilityName,
            TotalNetCash: TotalNetCash,
            TotalNetCard: TotalNetCard,
            TotalNetCheque: TotalNetCheque,
            TotalNetNetBanking: TotalNetNetBanking,
            TotalNetUPI: TotalNetUPI,
            UserName: UserName,
            TotalNetSubmission: TotalNetSubmission
        };
        let pdfOption: any = null;
        let key = 'ipcollectiondetailcashierreport';
        let pdfOptionJSON = await Report.GetPdfOption(key);
        if (!pdfOptionJSON) {
            pdfOption = {
                format: 'A4',
                orientation: 'landscape',
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
        } else {
            pdfOption = JSON.parse(pdfOptionJSON);
            pdfOption.base = 'file://' + join(__dirname, '/../../Templates/assets/');
        }
        return await Report.Generate(key, { header: {}, body: info }, null, pdfOption);
    }
    public async PrintPharmacyCardCollectionReport(apiReq?: ApiRequest<PatientPaymentDetailsFilters>): Promise<any> {
        let data = await this.GetPatientPaymentDetails(apiReq);
        let PatientPaymentDetails = data.Data;
        let FromDate = apiReq.Data.FromDate;
        let ToDate = apiReq.Data.ToDate;
        let FacilityName = apiReq.Data.FacilityName;
        let UserName = apiReq.Data.UserName;
        let PatientPaymentDetailsData = data.Data[0];
        let PatientDailyBills: any = [];
        let TotalAmountPaid: number = 0;
        PatientPaymentDetails.forEach((Detail: any) => {
            let BillData = Detail;
            BillData.NetAmount = parseInt(Detail.BillAmount) - parseInt(Detail.BillDiscount);
            BillData.PatientInfo = '';
            if (Detail.Patient) {
                if (Detail.Patient.Title)
                    Detail.PatientInfo = Detail.Patient.Title.Description;
                if (Detail.Patient.FirstName)
                    Detail.PatientInfo += ' ' + Detail.Patient.FirstName;
                if (Detail.Patient.LastName)
                    Detail.PatientInfo += ' ' + Detail.Patient.LastName;
                if (Detail.Patient.MRN)
                    Detail.PatientInfo += '/' + Detail.Patient.MRN;
                if (Detail.Patient.Age)
                    Detail.PatientInfo += '/' + Detail.Patient.Age;
                if (Detail.Patient.Gender)
                    Detail.PatientInfo += '/' + Detail.Patient.Gender.Description;
            } else if (!Detail.Patient) {
                if (Detail.PatientBill.Gender) {
                    let gender = Detail.PatientBill.Gender.Description;
                    Detail.PatientInfo = Detail.PatientName + '/' + Detail.PatientBill.Age + '/' + gender;
                }
            }
            PatientDailyBills.push(BillData);
        });
        for (let idx in PatientPaymentDetails) {
            let item = PatientPaymentDetails[idx];
            TotalAmountPaid += item.AmountPaid;
        }
        let facilityPreferenceBO = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(PatientPaymentDetailsData.FacilityId);
        let info = {
            PatientPaymentDetails: PatientPaymentDetails,
            Preferences: printPreferencesData,
            TotalAmountPaid: TotalAmountPaid,
            FromDate: FromDate,
            ToDate: ToDate,
            FacilityName: FacilityName,
            UserName: UserName,
            PatientDailyBills: PatientDailyBills
        };
        let pdfOption: any = null;
        let key = 'pharmacycardcollectionreport';
        let pdfOptionJSON = await Report.GetPdfOption(key);
        if (!pdfOptionJSON) {
            pdfOption = {
                format: 'A4',
                orientation: 'landscape',
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
        } else {
            pdfOption = JSON.parse(pdfOptionJSON);
            pdfOption.base = 'file://' + join(__dirname, '/../../Templates/assets/');
        }
        return await Report.Generate(key, { header: {}, body: info }, null, pdfOption);
    }
    public async PrintPharmacyDueCollectionReport(apiReq?: ApiRequest<PatientPaymentDetailsFilters>): Promise<any> {
        let data = await this.GetPatientPaymentDetails(apiReq);
        let FromDate = apiReq.Data.FromDate;
        let ToDate = apiReq.Data.ToDate;
        let FacilityName = apiReq.Data.FacilityName;
        let UserName = apiReq.Data.UserName;
        let PatientPaymentDetailsData = data.Data;
        let PatientDue: any = {};
        let TotCashDue: number = 0;
        let TotCardDue: number = 0;
        let TotChequeOthersDue: number = 0;
        let TotDues: number = 0;
        let PaymentOPDueCollections: any = [];

        for (let idx in PatientPaymentDetailsData) {
            PatientDue = PatientPaymentDetailsData[idx];
            let ReceiptDate = PatientDue.ReceiptDateTime;
            let ReceiptNumber = PatientDue.ReceiptNumber;
            let BillNumber = PatientDue.PatientBill.BillNumber;
            let BillDate = PatientDue.PatientBill.BillDateTime;
            let DoctorName = '';
            let PatientName = '';
            let Cash = 0;
            let Card = 0;
            let ChequeOthers = 0;

            if (PatientDue.User && PatientDue.User.Title && PatientDue.User.Title.Description)
                DoctorName += PatientDue.User.Title.Description;

            if (PatientDue.User && PatientDue.User.FirstName)
                DoctorName += ' ' + PatientDue.User.FirstName;

            if (PatientDue.User && PatientDue.User.LastName)
                DoctorName += ' ' + PatientDue.User.LastName;

            if (PatientDue.Patient && PatientDue.Patient.Title && PatientDue.Patient.Title.Description)
                PatientName += PatientDue.Patient.Title.Description;

            if (PatientDue.Patient && PatientDue.Patient.FirstName)
                PatientName += ' ' + PatientDue.Patient.FirstName;

            if (PatientDue.Patient && PatientDue.Patient.LastName)
                PatientName += ' ' + PatientDue.Patient.LastName;

            if (PatientDue.Patient && PatientDue.Patient.MRN)
                PatientName += '/' + PatientDue.Patient.MRN;

            if (!PatientName)
                PatientName = PatientDue.PatientName;

            if (PatientDue.ReceiptTypeId === 3 && PatientDue.PatientBill) {
                if (PatientDue.PaymentTypeId === 1 && PatientDue.ReceiptStatusId === 1) {
                    Cash = PatientDue.AmountPaid;
                    TotCashDue += PatientDue.AmountPaid;
                    TotDues += PatientDue.AmountPaid;
                } else if (PatientDue.PaymentTypeId === 5 || PatientDue.PaymentTypeId === 6
                    && PatientDue.ReceiptStatusId === 1) {
                    Card = PatientDue.AmountPaid;
                    TotCardDue += PatientDue.AmountPaid;
                    TotDues += PatientDue.AmountPaid;
                } else if (PatientDue.PaymentTypeId === 2 && PatientDue.PaymentTypeId === 3
                    && PatientDue.PaymentTypeId === 4 && PatientDue.ReceiptStatusId === 1) {
                    ChequeOthers = PatientDue.AmountPaid;
                    TotChequeOthersDue += PatientDue.AmountPaid;
                    TotDues += PatientDue.AmountPaid;
                }
                if (PatientDue.PaymentTypeId === 1) { // CASH
                    Card = 0;
                    ChequeOthers = 0;
                } else if (PatientDue.PaymentTypeId === 5
                    || PatientDue.PaymentTypeId === 6) { //CARD
                    Cash = 0;
                    ChequeOthers = 0;
                } else if (PatientDue.PaymentTypeId === 2 || PatientDue.PaymentTypeId === 3
                    || PatientDue.PaymentTypeId === 4) { // CHEQUE
                    Cash = 0;
                    Card = 0;
                }
                if (Cash > 0 || Card > 0 || ChequeOthers > 0) {
                    //TotDues += (Cash + Card + ChequeOthers);
                    let PaymentCollectionModel = {
                        ReceiptDate: ReceiptDate,
                        BillDate: BillDate,
                        ReceiptNumber: ReceiptNumber,
                        BillNumber: BillNumber,
                        DoctorName: DoctorName,
                        PatientName: PatientName,
                        Cash: Cash,
                        Card: Card,
                        ChequeOthers: ChequeOthers,
                    };
                    PaymentOPDueCollections.push(PaymentCollectionModel);
                }

            }
        }
        let facilityPreferenceBO = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(PatientDue.FacilityId);
        let info = {
            PaymentOPDueCollections: PaymentOPDueCollections,
            Preferences: printPreferencesData,
            FromDate: FromDate,
            ToDate: ToDate,
            FacilityName: FacilityName,
            UserName: UserName,
            TotCashDue: TotCashDue,
            TotCardDue: TotCardDue,
            TotChequeOthersDue: TotChequeOthersDue,
            TotDues: TotDues,
        };
        let pdfOption: any = null;
        let key = 'pharmacyduecollectionreport';
        let pdfOptionJSON = await Report.GetPdfOption(key);
        if (!pdfOptionJSON) {
            pdfOption = {
                format: 'A4',
                orientation: 'landscape',
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
        } else {
            pdfOption = JSON.parse(pdfOptionJSON);
            pdfOption.base = 'file://' + join(__dirname, '/../../Templates/assets/');
        }
        return await Report.Generate(key, { header: {}, body: info }, null, pdfOption);
    }
    public async PrintAdvanceFundDetailsReport(apiReq?: ApiRequest<PatientPaymentDetailsFilters>): Promise<any> {
        let data = await this.GetPatientPaymentDetails(apiReq);
        let AdvanceFundDetails = data.Data;
        let FromDate = apiReq.Data.FromDate;
        let ToDate = apiReq.Data.ToDate;
        let FacilityName = apiReq.Data.FacilityName;
        let DoctorName = apiReq.Data.DoctorName;
        let GuarantorName = apiReq.Data.GuarantorName;
        let DepartmentName = apiReq.Data.DepartmentName;
        let AdvanceFundDetailsData = data.Data[0];
        let PatientDailyBills: any = [];
        let TotalReceiptAmt: number = 0;
        let TotalAdjustAmt: number = 0;
        let TotalPendingAmt: number = 0;
        AdvanceFundDetails.forEach((Detail: any) => {
            let BillData = Detail;
            BillData.PendingAmount = parseInt(Detail.AmountPaid) - parseInt(Detail.AmountAdjusted);
            PatientDailyBills.push(BillData);
        });
        for (let idx in PatientDailyBills) {
            let item = PatientDailyBills[idx];
            TotalReceiptAmt += item.AmountPaid;
            TotalAdjustAmt += item.AmountAdjusted;
            TotalPendingAmt += item.PendingAmount;
        }
        let facilityPreferenceBO = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(AdvanceFundDetailsData.FacilityId);
        let info = {
            AdvanceFundDetails: AdvanceFundDetails,
            Preferences: printPreferencesData,
            FromDate: FromDate,
            ToDate: ToDate,
            FacilityName: FacilityName,
            TotalReceiptAmt: TotalReceiptAmt,
            TotalAdjustAmt: TotalAdjustAmt,
            TotalPendingAmt: TotalPendingAmt,
            DoctorName: DoctorName,
            GuarantorName: GuarantorName,
            DepartmentName: DepartmentName

        };
        let pdfOption: any = null;
        let key = 'advancefunddetailsreport';
        let pdfOptionJSON = await Report.GetPdfOption(key);
        if (!pdfOptionJSON) {
            pdfOption = {
                format: 'A4',
                orientation: 'landscape',
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
        } else {
            pdfOption = JSON.parse(pdfOptionJSON);
            pdfOption.base = 'file://' + join(__dirname, '/../../Templates/assets/');
        }
        return await Report.Generate(key, { header: {}, body: info }, null, pdfOption);
    }

    public async PrintOPDueCollectionReport(apiReq?: ApiRequest<PatientPaymentDetailsFilters>): Promise<any> {
        let data = await this.GetPatientPaymentDetails(apiReq);
        let FromDate = apiReq.Data.FromDate;
        let ToDate = apiReq.Data.ToDate;
        let FacilityName = apiReq.Data.FacilityName;
        let UserName = apiReq.Data.UserName;
        let PatientPaymentDetailsData = data.Data;
        let PatientDue: any = {};
        let TotCashDue: number = 0;
        let TotCardDue: number = 0;
        let TotChequeOthersDue: number = 0;
        let TotDues: number = 0;
        let PaymentOPDueCollections: any = [];

        for (let idx in PatientPaymentDetailsData) {
            PatientDue = PatientPaymentDetailsData[idx];
            let ReceiptDate = PatientDue.ReceiptDateTime;
            let ReceiptNumber = PatientDue.ReceiptNumber;
            let BillNumber = PatientDue.PatientBill.BillNumber;
            let DoctorName = '';
            let PatientName = '';
            let Cash = 0;
            let Card = 0;
            let ChequeOthers = 0;

            if (PatientDue.User && PatientDue.User.Title && PatientDue.User.Title.Description)
                DoctorName += PatientDue.User.Title.Description;

            if (PatientDue.User && PatientDue.User.FirstName)
                DoctorName += ' ' + PatientDue.User.FirstName;

            if (PatientDue.User && PatientDue.User.LastName)
                DoctorName += ' ' + PatientDue.User.LastName;

            if (PatientDue.Patient && PatientDue.Patient.Title && PatientDue.Patient.Title.Description)
                PatientName += PatientDue.Patient.Title.Description;

            if (PatientDue.Patient && PatientDue.Patient.FirstName)
                PatientName += ' ' + PatientDue.Patient.FirstName;

            if (PatientDue.Patient && PatientDue.Patient.LastName)
                PatientName += ' ' + PatientDue.Patient.LastName;

            if (PatientDue.Patient && PatientDue.Patient.MRN)
                PatientName += '/' + PatientDue.Patient.MRN;

            if (!PatientName)
                PatientName = PatientDue.PatientName;

            if (PatientDue.ReceiptTypeId === 3 && PatientDue.PatientBill) {
                if (PatientDue.PaymentTypeId === 1 && PatientDue.ReceiptStatusId === 1) {
                    Cash = PatientDue.AmountPaid;
                    TotCashDue += PatientDue.AmountPaid;
                    TotDues += PatientDue.AmountPaid;
                } else if (PatientDue.PaymentTypeId === 5 || PatientDue.PaymentTypeId === 6
                    && PatientDue.ReceiptStatusId === 1) {
                    Card = PatientDue.AmountPaid;
                    TotCardDue += PatientDue.AmountPaid;
                    TotDues += PatientDue.AmountPaid;
                } else if (PatientDue.PaymentTypeId === 2 && PatientDue.PaymentTypeId === 3
                    && PatientDue.PaymentTypeId === 4 && PatientDue.ReceiptStatusId === 1) {
                    ChequeOthers = PatientDue.AmountPaid;
                    TotChequeOthersDue += PatientDue.AmountPaid;
                    TotDues += PatientDue.AmountPaid;
                }
                if (PatientDue.PaymentTypeId === 1) { // CASH
                    Card = 0;
                    ChequeOthers = 0;
                } else if (PatientDue.PaymentTypeId === 5
                    || PatientDue.PaymentTypeId === 6) { //CARD
                    Cash = 0;
                    ChequeOthers = 0;
                } else if (PatientDue.PaymentTypeId === 2 || PatientDue.PaymentTypeId === 3
                    || PatientDue.PaymentTypeId === 4) { // CHEQUE
                    Cash = 0;
                    Card = 0;
                }
                if (Cash > 0 || Card > 0 || ChequeOthers > 0) {
                    //$scope.TotDues += (Cash + Card + ChequeOthers);
                    let PaymentCollectionModel = {
                        ReceiptDate: ReceiptDate,
                        ReceiptNumber: ReceiptNumber,
                        BillNumber: BillNumber,
                        DoctorName: DoctorName,
                        PatientName: PatientName,
                        Cash: Cash,
                        Card: Card,
                        ChequeOthers: ChequeOthers,
                    };
                    PaymentOPDueCollections.push(PaymentCollectionModel);
                }

            }
        }
        let facilityPreferenceBO = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(PatientDue.FacilityId);
        let info = {
            PaymentOPDueCollections: PaymentOPDueCollections,
            Preferences: printPreferencesData,
            FromDate: FromDate,
            ToDate: ToDate,
            FacilityName: FacilityName,
            UserName: UserName,
            TotCashDue: TotCashDue,
            TotCardDue: TotCardDue,
            TotChequeOthersDue: TotChequeOthersDue,
            TotDues: TotDues,
        };
        let pdfOption: any = null;
        let key = 'opduecollectreport';
        let pdfOptionJSON = await Report.GetPdfOption(key);
        if (!pdfOptionJSON) {
            pdfOption = {
                format: 'A4',
                orientation: 'landscape',
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
        } else {
            pdfOption = JSON.parse(pdfOptionJSON);
            pdfOption.base = 'file://' + join(__dirname, '/../../Templates/assets/');
        }
        return await Report.Generate(key, { header: {}, body: info }, null, pdfOption);
    }
    public async PrintIPDueCollectionReport(apiReq?: ApiRequest<PatientPaymentDetailsFilters>): Promise<any> {
        let data = await this.GetPatientPaymentDetails(apiReq);
        let FromDate = apiReq.Data.FromDate;
        let ToDate = apiReq.Data.ToDate;
        let FacilityName = apiReq.Data.FacilityName;
        let UserName = apiReq.Data.UserName;
        let PatientPaymentDetailsData = data.Data;
        let PatientDue: any = {};
        let TotCashDue: number = 0;
        let TotCardDue: number = 0;
        let TotChequeOthersDue: number = 0;
        let TotDues: number = 0;
        let PaymentOPDueCollections: any = [];

        for (let idx in PatientPaymentDetailsData) {
            PatientDue = PatientPaymentDetailsData[idx];
            let ReceiptDate = PatientDue.ReceiptDateTime;
            let ReceiptNumber = PatientDue.ReceiptNumber;
            let BillNumber = PatientDue.PatientBill.BillNumber;
            let DoctorName = '';
            let PatientName = '';
            let Cash = 0;
            let Card = 0;
            let ChequeOthers = 0;

            if (PatientDue.User && PatientDue.User.Title && PatientDue.User.Title.Description)
                DoctorName += PatientDue.User.Title.Description;

            if (PatientDue.User && PatientDue.User.FirstName)
                DoctorName += ' ' + PatientDue.User.FirstName;

            if (PatientDue.User && PatientDue.User.LastName)
                DoctorName += ' ' + PatientDue.User.LastName;

            if (PatientDue.Patient && PatientDue.Patient.Title && PatientDue.Patient.Title.Description)
                PatientName += PatientDue.Patient.Title.Description;

            if (PatientDue.Patient && PatientDue.Patient.FirstName)
                PatientName += ' ' + PatientDue.Patient.FirstName;

            if (PatientDue.Patient && PatientDue.Patient.LastName)
                PatientName += ' ' + PatientDue.Patient.LastName;

            if (PatientDue.Patient && PatientDue.Patient.MRN)
                PatientName += '/' + PatientDue.Patient.MRN;

            if (!PatientName)
                PatientName = PatientDue.PatientName;

            if (PatientDue.ReceiptTypeId === 3 && PatientDue.PatientBill) {
                if (PatientDue.PaymentTypeId === 1 && PatientDue.ReceiptStatusId === 1) {
                    Cash = PatientDue.AmountPaid;
                    TotCashDue += PatientDue.AmountPaid;
                    TotDues += PatientDue.AmountPaid;
                } else if (PatientDue.PaymentTypeId === 5 || PatientDue.PaymentTypeId === 6
                    && PatientDue.ReceiptStatusId === 1) {
                    Card = PatientDue.AmountPaid;
                    TotCardDue += PatientDue.AmountPaid;
                    TotDues += PatientDue.AmountPaid;
                } else if (PatientDue.PaymentTypeId === 2 && PatientDue.PaymentTypeId === 3
                    && PatientDue.PaymentTypeId === 4 && PatientDue.ReceiptStatusId === 1) {
                    ChequeOthers = PatientDue.AmountPaid;
                    TotChequeOthersDue += PatientDue.AmountPaid;
                    TotDues += PatientDue.AmountPaid;
                }
                if (PatientDue.PaymentTypeId === 1) { // CASH
                    Card = 0;
                    ChequeOthers = 0;
                } else if (PatientDue.PaymentTypeId === 5
                    || PatientDue.PaymentTypeId === 6) { //CARD
                    Cash = 0;
                    ChequeOthers = 0;
                } else if (PatientDue.PaymentTypeId === 2 || PatientDue.PaymentTypeId === 3
                    || PatientDue.PaymentTypeId === 4) { // CHEQUE
                    Cash = 0;
                    Card = 0;
                }
                if (Cash > 0 || Card > 0 || ChequeOthers > 0) {
                    //$scope.TotDues += (Cash + Card + ChequeOthers);
                    let PaymentCollectionModel = {
                        ReceiptDate: ReceiptDate,
                        ReceiptNumber: ReceiptNumber,
                        BillNumber: BillNumber,
                        DoctorName: DoctorName,
                        PatientName: PatientName,
                        Cash: Cash,
                        Card: Card,
                        ChequeOthers: ChequeOthers,
                    };
                    PaymentOPDueCollections.push(PaymentCollectionModel);
                }

            }
        }
        let facilityPreferenceBO = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(PatientDue.FacilityId);
        let info = {
            PaymentOPDueCollections: PaymentOPDueCollections,
            Preferences: printPreferencesData,
            FromDate: FromDate,
            ToDate: ToDate,
            FacilityName: FacilityName,
            UserName: UserName,
            TotCashDue: TotCashDue,
            TotCardDue: TotCardDue,
            TotChequeOthersDue: TotChequeOthersDue,
            TotDues: TotDues,
        };
        let pdfOption: any = null;
        let key = 'ipduecollectreport';
        let pdfOptionJSON = await Report.GetPdfOption(key);
        if (!pdfOptionJSON) {
            pdfOption = {
                format: 'A4',
                orientation: 'landscape',
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
        } else {
            pdfOption = JSON.parse(pdfOptionJSON);
            pdfOption.base = 'file://' + join(__dirname, '/../../Templates/assets/');
        }
        return await Report.Generate(key, { header: {}, body: info }, null, pdfOption);
    }

    public async PrintPharmacyCollectionSummaryCashier(req: BaseRequest): Promise<any> {
        let FromDate = req.Data.FromDate;
        let ToDate = req.Data.ToDate;
        let FacilityName = req.Data.FacilityName;
        let UserName = req.Data.UserName;
        let UserData: any = [];
        let UserReq = req;
        UserData = await this.GetPharmacyCollectionSummary(UserReq);
        // DoctorData = DoctorData;
        let facilityPreferenceBO = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(UserReq.Data.FacilityId);
        let UserCollection = [];
        let NetUserCollection = [];


        if (UserData) {
            let pharmausersales = [];
            let pharmauserreturns = [];
            let ippharmacysales = [];
            let ippharmacyreturns = [];

            if (UserData.length > 0) {
                pharmausersales = UserData[0].Value;
            }
            if (UserData.length > 1) {
                pharmauserreturns = UserData[1].Value;
            }
            if (UserData.length > 2) {
                ippharmacysales = UserData[2].Value;
            }
            if (UserData.length > 3) {
                ippharmacyreturns = UserData[3].Value;
            }
            for (let idx in pharmausersales) {
                let usercol = pharmausersales[idx];
                let Key = '';
                let CashAmt: any;
                let CardAmt: any;
                let OtherAmt: any;
                let DueCollectAmt: any;
                for (let ix in usercol) {
                    UserName = '';
                    if (usercol[ix].UserName) {
                        if (usercol[ix].UserName.Title)
                            UserName = usercol[ix].UserName.Title.Description;
                        if (usercol[ix].UserName.FirstName)
                            UserName += ' ' + usercol[ix].UserName.FirstName;
                        if (usercol[ix].UserName.LastName)
                            UserName += ' ' + usercol[ix].UserName.LastName;
                    }
                    if (usercol[ix].CashAmount) {
                        CashAmt = parseFloat(usercol[ix].CashAmount).toFixed(2);
                    }
                    if (usercol[ix].CardAmount) {
                        CardAmt = parseFloat(usercol[ix].CardAmount).toFixed(2);
                    }
                    if (usercol[ix].OtherAmount) {
                        OtherAmt = parseFloat(usercol[ix].OtherAmount).toFixed(2);
                    }
                    if (usercol[ix].DueCollection) {
                        DueCollectAmt = parseFloat(usercol[ix].DueCollection).toFixed(2);
                    }
                    Key = UserName;
                    CashAmt = CashAmt;
                    CardAmt = CardAmt;
                    OtherAmt = OtherAmt;
                    DueCollectAmt = DueCollectAmt;
                }
                UserCollection.push({
                    'Key': Key,
                    'Value': {
                        'CashAmt': CashAmt,
                        'CardAmt': CardAmt,
                        'OtherAmt': OtherAmt,
                        'DueCollectAmt': DueCollectAmt,
                        'NetReturnAmt': 0.00,
                        'CashReturnAmt': 0.00,
                        'CardReturnAmt': 0.00,
                        'OtherReturnAmt': 0.00,
                        'TotalBillAmt': 0.00,
                        'DueBalance': 0.00,
                        'IPSaleAmt': 0.00,
                        'IPReturnAmt': 0.00
                    }
                });

            }
            for (let idx in pharmauserreturns) {
                let usercol = pharmauserreturns[idx];
                let Key = '';
                let NetReturnAmt: any;
                let CashReturnAmt: any;
                let CardReturnAmt: any;
                let OtherReturnAmt: any;
                for (let ix in usercol) {
                    UserName = '';
                    if (usercol[ix].UserName) {
                        if (usercol[ix].UserName.Title)
                            UserName = usercol[ix].UserName.Title.Description;
                        if (usercol[ix].UserName.FirstName)
                            UserName += ' ' + usercol[ix].UserName.FirstName;
                        if (usercol[ix].UserName.LastName)
                            UserName += ' ' + usercol[ix].UserName.LastName;
                    }
                    if (usercol[ix].NetRefundAmount) {
                        NetReturnAmt = parseFloat(usercol[ix].NetRefundAmount).toFixed(2);
                    }
                    if (usercol[ix].CashRefundAmount) {
                        CashReturnAmt = parseFloat(usercol[ix].CashRefundAmount).toFixed(2);
                    }
                    if (usercol[ix].CardRefundAmount) {
                        CardReturnAmt = parseFloat(usercol[ix].CardRefundAmount).toFixed(2);
                    }
                    if (usercol[ix].OtherRefundAmount) {
                        OtherReturnAmt = parseFloat(usercol[ix].OtherRefundAmount).toFixed(2);
                    }
                    Key = UserName;
                    NetReturnAmt = NetReturnAmt;
                    CashReturnAmt = CashReturnAmt;
                    CardReturnAmt = CardReturnAmt;
                    OtherReturnAmt = OtherReturnAmt;
                }
                let valappended = 0;
                UserCollection.forEach(function (item) {
                    if (Key === item.Key) {
                        item.Value.NetReturnAmt = NetReturnAmt;
                        item.Value.CashReturnAmt = CashReturnAmt;
                        item.Value.CardReturnAmt = CardReturnAmt;
                        item.Value.OtherReturnAmt = OtherReturnAmt;
                        valappended = 1;
                    }
                });

                if (valappended === 0)
                    UserCollection.push({
                        'Key': Key,
                        'Value': {
                            'CashAmt': 0.00,
                            'CardAmt': 0.00,
                            'OtherAmt': 0.00,
                            'DueCollectAmt': 0.00,
                            'NetReturnAmt': NetReturnAmt,
                            'CashReturnAmt': CashReturnAmt,
                            'CardReturnAmt': CardReturnAmt,
                            'OtherReturnAmt': OtherReturnAmt,
                            'TotalBillAmt': 0.00,
                            'DueBalance': 0.00,
                            'IPSaleAmt': 0.00,
                            'IPReturnAmt': 0.00
                        }
                    });

            }
            for (let idx in ippharmacysales) {
                let usercol = ippharmacysales[idx];
                let Key = '';
                let TotalBillAmt: any;
                let DueBalance: any;
                let IPSaleAmt: any;
                for (let ix in usercol) {
                    UserName = '';
                    if (usercol[ix].UserName) {
                        if (usercol[ix].UserName.Title)
                            UserName = usercol[ix].UserName.Title.Description;
                        if (usercol[ix].UserName.FirstName)
                            UserName += ' ' + usercol[ix].UserName.FirstName;
                        if (usercol[ix].UserName.LastName)
                            UserName += ' ' + usercol[ix].UserName.LastName;
                    }
                    if (usercol[ix].IPSaleAmount) {
                        IPSaleAmt = parseFloat(usercol[ix].IPSaleAmount).toFixed(2);
                    }
                    if (usercol[ix].TotalBillAmt) {
                        TotalBillAmt = parseFloat(usercol[ix].TotalBillAmt).toFixed(2);
                    }
                    if (usercol[ix].BalanceDue) {
                        DueBalance = parseFloat(usercol[ix].BalanceDue).toFixed(2);
                    }
                    Key = UserName;
                    IPSaleAmt = IPSaleAmt;
                    TotalBillAmt = TotalBillAmt;
                    DueBalance = DueBalance;
                }
                let valappended = 0;
                UserCollection.forEach(function (item) {
                    if (Key === item.Key) {
                        item.Value.IPSaleAmt = IPSaleAmt;
                        item.Value.TotalBillAmt = TotalBillAmt;
                        item.Value.DueBalance = DueBalance;
                        valappended = 1;
                    }
                });

                if (valappended === 0)
                    UserCollection.push({
                        'Key': Key,
                        'Value': {
                            'CashAmt': 0.00,
                            'CardAmt': 0.00,
                            'OtherAmt': 0.00,
                            'DueCollectAmt': 0.00,
                            'NetReturnAmt': 0.00,
                            'CashReturnAmt': 0.00,
                            'CardReturnAmt': 0.00,
                            'OtherReturnAmt': 0.00,
                            'TotalBillAmt': TotalBillAmt,
                            'DueBalance': DueBalance,
                            'IPSaleAmt': IPSaleAmt,
                            'IPReturnAmt': 0.00
                        }
                    });

            }
            for (let idx in ippharmacyreturns) {
                let usercol = ippharmacyreturns[idx];
                let Key = '';
                let IPReturnAmt: any;
                for (let ix in usercol) {
                    UserName = '';
                    if (usercol[ix].UserName) {
                        if (usercol[ix].UserName.Title)
                            UserName = usercol[ix].UserName.Title.Description;
                        if (usercol[ix].UserName.FirstName)
                            UserName += ' ' + usercol[ix].UserName.FirstName;
                        if (usercol[ix].UserName.LastName)
                            UserName += ' ' + usercol[ix].UserName.LastName;
                    }
                    if (usercol[ix].IPReturnAmount) {
                        IPReturnAmt = parseFloat(usercol[ix].IPReturnAmount).toFixed(2);
                    }
                    Key = UserName;
                    IPReturnAmt = IPReturnAmt;
                }
                let valappended = 0;
                UserCollection.forEach(function (item) {
                    if (Key === item.Key) {
                        item.Value.IPReturnAmt = IPReturnAmt;
                        valappended = 1;
                    }
                });

                if (valappended === 0)
                    UserCollection.push({
                        'Key': Key,
                        'Value': {
                            'CashAmt': 0.00,
                            'CardAmt': 0.00,
                            'OtherAmt': 0.00,
                            'DueCollectAmt': 0.00,
                            'NetReturnAmt': 0.00,
                            'CashReturnAmt': 0.00,
                            'CardReturnAmt': 0.00,
                            'OtherReturnAmt': 0.00,
                            'TotalBillAmt': 0.00,
                            'DueBalance': 0.00,
                            'IPSaleAmt': 0.00,
                            'IPReturnAmt': IPReturnAmt
                        }
                    });

            }
        }
        for (let idx in UserCollection) {
            let collectiondetails = UserCollection[idx];
            let netCash: any;
            let netCard: any;
            let netOther: any;
            let netip: any;
            let netSales: any;
            let sales: any;
            let netreturn: any;

            netCash = parseFloat(collectiondetails.Value.CashAmt || 0) - parseFloat(collectiondetails.Value.CashReturnAmt || 0);
            netCard = parseFloat(collectiondetails.Value.CardAmt || 0) - parseFloat(collectiondetails.Value.CardReturnAmt || 0);
            netOther = parseFloat(collectiondetails.Value.OtherAmt || 0) - parseFloat(collectiondetails.Value.OtherReturnAmt || 0);
            netip = parseFloat(collectiondetails.Value.IPSaleAmt || 0) - parseFloat(collectiondetails.Value.IPReturnAmt || 0);
            netSales = (parseFloat(collectiondetails.Value.CashAmt || 0) + parseFloat(collectiondetails.Value.CardAmt || 0) +
                parseFloat(collectiondetails.Value.OtherAmt || 0) +
                parseFloat(collectiondetails.Value.IPSaleAmt || 0)) - (parseFloat(collectiondetails.Value.CashReturnAmt || 0)
                    + parseFloat(collectiondetails.Value.CardReturnAmt || 0) + parseFloat(collectiondetails.Value.OtherReturnAmt || 0) +
                    parseFloat(collectiondetails.Value.IPReturnAmt || 0));
            sales = parseFloat(collectiondetails.Value.CashAmt || 0) +
                parseFloat(collectiondetails.Value.CardAmt || 0)
                + parseFloat(collectiondetails.Value.OtherAmt || 0) +
                parseFloat(collectiondetails.Value.IPSaleAmt || 0);
            netreturn = parseFloat(collectiondetails.Value.CashReturnAmt || 0) + parseFloat(collectiondetails.Value.CardReturnAmt || 0) +
                parseFloat(collectiondetails.Value.OtherReturnAmt || 0) +
                parseFloat(collectiondetails.Value.IPReturnAmt || 0);
            let usercollect = {
                Key: collectiondetails.Key,
                TotalBillAmt: collectiondetails.Value.TotalBillAmt || 0,
                DueBalance: collectiondetails.Value.DueBalance || 0,
                DueCollectAmt: collectiondetails.Value.DueCollectAmt || 0,
                CashAmt: collectiondetails.Value.CashAmt || 0,
                CashReturnAmt: collectiondetails.Value.CashReturnAmt || 0,
                NetCash: netCash || 0,
                CardAmt: collectiondetails.Value.CardAmt || 0,
                CardReturnAmt: collectiondetails.Value.CardReturnAmt || 0,
                NetCard: netCard || 0,
                OtherAmt: collectiondetails.Value.OtherAmt || 0,
                OtherReturnAmt: collectiondetails.Value.OtherReturnAmt || 0,
                NetOther: netOther || 0,
                IPSaleAmt: collectiondetails.Value.IPSaleAmt || 0,
                IPReturnAmt: collectiondetails.Value.IPReturnAmt || 0,
                NetIP: netip || 0,
                Sales: sales || 0,
                Return: netreturn || 0,
                NetSales: (netSales).toFixed(2),
            };
            NetUserCollection.push(usercollect);
        }
        let TotBillAmt = 0;
        let TotDueBl = 0;
        let TotDueCol = 0;
        let TotalCashAmt = 0;
        let TotalCashRetAmt = 0;
        let TotalNetCash = 0;
        let TotalCardAmt = 0;
        let TotalCardRetAmt = 0;
        let TotalNetCard = 0;
        let TotalOtherAmt = 0;
        let TotalOtherRetAmt = 0;
        let TotalNetOther = 0;
        let TotalIPSale = 0;
        let TotalIPRet = 0;
        let TotalNetIP = 0;
        let TotalSales = 0;
        let TotalReturn = 0;
        let TotalNetSales = 0;
        for (let jdx in NetUserCollection) {
            let netcollection = NetUserCollection[jdx];
            TotBillAmt = TotBillAmt + parseFloat(netcollection.TotalBillAmt || 0);
            TotDueBl = TotDueBl + parseFloat(netcollection.DueBalance || 0);
            TotDueCol = TotDueCol + parseFloat(netcollection.DueCollectAmt || 0);
            TotalCashAmt = TotalCashAmt + parseFloat(netcollection.CashAmt || 0);
            TotalCashRetAmt = TotalCashRetAmt + parseFloat(netcollection.CashReturnAmt || 0);
            TotalNetCash = TotalNetCash + parseFloat(netcollection.NetCash || 0);
            TotalCardAmt = TotalCardAmt + parseFloat(netcollection.CardAmt || 0);
            TotalCardRetAmt = TotalCardRetAmt + parseFloat(netcollection.CardReturnAmt || 0);
            TotalNetCard = TotalNetCard + parseFloat(netcollection.NetCard || 0);
            TotalOtherAmt = TotalOtherAmt + parseFloat(netcollection.OtherAmt || 0);
            TotalOtherRetAmt = TotalOtherRetAmt + parseFloat(netcollection.OtherReturnAmt || 0);
            TotalNetOther = TotalNetOther + parseFloat(netcollection.NetOther || 0);
            TotalIPSale = TotalIPSale + parseFloat(netcollection.IPSaleAmt || 0);
            TotalIPRet = TotalIPRet + parseFloat(netcollection.IPReturnAmt || 0);
            TotalNetIP = TotalNetIP + parseFloat(netcollection.NetIP || 0);
            TotalSales = TotalSales + parseFloat(netcollection.Sales || 0);
            TotalReturn = TotalReturn + parseFloat(netcollection.Return || 0);
            TotalNetSales = TotalNetSales + parseFloat(netcollection.NetSales || 0);
        }
        TotBillAmt = TotBillAmt;
        TotDueBl = TotDueBl;
        TotDueCol = TotDueCol;
        TotalCashAmt = TotalCashAmt;
        TotalCashRetAmt = TotalCashRetAmt;
        TotalNetCash = TotalNetCash;
        TotalCardAmt = TotalCardAmt;
        TotalCardRetAmt = TotalCardRetAmt;
        TotalNetCard = TotalNetCard;
        TotalOtherAmt = TotalOtherAmt;
        TotalOtherRetAmt = TotalOtherRetAmt;
        TotalNetOther = TotalNetOther;
        TotalIPSale = TotalIPSale;
        TotalIPRet = TotalIPRet;
        TotalNetIP = TotalNetIP;
        TotalSales = TotalSales;
        TotalReturn = TotalReturn;
        TotalNetSales = TotalNetSales;
        let info = {
            FromDate: FromDate,
            ToDate: ToDate,
            Preferences: printPreferencesData,
            UserName: UserName,
            NetUserCollection: NetUserCollection,
            FacilityName: FacilityName,
            TotBillAmt: TotBillAmt,
            TotDueBl: TotDueBl,
            TotDueCol: TotDueCol,
            TotalCashAmt: TotalCashAmt,
            TotalCashRetAmt: TotalCashRetAmt,
            TotalNetCash: TotalNetCash,
            TotalCardAmt: TotalCardAmt,
            TotalCardRetAmt: TotalCardRetAmt,
            TotalNetCard: TotalNetCard,
            TotalOtherAmt: TotalOtherAmt,
            TotalOtherRetAmt: TotalOtherRetAmt,
            TotalNetOther: TotalNetOther,
            TotalIPSale: TotalIPSale,
            TotalIPRet: TotalIPRet,
            TotalNetIP: TotalNetIP,
            TotalSales: TotalSales,
            TotalReturn: TotalReturn,
            TotalNetSales: TotalNetSales,

        };
        let pdfOption: any = null;
        let key = 'pharmacycollectionsummarybycashier';
        let pdfOptionJSON = await Report.GetPdfOption(key);
        if (!pdfOptionJSON) {
            pdfOption = {
                format: 'A4',
                orientation: 'landscape',
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
        } else {
            pdfOption = JSON.parse(pdfOptionJSON);
            pdfOption.base = 'file://' + join(__dirname, '/../../Templates/assets/');
        }
        return await Report.Generate(key, { header: {}, body: info }, null, pdfOption);
    }
    public async PrintOPIPCollectionSummaryCashier(req: BaseRequest): Promise<any> {
        let dateformat = 'DD/MM/YYYY';
        let timeformat = 'HH:mm:ss';
        let fromdate = moment(req.Data.FromDate).format(dateformat);
        let FromTime = moment(req.Data.FromDate).format(timeformat);
        let FromDate = fromdate + ' ' + FromTime;

        let todate = moment(req.Data.ToDate).format(dateformat);
        let totime = moment(req.Data.ToDate).format(timeformat);
        let ToDate = todate + ' ' + totime;

        let FacilityId = req.Data.FacilityId;
        let FacilityName = req.Data.FacilityName;
        let UserName = req.Data.UserName;
        let BillingCollection: any = [];
        let UserReq = req;
        BillingCollection = await this.GetBillingCollectionSummary(UserReq);
        // DoctorData = DoctorData;
        let facilityPreferenceBO = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(FacilityId);
        let UserCollection = [];
        let NetUserCollection = [];


        if (BillingCollection) {
            let billusercollection = [];
            let billuserrefund = [];
            let billcollection = [];
            let expensecollection = [];
            let vochercollection = [];
            if (BillingCollection.length > 0) {
                billusercollection = BillingCollection[0].Value;
            }
            if (BillingCollection.length > 1) {
                billuserrefund = BillingCollection[1].Value;
            }
            if (BillingCollection.length > 2) {
                billcollection = BillingCollection[2].Value;
            }
            if (BillingCollection.length > 3) {
                expensecollection = BillingCollection[3].Value;
            }
            if (BillingCollection.length > 4) {
                vochercollection = BillingCollection[4].Value;
            }
            for (let idx in billusercollection) {
                let usercol = billusercollection[idx];
                let Key = '';
                let CashAmt = 0;
                let CardAmt = 0;
                let OtherAmt = 0;
                let NetBankingAmt = 0;
                let UPIAmt = 0;
                // let DueCollectAmt = 0;
                for (let ix in usercol) {
                    UserName = '';
                    if (usercol[ix].UserName) {
                        if (usercol[ix].UserName.Title)
                            UserName = usercol[ix].UserName.Title.Description;
                        if (usercol[ix].UserName.FirstName)
                            UserName += ' ' + usercol[ix].UserName.FirstName;
                        if (usercol[ix].UserName.LastName)
                            UserName += ' ' + usercol[ix].UserName.LastName;
                    }
                    if (usercol[ix].CashAmount) {
                        CashAmt = usercol[ix].CashAmount;
                    }
                    if (usercol[ix].CardAmount) {
                        CardAmt = usercol[ix].CardAmount;
                    }
                    if (usercol[ix].OtherAmount) {
                        OtherAmt = usercol[ix].OtherAmount;
                    }
                    if (usercol[ix].NetBankingAmount) {
                        NetBankingAmt = usercol[ix].NetBankingAmount;
                    }
                    if (usercol[ix].UPIAmount) {
                        UPIAmt = usercol[ix].UPIAmount;
                    }
                    // if (usercol[ix].DueCollection) {
                    //     DueCollectAmt = usercol[ix].DueCollection;
                    // }
                    Key = UserName;
                    CashAmt = CashAmt;
                    CardAmt = CardAmt;
                    OtherAmt = OtherAmt;
                    NetBankingAmt = NetBankingAmt;
                    UPIAmt = UPIAmt;
                    // DueCollectAmt = DueCollectAmt;
                }
                UserCollection.push({
                    'Key': Key,
                    'Value': {
                        'CashAmt': CashAmt,
                        'CardAmt': CardAmt,
                        'OtherAmt': OtherAmt,
                        'NetBankingAmt': NetBankingAmt,
                        'UPIAmt': UPIAmt,
                        'NetRefundAmt': 0.00,
                        'CashRefundAmt': 0.00,
                        'CardRefundAmt': 0.00,
                        'OtherRefundAmt': 0.00,
                        'NetBankingRefundAmt': 0.00,
                        'UPIRefundAmt': 0.00,
                        'TotalBillAmt': 0.00,
                        'CashExpAmt': 0.00,
                        'OtherExpAmt': 0.00,
                        'CashVocAmt': 0.00,
                        'OtherVocAmt': 0.00,
                        // 'DueCollectAmt': DueCollectAmt
                    }
                });

            }
            for (let idx in billuserrefund) {
                let usercol = billuserrefund[idx];
                let Key = '';
                let NetRefundAmt = 0;
                let CashRefundAmt = 0;
                let CardRefundAmt = 0;
                let OtherRefundAmt = 0;
                let NetBankingRefundAmt = 0;
                let UPIRefundAmt = 0;
                for (let ix in usercol) {
                    UserName = '';
                    if (usercol[ix].UserName) {
                        if (usercol[ix].UserName.Title)
                            UserName = usercol[ix].UserName.Title.Description;
                        if (usercol[ix].UserName.FirstName)
                            UserName += ' ' + usercol[ix].UserName.FirstName;
                        if (usercol[ix].UserName.LastName)
                            UserName += ' ' + usercol[ix].UserName.LastName;
                    }
                    if (usercol[ix].NetRefundAmount) {
                        NetRefundAmt = usercol[ix].NetRefundAmount;
                    }
                    if (usercol[ix].CashRefundAmount) {
                        CashRefundAmt = usercol[ix].CashRefundAmount;
                    }
                    if (usercol[ix].CardRefundAmount) {
                        CardRefundAmt = usercol[ix].CardRefundAmount;
                    }
                    if (usercol[ix].OtherRefundAmount) {
                        OtherRefundAmt = usercol[ix].OtherRefundAmount;
                    }
                    if (usercol[ix].NetBankingRefundAmount) {
                        NetBankingRefundAmt = usercol[ix].NetBankingRefundAmount;
                    }
                    if (usercol[ix].UPIRefundAmount) {
                        UPIRefundAmt = usercol[ix].UPIRefundAmount;
                    }
                    Key = UserName;
                    NetRefundAmt = NetRefundAmt;
                    CashRefundAmt = CashRefundAmt;
                    CardRefundAmt = CardRefundAmt;
                    OtherRefundAmt = OtherRefundAmt;
                    NetBankingRefundAmt = NetBankingRefundAmt;
                    UPIRefundAmt = UPIRefundAmt;
                }
                let valappended = 0;
                UserCollection.forEach(function (item) {
                    if (Key === item.Key) {
                        item.Value.NetRefundAmt = NetRefundAmt;
                        item.Value.CashRefundAmt = CashRefundAmt;
                        item.Value.CardRefundAmt = CardRefundAmt;
                        item.Value.OtherRefundAmt = OtherRefundAmt;
                        item.Value.NetBankingRefundAmt = NetBankingRefundAmt;
                        item.Value.UPIRefundAmt = UPIRefundAmt;
                        valappended = 1;
                    }
                });

                if (valappended === 0)
                    UserCollection.push({
                        'Key': Key,
                        'Value': {
                            'CashAmt': 0.00,
                            'CardAmt': 0.00,
                            'OtherAmt': 0.00,
                            'NetBankingAmt': 0.00,
                            'UPIAmt': 0.00,
                            'NetRefundAmt': NetRefundAmt,
                            'CashRefundAmt': CashRefundAmt,
                            'CardRefundAmt': CardRefundAmt,
                            'OtherRefundAmt': OtherRefundAmt,
                            'NetBankingRefundAmt': NetBankingRefundAmt,
                            'UPIRefundAmt': UPIRefundAmt,
                            'TotalBillAmt': 0.00,
                            'CashExpAmt': 0.00,
                            'OtherExpAmt': 0.00,
                            'CashVocAmt': 0.00,
                            'OtherVocAmt': 0.00,
                        }
                    });

            }
            for (let idx in billcollection) {
                let usercol = billcollection[idx];
                let Key = '';
                let TotalBillAmt = 0;
                // let DueBalance = 0;
                // let IPSaleAmt = 0;
                for (let ix in usercol) {
                    UserName = '';
                    if (usercol[ix].UserName) {
                        if (usercol[ix].UserName.Title)
                            UserName = usercol[ix].UserName.Title.Description;
                        if (usercol[ix].UserName.FirstName)
                            UserName += ' ' + usercol[ix].UserName.FirstName;
                        if (usercol[ix].UserName.LastName)
                            UserName += ' ' + usercol[ix].UserName.LastName;
                    }
                    // if (usercol[ix].IPSaleAmount) {
                    //     IPSaleAmt = usercol[ix].IPSaleAmount;
                    // }
                    if (usercol[ix].TotalBillAmt) {
                        TotalBillAmt = usercol[ix].TotalBillAmt;
                    }
                    // if (usercol[ix].BalanceDue) {
                    //     DueBalance = usercol[ix].BalanceDue;
                    // }
                    Key = UserName;
                    // IPSaleAmt = IPSaleAmt;
                    TotalBillAmt = TotalBillAmt;
                    // DueBalance = DueBalance;
                }
                let valappended = 0;
                UserCollection.forEach(function (item) {
                    if (Key === item.Key) {
                        // item.Value.IPSaleAmt = IPSaleAmt;
                        item.Value.TotalBillAmt = TotalBillAmt;
                        // item.Value.DueBalance = DueBalance;
                        valappended = 1;
                    }
                });

                if (valappended === 0)
                    UserCollection.push({
                        'Key': Key,
                        'Value': {
                            'CashAmt': 0.00,
                            'CardAmt': 0.00,
                            'OtherAmt': 0.00,
                            'NetBankingAmt': 0.00,
                            'UPIAmt': 0.00,
                            'NetRefundAmt': 0.00,
                            'CashRefundAmt': 0.00,
                            'CardRefundAmt': 0.00,
                            'OtherRefundAmt': 0.00,
                            'NetBankingRefundAmt': 0.00,
                            'UPIRefundAmt': 0.00,
                            'TotalBillAmt': TotalBillAmt,
                            'CashExpAmt': 0.00,
                            'OtherExpAmt': 0.00,
                            'CashVocAmt': 0.00,
                            'OtherVocAmt': 0.00,
                        }
                    });

            }

            for (let idx in expensecollection) {
                let usercol = expensecollection[idx];
                let Key = '';
                // let NetExpAmt = 0;
                let CashExpAmt = 0;
                // let CardExpAmt = 0;
                let OtherExpAmt = 0;
                for (let ix in usercol) {
                    UserName = '';
                    if (usercol[ix].UserName) {
                        if (usercol[ix].UserName.Title)
                            UserName = usercol[ix].UserName.Title.Description;
                        if (usercol[ix].UserName.FirstName)
                            UserName += ' ' + usercol[ix].UserName.FirstName;
                        if (usercol[ix].UserName.LastName)
                            UserName += ' ' + usercol[ix].UserName.LastName;
                    }
                    // if (usercol[ix].NetExpAmount) {
                    //     NetExpAmt = usercol[ix].NetExpAmount;
                    // }
                    if (usercol[ix].CashExpAmt) {
                        CashExpAmt = usercol[ix].CashExpAmt;
                    }
                    // if (usercol[ix].CardExpAmount) {
                    //     CardExpAmt = usercol[ix].CardExpAmount;
                    // }
                    if (usercol[ix].OtherExpAmt) {
                        OtherExpAmt = usercol[ix].OtherExpAmt;
                    }
                    Key = UserName;
                    // NetExpAmt = NetExpAmt;
                    CashExpAmt = CashExpAmt;
                    // CardExpAmt = CardExpAmt;
                    OtherExpAmt = OtherExpAmt;
                }
                let valappended = 0;
                UserCollection.forEach(function (item) {
                    if (Key === item.Key) {
                        // item.Value.NetExpAmt = NetExpAmt;
                        item.Value.CashExpAmt = CashExpAmt;
                        // item.Value.CardExpAmt = CardExpAmt;
                        item.Value.OtherExpAmt = OtherExpAmt;
                        valappended = 1;
                    }
                });

                if (valappended === 0)
                    UserCollection.push({
                        'Key': Key,
                        'Value': {
                            'CashAmt': 0.00,
                            'CardAmt': 0.00,
                            'OtherAmt': 0.00,
                            'NetBankingAmt': 0.00,
                            'UPIAmt': 0.00,
                            'NetRefundAmt': 0.00,
                            'CashRefundAmt': 0.00,
                            'CardRefundAmt': 0.00,
                            'OtherRefundAmt': 0.00,
                            'NetBankingRefundAmt': 0.00,
                            'UPIRefundAmt': 0.00,
                            'TotalBillAmt': 0.00,
                            'CashExpAmt': CashExpAmt,
                            'OtherExpAmt': OtherExpAmt,
                            'CashVocAmt': 0.00,
                            'OtherVocAmt': 0.00,
                        }
                    });
            }
            for (let idx in vochercollection) {
                let usercol = vochercollection[idx];
                let Key = '';
                let CashVocAmt = 0;
                let OtherVocAmt = 0;
                for (let ix in usercol) {
                    UserName = '';
                    if (usercol[ix].UserName) {
                        if (usercol[ix].UserName.Title)
                            UserName = usercol[ix].UserName.Title.Description;
                        if (usercol[ix].UserName.FirstName)
                            UserName += ' ' + usercol[ix].UserName.FirstName;
                        if (usercol[ix].UserName.LastName)
                            UserName += ' ' + usercol[ix].UserName.LastName;
                    }
                    if (usercol[ix].CashVocAmt) {
                        CashVocAmt = usercol[ix].CashVocAmt;
                    }
                    if (usercol[ix].OtherVocAmt) {
                        OtherVocAmt = usercol[ix].OtherVocAmt;
                    }
                    Key = UserName;
                    CashVocAmt = CashVocAmt;
                    OtherVocAmt = OtherVocAmt;
                }
                let valappended = 0;
                UserCollection.forEach(function (item) {
                    if (Key === item.Key) {
                        item.Value.CashVocAmt = CashVocAmt;
                        item.Value.OtherVocAmt = OtherVocAmt;
                        valappended = 1;
                    }
                });

                if (valappended === 0)
                    UserCollection.push({
                        'Key': Key,
                        'Value': {
                            'CashAmt': 0.00,
                            'CardAmt': 0.00,
                            'OtherAmt': 0.00,
                            'NetBankingAmt': 0.00,
                            'UPIAmt': 0.00,
                            'NetRefundAmt': 0.00,
                            'CashRefundAmt': 0.00,
                            'CardRefundAmt': 0.00,
                            'OtherRefundAmt': 0.00,
                            'NetBankingRefundAmt': 0.00,
                            'UPIRefundAmt': 0.00,
                            'TotalBillAmt': 0.00,
                            'CashExpAmt': 0.00,
                            'OtherExpAmt': 0.00,
                            'CashVocAmt': CashVocAmt,
                            'OtherVocAmt': OtherVocAmt,

                        }
                    });
            }
            for (let idx in UserCollection) {
                let collectiondetails = UserCollection[idx];
                let usercollect = {
                    Key: collectiondetails.Key,
                    TotalBillAmt: collectiondetails.Value.TotalBillAmt,
                    // DueBalance: collectiondetails.Value.DueBalance,
                    // DueCollectAmt: collectiondetails.Value.DueCollectAmt,
                    CashAmt: collectiondetails.Value.CashAmt,
                    CashRefundAmt: collectiondetails.Value.CashRefundAmt,
                    NetCash: (collectiondetails.Value.CashAmt) - (collectiondetails.Value.CashRefundAmt),
                    CardAmt: collectiondetails.Value.CardAmt,
                    CardRefundAmt: collectiondetails.Value.CardRefundAmt,
                    NetCard: (collectiondetails.Value.CardAmt) - (collectiondetails.Value.CardRefundAmt),
                    OtherAmt: collectiondetails.Value.OtherAmt,
                    OtherRefundAmt: collectiondetails.Value.OtherRefundAmt,
                    NetOther: (collectiondetails.Value.OtherAmt) - (collectiondetails.Value.OtherRefundAmt),
                    NetBankingAmt: collectiondetails.Value.NetBankingAmt,
                    NetBankingRefundAmt: collectiondetails.Value.NetBankingRefundAmt,
                    NetNetBanking: (collectiondetails.Value.NetBankingAmt) - (collectiondetails.Value.NetBankingRefundAmt),
                    UPIAmt: collectiondetails.Value.UPIAmt,
                    UPIRefundAmt: collectiondetails.Value.UPIRefundAmt,
                    NetUPI: (collectiondetails.Value.UPIAmt) - (collectiondetails.Value.UPIRefundAmt),
                    CashExpAmt: collectiondetails.Value.CashExpAmt,
                    OtherExpAmt: collectiondetails.Value.OtherExpAmt,
                    CashVocAmt: collectiondetails.Value.CashVocAmt,
                    OtherVocAmt: collectiondetails.Value.OtherVocAmt,
                    CashCollection: ((collectiondetails.Value.CashAmt) - (collectiondetails.Value.CashRefundAmt)) -
                        (collectiondetails.Value.CashExpAmt) - (collectiondetails.Value.CashVocAmt),
                    Refund: (collectiondetails.Value.CashRefundAmt) + (collectiondetails.Value.CardRefundAmt) +
                        (collectiondetails.Value.OtherRefundAmt),
                    NetCollection: (((collectiondetails.Value.CashAmt) - (collectiondetails.Value.CashRefundAmt)) +
                        ((collectiondetails.Value.CardAmt) - (collectiondetails.Value.CardRefundAmt))
                        + ((collectiondetails.Value.OtherAmt) - (collectiondetails.Value.OtherRefundAmt)) +
                        ((collectiondetails.Value.NetBankingAmt) - (collectiondetails.Value.NetBankingRefundAmt)) +
                        ((collectiondetails.Value.UPIAmt) - (collectiondetails.Value.UPIRefundAmt))) -
                        ((collectiondetails.Value.CashExpAmt) + (collectiondetails.Value.OtherExpAmt) +
                            (collectiondetails.Value.CashVocAmt) + (collectiondetails.Value.OtherVocAmt)),
                };
                NetUserCollection.push(usercollect);
            }
        }


        let TotCash = 0;
        let TotCard = 0;
        let TotOther = 0;
        let TotNetBanking = 0;
        let TotUPI = 0;
        let TotCashExpense = 0;
        let TotOtherExpense = 0;
        let TotCashVoucher = 0;
        let TotOtherVoucher = 0;
        let TotalCashCollection = 0;
        let TotalCollection = 0;
        for (let jdx in NetUserCollection) {
            let netcollection = NetUserCollection[jdx];
            TotCash = TotCash + (netcollection.NetCash || 0);
            TotCard = TotCard + (netcollection.NetCard || 0);
            TotOther = TotOther + (netcollection.NetOther || 0);
            TotNetBanking = TotNetBanking + (netcollection.NetNetBanking || 0);
            TotUPI = TotUPI + (netcollection.NetUPI || 0);
            TotCashExpense = TotCashExpense + (netcollection.CashExpAmt || 0);
            TotOtherExpense = TotOtherExpense + (netcollection.OtherExpAmt || 0);
            TotCashVoucher = TotCashVoucher + (netcollection.CashVocAmt || 0);
            TotOtherVoucher = TotOtherVoucher + (netcollection.OtherVocAmt || 0);
            TotalCashCollection = TotalCashCollection + (netcollection.CashCollection || 0);
            TotalCollection = TotalCollection + (netcollection.NetCollection || 0);
        }
        TotCash = TotCash;
        TotCard = TotCard;
        TotOther = TotOther;
        TotNetBanking = TotNetBanking;
        TotUPI = TotUPI;
        TotCashExpense = TotCashExpense;
        TotOtherExpense = TotOtherExpense;
        TotCashVoucher = TotCashVoucher;
        TotOtherVoucher = TotOtherVoucher;
        TotalCashCollection = TotalCashCollection;
        TotalCollection = TotalCollection;


        let info = {
            FromDate: FromDate,
            ToDate: ToDate,
            Preferences: printPreferencesData,
            UserName: UserName,
            NetUserCollection: NetUserCollection,
            FacilityName: FacilityName,
            TotCash: TotCash,
            TotCard: TotCard,
            TotOther: TotOther,
            TotNetBanking: TotNetBanking,
            TotUPI: TotUPI,
            TotCashExpense: TotCashExpense,
            TotOtherExpense: TotOtherExpense,
            TotCashVoucher: TotCashVoucher,
            TotOtherVoucher: TotOtherVoucher,
            TotalCashCollection: TotalCashCollection,
            TotalCollection: TotalCollection

        };
        let pdfOption: any = null;
        let key = 'opipcollectionsummarybycashier';
        let pdfOptionJSON = await Report.GetPdfOption(key);
        if (!pdfOptionJSON) {
            pdfOption = {
                format: 'A4',
                orientation: 'landscape',
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
        } else {
            pdfOption = JSON.parse(pdfOptionJSON);
            pdfOption.base = 'file://' + join(__dirname, '/../../Templates/assets/');
        }
        return await Report.Generate(key, { header: {}, body: info }, null, pdfOption);
    }
    public async PrintOPCollectionSummaryCashier(req: BaseRequest): Promise<any> {
        let dateformat = 'DD/MM/YYYY';
        let timeformat = 'HH:mm:ss';
        let fromdate = moment(req.Data.FromDate).format(dateformat);
        let FromTime = moment(req.Data.FromDate).format(timeformat);
        let FromDate = fromdate + ' ' + FromTime;

        let todate = moment(req.Data.ToDate).format(dateformat);
        let totime = moment(req.Data.ToDate).format(timeformat);
        let ToDate = todate + ' ' + totime;

        let FacilityId = req.Data.FacilityId;
        let FacilityName = req.Data.FacilityName;
        let UserName = req.Data.UserName;
        let BillingCollection: any = [];
        let UserReq = req;
        BillingCollection = await this.GetOPBillingCollectionSummary(UserReq);
        // DoctorData = DoctorData;
        let facilityPreferenceBO = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(FacilityId);
        let UserCollection = [];
        let NetUserCollection = [];


        if (BillingCollection) {
            let billusercollection = [];
            let billuserrefund = [];
            let billcollection = [];
            if (BillingCollection.length > 0) {
                billusercollection = BillingCollection[0].Value;
            }
            if (BillingCollection.length > 1) {
                billuserrefund = BillingCollection[1].Value;
            }
            if (BillingCollection.length > 2) {
                billcollection = BillingCollection[2].Value;
            }

            for (let idx in billusercollection) {
                let usercol = billusercollection[idx];
                let Key = '';
                let CashAmt = 0;
                let CardAmt = 0;
                let OtherAmt = 0;
                // let DueCollectAmt = 0;
                for (let ix in usercol) {
                    UserName = '';
                    if (usercol[ix].UserName) {
                        if (usercol[ix].UserName.Title)
                            UserName = usercol[ix].UserName.Title.Description;
                        if (usercol[ix].UserName.FirstName)
                            UserName += ' ' + usercol[ix].UserName.FirstName;
                        if (usercol[ix].UserName.LastName)
                            UserName += ' ' + usercol[ix].UserName.LastName;
                    }
                    if (usercol[ix].CashAmount) {
                        CashAmt = usercol[ix].CashAmount;
                    }
                    if (usercol[ix].CardAmount) {
                        CardAmt = usercol[ix].CardAmount;
                    }
                    if (usercol[ix].OtherAmount) {
                        OtherAmt = usercol[ix].OtherAmount;
                    }
                    // if (usercol[ix].DueCollection) {
                    //     DueCollectAmt = usercol[ix].DueCollection;
                    // }
                    Key = UserName;
                    CashAmt = CashAmt;
                    CardAmt = CardAmt;
                    OtherAmt = OtherAmt;
                    // DueCollectAmt = DueCollectAmt;
                }
                UserCollection.push({
                    'Key': Key,
                    'Value': {
                        'CashAmt': CashAmt,
                        'CardAmt': CardAmt,
                        'OtherAmt': OtherAmt,
                        'NetRefundAmt': 0.00,
                        'CashRefundAmt': 0.00,
                        'CardRefundAmt': 0.00,
                        'OtherRefundAmt': 0.00,
                        'TotalBillAmt': 0.00,
                        // 'DueCollectAmt': DueCollectAmt
                    }
                });

            }
            for (let idx in billuserrefund) {
                let usercol = billuserrefund[idx];
                let Key = '';
                let NetRefundAmt = 0;
                let CashRefundAmt = 0;
                let CardRefundAmt = 0;
                let OtherRefundAmt = 0;
                for (let ix in usercol) {
                    UserName = '';
                    if (usercol[ix].UserName) {
                        if (usercol[ix].UserName.Title)
                            UserName = usercol[ix].UserName.Title.Description;
                        if (usercol[ix].UserName.FirstName)
                            UserName += ' ' + usercol[ix].UserName.FirstName;
                        if (usercol[ix].UserName.LastName)
                            UserName += ' ' + usercol[ix].UserName.LastName;
                    }
                    if (usercol[ix].NetRefundAmount) {
                        NetRefundAmt = usercol[ix].NetRefundAmount;
                    }
                    if (usercol[ix].CashRefundAmount) {
                        CashRefundAmt = usercol[ix].CashRefundAmount;
                    }
                    if (usercol[ix].CardRefundAmount) {
                        CardRefundAmt = usercol[ix].CardRefundAmount;
                    }
                    if (usercol[ix].OtherRefundAmount) {
                        OtherRefundAmt = usercol[ix].OtherRefundAmount;
                    }
                    Key = UserName;
                    NetRefundAmt = NetRefundAmt;
                    CashRefundAmt = CashRefundAmt;
                    CardRefundAmt = CardRefundAmt;
                    OtherRefundAmt = OtherRefundAmt;
                }
                let valappended = 0;
                UserCollection.forEach(function (item) {
                    if (Key === item.Key) {
                        item.Value.NetRefundAmt = NetRefundAmt;
                        item.Value.CashRefundAmt = CashRefundAmt;
                        item.Value.CardRefundAmt = CardRefundAmt;
                        item.Value.OtherRefundAmt = OtherRefundAmt;
                        valappended = 1;
                    }
                });

                if (valappended === 0)
                    UserCollection.push({
                        'Key': Key,
                        'Value': {
                            'CashAmt': 0.00,
                            'CardAmt': 0.00,
                            'OtherAmt': 0.00,
                            'NetRefundAmt': NetRefundAmt,
                            'CashRefundAmt': CashRefundAmt,
                            'CardRefundAmt': CardRefundAmt,
                            'OtherRefundAmt': OtherRefundAmt,
                            'TotalBillAmt': 0.00,
                        }
                    });

            }
            for (let idx in billcollection) {
                let usercol = billcollection[idx];
                let Key = '';
                let TotalBillAmt = 0;
                // let DueBalance = 0;
                // let IPSaleAmt = 0;
                for (let ix in usercol) {
                    UserName = '';
                    if (usercol[ix].UserName) {
                        if (usercol[ix].UserName.Title)
                            UserName = usercol[ix].UserName.Title.Description;
                        if (usercol[ix].UserName.FirstName)
                            UserName += ' ' + usercol[ix].UserName.FirstName;
                        if (usercol[ix].UserName.LastName)
                            UserName += ' ' + usercol[ix].UserName.LastName;
                    }
                    // if (usercol[ix].IPSaleAmount) {
                    //     IPSaleAmt = usercol[ix].IPSaleAmount;
                    // }
                    if (usercol[ix].TotalBillAmt) {
                        TotalBillAmt = usercol[ix].TotalBillAmt;
                    }
                    // if (usercol[ix].BalanceDue) {
                    //     DueBalance = usercol[ix].BalanceDue;
                    // }
                    Key = UserName;
                    // IPSaleAmt = IPSaleAmt;
                    TotalBillAmt = TotalBillAmt;
                    // DueBalance = DueBalance;
                }
                let valappended = 0;
                UserCollection.forEach(function (item) {
                    if (Key === item.Key) {
                        // item.Value.IPSaleAmt = IPSaleAmt;
                        item.Value.TotalBillAmt = TotalBillAmt;
                        // item.Value.DueBalance = DueBalance;
                        valappended = 1;
                    }
                });

                if (valappended === 0)
                    UserCollection.push({
                        'Key': Key,
                        'Value': {
                            'CashAmt': 0.00,
                            'CardAmt': 0.00,
                            'OtherAmt': 0.00,
                            'NetRefundAmt': 0.00,
                            'CashRefundAmt': 0.00,
                            'CardRefundAmt': 0.00,
                            'OtherRefundAmt': 0.00,
                            'TotalBillAmt': TotalBillAmt,
                        }
                    });

            }
            for (let idx in UserCollection) {
                let collectiondetails = UserCollection[idx];
                let usercollect = {
                    Key: collectiondetails.Key,
                    TotalBillAmt: collectiondetails.Value.TotalBillAmt,
                    // DueBalance: collectiondetails.Value.DueBalance,
                    // DueCollectAmt: collectiondetails.Value.DueCollectAmt,
                    CashAmt: collectiondetails.Value.CashAmt,
                    CashRefundAmt: collectiondetails.Value.CashRefundAmt,
                    NetCash: (collectiondetails.Value.CashAmt) - (collectiondetails.Value.CashRefundAmt),
                    CardAmt: collectiondetails.Value.CardAmt,
                    CardRefundAmt: collectiondetails.Value.CardRefundAmt,
                    NetCard: (collectiondetails.Value.CardAmt) - (collectiondetails.Value.CardRefundAmt),
                    OtherAmt: collectiondetails.Value.OtherAmt,
                    OtherRefundAmt: collectiondetails.Value.OtherRefundAmt,
                    NetOther: (collectiondetails.Value.OtherAmt) - (collectiondetails.Value.OtherRefundAmt),
                    // CashExpAmt: collectiondetails.Value.CashExpAmt,
                    // OtherExpAmt: collectiondetails.Value.OtherExpAmt,
                    // CashVocAmt: collectiondetails.Value.CashVocAmt,
                    // OtherVocAmt: collectiondetails.Value.OtherVocAmt,
                    CashCollection: ((collectiondetails.Value.CashAmt) - (collectiondetails.Value.CashRefundAmt)),
                    Refund: (collectiondetails.Value.CashRefundAmt) + (collectiondetails.Value.CardRefundAmt) +
                        (collectiondetails.Value.OtherRefundAmt),
                    NetCollection: (((collectiondetails.Value.CashAmt) - (collectiondetails.Value.CashRefundAmt)) +
                        ((collectiondetails.Value.CardAmt) - (collectiondetails.Value.CardRefundAmt))
                        + ((collectiondetails.Value.OtherAmt) - (collectiondetails.Value.OtherRefundAmt))),
                };
                NetUserCollection.push(usercollect);
            }
        }
        let TotCash = 0;
        let TotCard = 0;
        let TotOther = 0;
        let TotalCollection = 0;
        for (let jdx in NetUserCollection) {
            let netcollection = NetUserCollection[jdx];
            TotCash = TotCash + (netcollection.NetCash || 0);
            TotCard = TotCard + (netcollection.NetCard || 0);
            TotOther = TotOther + (netcollection.NetOther || 0);
            TotalCollection = TotalCollection + (netcollection.NetCollection || 0);
        }
        TotCash = TotCash;
        TotCard = TotCard;
        TotOther = TotOther;
        TotalCollection = TotalCollection;
        let info = {
            FromDate: FromDate,
            ToDate: ToDate,
            Preferences: printPreferencesData,
            UserName: UserName,
            NetUserCollection: NetUserCollection,
            FacilityName: FacilityName,
            TotCash: TotCash,
            TotCard: TotCard,
            TotOther: TotOther,
            TotalCollection: TotalCollection

        };
        let pdfOption: any = null;
        let key = 'opcollectionsummarybycashier';
        let pdfOptionJSON = await Report.GetPdfOption(key);
        if (!pdfOptionJSON) {
            pdfOption = {
                format: 'A4',
                orientation: 'landscape',
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
        } else {
            pdfOption = JSON.parse(pdfOptionJSON);
            pdfOption.base = 'file://' + join(__dirname, '/../../Templates/assets/');
        }
        return await Report.Generate(key, { header: {}, body: info }, null, pdfOption);
    }

    public async PrintIPCollectionSummaryCashier(req: BaseRequest): Promise<any> {
        let dateformat = 'DD/MM/YYYY';
        let timeformat = 'HH:mm:ss';
        let fromdate = moment(req.Data.FromDate).format(dateformat);
        let FromTime = moment(req.Data.FromDate).format(timeformat);
        let FromDate = fromdate + ' ' + FromTime;

        let todate = moment(req.Data.ToDate).format(dateformat);
        let totime = moment(req.Data.ToDate).format(timeformat);
        let ToDate = todate + ' ' + totime;

        let FacilityId = req.Data.FacilityId;
        let FacilityName = req.Data.FacilityName;
        let UserName = req.Data.UserName;
        let BillingCollection: any = [];
        let UserReq = req;
        BillingCollection = await this.GetIPBillingCollectionSummary(UserReq);
        // DoctorData = DoctorData;
        let facilityPreferenceBO = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(FacilityId);
        let UserCollection = [];
        let NetUserCollection = [];


        if (BillingCollection) {
            let billusercollection = [];
            let billuserrefund = [];
            let billcollection = [];
            if (BillingCollection.length > 0) {
                billusercollection = BillingCollection[0].Value;
            }
            if (BillingCollection.length > 1) {
                billuserrefund = BillingCollection[1].Value;
            }
            if (BillingCollection.length > 2) {
                billcollection = BillingCollection[2].Value;
            }

            for (let idx in billusercollection) {
                let usercol = billusercollection[idx];
                let Key = '';
                let CashAmt = 0;
                let CardAmt = 0;
                let OtherAmt = 0;
                let NetBankingAmt = 0;
                let UPIAmt = 0;
                // let DueCollectAmt = 0;
                for (let ix in usercol) {
                    UserName = '';
                    if (usercol[ix].UserName) {
                        if (usercol[ix].UserName.Title)
                            UserName = usercol[ix].UserName.Title.Description;
                        if (usercol[ix].UserName.FirstName)
                            UserName += ' ' + usercol[ix].UserName.FirstName;
                        if (usercol[ix].UserName.LastName)
                            UserName += ' ' + usercol[ix].UserName.LastName;
                    }
                    if (usercol[ix].CashAmount) {
                        CashAmt = usercol[ix].CashAmount;
                    }
                    if (usercol[ix].CardAmount) {
                        CardAmt = usercol[ix].CardAmount;
                    }
                    if (usercol[ix].OtherAmount) {
                        OtherAmt = usercol[ix].OtherAmount;
                    }
                    if (usercol[ix].NetBankingAmount) {
                        NetBankingAmt = usercol[ix].NetBankingAmount;
                    }
                    if (usercol[ix].UPIAmount) {
                        UPIAmt = usercol[ix].UPIAmount;
                    }
                    // if (usercol[ix].DueCollection) {
                    //     DueCollectAmt = usercol[ix].DueCollection;
                    // }
                    Key = UserName;
                    CashAmt = CashAmt;
                    CardAmt = CardAmt;
                    OtherAmt = OtherAmt;
                    NetBankingAmt = NetBankingAmt;
                    UPIAmt = UPIAmt;
                    // DueCollectAmt = DueCollectAmt;
                }
                UserCollection.push({
                    'Key': Key,
                    'Value': {
                        'CashAmt': CashAmt,
                        'CardAmt': CardAmt,
                        'OtherAmt': OtherAmt,
                        'NetBankingAmt': NetBankingAmt,
                        'UPIAmt': UPIAmt,
                        'NetRefundAmt': 0.00,
                        'CashRefundAmt': 0.00,
                        'CardRefundAmt': 0.00,
                        'OtherRefundAmt': 0.00,
                        'NetBankingRefundAmt': 0.00,
                        'UPIRefundAmt': 0.00,
                        'TotalBillAmt': 0.00,
                        // 'DueCollectAmt': DueCollectAmt
                    }
                });

            }
            for (let idx in billuserrefund) {
                let usercol = billuserrefund[idx];
                let Key = '';
                let NetRefundAmt = 0;
                let CashRefundAmt = 0;
                let CardRefundAmt = 0;
                let OtherRefundAmt = 0;
                let NetBankingRefundAmt = 0;
                let UPIRefundAmt = 0;
                for (let ix in usercol) {
                    UserName = '';
                    if (usercol[ix].UserName) {
                        if (usercol[ix].UserName.Title)
                            UserName = usercol[ix].UserName.Title.Description;
                        if (usercol[ix].UserName.FirstName)
                            UserName += ' ' + usercol[ix].UserName.FirstName;
                        if (usercol[ix].UserName.LastName)
                            UserName += ' ' + usercol[ix].UserName.LastName;
                    }
                    if (usercol[ix].NetRefundAmount) {
                        NetRefundAmt = usercol[ix].NetRefundAmount;
                    }
                    if (usercol[ix].CashRefundAmount) {
                        CashRefundAmt = usercol[ix].CashRefundAmount;
                    }
                    if (usercol[ix].CardRefundAmount) {
                        CardRefundAmt = usercol[ix].CardRefundAmount;
                    }
                    if (usercol[ix].OtherRefundAmount) {
                        OtherRefundAmt = usercol[ix].OtherRefundAmount;
                    }
                    if (usercol[ix].NetBankingRefundAmount) {
                        NetBankingRefundAmt = usercol[ix].NetBankingRefundAmount;
                    }
                    if (usercol[ix].UPIRefundAmount) {
                        UPIRefundAmt = usercol[ix].UPIRefundAmount;
                    }
                    Key = UserName;
                    NetRefundAmt = NetRefundAmt;
                    CashRefundAmt = CashRefundAmt;
                    CardRefundAmt = CardRefundAmt;
                    OtherRefundAmt = OtherRefundAmt;
                    NetBankingRefundAmt = NetBankingRefundAmt;
                    UPIRefundAmt = UPIRefundAmt;
                }
                let valappended = 0;
                UserCollection.forEach(function (item) {
                    if (Key === item.Key) {
                        item.Value.NetRefundAmt = NetRefundAmt;
                        item.Value.CashRefundAmt = CashRefundAmt;
                        item.Value.CardRefundAmt = CardRefundAmt;
                        item.Value.OtherRefundAmt = OtherRefundAmt;
                        item.Value.NetBankingRefundAmt = NetBankingRefundAmt;
                        item.Value.UPIRefundAmt = UPIRefundAmt;
                        valappended = 1;
                    }
                });

                if (valappended === 0)
                    UserCollection.push({
                        'Key': Key,
                        'Value': {
                            'CashAmt': 0.00,
                            'CardAmt': 0.00,
                            'OtherAmt': 0.00,
                            'NetBankingAmt': 0.00,
                            'UPIAmt': 0.00,
                            'NetRefundAmt': NetRefundAmt,
                            'CashRefundAmt': CashRefundAmt,
                            'CardRefundAmt': CardRefundAmt,
                            'OtherRefundAmt': OtherRefundAmt,
                            'NetBankingRefundAmt': NetBankingRefundAmt,
                            'UPIRefundAmt': UPIRefundAmt,
                            'TotalBillAmt': 0.00,
                        }
                    });

            }
            for (let idx in billcollection) {
                let usercol = billcollection[idx];
                let Key = '';
                let TotalBillAmt = 0;
                // let DueBalance = 0;
                // let IPSaleAmt = 0;
                for (let ix in usercol) {
                    UserName = '';
                    if (usercol[ix].UserName) {
                        if (usercol[ix].UserName.Title)
                            UserName = usercol[ix].UserName.Title.Description;
                        if (usercol[ix].UserName.FirstName)
                            UserName += ' ' + usercol[ix].UserName.FirstName;
                        if (usercol[ix].UserName.LastName)
                            UserName += ' ' + usercol[ix].UserName.LastName;
                    }
                    // if (usercol[ix].IPSaleAmount) {
                    //     IPSaleAmt = usercol[ix].IPSaleAmount;
                    // }
                    if (usercol[ix].TotalBillAmt) {
                        TotalBillAmt = usercol[ix].TotalBillAmt;
                    }
                    // if (usercol[ix].BalanceDue) {
                    //     DueBalance = usercol[ix].BalanceDue;
                    // }
                    Key = UserName;
                    // IPSaleAmt = IPSaleAmt;
                    TotalBillAmt = TotalBillAmt;
                    // DueBalance = DueBalance;
                }
                let valappended = 0;
                UserCollection.forEach(function (item) {
                    if (Key === item.Key) {
                        // item.Value.IPSaleAmt = IPSaleAmt;
                        item.Value.TotalBillAmt = TotalBillAmt;
                        // item.Value.DueBalance = DueBalance;
                        valappended = 1;
                    }
                });

                if (valappended === 0)
                    UserCollection.push({
                        'Key': Key,
                        'Value': {
                            'CashAmt': 0.00,
                            'CardAmt': 0.00,
                            'OtherAmt': 0.00,
                            'NetBankingAmt': 0.00,
                            'UPIAmt': 0.00,
                            'NetRefundAmt': 0.00,
                            'CashRefundAmt': 0.00,
                            'CardRefundAmt': 0.00,
                            'OtherRefundAmt': 0.00,
                            'NetBankingRefundAmt': 0.00,
                            'UPIRefundAmt': 0.00,
                            'TotalBillAmt': TotalBillAmt,
                        }
                    });

            }
            for (let idx in UserCollection) {
                let collectiondetails = UserCollection[idx];
                let usercollect = {
                    Key: collectiondetails.Key,
                    TotalBillAmt: collectiondetails.Value.TotalBillAmt,
                    // DueBalance: collectiondetails.Value.DueBalance,
                    // DueCollectAmt: collectiondetails.Value.DueCollectAmt,
                    CashAmt: collectiondetails.Value.CashAmt,
                    CashRefundAmt: collectiondetails.Value.CashRefundAmt,
                    NetCash: (collectiondetails.Value.CashAmt) - (collectiondetails.Value.CashRefundAmt),
                    CardAmt: collectiondetails.Value.CardAmt,
                    CardRefundAmt: collectiondetails.Value.CardRefundAmt,
                    NetCard: (collectiondetails.Value.CardAmt) - (collectiondetails.Value.CardRefundAmt),
                    OtherAmt: collectiondetails.Value.OtherAmt,
                    OtherRefundAmt: collectiondetails.Value.OtherRefundAmt,
                    NetOther: (collectiondetails.Value.OtherAmt) - (collectiondetails.Value.OtherRefundAmt),
                    NetBankingAmt: collectiondetails.Value.NetBankingAmt,
                    NetBankingRefundAmt: collectiondetails.Value.NetBankingRefundAmt,
                    NetNetBanking: (collectiondetails.Value.NetBankingAmt) - (collectiondetails.Value.NetBankingRefundAmt),
                    UPIAmt: collectiondetails.Value.UPIAmt,
                    UPIRefundAmt: collectiondetails.Value.UPIRefundAmt,
                    NetUPI: (collectiondetails.Value.UPIAmt) - (collectiondetails.Value.UPIRefundAmt),
                    // CashExpAmt: collectiondetails.Value.CashExpAmt,
                    // OtherExpAmt: collectiondetails.Value.OtherExpAmt,
                    // CashVocAmt: collectiondetails.Value.CashVocAmt,
                    // OtherVocAmt: collectiondetails.Value.OtherVocAmt,
                    CashCollection: ((collectiondetails.Value.CashAmt) - (collectiondetails.Value.CashRefundAmt)),
                    Refund: (collectiondetails.Value.CashRefundAmt) + (collectiondetails.Value.CardRefundAmt) +
                        (collectiondetails.Value.OtherRefundAmt),
                    NetCollection: (((collectiondetails.Value.CashAmt) - (collectiondetails.Value.CashRefundAmt)) +
                        ((collectiondetails.Value.CardAmt) - (collectiondetails.Value.CardRefundAmt))
                        + ((collectiondetails.Value.OtherAmt) - (collectiondetails.Value.OtherRefundAmt)) +
                        ((collectiondetails.Value.NetBankingAmt) - (collectiondetails.Value.NetBankingRefundAmt)) +
                        ((collectiondetails.Value.UPIAmt) - (collectiondetails.Value.UPIRefundAmt))),
                };
                NetUserCollection.push(usercollect);
            }
        }
        let TotCash = 0;
        let TotCard = 0;
        let TotOther = 0;
        let TotNetBanking = 0;
        let TotUPI = 0;
        let TotalCollection = 0;
        for (let jdx in NetUserCollection) {
            let netcollection = NetUserCollection[jdx];
            TotCash = TotCash + (netcollection.NetCash || 0);
            TotCard = TotCard + (netcollection.NetCard || 0);
            TotOther = TotOther + (netcollection.NetOther || 0);
            TotNetBanking = TotNetBanking + (netcollection.NetNetBanking || 0);
            TotUPI = TotUPI + (netcollection.NetUPI || 0);
            TotalCollection = TotalCollection + (netcollection.NetCollection || 0);
        }
        TotCash = TotCash;
        TotCard = TotCard;
        TotOther = TotOther;
        TotNetBanking = TotNetBanking;
        TotUPI = TotUPI;
        TotalCollection = TotalCollection;
        let info = {
            FromDate: FromDate,
            ToDate: ToDate,
            Preferences: printPreferencesData,
            UserName: UserName,
            NetUserCollection: NetUserCollection,
            FacilityName: FacilityName,
            TotCash: TotCash,
            TotCard: TotCard,
            TotOther: TotOther,
            TotNetBanking: TotNetBanking,
            TotUPI: TotUPI,
            TotalCollection: TotalCollection

        };
        let pdfOption: any = null;
        let key = 'ipcollectionsummarybycashier';
        let pdfOptionJSON = await Report.GetPdfOption(key);
        if (!pdfOptionJSON) {
            pdfOption = {
                format: 'A4',
                orientation: 'landscape',
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
        } else {
            pdfOption = JSON.parse(pdfOptionJSON);
            pdfOption.base = 'file://' + join(__dirname, '/../../Templates/assets/');
        }
        return await Report.Generate(key, { header: {}, body: info }, null, pdfOption);
    }
    public async PrintOverallCollectionSummaryCashier(req: BaseRequest): Promise<any> {
        let dateformat = 'DD/MM/YYYY';
        let timeformat = 'HH:mm:ss';
        let fromdate = moment(req.Data.FromDate).format(dateformat);
        let FromTime = moment(req.Data.FromDate).format(timeformat);
        let FromDate = fromdate + ' ' + FromTime;

        let todate = moment(req.Data.ToDate).format(dateformat);
        let totime = moment(req.Data.ToDate).format(timeformat);
        let ToDate = todate + ' ' + totime;

        let FacilityId = req.Data.FacilityId;
        let FacilityName = req.Data.FacilityName;
        let UserName = req.Data.UserName;
        let BillingCollection: any = [];
        let UserReq = req;
        BillingCollection = await this.GetOverallCollectionCashier(UserReq);
        // DoctorData = DoctorData;
        let facilityPreferenceBO = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(FacilityId);
        let UserCollection = [];
        let NetUserCollection = [];


        if (BillingCollection) {
            let billusercollection = [];
            let billuserrefund = [];
            let billcollection = [];
            let doctorshare = [];
            if (BillingCollection.length > 0) {
                billusercollection = BillingCollection[0].Value;
            }
            if (BillingCollection.length > 1) {
                billuserrefund = BillingCollection[1].Value;
            }
            if (BillingCollection.length > 2) {
                billcollection = BillingCollection[2].Value;
            }
            if (BillingCollection.length > 3) {
                doctorshare = BillingCollection[3].Value;
            }

            for (let idx in billusercollection) {
                let usercol = billusercollection[idx];
                let Key = '';
                let CashAmt = 0;
                let CardAmt = 0;
                let OtherAmt = 0;
                // let DueCollectAmt = 0;
                for (let ix in usercol) {
                    UserName = '';
                    if (usercol[ix].UserName) {
                        if (usercol[ix].UserName.Title)
                            UserName = usercol[ix].UserName.Title.Description;
                        if (usercol[ix].UserName.FirstName)
                            UserName += ' ' + usercol[ix].UserName.FirstName;
                        if (usercol[ix].UserName.LastName)
                            UserName += ' ' + usercol[ix].UserName.LastName;
                    }
                    if (usercol[ix].CashAmount) {
                        CashAmt = usercol[ix].CashAmount;
                    }
                    if (usercol[ix].CardAmount) {
                        CardAmt = usercol[ix].CardAmount;
                    }
                    if (usercol[ix].OtherAmount) {
                        OtherAmt = usercol[ix].OtherAmount;
                    }
                    // if (usercol[ix].DueCollection) {
                    //     DueCollectAmt = usercol[ix].DueCollection;
                    // }
                    Key = UserName;
                    CashAmt = CashAmt;
                    CardAmt = CardAmt;
                    OtherAmt = OtherAmt;
                    // DueCollectAmt = DueCollectAmt;
                }
                UserCollection.push({
                    'Key': Key,
                    'Value': {
                        'CashAmt': CashAmt,
                        'CardAmt': CardAmt,
                        'OtherAmt': OtherAmt,
                        'NetRefundAmt': 0.00,
                        'CashRefundAmt': 0.00,
                        'CardRefundAmt': 0.00,
                        'OtherRefundAmt': 0.00,
                        'TotalBillAmt': 0.00,
                        'DocCashAmt': 0.00,
                        'DocOtherAmt': 0.00
                    }
                });

            }
            for (let idx in billuserrefund) {
                let usercol = billuserrefund[idx];
                let Key = '';
                let NetRefundAmt = 0;
                let CashRefundAmt = 0;
                let CardRefundAmt = 0;
                let OtherRefundAmt = 0;
                for (let ix in usercol) {
                    UserName = '';
                    if (usercol[ix].UserName) {
                        if (usercol[ix].UserName.Title)
                            UserName = usercol[ix].UserName.Title.Description;
                        if (usercol[ix].UserName.FirstName)
                            UserName += ' ' + usercol[ix].UserName.FirstName;
                        if (usercol[ix].UserName.LastName)
                            UserName += ' ' + usercol[ix].UserName.LastName;
                    }
                    if (usercol[ix].NetRefundAmount) {
                        NetRefundAmt = usercol[ix].NetRefundAmount;
                    }
                    if (usercol[ix].CashRefundAmount) {
                        CashRefundAmt = usercol[ix].CashRefundAmount;
                    }
                    if (usercol[ix].CardRefundAmount) {
                        CardRefundAmt = usercol[ix].CardRefundAmount;
                    }
                    if (usercol[ix].OtherRefundAmount) {
                        OtherRefundAmt = usercol[ix].OtherRefundAmount;
                    }
                    Key = UserName;
                    NetRefundAmt = NetRefundAmt;
                    CashRefundAmt = CashRefundAmt;
                    CardRefundAmt = CardRefundAmt;
                    OtherRefundAmt = OtherRefundAmt;
                }
                let valappended = 0;
                UserCollection.forEach(function (item) {
                    if (Key === item.Key) {
                        item.Value.NetRefundAmt = NetRefundAmt;
                        item.Value.CashRefundAmt = CashRefundAmt;
                        item.Value.CardRefundAmt = CardRefundAmt;
                        item.Value.OtherRefundAmt = OtherRefundAmt;
                        valappended = 1;
                    }
                });

                if (valappended === 0)
                    UserCollection.push({
                        'Key': Key,
                        'Value': {
                            'CashAmt': 0.00,
                            'CardAmt': 0.00,
                            'OtherAmt': 0.00,
                            'NetRefundAmt': NetRefundAmt,
                            'CashRefundAmt': CashRefundAmt,
                            'CardRefundAmt': CardRefundAmt,
                            'OtherRefundAmt': OtherRefundAmt,
                            'TotalBillAmt': 0.00,
                            'DocCashAmt': 0.00,
                            'DocOtherAmt': 0.00
                        }
                    });

            }
            for (let idx in billcollection) {
                let usercol = billcollection[idx];
                let Key = '';
                let TotalBillAmt = 0;
                // let DueBalance = 0;
                // let IPSaleAmt = 0;
                for (let ix in usercol) {
                    UserName = '';
                    if (usercol[ix].UserName) {
                        if (usercol[ix].UserName.Title)
                            UserName = usercol[ix].UserName.Title.Description;
                        if (usercol[ix].UserName.FirstName)
                            UserName += ' ' + usercol[ix].UserName.FirstName;
                        if (usercol[ix].UserName.LastName)
                            UserName += ' ' + usercol[ix].UserName.LastName;
                    }
                    // if (usercol[ix].IPSaleAmount) {
                    //     IPSaleAmt = usercol[ix].IPSaleAmount;
                    // }
                    if (usercol[ix].TotalBillAmt) {
                        TotalBillAmt = usercol[ix].TotalBillAmt;
                    }
                    // if (usercol[ix].BalanceDue) {
                    //     DueBalance = usercol[ix].BalanceDue;
                    // }
                    Key = UserName;
                    // IPSaleAmt = IPSaleAmt;
                    TotalBillAmt = TotalBillAmt;
                    // DueBalance = DueBalance;
                }
                let valappended = 0;
                UserCollection.forEach(function (item) {
                    if (Key === item.Key) {
                        // item.Value.IPSaleAmt = IPSaleAmt;
                        item.Value.TotalBillAmt = TotalBillAmt;
                        // item.Value.DueBalance = DueBalance;
                        valappended = 1;
                    }
                });

                if (valappended === 0)
                    UserCollection.push({
                        'Key': Key,
                        'Value': {
                            'CashAmt': 0.00,
                            'CardAmt': 0.00,
                            'OtherAmt': 0.00,
                            'NetRefundAmt': 0.00,
                            'CashRefundAmt': 0.00,
                            'CardRefundAmt': 0.00,
                            'OtherRefundAmt': 0.00,
                            'TotalBillAmt': TotalBillAmt,
                            'DocCashAmt': 0.00,
                            'DocOtherAmt': 0.00
                        }
                    });

            }
            for (let idx in doctorshare) {
                let usercol = doctorshare[idx];
                let Key = '';
                let DocCashAmt = 0;
                let DocOtherAmt = 0;
                for (let ix in usercol) {
                    UserName = '';
                    if (usercol[ix].UserName) {
                        if (usercol[ix].UserName.Title)
                            UserName = usercol[ix].UserName.Title.Description;
                        if (usercol[ix].UserName.FirstName)
                            UserName += ' ' + usercol[ix].UserName.FirstName;
                        if (usercol[ix].UserName.LastName)
                            UserName += ' ' + usercol[ix].UserName.LastName;
                    }
                    if (usercol[ix].CashVocAmt) {
                        DocCashAmt = usercol[ix].CashVocAmt;
                    }
                    if (usercol[ix].OtherVocAmt) {
                        DocOtherAmt = usercol[ix].OtherVocAmt;
                    }
                    Key = UserName;
                    DocCashAmt = DocCashAmt;
                    DocOtherAmt = DocOtherAmt;
                }
                let valappended = 0;
                UserCollection.forEach(function (item: any) {
                    if (Key === item.Key) {
                        item.Value.DocCashAmt = DocCashAmt;
                        item.Value.DocOtherAmt = DocOtherAmt;
                        valappended = 1;
                    }
                });

                if (valappended === 0)
                    UserCollection.push({
                        'Key': Key,
                        'Value': {
                            'CashAmt': 0.00,
                            'CardAmt': 0.00,
                            'OtherAmt': 0.00,
                            'NetRefundAmt': 0.00,
                            'CashRefundAmt': 0.00,
                            'CardRefundAmt': 0.00,
                            'OtherRefundAmt': 0.00,
                            'TotalBillAmt': 0.00,
                            'DocCashAmt': DocCashAmt,
                            'DocOtherAmt': DocOtherAmt
                        }
                    });

            }
            for (let idx in UserCollection) {
                let collectiondetails = UserCollection[idx];
                let usercollect = {
                    Key: collectiondetails.Key,
                    TotalBillAmt: collectiondetails.Value.TotalBillAmt,
                    CashAmt: collectiondetails.Value.CashAmt,
                    CashRefundAmt: collectiondetails.Value.CashRefundAmt,
                    NetCash: (collectiondetails.Value.CashAmt) - (collectiondetails.Value.CashRefundAmt),
                    CardAmt: collectiondetails.Value.CardAmt,
                    CardRefundAmt: collectiondetails.Value.CardRefundAmt,
                    NetCard: (collectiondetails.Value.CardAmt) - (collectiondetails.Value.CardRefundAmt),
                    OtherAmt: collectiondetails.Value.OtherAmt,
                    OtherRefundAmt: collectiondetails.Value.OtherRefundAmt,
                    NetOther: (collectiondetails.Value.OtherAmt) - (collectiondetails.Value.OtherRefundAmt),
                    CashCollection: ((collectiondetails.Value.CashAmt) - (collectiondetails.Value.CashRefundAmt)),
                    Refund: (collectiondetails.Value.CashRefundAmt) + (collectiondetails.Value.CardRefundAmt) +
                        (collectiondetails.Value.OtherRefundAmt),
                    NetCollection: (((collectiondetails.Value.CashAmt) - (collectiondetails.Value.CashRefundAmt)) +
                        ((collectiondetails.Value.CardAmt) - (collectiondetails.Value.CardRefundAmt))
                        + ((collectiondetails.Value.OtherAmt) - (collectiondetails.Value.OtherRefundAmt))),
                    DocCashAmt: collectiondetails.Value.DocCashAmt,
                    DocOtherAmt: collectiondetails.Value.DocOtherAmt,
                    DocAmt: (collectiondetails.Value.DocCashAmt + collectiondetails.Value.DocOtherAmt),
                    OverallCollection: (((collectiondetails.Value.CashAmt || 0) - (collectiondetails.Value.CashRefundAmt || 0)) +
                        ((collectiondetails.Value.CardAmt || 0) - (collectiondetails.Value.CardRefundAmt || 0))
                        + ((collectiondetails.Value.OtherAmt || 0) - (collectiondetails.Value.OtherRefundAmt || 0))) -
                        ((collectiondetails.Value.DocCashAmt || 0) + (collectiondetails.Value.DocOtherAmt || 0)),
                };
                NetUserCollection.push(usercollect);
            }
        }
        let TotCashAmt = 0;
        let TotCardAmt = 0;
        let TotOtherAmt = 0;
        let TotCollectionAmt = 0;
        let TotalDocCashAmt = 0;
        let TotalDocOtherAmt = 0;
        let TotalDocAmt = 0;
        let TotalNetCollection = 0;

        for (let jdx in NetUserCollection) {
            let netcollection = NetUserCollection[jdx];
            TotCashAmt = TotCashAmt + (netcollection.NetCash || 0);
            TotCardAmt = TotCardAmt + (netcollection.NetCard || 0);
            TotOtherAmt = TotOtherAmt + (netcollection.NetOther || 0);
            TotCollectionAmt = TotCollectionAmt + (netcollection.NetCollection || 0);
            TotalDocCashAmt = TotalDocCashAmt + (netcollection.DocCashAmt || 0);
            TotalDocOtherAmt = TotalDocOtherAmt + (netcollection.DocOtherAmt || 0);
            TotalDocAmt = TotalDocAmt + (netcollection.DocAmt || 0);
            TotalNetCollection = TotalNetCollection + (netcollection.OverallCollection || 0);
        }
        TotCashAmt = TotCashAmt;
        TotCardAmt = TotCardAmt;
        TotOtherAmt = TotOtherAmt;
        TotCollectionAmt = TotCollectionAmt;
        TotalDocCashAmt = TotalDocCashAmt;
        TotalDocOtherAmt = TotalDocOtherAmt;
        TotalDocAmt = TotalDocAmt;
        TotalNetCollection = TotalNetCollection;

        let OverallCollection = (TotCollectionAmt - TotalDocAmt);

        let info = {
            FromDate: FromDate,
            ToDate: ToDate,
            Preferences: printPreferencesData,
            UserName: UserName,
            NetUserCollection: NetUserCollection,
            FacilityName: FacilityName,
            TotCashAmt: TotCashAmt,
            TotCardAmt: TotCardAmt,
            TotOtherAmt: TotOtherAmt,
            TotCollectionAmt: TotCollectionAmt,
            TotalDocCashAmt: TotalDocCashAmt,
            TotalDocOtherAmt: TotalDocOtherAmt,
            TotalDocAmt: TotalDocAmt,
            TotalNetCollection: TotalNetCollection,
            OverallCollection: OverallCollection,

        };
        let pdfOption: any = null;
        let key = 'overallcollectioncashier';
        let pdfOptionJSON = await Report.GetPdfOption(key);
        if (!pdfOptionJSON) {
            pdfOption = {
                format: 'A4',
                orientation: 'landscape',
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
        } else {
            pdfOption = JSON.parse(pdfOptionJSON);
            pdfOption.base = 'file://' + join(__dirname, '/../../Templates/assets/');
        }
        return await Report.Generate(key, { header: {}, body: info }, null, pdfOption);
    }
    public async PrintUserWiseCollectionSummaryCashier(req: BaseRequest): Promise<any> {
        let dateformat = 'DD/MM/YYYY';
        let timeformat = 'HH:mm:ss';
        let fromdate = moment(req.Data.FromDate).format(dateformat);
        let FromTime = moment(req.Data.FromDate).format(timeformat);
        let FromDate = fromdate + ' ' + FromTime;

        let todate = moment(req.Data.ToDate).format(dateformat);
        let totime = moment(req.Data.ToDate).format(timeformat);
        let ToDate = todate + ' ' + totime;

        let FacilityId = req.Data.FacilityId;
        let FacilityName = req.Data.FacilityName;
        let UserName = req.Data.UserName;
        let AllCollection: any = [];
        let UserReq = req;
        AllCollection = await this.GetUserWiseCollectionCashier(UserReq);
        // DoctorData = DoctorData;
        let facilityPreferenceBO = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(FacilityId);
        let UserCollection = [];
        let NetUserCollection = [];


        if (AllCollection) {
            let opusercollection = [];
            let opduecollection = [];
            let opuserrefund = [];
            let ipusercollection = [];
            let ipduecollection = [];
            let ipuserrefund = [];
            if (AllCollection.length > 0) {
                opusercollection = AllCollection[0].Value;
            }
            if (AllCollection.length > 1) {
                ipusercollection = AllCollection[1].Value;
            }
            if (AllCollection.length > 2) {
                opduecollection = AllCollection[2].Value;
            }
            if (AllCollection.length > 3) {
                ipduecollection = AllCollection[3].Value;
            }
            if (AllCollection.length > 4) {
                opuserrefund = AllCollection[4].Value;
            }
            if (AllCollection.length > 5) {
                ipuserrefund = AllCollection[5].Value;
            }

            for (let idx in opusercollection) {
                let usercol = opusercollection[idx];
                let Key = '';
                let OPCashAmt = 0;
                let OPCardAmt = 0;
                let OPOtherAmt = 0;
                let OPUpiAmt = 0;
                // let DueCollectAmt = 0;
                for (let ix in usercol) {
                    UserName = '';
                    if (usercol[ix].UserName) {
                        if (usercol[ix].UserName.Title)
                            UserName = usercol[ix].UserName.Title.Description;
                        if (usercol[ix].UserName.FirstName)
                            UserName += ' ' + usercol[ix].UserName.FirstName;
                        if (usercol[ix].UserName.LastName)
                            UserName += ' ' + usercol[ix].UserName.LastName;
                    }
                    if (usercol[ix].OPCashAmount) {
                        OPCashAmt = usercol[ix].OPCashAmount;
                    }
                    if (usercol[ix].OPCardAmount) {
                        OPCardAmt = usercol[ix].OPCardAmount;
                    }
                    if (usercol[ix].OPOtherAmount) {
                        OPOtherAmt = usercol[ix].OPOtherAmount;
                    }
                    if (usercol[ix].OPUpiAmount) {
                        OPUpiAmt = usercol[ix].OPUpiAmount;
                    }
                    Key = UserName;
                    OPCashAmt = OPCashAmt;
                    OPCardAmt = OPCardAmt;
                    OPOtherAmt = OPOtherAmt;
                    OPUpiAmt = OPUpiAmt;
                    // DueCollectAmt = DueCollectAmt;
                }
                UserCollection.push({
                    'Key': Key,
                    'Value': {
                        'OPCashAmt': OPCashAmt,
                        'OPCardAmt': OPCardAmt,
                        'OPOtherAmt': OPOtherAmt,
                        'OPUpiAmt': OPUpiAmt,
                        'OPDueAmt': 0.00,
                        'OPCashRefundAmt': 0.00,
                        'OPOtherRefundAmt': 0.00,
                        'IPCashAmt': 0.00,
                        'IPCardAmt': 0.00,
                        'IPOtherAmt': 0.00,
                        'IPUpiAmt': 0.00,
                        'IPDueAmt': 0.00,
                        'IPCashRefundAmt': 0.00,
                        'IPOtherRefundAmt': 0.00,

                    }
                });

            }
            for (let idx in opduecollection) {
                let usercol = opduecollection[idx];
                let Key = '';
                let OPDueAmt = 0;
                for (let ix in usercol) {
                    UserName = '';
                    if (usercol[ix].UserName) {
                        if (usercol[ix].UserName.Title)
                            UserName = usercol[ix].UserName.Title.Description;
                        if (usercol[ix].UserName.FirstName)
                            UserName += ' ' + usercol[ix].UserName.FirstName;
                        if (usercol[ix].UserName.LastName)
                            UserName += ' ' + usercol[ix].UserName.LastName;
                    }
                    if (usercol[ix].OPDueAmount) {
                        OPDueAmt = usercol[ix].OPDueAmount;
                    }
                    Key = UserName;
                    OPDueAmt = OPDueAmt;
                }
                let valappended = 0;
                UserCollection.forEach(function (item) {
                    if (Key === item.Key) {
                        item.Value.OPDueAmt = OPDueAmt;
                        valappended = 1;
                    }
                });

                if (valappended === 0)
                    UserCollection.push({
                        'Key': Key,
                        'Value': {
                            'OPCashAmt': 0.00,
                            'OPCardAmt': 0.00,
                            'OPOtherAmt': 0.00,
                            'OPUpiAmt': 0.00,
                            'OPDueAmt': OPDueAmt,
                            'OPCashRefundAmt': 0.00,
                            'OPOtherRefundAmt': 0.00,
                            'IPCashAmt': 0.00,
                            'IPCardAmt': 0.00,
                            'IPOtherAmt': 0.00,
                            'IPUpiAmt': 0.00,
                            'IPDueAmt': 0.00,
                            'IPCashRefundAmt': 0.00,
                            'IPOtherRefundAmt': 0.00,
                        }
                    });

            }
            for (let idx in opuserrefund) {
                let usercol = opuserrefund[idx];
                let Key = '';
                let OPCashRefundAmt = 0;
                let OPOtherRefundAmt = 0;
                for (let ix in usercol) {
                    UserName = '';
                    if (usercol[ix].UserName) {
                        if (usercol[ix].UserName.Title)
                            UserName = usercol[ix].UserName.Title.Description;
                        if (usercol[ix].UserName.FirstName)
                            UserName += ' ' + usercol[ix].UserName.FirstName;
                        if (usercol[ix].UserName.LastName)
                            UserName += ' ' + usercol[ix].UserName.LastName;
                    }
                    if (usercol[ix].OPCashRefundAmount) {
                        OPCashRefundAmt = usercol[ix].OPCashRefundAmount;
                    }
                    if (usercol[ix].OPOtherRefundAmount) {
                        OPOtherRefundAmt = usercol[ix].OPOtherRefundAmount;
                    }
                    Key = UserName;
                    OPCashRefundAmt = OPCashRefundAmt;
                    OPOtherRefundAmt = OPOtherRefundAmt;
                }
                let valappended = 0;
                UserCollection.forEach(function (item) {
                    if (Key === item.Key) {
                        item.Value.OPCashRefundAmt = OPCashRefundAmt;
                        item.Value.OPOtherRefundAmt = OPOtherRefundAmt;
                        valappended = 1;
                    }
                });

                if (valappended === 0)
                    UserCollection.push({
                        'Key': Key,
                        'Value': {
                            'OPCashAmt': 0.00,
                            'OPCardAmt': 0.00,
                            'OPOtherAmt': 0.00,
                            'OPUpiAmt': 0.00,
                            'OPDueAmt': 0.00,
                            'OPCashRefundAmt': OPCashRefundAmt,
                            'OPOtherRefundAmt': OPOtherRefundAmt,
                            'IPCashAmt': 0.00,
                            'IPCardAmt': 0.00,
                            'IPOtherAmt': 0.00,
                            'IPUpiAmt': 0.00,
                            'IPDueAmt': 0.00,
                            'IPCashRefundAmt': 0.00,
                            'IPOtherRefundAmt': 0.00,


                        }
                    });

            }

            for (let idx in ipusercollection) {
                let usercol = ipusercollection[idx];
                let Key = '';
                let IPCashAmt = 0;
                let IPCardAmt = 0;
                let IPOtherAmt = 0;
                let IPUpiAmt = 0;
                // let DueCollectAmt = 0;
                for (let ix in usercol) {
                    UserName = '';
                    if (usercol[ix].UserName) {
                        if (usercol[ix].UserName.Title)
                            UserName = usercol[ix].UserName.Title.Description;
                        if (usercol[ix].UserName.FirstName)
                            UserName += ' ' + usercol[ix].UserName.FirstName;
                        if (usercol[ix].UserName.LastName)
                            UserName += ' ' + usercol[ix].UserName.LastName;
                    }
                    if (usercol[ix].IPCashAmount) {
                        IPCashAmt = usercol[ix].IPCashAmount;
                    }
                    if (usercol[ix].IPCardAmount) {
                        IPCardAmt = usercol[ix].IPCardAmount;
                    }
                    if (usercol[ix].IPOtherAmount) {
                        IPOtherAmt = usercol[ix].IPOtherAmount;
                    }
                    if (usercol[ix].IPUpiAmount) {
                        IPUpiAmt = usercol[ix].IPUpiAmount;
                    }
                    Key = UserName;
                    IPCashAmt = IPCashAmt;
                    IPCardAmt = IPCardAmt;
                    IPOtherAmt = IPOtherAmt;
                    IPUpiAmt = IPUpiAmt;
                    // DueCollectAmt = DueCollectAmt;
                }

                let valappended = 0;
                UserCollection.forEach(function (item) {
                    if (Key === item.Key) {
                        item.Value.IPCashAmt = IPCashAmt;
                        item.Value.IPCardAmt = IPCardAmt;
                        item.Value.IPOtherAmt = IPOtherAmt;
                        item.Value.IPUpiAmt = IPUpiAmt;
                        valappended = 1;
                    }
                });
                if (valappended === 0)
                    UserCollection.push({
                        'Key': Key,
                        'Value': {
                            'OPCashAmt': 0.00,
                            'OPCardAmt': 0.00,
                            'OPOtherAmt': 0.00,
                            'OPUpiAmt': 0.00,
                            'OPDueAmt': 0.00,
                            'OPCashRefundAmt': 0.00,
                            'OPOtherRefundAmt': 0.00,
                            'IPCashAmt': IPCashAmt,
                            'IPCardAmt': IPCardAmt,
                            'IPOtherAmt': IPOtherAmt,
                            'IPUpiAmt': IPUpiAmt,
                            'IPDueAmt': 0.00,
                            'IPCashRefundAmt': 0.00,
                            'IPOtherRefundAmt': 0.00,

                        }
                    });

            }
            for (let idx in ipduecollection) {
                let usercol = ipduecollection[idx];
                let Key = '';
                let IPDueAmt = 0;
                for (let ix in usercol) {
                    UserName = '';
                    if (usercol[ix].UserName) {
                        if (usercol[ix].UserName.Title)
                            UserName = usercol[ix].UserName.Title.Description;
                        if (usercol[ix].UserName.FirstName)
                            UserName += ' ' + usercol[ix].UserName.FirstName;
                        if (usercol[ix].UserName.LastName)
                            UserName += ' ' + usercol[ix].UserName.LastName;
                    }
                    if (usercol[ix].IPDueAmount) {
                        IPDueAmt = usercol[ix].IPDueAmount;
                    }
                    Key = UserName;
                    IPDueAmt = IPDueAmt;
                }
                let valappended = 0;
                UserCollection.forEach(function (item) {
                    if (Key === item.Key) {
                        item.Value.IPDueAmt = IPDueAmt;
                        valappended = 1;
                    }
                });

                if (valappended === 0)
                    UserCollection.push({
                        'Key': Key,
                        'Value': {
                            'OPCashAmt': 0.00,
                            'OPCardAmt': 0.00,
                            'OPOtherAmt': 0.00,
                            'OPUpiAmt': 0.00,
                            'OPDueAmt': 0.00,
                            'OPCashRefundAmt': 0.00,
                            'OPOtherRefundAmt': 0.00,
                            'IPCashAmt': 0.00,
                            'IPCardAmt': 0.00,
                            'IPOtherAmt': 0.00,
                            'IPUpiAmt': 0.00,
                            'IPDueAmt': IPDueAmt,
                            'IPCashRefundAmt': 0.00,
                            'IPOtherRefundAmt': 0.00,
                        }
                    });

            }
            for (let idx in ipuserrefund) {
                let usercol = ipuserrefund[idx];
                let Key = '';
                let IPCashRefundAmt = 0;
                let IPOtherRefundAmt = 0;
                for (let ix in usercol) {
                    UserName = '';
                    if (usercol[ix].UserName) {
                        if (usercol[ix].UserName.Title)
                            UserName = usercol[ix].UserName.Title.Description;
                        if (usercol[ix].UserName.FirstName)
                            UserName += ' ' + usercol[ix].UserName.FirstName;
                        if (usercol[ix].UserName.LastName)
                            UserName += ' ' + usercol[ix].UserName.LastName;
                    }
                    if (usercol[ix].IPCashRefundAmount) {
                        IPCashRefundAmt = usercol[ix].IPCashRefundAmount;
                    }
                    if (usercol[ix].IPOtherRefundAmount) {
                        IPOtherRefundAmt = usercol[ix].IPOtherRefundAmount;
                    }
                    Key = UserName;
                    IPCashRefundAmt = IPCashRefundAmt;
                    IPOtherRefundAmt = IPOtherRefundAmt;
                }
                let valappended = 0;
                UserCollection.forEach(function (item) {
                    if (Key === item.Key) {
                        item.Value.IPCashRefundAmt = IPCashRefundAmt;
                        item.Value.IPOtherRefundAmt = IPOtherRefundAmt;
                        valappended = 1;
                    }
                });

                if (valappended === 0)
                    UserCollection.push({
                        'Key': Key,
                        'Value': {
                            'OPCashAmt': 0.00,
                            'OPCardAmt': 0.00,
                            'OPOtherAmt': 0.00,
                            'OPUpiAmt': 0.00,
                            'OPDueAmt': 0.00,
                            'OPCashRefundAmt': 0.00,
                            'OPOtherRefundAmt': 0.00,
                            'IPCashAmt': 0.00,
                            'IPCardAmt': 0.00,
                            'IPOtherAmt': 0.00,
                            'IPUpiAmt': 0.00,
                            'IPDueAmt': 0.00,
                            'IPCashRefundAmt': IPCashRefundAmt,
                            'IPOtherRefundAmt': IPOtherRefundAmt

                        }
                    });

            }

            for (let idx in UserCollection) {
                let collectiondetails = UserCollection[idx];
                let usercollect = {
                    Key: collectiondetails.Key,
                    OPCashAmt: collectiondetails.Value.OPCashAmt,
                    OPCardAmt: collectiondetails.Value.OPCardAmt,
                    OPOtherAmt: collectiondetails.Value.OPOtherAmt,
                    OPUpiAmt: collectiondetails.Value.OPUpiAmt,
                    OPDueAmt: collectiondetails.Value.OPDueAmt,
                    OPCashRefundAmt: collectiondetails.Value.OPCashRefundAmt,
                    OPOtherRefundAmt: collectiondetails.Value.OPOtherRefundAmt,
                    NetOPCollection: ((collectiondetails.Value.OPCashAmt || 0) + (collectiondetails.Value.OPCardAmt || 0) +
                        (collectiondetails.Value.OPOtherAmt || 0) + (collectiondetails.Value.OPUpiAmt || 0) +
                        (collectiondetails.Value.OPDueAmt || 0)) - ((collectiondetails.Value.OPCashRefundAmt || 0) +
                            (collectiondetails.Value.OPOtherRefundAmt || 0)),
                    IPCashAmt: collectiondetails.Value.IPCashAmt,
                    IPCardAmt: collectiondetails.Value.IPCardAmt,
                    IPOtherAmt: collectiondetails.Value.IPOtherAmt,
                    IPUpiAmt: collectiondetails.Value.IPUpiAmt,
                    IPDueAmt: collectiondetails.Value.IPDueAmt,
                    IPCashRefundAmt: collectiondetails.Value.IPCashRefundAmt,
                    IPOtherRefundAmt: collectiondetails.Value.IPOtherRefundAmt,
                    NetIPCollection: ((collectiondetails.Value.IPCashAmt || 0) + (collectiondetails.Value.IPCardAmt || 0) +
                        (collectiondetails.Value.IPOtherAmt || 0) + (collectiondetails.Value.IPUpiAmt || 0) +
                        (collectiondetails.Value.IPDueAmt || 0)) - ((collectiondetails.Value.IPCashRefundAmt || 0) +
                            (collectiondetails.Value.IPOtherRefundAmt || 0)),
                    OverallCollection: ((collectiondetails.Value.OPCashAmt || 0) + (collectiondetails.Value.OPCardAmt || 0) +
                        (collectiondetails.Value.OPOtherAmt || 0) + (collectiondetails.Value.OPUpiAmt || 0) +
                        (collectiondetails.Value.OPDueAmt || 0) + (collectiondetails.Value.IPCashAmt || 0) +
                        (collectiondetails.Value.IPCardAmt || 0) + (collectiondetails.Value.IPOtherAmt || 0) +
                        (collectiondetails.Value.IPUpiAmt || 0) + (collectiondetails.Value.IPDueAmt || 0)) -
                        ((collectiondetails.Value.OPCashRefundAmt || 0) + (collectiondetails.Value.OPOtherRefundAmt || 0) +
                            (collectiondetails.Value.IPCashRefundAmt || 0) + (collectiondetails.Value.IPOtherRefundAmt || 0))
                };
                NetUserCollection.push(usercollect);
            }
        }
        let TotOPCashAmt = 0;
        let TotOPCardAmt = 0;
        let TotOPOtherAmt = 0;
        let TotOPUpiAmt = 0;
        let TotOPDueAmt = 0;
        let TotOPCashRefundAmt = 0;
        let TotOPOtherRefundAmt = 0;
        let TotNetOPCollection = 0;
        let TotIPCashAmt = 0;
        let TotIPCardAmt = 0;
        let TotIPOtherAmt = 0;
        let TotIPUpiAmt = 0;
        let TotIPDueAmt = 0;
        let TotIPCashRefundAmt = 0;
        let TotIPOtherRefundAmt = 0;
        let TotNetIPCollection = 0;
        let TotalNetCollection = 0;

        for (let jdx in NetUserCollection) {
            let netcollection = NetUserCollection[jdx];
            TotOPCashAmt = TotOPCashAmt + (netcollection.OPCashAmt || 0);
            TotOPCardAmt = TotOPCardAmt + (netcollection.OPCardAmt || 0);
            TotOPOtherAmt = TotOPOtherAmt + (netcollection.OPOtherAmt || 0);
            TotOPUpiAmt = TotOPUpiAmt + (netcollection.OPUpiAmt || 0);
            TotOPDueAmt = TotOPDueAmt + (netcollection.OPDueAmt || 0);
            TotOPCashRefundAmt = TotOPCashRefundAmt + (netcollection.OPCashRefundAmt || 0);
            TotOPOtherRefundAmt = TotOPOtherRefundAmt + (netcollection.OPOtherRefundAmt || 0);
            TotNetOPCollection = TotNetOPCollection + (netcollection.NetOPCollection || 0);
            TotIPCashAmt = TotIPCashAmt + (netcollection.IPCashAmt || 0);
            TotIPCardAmt = TotIPCardAmt + (netcollection.IPCardAmt || 0);
            TotIPOtherAmt = TotIPOtherAmt + (netcollection.IPOtherAmt || 0);
            TotIPUpiAmt = TotIPUpiAmt + (netcollection.IPUpiAmt || 0);
            TotIPDueAmt = TotIPDueAmt + (netcollection.IPDueAmt || 0);
            TotIPCashRefundAmt = TotIPCashRefundAmt + (netcollection.IPCashRefundAmt || 0);
            TotIPOtherRefundAmt = TotIPOtherRefundAmt + (netcollection.IPOtherRefundAmt || 0);
            TotNetIPCollection = TotNetIPCollection + (netcollection.NetIPCollection || 0);
            TotalNetCollection = TotalNetCollection + (netcollection.OverallCollection || 0);
        }
        TotOPCashAmt = TotOPCashAmt;
        TotOPCardAmt = TotOPCardAmt;
        TotOPOtherAmt = TotOPOtherAmt;
        TotOPUpiAmt = TotOPUpiAmt;
        TotOPDueAmt = TotOPDueAmt;
        TotOPCashRefundAmt = TotOPCashRefundAmt;
        TotOPOtherRefundAmt = TotOPOtherRefundAmt;
        TotNetOPCollection = TotNetOPCollection;
        TotIPCashAmt = TotIPCashAmt;
        TotIPCardAmt = TotIPCardAmt;
        TotIPOtherAmt = TotIPOtherAmt;
        TotIPUpiAmt = TotIPUpiAmt;
        TotIPDueAmt = TotIPDueAmt;
        TotIPCashRefundAmt = TotIPCashRefundAmt;
        TotIPOtherRefundAmt = TotIPOtherRefundAmt;
        TotNetIPCollection = TotNetIPCollection;
        TotalNetCollection = TotalNetCollection;

        let info = {
            FromDate: FromDate,
            ToDate: ToDate,
            Preferences: printPreferencesData,
            UserName: UserName,
            NetUserCollection: NetUserCollection,
            FacilityName: FacilityName,
            TotOPCashAmt: TotOPCashAmt,
            TotOPCardAmt: TotOPCardAmt,
            TotOPOtherAmt: TotOPOtherAmt,
            TotOPUpiAmt: TotOPUpiAmt,
            TotOPDueAmt: TotOPDueAmt,
            TotOPCashRefundAmt: TotOPCashRefundAmt,
            TotOPOtherRefundAmt: TotOPOtherRefundAmt,
            TotNetOPCollection: TotNetOPCollection,
            TotIPCashAmt: TotIPCashAmt,
            TotIPCardAmt: TotIPCardAmt,
            TotIPOtherAmt: TotIPOtherAmt,
            TotIPUpiAmt: TotIPUpiAmt,
            TotIPDueAmt: TotIPDueAmt,
            TotIPCashRefundAmt: TotIPCashRefundAmt,
            TotIPOtherRefundAmt: TotIPOtherRefundAmt,
            TotNetIPCollection: TotNetIPCollection,
            TotalNetCollection: TotalNetCollection,

        };
        let pdfOption: any = null;
        let key = 'userwisecollectionsummary';
        let pdfOptionJSON = await Report.GetPdfOption(key);
        if (!pdfOptionJSON) {
            pdfOption = {
                format: 'A4',
                orientation: 'landscape',
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
        } else {
            pdfOption = JSON.parse(pdfOptionJSON);
            pdfOption.base = 'file://' + join(__dirname, '/../../Templates/assets/');
        }
        return await Report.Generate(key, { header: {}, body: info }, null, pdfOption);
    }
    public async PrintOverallCollectionSummary(req: BaseRequest): Promise<any> {
        let dateformat = 'DD/MM/YYYY';
        let timeformat = 'HH:mm:ss';
        let fromdate = moment(req.Data.FromDate).format(dateformat);
        let FromTime = moment(req.Data.FromDate).format(timeformat);
        let FromDate = fromdate + ' ' + FromTime;

        let todate = moment(req.Data.ToDate).format(dateformat);
        let totime = moment(req.Data.ToDate).format(timeformat);
        let ToDate = todate + ' ' + totime;

        let FacilityId = req.Data.FacilityId;
        let FacilityName = req.Data.FacilityName;
        let UserName = req.Data.UserName;
        let OverallCollection: any = [];
        let UserReq = req;
        OverallCollection = await this.GetOverallCollectionSummary(UserReq);
        // DoctorData = DoctorData;
        let facilityPreferenceBO = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(FacilityId);
        // let UserCollection = [];
        let NetUserCollection: any[] = [];
        let OverallCollectSummary = [];


        if (OverallCollection) {
            let opbillcollection1 = [];
            let opbillcollection2 = [];
            let opbillcollection3 = [];
            let ipbillcollection1 = [];
            let ipbillcollection2 = [];
            let ipbillcollection3 = [];
            let phabillcollection1 = [];
            let phabillcollection2 = [];
            let phabillcollection3 = [];
            let phabillcollection4 = [];
            let doctorshare = [];
            let advancefund = [];
            if (OverallCollection.length > 0) {
                opbillcollection1 = OverallCollection[0];
            }
            if (OverallCollection.length > 1) {
                opbillcollection2 = OverallCollection[1];
            }
            if (OverallCollection.length > 2) {
                opbillcollection3 = OverallCollection[2];
            }
            if (OverallCollection.length > 0) {
                ipbillcollection1 = OverallCollection[3];
            }
            if (OverallCollection.length > 1) {
                ipbillcollection2 = OverallCollection[4];
            }
            if (OverallCollection.length > 2) {
                ipbillcollection3 = OverallCollection[5];
            }
            if (OverallCollection.length > 0) {
                phabillcollection1 = OverallCollection[6];
            }
            if (OverallCollection.length > 1) {
                phabillcollection2 = OverallCollection[7];
            }
            if (OverallCollection.length > 2) {
                phabillcollection3 = OverallCollection[8];
            }
            if (OverallCollection.length > 2) {
                phabillcollection4 = OverallCollection[9];
            }
            if (OverallCollection.length > 3) {
                doctorshare = OverallCollection[10];
            }
            if (OverallCollection.length > 3) {
                advancefund = OverallCollection[11];
            }

            if (opbillcollection1) {
                let Key = '';
                let CashAmt = 0;
                let CardAmt = 0;
                let OtherAmt = 0;
                let UPIAmt = 0;
                Key = opbillcollection1.Key;
                CashAmt = opbillcollection1.Value.CashAmount;
                CardAmt = opbillcollection1.Value.CardAmount;
                OtherAmt = opbillcollection1.Value.OtherAmount;
                UPIAmt = opbillcollection1.Value.UPIAmount;
                NetUserCollection.push({
                    'Key': Key,
                    'CashAmt': CashAmt,
                    'CardAmt': CardAmt,
                    'OtherAmt': OtherAmt,
                    'UPIAmt': UPIAmt,
                    'BillAmt': 0.00,
                    'BillDis': 0.00,
                    'DueAmt': 0.00,
                    'RefCashAmt': 0.00,
                    'RefCardAmt': 0.00,
                    'RefOtherAmt': 0.00,
                    'RefUPIAmt': 0.00,
                    'RefAmt': 0.00,
                    'IPBill': 0.00,
                    'IPRetAmt': 0.00,
                    'DocCashAmt': 0.00,
                    'DocCardAmt': 0.00,
                    'DocOtherAmt': 0.00,
                    'DocUPIAmt': 0.00,
                    'DocAmt': 0.00,
                });
            }
            if (opbillcollection2) {
                let Key = '';
                let BillAmt = 0;
                let BillDis = 0;
                let DueAmt = 0;
                Key = opbillcollection2.Key;
                BillAmt = opbillcollection2.Value.BillAmount;
                BillDis = opbillcollection2.Value.BillDiscount;
                DueAmt = opbillcollection2.Value.OutStandingAmount;
                let valappended = 0;
                NetUserCollection.forEach(function (item) {
                    if (Key === item.Key) {
                        item.BillAmt = BillAmt;
                        item.BillDis = BillDis;
                        item.DueAmt = DueAmt;
                        valappended = 1;
                    }
                });
            }
            if (opbillcollection3) {
                let Key = '';
                let RefCashAmt = 0;
                let RefCardAmt = 0;
                let RefOtherAmt = 0;
                let RefUPIAmt = 0;
                let RefAmt = 0;
                Key = opbillcollection3.Key;
                RefCashAmt = opbillcollection3.Value.CashAmount;
                RefCardAmt = opbillcollection3.Value.CardAmount;
                RefOtherAmt = opbillcollection3.Value.OtherAmount;
                RefUPIAmt = opbillcollection3.Value.UPIAmount;
                RefAmt = opbillcollection3.Value.RefundAmount;
                let valappended = 0;
                NetUserCollection.forEach(function (item) {
                    if (Key === item.Key) {
                        item.RefCashAmt = RefCashAmt;
                        item.RefCardAmt = RefCardAmt;
                        item.RefOtherAmt = RefOtherAmt;
                        item.RefUPIAmt = RefUPIAmt;
                        item.RefAmt = RefAmt;
                        valappended = 1;
                    }
                });
            }

            if (ipbillcollection1) {
                let Key = '';
                let CashAmt = 0;
                let CardAmt = 0;
                let OtherAmt = 0;
                let UPIAmt = 0;
                Key = ipbillcollection1.Key;
                CashAmt = ipbillcollection1.Value.CashAmount;
                CardAmt = ipbillcollection1.Value.CardAmount;
                OtherAmt = ipbillcollection1.Value.OtherAmount;
                UPIAmt = ipbillcollection1.Value.UPIAmount;
                NetUserCollection.push({
                    'Key': Key,
                    'CashAmt': CashAmt,
                    'CardAmt': CardAmt,
                    'OtherAmt': OtherAmt,
                    'UPIAmt': UPIAmt,
                    'BillAmt': 0.00,
                    'BillDis': 0.00,
                    'DueAmt': 0.00,
                    'IPBill': 0.00,
                    'RefCashAmt': 0.00,
                    'RefCardAmt': 0.00,
                    'RefOtherAmt': 0.00,
                    'RefUPIAmt': 0.00,
                    'RefAmt': 0.00,
                    'IPRetAmt': 0.00,
                    'DocCashAmt': 0.00,
                    'DocCardAmt': 0.00,
                    'DocUPIAmt': 0.00,
                    'DocOtherAmt': 0.00,
                    'DocAmt': 0.00,
                });
            }
            if (ipbillcollection2) {
                let Key = '';
                let BillAmt = 0;
                let BillDis = 0;
                let DueAmt = 0;
                Key = ipbillcollection2.Key;
                BillAmt = ipbillcollection2.Value.BillAmount;
                BillDis = ipbillcollection2.Value.BillDiscount;
                DueAmt = ipbillcollection2.Value.OutStandingAmount;
                let valappended = 0;
                NetUserCollection.forEach(function (item) {
                    if (Key === item.Key) {
                        item.BillAmt = BillAmt;
                        item.BillDis = BillDis;
                        item.DueAmt = DueAmt;
                        valappended = 1;
                    }
                });
            }
            if (ipbillcollection3) {
                let Key = '';
                let RefCashAmt = 0;
                let RefCardAmt = 0;
                let RefOtherAmt = 0;
                let RefUPIAmt = 0;
                let RefAmt = 0;
                Key = ipbillcollection3.Key;
                RefCashAmt = ipbillcollection3.Value.CashAmount;
                RefCardAmt = ipbillcollection3.Value.CardAmount;
                RefOtherAmt = ipbillcollection3.Value.OtherAmount;
                RefUPIAmt = ipbillcollection3.Value.UPIAmount;
                RefAmt = ipbillcollection3.Value.RefundAmount;
                let valappended = 0;
                NetUserCollection.forEach(function (item) {
                    if (Key === item.Key) {
                        item.RefCashAmt = RefCashAmt;
                        item.RefCardAmt = RefCardAmt;
                        item.RefOtherAmt = RefOtherAmt;
                        item.RefUPIAmt = RefUPIAmt;
                        item.RefAmt = RefAmt;
                        valappended = 1;
                    }
                });
            }

            if (phabillcollection1) {
                let Key = '';
                let CashAmt = 0;
                let CardAmt = 0;
                let OtherAmt = 0;
                let UPIAmt = 0;
                Key = phabillcollection1.Key;
                CashAmt = phabillcollection1.Value.CashAmount;
                CardAmt = phabillcollection1.Value.CardAmount;
                OtherAmt = phabillcollection1.Value.OtherAmount;
                UPIAmt = phabillcollection1.Value.UPIAmount;
                NetUserCollection.push({
                    'Key': Key,
                    'CashAmt': CashAmt,
                    'CardAmt': CardAmt,
                    'OtherAmt': OtherAmt,
                    'UPIAmt': UPIAmt,
                    'BillAmt': 0.00,
                    'BillDis': 0.00,
                    'DueAmt': 0.00,
                    'IPBill': 0.00,
                    'RefCashAmt': 0.00,
                    'RefCardAmt': 0.00,
                    'RefOtherAmt': 0.00,
                    'RefUPIAmt': 0.00,
                    'RefAmt': 0.00,
                    'IPRetAmt': 0.00,
                    'DocCashAmt': 0.00,
                    'DocCardAmt': 0.00,
                    'DocOtherAmt': 0.00,
                    'DocUPIAmt': 0.00,
                    'DocAmt': 0.00,
                });
            }
            if (phabillcollection2) {
                let Key = '';
                let BillAmt = 0;
                let BillDis = 0;
                let DueAmt = 0;
                let IPBill = 0;
                Key = phabillcollection2.Key;
                BillAmt = phabillcollection2.Value.BillAmount;
                BillDis = phabillcollection2.Value.BillDiscount;
                DueAmt = phabillcollection2.Value.OutStandingAmount;
                IPBill = phabillcollection2.Value.IPBillAmount;
                let valappended = 0;
                NetUserCollection.forEach(function (item) {
                    if (Key === item.Key) {
                        item.BillAmt = BillAmt;
                        item.BillDis = BillDis;
                        item.DueAmt = DueAmt;
                        item.IPBill = IPBill;
                        valappended = 1;
                    }
                });
            }
            if (phabillcollection3) {
                let Key = '';
                let RefCashAmt = 0;
                let RefCardAmt = 0;
                let RefOtherAmt = 0;
                let RefUPIAmt = 0;
                let RefAmt = 0;
                Key = phabillcollection3.Key;
                RefCashAmt = phabillcollection3.Value.CashAmount;
                RefCardAmt = phabillcollection3.Value.CardAmount;
                RefOtherAmt = phabillcollection3.Value.OtherAmount;
                RefUPIAmt = phabillcollection3.Value.UPIAmount;
                RefAmt = phabillcollection3.Value.RefundAmount;
                let valappended = 0;
                NetUserCollection.forEach(function (item) {
                    if (Key === item.Key) {
                        item.RefCashAmt = RefCashAmt;
                        item.RefCardAmt = RefCardAmt;
                        item.RefOtherAmt = RefOtherAmt;
                        item.RefUPIAmt = RefUPIAmt;
                        item.RefAmt = RefAmt;
                        valappended = 1;
                    }
                });
            }
            if (phabillcollection4) {
                let Key = '';
                let IPRetAmt = 0;
                Key = phabillcollection4.Key;
                IPRetAmt = phabillcollection4.Value.IPReturnAmount;
                let valappended = 0;
                NetUserCollection.forEach(function (item) {
                    if (Key === item.Key) {
                        item.IPRetAmt = IPRetAmt;
                        valappended = 1;
                    }
                });
            }
            if (doctorshare) {
                let Key = '';
                let DocCashAmt = 0;
                let DocCardAmt = 0;
                let DocOtherAmt = 0;
                let DocUPIAmt = 0;
                let DocAmt = 0;
                Key = doctorshare.Key;
                DocCashAmt = doctorshare.Value.CashAmount;
                DocCardAmt = doctorshare.Value.CardAmount;
                DocOtherAmt = doctorshare.Value.OtherAmount;
                DocUPIAmt = doctorshare.Value.UPIAmount;
                DocAmt = doctorshare.Value.DoctorShare;
                let valappended = 0;
                NetUserCollection.forEach(function (item: any) {
                    if (Key === item.Key) {
                        item.DocCashAmt = DocCashAmt;
                        item.DocCardAmt = DocCardAmt;
                        item.DocOtherAmt = DocOtherAmt;
                        item.DocUPIAmt = DocUPIAmt;
                        item.DocAmt = DocAmt;
                        valappended = 1;
                    }
                });
                if (valappended === 0) {
                    NetUserCollection.push({
                        'Key': Key,
                        'CashAmt': 0.00,
                        'CardAmt': 0.00,
                        'OtherAmt': 0.00,
                        'UPIAmt': 0.00,
                        'BillAmt': 0.00,
                        'BillDis': 0.00,
                        'DueAmt': 0.00,
                        'IPBill': 0.00,
                        'RefCashAmt': 0.00,
                        'RefCardAmt': 0.00,
                        'RefOtherAmt': 0.00,
                        'RefUPIAmt': 0.00,
                        'RefAmt': 0.00,
                        'IPRetAmt': 0.00,
                        'DocCashAmt': DocCashAmt,
                        'DocCardAmt': DocCardAmt,
                        'DocOtherAmt': DocOtherAmt,
                        'DocUPIAmt': DocUPIAmt,
                        'DocAmt': DocAmt,
                    });
                }
            }
            if (advancefund) {
                let Key = '';
                let CashAmt = 0;
                let CardAmt = 0;
                let OtherAmt = 0;
                let UPIAmt = 0;
                Key = advancefund.Key;
                CashAmt = advancefund.Value.CashAmount;
                CardAmt = advancefund.Value.CardAmount;
                OtherAmt = advancefund.Value.OtherAmount;
                UPIAmt = advancefund.Value.UPIAmount;
                // Amt = advancefund.Value.TotalAmountPaid;
                let valappended = 0;
                NetUserCollection.forEach(function (item: any) {
                    if (Key === item.Key) {
                        item.CashAmt = CashAmt;
                        item.CardAmt = CardAmt;
                        item.OtherAmt = OtherAmt;
                        item.UPIAmt = UPIAmt;
                        // item.Amt = Amt;
                        valappended = 1;
                    }
                });
                if (valappended === 0) {
                    NetUserCollection.push({
                        'Key': Key,
                        'CashAmt': CashAmt,
                        'CardAmt': CardAmt,
                        'OtherAmt': OtherAmt,
                        'UPIAmt': UPIAmt,
                        'BillAmt': 0.00,
                        'BillDis': 0.00,
                        'DueAmt': 0.00,
                        'RefCashAmt': 0.00,
                        'RefCardAmt': 0.00,
                        'RefOtherAmt': 0.00,
                        'RefUPIAmt': 0.00,
                        'RefAmt': 0.00,
                        'IPBill': 0.00,
                        'IPRetAmt': 0.00,
                        'DocCashAmt': 0.00,
                        'DocCardAmt': 0.00,
                        'DocOtherAmt': 0.00,
                        'DocUPIAmt': 0.00,
                        'DocAmt': 0.00,
                        // 'Amt': Amt,
                    });
                }
            }
            for (let idx in NetUserCollection) {
                let usercollectdata = NetUserCollection[idx];

                let overallcollection = {
                    Key: usercollectdata.Key,
                    BillAmount: usercollectdata.BillAmt,
                    BillDiscount: usercollectdata.BillDis,
                    NetAmount: (usercollectdata.BillAmt || 0) - (usercollectdata.BillDis || 0),
                    DueAmount: usercollectdata.DueAmt,
                    Cash: usercollectdata.CashAmt,
                    RefundCash: usercollectdata.RefCashAmt,
                    NetCash: (usercollectdata.CashAmt || 0) - (usercollectdata.RefCashAmt || 0),
                    Card: usercollectdata.CardAmt,
                    RefundCard: usercollectdata.RefCardAmt,
                    NetCard: (usercollectdata.CardAmt || 0) - (usercollectdata.RefCardAmt || 0),
                    Others: usercollectdata.OtherAmt,
                    RefundOthers: usercollectdata.RefOtherAmt,
                    NetOthers: (usercollectdata.OtherAmt || 0) - (usercollectdata.RefOtherAmt || 0),
                    UPI: usercollectdata.UPIAmt,
                    RefundUPI: usercollectdata.RefUPIAmt,
                    NetUPI: (usercollectdata.UPIAmt || 0) - (usercollectdata.RefUPIAmt || 0),
                    TotalCollect: ((usercollectdata.CashAmt || 0) - (usercollectdata.RefCashAmt || 0)) +
                        ((usercollectdata.CardAmt || 0) - (usercollectdata.RefCardAmt || 0)) +
                        ((usercollectdata.OtherAmt || 0) - (usercollectdata.RefOtherAmt || 0)) +
                        ((usercollectdata.UPIAmt || 0) - (usercollectdata.RefUPIAmt || 0))
                        - (usercollectdata.DocAmt || 0),
                    DocCash: usercollectdata.DocCashAmt,
                    DocCard: usercollectdata.DocCardAmt,
                    DocOthers: usercollectdata.DocOtherAmt,
                    DocUPI: usercollectdata.DocUPIAmt,
                    DocTotal: usercollectdata.DocAmt,
                    NetRef: usercollectdata.RefAmt,

                };
                OverallCollectSummary.push(overallcollection);
            }

        }
        let TotBillAmt = 0;
        let TotBillDis = 0;
        let TotNetAmt = 0;
        let TotDueAmt = 0;
        let TotCashAmt = 0;
        let TotCardAmt = 0;
        let TotOtherAmt = 0;
        let TotUPIAmt = 0;
        let TotCollectionAmt = 0;
        let DocCashAmt = 0;
        let DocCardAmt = 0;
        let DocOtherAmt = 0;
        let DocUPIAmt = 0;
        let TotalDocAmt = 0;
        let TotalRefAmt = 0;


        for (let jdx in OverallCollectSummary) {
            let netcollection = OverallCollectSummary[jdx];
            TotBillAmt = TotBillAmt + (netcollection.BillAmount || 0);
            TotBillDis = TotBillDis + (netcollection.BillDiscount || 0);
            TotNetAmt = TotNetAmt + (netcollection.NetAmount || 0);
            TotDueAmt = TotDueAmt + (netcollection.DueAmount || 0);
            TotCashAmt = TotCashAmt + (netcollection.NetCash || 0);
            TotCardAmt = TotCardAmt + (netcollection.NetCard || 0);
            TotOtherAmt = TotOtherAmt + (netcollection.NetOthers || 0);
            TotUPIAmt = TotUPIAmt + (netcollection.NetUPI || 0);
            TotCollectionAmt = TotCollectionAmt + (netcollection.TotalCollect || 0);
            DocCashAmt = DocCashAmt + (netcollection.DocCash || 0);
            DocCardAmt = DocCardAmt + (netcollection.DocCard || 0);
            DocOtherAmt = DocOtherAmt + (netcollection.DocOthers || 0);
            DocUPIAmt = DocUPIAmt + (netcollection.DocUPI || 0);
            TotalDocAmt = TotalDocAmt + (netcollection.DocTotal || 0);
            TotalRefAmt = TotalRefAmt + (netcollection.NetRef || 0);
        }
        TotBillAmt = TotBillAmt;
        TotBillDis = TotBillDis;
        TotNetAmt = TotNetAmt;
        TotDueAmt = TotDueAmt;
        TotCashAmt = TotCashAmt;
        TotCardAmt = TotCardAmt;
        TotOtherAmt = TotOtherAmt;
        TotUPIAmt = TotUPIAmt;
        TotCollectionAmt = TotCollectionAmt;
        DocCashAmt = DocCashAmt;
        DocCardAmt = DocCardAmt;
        DocUPIAmt = DocUPIAmt;
        DocOtherAmt = DocOtherAmt;
        TotalDocAmt = TotalDocAmt;
        TotalRefAmt = TotalRefAmt;
        OverallCollection = (TotCollectionAmt - TotalDocAmt);

        let info = {
            FromDate: FromDate,
            ToDate: ToDate,
            Preferences: printPreferencesData,
            UserName: UserName,
            NetUserCollection: NetUserCollection,
            FacilityName: FacilityName,
            OverallCollectSummary: OverallCollectSummary,
            TotBillAmt: TotBillAmt,
            TotBillDis: TotBillDis,
            TotNetAmt: TotNetAmt,
            TotDueAmt: TotDueAmt,
            TotCashAmt: TotCashAmt,
            TotCardAmt: TotCardAmt,
            TotOtherAmt: TotOtherAmt,
            TotUPIAmt: TotUPIAmt,
            TotCollectionAmt: TotCollectionAmt,
            DocCashAmt: DocCashAmt,
            DocCardAmt: DocCardAmt,
            DocOtherAmt: DocOtherAmt,
            DocUPIAmt: DocUPIAmt,
            TotalDocAmt: TotalDocAmt,
            TotalRefAmt: TotalRefAmt,
            OverallCollection: OverallCollection

        };
        let pdfOption: any = null;
        let key = 'overallcollectionsummary';
        let pdfOptionJSON = await Report.GetPdfOption(key);
        if (!pdfOptionJSON) {
            pdfOption = {
                format: 'A4',
                orientation: 'landscape',
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
        } else {
            pdfOption = JSON.parse(pdfOptionJSON);
            pdfOption.base = 'file://' + join(__dirname, '/../../Templates/assets/');
        }
        return await Report.Generate(key, { header: {}, body: info }, null, pdfOption);
    }

    public async PrintPatientPaymentDetails(req: BaseRequest): Promise<FileInfo> {
        let flags = {
            header: (req.Data.withHeader) ? req.Data.withHeader : 0,
            woheader: (req.Data.withoutHeader) ? req.Data.withoutHeader : 0,
            // payment: (req.Data.paymentDetail)? req.Data.paymentDetail: 0,
            // nonmedical: (req.Data.nonMedical)? req.Data.nonMedical: 0,
        };
        let apiReq = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [{ Key: PatientPaymentDetailsFilters.Id, Value: req.Id }]
        };
        // let data = await this.GetPatientPaymentDetails(apiReq);
        let data = await this.GetMinPatientPaymentDetails(apiReq);
        let PatientPaymentDetails: any = data.Data[0];
        let patientBo = BoFactory.GetBo(regbo.PatientBo, this.Request);
        let encounterData: any = [];
        let encdata: any = {};
        if (PatientPaymentDetails.EncounterId !== null) {
            let encReq = {
                Id: 0,
                PageContext: { PageSize: -1, PageNumber: 1 },
                Params: [{ Key: EncounterFilters.Id, Value: PatientPaymentDetails.EncounterId }]
            };
            let encounterBo = BoFactory.GetBo(encbo.EncounterBo, this.Request);
            encounterData = await encounterBo.GetMINIPPatientsBills(encReq);
            encdata = encounterData.Data[0];
        }
        let patientData: any = await patientBo.GetPatientById({ Id: PatientPaymentDetails.PatientId });
        let Age = '';
        if (patientData.Age === 0) {
            let diffDuration = moment.duration(moment().diff(patientData.DOB));
            let ageresult = '';
            let years = diffDuration.years();
            let months = diffDuration.months();
            let days = diffDuration.days();
            if (years > 0) {
                ageresult = diffDuration.years() + 'y ';
            } else if (years === 0) {
                if (months > 0) {
                    ageresult += diffDuration.months() + 'M ';
                }
                if (days > 0) {
                    ageresult += diffDuration.days() + 'D ';
                }
            }
            Age = ageresult;
        } else if (patientData.Age > 0) {
            Age = patientData.Age + 'y';
        }
        let facilityPreferenceBO = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(PatientPaymentDetails.FacilityId);
        let QrInfo: any;
        let PatName: '';
        let FacInfo: '';
        if (patientData.Title) {
            PatName = patientData.Title.Description;
        }
        if (patientData.FirstName) {
            PatName += ' ' + patientData.FirstName;
        }
        if (patientData.LastName) {
            PatName += ' ' + patientData.LastName;
        }
        if (PatientPaymentDetails.Facility) {
            FacInfo = PatientPaymentDetails.Facility.FacilityName;
        }
        if (PatientPaymentDetails.Facility.AddressLine1) {
            FacInfo += ', ' + PatientPaymentDetails.Facility.AddressLine1;
        }
        if (PatientPaymentDetails.Facility.Mobile) {
            FacInfo += ',Phone: ' + PatientPaymentDetails.Facility.Mobile;
        }
        if (PatientPaymentDetails.Facility.Email) {
            FacInfo += ',Email: ' + PatientPaymentDetails.Facility.Email;
        }
        if (PatientPaymentDetails.Facility.GstNumber) {
            FacInfo += ',GSTIN No: ' + PatientPaymentDetails.Facility.GstNumber;
        }

        QrInfo = PatientPaymentDetails.ReceiptNumber + ' , ' + PatientPaymentDetails.AmountPaid + ' , ' +
            PatientPaymentDetails.ReceiptDateTime + ' , ' + PatName + ' , ' + FacInfo;
        let AdvanceTypeId;
        let printInfo = {
            ObjectId: req.Id
            , ObjectTypeId: 4 /*Order*/
            , Reason: req.Data ? req.Data.Reason : null
            , PrintTypeId: AdvanceTypeId
        };
        let advancetype = BoFactory.GetBo(generalBO.EntityPrintHistoryBo, this.Request);
        let entitydata = await advancetype.ManagePrintHistory(printInfo);
        let info = {
            Title: '',
            Patient: patientData,
            Age: Age,
            PatientPaymentDetails: PatientPaymentDetails,
            PatientBills: {},
            Encounter: encdata,
            Preferences: printPreferencesData,
            QrInfo: QrInfo,
            Flags: flags,
            entitydata: entitydata
        };

        if (PatientPaymentDetails.ReceiptTypeId === 3) {
            info.Title = 'DUE RECEIPT';
        } if (PatientPaymentDetails.ReceiptTypeId === 1) {
            info.Title = 'ADVANCE RECEIPT';
        } if (PatientPaymentDetails.ReceiptTypeId === 5) {
            info.Title = 'ADVANCE RECEIPT';
        } if (PatientPaymentDetails.ReceiptTypeId === 2) {
            if (PatientPaymentDetails.EncounterTypeId === 1) {
                info.Title = 'OP RECEIPT';
            } else if (PatientPaymentDetails.EncounterTypeId === 2) {
                info.Title = 'IP RECEIPT';
            } else if (!PatientPaymentDetails.EncounterTypeId || PatientPaymentDetails.EncounterTypeId === 0) {
                info.Title = 'RECEIPT';
            }
        }
        let key = 'advance';
        if (PatientPaymentDetails.ReceiptTypeId === 2) {
            // let scrReq = {
            //     Id: 0,
            //     PageContext: { PageSize: 50, PageNumber: 1 },
            //     Params: [{ Key: PatientBillsFilters.Id, Value: PatientPaymentDetails.PatientBillId }]
            // };
            // let PatientBillsBo = BoFactory.GetBo(billingbo.PatientBillsBo, this.Request);
            // let PatientBillsData = await PatientBillsBo.GetPatientBills(scrReq);
            // let BillData = PatientBillsData.Data[0];
            // info.PatientBills = BillData;
            key = 'receipt';
        }
        let Watermark = '';
        let PrintTypeId: number;
        if (info.PatientPaymentDetails.ReceiptStatusId === 3) {
            Watermark = 'CANCELLED';
            PrintTypeId = 2;
        }
        let ephBO = BoFactory.GetBo(generalBO.EntityPrintHistoryBo, this.Request);
        let pdfOption: any = null;
        let pdfOptionJSON = await Report.GetPdfOption(key);
        if (!pdfOptionJSON) {
            pdfOption = {
                format: 'A4',
                orientation: 'portrait',
                border: '0',
                header: {
                    height: '1.5in',
                    contents: '',
                },
                footer: {
                    height: '1in',
                    contents: {
                        first: '',
                        default: '',
                        last: '',
                    },
                },
                type: 'pdf',
                base: 'file://' + join(__dirname, '/../../Templates/assets/')
            };
        } else {
            pdfOption = JSON.parse(pdfOptionJSON);
            pdfOption.base = 'file://' + join(__dirname, '/../../Templates/assets/');
            console.log(pdfOption);
        }

        return await ephBO.PrintReport(key
            , { header: {}, body: info, pdfOption }
            , {
                ObjectId: req.Id
                , ObjectTypeId: 4
                , Reason: req.Data ? req.Data.Reason : null
                , Watermark: Watermark
                , PrintTypeId: PrintTypeId
            });
    }

    public GetModel(): SStatic.Model<PatientPaymentDetailsInstance, PatientPaymentDetailsAttributes> {
        return this.Models.PatientPaymentDetails;
    }

    public async DMPrintPatientPaymentDetails(req: BaseRequest): Promise<any> {
        let apiReq = {
            Id: 0,
            PageContext: { PageSize: 50, PageNumber: 1 },
            Params: [{ Key: PatientPaymentDetailsFilters.Id, Value: req.Id }]
        };
        let data = await this.GetPatientPaymentDetails(apiReq);
        let PatientPaymentDetails = data.Data[0];
        let patientBo = BoFactory.GetBo(regbo.PatientBo, this.Request);
        let encReq = {
            Id: 0,
            PageContext: { PageSize: 50, PageNumber: 1 },
            Params: [{ Key: EncounterFilters.Id, Value: PatientPaymentDetails.EncounterId }]
        };
        let encounterBo = BoFactory.GetBo(encbo.EncounterBo, this.Request);
        let encounterData = await encounterBo.GetEncounters(encReq);
        let patientData = await patientBo.GetPatientById({ Id: PatientPaymentDetails.PatientId });
        let info = {
            Patient: patientData,
            PatientPaymentDetails: PatientPaymentDetails,
            PatientBills: {},
            Encounter: encounterData.Data[0],
            NetAmountInWords: await this.AmountInWord(PatientPaymentDetails.AmountPaid)
        };
        return info;
    }

    public async AmountInWord(amt: number): Promise<string> {
        let amount: number = amt;
        let lang = 'enIndian';
        let writtenNumber = require('written-number');
        let stramt = amount.toFixed(2);
        let ActualAmts = stramt.split('.');
        if (ActualAmts.length > 0) {
            let damt1: number = +ActualAmts[0];
            var writtenNumber1 = writtenNumber(damt1, { lang: lang });
        }
        if (ActualAmts.length > 1) {
            var damt2 = +ActualAmts[1];

            var writtenNumber2 = writtenNumber(damt2, { lang: lang });

        }
        return writtenNumber1 + ' and ' + writtenNumber2 + ' Paise';
    }

    public async GetPharmacySalesCollections(req: BaseRequest): Promise<any> {
        let result: any = [];
        result.push({ Key: 'OP Collection', Value: await this.OPSalesCollectionDetails(req) });
        result.push({ Key: 'IP Collection-cash', Value: await this.IPSalesCollectionDetails(req) });
        result.push({ Key: 'Direct Collection', Value: await this.DirectSalesCollectionDetails(req) });
        result.push({ Key: 'Staff Collection', Value: await this.StaffSalesCollectionDetails(req) });
        result.push({ Key: 'Advance Collection', Value: await this.AdvanceCollectionDetails(req) });
        return result;
    }
    public async AdvanceCollectionDetails(req: BaseRequest): Promise<any> {
        let AdvanceBillResult: any = {};
        AdvanceBillResult['DisplayOrder'] = 5;
        // let EncJoin: any = {
        //     model: this.Models.Encounter,
        //     attributes: ['Id', 'EncounterTypeId'],
        //     required: true,
        //     // where: {
        //     //     EncounterTypeId:2 ,
        //     // }
        // };
        // let PatientBillJoin: any = {
        //     model: this.Models.PatientBills,
        //     attributes: ['Id'],
        //     required: true,
        //     where: {
        //         BillTypeId: 4,
        //         BillDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate }
        //     },
        //     include: [EncJoin]
        // };
        let storeId: any;
        if (req.Data.StoreMasterId > 0) {
            storeId = req.Data.StoreMasterId;
        } else {
            storeId = { '$gt': 0 };
        }
        let advancebillamountInstance: any = await this.Find({
            attributes: [
                [this.Dal.fn('SUM', this.Dal.col('AmountPaid')), 'TotalAmountPaid'],
            ],
            where: {
                ReceiptDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                ReceiptTypeId: 7,
                IsPharmacyReceipt: true,
                ReceiptStatusId: 1,
                FacilityId: req.Data.FacilityId,
                StoreMasterId: storeId,
            },
            // include: [EncJoin]
        });
        if (advancebillamountInstance) {
            let bill: any = this.GetAttribute(advancebillamountInstance);
            AdvanceBillResult['BillAmount'] = bill['TotalAmountPaid'];
        }

        let advancebillamountcashInstance: any = await this.Find({
            attributes: [
                [this.Dal.fn('SUM', this.Dal.col('AmountPaid')), 'TotalAmountPaid'],
            ],
            where: {
                ReceiptDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                ReceiptStatusId: 1,
                IsPharmacyReceipt: true,
                FacilityId: req.Data.FacilityId,
                ReceiptTypeId: 7,
                PaymentTypeId: 1,
            },
            // include: [EncJoin]
        });
        if (advancebillamountcashInstance) {
            let bill: any = this.GetAttribute(advancebillamountcashInstance);
            AdvanceBillResult['CashAmount'] = bill['TotalAmountPaid'];
        }

        let advancebillamountcardInstance: any = await this.Find({
            attributes: [
                [this.Dal.fn('SUM', this.Dal.col('AmountPaid')), 'TotalAmountPaid'],
            ],
            where: {
                ReceiptDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                ReceiptStatusId: 1,
                IsPharmacyReceipt: true,
                FacilityId: req.Data.FacilityId,
                ReceiptTypeId: 7,
                PaymentTypeId: { '$in': [5, 6] }
            },
            // include: [EncJoin]
        });
        if (advancebillamountcardInstance) {
            let bill: any = this.GetAttribute(advancebillamountcardInstance);
            AdvanceBillResult['CardAmount'] = bill['TotalAmountPaid'];
        }

        let advancebillamountotherInstance: any = await this.Find({
            attributes: [
                [this.Dal.fn('SUM', this.Dal.col('AmountPaid')), 'TotalAmountPaid'],
            ],
            where: {
                ReceiptDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                ReceiptStatusId: 1,
                IsPharmacyReceipt: true,
                FacilityId: req.Data.FacilityId,
                ReceiptTypeId: 7,
                PaymentTypeId: { '$notIn': [1, 5, 6, 11] }
            },
            // include: [EncJoin]
        });
        if (advancebillamountotherInstance) {
            let bill: any = this.GetAttribute(advancebillamountotherInstance);
            AdvanceBillResult['OtherAmount'] = bill['TotalAmountPaid'];
        }

        let advancebillamountupiInstance: any = await this.Find({
            attributes: [
                [this.Dal.fn('SUM', this.Dal.col('AmountPaid')), 'TotalAmountPaid'],
            ],
            where: {
                ReceiptDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                ReceiptStatusId: 1,
                IsPharmacyReceipt: true,
                FacilityId: req.Data.FacilityId,
                ReceiptTypeId: 7,
                PaymentTypeId: 11
            },
            // include: [EncJoin]
        });
        if (advancebillamountupiInstance) {
            let bill: any = this.GetAttribute(advancebillamountupiInstance);
            AdvanceBillResult['UPIAmount'] = bill['TotalAmountPaid'];
        }

        return AdvanceBillResult;
    }


    public async OPSalesCollectionDetails(req: BaseRequest): Promise<any> {
        let OPBillResult: any = {};
        OPBillResult['DisplayOrder'] = 1;
        let EncJoin: any = {
            model: this.Models.Encounter,
            attributes: ['Id', 'EncounterTypeId'],
            required: true,
            where: {
                EncounterTypeId: 1,
            }
        };
        let storeId: any;
        if (req.Data.StoreMasterId > 0) {
            storeId = req.Data.StoreMasterId;
        } else {
            storeId = { '$gt': 0 };
        }
        let PatientBillJoin: any = {
            model: this.Models.PatientBills,
            attributes: ['Id'],
            required: true,
            where: {
                BillTypeId: 4,
                BillDateTime: { '$gte': req.Data.FromDate, '$lte': req.Data.ToDate },
                StoreMasterId: storeId,
            },
            include: [EncJoin]
        };

        let opbillamountInstance: any = await this.Find({
            attributes: [
                [this.Dal.fn('SUM', this.Dal.col('AmountPaid')), 'TotalAmountPaid'],
            ],
            where: {
                ReceiptDateTime: { '$gte': req.Data.FromDate, '$lte': req.Data.ToDate },
                // ReceiptTypeId: { '$in': [1, 2] },
                IsPharmacyReceipt: true,
                ReceiptStatusId: 1,
                FacilityId: req.Data.FacilityId
            },
            include: [PatientBillJoin]
        });
        if (opbillamountInstance) {
            let bill: any = this.GetAttribute(opbillamountInstance);
            OPBillResult['BillAmount'] = bill['TotalAmountPaid'];
        }

        let opbillamountcashInstance: any = await this.Find({
            attributes: [
                [this.Dal.fn('SUM', this.Dal.col('AmountPaid')), 'TotalAmountPaid'],
            ],
            where: {
                ReceiptDateTime: { '$gte': req.Data.FromDate, '$lte': req.Data.ToDate },
                ReceiptStatusId: 1,
                IsPharmacyReceipt: true,
                FacilityId: req.Data.FacilityId,
                // ReceiptTypeId: { '$in': [1, 2] },
                PaymentTypeId: 1,
            },
            include: [PatientBillJoin]
        });
        if (opbillamountcashInstance) {
            let bill: any = this.GetAttribute(opbillamountcashInstance);
            OPBillResult['CashAmount'] = bill['TotalAmountPaid'];
        }

        let opbillamountcardInstance: any = await this.Find({
            attributes: [
                [this.Dal.fn('SUM', this.Dal.col('AmountPaid')), 'TotalAmountPaid'],
            ],
            where: {
                ReceiptDateTime: { '$gte': req.Data.FromDate, '$lte': req.Data.ToDate },
                ReceiptStatusId: 1,
                IsPharmacyReceipt: true,
                FacilityId: req.Data.FacilityId,
                // ReceiptTypeId: { '$in': [1, 2] },
                PaymentTypeId: { '$in': [5, 6] }
            },
            include: [PatientBillJoin]
        });
        if (opbillamountcardInstance) {
            let bill: any = this.GetAttribute(opbillamountcardInstance);
            OPBillResult['CardAmount'] = bill['TotalAmountPaid'];
        }

        let opbillamountotherInstance: any = await this.Find({
            attributes: [
                [this.Dal.fn('SUM', this.Dal.col('AmountPaid')), 'TotalAmountPaid'],
            ],
            where: {
                ReceiptDateTime: { '$gte': req.Data.FromDate, '$lte': req.Data.ToDate },
                ReceiptStatusId: 1,
                IsPharmacyReceipt: true,
                FacilityId: req.Data.FacilityId,
                // ReceiptTypeId: { '$in': [1, 2] },
                PaymentTypeId: { '$notIn': [1, 5, 6, 11] }
            },
            include: [PatientBillJoin]
        });
        if (opbillamountotherInstance) {
            let bill: any = this.GetAttribute(opbillamountotherInstance);
            OPBillResult['OtherAmount'] = bill['TotalAmountPaid'];
        }

        let opbillamountupiInstance: any = await this.Find({
            attributes: [
                [this.Dal.fn('SUM', this.Dal.col('AmountPaid')), 'TotalAmountPaid'],
            ],
            where: {
                ReceiptDateTime: { '$gte': req.Data.FromDate, '$lte': req.Data.ToDate },
                ReceiptStatusId: 1,
                IsPharmacyReceipt: true,
                FacilityId: req.Data.FacilityId,
                // ReceiptTypeId: { '$in': [1, 2] },
                PaymentTypeId: 11
            },
            include: [PatientBillJoin]
        });
        if (opbillamountupiInstance) {
            let bill: any = this.GetAttribute(opbillamountupiInstance);
            OPBillResult['UPIAmount'] = bill['TotalAmountPaid'];
        }

        return OPBillResult;
    }

    public async IPSalesCollectionDetails(req: BaseRequest): Promise<any> {
        let OPBillResult: any = {};
        OPBillResult['DisplayOrder'] = 2;
        let EncJoin: any = {
            model: this.Models.Encounter,
            attributes: ['Id', 'EncounterTypeId'],
            required: true,
            where: {
                EncounterTypeId: 2,
            }
        };
        let storeId: any;
        if (req.Data.StoreMasterId > 0) {
            storeId = req.Data.StoreMasterId;
        } else {
            storeId = { '$gt': 0 };
        }
        let PatientBillJoin: any = {
            model: this.Models.PatientBills,
            attributes: ['Id'],
            required: true,
            where: {
                BillTypeId: 4,
                BillDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                StoreMasterId: storeId,
                // StoreMasterId: req.Data.StoreMasterId,
            },
            include: [EncJoin]
        };

        let opbillamountInstance: any = await this.Find({
            attributes: [
                [this.Dal.fn('SUM', this.Dal.col('AmountPaid')), 'TotalAmountPaid'],
            ],
            where: {
                ReceiptDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                // ReceiptTypeId: { '$in': [1, 2] },
                IsPharmacyReceipt: true,
                ReceiptStatusId: 1,
                FacilityId: req.Data.FacilityId
            },
            include: [PatientBillJoin]
        });
        if (opbillamountInstance) {
            let bill: any = this.GetAttribute(opbillamountInstance);
            OPBillResult['BillAmount'] = bill['TotalAmountPaid'];
        }

        let opbillamountcashInstance: any = await this.Find({
            attributes: [
                [this.Dal.fn('SUM', this.Dal.col('AmountPaid')), 'TotalAmountPaid'],
            ],
            where: {
                ReceiptDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                ReceiptStatusId: 1,
                IsPharmacyReceipt: true,
                FacilityId: req.Data.FacilityId,
                // ReceiptTypeId: { '$in': [1, 2] },
                PaymentTypeId: 1,
            },
            include: [PatientBillJoin]
        });
        if (opbillamountcashInstance) {
            let bill: any = this.GetAttribute(opbillamountcashInstance);
            OPBillResult['CashAmount'] = bill['TotalAmountPaid'];
        }

        let opbillamountcardInstance: any = await this.Find({
            attributes: [
                [this.Dal.fn('SUM', this.Dal.col('AmountPaid')), 'TotalAmountPaid'],
            ],
            where: {
                ReceiptDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                ReceiptStatusId: 1,
                IsPharmacyReceipt: true,
                FacilityId: req.Data.FacilityId,
                // ReceiptTypeId: { '$in': [1, 2] },
                PaymentTypeId: { '$in': [5, 6] }
            },
            include: [PatientBillJoin]
        });
        if (opbillamountcardInstance) {
            let bill: any = this.GetAttribute(opbillamountcardInstance);
            OPBillResult['CardAmount'] = bill['TotalAmountPaid'];
        }

        let opbillamountotherInstance: any = await this.Find({
            attributes: [
                [this.Dal.fn('SUM', this.Dal.col('AmountPaid')), 'TotalAmountPaid'],
            ],
            where: {
                ReceiptDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                ReceiptStatusId: 1,
                IsPharmacyReceipt: true,
                FacilityId: req.Data.FacilityId,
                // ReceiptTypeId: { '$in': [1, 2] },
                PaymentTypeId: { '$notIn': [1, 5, 6, 11] }
            },
            include: [PatientBillJoin]
        });
        if (opbillamountotherInstance) {
            let bill: any = this.GetAttribute(opbillamountotherInstance);
            OPBillResult['OtherAmount'] = bill['TotalAmountPaid'];
        }

        let opbillamountupiInstance: any = await this.Find({
            attributes: [
                [this.Dal.fn('SUM', this.Dal.col('AmountPaid')), 'TotalAmountPaid'],
            ],
            where: {
                ReceiptDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                ReceiptStatusId: 1,
                IsPharmacyReceipt: true,
                FacilityId: req.Data.FacilityId,
                // ReceiptTypeId: { '$in': [1, 2] },
                PaymentTypeId: 11
            },
            include: [PatientBillJoin]
        });
        if (opbillamountupiInstance) {
            let bill: any = this.GetAttribute(opbillamountupiInstance);
            OPBillResult['UPIAmount'] = bill['TotalAmountPaid'];
        }


        return OPBillResult;
    }

    public async DirectSalesCollectionDetails(req: BaseRequest): Promise<any> {
        let OPBillResult: any = {};
        OPBillResult['DisplayOrder'] = 3;
        let storeId: any;
        if (req.Data.StoreMasterId > 0) {
            storeId = req.Data.StoreMasterId;
        } else {
            storeId = { '$gt': 0 };
        }
        let PatientBillJoin: any = {
            model: this.Models.PatientBills,
            attributes: ['Id'],
            required: true,
            where: {
                BillTypeId: 4,
                IsDirectDGBill: true,
                BillDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                StoreMasterId: storeId,
                // StoreMasterId: req.Data.StoreMasterId,
            },
        };

        let opbillamountInstance: any = await this.Find({
            attributes: [
                [this.Dal.fn('SUM', this.Dal.col('AmountPaid')), 'TotalAmountPaid'],
            ],
            where: {
                ReceiptDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                // ReceiptTypeId: { '$in': [1, 2] },
                IsPharmacyReceipt: true,
                ReceiptStatusId: 1,
                FacilityId: req.Data.FacilityId
            },
            include: [PatientBillJoin]
        });
        if (opbillamountInstance) {
            let bill: any = this.GetAttribute(opbillamountInstance);
            OPBillResult['BillAmount'] = bill['TotalAmountPaid'];
        }

        let opbillamountcashInstance: any = await this.Find({
            attributes: [
                [this.Dal.fn('SUM', this.Dal.col('AmountPaid')), 'TotalAmountPaid'],
            ],
            where: {
                ReceiptDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                ReceiptStatusId: 1,
                IsPharmacyReceipt: true,
                FacilityId: req.Data.FacilityId,
                // ReceiptTypeId: { '$in': [1, 2] },
                PaymentTypeId: 1,
            },
            include: [PatientBillJoin]
        });
        if (opbillamountcashInstance) {
            let bill: any = this.GetAttribute(opbillamountcashInstance);
            OPBillResult['CashAmount'] = bill['TotalAmountPaid'];
        }

        let opbillamountcardInstance: any = await this.Find({
            attributes: [
                [this.Dal.fn('SUM', this.Dal.col('AmountPaid')), 'TotalAmountPaid'],
            ],
            where: {
                ReceiptDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                ReceiptStatusId: 1,
                IsPharmacyReceipt: true,
                FacilityId: req.Data.FacilityId,
                // ReceiptTypeId: { '$in': [1, 2] },
                PaymentTypeId: { '$in': [5, 6] }
            },
            include: [PatientBillJoin]
        });
        if (opbillamountcardInstance) {
            let bill: any = this.GetAttribute(opbillamountcardInstance);
            OPBillResult['CardAmount'] = bill['TotalAmountPaid'];
        }

        let opbillamountotherInstance: any = await this.Find({
            attributes: [
                [this.Dal.fn('SUM', this.Dal.col('AmountPaid')), 'TotalAmountPaid'],
            ],
            where: {
                ReceiptDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                ReceiptStatusId: 1,
                IsPharmacyReceipt: true,
                FacilityId: req.Data.FacilityId,
                // ReceiptTypeId: { '$in': [1, 2] },
                PaymentTypeId: { '$notIn': [1, 5, 6, 11] }
            },
            include: [PatientBillJoin]
        });
        if (opbillamountotherInstance) {
            let bill: any = this.GetAttribute(opbillamountotherInstance);
            OPBillResult['OtherAmount'] = bill['TotalAmountPaid'];
        }

        let opbillamountupiInstance: any = await this.Find({
            attributes: [
                [this.Dal.fn('SUM', this.Dal.col('AmountPaid')), 'TotalAmountPaid'],
            ],
            where: {
                ReceiptDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                ReceiptStatusId: 1,
                IsPharmacyReceipt: true,
                FacilityId: req.Data.FacilityId,
                // ReceiptTypeId: { '$in': [1, 2] },
                PaymentTypeId: 11
            },
            include: [PatientBillJoin]
        });
        if (opbillamountupiInstance) {
            let bill: any = this.GetAttribute(opbillamountupiInstance);
            OPBillResult['UPIAmount'] = bill['TotalAmountPaid'];
        }


        return OPBillResult;
    }

    public async StaffSalesCollectionDetails(req: BaseRequest): Promise<any> {
        let OPBillResult: any = {};
        OPBillResult['DisplayOrder'] = 4;
        let storeId: any;
        if (req.Data.StoreMasterId > 0) {
            storeId = req.Data.StoreMasterId;
        } else {
            storeId = { '$gt': 0 };
        }
        let PatientBillJoin: any = {
            model: this.Models.PatientBills,
            attributes: ['Id'],
            required: true,
            where: {
                BillTypeId: 6,
                BillDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                StoreMasterId: storeId,
                // StoreMasterId: req.Data.StoreMasterId,

            }
        };

        let opbillamountInstance: any = await this.Find({
            attributes: [
                [this.Dal.fn('SUM', this.Dal.col('AmountPaid')), 'TotalAmountPaid'],
            ],
            where: {
                ReceiptDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                // ReceiptTypeId: { '$in': [1, 2] },
                // IsPharmacyReceipt: true,
                ReceiptStatusId: 1,
                FacilityId: req.Data.FacilityId
            },
            include: [PatientBillJoin]
        });
        if (opbillamountInstance) {
            let bill: any = this.GetAttribute(opbillamountInstance);
            OPBillResult['BillAmount'] = bill['TotalAmountPaid'];
        }

        let opbillamountcashInstance: any = await this.Find({
            attributes: [
                [this.Dal.fn('SUM', this.Dal.col('AmountPaid')), 'TotalAmountPaid'],
            ],
            where: {
                ReceiptDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                ReceiptStatusId: 1,
                // IsPharmacyReceipt: true,
                FacilityId: req.Data.FacilityId,
                // ReceiptTypeId: { '$in': [1, 2] },
                PaymentTypeId: 1,
            },
            include: [PatientBillJoin]
        });
        if (opbillamountcashInstance) {
            let bill: any = this.GetAttribute(opbillamountcashInstance);
            OPBillResult['CashAmount'] = bill['TotalAmountPaid'];
        }

        let opbillamountcardInstance: any = await this.Find({
            attributes: [
                [this.Dal.fn('SUM', this.Dal.col('AmountPaid')), 'TotalAmountPaid'],
            ],
            where: {
                ReceiptDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                ReceiptStatusId: 1,
                // IsPharmacyReceipt: true,
                FacilityId: req.Data.FacilityId,
                // ReceiptTypeId: { '$in': [1, 2] },
                PaymentTypeId: { '$in': [5, 6] }
            },
            include: [PatientBillJoin]
        });
        if (opbillamountcardInstance) {
            let bill: any = this.GetAttribute(opbillamountcardInstance);
            OPBillResult['CardAmount'] = bill['TotalAmountPaid'];
        }

        let opbillamountotherInstance: any = await this.Find({
            attributes: [
                [this.Dal.fn('SUM', this.Dal.col('AmountPaid')), 'TotalAmountPaid'],
            ],
            where: {
                ReceiptDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                ReceiptStatusId: 1,
                // IsPharmacyReceipt: true,
                FacilityId: req.Data.FacilityId,
                // ReceiptTypeId: { '$in': [1, 2] },
                PaymentTypeId: { '$notIn': [1, 5, 6, 11] }
            },
            include: [PatientBillJoin]
        });
        if (opbillamountotherInstance) {
            let bill: any = this.GetAttribute(opbillamountotherInstance);
            OPBillResult['OtherAmount'] = bill['TotalAmountPaid'];
        }

        let opbillamountupiInstance: any = await this.Find({
            attributes: [
                [this.Dal.fn('SUM', this.Dal.col('AmountPaid')), 'TotalAmountPaid'],
            ],
            where: {
                ReceiptDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                ReceiptStatusId: 1,
                // IsPharmacyReceipt: true,
                FacilityId: req.Data.FacilityId,
                // ReceiptTypeId: { '$in': [1, 2] },
                PaymentTypeId: 11
            },
            include: [PatientBillJoin]
        });
        if (opbillamountupiInstance) {
            let bill: any = this.GetAttribute(opbillamountupiInstance);
            OPBillResult['UPIAmount'] = bill['TotalAmountPaid'];
        }

        return OPBillResult;
    }

    public async GetFacilityInfoDashBoard(req: BaseRequest): Promise<any> {
        let result: any = [];
        result.push({ Key: 'OP Collection', Value: await this.OPBillPaymentDetails(req) });
        result.push({ Key: 'IP Collection-cash', Value: await this.IPSelfPaymentDetails(req) });
        result.push({ Key: 'IP Collection Insurance', Value: await this.IPInsurancePaymentDetails(req) });
        result.push({ Key: 'Pharmacy Collection', Value: await this.OPPharmacyPaymentDetails(req) });
        // result.push({ Key: 'Pharmacy Collection.', Value: await this.OPConsolidatePayDetails(req) });
        return result;
    }

    public async GetFacilityCollectionDashBoard(req: BaseRequest): Promise<any> {
        let result: any = [];
        result.push({ Key: 'OP Bill Collection', Value: await this.OPReceiptPaymentDetails(req) });
        result.push({ Key: 'OP Due Collection', Value: await this.OPDuePaymentDetails(req) });
        result.push({ Key: 'OP Cancel', Value: await this.OPBillCancelDetails(req) });
        result.push({ Key: 'Net Amount OP', Value: await this.OPNetAmount(req) });
        result.push({ Key: 'IP Advance Collection', Value: await this.IPAdvancePaymentDetails(req) });
        result.push({ Key: 'IP Receipt Collection', Value: await this.IPReceiptPaymentDetails(req) });
        result.push({ Key: 'IP Due Collection', Value: await this.IPDuePaymentDetails(req) });
        result.push({ Key: 'IP Cancel', Value: await this.IPCancelPaymentDetails(req) });
        result.push({ Key: 'Net Amount IP', Value: await this.IPNetAmount(req) });
        return result;
    }

    public async OPReceiptPaymentDetails(req: BaseRequest): Promise<any> {
        let OPBillResult: any = {};
        OPBillResult['DisplayOrder'] = 1;

        let opbillamountInstance: any = await this.Find({
            attributes: [
                [this.Dal.fn('SUM', this.Dal.col('AmountPaid')), 'TotalAmountPaid'],
            ],
            where: {
                ReceiptDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                EncounterTypeId: { '$in': [1, 4] },
                IsPharmacyReceipt: 0,
                IsConsolidatePay: 0,
                ReceiptStatusId: 1,
                ReceiptTypeId: { '$in': [1, 2] },
                FacilityId: req.Data.FacilityId
            }
        });
        if (opbillamountInstance) {
            let bill: any = this.GetAttribute(opbillamountInstance);
            OPBillResult['BillAmount'] = bill['TotalAmountPaid'];
        }

        let opbillamountcashInstance: any = await this.Find({
            attributes: [
                [this.Dal.fn('SUM', this.Dal.col('AmountPaid')), 'TotalAmountPaid'],
            ],
            where: {
                ReceiptDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                EncounterTypeId: { '$in': [1, 4] },
                IsPharmacyReceipt: 0,
                IsConsolidatePay: 0,
                ReceiptStatusId: 1,
                ReceiptTypeId: { '$in': [1, 2] },
                FacilityId: req.Data.FacilityId,
                PaymentTypeId: 1,
            }
        });
        if (opbillamountcashInstance) {
            let bill: any = this.GetAttribute(opbillamountcashInstance);
            OPBillResult['CashAmount'] = bill['TotalAmountPaid'];
        }

        let opbillamountcardInstance: any = await this.Find({
            attributes: [
                [this.Dal.fn('SUM', this.Dal.col('AmountPaid')), 'TotalAmountPaid'],
            ],
            where: {
                ReceiptDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                EncounterTypeId: { '$in': [1, 4] },
                IsPharmacyReceipt: 0,
                IsConsolidatePay: 0,
                ReceiptStatusId: 1,
                ReceiptTypeId: { '$in': [1, 2] },
                FacilityId: req.Data.FacilityId,
                PaymentTypeId: { '$in': [5, 6] }
            }
        });
        if (opbillamountcardInstance) {
            let bill: any = this.GetAttribute(opbillamountcardInstance);
            OPBillResult['CardAmount'] = bill['TotalAmountPaid'];
        }
        let opbillamountupiInstance: any = await this.Find({
            attributes: [
                [this.Dal.fn('SUM', this.Dal.col('AmountPaid')), 'TotalAmountPaid'],
            ],
            where: {
                ReceiptDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                EncounterTypeId: { '$in': [1, 4] },
                IsPharmacyReceipt: 0,
                IsConsolidatePay: 0,
                ReceiptStatusId: 1,
                ReceiptTypeId: { '$in': [1, 2] },
                FacilityId: req.Data.FacilityId,
                PaymentTypeId: 11,
            }
        });
        if (opbillamountupiInstance) {
            let bill: any = this.GetAttribute(opbillamountupiInstance);
            OPBillResult['UPIAmount'] = bill['TotalAmountPaid'];
        }

        let opbillamountotherInstance: any = await this.Find({
            attributes: [
                [this.Dal.fn('SUM', this.Dal.col('AmountPaid')), 'TotalAmountPaid'],
            ],
            where: {
                ReceiptDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                EncounterTypeId: { '$in': [1, 4] },
                IsPharmacyReceipt: 0,
                IsConsolidatePay: 0,
                ReceiptStatusId: 1,
                ReceiptTypeId: { '$in': [1, 2] },
                FacilityId: req.Data.FacilityId,
                PaymentTypeId: { '$notIn': [1, 5, 6, 11] }
            }
        });
        if (opbillamountotherInstance) {
            let bill: any = this.GetAttribute(opbillamountotherInstance);
            OPBillResult['OtherAmount'] = bill['TotalAmountPaid'];
        }

        return OPBillResult;
    }
    public async OPDuePaymentDetails(req: BaseRequest): Promise<any> {
        let OPBillResult: any = {};
        OPBillResult['DisplayOrder'] = 2;

        let opbillamountInstance: any = await this.Find({
            attributes: [
                [this.Dal.fn('SUM', this.Dal.col('AmountPaid')), 'TotalAmountPaid'],
            ],
            where: {
                ReceiptDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                EncounterTypeId: { '$in': [1, 4] },
                IsPharmacyReceipt: 0,
                IsConsolidatePay: 0,
                ReceiptStatusId: 1,
                ReceiptTypeId: 3,
                FacilityId: req.Data.FacilityId
            }
        });
        if (opbillamountInstance) {
            let bill: any = this.GetAttribute(opbillamountInstance);
            OPBillResult['BillAmount'] = bill['TotalAmountPaid'];
        }

        let opbillamountcashInstance: any = await this.Find({
            attributes: [
                [this.Dal.fn('SUM', this.Dal.col('AmountPaid')), 'TotalAmountPaid'],
            ],
            where: {
                ReceiptDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                EncounterTypeId: { '$in': [1, 4] },
                IsPharmacyReceipt: 0,
                IsConsolidatePay: 0,
                ReceiptStatusId: 1,
                ReceiptTypeId: 3,
                FacilityId: req.Data.FacilityId,
                PaymentTypeId: 1,
            }
        });
        if (opbillamountcashInstance) {
            let bill: any = this.GetAttribute(opbillamountcashInstance);
            OPBillResult['CashAmount'] = bill['TotalAmountPaid'];
        }

        let opbillamountcardInstance: any = await this.Find({
            attributes: [
                [this.Dal.fn('SUM', this.Dal.col('AmountPaid')), 'TotalAmountPaid'],
            ],
            where: {
                ReceiptDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                EncounterTypeId: { '$in': [1, 4] },
                IsPharmacyReceipt: 0,
                IsConsolidatePay: 0,
                ReceiptStatusId: 1,
                ReceiptTypeId: 3,
                FacilityId: req.Data.FacilityId,
                PaymentTypeId: { '$in': [5, 6] }
            }
        });
        if (opbillamountcardInstance) {
            let bill: any = this.GetAttribute(opbillamountcardInstance);
            OPBillResult['CardAmount'] = bill['TotalAmountPaid'];
        }
        let opbillamountupiInstance: any = await this.Find({
            attributes: [
                [this.Dal.fn('SUM', this.Dal.col('AmountPaid')), 'TotalAmountPaid'],
            ],
            where: {
                ReceiptDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                EncounterTypeId: { '$in': [1, 4] },
                IsPharmacyReceipt: 0,
                IsConsolidatePay: 0,
                ReceiptStatusId: 1,
                ReceiptTypeId: 3,
                FacilityId: req.Data.FacilityId,
                PaymentTypeId: 11,
            }
        });
        if (opbillamountupiInstance) {
            let bill: any = this.GetAttribute(opbillamountupiInstance);
            OPBillResult['UPIAmount'] = bill['TotalAmountPaid'];
        }

        let opbillamountotherInstance: any = await this.Find({
            attributes: [
                [this.Dal.fn('SUM', this.Dal.col('AmountPaid')), 'TotalAmountPaid'],
            ],
            where: {
                ReceiptDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                EncounterTypeId: { '$in': [1, 4] },
                IsPharmacyReceipt: 0,
                IsConsolidatePay: 0,
                ReceiptStatusId: 1,
                ReceiptTypeId: 3,
                FacilityId: req.Data.FacilityId,
                PaymentTypeId: { '$notIn': [1, 5, 6, 11] }
            }
        });
        if (opbillamountotherInstance) {
            let bill: any = this.GetAttribute(opbillamountotherInstance);
            OPBillResult['OtherAmount'] = bill['TotalAmountPaid'];
        }

        return OPBillResult;
    }
    public async OPBillCancelDetails(req: BaseRequest): Promise<any> {
        let OPBillResult: any = {};
        OPBillResult['DisplayOrder'] = 4;
        let opbillamountInstance: any = await this.Find({
            attributes: [
                [this.Dal.fn('SUM', this.Dal.col('AmountPaid')), 'TotalAmountPaid'],
            ],
            where: {
                ReceiptDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                EncounterTypeId: { '$in': [1, 4] },
                IsPharmacyReceipt: 0,
                IsConsolidatePay: 0,
                ReceiptStatusId: 3,
                ReceiptTypeId: 2,
                FacilityId: req.Data.FacilityId
            }
        });
        if (opbillamountInstance) {
            let bill: any = this.GetAttribute(opbillamountInstance);
            OPBillResult['BillAmount'] = bill['TotalAmountPaid'];
        }

        let opbillamountcashInstance: any = await this.Find({
            attributes: [
                [this.Dal.fn('SUM', this.Dal.col('AmountPaid')), 'TotalAmountPaid'],
            ],
            where: {
                ReceiptDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                IsPharmacyReceipt: 0,
                IsConsolidatePay: 0,
                ReceiptStatusId: 3,
                ReceiptTypeId: 2,
                EncounterTypeId: [1, 4],
                FacilityId: req.Data.FacilityId,
                PaymentTypeId: 1,
            }
        });
        if (opbillamountcashInstance) {
            let bill: any = this.GetAttribute(opbillamountcashInstance);
            OPBillResult['CashAmount'] = bill['TotalAmountPaid'];
        }

        let opbillamountcardInstance: any = await this.Find({
            attributes: [
                [this.Dal.fn('SUM', this.Dal.col('AmountPaid')), 'TotalAmountPaid'],
            ],
            where: {
                ReceiptDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                IsPharmacyReceipt: 0,
                IsConsolidatePay: 0,
                ReceiptStatusId: 3,
                ReceiptTypeId: 2,
                EncounterTypeId: [1, 4],
                FacilityId: req.Data.FacilityId,
                PaymentTypeId: { '$in': [5, 6] }
            }
        });
        if (opbillamountcardInstance) {
            let bill: any = this.GetAttribute(opbillamountcardInstance);
            OPBillResult['CardAmount'] = bill['TotalAmountPaid'];
        }
        let opbillamountupiInstance: any = await this.Find({
            attributes: [
                [this.Dal.fn('SUM', this.Dal.col('AmountPaid')), 'TotalAmountPaid'],
            ],
            where: {
                ReceiptDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                IsPharmacyReceipt: 0,
                IsConsolidatePay: 0,
                ReceiptStatusId: 3,
                ReceiptTypeId: 2,
                EncounterTypeId: [1, 4],
                FacilityId: req.Data.FacilityId,
                PaymentTypeId: 11,
            }
        });
        if (opbillamountupiInstance) {
            let bill: any = this.GetAttribute(opbillamountupiInstance);
            OPBillResult['UPIAmount'] = bill['TotalAmountPaid'];
        }
        let opbillamountotherInstance: any = await this.Find({

            attributes: [
                [this.Dal.fn('SUM', this.Dal.col('AmountPaid')), 'TotalAmountPaid'],
            ],
            where: {
                ReceiptDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                IsPharmacyReceipt: 0,
                IsConsolidatePay: 0,
                ReceiptStatusId: 3,
                ReceiptTypeId: 2,
                EncounterTypeId: [1, 4],
                FacilityId: req.Data.FacilityId,
                PaymentTypeId: { '$notIn': [1, 5, 6, 11] }
            }
        });
        if (opbillamountotherInstance) {
            let bill: any = this.GetAttribute(opbillamountotherInstance);
            OPBillResult['OtherAmount'] = bill['TotalAmountPaid'];
        }

        return OPBillResult;
    }
    public async OPNetAmount(req: BaseRequest): Promise<any> {
        let TotalOPBillResult: any = {};
        // let RefundData: any = [];
        TotalOPBillResult['DisplayOrder'] = 5;
        // let PatientRefundBo = BoFactory.GetBo(billingbo.PatientRefundBo, this.Request);



        let opbillamount = await this.OPReceiptPaymentDetails(req);
        let opdueamount = await this.OPDuePaymentDetails(req);
        // let oprefundamount = await PatientRefundBo.OPBillRefundDetails(req);

        TotalOPBillResult['CashAmount'] = (opbillamount.CashAmount + opdueamount.CashAmount);
        TotalOPBillResult['CardAmount'] = (opbillamount.CardAmount + opdueamount.CardAmount);
        TotalOPBillResult['OtherAmount'] = (opbillamount.OtherAmount + opdueamount.OtherAmount);
        TotalOPBillResult['UPIAmount'] = (opbillamount.UPIAmount + opdueamount.UPIAmount);
        TotalOPBillResult['BillAmount'] = (opbillamount.BillAmount + opdueamount.BillAmount);


        return TotalOPBillResult;
    }
    public async IPAdvancePaymentDetails(req: BaseRequest): Promise<any> {
        let OPBillResult: any = {};
        OPBillResult['DisplayOrder'] = 6;

        let opbillamountInstance: any = await this.Find({
            attributes: [
                [this.Dal.fn('SUM', this.Dal.col('AmountPaid')), 'TotalAmountPaid'],
            ],
            where: {
                ReceiptDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                EncounterTypeId: 2,
                IsPharmacyReceipt: 0,
                IsConsolidatePay: 0,
                ReceiptStatusId: 1,
                ReceiptTypeId: 1,
                FacilityId: req.Data.FacilityId
            }
        });
        if (opbillamountInstance) {
            let bill: any = this.GetAttribute(opbillamountInstance);
            OPBillResult['BillAmount'] = bill['TotalAmountPaid'];
        }

        let opbillamountcashInstance: any = await this.Find({
            attributes: [
                [this.Dal.fn('SUM', this.Dal.col('AmountPaid')), 'TotalAmountPaid'],
            ],
            where: {
                ReceiptDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                EncounterTypeId: 2,
                IsPharmacyReceipt: 0,
                IsConsolidatePay: 0,
                ReceiptStatusId: 1,
                ReceiptTypeId: 1,
                FacilityId: req.Data.FacilityId,
                PaymentTypeId: 1,
            }
        });
        if (opbillamountcashInstance) {
            let bill: any = this.GetAttribute(opbillamountcashInstance);
            OPBillResult['CashAmount'] = bill['TotalAmountPaid'];
        }

        let opbillamountcardInstance: any = await this.Find({
            attributes: [
                [this.Dal.fn('SUM', this.Dal.col('AmountPaid')), 'TotalAmountPaid'],
            ],
            where: {
                ReceiptDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                EncounterTypeId: 2,
                IsPharmacyReceipt: 0,
                IsConsolidatePay: 0,
                ReceiptStatusId: 1,
                ReceiptTypeId: 1,
                FacilityId: req.Data.FacilityId,
                PaymentTypeId: { '$in': [5, 6] }
            }
        });
        if (opbillamountcardInstance) {
            let bill: any = this.GetAttribute(opbillamountcardInstance);
            OPBillResult['CardAmount'] = bill['TotalAmountPaid'];
        }

        let opbillamountupiInstance: any = await this.Find({
            attributes: [
                [this.Dal.fn('SUM', this.Dal.col('AmountPaid')), 'TotalAmountPaid'],
            ],
            where: {
                ReceiptDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                EncounterTypeId: 2,
                IsPharmacyReceipt: 0,
                IsConsolidatePay: 0,
                ReceiptStatusId: 1,
                ReceiptTypeId: 1,
                FacilityId: req.Data.FacilityId,
                PaymentTypeId: 11,
            }
        });
        if (opbillamountupiInstance) {
            let bill: any = this.GetAttribute(opbillamountupiInstance);
            OPBillResult['UPIAmount'] = bill['TotalAmountPaid'];
        }
        let opbillamountotherInstance: any = await this.Find({
            attributes: [
                [this.Dal.fn('SUM', this.Dal.col('AmountPaid')), 'TotalAmountPaid'],
            ],
            where: {
                ReceiptDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                EncounterTypeId: 2,
                IsPharmacyReceipt: 0,
                IsConsolidatePay: 0,
                ReceiptStatusId: 1,
                ReceiptTypeId: 1,
                FacilityId: req.Data.FacilityId,
                PaymentTypeId: { '$notIn': [1, 5, 6, 11] }
            }
        });
        if (opbillamountotherInstance) {
            let bill: any = this.GetAttribute(opbillamountotherInstance);
            OPBillResult['OtherAmount'] = bill['TotalAmountPaid'];
        }

        return OPBillResult;
    }
    public async IPReceiptPaymentDetails(req: BaseRequest): Promise<any> {
        let OPBillResult: any = {};
        OPBillResult['DisplayOrder'] = 7;

        let opbillamountInstance: any = await this.Find({
            attributes: [
                [this.Dal.fn('SUM', this.Dal.col('AmountPaid')), 'TotalAmountPaid'],
            ],
            where: {
                ReceiptDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                EncounterTypeId: 2,
                IsPharmacyReceipt: 0,
                IsConsolidatePay: 0,
                ReceiptStatusId: 1,
                ReceiptTypeId: 2,
                FacilityId: req.Data.FacilityId
            }
        });
        if (opbillamountInstance) {
            let bill: any = this.GetAttribute(opbillamountInstance);
            OPBillResult['BillAmount'] = bill['TotalAmountPaid'];
        }

        let opbillamountcashInstance: any = await this.Find({
            attributes: [
                [this.Dal.fn('SUM', this.Dal.col('AmountPaid')), 'TotalAmountPaid'],
            ],
            where: {
                ReceiptDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                EncounterTypeId: 2,
                IsPharmacyReceipt: 0,
                IsConsolidatePay: 0,
                ReceiptStatusId: 1,
                ReceiptTypeId: 2,
                FacilityId: req.Data.FacilityId,
                PaymentTypeId: 1,
            }
        });
        if (opbillamountcashInstance) {
            let bill: any = this.GetAttribute(opbillamountcashInstance);
            OPBillResult['CashAmount'] = bill['TotalAmountPaid'];
        }

        let opbillamountcardInstance: any = await this.Find({
            attributes: [
                [this.Dal.fn('SUM', this.Dal.col('AmountPaid')), 'TotalAmountPaid'],
            ],
            where: {
                ReceiptDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                EncounterTypeId: 2,
                IsPharmacyReceipt: 0,
                IsConsolidatePay: 0,
                ReceiptStatusId: 1,
                ReceiptTypeId: 2,
                FacilityId: req.Data.FacilityId,
                PaymentTypeId: { '$in': [5, 6] }
            }
        });
        if (opbillamountcardInstance) {
            let bill: any = this.GetAttribute(opbillamountcardInstance);
            OPBillResult['CardAmount'] = bill['TotalAmountPaid'];
        }
        let opbillamountupiInstance: any = await this.Find({
            attributes: [
                [this.Dal.fn('SUM', this.Dal.col('AmountPaid')), 'TotalAmountPaid'],
            ],
            where: {
                ReceiptDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                EncounterTypeId: 2,
                IsPharmacyReceipt: 0,
                IsConsolidatePay: 0,
                ReceiptStatusId: 1,
                ReceiptTypeId: 2,
                FacilityId: req.Data.FacilityId,
                PaymentTypeId: 11,
            }
        });
        if (opbillamountupiInstance) {
            let bill: any = this.GetAttribute(opbillamountupiInstance);
            OPBillResult['UPIAmount'] = bill['TotalAmountPaid'];
        }
        let opbillamountotherInstance: any = await this.Find({
            attributes: [
                [this.Dal.fn('SUM', this.Dal.col('AmountPaid')), 'TotalAmountPaid'],
            ],
            where: {
                ReceiptDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                EncounterTypeId: 2,
                IsPharmacyReceipt: 0,
                IsConsolidatePay: 0,
                ReceiptStatusId: 1,
                ReceiptTypeId: 2,
                FacilityId: req.Data.FacilityId,
                PaymentTypeId: { '$notIn': [1, 5, 6, 11] }
            }
        });
        if (opbillamountotherInstance) {
            let bill: any = this.GetAttribute(opbillamountotherInstance);
            OPBillResult['OtherAmount'] = bill['TotalAmountPaid'];
        }

        return OPBillResult;
    }
    public async IPDuePaymentDetails(req: BaseRequest): Promise<any> {
        let OPBillResult: any = {};
        OPBillResult['DisplayOrder'] = 8;

        let opbillamountInstance: any = await this.Find({
            attributes: [
                [this.Dal.fn('SUM', this.Dal.col('AmountPaid')), 'TotalAmountPaid'],
            ],
            where: {
                ReceiptDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                EncounterTypeId: 2,
                IsPharmacyReceipt: 0,
                IsConsolidatePay: 0,
                ReceiptStatusId: 1,
                ReceiptTypeId: 3,
                FacilityId: req.Data.FacilityId
            }
        });
        if (opbillamountInstance) {
            let bill: any = this.GetAttribute(opbillamountInstance);
            OPBillResult['BillAmount'] = bill['TotalAmountPaid'];
        }

        let opbillamountcashInstance: any = await this.Find({
            attributes: [
                [this.Dal.fn('SUM', this.Dal.col('AmountPaid')), 'TotalAmountPaid'],
            ],
            where: {
                ReceiptDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                EncounterTypeId: 2,
                IsPharmacyReceipt: 0,
                IsConsolidatePay: 0,
                ReceiptStatusId: 1,
                ReceiptTypeId: 3,
                FacilityId: req.Data.FacilityId,
                PaymentTypeId: 1,
            }
        });
        if (opbillamountcashInstance) {
            let bill: any = this.GetAttribute(opbillamountcashInstance);
            OPBillResult['CashAmount'] = bill['TotalAmountPaid'];
        }

        let opbillamountcardInstance: any = await this.Find({
            attributes: [
                [this.Dal.fn('SUM', this.Dal.col('AmountPaid')), 'TotalAmountPaid'],
            ],
            where: {
                ReceiptDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                EncounterTypeId: 2,
                IsPharmacyReceipt: 0,
                IsConsolidatePay: 0,
                ReceiptStatusId: 1,
                ReceiptTypeId: 3,
                FacilityId: req.Data.FacilityId,
                PaymentTypeId: { '$in': [5, 6] }
            }
        });
        if (opbillamountcardInstance) {
            let bill: any = this.GetAttribute(opbillamountcardInstance);
            OPBillResult['CardAmount'] = bill['TotalAmountPaid'];
        }
        let opbillamountupiInstance: any = await this.Find({
            attributes: [
                [this.Dal.fn('SUM', this.Dal.col('AmountPaid')), 'TotalAmountPaid'],
            ],
            where: {
                ReceiptDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                EncounterTypeId: 2,
                IsPharmacyReceipt: 0,
                IsConsolidatePay: 0,
                ReceiptStatusId: 1,
                ReceiptTypeId: 3,
                FacilityId: req.Data.FacilityId,
                PaymentTypeId: 11,
            }
        });
        if (opbillamountupiInstance) {
            let bill: any = this.GetAttribute(opbillamountupiInstance);
            OPBillResult['UPIAmount'] = bill['TotalAmountPaid'];
        }
        let opbillamountotherInstance: any = await this.Find({
            attributes: [
                [this.Dal.fn('SUM', this.Dal.col('AmountPaid')), 'TotalAmountPaid'],
            ],
            where: {
                ReceiptDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                EncounterTypeId: 2,
                IsPharmacyReceipt: 0,
                IsConsolidatePay: 0,
                ReceiptStatusId: 1,
                ReceiptTypeId: 3,
                FacilityId: req.Data.FacilityId,
                PaymentTypeId: { '$notIn': [1, 5, 6, 11] }
            }
        });
        if (opbillamountotherInstance) {
            let bill: any = this.GetAttribute(opbillamountotherInstance);
            OPBillResult['OtherAmount'] = bill['TotalAmountPaid'];
        }

        return OPBillResult;
    }
    public async IPCancelPaymentDetails(req: BaseRequest): Promise<any> {
        let OPBillResult: any = {};
        OPBillResult['DisplayOrder'] = 10;

        let opbillamountInstance: any = await this.Find({
            attributes: [
                [this.Dal.fn('SUM', this.Dal.col('AmountPaid')), 'TotalAmountPaid'],
            ],
            where: {
                ReceiptDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                EncounterTypeId: 2,
                IsPharmacyReceipt: 0,
                IsConsolidatePay: 0,
                ReceiptStatusId: 3,
                FacilityId: req.Data.FacilityId
            }
        });
        if (opbillamountInstance) {
            let bill: any = this.GetAttribute(opbillamountInstance);
            OPBillResult['BillAmount'] = bill['TotalAmountPaid'];
        }

        let opbillamountcashInstance: any = await this.Find({
            attributes: [
                [this.Dal.fn('SUM', this.Dal.col('AmountPaid')), 'TotalAmountPaid'],
            ],
            where: {
                ReceiptDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                EncounterTypeId: 2,
                IsPharmacyReceipt: 0,
                IsConsolidatePay: 0,
                ReceiptStatusId: 3,
                FacilityId: req.Data.FacilityId,
                PaymentTypeId: 1,
            }
        });
        if (opbillamountcashInstance) {
            let bill: any = this.GetAttribute(opbillamountcashInstance);
            OPBillResult['CashAmount'] = bill['TotalAmountPaid'];
        }

        let opbillamountcardInstance: any = await this.Find({
            attributes: [
                [this.Dal.fn('SUM', this.Dal.col('AmountPaid')), 'TotalAmountPaid'],
            ],
            where: {
                ReceiptDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                EncounterTypeId: 2,
                IsPharmacyReceipt: 0,
                IsConsolidatePay: 0,
                ReceiptStatusId: 3,
                FacilityId: req.Data.FacilityId,
                PaymentTypeId: { '$in': [5, 6] }
            }
        });
        if (opbillamountcardInstance) {
            let bill: any = this.GetAttribute(opbillamountcardInstance);
            OPBillResult['CardAmount'] = bill['TotalAmountPaid'];
        }
        let opbillamountupiInstance: any = await this.Find({
            attributes: [
                [this.Dal.fn('SUM', this.Dal.col('AmountPaid')), 'TotalAmountPaid'],
            ],
            where: {
                ReceiptDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                EncounterTypeId: 2,
                IsPharmacyReceipt: 0,
                IsConsolidatePay: 0,
                ReceiptStatusId: 3,
                FacilityId: req.Data.FacilityId,
                PaymentTypeId: 11,
            }
        });
        if (opbillamountupiInstance) {
            let bill: any = this.GetAttribute(opbillamountupiInstance);
            OPBillResult['UPIAmount'] = bill['TotalAmountPaid'];
        }
        let opbillamountotherInstance: any = await this.Find({
            attributes: [
                [this.Dal.fn('SUM', this.Dal.col('AmountPaid')), 'TotalAmountPaid'],
            ],
            where: {
                ReceiptDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                EncounterTypeId: 2,
                IsPharmacyReceipt: 0,
                IsConsolidatePay: 0,
                ReceiptStatusId: 3,
                FacilityId: req.Data.FacilityId,
                PaymentTypeId: { '$notIn': [1, 5, 6, 11] }
            }
        });
        if (opbillamountotherInstance) {
            let bill: any = this.GetAttribute(opbillamountotherInstance);
            OPBillResult['OtherAmount'] = bill['TotalAmountPaid'];
        }

        return OPBillResult;
    }
    public async IPNetAmount(req: BaseRequest): Promise<any> {
        let OPBillResult: any = {};
        OPBillResult['DisplayOrder'] = 11;

        let opbillamountInstance: any = await this.Find({
            attributes: [
                [this.Dal.fn('SUM', this.Dal.col('AmountPaid')), 'TotalAmountPaid'],
            ],
            where: {
                ReceiptDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                EncounterTypeId: 2,
                IsPharmacyReceipt: 0,
                IsConsolidatePay: 0,
                ReceiptStatusId: 1,
                FacilityId: req.Data.FacilityId
            }
        });
        if (opbillamountInstance) {
            let bill: any = this.GetAttribute(opbillamountInstance);
            OPBillResult['BillAmount'] = bill['TotalAmountPaid'];
        }

        let opbillamountcashInstance: any = await this.Find({
            attributes: [
                [this.Dal.fn('SUM', this.Dal.col('AmountPaid')), 'TotalAmountPaid'],
            ],
            where: {
                ReceiptDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                EncounterTypeId: 2,
                IsPharmacyReceipt: 0,
                IsConsolidatePay: 0,
                ReceiptStatusId: 1,
                FacilityId: req.Data.FacilityId,
                PaymentTypeId: 1,
            }
        });
        if (opbillamountcashInstance) {
            let bill: any = this.GetAttribute(opbillamountcashInstance);
            OPBillResult['CashAmount'] = bill['TotalAmountPaid'];
        }

        let opbillamountcardInstance: any = await this.Find({
            attributes: [
                [this.Dal.fn('SUM', this.Dal.col('AmountPaid')), 'TotalAmountPaid'],
            ],
            where: {
                ReceiptDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                EncounterTypeId: 2,
                IsPharmacyReceipt: 0,
                IsConsolidatePay: 0,
                ReceiptStatusId: 1,
                FacilityId: req.Data.FacilityId,
                PaymentTypeId: { '$in': [5, 6] }
            }
        });
        if (opbillamountcardInstance) {
            let bill: any = this.GetAttribute(opbillamountcardInstance);
            OPBillResult['CardAmount'] = bill['TotalAmountPaid'];
        }
        let opbillamountupiInstance: any = await this.Find({
            attributes: [
                [this.Dal.fn('SUM', this.Dal.col('AmountPaid')), 'TotalAmountPaid'],
            ],
            where: {
                ReceiptDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                EncounterTypeId: 2,
                IsPharmacyReceipt: 0,
                IsConsolidatePay: 0,
                ReceiptStatusId: 1,
                FacilityId: req.Data.FacilityId,
                PaymentTypeId: 11,
            }
        });
        if (opbillamountupiInstance) {
            let bill: any = this.GetAttribute(opbillamountupiInstance);
            OPBillResult['UPIAmount'] = bill['TotalAmountPaid'];
        }
        let opbillamountotherInstance: any = await this.Find({
            attributes: [
                [this.Dal.fn('SUM', this.Dal.col('AmountPaid')), 'TotalAmountPaid'],
            ],
            where: {
                ReceiptDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                EncounterTypeId: 2,
                IsPharmacyReceipt: 0,
                IsConsolidatePay: 0,
                ReceiptStatusId: 1,
                FacilityId: req.Data.FacilityId,
                PaymentTypeId: { '$notIn': [1, 5, 6, 11] }
            }
        });
        if (opbillamountotherInstance) {
            let bill: any = this.GetAttribute(opbillamountotherInstance);
            OPBillResult['OtherAmount'] = bill['TotalAmountPaid'];
        }

        return OPBillResult;
    }
    public async GetPharmacyCollectionSummary(req: BaseRequest): Promise<any> {
        let result: any = [];
        let refundBO = BoFactory.GetBo(billingbo.PatientRefundBo, this.Request);
        let returnsBO = BoFactory.GetBo(billingbo.PatientReturnsBo, this.Request);
        let billBO = BoFactory.GetBo(billingbo.PatientBillsBo, this.Request);
        result.push({ Key: 1, Value: await this.PharmacyPaymentDetails(req) });
        result.push({ Key: 2, Value: await refundBO.PharmacyRefundDetails(req) });
        result.push({ Key: 3, Value: await billBO.IPPharmacyBills(req) });
        result.push({ Key: 4, Value: await returnsBO.PharmacyReturnDetails(req) });
        return result;
    }
    public async PharmacyPaymentDetails(req: BaseRequest): Promise<any> {
        let UserGroup: { [id: number]: any[] } = {};
        let UserGroupJoin: any = {
            model: this.Models.User, as: 'CreatedUser',
            attributes: ['FirstName', 'LastName'],
            required: true,
            include: [
                this.GetReference('Title')
            ]
        };
        let opbillamountcashInstance: any = await this.FindAll({
            attributes: ['AmountPaid', 'ReceiptGeneratedById'],
            where: {
                ReceiptDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                // EncounterTypeId: { '$or': { '$eq': null, '$in': [1, 4] } },
                BillTypeId: 4,
                IsPharmacyReceipt: 1,
                IsConsolidatePay: 0,
                ReceiptStatusId: 1,
                ReceiptGeneratedById: { '$gt': 0 },
                FacilityId: req.Data.FacilityId,
                StoreMasterId: req.Data.StoreMasterId,
                PaymentTypeId: 1,
            },
            include: [UserGroupJoin]
        });
        if (opbillamountcashInstance) {
            let groupbills = _.groupBy(opbillamountcashInstance, 'ReceiptGeneratedById');
            for (let i in groupbills) {
                let groupedBills = groupbills[i];
                let AmountPaid: number = 0;
                let UserId: number = 0;
                let User: string = '';
                for (let i = 0; i < groupedBills.length; i++) {
                    let bills: any = groupedBills[i];
                    AmountPaid += bills.AmountPaid;
                    UserId = bills.ReceiptGeneratedById;
                    User = bills.CreatedUser;
                    UserGroup[UserId] = UserGroup[UserId] || [];
                }
                let info = {
                    'CashAmount': AmountPaid,
                    'UserId': UserId,
                    'UserName': User
                };
                UserGroup[UserId].push(info);
            }
        }
        let opbillamountcardInstance: any = await this.FindAll({
            attributes: ['AmountPaid', 'ReceiptGeneratedById'],
            where: {
                ReceiptDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                // EncounterTypeId: { '$or': { '$eq': null, '$in': [1, 4] } },
                BillTypeId: 4,
                IsPharmacyReceipt: 1,
                IsConsolidatePay: 0,
                ReceiptStatusId: 1,
                ReceiptGeneratedById: { '$gt': 0 },
                FacilityId: req.Data.FacilityId,
                StoreMasterId: req.Data.StoreMasterId,
                PaymentTypeId: { '$in': [5, 6] }
            },
            include: [UserGroupJoin]
        });
        if (opbillamountcardInstance) {
            let groupbills = _.groupBy(opbillamountcardInstance, 'ReceiptGeneratedById');
            for (let i in groupbills) {
                let groupedBills = groupbills[i];
                let AmountPaid: number = 0;
                let UserId: number = 0;
                let User: string = '';
                for (let i = 0; i < groupedBills.length; i++) {
                    let bills: any = groupedBills[i];
                    AmountPaid += bills.AmountPaid;
                    UserId = bills.ReceiptGeneratedById;
                    User = bills.CreatedUser;
                    UserGroup[UserId] = UserGroup[UserId] || [];
                }
                let info = {
                    'CardAmount': AmountPaid,
                    'UserId': UserId,
                    'UserName': User
                };
                UserGroup[UserId].push(info);
            }
        }
        let opbillamountotherInstance: any = await this.FindAll({
            attributes: ['AmountPaid', 'ReceiptGeneratedById'],
            where: {
                ReceiptDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                // EncounterTypeId: { '$or': { '$eq': null, '$in': [1, 4] } },
                BillTypeId: 4,
                IsPharmacyReceipt: 1,
                IsConsolidatePay: 0,
                ReceiptStatusId: 1,
                ReceiptGeneratedById: { '$gt': 0 },
                FacilityId: req.Data.FacilityId,
                StoreMasterId: req.Data.StoreMasterId,
                PaymentTypeId: { '$notIn': [1, 5, 6, 11] }
            },
            include: [UserGroupJoin]
        });
        if (opbillamountotherInstance) {
            let groupbills = _.groupBy(opbillamountotherInstance, 'ReceiptGeneratedById');
            for (let i in groupbills) {
                let groupedBills = groupbills[i];
                let AmountPaid: number = 0;
                let UserId: number = 0;
                let User: string = '';
                for (let i = 0; i < groupedBills.length; i++) {
                    let bills: any = groupedBills[i];
                    AmountPaid += bills.AmountPaid;
                    UserId = bills.ReceiptGeneratedById;
                    User = bills.CreatedUser;
                    UserGroup[UserId] = UserGroup[UserId] || [];
                }
                let info = {
                    'OtherAmount': AmountPaid,
                    'UserId': UserId,
                    'UserName': User
                };
                UserGroup[UserId].push(info);
            }
        }
        let opbillamountupiInstance: any = await this.FindAll({
            attributes: ['AmountPaid', 'ReceiptGeneratedById'],
            where: {
                ReceiptDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                // EncounterTypeId: { '$or': { '$eq': null, '$in': [1, 4] } },
                BillTypeId: 4,
                IsPharmacyReceipt: 1,
                IsConsolidatePay: 0,
                ReceiptStatusId: 1,
                ReceiptGeneratedById: { '$gt': 0 },
                FacilityId: req.Data.FacilityId,
                StoreMasterId: req.Data.StoreMasterId,
                PaymentTypeId: 11
            },
            include: [UserGroupJoin]
        });
        if (opbillamountupiInstance) {
            let groupbills = _.groupBy(opbillamountupiInstance, 'ReceiptGeneratedById');
            for (let i in groupbills) {
                let groupedBills = groupbills[i];
                let AmountPaid: number = 0;
                let UserId: number = 0;
                let User: string = '';
                for (let i = 0; i < groupedBills.length; i++) {
                    let bills: any = groupedBills[i];
                    AmountPaid += bills.AmountPaid;
                    UserId = bills.ReceiptGeneratedById;
                    User = bills.CreatedUser;
                    UserGroup[UserId] = UserGroup[UserId] || [];
                }
                let info = {
                    'UPIAmount': AmountPaid,
                    'UserId': UserId,
                    'UserName': User
                };
                UserGroup[UserId].push(info);
            }
        }
        let advancebillamountInstance: any = await this.FindAll({
            attributes: ['AmountPaid', 'ReceiptGeneratedById'],
            where: {
                ReceiptDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                IsPharmacyReceipt: 1,
                ReceiptGeneratedById: { '$gt': 0 },
                IsConsolidatePay: 0,
                ReceiptStatusId: 1,
                ReceiptTypeId: 7,
                FacilityId: req.Data.FacilityId,
                StoreMasterId: req.Data.StoreMasterId,
            },
            include: [UserGroupJoin]
        });
        if (advancebillamountInstance) {
            let groupbills = _.groupBy(advancebillamountInstance, 'ReceiptGeneratedById');
            for (let i in groupbills) {
                let groupedBills = groupbills[i];
                let AmountPaid: number = 0;
                let UserId: number = 0;
                let User: string = '';
                for (let i = 0; i < groupedBills.length; i++) {
                    let bills: any = groupedBills[i];
                    AmountPaid += bills.AmountPaid;
                    UserId = bills.ReceiptGeneratedById;
                    User = bills.CreatedUser;
                    UserGroup[UserId] = UserGroup[UserId] || [];
                }
                let info = {
                    'AdvanceCollection': AmountPaid,
                    'UserId': UserId,
                    'UserName': User
                };
                UserGroup[UserId].push(info);
            }
        }
        let duebillamountInstance: any = await this.FindAll({
            attributes: ['AmountPaid', 'ReceiptGeneratedById'],
            where: {
                ReceiptDateTime: { '$lt': req.Data.FromDate },
                IsPharmacyReceipt: 1,
                ReceiptGeneratedById: { '$gt': 0 },
                IsConsolidatePay: 0,
                ReceiptStatusId: 1,
                ReceiptTypeId: 3,
                FacilityId: req.Data.FacilityId,
                StoreMasterId: req.Data.StoreMasterId,
            },
            include: [UserGroupJoin]
        });
        if (duebillamountInstance) {
            let groupbills = _.groupBy(duebillamountInstance, 'ReceiptGeneratedById');
            for (let i in groupbills) {
                let groupedBills = groupbills[i];
                let AmountPaid: number = 0;
                let UserId: number = 0;
                let User: string = '';
                for (let i = 0; i < groupedBills.length; i++) {
                    let bills: any = groupedBills[i];
                    AmountPaid += bills.AmountPaid;
                    UserId = bills.ReceiptGeneratedById;
                    User = bills.CreatedUser;
                    UserGroup[UserId] = UserGroup[UserId] || [];
                }
                let info = {
                    'DueCollection': AmountPaid,
                    'UserId': UserId,
                    'UserName': User
                };
                UserGroup[UserId].push(info);
            }
        }
        return UserGroup;
    }

    public async GetBillingCollectionSummary(req: BaseRequest): Promise<any> {
        let result: any = [];
        let refundBO = BoFactory.GetBo(billingbo.PatientRefundBo, this.Request);
        let billBO = BoFactory.GetBo(billingbo.PatientBillsBo, this.Request);
        let expenseBO = BoFactory.GetBo(billingbo.GeneralExpensesBo, this.Request);
        let doctorBO = BoFactory.GetBo(doctorinvoicebo.DoctorPaymentBo, this.Request);
        result.push({ Key: 1, Value: await this.BillingPaymentDetails(req) });
        result.push({ Key: 2, Value: await refundBO.BillingRefundDetails(req) });
        result.push({ Key: 3, Value: await billBO.BillingBills(req) });
        result.push({ Key: 4, Value: await expenseBO.ExpenseBills(req) });
        result.push({ Key: 5, Value: await doctorBO.DoctorpaymentBills(req) });
        return result;
    }
    public async BillingPaymentDetails(req: BaseRequest): Promise<any> {
        let UserGroup: { [id: number]: any[] } = {};
        let UserGroupJoin: any = {
            model: this.Models.User, as: 'CreatedUser',
            attributes: ['FirstName', 'LastName'],
            required: true,
            include: [
                this.GetReference('Title')
            ]
        };
        if (req.Data.UserId > 0) {
            let opbillamountcashInstance: any = await this.FindAll({
                attributes: ['AmountPaid', 'ReceiptGeneratedById'],
                where: {
                    ReceiptDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                    EncounterTypeId: { '$or': { '$eq': null, '$in': [1, 2, 4] } },
                    // BillTypeId: { '$or': { '$eq': null, '$in': [0, 1, 2, 5] } },
                    IsPharmacyReceipt: 0,
                    IsConsolidatePay: 0,
                    ReceiptStatusId: 1,
                    ReceiptGeneratedById: { '$eq': req.Data.UserId },
                    FacilityId: req.Data.FacilityId,
                    PaymentTypeId: 1,
                },
                include: [UserGroupJoin]
            });
            if (opbillamountcashInstance) {
                let groupbills = _.groupBy(opbillamountcashInstance, 'ReceiptGeneratedById');
                for (let i in groupbills) {
                    let groupedBills = groupbills[i];
                    let AmountPaid: number = 0;
                    let UserId: number = 0;
                    let User: string = '';
                    for (let i = 0; i < groupedBills.length; i++) {
                        let bills: any = groupedBills[i];
                        AmountPaid += bills.AmountPaid;
                        UserId = bills.ReceiptGeneratedById;
                        User = bills.CreatedUser;
                        UserGroup[UserId] = UserGroup[UserId] || [];
                    }
                    let info = {
                        'CashAmount': AmountPaid,
                        'UserId': UserId,
                        'UserName': User
                    };
                    UserGroup[UserId].push(info);
                }
            }
        } else if (req.Data.UserId === 0) {
            let opbillamountcashInstance: any = await this.FindAll({
                attributes: ['AmountPaid', 'ReceiptGeneratedById'],
                where: {
                    ReceiptDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                    EncounterTypeId: { '$or': { '$eq': null, '$in': [1, 2, 4] } },
                    // BillTypeId: { '$or': { '$eq': null, '$in': [0, 1, 2, 5] } },
                    IsPharmacyReceipt: 0,
                    IsConsolidatePay: 0,
                    ReceiptStatusId: 1,
                    ReceiptGeneratedById: { '$gt': 0 },
                    FacilityId: req.Data.FacilityId,
                    PaymentTypeId: 1,
                },
                include: [UserGroupJoin]
            });
            if (opbillamountcashInstance) {
                let groupbills = _.groupBy(opbillamountcashInstance, 'ReceiptGeneratedById');
                for (let i in groupbills) {
                    let groupedBills = groupbills[i];
                    let AmountPaid: number = 0;
                    let UserId: number = 0;
                    let User: string = '';
                    for (let i = 0; i < groupedBills.length; i++) {
                        let bills: any = groupedBills[i];
                        AmountPaid += bills.AmountPaid;
                        UserId = bills.ReceiptGeneratedById;
                        User = bills.CreatedUser;
                        UserGroup[UserId] = UserGroup[UserId] || [];
                    }
                    let info = {
                        'CashAmount': AmountPaid,
                        'UserId': UserId,
                        'UserName': User
                    };
                    UserGroup[UserId].push(info);
                }
            }
        }
        if (req.Data.UserId > 0) {
            let opbillamountcardInstance: any = await this.FindAll({
                attributes: ['AmountPaid', 'ReceiptGeneratedById'],
                where: {
                    ReceiptDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                    EncounterTypeId: { '$or': { '$eq': null, '$in': [1, 2, 4] } },
                    // BillTypeId: { '$or': { '$eq': null, '$in': [0, 1, 2, 5] } },
                    IsPharmacyReceipt: 0,
                    IsConsolidatePay: 0,
                    ReceiptStatusId: 1,
                    ReceiptGeneratedById: { '$eq': req.Data.UserId },
                    FacilityId: req.Data.FacilityId,
                    PaymentTypeId: { '$in': [5, 6] }
                },
                include: [UserGroupJoin]
            });
            if (opbillamountcardInstance) {
                let groupbills = _.groupBy(opbillamountcardInstance, 'ReceiptGeneratedById');
                for (let i in groupbills) {
                    let groupedBills = groupbills[i];
                    let AmountPaid: number = 0;
                    let UserId: number = 0;
                    let User: string = '';
                    for (let i = 0; i < groupedBills.length; i++) {
                        let bills: any = groupedBills[i];
                        AmountPaid += bills.AmountPaid;
                        UserId = bills.ReceiptGeneratedById;
                        User = bills.CreatedUser;
                        UserGroup[UserId] = UserGroup[UserId] || [];
                    }
                    let info = {
                        'CardAmount': AmountPaid,
                        'UserId': UserId,
                        'UserName': User
                    };
                    UserGroup[UserId].push(info);
                }
            }
        } else if (req.Data.UserId === 0) {
            let opbillamountcardInstance: any = await this.FindAll({
                attributes: ['AmountPaid', 'ReceiptGeneratedById'],
                where: {
                    ReceiptDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                    EncounterTypeId: { '$or': { '$eq': null, '$in': [1, 2, 4] } },
                    // BillTypeId: { '$or': { '$eq': null, '$in': [0, 1, 2, 5] } },
                    IsPharmacyReceipt: 0,
                    IsConsolidatePay: 0,
                    ReceiptStatusId: 1,
                    ReceiptGeneratedById: { '$gt': req.Data.UserId },
                    FacilityId: req.Data.FacilityId,
                    PaymentTypeId: { '$in': [5, 6] }
                },
                include: [UserGroupJoin]
            });
            if (opbillamountcardInstance) {
                let groupbills = _.groupBy(opbillamountcardInstance, 'ReceiptGeneratedById');
                for (let i in groupbills) {
                    let groupedBills = groupbills[i];
                    let AmountPaid: number = 0;
                    let UserId: number = 0;
                    let User: string = '';
                    for (let i = 0; i < groupedBills.length; i++) {
                        let bills: any = groupedBills[i];
                        AmountPaid += bills.AmountPaid;
                        UserId = bills.ReceiptGeneratedById;
                        User = bills.CreatedUser;
                        UserGroup[UserId] = UserGroup[UserId] || [];
                    }
                    let info = {
                        'CardAmount': AmountPaid,
                        'UserId': UserId,
                        'UserName': User
                    };
                    UserGroup[UserId].push(info);
                }
            }
        }
        if (req.Data.UserId > 0) {
            let opbillamountotherInstance: any = await this.FindAll({
                attributes: ['AmountPaid', 'ReceiptGeneratedById'],
                where: {
                    ReceiptDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                    EncounterTypeId: { '$or': { '$eq': null, '$in': [1, 2, 4] } },
                    // BillTypeId: { '$or': { '$eq': null, '$in': [0, 1, 2, 5] } },
                    IsPharmacyReceipt: 0,
                    IsConsolidatePay: 0,
                    ReceiptStatusId: 1,
                    ReceiptGeneratedById: { '$eq': req.Data.UserId },
                    FacilityId: req.Data.FacilityId,
                    PaymentTypeId: { '$notIn': [1, 5, 6, 10, 11] }
                },
                include: [UserGroupJoin]
            });
            if (opbillamountotherInstance) {
                let groupbills = _.groupBy(opbillamountotherInstance, 'ReceiptGeneratedById');
                for (let i in groupbills) {
                    let groupedBills = groupbills[i];
                    let AmountPaid: number = 0;
                    let UserId: number = 0;
                    let User: string = '';
                    for (let i = 0; i < groupedBills.length; i++) {
                        let bills: any = groupedBills[i];
                        AmountPaid += bills.AmountPaid;
                        UserId = bills.ReceiptGeneratedById;
                        User = bills.CreatedUser;
                        UserGroup[UserId] = UserGroup[UserId] || [];
                    }
                    let info = {
                        'OtherAmount': AmountPaid,
                        'UserId': UserId,
                        'UserName': User
                    };
                    UserGroup[UserId].push(info);
                }
            }
        } else if (req.Data.UserId === 0) {
            let opbillamountotherInstance: any = await this.FindAll({
                attributes: ['AmountPaid', 'ReceiptGeneratedById'],
                where: {
                    ReceiptDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                    EncounterTypeId: { '$or': { '$eq': null, '$in': [1, 2, 4] } },
                    // BillTypeId: { '$or': { '$eq': null, '$in': [0, 1, 2, 5] } },
                    IsPharmacyReceipt: 0,
                    IsConsolidatePay: 0,
                    ReceiptStatusId: 1,
                    ReceiptGeneratedById: { '$gt': req.Data.UserId },
                    FacilityId: req.Data.FacilityId,
                    PaymentTypeId: { '$notIn': [1, 5, 6, 10, 11] }
                },
                include: [UserGroupJoin]
            });
            if (opbillamountotherInstance) {
                let groupbills = _.groupBy(opbillamountotherInstance, 'ReceiptGeneratedById');
                for (let i in groupbills) {
                    let groupedBills = groupbills[i];
                    let AmountPaid: number = 0;
                    let UserId: number = 0;
                    let User: string = '';
                    for (let i = 0; i < groupedBills.length; i++) {
                        let bills: any = groupedBills[i];
                        AmountPaid += bills.AmountPaid;
                        UserId = bills.ReceiptGeneratedById;
                        User = bills.CreatedUser;
                        UserGroup[UserId] = UserGroup[UserId] || [];
                    }
                    let info = {
                        'OtherAmount': AmountPaid,
                        'UserId': UserId,
                        'UserName': User
                    };
                    UserGroup[UserId].push(info);
                }
            }
        }
        if (req.Data.UserId > 0) {
            let opbillamountNetBankingInstance: any = await this.FindAll({
                attributes: ['AmountPaid', 'ReceiptGeneratedById'],
                where: {
                    ReceiptDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                    EncounterTypeId: { '$or': { '$eq': null, '$in': [1, 2, 4] } },
                    // BillTypeId: { '$or': { '$eq': null, '$in': [0, 1, 2, 5] } },
                    IsPharmacyReceipt: 0,
                    IsConsolidatePay: 0,
                    ReceiptStatusId: 1,
                    ReceiptGeneratedById: { '$eq': req.Data.UserId },
                    FacilityId: req.Data.FacilityId,
                    PaymentTypeId: 10
                },
                include: [UserGroupJoin]
            });
            if (opbillamountNetBankingInstance) {
                let groupbills = _.groupBy(opbillamountNetBankingInstance, 'ReceiptGeneratedById');
                for (let i in groupbills) {
                    let groupedBills = groupbills[i];
                    let AmountPaid: number = 0;
                    let UserId: number = 0;
                    let User: string = '';
                    for (let i = 0; i < groupedBills.length; i++) {
                        let bills: any = groupedBills[i];
                        AmountPaid += bills.AmountPaid;
                        UserId = bills.ReceiptGeneratedById;
                        User = bills.CreatedUser;
                        UserGroup[UserId] = UserGroup[UserId] || [];
                    }
                    let info = {
                        'NetBankingAmount': AmountPaid,
                        'UserId': UserId,
                        'UserName': User
                    };
                    UserGroup[UserId].push(info);
                }
            }
        } else if (req.Data.UserId === 0) {
            let opbillamountNetBankingInstance: any = await this.FindAll({
                attributes: ['AmountPaid', 'ReceiptGeneratedById'],
                where: {
                    ReceiptDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                    EncounterTypeId: { '$or': { '$eq': null, '$in': [1, 2, 4] } },
                    // BillTypeId: { '$or': { '$eq': null, '$in': [0, 1, 2, 5] } },
                    IsPharmacyReceipt: 0,
                    IsConsolidatePay: 0,
                    ReceiptStatusId: 1,
                    ReceiptGeneratedById: { '$gt': req.Data.UserId },
                    FacilityId: req.Data.FacilityId,
                    PaymentTypeId: 10
                },
                include: [UserGroupJoin]
            });
            if (opbillamountNetBankingInstance) {
                let groupbills = _.groupBy(opbillamountNetBankingInstance, 'ReceiptGeneratedById');
                for (let i in groupbills) {
                    let groupedBills = groupbills[i];
                    let AmountPaid: number = 0;
                    let UserId: number = 0;
                    let User: string = '';
                    for (let i = 0; i < groupedBills.length; i++) {
                        let bills: any = groupedBills[i];
                        AmountPaid += bills.AmountPaid;
                        UserId = bills.ReceiptGeneratedById;
                        User = bills.CreatedUser;
                        UserGroup[UserId] = UserGroup[UserId] || [];
                    }
                    let info = {
                        'NetBankingAmount': AmountPaid,
                        'UserId': UserId,
                        'UserName': User
                    };
                    UserGroup[UserId].push(info);
                }
            }
        }
        if (req.Data.UserId > 0) {
            let opbillamountUPIInstance: any = await this.FindAll({
                attributes: ['AmountPaid', 'ReceiptGeneratedById'],
                where: {
                    ReceiptDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                    EncounterTypeId: { '$or': { '$eq': null, '$in': [1, 2, 4] } },
                    // BillTypeId: { '$or': { '$eq': null, '$in': [0, 1, 2, 5] } },
                    IsPharmacyReceipt: 0,
                    IsConsolidatePay: 0,
                    ReceiptStatusId: 1,
                    ReceiptGeneratedById: { '$eq': req.Data.UserId },
                    FacilityId: req.Data.FacilityId,
                    PaymentTypeId: 11
                },
                include: [UserGroupJoin]
            });
            if (opbillamountUPIInstance) {
                let groupbills = _.groupBy(opbillamountUPIInstance, 'ReceiptGeneratedById');
                for (let i in groupbills) {
                    let groupedBills = groupbills[i];
                    let AmountPaid: number = 0;
                    let UserId: number = 0;
                    let User: string = '';
                    for (let i = 0; i < groupedBills.length; i++) {
                        let bills: any = groupedBills[i];
                        AmountPaid += bills.AmountPaid;
                        UserId = bills.ReceiptGeneratedById;
                        User = bills.CreatedUser;
                        UserGroup[UserId] = UserGroup[UserId] || [];
                    }
                    let info = {
                        'UPIAmount': AmountPaid,
                        'UserId': UserId,
                        'UserName': User
                    };
                    UserGroup[UserId].push(info);
                }
            }
        } else if (req.Data.UserId === 0) {
            let opbillamountUPIInstance: any = await this.FindAll({
                attributes: ['AmountPaid', 'ReceiptGeneratedById'],
                where: {
                    ReceiptDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                    EncounterTypeId: { '$or': { '$eq': null, '$in': [1, 2, 4] } },
                    // BillTypeId: { '$or': { '$eq': null, '$in': [0, 1, 2, 5] } },
                    IsPharmacyReceipt: 0,
                    IsConsolidatePay: 0,
                    ReceiptStatusId: 1,
                    ReceiptGeneratedById: { '$gt': req.Data.UserId },
                    FacilityId: req.Data.FacilityId,
                    PaymentTypeId: 11
                },
                include: [UserGroupJoin]
            });
            if (opbillamountUPIInstance) {
                let groupbills = _.groupBy(opbillamountUPIInstance, 'ReceiptGeneratedById');
                for (let i in groupbills) {
                    let groupedBills = groupbills[i];
                    let AmountPaid: number = 0;
                    let UserId: number = 0;
                    let User: string = '';
                    for (let i = 0; i < groupedBills.length; i++) {
                        let bills: any = groupedBills[i];
                        AmountPaid += bills.AmountPaid;
                        UserId = bills.ReceiptGeneratedById;
                        User = bills.CreatedUser;
                        UserGroup[UserId] = UserGroup[UserId] || [];
                    }
                    let info = {
                        'UPIAmount': AmountPaid,
                        'UserId': UserId,
                        'UserName': User
                    };
                    UserGroup[UserId].push(info);
                }
            }
        }
        return UserGroup;
    }

    public async GetOPBillingCollectionSummary(req: BaseRequest): Promise<any> {
        let result: any = [];
        let refundBO = BoFactory.GetBo(billingbo.PatientRefundBo, this.Request);
        let billBO = BoFactory.GetBo(billingbo.PatientBillsBo, this.Request);
        result.push({ Key: 1, Value: await this.OPBillingPaymentDetails(req) });
        result.push({ Key: 2, Value: await refundBO.OPBillingRefundDetails(req) });
        result.push({ Key: 3, Value: await billBO.OPBillingBills(req) });
        return result;
    }
    public async OPBillingPaymentDetails(req: BaseRequest): Promise<any> {
        let UserGroup: { [id: number]: any[] } = {};
        let UserGroupJoin: any = {
            model: this.Models.User, as: 'CreatedUser',
            attributes: ['FirstName', 'LastName'],
            required: true,
            include: [
                this.GetReference('Title')
            ]
        };
        if (req.Data.UserId > 0) {
            let opbillamountcashInstance: any = await this.FindAll({
                attributes: ['AmountPaid', 'ReceiptGeneratedById'],
                where: {
                    ReceiptDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                    EncounterTypeId: { '$or': { '$eq': null, '$in': [1, 4] } },
                    // BillTypeId: { '$or': { '$eq': null, '$in': [1, 5] } },
                    IsPharmacyReceipt: 0,
                    IsConsolidatePay: 0,
                    ReceiptStatusId: 1,
                    ReceiptGeneratedById: { '$eq': req.Data.UserId },
                    FacilityId: req.Data.FacilityId,
                    PaymentTypeId: 1,
                },
                include: [UserGroupJoin]
            });
            if (opbillamountcashInstance) {
                let groupbills = _.groupBy(opbillamountcashInstance, 'ReceiptGeneratedById');
                for (let i in groupbills) {
                    let groupedBills = groupbills[i];
                    let AmountPaid: number = 0;
                    let UserId: number = 0;
                    let User: string = '';
                    for (let i = 0; i < groupedBills.length; i++) {
                        let bills: any = groupedBills[i];
                        AmountPaid += bills.AmountPaid;
                        UserId = bills.ReceiptGeneratedById;
                        User = bills.CreatedUser;
                        UserGroup[UserId] = UserGroup[UserId] || [];
                    }
                    let info = {
                        'CashAmount': AmountPaid,
                        'UserId': UserId,
                        'UserName': User
                    };
                    UserGroup[UserId].push(info);
                }
            }
        } else if (req.Data.UserId === 0) {
            let opbillamountcashInstance: any = await this.FindAll({
                attributes: ['AmountPaid', 'ReceiptGeneratedById'],
                where: {
                    ReceiptDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                    EncounterTypeId: { '$or': { '$eq': null, '$in': [1, 4] } },
                    // BillTypeId: { '$or': { '$eq': null, '$in': [1, 5] } },
                    IsPharmacyReceipt: 0,
                    IsConsolidatePay: 0,
                    ReceiptStatusId: 1,
                    ReceiptGeneratedById: { '$gt': req.Data.UserId },
                    FacilityId: req.Data.FacilityId,
                    PaymentTypeId: 1,
                },
                include: [UserGroupJoin]
            });
            if (opbillamountcashInstance) {
                let groupbills = _.groupBy(opbillamountcashInstance, 'ReceiptGeneratedById');
                for (let i in groupbills) {
                    let groupedBills = groupbills[i];
                    let AmountPaid: number = 0;
                    let UserId: number = 0;
                    let User: string = '';
                    for (let i = 0; i < groupedBills.length; i++) {
                        let bills: any = groupedBills[i];
                        AmountPaid += bills.AmountPaid;
                        UserId = bills.ReceiptGeneratedById;
                        User = bills.CreatedUser;
                        UserGroup[UserId] = UserGroup[UserId] || [];
                    }
                    let info = {
                        'CashAmount': AmountPaid,
                        'UserId': UserId,
                        'UserName': User
                    };
                    UserGroup[UserId].push(info);
                }
            }
        }
        if (req.Data.UserId > 0) {
            let opbillamountcardInstance: any = await this.FindAll({
                attributes: ['AmountPaid', 'ReceiptGeneratedById'],
                where: {
                    ReceiptDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                    EncounterTypeId: { '$or': { '$eq': null, '$in': [1, 4] } },
                    // BillTypeId: { '$in': [1, 5] },
                    IsPharmacyReceipt: 0,
                    IsConsolidatePay: 0,
                    ReceiptStatusId: 1,
                    ReceiptGeneratedById: { '$eq': req.Data.UserId },
                    FacilityId: req.Data.FacilityId,
                    PaymentTypeId: { '$in': [5, 6] }
                },
                include: [UserGroupJoin]
            });
            if (opbillamountcardInstance) {
                let groupbills = _.groupBy(opbillamountcardInstance, 'ReceiptGeneratedById');
                for (let i in groupbills) {
                    let groupedBills = groupbills[i];
                    let AmountPaid: number = 0;
                    let UserId: number = 0;
                    let User: string = '';
                    for (let i = 0; i < groupedBills.length; i++) {
                        let bills: any = groupedBills[i];
                        AmountPaid += bills.AmountPaid;
                        UserId = bills.ReceiptGeneratedById;
                        User = bills.CreatedUser;
                        UserGroup[UserId] = UserGroup[UserId] || [];
                    }
                    let info = {
                        'CardAmount': AmountPaid,
                        'UserId': UserId,
                        'UserName': User
                    };
                    UserGroup[UserId].push(info);
                }
            }
        } else if (req.Data.UserId === 0) {
            let opbillamountcardInstance: any = await this.FindAll({
                attributes: ['AmountPaid', 'ReceiptGeneratedById'],
                where: {
                    ReceiptDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                    EncounterTypeId: { '$or': { '$eq': null, '$in': [1, 4] } },
                    // BillTypeId: { '$in': [1, 5] },
                    IsPharmacyReceipt: 0,
                    IsConsolidatePay: 0,
                    ReceiptStatusId: 1,
                    ReceiptGeneratedById: { '$gt': req.Data.UserId },
                    FacilityId: req.Data.FacilityId,
                    PaymentTypeId: { '$in': [5, 6] }
                },
                include: [UserGroupJoin]
            });
            if (opbillamountcardInstance) {
                let groupbills = _.groupBy(opbillamountcardInstance, 'ReceiptGeneratedById');
                for (let i in groupbills) {
                    let groupedBills = groupbills[i];
                    let AmountPaid: number = 0;
                    let UserId: number = 0;
                    let User: string = '';
                    for (let i = 0; i < groupedBills.length; i++) {
                        let bills: any = groupedBills[i];
                        AmountPaid += bills.AmountPaid;
                        UserId = bills.ReceiptGeneratedById;
                        User = bills.CreatedUser;
                        UserGroup[UserId] = UserGroup[UserId] || [];
                    }
                    let info = {
                        'CardAmount': AmountPaid,
                        'UserId': UserId,
                        'UserName': User
                    };
                    UserGroup[UserId].push(info);
                }
            }
        }
        if (req.Data.UserId > 0) {
            let opbillamountotherInstance: any = await this.FindAll({
                attributes: ['AmountPaid', 'ReceiptGeneratedById'],
                where: {
                    ReceiptDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                    EncounterTypeId: { '$or': { '$eq': null, '$in': [1, 4] } },
                    // BillTypeId: { '$or': { '$eq': null, '$in': [1, 5] } },
                    IsPharmacyReceipt: 0,
                    IsConsolidatePay: 0,
                    ReceiptStatusId: 1,
                    ReceiptGeneratedById: { '$eq': req.Data.UserId },
                    FacilityId: req.Data.FacilityId,
                    PaymentTypeId: { '$notIn': [1, 5, 6] }
                },
                include: [UserGroupJoin]
            });
            if (opbillamountotherInstance) {
                let groupbills = _.groupBy(opbillamountotherInstance, 'ReceiptGeneratedById');
                for (let i in groupbills) {
                    let groupedBills = groupbills[i];
                    let AmountPaid: number = 0;
                    let UserId: number = 0;
                    let User: string = '';
                    for (let i = 0; i < groupedBills.length; i++) {
                        let bills: any = groupedBills[i];
                        AmountPaid += bills.AmountPaid;
                        UserId = bills.ReceiptGeneratedById;
                        User = bills.CreatedUser;
                        UserGroup[UserId] = UserGroup[UserId] || [];
                    }
                    let info = {
                        'OtherAmount': AmountPaid,
                        'UserId': UserId,
                        'UserName': User
                    };
                    UserGroup[UserId].push(info);
                }
            }
        } else if (req.Data.UserId === 0) {
            let opbillamountotherInstance: any = await this.FindAll({
                attributes: ['AmountPaid', 'ReceiptGeneratedById'],
                where: {
                    ReceiptDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                    EncounterTypeId: { '$or': { '$eq': null, '$in': [1, 4] } },
                    // BillTypeId: { '$or': { '$eq': null, '$in': [1, 5] } },
                    IsPharmacyReceipt: 0,
                    IsConsolidatePay: 0,
                    ReceiptStatusId: 1,
                    ReceiptGeneratedById: { '$gt': req.Data.UserId },
                    FacilityId: req.Data.FacilityId,
                    PaymentTypeId: { '$notIn': [1, 5, 6] }
                },
                include: [UserGroupJoin]
            });
            if (opbillamountotherInstance) {
                let groupbills = _.groupBy(opbillamountotherInstance, 'ReceiptGeneratedById');
                for (let i in groupbills) {
                    let groupedBills = groupbills[i];
                    let AmountPaid: number = 0;
                    let UserId: number = 0;
                    let User: string = '';
                    for (let i = 0; i < groupedBills.length; i++) {
                        let bills: any = groupedBills[i];
                        AmountPaid += bills.AmountPaid;
                        UserId = bills.ReceiptGeneratedById;
                        User = bills.CreatedUser;
                        UserGroup[UserId] = UserGroup[UserId] || [];
                    }
                    let info = {
                        'OtherAmount': AmountPaid,
                        'UserId': UserId,
                        'UserName': User
                    };
                    UserGroup[UserId].push(info);
                }
            }
        }
        return UserGroup;
    }

    public async GetIPBillingCollectionSummary(req: BaseRequest): Promise<any> {
        let result: any = [];
        let refundBO = BoFactory.GetBo(billingbo.PatientRefundBo, this.Request);
        let billBO = BoFactory.GetBo(billingbo.PatientBillsBo, this.Request);
        result.push({ Key: 1, Value: await this.IPBillingPaymentDetails(req) });
        result.push({ Key: 2, Value: await refundBO.IPBillingRefundDetails(req) });
        result.push({ Key: 3, Value: await billBO.IPBillingBills(req) });
        return result;
    }
    public async IPBillingPaymentDetails(req: BaseRequest): Promise<any> {
        let UserGroup: { [id: number]: any[] } = {};
        let UserGroupJoin: any = {
            model: this.Models.User, as: 'CreatedUser',
            attributes: ['FirstName', 'LastName'],
            required: true,
            include: [
                this.GetReference('Title')
            ]
        };
        if (req.Data.UserId > 0) {
            let opbillamountcashInstance: any = await this.FindAll({
                attributes: ['AmountPaid', 'ReceiptGeneratedById'],
                where: {
                    ReceiptDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                    EncounterTypeId: { '$or': { '$eq': null, '$in': [2] } },
                    // BillTypeId: { '$or': { '$eq': null, '$in': [2] } },
                    IsPharmacyReceipt: 0,
                    IsConsolidatePay: 0,
                    ReceiptStatusId: 1,
                    ReceiptGeneratedById: { '$eq': req.Data.UserId },
                    FacilityId: req.Data.FacilityId,
                    PaymentTypeId: 1,
                },
                include: [UserGroupJoin]
            });
            if (opbillamountcashInstance) {
                let groupbills = _.groupBy(opbillamountcashInstance, 'ReceiptGeneratedById');
                for (let i in groupbills) {
                    let groupedBills = groupbills[i];
                    let AmountPaid: number = 0;
                    let UserId: number = 0;
                    let User: string = '';
                    for (let i = 0; i < groupedBills.length; i++) {
                        let bills: any = groupedBills[i];
                        AmountPaid += bills.AmountPaid;
                        UserId = bills.ReceiptGeneratedById;
                        User = bills.CreatedUser;
                        UserGroup[UserId] = UserGroup[UserId] || [];
                    }
                    let info = {
                        'CashAmount': AmountPaid,
                        'UserId': UserId,
                        'UserName': User
                    };
                    UserGroup[UserId].push(info);
                }
            }
        } else if (req.Data.UserId === 0) {
            let opbillamountcashInstance: any = await this.FindAll({
                attributes: ['AmountPaid', 'ReceiptGeneratedById'],
                where: {
                    ReceiptDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                    EncounterTypeId: { '$or': { '$eq': null, '$in': [2] } },
                    // BillTypeId: { '$or': { '$eq': null, '$in': [2] } },
                    IsPharmacyReceipt: 0,
                    IsConsolidatePay: 0,
                    ReceiptStatusId: 1,
                    ReceiptGeneratedById: { '$gt': 0 },
                    FacilityId: req.Data.FacilityId,
                    PaymentTypeId: 1,
                },
                include: [UserGroupJoin]
            });
            if (opbillamountcashInstance) {
                let groupbills = _.groupBy(opbillamountcashInstance, 'ReceiptGeneratedById');
                for (let i in groupbills) {
                    let groupedBills = groupbills[i];
                    let AmountPaid: number = 0;
                    let UserId: number = 0;
                    let User: string = '';
                    for (let i = 0; i < groupedBills.length; i++) {
                        let bills: any = groupedBills[i];
                        AmountPaid += bills.AmountPaid;
                        UserId = bills.ReceiptGeneratedById;
                        User = bills.CreatedUser;
                        UserGroup[UserId] = UserGroup[UserId] || [];
                    }
                    let info = {
                        'CashAmount': AmountPaid,
                        'UserId': UserId,
                        'UserName': User
                    };
                    UserGroup[UserId].push(info);
                }
            }
        }
        if (req.Data.UserId > 0) {
            let opbillamountcardInstance: any = await this.FindAll({
                attributes: ['AmountPaid', 'ReceiptGeneratedById'],
                where: {
                    ReceiptDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                    EncounterTypeId: { '$or': { '$eq': null, '$in': [2] } },
                    // BillTypeId: { '$or': { '$eq': null, '$in': [2] } },
                    IsPharmacyReceipt: 0,
                    IsConsolidatePay: 0,
                    ReceiptStatusId: 1,
                    ReceiptGeneratedById: { '$eq': req.Data.UserId },
                    FacilityId: req.Data.FacilityId,
                    PaymentTypeId: { '$in': [5, 6] }
                },
                include: [UserGroupJoin]
            });
            if (opbillamountcardInstance) {
                let groupbills = _.groupBy(opbillamountcardInstance, 'ReceiptGeneratedById');
                for (let i in groupbills) {
                    let groupedBills = groupbills[i];
                    let AmountPaid: number = 0;
                    let UserId: number = 0;
                    let User: string = '';
                    for (let i = 0; i < groupedBills.length; i++) {
                        let bills: any = groupedBills[i];
                        AmountPaid += bills.AmountPaid;
                        UserId = bills.ReceiptGeneratedById;
                        User = bills.CreatedUser;
                        UserGroup[UserId] = UserGroup[UserId] || [];
                    }
                    let info = {
                        'CardAmount': AmountPaid,
                        'UserId': UserId,
                        'UserName': User
                    };
                    UserGroup[UserId].push(info);
                }
            }
        } else if (req.Data.UserId === 0) {
            let opbillamountcardInstance: any = await this.FindAll({
                attributes: ['AmountPaid', 'ReceiptGeneratedById'],
                where: {
                    ReceiptDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                    EncounterTypeId: { '$or': { '$eq': null, '$in': [2] } },
                    // BillTypeId: { '$or': { '$eq': null, '$in': [2] } },
                    IsPharmacyReceipt: 0,
                    IsConsolidatePay: 0,
                    ReceiptStatusId: 1,
                    ReceiptGeneratedById: { '$gt': 0 },
                    FacilityId: req.Data.FacilityId,
                    PaymentTypeId: { '$in': [5, 6] }
                },
                include: [UserGroupJoin]
            });
            if (opbillamountcardInstance) {
                let groupbills = _.groupBy(opbillamountcardInstance, 'ReceiptGeneratedById');
                for (let i in groupbills) {
                    let groupedBills = groupbills[i];
                    let AmountPaid: number = 0;
                    let UserId: number = 0;
                    let User: string = '';
                    for (let i = 0; i < groupedBills.length; i++) {
                        let bills: any = groupedBills[i];
                        AmountPaid += bills.AmountPaid;
                        UserId = bills.ReceiptGeneratedById;
                        User = bills.CreatedUser;
                        UserGroup[UserId] = UserGroup[UserId] || [];
                    }
                    let info = {
                        'CardAmount': AmountPaid,
                        'UserId': UserId,
                        'UserName': User
                    };
                    UserGroup[UserId].push(info);
                }
            }
        }
        if (req.Data.UserId > 0) {
            let opbillamountotherInstance: any = await this.FindAll({
                attributes: ['AmountPaid', 'ReceiptGeneratedById'],
                where: {
                    ReceiptDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                    EncounterTypeId: { '$or': { '$eq': null, '$in': [2] } },
                    // BillTypeId: { '$or': { '$eq': null, '$in': [2] } },
                    IsPharmacyReceipt: 0,
                    IsConsolidatePay: 0,
                    ReceiptStatusId: 1,
                    ReceiptGeneratedById: { '$eq': req.Data.UserId },
                    FacilityId: req.Data.FacilityId,
                    PaymentTypeId: { '$notIn': [1, 5, 6, 10, 11] }
                },
                include: [UserGroupJoin]
            });

            if (opbillamountotherInstance) {
                let groupbills = _.groupBy(opbillamountotherInstance, 'ReceiptGeneratedById');
                for (let i in groupbills) {
                    let groupedBills = groupbills[i];
                    let AmountPaid: number = 0;
                    let UserId: number = 0;
                    let User: string = '';
                    for (let i = 0; i < groupedBills.length; i++) {
                        let bills: any = groupedBills[i];
                        AmountPaid += bills.AmountPaid;
                        UserId = bills.ReceiptGeneratedById;
                        User = bills.CreatedUser;
                        UserGroup[UserId] = UserGroup[UserId] || [];
                    }
                    let info = {
                        'OtherAmount': AmountPaid,
                        'UserId': UserId,
                        'UserName': User
                    };
                    UserGroup[UserId].push(info);
                }
            }
        } else if (req.Data.UserId === 0) {
            let opbillamountotherInstance: any = await this.FindAll({
                attributes: ['AmountPaid', 'ReceiptGeneratedById'],
                where: {
                    ReceiptDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                    EncounterTypeId: { '$or': { '$eq': null, '$in': [2] } },
                    // BillTypeId: { '$or': { '$eq': null, '$in': [2] } },
                    IsPharmacyReceipt: 0,
                    IsConsolidatePay: 0,
                    ReceiptStatusId: 1,
                    ReceiptGeneratedById: { '$gt': 0 },
                    FacilityId: req.Data.FacilityId,
                    PaymentTypeId: { '$notIn': [1, 5, 6, 10, 11] }
                },
                include: [UserGroupJoin]
            });

            if (opbillamountotherInstance) {
                let groupbills = _.groupBy(opbillamountotherInstance, 'ReceiptGeneratedById');
                for (let i in groupbills) {
                    let groupedBills = groupbills[i];
                    let AmountPaid: number = 0;
                    let UserId: number = 0;
                    let User: string = '';
                    for (let i = 0; i < groupedBills.length; i++) {
                        let bills: any = groupedBills[i];
                        AmountPaid += bills.AmountPaid;
                        UserId = bills.ReceiptGeneratedById;
                        User = bills.CreatedUser;
                        UserGroup[UserId] = UserGroup[UserId] || [];
                    }
                    let info = {
                        'OtherAmount': AmountPaid,
                        'UserId': UserId,
                        'UserName': User
                    };
                    UserGroup[UserId].push(info);
                }
            }
        }
        if (req.Data.UserId > 0) {
            let opbillamountNetBankingInstance: any = await this.FindAll({
                attributes: ['AmountPaid', 'ReceiptGeneratedById'],
                where: {
                    ReceiptDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                    EncounterTypeId: { '$or': { '$eq': null, '$in': [2] } },
                    // BillTypeId: { '$or': { '$eq': null, '$in': [2] } },
                    IsPharmacyReceipt: 0,
                    IsConsolidatePay: 0,
                    ReceiptStatusId: 1,
                    ReceiptGeneratedById: { '$eq': req.Data.UserId },
                    FacilityId: req.Data.FacilityId,
                    PaymentTypeId: 10,
                },
                include: [UserGroupJoin]
            });
            if (opbillamountNetBankingInstance) {
                let groupbills = _.groupBy(opbillamountNetBankingInstance, 'ReceiptGeneratedById');
                for (let i in groupbills) {
                    let groupedBills = groupbills[i];
                    let AmountPaid: number = 0;
                    let UserId: number = 0;
                    let User: string = '';
                    for (let i = 0; i < groupedBills.length; i++) {
                        let bills: any = groupedBills[i];
                        AmountPaid += bills.AmountPaid;
                        UserId = bills.ReceiptGeneratedById;
                        User = bills.CreatedUser;
                        UserGroup[UserId] = UserGroup[UserId] || [];
                    }
                    let info = {
                        'NetBankingAmount': AmountPaid,
                        'UserId': UserId,
                        'UserName': User
                    };
                    UserGroup[UserId].push(info);
                }
            }
        } else if (req.Data.UserId === 0) {
            let opbillamountNetBankingInstance: any = await this.FindAll({
                attributes: ['AmountPaid', 'ReceiptGeneratedById'],
                where: {
                    ReceiptDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                    EncounterTypeId: { '$or': { '$eq': null, '$in': [2] } },
                    // BillTypeId: { '$or': { '$eq': null, '$in': [2] } },
                    IsPharmacyReceipt: 0,
                    IsConsolidatePay: 0,
                    ReceiptStatusId: 1,
                    ReceiptGeneratedById: { '$gt': 0 },
                    FacilityId: req.Data.FacilityId,
                    PaymentTypeId: 10,
                },
                include: [UserGroupJoin]
            });
            if (opbillamountNetBankingInstance) {
                let groupbills = _.groupBy(opbillamountNetBankingInstance, 'ReceiptGeneratedById');
                for (let i in groupbills) {
                    let groupedBills = groupbills[i];
                    let AmountPaid: number = 0;
                    let UserId: number = 0;
                    let User: string = '';
                    for (let i = 0; i < groupedBills.length; i++) {
                        let bills: any = groupedBills[i];
                        AmountPaid += bills.AmountPaid;
                        UserId = bills.ReceiptGeneratedById;
                        User = bills.CreatedUser;
                        UserGroup[UserId] = UserGroup[UserId] || [];
                    }
                    let info = {
                        'NetBankingAmount': AmountPaid,
                        'UserId': UserId,
                        'UserName': User
                    };
                    UserGroup[UserId].push(info);
                }
            }
        }
        if (req.Data.UserId > 0) {
            let opbillamountUPIInstance: any = await this.FindAll({
                attributes: ['AmountPaid', 'ReceiptGeneratedById'],
                where: {
                    ReceiptDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                    EncounterTypeId: { '$or': { '$eq': null, '$in': [2] } },
                    // BillTypeId: { '$or': { '$eq': null, '$in': [2] } },
                    IsPharmacyReceipt: 0,
                    IsConsolidatePay: 0,
                    ReceiptStatusId: 1,
                    ReceiptGeneratedById: { '$eq': req.Data.UserId },
                    FacilityId: req.Data.FacilityId,
                    PaymentTypeId: 11,
                },
                include: [UserGroupJoin]
            });
            if (opbillamountUPIInstance) {
                let groupbills = _.groupBy(opbillamountUPIInstance, 'ReceiptGeneratedById');
                for (let i in groupbills) {
                    let groupedBills = groupbills[i];
                    let AmountPaid: number = 0;
                    let UserId: number = 0;
                    let User: string = '';
                    for (let i = 0; i < groupedBills.length; i++) {
                        let bills: any = groupedBills[i];
                        AmountPaid += bills.AmountPaid;
                        UserId = bills.ReceiptGeneratedById;
                        User = bills.CreatedUser;
                        UserGroup[UserId] = UserGroup[UserId] || [];
                    }
                    let info = {
                        'UPIAmount': AmountPaid,
                        'UserId': UserId,
                        'UserName': User
                    };
                    UserGroup[UserId].push(info);
                }
            }
        } else if (req.Data.UserId === 0) {
            let opbillamountUPIInstance: any = await this.FindAll({
                attributes: ['AmountPaid', 'ReceiptGeneratedById'],
                where: {
                    ReceiptDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                    EncounterTypeId: { '$or': { '$eq': null, '$in': [2] } },
                    // BillTypeId: { '$or': { '$eq': null, '$in': [2] } },
                    IsPharmacyReceipt: 0,
                    IsConsolidatePay: 0,
                    ReceiptStatusId: 1,
                    ReceiptGeneratedById: { '$gt': 0 },
                    FacilityId: req.Data.FacilityId,
                    PaymentTypeId: 11,
                },
                include: [UserGroupJoin]
            });
            if (opbillamountUPIInstance) {
                let groupbills = _.groupBy(opbillamountUPIInstance, 'ReceiptGeneratedById');
                for (let i in groupbills) {
                    let groupedBills = groupbills[i];
                    let AmountPaid: number = 0;
                    let UserId: number = 0;
                    let User: string = '';
                    for (let i = 0; i < groupedBills.length; i++) {
                        let bills: any = groupedBills[i];
                        AmountPaid += bills.AmountPaid;
                        UserId = bills.ReceiptGeneratedById;
                        User = bills.CreatedUser;
                        UserGroup[UserId] = UserGroup[UserId] || [];
                    }
                    let info = {
                        'UPIAmount': AmountPaid,
                        'UserId': UserId,
                        'UserName': User
                    };
                    UserGroup[UserId].push(info);
                }
            }
        }
        return UserGroup;
    }
    public async GetOverallCollectionSummary(req: BaseRequest): Promise<any> {
        let result: any = [];
        let refundBO = BoFactory.GetBo(billingbo.PatientRefundBo, this.Request);
        let returnsBO = BoFactory.GetBo(billingbo.PatientReturnsBo, this.Request);
        let billBO = BoFactory.GetBo(billingbo.PatientBillsBo, this.Request);
        let docBO = BoFactory.GetBo(doctorinvoicebo.DoctorPaymentBo, this.Request);
        result.push({ Key: 'OP Collection', Value: await this.OPCollection(req) });
        result.push({ Key: 'OP Collection', Value: await billBO.OPBillCollection(req) });
        result.push({ Key: 'OP Collection', Value: await refundBO.OPRefundCollection(req) });
        result.push({ Key: 'IP Collection', Value: await this.IPCollection(req) });
        result.push({ Key: 'IP Collection', Value: await billBO.IPBillCollection(req) });
        result.push({ Key: 'IP Collection', Value: await refundBO.IPRefundCollection(req) });
        result.push({ Key: 'Pharmacy Collection', Value: await this.PharmacyCollection(req) });
        result.push({ Key: 'Pharmacy Collection', Value: await billBO.PharmacyBillCollection(req) });
        result.push({ Key: 'Pharmacy Collection', Value: await refundBO.PharmacyRefundCollection(req) });
        result.push({ Key: 'Pharmacy Collection', Value: await returnsBO.PharmacyIPReturnDetails(req) });
        result.push({ Key: 'Doctor Share', Value: await docBO.DoctorShareDetails(req) });
        result.push({ Key: 'Advance Fund', Value: await this.AdvanceFundDetails(req) });
        // result.push({ Key: 2, Value: await refundBO.PharmacyRefundDetails(req) });
        // result.push({ Key: 3, Value: await billBO.IPPharmacyBills(req) });
        // result.push({ Key: 4, Value: await returnsBO.PharmacyReturnDetails(req) });
        return result;
    }

    public async OPCollection(req: BaseRequest): Promise<any> {
        let OPBillResult: any = {};
        OPBillResult['DisplayOrder'] = 1;

        let opbillamountInstance: any = await this.Find({
            attributes: [
                [this.Dal.fn('SUM', this.Dal.col('AmountPaid')), 'TotalAmountPaid'],
            ],
            where: {
                ReceiptDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                EncounterTypeId: { '$or': { '$eq': null, '$in': [1, 4] } },
                IsPharmacyReceipt: 0,
                IsConsolidatePay: 0,
                ReceiptStatusId: 1,
                PaymentStatusId: 3,
                FacilityId: req.Data.FacilityId
            }
        });
        if (opbillamountInstance) {
            let bill: any = this.GetAttribute(opbillamountInstance);
            OPBillResult['PaidAmount'] = bill['TotalAmountPaid'];
        }

        let opbillamountcashInstance: any = await this.Find({
            attributes: [
                [this.Dal.fn('SUM', this.Dal.col('AmountPaid')), 'TotalAmountPaid'],
            ],
            where: {
                ReceiptDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                EncounterTypeId: { '$or': { '$eq': null, '$in': [1, 4] } },
                IsPharmacyReceipt: 0,
                IsConsolidatePay: 0,
                ReceiptStatusId: 1,
                PaymentStatusId: 3,
                FacilityId: req.Data.FacilityId,
                PaymentTypeId: 1,
            }
        });
        if (opbillamountcashInstance) {
            let bill: any = this.GetAttribute(opbillamountcashInstance);
            OPBillResult['CashAmount'] = bill['TotalAmountPaid'];
        }

        let opbillamountcardInstance: any = await this.Find({
            attributes: [
                [this.Dal.fn('SUM', this.Dal.col('AmountPaid')), 'TotalAmountPaid'],
            ],
            where: {
                ReceiptDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                EncounterTypeId: { '$or': { '$eq': null, '$in': [1, 4] } },
                IsPharmacyReceipt: 0,
                IsConsolidatePay: 0,
                ReceiptStatusId: 1,
                PaymentStatusId: 3,
                FacilityId: req.Data.FacilityId,
                PaymentTypeId: { '$in': [5, 6] }
            }
        });
        if (opbillamountcardInstance) {
            let bill: any = this.GetAttribute(opbillamountcardInstance);
            OPBillResult['CardAmount'] = bill['TotalAmountPaid'];
        }
        let opbillamountupiInstance: any = await this.Find({
            attributes: [
                [this.Dal.fn('SUM', this.Dal.col('AmountPaid')), 'TotalAmountPaid'],
            ],
            where: {
                ReceiptDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                EncounterTypeId: { '$or': { '$eq': null, '$in': [1, 4] } },
                IsPharmacyReceipt: 0,
                IsConsolidatePay: 0,
                ReceiptStatusId: 1,
                PaymentStatusId: 3,
                FacilityId: req.Data.FacilityId,
                PaymentTypeId: 11,
            }
        });
        if (opbillamountupiInstance) {
            let bill: any = this.GetAttribute(opbillamountupiInstance);
            OPBillResult['UPIAmount'] = bill['TotalAmountPaid'];
        }
        let opbillamountotherInstance: any = await this.Find({
            attributes: [
                [this.Dal.fn('SUM', this.Dal.col('AmountPaid')), 'TotalAmountPaid'],
            ],
            where: {
                ReceiptDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                EncounterTypeId: { '$or': { '$eq': null, '$in': [1, 4] } },
                IsPharmacyReceipt: 0,
                IsConsolidatePay: 0,
                ReceiptStatusId: 1,
                PaymentStatusId: 3,
                FacilityId: req.Data.FacilityId,
                PaymentTypeId: { '$notIn': [1, 5, 6, 11] }
            }
        });
        if (opbillamountotherInstance) {
            let bill: any = this.GetAttribute(opbillamountotherInstance);
            OPBillResult['OtherAmount'] = bill['TotalAmountPaid'];
        }

        return OPBillResult;
    }
    public async AdvanceFundDetails(req: BaseRequest): Promise<any> {
        let OPBillResult: any = {};
        OPBillResult['DisplayOrder'] = 11;

        let opbillamountInstance: any = await this.Find({
            attributes: [
                [this.Dal.fn('SUM', this.Dal.col('AmountPaid')), 'TotalAmountPaid'],
            ],
            where: {
                ReceiptDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                IsPharmacyReceipt: 0,
                IsConsolidatePay: 0,
                ReceiptStatusId: 1,
                ReceiptTypeId: 1,
                FacilityId: req.Data.FacilityId,
                EncounterTypeId: { '$or': { '$eq': null, '$in': [1, 4] } },

            }
        });
        if (opbillamountInstance) {
            let bill: any = this.GetAttribute(opbillamountInstance);
            OPBillResult['PaidAmount'] = bill['TotalAmountPaid'];
        }

        let opbillamountcashInstance: any = await this.Find({
            attributes: [
                [this.Dal.fn('SUM', this.Dal.col('AmountPaid')), 'TotalAmountPaid'],
            ],
            where: {
                ReceiptDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                IsPharmacyReceipt: 0,
                IsConsolidatePay: 0,
                ReceiptStatusId: 1,
                ReceiptTypeId: 1,
                FacilityId: req.Data.FacilityId,
                EncounterTypeId: { '$or': { '$eq': null, '$in': [1, 4] } },
                PaymentTypeId: 1,
            }
        });
        if (opbillamountcashInstance) {
            let bill: any = this.GetAttribute(opbillamountcashInstance);
            OPBillResult['CashAmount'] = bill['TotalAmountPaid'];
        }

        let opbillamountcardInstance: any = await this.Find({
            attributes: [
                [this.Dal.fn('SUM', this.Dal.col('AmountPaid')), 'TotalAmountPaid'],
            ],
            where: {
                ReceiptDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                IsPharmacyReceipt: 0,
                IsConsolidatePay: 0,
                ReceiptStatusId: 1,
                ReceiptTypeId: 1,
                FacilityId: req.Data.FacilityId,
                EncounterTypeId: { '$or': { '$eq': null, '$in': [1, 4] } },
                PaymentTypeId: { '$in': [5, 6] }
            }
        });
        if (opbillamountcardInstance) {
            let bill: any = this.GetAttribute(opbillamountcardInstance);
            OPBillResult['CardAmount'] = bill['TotalAmountPaid'];
        }
        let opbillamountupiInstance: any = await this.Find({
            attributes: [
                [this.Dal.fn('SUM', this.Dal.col('AmountPaid')), 'TotalAmountPaid'],
            ],
            where: {
                ReceiptDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                IsPharmacyReceipt: 0,
                IsConsolidatePay: 0,
                ReceiptStatusId: 1,
                ReceiptTypeId: 1,
                FacilityId: req.Data.FacilityId,
                EncounterTypeId: { '$or': { '$eq': null, '$in': [1, 4] } },
                PaymentTypeId: 11,
            }
        });
        if (opbillamountupiInstance) {
            let bill: any = this.GetAttribute(opbillamountupiInstance);
            OPBillResult['UPIAmount'] = bill['TotalAmountPaid'];
        }
        let opbillamountotherInstance: any = await this.Find({
            attributes: [
                [this.Dal.fn('SUM', this.Dal.col('AmountPaid')), 'TotalAmountPaid'],
            ],
            where: {
                ReceiptDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                IsPharmacyReceipt: 0,
                IsConsolidatePay: 0,
                ReceiptStatusId: 1,
                ReceiptTypeId: 1,
                FacilityId: req.Data.FacilityId,
                EncounterTypeId: { '$or': { '$eq': null, '$in': [1, 4] } },
                PaymentTypeId: { '$notIn': [1, 5, 6, 11] }
            }
        });
        if (opbillamountotherInstance) {
            let bill: any = this.GetAttribute(opbillamountotherInstance);
            OPBillResult['OtherAmount'] = bill['TotalAmountPaid'];
        }

        return OPBillResult;
    }
    public async IPCollection(req: BaseRequest): Promise<any> {
        let OPBillResult: any = {};
        OPBillResult['DisplayOrder'] = 4;

        let opbillamountInstance: any = await this.Find({
            attributes: [
                [this.Dal.fn('SUM', this.Dal.col('AmountPaid')), 'TotalAmountPaid'],
            ],
            where: {
                ReceiptDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                EncounterTypeId: { '$or': { '$eq': null, '$in': [2] } },
                IsPharmacyReceipt: 0,
                IsConsolidatePay: 0,
                ReceiptStatusId: 1,
                FacilityId: req.Data.FacilityId
            }
        });
        if (opbillamountInstance) {
            let bill: any = this.GetAttribute(opbillamountInstance);
            OPBillResult['PaidAmount'] = bill['TotalAmountPaid'];
        }

        let opbillamountcashInstance: any = await this.Find({
            attributes: [
                [this.Dal.fn('SUM', this.Dal.col('AmountPaid')), 'TotalAmountPaid'],
            ],
            where: {
                ReceiptDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                EncounterTypeId: { '$or': { '$eq': null, '$in': [2] } },
                IsPharmacyReceipt: 0,
                IsConsolidatePay: 0,
                ReceiptStatusId: 1,
                FacilityId: req.Data.FacilityId,
                PaymentTypeId: 1,
            }
        });
        if (opbillamountcashInstance) {
            let bill: any = this.GetAttribute(opbillamountcashInstance);
            OPBillResult['CashAmount'] = bill['TotalAmountPaid'];
        }

        let opbillamountcardInstance: any = await this.Find({
            attributes: [
                [this.Dal.fn('SUM', this.Dal.col('AmountPaid')), 'TotalAmountPaid'],
            ],
            where: {
                ReceiptDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                EncounterTypeId: { '$or': { '$eq': null, '$in': [2] } },
                IsPharmacyReceipt: 0,
                IsConsolidatePay: 0,
                ReceiptStatusId: 1,
                FacilityId: req.Data.FacilityId,
                PaymentTypeId: { '$in': [5, 6] }
            }
        });
        if (opbillamountcardInstance) {
            let bill: any = this.GetAttribute(opbillamountcardInstance);
            OPBillResult['CardAmount'] = bill['TotalAmountPaid'];
        }
        let opbillamountupiInstance: any = await this.Find({
            attributes: [
                [this.Dal.fn('SUM', this.Dal.col('AmountPaid')), 'TotalAmountPaid'],
            ],
            where: {
                ReceiptDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                EncounterTypeId: { '$or': { '$eq': null, '$in': [2] } },
                IsPharmacyReceipt: 0,
                IsConsolidatePay: 0,
                ReceiptStatusId: 1,
                FacilityId: req.Data.FacilityId,
                PaymentTypeId: 11,
            }
        });
        if (opbillamountupiInstance) {
            let bill: any = this.GetAttribute(opbillamountupiInstance);
            OPBillResult['UPIAmount'] = bill['TotalAmountPaid'];
        }
        let opbillamountotherInstance: any = await this.Find({
            attributes: [
                [this.Dal.fn('SUM', this.Dal.col('AmountPaid')), 'TotalAmountPaid'],
            ],
            where: {
                ReceiptDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                EncounterTypeId: { '$or': { '$eq': null, '$in': [2] } },
                IsPharmacyReceipt: 0,
                IsConsolidatePay: 0,
                ReceiptStatusId: 1,
                FacilityId: req.Data.FacilityId,
                PaymentTypeId: { '$notIn': [1, 5, 6, 11] }
            }
        });
        if (opbillamountotherInstance) {
            let bill: any = this.GetAttribute(opbillamountotherInstance);
            OPBillResult['OtherAmount'] = bill['TotalAmountPaid'];
        }

        return OPBillResult;
    }

    public async PharmacyCollection(req: BaseRequest): Promise<any> {
        let OPBillResult: any = {};
        OPBillResult['DisplayOrder'] = 7;

        let opbillamountInstance: any = await this.Find({
            attributes: [
                [this.Dal.fn('SUM', this.Dal.col('AmountPaid')), 'TotalAmountPaid'],
            ],
            where: {
                ReceiptDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                BillTypeId: 4,
                IsPharmacyReceipt: 1,
                IsConsolidatePay: 0,
                ReceiptStatusId: 1,
                FacilityId: req.Data.FacilityId
            }
        });
        if (opbillamountInstance) {
            let bill: any = this.GetAttribute(opbillamountInstance);
            OPBillResult['PaidAmount'] = bill['TotalAmountPaid'];
        }

        let opbillamountcashInstance: any = await this.Find({
            attributes: [
                [this.Dal.fn('SUM', this.Dal.col('AmountPaid')), 'TotalAmountPaid'],
            ],
            where: {
                ReceiptDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                BillTypeId: 4,
                IsPharmacyReceipt: 1,
                IsConsolidatePay: 0,
                ReceiptStatusId: 1,
                FacilityId: req.Data.FacilityId,
                PaymentTypeId: 1,
            }
        });
        if (opbillamountcashInstance) {
            let bill: any = this.GetAttribute(opbillamountcashInstance);
            OPBillResult['CashAmount'] = bill['TotalAmountPaid'];
        }

        let opbillamountcardInstance: any = await this.Find({
            attributes: [
                [this.Dal.fn('SUM', this.Dal.col('AmountPaid')), 'TotalAmountPaid'],
            ],
            where: {
                ReceiptDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                BillTypeId: 4,
                IsPharmacyReceipt: 1,
                IsConsolidatePay: 0,
                ReceiptStatusId: 1,
                FacilityId: req.Data.FacilityId,
                PaymentTypeId: { '$in': [5, 6] }
            }
        });
        if (opbillamountcardInstance) {
            let bill: any = this.GetAttribute(opbillamountcardInstance);
            OPBillResult['CardAmount'] = bill['TotalAmountPaid'];
        }
        let opbillamountupiInstance: any = await this.Find({
            attributes: [
                [this.Dal.fn('SUM', this.Dal.col('AmountPaid')), 'TotalAmountPaid'],
            ],
            where: {
                ReceiptDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                BillTypeId: 4,
                IsPharmacyReceipt: 1,
                IsConsolidatePay: 0,
                ReceiptStatusId: 1,
                FacilityId: req.Data.FacilityId,
                PaymentTypeId: 11,
            }
        });
        if (opbillamountupiInstance) {
            let bill: any = this.GetAttribute(opbillamountupiInstance);
            OPBillResult['UPIAmount'] = bill['TotalAmountPaid'];
        }

        let opbillamountotherInstance: any = await this.Find({
            attributes: [
                [this.Dal.fn('SUM', this.Dal.col('AmountPaid')), 'TotalAmountPaid'],
            ],
            where: {
                ReceiptDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                BillTypeId: 4,
                IsPharmacyReceipt: 1,
                IsConsolidatePay: 0,
                ReceiptStatusId: 1,
                FacilityId: req.Data.FacilityId,
                PaymentTypeId: { '$notIn': [1, 5, 6, 11] }
            }
        });
        if (opbillamountotherInstance) {
            let bill: any = this.GetAttribute(opbillamountotherInstance);
            OPBillResult['OtherAmount'] = bill['TotalAmountPaid'];
        }

        return OPBillResult;
    }
    public async GetUserWiseCollectionCashier(req: BaseRequest): Promise<any> {
        let result: any = [];
        let refundBO = BoFactory.GetBo(billingbo.PatientRefundBo, this.Request);
        result.push({ Key: 1, Value: await this.OPPaymentDetails(req) });
        result.push({ Key: 2, Value: await this.IPPaymentDetails(req) });
        result.push({ Key: 3, Value: await this.OPUserDuePaymentDetails(req) });
        result.push({ Key: 4, Value: await this.IPUserDuePaymentDetails(req) });
        result.push({ Key: 5, Value: await refundBO.OPUserRefundDetails(req) });
        result.push({ Key: 6, Value: await refundBO.IPUserRefundDetails(req) });
        return result;
    }

    public async OPPaymentDetails(req: BaseRequest): Promise<any> {
        let UserGroup: { [id: number]: any[] } = {};
        let UserGroupJoin: any = {
            model: this.Models.User, as: 'CreatedUser',
            attributes: ['FirstName', 'LastName'],
            required: true,
            include: [
                this.GetReference('Title')
            ]
        };
        if (req.Data.UserId > 0) {
            let opbillamountcashInstance: any = await this.FindAll({
                attributes: ['AmountPaid', 'ReceiptGeneratedById'],
                where: {
                    ReceiptDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                    EncounterTypeId: { '$or': { '$eq': null, '$in': [1, 4] } },
                    // BillTypeId: { '$in': [1, 5] },
                    ReceiptTypeId: { '$in': [1, 2, 3, 7] },
                    IsPharmacyReceipt: 0,
                    // IsConsolidatePay: 0,
                    ReceiptStatusId: 1,
                    ReceiptGeneratedById: { '$eq': req.Data.UserId },
                    FacilityId: req.Data.FacilityId,
                    PaymentTypeId: 1,
                },
                include: [UserGroupJoin]
            });
            if (opbillamountcashInstance) {
                let groupbills = _.groupBy(opbillamountcashInstance, 'ReceiptGeneratedById');
                for (let i in groupbills) {
                    let groupedBills = groupbills[i];
                    let AmountPaid: number = 0;
                    let UserId: number = 0;
                    let User: string = '';
                    for (let i = 0; i < groupedBills.length; i++) {
                        let bills: any = groupedBills[i];
                        AmountPaid += bills.AmountPaid;
                        UserId = bills.ReceiptGeneratedById;
                        User = bills.CreatedUser;
                        UserGroup[UserId] = UserGroup[UserId] || [];
                    }
                    let info = {
                        'OPCashAmount': AmountPaid,
                        'UserId': UserId,
                        'UserName': User
                    };
                    UserGroup[UserId].push(info);
                }
            }
        } else if (req.Data.UserId === 0) {
            let opbillamountcashInstance: any = await this.FindAll({
                attributes: ['AmountPaid', 'ReceiptGeneratedById'],
                where: {
                    ReceiptDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                    EncounterTypeId: { '$or': { '$eq': null, '$in': [1, 4] } },
                    // BillTypeId: { '$in': [1, 5] },
                    ReceiptTypeId: { '$in': [1, 2, 3, 7] },
                    IsPharmacyReceipt: 0,
                    // IsConsolidatePay: 0,
                    ReceiptStatusId: 1,
                    ReceiptGeneratedById: { '$gt': req.Data.UserId },
                    FacilityId: req.Data.FacilityId,
                    PaymentTypeId: 1,
                },
                include: [UserGroupJoin]
            });
            if (opbillamountcashInstance) {
                let groupbills = _.groupBy(opbillamountcashInstance, 'ReceiptGeneratedById');
                for (let i in groupbills) {
                    let groupedBills = groupbills[i];
                    let AmountPaid: number = 0;
                    let UserId: number = 0;
                    let User: string = '';
                    for (let i = 0; i < groupedBills.length; i++) {
                        let bills: any = groupedBills[i];
                        AmountPaid += bills.AmountPaid;
                        UserId = bills.ReceiptGeneratedById;
                        User = bills.CreatedUser;
                        UserGroup[UserId] = UserGroup[UserId] || [];
                    }
                    let info = {
                        'OPCashAmount': AmountPaid,
                        'UserId': UserId,
                        'UserName': User
                    };
                    UserGroup[UserId].push(info);
                }
            }
        }
        if (req.Data.UserId > 0) {
            let opbillamountcardInstance: any = await this.FindAll({
                attributes: ['AmountPaid', 'ReceiptGeneratedById'],
                where: {
                    ReceiptDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                    EncounterTypeId: { '$or': { '$eq': null, '$in': [1, 4] } },
                    // BillTypeId: { '$in': [1, 5] },
                    ReceiptTypeId: { '$in': [1, 2, 3, 7] },
                    IsPharmacyReceipt: 0,
                    // IsConsolidatePay: 0,
                    ReceiptStatusId: 1,
                    ReceiptGeneratedById: { '$eq': req.Data.UserId },
                    FacilityId: req.Data.FacilityId,
                    PaymentTypeId: { '$in': [5, 6] }
                },
                include: [UserGroupJoin]
            });
            if (opbillamountcardInstance) {
                let groupbills = _.groupBy(opbillamountcardInstance, 'ReceiptGeneratedById');
                for (let i in groupbills) {
                    let groupedBills = groupbills[i];
                    let AmountPaid: number = 0;
                    let UserId: number = 0;
                    let User: string = '';
                    for (let i = 0; i < groupedBills.length; i++) {
                        let bills: any = groupedBills[i];
                        AmountPaid += bills.AmountPaid;
                        UserId = bills.ReceiptGeneratedById;
                        User = bills.CreatedUser;
                        UserGroup[UserId] = UserGroup[UserId] || [];
                    }
                    let info = {
                        'OPCardAmount': AmountPaid,
                        'UserId': UserId,
                        'UserName': User
                    };
                    UserGroup[UserId].push(info);
                }
            }
        } else if (req.Data.UserId === 0) {
            let opbillamountcardInstance: any = await this.FindAll({
                attributes: ['AmountPaid', 'ReceiptGeneratedById'],
                where: {
                    ReceiptDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                    EncounterTypeId: { '$or': { '$eq': null, '$in': [1, 4] } },
                    // BillTypeId: { '$in': [1, 5] },
                    ReceiptTypeId: { '$in': [1, 2, 3, 7] },
                    IsPharmacyReceipt: 0,
                    // IsConsolidatePay: 0,
                    ReceiptStatusId: 1,
                    ReceiptGeneratedById: { '$gt': req.Data.UserId },
                    FacilityId: req.Data.FacilityId,
                    PaymentTypeId: { '$in': [5, 6] }
                },
                include: [UserGroupJoin]
            });
            if (opbillamountcardInstance) {
                let groupbills = _.groupBy(opbillamountcardInstance, 'ReceiptGeneratedById');
                for (let i in groupbills) {
                    let groupedBills = groupbills[i];
                    let AmountPaid: number = 0;
                    let UserId: number = 0;
                    let User: string = '';
                    for (let i = 0; i < groupedBills.length; i++) {
                        let bills: any = groupedBills[i];
                        AmountPaid += bills.AmountPaid;
                        UserId = bills.ReceiptGeneratedById;
                        User = bills.CreatedUser;
                        UserGroup[UserId] = UserGroup[UserId] || [];
                    }
                    let info = {
                        'OPCardAmount': AmountPaid,
                        'UserId': UserId,
                        'UserName': User
                    };
                    UserGroup[UserId].push(info);
                }
            }
        }
        if (req.Data.UserId > 0) {
            let opbillamountotherInstance: any = await this.FindAll({
                attributes: ['AmountPaid', 'ReceiptGeneratedById'],
                where: {
                    ReceiptDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                    EncounterTypeId: { '$or': { '$eq': null, '$in': [1, 4] } },
                    // BillTypeId: { '$in': [1, 5] },
                    ReceiptTypeId: { '$in': [1, 2, 3, 7] },
                    IsPharmacyReceipt: 0,
                    // IsConsolidatePay: 0,
                    ReceiptStatusId: 1,
                    ReceiptGeneratedById: { '$eq': req.Data.UserId },
                    FacilityId: req.Data.FacilityId,
                    PaymentTypeId: { '$notIn': [1, 5, 6, 11] }
                },
                include: [UserGroupJoin]
            });
            if (opbillamountotherInstance) {
                let groupbills = _.groupBy(opbillamountotherInstance, 'ReceiptGeneratedById');
                for (let i in groupbills) {
                    let groupedBills = groupbills[i];
                    let AmountPaid: number = 0;
                    let UserId: number = 0;
                    let User: string = '';
                    for (let i = 0; i < groupedBills.length; i++) {
                        let bills: any = groupedBills[i];
                        AmountPaid += bills.AmountPaid;
                        UserId = bills.ReceiptGeneratedById;
                        User = bills.CreatedUser;
                        UserGroup[UserId] = UserGroup[UserId] || [];
                    }
                    let info = {
                        'OPOtherAmount': AmountPaid,
                        'UserId': UserId,
                        'UserName': User
                    };
                    UserGroup[UserId].push(info);
                }
            }
        } else if (req.Data.UserId === 0) {
            let opbillamountotherInstance: any = await this.FindAll({
                attributes: ['AmountPaid', 'ReceiptGeneratedById'],
                where: {
                    ReceiptDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                    EncounterTypeId: { '$or': { '$eq': null, '$in': [1, 4] } },
                    // BillTypeId: { '$in': [1, 5] },
                    ReceiptTypeId: { '$in': [1, 2, 3, 7] },
                    IsPharmacyReceipt: 0,
                    // IsConsolidatePay: 0,
                    ReceiptStatusId: 1,
                    ReceiptGeneratedById: { '$gt': req.Data.UserId },
                    FacilityId: req.Data.FacilityId,
                    PaymentTypeId: { '$notIn': [1, 5, 6, 11] }
                },
                include: [UserGroupJoin]
            });
            if (opbillamountotherInstance) {
                let groupbills = _.groupBy(opbillamountotherInstance, 'ReceiptGeneratedById');
                for (let i in groupbills) {
                    let groupedBills = groupbills[i];
                    let AmountPaid: number = 0;
                    let UserId: number = 0;
                    let User: string = '';
                    for (let i = 0; i < groupedBills.length; i++) {
                        let bills: any = groupedBills[i];
                        AmountPaid += bills.AmountPaid;
                        UserId = bills.ReceiptGeneratedById;
                        User = bills.CreatedUser;
                        UserGroup[UserId] = UserGroup[UserId] || [];
                    }
                    let info = {
                        'OPOtherAmount': AmountPaid,
                        'UserId': UserId,
                        'UserName': User
                    };
                    UserGroup[UserId].push(info);
                }
            }
        }
        if (req.Data.UserId > 0) {
            let opbillamountupiInstance: any = await this.FindAll({
                attributes: ['AmountPaid', 'ReceiptGeneratedById'],
                where: {
                    ReceiptDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                    EncounterTypeId: { '$or': { '$eq': null, '$in': [1, 4] } },
                    // BillTypeId: { '$in': [1, 5] },
                    ReceiptTypeId: { '$in': [1, 2, 3, 7] },
                    IsPharmacyReceipt: 0,
                    // IsConsolidatePay: 0,
                    ReceiptStatusId: 1,
                    ReceiptGeneratedById: { '$eq': req.Data.UserId },
                    FacilityId: req.Data.FacilityId,
                    PaymentTypeId: 11
                },
                include: [UserGroupJoin]
            });
            if (opbillamountupiInstance) {
                let groupbills = _.groupBy(opbillamountupiInstance, 'ReceiptGeneratedById');
                for (let i in groupbills) {
                    let groupedBills = groupbills[i];
                    let AmountPaid: number = 0;
                    let UserId: number = 0;
                    let User: string = '';
                    for (let i = 0; i < groupedBills.length; i++) {
                        let bills: any = groupedBills[i];
                        AmountPaid += bills.AmountPaid;
                        UserId = bills.ReceiptGeneratedById;
                        User = bills.CreatedUser;
                        UserGroup[UserId] = UserGroup[UserId] || [];
                    }
                    let info = {
                        'OPUpiAmount': AmountPaid,
                        'UserId': UserId,
                        'UserName': User
                    };
                    UserGroup[UserId].push(info);
                }
            }
        } else if (req.Data.UserId === 0) {
            let opbillamountupiInstance: any = await this.FindAll({
                attributes: ['AmountPaid', 'ReceiptGeneratedById'],
                where: {
                    ReceiptDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                    EncounterTypeId: { '$or': { '$eq': null, '$in': [1, 4] } },
                    // BillTypeId: { '$in': [1, 5] },
                    ReceiptTypeId: { '$in': [1, 2, 3, 7] },
                    IsPharmacyReceipt: 0,
                    // IsConsolidatePay: 0,
                    ReceiptStatusId: 1,
                    ReceiptGeneratedById: { '$gt': req.Data.UserId },
                    FacilityId: req.Data.FacilityId,
                    PaymentTypeId: 11
                },
                include: [UserGroupJoin]
            });
            if (opbillamountupiInstance) {
                let groupbills = _.groupBy(opbillamountupiInstance, 'ReceiptGeneratedById');
                for (let i in groupbills) {
                    let groupedBills = groupbills[i];
                    let AmountPaid: number = 0;
                    let UserId: number = 0;
                    let User: string = '';
                    for (let i = 0; i < groupedBills.length; i++) {
                        let bills: any = groupedBills[i];
                        AmountPaid += bills.AmountPaid;
                        UserId = bills.ReceiptGeneratedById;
                        User = bills.CreatedUser;
                        UserGroup[UserId] = UserGroup[UserId] || [];
                    }
                    let info = {
                        'OPUpiAmount': AmountPaid,
                        'UserId': UserId,
                        'UserName': User
                    };
                    UserGroup[UserId].push(info);
                }
            }
        }
        return UserGroup;
    }
    public async IPPaymentDetails(req: BaseRequest): Promise<any> {
        let UserGroup: { [id: number]: any[] } = {};
        let UserGroupJoin: any = {
            model: this.Models.User, as: 'CreatedUser',
            attributes: ['FirstName', 'LastName'],
            required: true,
            include: [
                this.GetReference('Title')
            ]
        };
        if (req.Data.UserId > 0) {
            let opbillamountcashInstance: any = await this.FindAll({
                attributes: ['AmountPaid', 'ReceiptGeneratedById'],
                where: {
                    ReceiptDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                    EncounterTypeId: { '$or': { '$eq': null, '$in': [2] } },
                    // BillTypeId: { '$in': [1, 5] },
                    ReceiptTypeId: { '$in': [1, 2, 3, 7] },
                    IsPharmacyReceipt: 0,
                    // IsConsolidatePay: 0,
                    ReceiptStatusId: 1,
                    ReceiptGeneratedById: { '$eq': req.Data.UserId },
                    FacilityId: req.Data.FacilityId,
                    PaymentTypeId: 1,
                },
                include: [UserGroupJoin]
            });
            if (opbillamountcashInstance) {
                let groupbills = _.groupBy(opbillamountcashInstance, 'ReceiptGeneratedById');
                for (let i in groupbills) {
                    let groupedBills = groupbills[i];
                    let AmountPaid: number = 0;
                    let UserId: number = 0;
                    let User: string = '';
                    for (let i = 0; i < groupedBills.length; i++) {
                        let bills: any = groupedBills[i];
                        AmountPaid += bills.AmountPaid;
                        UserId = bills.ReceiptGeneratedById;
                        User = bills.CreatedUser;
                        UserGroup[UserId] = UserGroup[UserId] || [];
                    }
                    let info = {
                        'IPCashAmount': AmountPaid,
                        'UserId': UserId,
                        'UserName': User
                    };
                    UserGroup[UserId].push(info);
                }
            }
        } else if (req.Data.UserId === 0) {
            let opbillamountcashInstance: any = await this.FindAll({
                attributes: ['AmountPaid', 'ReceiptGeneratedById'],
                where: {
                    ReceiptDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                    EncounterTypeId: { '$or': { '$eq': null, '$in': [2] } },
                    // BillTypeId: { '$in': [1, 5] },
                    ReceiptTypeId: { '$in': [1, 2, 3, 7] },
                    IsPharmacyReceipt: 0,
                    // IsConsolidatePay: 0,
                    ReceiptStatusId: 1,
                    ReceiptGeneratedById: { '$gt': req.Data.UserId },
                    FacilityId: req.Data.FacilityId,
                    PaymentTypeId: 1,
                },
                include: [UserGroupJoin]
            });
            if (opbillamountcashInstance) {
                let groupbills = _.groupBy(opbillamountcashInstance, 'ReceiptGeneratedById');
                for (let i in groupbills) {
                    let groupedBills = groupbills[i];
                    let AmountPaid: number = 0;
                    let UserId: number = 0;
                    let User: string = '';
                    for (let i = 0; i < groupedBills.length; i++) {
                        let bills: any = groupedBills[i];
                        AmountPaid += bills.AmountPaid;
                        UserId = bills.ReceiptGeneratedById;
                        User = bills.CreatedUser;
                        UserGroup[UserId] = UserGroup[UserId] || [];
                    }
                    let info = {
                        'IPCashAmount': AmountPaid,
                        'UserId': UserId,
                        'UserName': User
                    };
                    UserGroup[UserId].push(info);
                }
            }
        }
        if (req.Data.UserId > 0) {
            let opbillamountcardInstance: any = await this.FindAll({
                attributes: ['AmountPaid', 'ReceiptGeneratedById'],
                where: {
                    ReceiptDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                    EncounterTypeId: { '$or': { '$eq': null, '$in': [2] } },
                    // BillTypeId: { '$in': [1, 5] },
                    ReceiptTypeId: { '$in': [1, 2, 3, 7] },
                    IsPharmacyReceipt: 0,
                    // IsConsolidatePay: 0,
                    ReceiptStatusId: 1,
                    ReceiptGeneratedById: { '$eq': req.Data.UserId },
                    FacilityId: req.Data.FacilityId,
                    PaymentTypeId: { '$in': [5, 6] }
                },
                include: [UserGroupJoin]
            });
            if (opbillamountcardInstance) {
                let groupbills = _.groupBy(opbillamountcardInstance, 'ReceiptGeneratedById');
                for (let i in groupbills) {
                    let groupedBills = groupbills[i];
                    let AmountPaid: number = 0;
                    let UserId: number = 0;
                    let User: string = '';
                    for (let i = 0; i < groupedBills.length; i++) {
                        let bills: any = groupedBills[i];
                        AmountPaid += bills.AmountPaid;
                        UserId = bills.ReceiptGeneratedById;
                        User = bills.CreatedUser;
                        UserGroup[UserId] = UserGroup[UserId] || [];
                    }
                    let info = {
                        'IPCardAmount': AmountPaid,
                        'UserId': UserId,
                        'UserName': User
                    };
                    UserGroup[UserId].push(info);
                }
            }
        } else if (req.Data.UserId === 0) {
            let opbillamountcardInstance: any = await this.FindAll({
                attributes: ['AmountPaid', 'ReceiptGeneratedById'],
                where: {
                    ReceiptDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                    EncounterTypeId: { '$or': { '$eq': null, '$in': [2] } },
                    // BillTypeId: { '$in': [1, 5] },
                    ReceiptTypeId: { '$in': [1, 2, 3, 7] },
                    IsPharmacyReceipt: 0,
                    // IsConsolidatePay: 0,
                    ReceiptStatusId: 1,
                    ReceiptGeneratedById: { '$gt': req.Data.UserId },
                    FacilityId: req.Data.FacilityId,
                    PaymentTypeId: { '$in': [5, 6] }
                },
                include: [UserGroupJoin]
            });
            if (opbillamountcardInstance) {
                let groupbills = _.groupBy(opbillamountcardInstance, 'ReceiptGeneratedById');
                for (let i in groupbills) {
                    let groupedBills = groupbills[i];
                    let AmountPaid: number = 0;
                    let UserId: number = 0;
                    let User: string = '';
                    for (let i = 0; i < groupedBills.length; i++) {
                        let bills: any = groupedBills[i];
                        AmountPaid += bills.AmountPaid;
                        UserId = bills.ReceiptGeneratedById;
                        User = bills.CreatedUser;
                        UserGroup[UserId] = UserGroup[UserId] || [];
                    }
                    let info = {
                        'IPCardAmount': AmountPaid,
                        'UserId': UserId,
                        'UserName': User
                    };
                    UserGroup[UserId].push(info);
                }
            }
        }
        if (req.Data.UserId > 0) {
            let opbillamountotherInstance: any = await this.FindAll({
                attributes: ['AmountPaid', 'ReceiptGeneratedById'],
                where: {
                    ReceiptDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                    EncounterTypeId: { '$or': { '$eq': null, '$in': [2] } },
                    // BillTypeId: { '$in': [1, 5] },
                    ReceiptTypeId: { '$in': [1, 2, 3, 7] },
                    IsPharmacyReceipt: 0,
                    // IsConsolidatePay: 0,
                    ReceiptStatusId: 1,
                    ReceiptGeneratedById: { '$eq': req.Data.UserId },
                    FacilityId: req.Data.FacilityId,
                    PaymentTypeId: { '$notIn': [1, 5, 6, 11] }
                },
                include: [UserGroupJoin]
            });
            if (opbillamountotherInstance) {
                let groupbills = _.groupBy(opbillamountotherInstance, 'ReceiptGeneratedById');
                for (let i in groupbills) {
                    let groupedBills = groupbills[i];
                    let AmountPaid: number = 0;
                    let UserId: number = 0;
                    let User: string = '';
                    for (let i = 0; i < groupedBills.length; i++) {
                        let bills: any = groupedBills[i];
                        AmountPaid += bills.AmountPaid;
                        UserId = bills.ReceiptGeneratedById;
                        User = bills.CreatedUser;
                        UserGroup[UserId] = UserGroup[UserId] || [];
                    }
                    let info = {
                        'IPOPOtherAmount': AmountPaid,
                        'UserId': UserId,
                        'UserName': User
                    };
                    UserGroup[UserId].push(info);
                }
            }
        } else if (req.Data.UserId === 0) {
            let opbillamountotherInstance: any = await this.FindAll({
                attributes: ['AmountPaid', 'ReceiptGeneratedById'],
                where: {
                    ReceiptDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                    EncounterTypeId: { '$or': { '$eq': null, '$in': [2] } },
                    // BillTypeId: { '$in': [1, 5] },
                    ReceiptTypeId: { '$in': [1, 2, 3, 7] },
                    IsPharmacyReceipt: 0,
                    // IsConsolidatePay: 0,
                    ReceiptStatusId: 1,
                    ReceiptGeneratedById: { '$gt': req.Data.UserId },
                    FacilityId: req.Data.FacilityId,
                    PaymentTypeId: { '$notIn': [1, 5, 6, 11] }
                },
                include: [UserGroupJoin]
            });
            if (opbillamountotherInstance) {
                let groupbills = _.groupBy(opbillamountotherInstance, 'ReceiptGeneratedById');
                for (let i in groupbills) {
                    let groupedBills = groupbills[i];
                    let AmountPaid: number = 0;
                    let UserId: number = 0;
                    let User: string = '';
                    for (let i = 0; i < groupedBills.length; i++) {
                        let bills: any = groupedBills[i];
                        AmountPaid += bills.AmountPaid;
                        UserId = bills.ReceiptGeneratedById;
                        User = bills.CreatedUser;
                        UserGroup[UserId] = UserGroup[UserId] || [];
                    }
                    let info = {
                        'IPOtherAmount': AmountPaid,
                        'UserId': UserId,
                        'UserName': User
                    };
                    UserGroup[UserId].push(info);
                }
            }
        }
        if (req.Data.UserId > 0) {
            let opbillamountupiInstance: any = await this.FindAll({
                attributes: ['AmountPaid', 'ReceiptGeneratedById'],
                where: {
                    ReceiptDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                    EncounterTypeId: { '$or': { '$eq': null, '$in': [2] } },
                    // BillTypeId: { '$in': [1, 5] },
                    ReceiptTypeId: { '$in': [1, 2, 3, 7] },
                    IsPharmacyReceipt: 0,
                    // IsConsolidatePay: 0,
                    ReceiptStatusId: 1,
                    ReceiptGeneratedById: { '$eq': req.Data.UserId },
                    FacilityId: req.Data.FacilityId,
                    PaymentTypeId: 11
                },
                include: [UserGroupJoin]
            });
            if (opbillamountupiInstance) {
                let groupbills = _.groupBy(opbillamountupiInstance, 'ReceiptGeneratedById');
                for (let i in groupbills) {
                    let groupedBills = groupbills[i];
                    let AmountPaid: number = 0;
                    let UserId: number = 0;
                    let User: string = '';
                    for (let i = 0; i < groupedBills.length; i++) {
                        let bills: any = groupedBills[i];
                        AmountPaid += bills.AmountPaid;
                        UserId = bills.ReceiptGeneratedById;
                        User = bills.CreatedUser;
                        UserGroup[UserId] = UserGroup[UserId] || [];
                    }
                    let info = {
                        'IPUpiAmount': AmountPaid,
                        'UserId': UserId,
                        'UserName': User
                    };
                    UserGroup[UserId].push(info);
                }
            }
        } else if (req.Data.UserId === 0) {
            let opbillamountupiInstance: any = await this.FindAll({
                attributes: ['AmountPaid', 'ReceiptGeneratedById'],
                where: {
                    ReceiptDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                    EncounterTypeId: { '$or': { '$eq': null, '$in': [2] } },
                    // BillTypeId: { '$in': [1, 5] },
                    ReceiptTypeId: { '$in': [1, 2, 3, 7] },
                    IsPharmacyReceipt: 0,
                    // IsConsolidatePay: 0,
                    ReceiptStatusId: 1,
                    ReceiptGeneratedById: { '$gt': req.Data.UserId },
                    FacilityId: req.Data.FacilityId,
                    PaymentTypeId: 11
                },
                include: [UserGroupJoin]
            });
            if (opbillamountupiInstance) {
                let groupbills = _.groupBy(opbillamountupiInstance, 'ReceiptGeneratedById');
                for (let i in groupbills) {
                    let groupedBills = groupbills[i];
                    let AmountPaid: number = 0;
                    let UserId: number = 0;
                    let User: string = '';
                    for (let i = 0; i < groupedBills.length; i++) {
                        let bills: any = groupedBills[i];
                        AmountPaid += bills.AmountPaid;
                        UserId = bills.ReceiptGeneratedById;
                        User = bills.CreatedUser;
                        UserGroup[UserId] = UserGroup[UserId] || [];
                    }
                    let info = {
                        'IPUpiAmount': AmountPaid,
                        'UserId': UserId,
                        'UserName': User
                    };
                    UserGroup[UserId].push(info);
                }
            }
        }
        return UserGroup;
    }

    public async OPUserDuePaymentDetails(req: BaseRequest): Promise<any> {
        let UserGroup: { [id: number]: any[] } = {};
        let UserGroupJoin: any = {
            model: this.Models.User, as: 'CreatedUser',
            attributes: ['FirstName', 'LastName'],
            required: true,
            include: [
                this.GetReference('Title')
            ]
        };
        if (req.Data.UserId > 0) {
            let opbilldueInstance: any = await this.FindAll({
                attributes: ['AmountPaid', 'ReceiptGeneratedById'],
                where: {
                    ReceiptDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                    EncounterTypeId: { '$or': { '$eq': null, '$in': [1, 4] } },
                    BillTypeId: { '$in': [1, 5] },
                    ReceiptTypeId: 3,
                    IsPharmacyReceipt: 0,
                    // IsConsolidatePay: 0,
                    ReceiptStatusId: 1,
                    ReceiptGeneratedById: { '$eq': req.Data.UserId },
                    FacilityId: req.Data.FacilityId,

                },
                include: [UserGroupJoin]
            });
            if (opbilldueInstance) {
                let groupbills = _.groupBy(opbilldueInstance, 'ReceiptGeneratedById');
                for (let i in groupbills) {
                    let groupedBills = groupbills[i];
                    let AmountPaid: number = 0;
                    let UserId: number = 0;
                    let User: string = '';
                    for (let i = 0; i < groupedBills.length; i++) {
                        let bills: any = groupedBills[i];
                        AmountPaid += bills.AmountPaid;
                        UserId = bills.ReceiptGeneratedById;
                        User = bills.CreatedUser;
                        UserGroup[UserId] = UserGroup[UserId] || [];
                    }
                    let info = {
                        'OPDueAmount': AmountPaid,
                        'UserId': UserId,
                        'UserName': User
                    };
                    UserGroup[UserId].push(info);
                }
            }
        } else if (req.Data.UserId === 0) {
            let opbilldueInstance: any = await this.FindAll({
                attributes: ['AmountPaid', 'ReceiptGeneratedById'],
                where: {
                    ReceiptDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                    EncounterTypeId: { '$or': { '$eq': null, '$in': [1, 4] } },
                    BillTypeId: { '$in': [1, 5] },
                    ReceiptTypeId: 3,
                    IsPharmacyReceipt: 0,
                    // IsConsolidatePay: 0,
                    ReceiptStatusId: 1,
                    ReceiptGeneratedById: { '$gt': req.Data.UserId },
                    FacilityId: req.Data.FacilityId,

                },
                include: [UserGroupJoin]
            });
            if (opbilldueInstance) {
                let groupbills = _.groupBy(opbilldueInstance, 'ReceiptGeneratedById');
                for (let i in groupbills) {
                    let groupedBills = groupbills[i];
                    let AmountPaid: number = 0;
                    let UserId: number = 0;
                    let User: string = '';
                    for (let i = 0; i < groupedBills.length; i++) {
                        let bills: any = groupedBills[i];
                        AmountPaid += bills.AmountPaid;
                        UserId = bills.ReceiptGeneratedById;
                        User = bills.CreatedUser;
                        UserGroup[UserId] = UserGroup[UserId] || [];
                    }
                    let info = {
                        'OPDueAmount': AmountPaid,
                        'UserId': UserId,
                        'UserName': User
                    };
                    UserGroup[UserId].push(info);
                }
            }
        }
        return UserGroup;
    }

    public async IPUserDuePaymentDetails(req: BaseRequest): Promise<any> {
        let UserGroup: { [id: number]: any[] } = {};
        let UserGroupJoin: any = {
            model: this.Models.User, as: 'CreatedUser',
            attributes: ['FirstName', 'LastName'],
            required: true,
            include: [
                this.GetReference('Title')
            ]
        };
        if (req.Data.UserId > 0) {
            let opbilldueInstance: any = await this.FindAll({
                attributes: ['AmountPaid', 'ReceiptGeneratedById'],
                where: {
                    ReceiptDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                    EncounterTypeId: { '$or': { '$eq': null, '$in': [2] } },
                    // BillTypeId: { '$in': [1, 5] },
                    ReceiptTypeId: 3,
                    IsPharmacyReceipt: 0,
                    // IsConsolidatePay: 0,
                    ReceiptStatusId: 1,
                    ReceiptGeneratedById: { '$eq': req.Data.UserId },
                    FacilityId: req.Data.FacilityId,

                },
                include: [UserGroupJoin]
            });
            if (opbilldueInstance) {
                let groupbills = _.groupBy(opbilldueInstance, 'ReceiptGeneratedById');
                for (let i in groupbills) {
                    let groupedBills = groupbills[i];
                    let AmountPaid: number = 0;
                    let UserId: number = 0;
                    let User: string = '';
                    for (let i = 0; i < groupedBills.length; i++) {
                        let bills: any = groupedBills[i];
                        AmountPaid += bills.AmountPaid;
                        UserId = bills.ReceiptGeneratedById;
                        User = bills.CreatedUser;
                        UserGroup[UserId] = UserGroup[UserId] || [];
                    }
                    let info = {
                        'IPDueAmount': AmountPaid,
                        'UserId': UserId,
                        'UserName': User
                    };
                    UserGroup[UserId].push(info);
                }
            }
        } else if (req.Data.UserId === 0) {
            let opbilldueInstance: any = await this.FindAll({
                attributes: ['AmountPaid', 'ReceiptGeneratedById'],
                where: {
                    ReceiptDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                    EncounterTypeId: { '$or': { '$eq': null, '$in': [2] } },
                    // BillTypeId: { '$in': [1, 5] },
                    ReceiptTypeId: 3,
                    IsPharmacyReceipt: 0,
                    // IsConsolidatePay: 0,
                    ReceiptStatusId: 1,
                    ReceiptGeneratedById: { '$gt': req.Data.UserId },
                    FacilityId: req.Data.FacilityId,

                },
                include: [UserGroupJoin]
            });
            if (opbilldueInstance) {
                let groupbills = _.groupBy(opbilldueInstance, 'ReceiptGeneratedById');
                for (let i in groupbills) {
                    let groupedBills = groupbills[i];
                    let AmountPaid: number = 0;
                    let UserId: number = 0;
                    let User: string = '';
                    for (let i = 0; i < groupedBills.length; i++) {
                        let bills: any = groupedBills[i];
                        AmountPaid += bills.AmountPaid;
                        UserId = bills.ReceiptGeneratedById;
                        User = bills.CreatedUser;
                        UserGroup[UserId] = UserGroup[UserId] || [];
                    }
                    let info = {
                        'IPDueAmount': AmountPaid,
                        'UserId': UserId,
                        'UserName': User
                    };
                    UserGroup[UserId].push(info);
                }
            }
        }
        return UserGroup;
    }

    public async GetOverallCollectionCashier(req: BaseRequest): Promise<any> {
        let result: any = [];
        let refundBO = BoFactory.GetBo(billingbo.PatientRefundBo, this.Request);
        let billBO = BoFactory.GetBo(billingbo.PatientBillsBo, this.Request);
        let doctorBO = BoFactory.GetBo(doctorinvoicebo.DoctorPaymentBo, this.Request);
        result.push({ Key: 1, Value: await this.OverallPaymentDetails(req) });
        result.push({ Key: 2, Value: await refundBO.OverallRefundDetails(req) });
        result.push({ Key: 3, Value: await billBO.OverallBills(req) });
        result.push({ Key: 4, Value: await doctorBO.DoctorpaymentBills(req) });
        return result;
    }
    public async OverallPaymentDetails(req: BaseRequest): Promise<any> {
        let UserGroup: { [id: number]: any[] } = {};
        let UserGroupJoin: any = {
            model: this.Models.User, as: 'CreatedUser',
            attributes: ['FirstName', 'LastName'],
            required: true,
            include: [
                this.GetReference('Title')
            ]
        };
        if (req.Data.UserId > 0) {
            let opbillamountcashInstance: any = await this.FindAll({
                attributes: ['AmountPaid', 'ReceiptGeneratedById'],
                where: {
                    ReceiptDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                    // EncounterTypeId: { '$or': { '$eq': null, '$in': [0,1, 2, 4] } },
                    BillTypeId: { '$ne': [6] },
                    // IsPharmacyReceipt: 0,
                    // IsConsolidatePay: 0,
                    ReceiptStatusId: 1,
                    ReceiptGeneratedById: { '$eq': req.Data.UserId },
                    FacilityId: req.Data.FacilityId,
                    PaymentTypeId: 1,
                },
                include: [UserGroupJoin]
            });
            if (opbillamountcashInstance) {
                let groupbills = _.groupBy(opbillamountcashInstance, 'ReceiptGeneratedById');
                for (let i in groupbills) {
                    let groupedBills = groupbills[i];
                    let AmountPaid: number = 0;
                    let UserId: number = 0;
                    let User: string = '';
                    for (let i = 0; i < groupedBills.length; i++) {
                        let bills: any = groupedBills[i];
                        AmountPaid += bills.AmountPaid;
                        UserId = bills.ReceiptGeneratedById;
                        User = bills.CreatedUser;
                        UserGroup[UserId] = UserGroup[UserId] || [];
                    }
                    let info = {
                        'CashAmount': AmountPaid,
                        'UserId': UserId,
                        'UserName': User
                    };
                    UserGroup[UserId].push(info);
                }
            }
        } else if (req.Data.UserId === 0) {
            let opbillamountcashInstance: any = await this.FindAll({
                attributes: ['AmountPaid', 'ReceiptGeneratedById'],
                where: {
                    ReceiptDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                    // EncounterTypeId: { '$or': { '$eq': null, '$in': [1, 2, 4] } },
                    BillTypeId: { '$ne': [6] },
                    // IsPharmacyReceipt: 0,
                    // IsConsolidatePay: 0,
                    ReceiptStatusId: 1,
                    ReceiptGeneratedById: { '$gt': req.Data.UserId },
                    FacilityId: req.Data.FacilityId,
                    PaymentTypeId: 1,
                },
                include: [UserGroupJoin]
            });
            if (opbillamountcashInstance) {
                let groupbills = _.groupBy(opbillamountcashInstance, 'ReceiptGeneratedById');
                for (let i in groupbills) {
                    let groupedBills = groupbills[i];
                    let AmountPaid: number = 0;
                    let UserId: number = 0;
                    let User: string = '';
                    for (let i = 0; i < groupedBills.length; i++) {
                        let bills: any = groupedBills[i];
                        AmountPaid += bills.AmountPaid;
                        UserId = bills.ReceiptGeneratedById;
                        User = bills.CreatedUser;
                        UserGroup[UserId] = UserGroup[UserId] || [];
                    }
                    let info = {
                        'CashAmount': AmountPaid,
                        'UserId': UserId,
                        'UserName': User
                    };
                    UserGroup[UserId].push(info);
                }
            }
        }
        if (req.Data.UserId > 0) {
            let opbillamountcardInstance: any = await this.FindAll({
                attributes: ['AmountPaid', 'ReceiptGeneratedById'],
                where: {
                    ReceiptDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                    // EncounterTypeId: { '$or': { '$eq': null, '$in': [1, 2, 4] } },
                    BillTypeId: { '$ne': [6] },
                    // IsPharmacyReceipt: 0,
                    // IsConsolidatePay: 0,
                    ReceiptStatusId: 1,
                    ReceiptGeneratedById: { '$eq': req.Data.UserId },
                    FacilityId: req.Data.FacilityId,
                    PaymentTypeId: { '$in': [5, 6] }
                },
                include: [UserGroupJoin]
            });
            if (opbillamountcardInstance) {
                let groupbills = _.groupBy(opbillamountcardInstance, 'ReceiptGeneratedById');
                for (let i in groupbills) {
                    let groupedBills = groupbills[i];
                    let AmountPaid: number = 0;
                    let UserId: number = 0;
                    let User: string = '';
                    for (let i = 0; i < groupedBills.length; i++) {
                        let bills: any = groupedBills[i];
                        AmountPaid += bills.AmountPaid;
                        UserId = bills.ReceiptGeneratedById;
                        User = bills.CreatedUser;
                        UserGroup[UserId] = UserGroup[UserId] || [];
                    }
                    let info = {
                        'CardAmount': AmountPaid,
                        'UserId': UserId,
                        'UserName': User
                    };
                    UserGroup[UserId].push(info);
                }
            }
        } else if (req.Data.UserId === 0) {
            let opbillamountcardInstance: any = await this.FindAll({
                attributes: ['AmountPaid', 'ReceiptGeneratedById'],
                where: {
                    ReceiptDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                    // EncounterTypeId: { '$or': { '$eq': null, '$in': [1, 2, 4] } },
                    BillTypeId: { '$ne': [6] },
                    // IsPharmacyReceipt: 0,
                    // IsConsolidatePay: 0,
                    ReceiptStatusId: 1,
                    ReceiptGeneratedById: { '$gt': req.Data.UserId },
                    FacilityId: req.Data.FacilityId,
                    PaymentTypeId: { '$in': [5, 6] }
                },
                include: [UserGroupJoin]
            });
            if (opbillamountcardInstance) {
                let groupbills = _.groupBy(opbillamountcardInstance, 'ReceiptGeneratedById');
                for (let i in groupbills) {
                    let groupedBills = groupbills[i];
                    let AmountPaid: number = 0;
                    let UserId: number = 0;
                    let User: string = '';
                    for (let i = 0; i < groupedBills.length; i++) {
                        let bills: any = groupedBills[i];
                        AmountPaid += bills.AmountPaid;
                        UserId = bills.ReceiptGeneratedById;
                        User = bills.CreatedUser;
                        UserGroup[UserId] = UserGroup[UserId] || [];
                    }
                    let info = {
                        'CardAmount': AmountPaid,
                        'UserId': UserId,
                        'UserName': User
                    };
                    UserGroup[UserId].push(info);
                }
            }
        }
        if (req.Data.UserId > 0) {
            let opbillamountotherInstance: any = await this.FindAll({
                attributes: ['AmountPaid', 'ReceiptGeneratedById'],
                where: {
                    ReceiptDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                    // EncounterTypeId: { '$or': { '$eq': null, '$in': [1, 2, 4] } },
                    BillTypeId: { '$ne': [6] },
                    // IsPharmacyReceipt: 0,
                    // IsConsolidatePay: 0,
                    ReceiptStatusId: 1,
                    ReceiptGeneratedById: { '$eq': req.Data.UserId },
                    FacilityId: req.Data.FacilityId,
                    PaymentTypeId: { '$notIn': [1, 5, 6] }
                },
                include: [UserGroupJoin]
            });
            if (opbillamountotherInstance) {
                let groupbills = _.groupBy(opbillamountotherInstance, 'ReceiptGeneratedById');
                for (let i in groupbills) {
                    let groupedBills = groupbills[i];
                    let AmountPaid: number = 0;
                    let UserId: number = 0;
                    let User: string = '';
                    for (let i = 0; i < groupedBills.length; i++) {
                        let bills: any = groupedBills[i];
                        AmountPaid += bills.AmountPaid;
                        UserId = bills.ReceiptGeneratedById;
                        User = bills.CreatedUser;
                        UserGroup[UserId] = UserGroup[UserId] || [];
                    }
                    let info = {
                        'OtherAmount': AmountPaid,
                        'UserId': UserId,
                        'UserName': User
                    };
                    UserGroup[UserId].push(info);
                }
            }
        } else if (req.Data.UserId === 0) {
            let opbillamountotherInstance: any = await this.FindAll({
                attributes: ['AmountPaid', 'ReceiptGeneratedById'],
                where: {
                    ReceiptDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                    // EncounterTypeId: { '$or': { '$eq': null, '$in': [1, 2, 4] } },
                    BillTypeId: { '$ne': [6] },
                    // IsPharmacyReceipt: 0,
                    // IsConsolidatePay: 0,
                    ReceiptStatusId: 1,
                    ReceiptGeneratedById: { '$gt': req.Data.UserId },
                    FacilityId: req.Data.FacilityId,
                    PaymentTypeId: { '$notIn': [1, 5, 6] }
                },
                include: [UserGroupJoin]
            });
            if (opbillamountotherInstance) {
                let groupbills = _.groupBy(opbillamountotherInstance, 'ReceiptGeneratedById');
                for (let i in groupbills) {
                    let groupedBills = groupbills[i];
                    let AmountPaid: number = 0;
                    let UserId: number = 0;
                    let User: string = '';
                    for (let i = 0; i < groupedBills.length; i++) {
                        let bills: any = groupedBills[i];
                        AmountPaid += bills.AmountPaid;
                        UserId = bills.ReceiptGeneratedById;
                        User = bills.CreatedUser;
                        UserGroup[UserId] = UserGroup[UserId] || [];
                    }
                    let info = {
                        'OtherAmount': AmountPaid,
                        'UserId': UserId,
                        'UserName': User
                    };
                    UserGroup[UserId].push(info);
                }
            }
        }
        return UserGroup;
    }

    public async GetSystemDatetime(req: BaseRequest): Promise<Date> {
        return new Date();
    }

    public async ModifyPatientPaymentDetails(req: BaseRequest):
        Promise<boolean> {
        let details: any = req.Data || [];
        let PatientBillId = -1;
        let BillDiscountModeId: number = 0;
        let TotBillAmt: number = 0;
        let TotBillDiscAmt: number = 0;
        let TotGstAmount: number = 0;
        let TotInGstAmount: number = 0;
        let TotCGstAmount: number = 0;
        let TotSGstAmount: number = 0;
        let TotalAmtPaid: number = 0;
        let TDSAmount: number = 0;
        let Disallowance: number = 0;
        let TotAdvanceAmt: number = 0;

        let BillDateTime: any = null;
        let EncounterId: number = 0;
        let DOA: any = null;
        let DOD: any = null;
        let GuarantorId: any = null;
        let GuarantorTypeId: any = null;

        if (details.length > 0) {
            let ipbilladvamountInstance: any = await this.Find({
                attributes: [
                    [this.Dal.fn('SUM', this.Dal.col('AmountPaid')), 'AdvanceAmt'],
                ],
                where: {
                    ReceiptTypeId: 1,
                    Status: 1,
                    ReceiptStatusId: 1,
                    EncounterId: details[0].EncounterId
                }
            });
            if (ipbilladvamountInstance) {
                let bill: any = this.GetAttribute(ipbilladvamountInstance);
                TotAdvanceAmt = bill['AdvanceAmt'];
            }
            TotalAmtPaid += TotAdvanceAmt;
        }

        await Promise.all(details.map((DetailItem: any): Promise<void> => {
            return (async (detail): Promise<void> => {
                detail.Id = detail.Id || 0;
                EncounterId = detail.EncounterId;
                PatientBillId = detail.PatientBillId;
                BillDiscountModeId = detail.DiscModeId;
                if (!detail.AmountPaid) detail.AmountPaid = 0;
                if (!detail.Disallowance) detail.Disallowance = 0;
                if (!detail.TDSAmount) detail.TDSAmount = 0;
                if (!BillDateTime) BillDateTime = detail.BillDateTime;
                if (!DOA) DOA = detail.DOA;
                if (!DOD) DOD = detail.DOD;
                if (!GuarantorId) GuarantorId = detail.GuarantorId;
                if (!GuarantorTypeId) GuarantorTypeId = detail.GuarantorTypeId;

                try { TotBillAmt = parseFloat(detail.TotBillAmt); } catch (ex) { TotBillAmt += 0; }
                try { TotBillDiscAmt = parseFloat(detail.TotBillDiscAmt); } catch (ex) { TotBillDiscAmt += 0; }
                try { TotalAmtPaid += parseFloat(detail.AmountPaid); } catch (ex) { TotalAmtPaid += 0; }
                try { Disallowance += parseFloat(detail.Disallowance); } catch (ex) { Disallowance += 0; }
                try { TDSAmount += parseFloat(detail.TDSAmount); } catch (ex) { TDSAmount += 0; }
                try { TotGstAmount = parseFloat(detail.TotGstAmt); } catch (ex) { TotGstAmount += 0; }
                try { TotInGstAmount = parseFloat(detail.TotInGstAmt); } catch (ex) { TotInGstAmount += 0; }
                try { TotCGstAmount = parseFloat(detail.TotCGstAmt); } catch (ex) { TotCGstAmount += 0; }
                try { TotSGstAmount = parseFloat(detail.TotSGstAmt); } catch (ex) { TotSGstAmount += 0; }
                if (detail.Id > 0) {
                    await this.Update(detail);
                }
            })(DetailItem);
        }));


        if (PatientBillId) {
            let billBO = BoFactory.GetBo(billingbo.PatientBillsBo, this.Request);
            let PatientBill = await billBO.GetPatientBillsById({ Id: PatientBillId });
            EncounterId = PatientBill.EncounterId;
            PatientBill.BillDateTime = BillDateTime;
            PatientBill.BillAmount = TotBillAmt;
            PatientBill.GSTAmount = TotGstAmount;
            PatientBill.InGstAmount = TotInGstAmount;
            PatientBill.CGstAmount = TotCGstAmount;
            PatientBill.SGstAmount = TotSGstAmount;
            PatientBill.BillDiscountModeId = BillDiscountModeId;
            PatientBill.BillDiscount = TotBillDiscAmt;
            if (((TotBillAmt - TotBillDiscAmt) - TotalAmtPaid) > 0) {
                PatientBill.OutStandingAmount = ((TotBillAmt - TotBillDiscAmt) - TotalAmtPaid) - PatientBill.RefundAmount;
            } else {
                PatientBill.OutStandingAmount = 0;
            }
            PatientBill.PaidAmount = TotalAmtPaid;
            PatientBill.TDSAmount = TDSAmount;
            PatientBill.Disallowed = Disallowance;
            PatientBill.IsPaidFully = PatientBill.OutStandingAmount === 0;
            if (!PatientBill.IsPaidFully) PatientBill.FSTypeId = 3;
            await billBO.Update(PatientBill);
        }
        if (EncounterId && DOA && GuarantorId) {
            let encounterBo = BoFactory.GetBo(encbo.EncounterBo, this.Request);
            let encounterData = await encounterBo.GetEncounterById({ Id: EncounterId });
            if (DOA) encounterData.AdmissionDate = DOA;
            if (DOD) encounterData.DischargeDate = DOD;
            if (GuarantorId) encounterData.GuarantorId = GuarantorId;
            if (GuarantorTypeId) encounterData.GuarantorTypeId = GuarantorTypeId;
            await encounterBo.Update(encounterData);
        }

        return true;
    }

    public async BIReportOverAllCollection(req: BaseRequest): Promise<any> {

        let BIRptCollection: any = {};
        for (let j = 0, len = req.Data.length; j < len; j++) {
            let frmdt = req.Data[j].DispDate;

            if (!BIRptCollection[frmdt]) BIRptCollection[frmdt] = {};

            let overallcashinst: any = await this.Find({
                attributes: [
                    [this.Dal.fn('SUM', this.Dal.col('AmountPaid')), 'TotalAmountPaid'],
                ],
                where: {
                    ReceiptDateTime: { '$gt': req.Data[j].FromDate, '$lte': req.Data[j].ToDate },
                    PaymentTypeId: 1,
                    ReceiptStatusId: 1,
                    FacilityId: req.Data[j].FacilityId
                }
            });
            if (overallcashinst) {
                let bill: any = this.GetAttribute(overallcashinst);
                BIRptCollection[frmdt]['TotalCashAmount'] = bill['TotalAmountPaid'];
            }

            let overallcardinst: any = await this.Find({
                attributes: [
                    [this.Dal.fn('SUM', this.Dal.col('AmountPaid')), 'TotalAmountPaid'],
                ],
                where: {
                    ReceiptDateTime: { '$gt': req.Data[j].FromDate, '$lte': req.Data[j].ToDate },
                    ReceiptStatusId: 1,
                    FacilityId: req.Data[j].FacilityId,
                    PaymentTypeId: { '$in': [5, 6] }
                }
            });
            if (overallcardinst) {
                let bill: any = this.GetAttribute(overallcardinst);
                BIRptCollection[frmdt]['TotalCardAmount'] = bill['TotalAmountPaid'];
            }

            let overallotherinst: any = await this.Find({
                attributes: [
                    [this.Dal.fn('SUM', this.Dal.col('AmountPaid')), 'TotalAmountPaid'],
                ],
                where: {
                    ReceiptDateTime: { '$gt': req.Data[j].FromDate, '$lte': req.Data[j].ToDate },
                    ReceiptStatusId: 1,
                    FacilityId: req.Data[j].FacilityId,
                    PaymentTypeId: { '$notIn': [1, 5, 6] }
                }
            });
            if (overallotherinst) {
                let bill: any = this.GetAttribute(overallotherinst);
                BIRptCollection[frmdt]['TotalOtherAmount'] = bill['TotalAmountPaid'];
            }

            let refundBo = BoFactory.GetBo(billingbo.PatientRefundBo, this.Request);
            let newreq: any = {
                Data: []
            };
            newreq.Data = req.Data[j];
            BIRptCollection[frmdt]['Refund'] = await refundBo.OPRefundDetails(newreq);

            let overallcancelcashinst: any = await this.Find({
                attributes: [
                    [this.Dal.fn('SUM', this.Dal.col('AmountPaid')), 'TotalAmountPaid'],
                ],
                where: {
                    ReceiptDateTime: { '$gt': req.Data[j].FromDate, '$lte': req.Data[j].ToDate },
                    PaymentTypeId: 1,
                    ReceiptStatusId: 3,
                    FacilityId: req.Data[j].FacilityId
                }
            });
            if (overallcancelcashinst) {
                let bill: any = this.GetAttribute(overallcancelcashinst);
                BIRptCollection[frmdt]['TotalCancelCashAmount'] = bill['TotalAmountPaid'];
            }

            let overallcancelcardinst: any = await this.Find({
                attributes: [
                    [this.Dal.fn('SUM', this.Dal.col('AmountPaid')), 'TotalAmountPaid'],
                ],
                where: {
                    ReceiptDateTime: { '$gt': req.Data[j].FromDate, '$lte': req.Data[j].ToDate },
                    PaymentTypeId: { '$in': [5, 6] },
                    ReceiptStatusId: 3,
                    FacilityId: req.Data[j].FacilityId,
                }
            });
            if (overallcancelcardinst) {
                let bill: any = this.GetAttribute(overallcancelcardinst);
                BIRptCollection[frmdt]['TotalCancelCardAmount'] = bill['TotalAmountPaid'];
            }

            let overallcancelotherinst: any = await this.Find({
                attributes: [
                    [this.Dal.fn('SUM', this.Dal.col('AmountPaid')), 'TotalAmountPaid'],
                ],
                where: {
                    ReceiptDateTime: { '$gt': req.Data[j].FromDate, '$lte': req.Data[j].ToDate },
                    PaymentTypeId: { '$notIn': [1, 5, 6] },
                    ReceiptStatusId: 3,
                    FacilityId: req.Data[j].FacilityId,
                }
            });
            if (overallcancelotherinst) {
                let bill: any = this.GetAttribute(overallcancelotherinst);
                BIRptCollection[frmdt]['TotalCancelOtherAmount'] = bill['TotalAmountPaid'];
            }

            let opbillamountInstance: any = await this.Find({
                attributes: [
                    [this.Dal.fn('SUM', this.Dal.col('AmountPaid')), 'TotalAmountPaid'],
                ],
                where: {
                    ReceiptDateTime: { '$gt': req.Data[j].FromDate, '$lte': req.Data[j].ToDate },
                    EncounterTypeId: { '$or': { '$eq': null, '$in': [1, 4] } },
                    IsPharmacyReceipt: 0,
                    IsConsolidatePay: 0,
                    ReceiptStatusId: 3,
                    FacilityId: req.Data[j].FacilityId
                }
            });
            if (opbillamountInstance) {
                let bill: any = this.GetAttribute(opbillamountInstance);
                BIRptCollection[frmdt]['OPBillAmt'] = bill['TotalAmountPaid'];
            }

            let ipbillamountInstance: any = await this.Find({
                attributes: [
                    [this.Dal.fn('SUM', this.Dal.col('AmountPaid')), 'TotalAmountPaid'],
                ],
                where: {
                    ReceiptDateTime: { '$gt': req.Data[j].FromDate, '$lte': req.Data[j].ToDate },
                    EncounterTypeId: { '$or': { '$in': [2] } },
                    IsPharmacyReceipt: 0,
                    IsConsolidatePay: 0,
                    ReceiptStatusId: 3,
                    FacilityId: req.Data[j].FacilityId
                }
            });
            if (ipbillamountInstance) {
                let bill: any = this.GetAttribute(ipbillamountInstance);
                BIRptCollection[frmdt]['IPReceipt'] = bill['TotalAmountPaid'];
            }

            let ipbilladvamountInstance: any = await this.Find({
                attributes: [
                    [this.Dal.fn('SUM', this.Dal.col('AmountPaid')), 'TotalAmountPaid'],
                ],
                where: {
                    ReceiptDateTime: { '$gt': req.Data[j].FromDate, '$lte': req.Data[j].ToDate },
                    ReceiptTypeId: 1,
                    ReceiptStatusId: 3,
                    FacilityId: req.Data[j].FacilityId
                }
            });
            if (ipbilladvamountInstance) {
                let bill: any = this.GetAttribute(ipbilladvamountInstance);
                BIRptCollection[frmdt]['IPAdvance'] = bill['TotalAmountPaid'];
            }

            let ipbilldueamountInstance: any = await this.Find({
                attributes: [
                    [this.Dal.fn('SUM', this.Dal.col('AmountPaid')), 'TotalAmountPaid'],
                ],
                where: {
                    ReceiptDateTime: { '$gt': req.Data[j].FromDate, '$lte': req.Data[j].ToDate },
                    ReceiptTypeId: 3,
                    ReceiptStatusId: 3,
                    FacilityId: req.Data[j].FacilityId
                }
            });
            if (ipbilldueamountInstance) {
                let bill: any = this.GetAttribute(ipbilldueamountInstance);
                BIRptCollection[frmdt]['DueAmount'] = bill['TotalAmountPaid'];
            }

        }

        return BIRptCollection;

    }

    private async OPBillPaymentDetails(req: BaseRequest): Promise<any> {
        let OPBillResult: any = {};
        OPBillResult['DisplayOrder'] = 1;
        let storeId: any;
        if (req.Data.StoreMasterId > 0) {
            storeId = req.Data.StoreMasterId;
        } else {
            storeId = { '$gt': 0 };
        }
        let opbillamountInstance: any = await this.Find({
            attributes: [
                [this.Dal.fn('SUM', this.Dal.col('AmountPaid')), 'TotalAmountPaid'],
            ],
            where: {
                ReceiptDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                EncounterTypeId: { '$or': { '$eq': null, '$in': [1, 4] } },
                IsPharmacyReceipt: 0,
                IsConsolidatePay: 0,
                ReceiptStatusId: 1,
                FacilityId: req.Data.FacilityId,
                StoreMasterId: storeId,
            }
        });
        if (opbillamountInstance) {
            let bill: any = this.GetAttribute(opbillamountInstance);
            OPBillResult['BillAmount'] = bill['TotalAmountPaid'];
        }

        let opbillamountcashInstance: any = await this.Find({
            attributes: [
                [this.Dal.fn('SUM', this.Dal.col('AmountPaid')), 'TotalAmountPaid'],
            ],
            where: {
                ReceiptDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                EncounterTypeId: { '$or': { '$eq': null, '$in': [1, 4] } },
                IsPharmacyReceipt: 0,
                IsConsolidatePay: 0,
                ReceiptStatusId: 1,
                FacilityId: req.Data.FacilityId,
                StoreMasterId: storeId,
                PaymentTypeId: 1,
            }
        });
        if (opbillamountcashInstance) {
            let bill: any = this.GetAttribute(opbillamountcashInstance);
            OPBillResult['CashAmount'] = bill['TotalAmountPaid'];
        }

        let opbillamountcardInstance: any = await this.Find({
            attributes: [
                [this.Dal.fn('SUM', this.Dal.col('AmountPaid')), 'TotalAmountPaid'],
            ],
            where: {
                ReceiptDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                EncounterTypeId: { '$or': { '$eq': null, '$in': [1, 4] } },
                IsPharmacyReceipt: 0,
                IsConsolidatePay: 0,
                ReceiptStatusId: 1,
                FacilityId: req.Data.FacilityId,
                StoreMasterId: storeId,
                PaymentTypeId: { '$in': [5, 6] }
            }
        });
        if (opbillamountcardInstance) {
            let bill: any = this.GetAttribute(opbillamountcardInstance);
            OPBillResult['CardAmount'] = bill['TotalAmountPaid'];
        }

        let opbillamountotherInstance: any = await this.Find({
            attributes: [
                [this.Dal.fn('SUM', this.Dal.col('AmountPaid')), 'TotalAmountPaid'],
            ],
            where: {
                ReceiptDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                EncounterTypeId: { '$or': { '$eq': null, '$in': [1, 4] } },
                IsPharmacyReceipt: 0,
                IsConsolidatePay: 0,
                ReceiptStatusId: 1,
                FacilityId: req.Data.FacilityId,
                StoreMasterId: storeId,
                PaymentTypeId: { '$notIn': [1, 5, 6] }
            }
        });
        if (opbillamountotherInstance) {
            let bill: any = this.GetAttribute(opbillamountotherInstance);
            OPBillResult['OtherAmount'] = bill['TotalAmountPaid'];
        }

        return OPBillResult;
    }

    private async IPSelfPaymentDetails(req: BaseRequest): Promise<any> {
        let IPSelfResult: any = {};
        IPSelfResult['DisplayOrder'] = 2;
        let GuarantorId_ = 1;
        // let CurrentFacilityId = req.Data.FacilityId;
        // if (!CurrentFacilityId) CurrentFacilityId = 1;
        // GuarantorId_ = 1000 * CurrentFacilityId;
        let GuarantorJoin = {
            model: this.Models.Guarantor,
            attributes: ['Id'],
            required: true,
            where: {
                GuarantorId: GuarantorId_
            }
        };
        let storeId: any;
        if (req.Data.StoreMasterId > 0) {
            storeId = req.Data.StoreMasterId;
        } else {
            storeId = { '$gt': 0 };
        }
        let IPBillSelfamountInstance: any = await this.Find({
            attributes: [
                [this.Dal.fn('SUM', this.Dal.col('AmountPaid')), 'TotalAmountPaid'],
            ],
            where: {
                ReceiptDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                EncounterTypeId: 2,
                IsPharmacyReceipt: 0,
                IsConsolidatePay: 0,
                FacilityId: req.Data.FacilityId,
                StoreMasterId: storeId,
                ReceiptStatusId: 1
            },
            include: [GuarantorJoin]
        });
        if (IPBillSelfamountInstance) {
            let bill: any = this.GetAttribute(IPBillSelfamountInstance);
            IPSelfResult['BillAmount'] = bill['TotalAmountPaid'];
        }

        let IPBillSelfamountcashInstance: any = await this.Find({
            attributes: [
                [this.Dal.fn('SUM', this.Dal.col('AmountPaid')), 'TotalAmountPaid'],
            ],
            where: {
                ReceiptDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                EncounterTypeId: 2,
                IsPharmacyReceipt: 0,
                IsConsolidatePay: 0,
                FacilityId: req.Data.FacilityId,
                PaymentTypeId: 1,
                StoreMasterId: storeId,
                ReceiptStatusId: 1
            },
            include: [GuarantorJoin]
        });
        if (IPBillSelfamountcashInstance) {
            let bill: any = this.GetAttribute(IPBillSelfamountcashInstance);
            IPSelfResult['CashAmount'] = bill['TotalAmountPaid'];
        }

        let IPBillSelfamountcardInstance: any = await this.Find({
            attributes: [
                [this.Dal.fn('SUM', this.Dal.col('AmountPaid')), 'TotalAmountPaid'],
            ],
            where: {
                ReceiptDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                EncounterTypeId: 2,
                IsPharmacyReceipt: 0,
                IsConsolidatePay: 0,
                FacilityId: req.Data.FacilityId,
                PaymentTypeId: { '$in': [5, 6] },
                StoreMasterId: storeId,
                ReceiptStatusId: 1
            },
            include: [GuarantorJoin]
        });
        if (IPBillSelfamountcardInstance) {
            let bill: any = this.GetAttribute(IPBillSelfamountcardInstance);
            IPSelfResult['CardAmount'] = bill['TotalAmountPaid'];
        }

        let IPBillSelfamountotherInstance: any = await this.Find({
            attributes: [
                [this.Dal.fn('SUM', this.Dal.col('AmountPaid')), 'TotalAmountPaid'],
            ],
            where: {
                ReceiptDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                EncounterTypeId: 2,
                IsPharmacyReceipt: 0,
                IsConsolidatePay: 0,
                FacilityId: req.Data.FacilityId,
                PaymentTypeId: { '$notIn': [1, 5, 6] },
                StoreMasterId: storeId,
                ReceiptStatusId: 1
            },
            include: [GuarantorJoin]
        });
        if (IPBillSelfamountotherInstance) {
            let bill: any = this.GetAttribute(IPBillSelfamountotherInstance);
            IPSelfResult['OtherAmount'] = bill['TotalAmountPaid'];
        }

        return IPSelfResult;
    }

    private async IPInsurancePaymentDetails(req: BaseRequest): Promise<any> {
        let IPSelfResult: any = {};
        IPSelfResult['DisplayOrder'] = 3;
        let GuarantorId_ = 1;
        // let CurrentFacilityId = req.Data.FacilityId;
        // if (!CurrentFacilityId) CurrentFacilityId = 1;
        // GuarantorId_ = 1 * CurrentFacilityId;
        let GuarantorJoin = {
            model: this.Models.Guarantor,
            attributes: ['Id'],
            required: true,
            where: {
                GuarantorId: { '$ne': GuarantorId_ }
            }
        };
        let storeId: any;
        if (req.Data.StoreMasterId > 0) {
            storeId = req.Data.StoreMasterId;
        } else {
            storeId = { '$gt': 0 };
        }
        let IPBillSelfamountInstance: any = await this.Find({
            attributes: [
                [this.Dal.fn('SUM', this.Dal.col('AmountPaid')), 'TotalAmountPaid'],
            ],
            where: {
                ReceiptDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                EncounterTypeId: 2,
                IsPharmacyReceipt: 0,
                IsConsolidatePay: 0,
                FacilityId: req.Data.FacilityId,
                StoreMasterId: storeId,
                ReceiptStatusId: 1
            },
            include: [GuarantorJoin]
        });
        if (IPBillSelfamountInstance) {
            let bill: any = this.GetAttribute(IPBillSelfamountInstance);
            IPSelfResult['BillAmount'] = bill['TotalAmountPaid'];
        }

        let IPBillSelfamountcashInstance: any = await this.Find({
            attributes: [
                [this.Dal.fn('SUM', this.Dal.col('AmountPaid')), 'TotalAmountPaid'],
            ],
            where: {
                ReceiptDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                EncounterTypeId: 2,
                IsPharmacyReceipt: 0,
                IsConsolidatePay: 0,
                FacilityId: req.Data.FacilityId,
                StoreMasterId: storeId,
                PaymentTypeId: 1,
                ReceiptStatusId: 1
            },
            include: [GuarantorJoin]
        });
        if (IPBillSelfamountcashInstance) {
            let bill: any = this.GetAttribute(IPBillSelfamountcashInstance);
            IPSelfResult['CashAmount'] = bill['TotalAmountPaid'];
        }

        let IPBillSelfamountcardInstance: any = await this.Find({
            attributes: [
                [this.Dal.fn('SUM', this.Dal.col('AmountPaid')), 'TotalAmountPaid'],
            ],
            where: {
                ReceiptDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                EncounterTypeId: 2,
                IsPharmacyReceipt: 0,
                IsConsolidatePay: 0,
                FacilityId: req.Data.FacilityId,
                PaymentTypeId: { '$in': [5, 6] },
                StoreMasterId: storeId,
                ReceiptStatusId: 1
            },
            include: [GuarantorJoin]
        });
        if (IPBillSelfamountcardInstance) {
            let bill: any = this.GetAttribute(IPBillSelfamountcardInstance);
            IPSelfResult['CardAmount'] = bill['TotalAmountPaid'];
        }

        let IPBillSelfamountotherInstance: any = await this.Find({
            attributes: [
                [this.Dal.fn('SUM', this.Dal.col('AmountPaid')), 'TotalAmountPaid'],
            ],
            where: {
                ReceiptDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                EncounterTypeId: 2,
                IsPharmacyReceipt: 0,
                IsConsolidatePay: 0,
                FacilityId: req.Data.FacilityId,
                PaymentTypeId: { '$notIn': [1, 5, 6] },
                StoreMasterId: storeId,
                ReceiptStatusId: 1
            },
            include: [GuarantorJoin]
        });
        if (IPBillSelfamountotherInstance) {
            let bill: any = this.GetAttribute(IPBillSelfamountotherInstance);
            IPSelfResult['OtherAmount'] = bill['TotalAmountPaid'];
        }

        return IPSelfResult;
    }

    private async OPPharmacyPaymentDetails(req: BaseRequest): Promise<any> {
        let OPBillResult: any = {};
        OPBillResult['DisplayOrder'] = 10;
        let PatientBillJoin: any = {
            model: this.Models.PatientBills,
            attributes: ['Id'],
            required: true,
            where: {
                BillTypeId: 4,
                BillDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate }
            }
        };
        let storeId: any;
        if (req.Data.StoreMasterId > 0) {
            storeId = req.Data.StoreMasterId;
        } else {
            storeId = { '$gt': 0 };
        }
        let opbillamountInstance: any = await this.Find({
            attributes: [
                [this.Dal.fn('SUM', this.Dal.col('AmountPaid')), 'TotalAmountPaid'],
            ],
            where: {
                ReceiptDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                ReceiptTypeId: { '$in': [1, 2,] },
                IsPharmacyReceipt: true,
                ReceiptStatusId: 1,
                FacilityId: req.Data.FacilityId,
                StoreMasterId: storeId,
            },
            include: [PatientBillJoin]
        });
        if (opbillamountInstance) {
            let bill: any = this.GetAttribute(opbillamountInstance);
            OPBillResult['BillAmount'] = bill['TotalAmountPaid'];
        }

        let opbillamountcashInstance: any = await this.Find({
            attributes: [
                [this.Dal.fn('SUM', this.Dal.col('AmountPaid')), 'TotalAmountPaid'],
            ],
            where: {
                ReceiptDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                ReceiptStatusId: 1,
                IsPharmacyReceipt: true,
                FacilityId: req.Data.FacilityId,
                ReceiptTypeId: { '$in': [1, 2] },
                StoreMasterId: storeId,
                PaymentTypeId: 1,
            },
            include: [PatientBillJoin]
        });
        if (opbillamountcashInstance) {
            let bill: any = this.GetAttribute(opbillamountcashInstance);
            OPBillResult['CashAmount'] = bill['TotalAmountPaid'];
        }

        let opbillamountcardInstance: any = await this.Find({
            attributes: [
                [this.Dal.fn('SUM', this.Dal.col('AmountPaid')), 'TotalAmountPaid'],
            ],
            where: {
                ReceiptDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                ReceiptStatusId: 1,
                IsPharmacyReceipt: true,
                FacilityId: req.Data.FacilityId,
                ReceiptTypeId: { '$in': [1, 2] },
                StoreMasterId: storeId,
                PaymentTypeId: { '$in': [5, 6] }
            },
            include: [PatientBillJoin]
        });
        if (opbillamountcardInstance) {
            let bill: any = this.GetAttribute(opbillamountcardInstance);
            OPBillResult['CardAmount'] = bill['TotalAmountPaid'];
        }

        let opbillamountotherInstance: any = await this.Find({
            attributes: [
                [this.Dal.fn('SUM', this.Dal.col('AmountPaid')), 'TotalAmountPaid'],
            ],
            where: {
                ReceiptDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                ReceiptStatusId: 1,
                IsPharmacyReceipt: true,
                FacilityId: req.Data.FacilityId,
                ReceiptTypeId: { '$in': [1, 2] },
                StoreMasterId: storeId,
                PaymentTypeId: { '$notIn': [1, 5, 6] }
            },
            include: [PatientBillJoin]
        });
        if (opbillamountotherInstance) {
            let bill: any = this.GetAttribute(opbillamountotherInstance);
            OPBillResult['OtherAmount'] = bill['TotalAmountPaid'];
        }

        return OPBillResult;
    }

    private async UpdateRecNumber(req: any) {
        console.log('NEWLY GENERATED ' + req.Data.Header.BillNumber);
        // let patorderBo = BoFactory.GetBo(emrbo.PatientOrderBo, this.Request);
        let updaterecNumber: any = { ReceiptNumber: req.Data.ReceiptNumber };
        await this.Update(updaterecNumber, {
            fields: ['ReceiptNumber'],
            where: {
                PatientReceiptId: req.Data.PatientReceiptId
            }
        });
    }


    // private async OPConsolidatePayDetails(req: BaseRequest): Promise<any> {
    //     let OPBillResult: any = {};
    //     OPBillResult['DisplayOrder'] = 20;
    //     let PatientBillJoin: any = {
    //         model: this.Models.PatientBills,
    //         attributes: ['Id'],
    //         required: true,
    //         where: {
    //             BillTypeId: 4,
    //             BillDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate }
    //         }
    //     };

    //     let ConsolidateBillAmtPaid = 0;
    //     let DueBillAmtPaid = 0;

    //     let opbillamountInstance: any = await this.Find({
    //         attributes: [
    //             [this.Dal.fn('SUM', this.Dal.col('AmountPaid')), 'TotalAmountPaid'],
    //         ],
    //         where: {
    //             ReceiptDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
    //             ReceiptTypeId: { '$in': [1, 2] },
    //             ReceiptStatusId: 1,
    //             IsConsolidatePay: 1,
    //             FacilityId: req.Data.FacilityId
    //         },
    //         include: [PatientBillJoin]
    //     });
    //     if (opbillamountInstance) {
    //         let bill: any = this.GetAttribute(opbillamountInstance);
    //         ConsolidateBillAmtPaid = bill['TotalAmountPaid'];
    //     }

    //     let opduebillamountInstance: any = await this.Find({
    //         attributes: [
    //             [this.Dal.fn('SUM', this.Dal.col('AmountPaid')), 'TotalAmountPaid'],
    //         ],
    //         where: {
    //             ReceiptDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
    //             ReceiptTypeId: { '$in': [3] },
    //             ReceiptStatusId: 1,
    //             FacilityId: req.Data.FacilityId
    //         },
    //         include: [PatientBillJoin]
    //     });
    //     if (opduebillamountInstance) {
    //         let bill: any = this.GetAttribute(opduebillamountInstance);
    //         DueBillAmtPaid = bill['TotalAmountPaid'];
    //     }

    //     OPBillResult['BillAmount'] = ConsolidateBillAmtPaid + DueBillAmtPaid;


    //     let ConsolCashBillAmtPaid = 0;
    //     let DueCashBillAmtPaid = 0;

    //     let opbillamountcashInstance: any = await this.Find({
    //         attributes: [
    //             [this.Dal.fn('SUM', this.Dal.col('AmountPaid')), 'TotalAmountPaid'],
    //         ],
    //         where: {
    //             ReceiptDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
    //             ReceiptStatusId: 1,
    //             FacilityId: req.Data.FacilityId,
    //             ReceiptTypeId: { '$in': [1, 2] },
    //             PaymentTypeId: 1,
    //             IsConsolidatePay: 1
    //         },
    //         include: [PatientBillJoin]
    //     });
    //     if (opbillamountcashInstance) {
    //         let bill: any = this.GetAttribute(opbillamountcashInstance);
    //         ConsolCashBillAmtPaid = bill['TotalAmountPaid'];
    //     }

    //     let opbilldueamountcashInstance: any = await this.Find({
    //         attributes: [
    //             [this.Dal.fn('SUM', this.Dal.col('AmountPaid')), 'TotalAmountPaid'],
    //         ],
    //         where: {
    //             ReceiptDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
    //             ReceiptStatusId: 1,
    //             FacilityId: req.Data.FacilityId,
    //             ReceiptTypeId: { '$in': [3] },
    //             PaymentTypeId: 1,
    //             // IsConsolidatePay: 1
    //         },
    //         include: [PatientBillJoin]
    //     });
    //     if (opbilldueamountcashInstance) {
    //         let bill: any = this.GetAttribute(opbilldueamountcashInstance);
    //         DueCashBillAmtPaid = bill['TotalAmountPaid'];
    //     }

    //     OPBillResult['CashAmount'] = ConsolCashBillAmtPaid + DueCashBillAmtPaid;

    //     let ConsolCardBillAmtPaid = 0;
    //     let DueCardBillAmtPaid = 0;


    //     let opbillamountcardInstance: any = await this.Find({
    //         attributes: [
    //             [this.Dal.fn('SUM', this.Dal.col('AmountPaid')), 'TotalAmountPaid'],
    //         ],
    //         where: {
    //             ReceiptDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
    //             ReceiptStatusId: 1,
    //             FacilityId: req.Data.FacilityId,
    //             ReceiptTypeId: { '$in': [1, 2] },
    //             PaymentTypeId: { '$in': [5, 6] },
    //             IsConsolidatePay: 1
    //         },
    //         include: [PatientBillJoin]
    //     });
    //     if (opbillamountcardInstance) {
    //         let bill: any = this.GetAttribute(opbillamountcardInstance);
    //         ConsolCardBillAmtPaid = bill['TotalAmountPaid'];
    //     }

    //     let opbilldueamountcardInstance: any = await this.Find({
    //         attributes: [
    //             [this.Dal.fn('SUM', this.Dal.col('AmountPaid')), 'TotalAmountPaid'],
    //         ],
    //         where: {
    //             ReceiptDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
    //             ReceiptStatusId: 1,
    //             FacilityId: req.Data.FacilityId,
    //             ReceiptTypeId: { '$in': [3] },
    //             PaymentTypeId: { '$in': [5, 6] },

    //         },
    //         include: [PatientBillJoin]
    //     });
    //     if (opbilldueamountcardInstance) {
    //         let bill: any = this.GetAttribute(opbilldueamountcardInstance);
    //         DueCardBillAmtPaid = bill['TotalAmountPaid'];
    //     }

    //     OPBillResult['CardAmount'] = ConsolCardBillAmtPaid + DueCardBillAmtPaid;

    //     let ConsolOtherBillAmtPaid = 0;
    //     let DueOtherBillAmtPaid = 0;

    //     let opbillamountotherInstance: any = await this.Find({
    //         attributes: [
    //             [this.Dal.fn('SUM', this.Dal.col('AmountPaid')), 'TotalAmountPaid'],
    //         ],
    //         where: {
    //             ReceiptDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
    //             ReceiptStatusId: 1,
    //             FacilityId: req.Data.FacilityId,
    //             ReceiptTypeId: { '$in': [1, 2] },
    //             PaymentTypeId: { '$in': [3, 4, 2] },
    //             IsConsolidatePay: 1
    //         },
    //         include: [PatientBillJoin]
    //     });
    //     if (opbillamountotherInstance) {
    //         let bill: any = this.GetAttribute(opbillamountotherInstance);
    //         ConsolOtherBillAmtPaid = bill['TotalAmountPaid'];
    //     }

    //     let opbilldueamountotherInstance: any = await this.Find({
    //         attributes: [
    //             [this.Dal.fn('SUM', this.Dal.col('AmountPaid')), 'TotalAmountPaid'],
    //         ],
    //         where: {
    //             ReceiptDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
    //             ReceiptStatusId: 1,
    //             FacilityId: req.Data.FacilityId,
    //             ReceiptTypeId: { '$in': [3] },
    //             PaymentTypeId: { '$in': [3, 4, 2] },
    //             IsConsolidatePay: 1
    //         },
    //         include: [PatientBillJoin]
    //     });
    //     if (opbilldueamountotherInstance) {
    //         let bill: any = this.GetAttribute(opbilldueamountotherInstance);
    //         DueOtherBillAmtPaid = bill['TotalAmountPaid'];
    //     }

    //     OPBillResult['OtherAmount'] = ConsolOtherBillAmtPaid + DueOtherBillAmtPaid;

    //     return OPBillResult;
    // }





}
