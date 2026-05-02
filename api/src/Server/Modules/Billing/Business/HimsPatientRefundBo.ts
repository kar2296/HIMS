import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions, Report, FileInfo, Template } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest } from '../../../Common/Index';
import { PatientRefundInstance, PatientRefundAttributes } from '../Model/Interface/Index';
import { SequenceKeys } from '../../General/Common/Sequence.s';
import { PatientRefundFilters } from '../Common/Filters.e';
import { EncounterFilters } from '../../Visit/Common/Filters.e';
import { BoFactory } from '../../Base/Business/Index';
import * as billingbo from '../../Billing/Business/Index';
import * as regbo from '../../Registration/Business/Index';
import * as encbo from '../../Visit/Business/Index';
import * as userbo from '../../SystemSettings/Business/Index';
// import * as generalBO from '../../General/Business/Index';
import { join } from 'path';
import * as _ from 'lodash';
import { ReferenceValueFilters } from '../../SystemSettings/Common/Filters.e';
import * as generalMasterBo from '../../GeneralMaster/Business/Index';

export class PatientRefundBo extends BaseBo<PatientRefundInstance, PatientRefundAttributes> {
    public async AddPatientRefund(req: BaseRequest, creditNote?: number): Promise<number> {
        let generateRefund = 0;
        if (!req.Data.Header.RefundIdentifier && req.Data.Header.RefundStatusId === 1) {
            generateRefund = 1;
            req.Data.Header.RefundIdentifier = null; //await Sequence.Next(SequenceKeys.RefundNrId);
            req.Data.Header.RefundDateTime = new Date();
        }
        if (!req.Data.Header.FacilityId)
            req.Data.Header.FacilityId = this.Session.FacilityId;

        let result = await this.Save(req.Data.Header);
        let PatientRefundId = result.dataValues.Id;

        if (generateRefund === 1) {
            if (req.Data.Header.EncounterTypeId === 2) {
                this.deferSequenceKey(PatientRefundId, 'RefundIdentifier',
                    this.getFacilitySequenceIdentifier(SequenceKeys.IPRefundNrId,
                        req.Data.Header.FacilityId
                    ));
            } else {
                this.deferSequenceKey(PatientRefundId, 'RefundIdentifier',
                    this.getFacilitySequenceIdentifier(SequenceKeys.RefundNrId,
                        req.Data.Header.FacilityId
                    ));
            }

        }

        if (!req.Data.IsRefundApprove || req.Data.IsRefundApprove === false) {
            if (req.Data.Header.RefundStatusId === 1) {
                if (req.Data.Header.RefundTypeId !== 4) {
                    await this.ManageReceipt(req);// Update the Receipt Details if PatientReceiptId available
                    if (!req.Data.Header.IsFromFinalize)
                        await this.ManagePatientBill(req);// Update the Patient Bill if bill is Finalized with to be refunded
                } else if (req.Data.Header.RefundTypeId === 4)
                    if (!creditNote)
                        await this.ManagePatientBill(req);
            }
        }

        //console.log(req.Data.Details);
        let DetailBo = BoFactory.GetBo(billingbo.PatientRefundDetailsBo, this.Request);
        await DetailBo.ManagePatientRefundDetails(PatientRefundId, req.Data.Details);
        await this.sendRefundSms(req);
        return PatientRefundId;
    }

    public async sendRefundSms(req: any): Promise<boolean> {
        const patientBO = BoFactory.GetBo(regbo.PatientBo, this.Request);
        const patient: any = await patientBO.GetById(req.Data.Header.PatientId);
        if (patient) {
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
            let title = TitleData.Data[0].Description;
            let apiReq = {
                Id: 0,
                PageContext: { PageSize: 50, PageNumber: 1 },
                Params: [
                    { Key: ReferenceValueFilters.ReferenceGroupCode, Value: 'PaymentType' },
                    { Key: ReferenceValueFilters.ReferenceValueCodeId, Value: req.Data.Header.PaymentTypeId }
                ]
            };
            let payData = await refTitleBo.GetReferenceValues(apiReq);
            let paymentType = payData.Data[0].Description;
            let encounterbo = BoFactory.GetBo(encbo.EncounterBo, this.Request);
            let encdata = await encounterbo.GetEncounterById({ Id: req.Data.Header.EncounterId });
            let DisplayWard = '';
            if (req.Data.Header.EncounterTypeId === 2) {
                let wardMasterBO = BoFactory.GetBo(generalMasterBo.WardMasterBo, this.Request);
                let warddata = await wardMasterBO.GetWardMasterById({ Id: encdata.WardId });
                DisplayWard = warddata.WardName;
            }
            let department = '';
            let receiptData: any;
            if (req.Data.Header.PatientReceiptId) {
                let receiptBO = BoFactory.GetBo(billingbo.PatientPaymentDetailsBo, this.Request);
                receiptData = await receiptBO.GetPatientPaymentDetailsById({ Id: req.Data.Header.PatientReceiptId });
                if (receiptData && receiptData.DepartmentID && receiptData.DepartmentID > 0) {
                    let departmentBO = BoFactory.GetBo(userbo.DepartmentBo, this.Request);
                    let departmentData = await departmentBO.GetDepartmentById({ Id: receiptData.DepartmentID });
                    department = departmentData.DepartmentName;
                } else {
                    console.error('receiptData is undefined or does not contain DepartmentID');
                }
            }
            if (patient.Mobile) {
                let eventTemplateBO = BoFactory.GetBo(userbo.EventTemplateBo, this.Request);
                let smsTemplateInfo = null;
                if (req.Data.Header.EncounterTypeId === 1) {
                    smsTemplateInfo = await eventTemplateBO.GetTemplateInfo('OPRefund', 'OPRefund', 1);
                } else {
                    smsTemplateInfo = await eventTemplateBO.GetTemplateInfo('IPRefund', 'IPRefund', 1);
                }
                let smsmodel: any = {};
                if (SmsConfig['PROVIDER'] === 'SHUVADHARSHINI') {
                    try {
                        if (req.Data.Header.EncounterTypeId === 1) {
                            smsmodel = {
                                numbers: [patient.Mobile],
                                message: Template.Compile(smsTemplateInfo.TemplateContent,
                                    {
                                        originCurrency: 'INR',
                                        Amount: req.Data.Header.RefundAmount,
                                        title: title,
                                        patientName: patient.FirstName,
                                        PaymentMode: paymentType,
                                        department: department,
                                        mrn: patient.MRN,
                                    }),
                                templateId: smsTemplateInfo.ModuleId
                            };
                        } else {
                            smsmodel = {
                                numbers: [patient.Mobile],
                                message: Template.Compile(smsTemplateInfo.TemplateContent,
                                    {
                                        originCurrency: 'INR',
                                        Amount: req.Data.Header.RefundAmount,
                                        title: title,
                                        patientName: patient.FirstName,
                                        PaymentMode: paymentType,
                                        ward: DisplayWard,
                                        visitIdentifier: encdata.VisitIdentifier,
                                        mrn: patient.MRN,
                                    }),
                                templateId: smsTemplateInfo.ModuleId
                            };
                        }
                    } catch (error) {
                        console.log('Error Processing SMS:', error);
                    }
                }
                let smsProvider = this.GetSmsProvider();
                if (smsProvider) {
                    let SMSStatus = await smsProvider.send(smsmodel);
                    let eventDashboardOutboundBo = BoFactory.GetBo(userbo.EventDashboardBo, this.Request);
                    await eventDashboardOutboundBo.ManageSMSOutBound(SMSStatus, smsmodel.message + ' To : ' + patient.Mobile);
                }
            }
        }
        return true;
    }

    public async UpdatePatientRefund(req: BaseRequest, creditNote?: number): Promise<boolean> {
        let generateRefund = 0;
        if (!req.Data.Header.RefundIdentifier && req.Data.Header.RefundStatusId === 1) {
            generateRefund = 1;
            req.Data.Header.RefundIdentifier = null; // await Sequence.Next(SequenceKeys.RefundNrId);
            req.Data.Header.RefundDateTime = new Date();
        }
        let result = await this.Update(req.Data.Header);
        if (req.Data.Header.RefundStatusId === 1) {
            if (req.Data.Header.RefundTypeId !== 4) {
                await this.ManageReceipt(req);// Update the Receipt Details if PatientReceiptId available
                if (!req.Data.Header.IsFromFinalize)
                    await this.ManagePatientBill(req);// Update the Patient Bill if bill is Finalized with to be refunded
            } else if (req.Data.Header.RefundTypeId === 4)
                if (!creditNote)
                    await this.ManagePatientBill(req);
        }
        if (result) {
            let PatientRefundId = req.Data.Header.Id;
            let DetailBo = BoFactory.GetBo(billingbo.PatientRefundDetailsBo, this.Request);
            await DetailBo.ManagePatientRefundDetails(PatientRefundId, req.Data.Details);

            if (generateRefund === 1) {
                this.deferSequenceKey(PatientRefundId, 'RefundIdentifier',
                    this.getFacilitySequenceIdentifier(SequenceKeys.RefundNrId,
                        req.Data.Header.FacilityId
                    ));
            }

            return PatientRefundId;
        }
        return result;
    }

    public async ManageReceipt(req: BaseRequest): Promise<boolean> {
        if (req.Data.Header.PatientReceiptId && req.Data.Header.PatientReceiptId > 0) {
            let receiptBo = BoFactory.GetBo(billingbo.PatientPaymentDetailsBo, this.Request);
            let refund: any = 0;
            let paymentData: any = await receiptBo.GetPatientPaymentDetailsById({ Id: req.Data.Header.PatientReceiptId });
            // if (paymentData.length > 0) {
            //     refund = _.sumBy(paymentData, (detail: any) => Number(detail.RefundAmount));
            // }
            if (paymentData) {
                refund = Number(paymentData.RefundAmount);
            }
            refund = refund + req.Data.Header.RefundAmount;
            let receiptDetail: any = {
                Id: req.Data.Header.PatientReceiptId,
                ReceiptStatusId: 4,
                RefundAmount: refund
            };
            if (req.Data.Header.fromIPBilling && req.Data.Header.fromIPBilling === true)
                receiptDetail.ReceiptStatusId = 1;
            await receiptBo.Update(receiptDetail);
        }
        return true;
    }

    public async ManagePatientBill(req: BaseRequest): Promise<boolean> {
        if (req.Data.Header.PatientBillId && req.Data.Header.PatientBillId > 0) {
            let billBO = BoFactory.GetBo(billingbo.PatientBillsBo, this.Request);
            let PatientBill = await billBO.GetPatientBillsById({ Id: req.Data.Header.PatientBillId });
            if (PatientBill.BillTypeId === 1 && PatientBill.PatientBillStatusId === 3) {
                PatientBill.RefundAmount = parseFloat(PatientBill.RefundAmount !== null
                    ? PatientBill.RefundAmount.toString() : (0).toString())
                    + parseFloat(req.Data.Header.RefundAmount.toString());
                await billBO.Update(PatientBill);
            } else
                if (PatientBill.FSTypeId === 4) {
                    PatientBill.ToBeRefunded = parseFloat(PatientBill.ToBeRefunded !== null
                        ? PatientBill.ToBeRefunded.toString() : (0).toString())
                        - parseFloat(req.Data.Header.RefundAmount.toString());
                    PatientBill.RefundAmount = parseFloat(PatientBill.RefundAmount !== null
                        ? PatientBill.RefundAmount.toString() : (0).toString())
                        + parseFloat(req.Data.Header.RefundAmount.toString());
                    await billBO.Update(PatientBill);
                }
        }
        return true;
    }

    public async ManageCashtoCreditRefund(PatientBillId: number, details: PatientRefundAttributes[]):
        Promise<boolean> {
        details = details || [];
        let promises: Array<any> = [];
        for (let kk = 0, len = details.length; kk < len; kk++) {
            let detail = details[kk];
            detail.Id = detail.Id || 0;
            detail.PatientBillId = PatientBillId;
            detail.RefundDateTime = new Date();
            if (detail.Status === 2 && detail.Id !== 0) {
                promises.push(this.MarkAsDelete(detail.Id));
            } else if (detail.Id >= 0) {
                if (!detail.RefundIdentifier && detail.RefundStatusId === 1) {
                    detail.RefundIdentifier = null; //await Sequence.Next(SequenceKeys.RefundNrId);
                    detail.RefundDateTime = new Date();
                    let result = await this.Save(detail);
                    let PatientRefundId = result.dataValues.Id;
                    this.deferSequenceKey(PatientRefundId, 'RefundIdentifier',
                        this.getFacilitySequenceIdentifier(SequenceKeys.RefundNrId,
                            (detail.FacilityId) ? detail.FacilityId : -1
                        ));
                }
            }
        }
        return true;
    }

    public async ManagePatientRefund(PatientBillId: number, details: PatientRefundAttributes[]):
        Promise<boolean> {
        details = details || [];
        let promises: Array<any> = [];
        details.forEach(detail => {
            detail.Id = detail.Id || 0;
            detail.PatientBillId = PatientBillId;
            detail.RefundDateTime = new Date();
            if (detail.Status === 2 && detail.Id !== 0) {
                promises.push(this.MarkAsDelete(detail.Id));
            } else if (detail.Id >= 0) {
                promises.push(this.Save(detail));
            }
            /* else if (detail.Id > 0) {
                promises.push(this.Update(detail));
            }
            */
        });
        await Promise.all(promises);
        return true;
    }

    public async ManagePatientPharmacyRefund(PatientReturnId: number, details: PatientRefundAttributes[]):
        Promise<boolean> {
        details = details || [];
        let promises: Array<any> = [];
        details.forEach(detail => {
            detail.Id = detail.Id || 0;
            detail.RefundDateTime = new Date();
            if (detail.Status === 2 && detail.Id !== 0) {
                promises.push(this.MarkAsDelete(detail.Id));
            } else if (detail.Id >= 0) {
                promises.push(this.Save(detail));
            }
        });
        await Promise.all(promises);
        return true;
    }

    public async GetPatientRefundById(req: BaseRequest): Promise<PatientRefundAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetPatientRefund(apiReq?: ApiRequest<PatientRefundFilters>): Promise<ApiResponse<PatientRefundAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        let patientWhere: WhereOptions<any> = {};
        let patientPaymentWhere: WhereOptions<any> = {};
        let order: Array<any> = [];
        let isReqPatientSearch: boolean = false;
        let isReqPatientPaymentSearch: boolean = false;
        include.push({
            model: this.Models.Facility, required: false,
        });
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName', 'SignPath'], as: 'CreatedUser', required: false,
            include: [
                this.GetReference('Title')
            ]
        });
        include.push({
            model: this.Models.Department, attributes: ['DepartmentName', 'DepartmentCode'], required: false,
        });

        include.push({
            model: this.Models.PatientBills, required: false,
            include: [
                {
                    model: this.Models.User, attributes: ['FirstName', 'LastName', 'Qualification',
                        'LicenseNo'], required: false,
                    include: [
                        this.GetReference('Title')
                    ]
                }
            ]
        });
        include.push({
            model: this.Models.PatientReturns, required: false,
        });
        include.push(this.GetReference('RefundType'));
        include.push({
            model: this.Models.PatientCreditNote,
            attributes: ['CreditNoteIdentifier', 'CreditNoteAmount', 'CreditNoteDateTime'], required: false
        });
        include.push({ model: this.Models.Encounter, attributes: ['VisitIdentifier'], required: false });
        include.push(this.GetReference('PaymentType'));
        include.push(this.GetReference('Bank'));
        include.push(this.GetReference('RefundStatus'));
        include.push(this.GetReference('RefundApprovalStatus'));
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case PatientRefundFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case PatientRefundFilters.RefundIdentifier:
                        where['RefundIdentifier'] = { '$like': (param.Value || '') + '%' };
                        break;
                    case PatientRefundFilters.PatientNameMRN:
                        (patientWhere as any)['$or'] = [{ 'FirstName': { '$like': '%' + (param.Value || '') + '%' } },
                        { 'LastName': { '$like': '%' + (param.Value || '') + '%' } },
                        { 'MRN': { '$like': '%' + (param.Value || '') + '%' } }];
                        isReqPatientSearch = true;
                        break;
                    case PatientRefundFilters.RefundDateTime:
                        where['RefundDateTime'] = { '$between': param.Value };
                        break;
                    case PatientRefundFilters.RefundType:
                        where['RefundTypeId'] = param.Value;
                        break;
                    case PatientRefundFilters.RefundTypes:
                        // where['RefundTypeId'] = param.Value;
                        // break;
                        if (param.Value) {
                            let paramArr: Array<number> = [];
                            if (param.Value.toString().indexOf(',') > -1) {
                                paramArr = param.Value.toString().split(',');
                            } else {
                                paramArr = [param.Value];
                            }
                            where['RefundTypeId'] = { '$in': paramArr };
                            // isReqPatientPaymentSearch = true;
                        }
                        break;
                    case PatientRefundFilters.RefundStatus:
                        if (param.Value) {
                            let paramArr: Array<number> = [];
                            if (param.Value.toString().indexOf(',') > -1) {
                                paramArr = param.Value.toString().split(',');
                            } else {
                                paramArr = [param.Value];
                            }
                            where['RefundStatusId'] = { '$in': paramArr };
                        }
                        break;
                    case PatientRefundFilters.RefundApprovalStatus:
                        if (param.Value) {
                            let paramArr: Array<number> = [];
                            if (param.Value.toString().indexOf(',') > -1) {
                                paramArr = param.Value.toString().split(',');
                            } else {
                                paramArr = [param.Value];
                            }
                            where['RefundApprovalStatusId'] = { '$in': paramArr };
                        }
                        break;
                    case PatientRefundFilters.ReceiptTypeId:
                        if (param.Value) {
                            let paramArr: Array<number> = [];
                            if (param.Value.toString().indexOf(',') > -1) {
                                paramArr = param.Value.toString().split(',');
                            } else {
                                paramArr = [param.Value];
                            }
                            patientPaymentWhere['ReceiptTypeId'] = { '$in': paramArr };
                            // isReqPatientPaymentSearch = true;
                        }
                        break;
                    case PatientRefundFilters.FirstName:
                        (patientWhere as any)['$or'] = [{ 'FirstName': { '$like': '%' + (param.Value || '') + '%' } },
                        { 'LastName': { '$like': '%' + (param.Value || '') + '%' } },
                        { 'MRN': { '$like': '%' + (param.Value || '') + '%' } }];
                        isReqPatientSearch = true;
                        break;
                    case PatientRefundFilters.LastName:
                        (patientWhere as any)['$or'] = [{ 'FirstName': { '$like': '%' + (param.Value || '') + '%' } },
                        { 'LastName': { '$like': '%' + (param.Value || '') + '%' } },
                        { 'MRN': { '$like': '%' + (param.Value || '') + '%' } }];
                        isReqPatientSearch = true;
                        break;
                    case PatientRefundFilters.PatientBillId:
                        where['PatientBillId'] = param.Value;
                        break;
                    case PatientRefundFilters.PatientReceiptId:
                        where['PatientReceiptId'] = param.Value;
                        break;
                    case PatientRefundFilters.EncounterId:
                        where['EncounterId'] = param.Value;
                        break;
                    case PatientRefundFilters.EncounterTypeId:
                        where['EncounterTypeId'] = param.Value;
                        break;
                    case PatientRefundFilters.fromDate:
                        where['RefundDateTime'] = where['RefundDateTime'] || {};
                        (where['RefundDateTime'] as any)['$gte'] = param.Value;
                        break;
                    case PatientRefundFilters.toDate:
                        where['RefundDateTime'] = where['RefundDateTime'] || {};
                        (where['RefundDateTime'] as any)['$lte'] = param.Value;
                        break;
                    case PatientRefundFilters.CreatedBy:
                        where['RefundGeneratedById'] = param.Value;
                        break;
                    case PatientRefundFilters.StoreMasterId:
                        where['StoreMasterId'] = { '$lt': param.Value };
                        break;
                    case PatientRefundFilters.FacilityId:
                        where['FacilityId'] = param.Value;
                        break;
                    case PatientRefundFilters.CreatedById:
                        where['CreatedBy'] = param.Value;
                        break;
                    case PatientRefundFilters.IsCashToCredit:
                        where['IsCashToCredit'] = param.Value;
                        break;
                    case PatientRefundFilters.PaymentTypeId:
                        where['PaymentTypeId'] = param.Value;
                        break;
                    case PatientRefundFilters.UpdatedBy:
                        where['UpdatedBy'] = param.Value;
                        break;
                    case PatientRefundFilters.PatientId:
                        where['PatientId'] = param.Value;
                        break;
                    case PatientRefundFilters.IsPharmacyBill:
                        include.push({
                            model: this.Models.PatientBills,
                            attributes: ['Id', 'IsPharmacyBill'],
                            required: true,
                            where: {
                                'Status': 1,
                                'PatientBillStatusId': 3,
                                'IsPharmacyBill': param.Value
                            }, as: 'PharmacyDetails'
                        });
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
            model: this.Models.PatientPaymentDetails, attributes: ['ReceiptNumber',
                'ReceiptDateTime', 'ReceiptTypeId', 'PaymentTypeId'],
            required: isReqPatientPaymentSearch,
            where: patientPaymentWhere,
            include: [
                this.GetReference('PaymentType'),
                {
                    model: this.Models.User, attributes: ['FirstName', 'LastName', 'Qualification',
                        'LicenseNo'], required: false,
                    include: [
                        this.GetReference('Title')
                    ]
                }
            ]
        });
        order.push(['RefundDateTime', 'DESC']);
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeletePatientRefund(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public async CancelIPBillRefunds(req: BaseRequest): Promise<Boolean> {
        let ipbillrefunds = [];
        let apiReq = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [{ Key: PatientRefundFilters.PatientBillId, Value: req.Id }]
        };
        let data = await this.GetPatientRefund(apiReq);
        ipbillrefunds = data.Data || [];
        if (ipbillrefunds.length > 0) {
            await this.ManageCancelledIPRefunds(req.Id, ipbillrefunds);
        }

        return true;
    }

    public async ManageCancelledIPRefunds(PatientBillId: number, details: PatientRefundAttributes[]):
        Promise<boolean> {
        details = details || [];
        await Promise.all(details.map((DetailItem): Promise<void> => {
            return (async (detail): Promise<void> => {
                detail.Id = detail.Id || 0;
                detail.RefundStatusId = 3;
                if (detail.Status === 2 && detail.Id !== 0) {
                    await this.MarkAsDelete(detail.Id);
                } else if (detail.Id > 0) {
                    await this.Update(detail);
                }
            })(DetailItem);
        }));
        return true;
    }

    public async CancelEncIPBillRefunds(req: BaseRequest): Promise<Boolean> {
        let ipbillrefunds = [];
        let apiReq = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [{ Key: PatientRefundFilters.EncounterId, Value: req.Data.Id }]
        };
        let data = await this.GetPatientRefund(apiReq);
        ipbillrefunds = data.Data || [];
        if (ipbillrefunds.length > 0) {
            await this.ManageCancelledIPRefunds(req.Id, ipbillrefunds);
        }

        return true;
    }

    public async PharmacyRefundDetails(req: BaseRequest): Promise<any> {
        let UserGroup: { [id: number]: any[] } = {};
        let UserGroupJoin: any = {
            model: this.Models.User, as: 'RefundUser',
            attributes: ['FirstName', 'LastName'],
            // where: {
            //     UserTypeId: 1,
            // },
            required: true,
            include: [
                this.GetReference('Title')
            ]
        };
        let oprefundamountInstance: any = await this.FindAll({
            attributes: ['RefundAmount', 'RefundGeneratedById'],
            where: {
                RefundDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                RefundGeneratedById: { '$gt': 0 },
                EncounterTypeId: { '$ne': 2 },
                RefundTypeId: 4,
                FacilityId: req.Data.FacilityId,
                RefundStatusId: 1,
                StoreMasterId: req.Data.StoreMasterId,
            },
            include: [UserGroupJoin]
        });
        if (oprefundamountInstance) {
            let groupbills = _.groupBy(oprefundamountInstance, 'RefundGeneratedById');
            for (let i in groupbills) {
                let groupedBills = groupbills[i];
                let RefundAmount: number = 0;
                let UserId: number = 0;
                let User: string = '';
                for (let i = 0; i < groupedBills.length; i++) {
                    let bills: any = groupedBills[i];
                    RefundAmount += bills.RefundAmount;
                    UserId = bills.RefundGeneratedById;
                    User = bills.RefundUser;
                    UserGroup[UserId] = UserGroup[UserId] || [];
                }
                let info = {
                    'NetRefundAmount': RefundAmount,
                    'UserId': UserId,
                    'UserName': User
                };
                UserGroup[UserId].push(info);
            }
        }
        let opcashrefundamountInstance: any = await this.FindAll({
            attributes: ['RefundAmount', 'RefundGeneratedById'],
            where: {
                RefundDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                RefundGeneratedById: { '$gt': 0 },
                EncounterTypeId: { '$ne': 2 },
                RefundTypeId: 4,
                PaymentTypeId: 1,
                FacilityId: req.Data.FacilityId,
                StoreMasterId: req.Data.StoreMasterId,
                RefundStatusId: 1
            },
            include: [UserGroupJoin]
        });
        if (opcashrefundamountInstance) {
            let groupbills = _.groupBy(opcashrefundamountInstance, 'RefundGeneratedById');
            for (let i in groupbills) {
                let groupedBills = groupbills[i];
                let RefundAmount: number = 0;
                let UserId: number = 0;
                let User: string = '';
                for (let i = 0; i < groupedBills.length; i++) {
                    let bills: any = groupedBills[i];
                    RefundAmount += bills.RefundAmount;
                    UserId = bills.RefundGeneratedById;
                    User = bills.RefundUser;
                    UserGroup[UserId] = UserGroup[UserId] || [];
                }
                let info = {
                    'CashRefundAmount': RefundAmount,
                    'UserId': UserId,
                    'UserName': User
                };
                UserGroup[UserId].push(info);
            }
        }
        let opcardrefundamountInstance: any = await this.FindAll({
            attributes: ['RefundAmount', 'RefundGeneratedById'],
            where: {
                RefundDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                RefundGeneratedById: { '$gt': 0 },
                EncounterTypeId: { '$ne': 2 },
                RefundTypeId: 4,
                PaymentTypeId: { '$in': [5, 6] },
                FacilityId: req.Data.FacilityId,
                StoreMasterId: req.Data.StoreMasterId,
                RefundStatusId: 1
            },
            include: [UserGroupJoin]
        });
        if (opcardrefundamountInstance) {
            let groupbills = _.groupBy(opcardrefundamountInstance, 'RefundGeneratedById');
            for (let i in groupbills) {
                let groupedBills = groupbills[i];
                let RefundAmount: number = 0;
                let UserId: number = 0;
                let User: string = '';
                for (let i = 0; i < groupedBills.length; i++) {
                    let bills: any = groupedBills[i];
                    RefundAmount += bills.RefundAmount;
                    UserId = bills.RefundGeneratedById;
                    User = bills.RefundUser;
                    UserGroup[UserId] = UserGroup[UserId] || [];
                }
                let info = {
                    'CardRefundAmount': RefundAmount,
                    'UserId': UserId,
                    'UserName': User
                };
                UserGroup[UserId].push(info);
            }
        }
        let opotherrefundamountInstance: any = await this.FindAll({
            attributes: ['RefundAmount', 'RefundGeneratedById'],
            where: {
                RefundDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                RefundGeneratedById: { '$gt': 0 },
                EncounterTypeId: { '$ne': 2 },
                RefundTypeId: 4,
                PaymentTypeId: { '$notIn': [1, 5, 6, 11] },
                FacilityId: req.Data.FacilityId,
                StoreMasterId: req.Data.StoreMasterId,
                RefundStatusId: 1
            },
            include: [UserGroupJoin]
        });
        if (opotherrefundamountInstance) {
            let groupbills = _.groupBy(opotherrefundamountInstance, 'RefundGeneratedById');
            for (let i in groupbills) {
                let groupedBills = groupbills[i];
                let RefundAmount: number = 0;
                let UserId: number = 0;
                let User: string = '';
                for (let i = 0; i < groupedBills.length; i++) {
                    let bills: any = groupedBills[i];
                    RefundAmount += bills.RefundAmount;
                    UserId = bills.RefundGeneratedById;
                    User = bills.RefundUser;
                    UserGroup[UserId] = UserGroup[UserId] || [];
                }
                let info = {
                    'OtherRefundAmount': RefundAmount,
                    'UserId': UserId,
                    'UserName': User
                };
                UserGroup[UserId].push(info);
            }
        }
        let opupirefundamountInstance: any = await this.FindAll({
            attributes: ['RefundAmount', 'RefundGeneratedById'],
            where: {
                RefundDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                RefundGeneratedById: { '$gt': 0 },
                EncounterTypeId: { '$ne': 2 },
                RefundTypeId: 4,
                PaymentTypeId: 11,
                FacilityId: req.Data.FacilityId,
                StoreMasterId: req.Data.StoreMasterId,
                RefundStatusId: 1
            },
            include: [UserGroupJoin]
        });
        if (opupirefundamountInstance) {
            let groupbills = _.groupBy(opupirefundamountInstance, 'RefundGeneratedById');
            for (let i in groupbills) {
                let groupedBills = groupbills[i];
                let RefundAmount: number = 0;
                let UserId: number = 0;
                let User: string = '';
                for (let i = 0; i < groupedBills.length; i++) {
                    let bills: any = groupedBills[i];
                    RefundAmount += bills.RefundAmount;
                    UserId = bills.RefundGeneratedById;
                    User = bills.RefundUser;
                    UserGroup[UserId] = UserGroup[UserId] || [];
                }
                let info = {
                    'UPIRefundAmount': RefundAmount,
                    'UserId': UserId,
                    'UserName': User
                };
                UserGroup[UserId].push(info);
            }
        }
        let ipRefundAmountInstance: any = await this.FindAll({
            attributes: ['RefundAmount', 'RefundGeneratedById'],
            where: {
                RefundDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                EncounterTypeId: 2,
                RefundTypeId: 4,
                RefundStatusId: 1,
                RefundGeneratedById: { '$gt': 0 },
                StoreMasterId: req.Data.StoreMasterId,
                FacilityId: req.Data.FacilityId,
            },
            include: [UserGroupJoin]
        });
        if (ipRefundAmountInstance) {
            let groupbills = _.groupBy(ipRefundAmountInstance, 'RefundGeneratedById');
            for (let i in groupbills) {
                let groupedBills = groupbills[i];
                let RefundAmount: number = 0;
                let UserId: number = 0;
                let User: string = '';
                for (let i = 0; i < groupedBills.length; i++) {
                    let bills: any = groupedBills[i];
                    RefundAmount += bills.RefundAmount;
                    UserId = bills.RefundGeneratedById;
                    User = bills.RefundUser;
                    UserGroup[UserId] = UserGroup[UserId] || [];
                }
                let info = {
                    'IPRefundAmount': RefundAmount,
                    'UserId': UserId,
                    'UserName': User
                };
                UserGroup[UserId].push(info);
            }
        }
        return UserGroup;
    }
    public async BillingRefundDetails(req: BaseRequest): Promise<any> {
        let UserGroup: { [id: number]: any[] } = {};
        let UserGroupJoin: any = {
            model: this.Models.User, as: 'RefundUser',
            attributes: ['FirstName', 'LastName'],
            // where: {
            //     UserTypeId: 1,
            // },
            required: true,
            include: [
                this.GetReference('Title')
            ]
        };
        if (req.Data.UserId > 0) {
            let oprefundamountInstance: any = await this.FindAll({
                attributes: ['RefundAmount', 'RefundGeneratedById'],
                where: {
                    RefundDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                    RefundGeneratedById: { '$eq': req.Data.UserId },
                    EncounterTypeId: { '$or': { '$eq': null, '$in': [1, 2, 4] } },
                    FacilityId: req.Data.FacilityId,
                    RefundStatusId: 1
                },
                include: [UserGroupJoin]
            });
            if (oprefundamountInstance) {
                let groupbills = _.groupBy(oprefundamountInstance, 'RefundGeneratedById');
                for (let i in groupbills) {
                    let groupedBills = groupbills[i];
                    let RefundAmount: number = 0;
                    let UserId: number = 0;
                    let User: string = '';
                    for (let i = 0; i < groupedBills.length; i++) {
                        let bills: any = groupedBills[i];
                        RefundAmount += bills.RefundAmount;
                        UserId = bills.RefundGeneratedById;
                        User = bills.RefundUser;
                        UserGroup[UserId] = UserGroup[UserId] || [];
                    }
                    let info = {
                        'NetRefundAmount': RefundAmount,
                        'UserId': UserId,
                        'UserName': User
                    };
                    UserGroup[UserId].push(info);
                }
            }
        } else if (req.Data.UserId === 0) {
            let oprefundamountInstance: any = await this.FindAll({
                attributes: ['RefundAmount', 'RefundGeneratedById'],
                where: {
                    RefundDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                    RefundGeneratedById: { '$gt': 0 },
                    EncounterTypeId: { '$or': { '$eq': null, '$in': [1, 2, 4] } },
                    FacilityId: req.Data.FacilityId,
                    RefundStatusId: 1
                },
                include: [UserGroupJoin]
            });
            if (oprefundamountInstance) {
                let groupbills = _.groupBy(oprefundamountInstance, 'RefundGeneratedById');
                for (let i in groupbills) {
                    let groupedBills = groupbills[i];
                    let RefundAmount: number = 0;
                    let UserId: number = 0;
                    let User: string = '';
                    for (let i = 0; i < groupedBills.length; i++) {
                        let bills: any = groupedBills[i];
                        RefundAmount += bills.RefundAmount;
                        UserId = bills.RefundGeneratedById;
                        User = bills.RefundUser;
                        UserGroup[UserId] = UserGroup[UserId] || [];
                    }
                    let info = {
                        'NetRefundAmount': RefundAmount,
                        'UserId': UserId,
                        'UserName': User
                    };
                    UserGroup[UserId].push(info);
                }
            }
        }
        if (req.Data.UserId > 0) {
            let opcashrefundamountInstance: any = await this.FindAll({
                attributes: ['RefundAmount', 'RefundGeneratedById'],
                where: {
                    RefundDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                    RefundGeneratedById: { '$eq': req.Data.UserId },
                    EncounterTypeId: { '$or': { '$eq': null, '$in': [1, 2, 4] } },
                    PaymentTypeId: 1,
                    FacilityId: req.Data.FacilityId,
                    RefundStatusId: 1
                },
                include: [UserGroupJoin]
            });
            if (opcashrefundamountInstance) {
                let groupbills = _.groupBy(opcashrefundamountInstance, 'RefundGeneratedById');
                for (let i in groupbills) {
                    let groupedBills = groupbills[i];
                    let RefundAmount: number = 0;
                    let UserId: number = 0;
                    let User: string = '';
                    for (let i = 0; i < groupedBills.length; i++) {
                        let bills: any = groupedBills[i];
                        RefundAmount += bills.RefundAmount;
                        UserId = bills.RefundGeneratedById;
                        User = bills.RefundUser;
                        UserGroup[UserId] = UserGroup[UserId] || [];
                    }
                    let info = {
                        'CashRefundAmount': RefundAmount,
                        'UserId': UserId,
                        'UserName': User
                    };
                    UserGroup[UserId].push(info);
                }
            }
        } else if (req.Data.UserId === 0) {
            let opcashrefundamountInstance: any = await this.FindAll({
                attributes: ['RefundAmount', 'RefundGeneratedById'],
                where: {
                    RefundDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                    RefundGeneratedById: { '$gt': req.Data.UserId },
                    EncounterTypeId: { '$or': { '$eq': null, '$in': [1, 2, 4] } },
                    PaymentTypeId: 1,
                    FacilityId: req.Data.FacilityId,
                    RefundStatusId: 1
                },
                include: [UserGroupJoin]
            });
            if (opcashrefundamountInstance) {
                let groupbills = _.groupBy(opcashrefundamountInstance, 'RefundGeneratedById');
                for (let i in groupbills) {
                    let groupedBills = groupbills[i];
                    let RefundAmount: number = 0;
                    let UserId: number = 0;
                    let User: string = '';
                    for (let i = 0; i < groupedBills.length; i++) {
                        let bills: any = groupedBills[i];
                        RefundAmount += bills.RefundAmount;
                        UserId = bills.RefundGeneratedById;
                        User = bills.RefundUser;
                        UserGroup[UserId] = UserGroup[UserId] || [];
                    }
                    let info = {
                        'CashRefundAmount': RefundAmount,
                        'UserId': UserId,
                        'UserName': User
                    };
                    UserGroup[UserId].push(info);
                }
            }
        }
        if (req.Data.UserId > 0) {
            let opcardrefundamountInstance: any = await this.FindAll({
                attributes: ['RefundAmount', 'RefundGeneratedById'],
                where: {
                    RefundDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                    RefundGeneratedById: { '$eq': req.Data.UserId },
                    EncounterTypeId: { '$or': { '$eq': null, '$in': [1, 2, 4] } },
                    PaymentTypeId: { '$in': [5, 6] },
                    FacilityId: req.Data.FacilityId,
                    RefundStatusId: 1
                },
                include: [UserGroupJoin]
            });
            if (opcardrefundamountInstance) {
                let groupbills = _.groupBy(opcardrefundamountInstance, 'RefundGeneratedById');
                for (let i in groupbills) {
                    let groupedBills = groupbills[i];
                    let RefundAmount: number = 0;
                    let UserId: number = 0;
                    let User: string = '';
                    for (let i = 0; i < groupedBills.length; i++) {
                        let bills: any = groupedBills[i];
                        RefundAmount += bills.RefundAmount;
                        UserId = bills.RefundGeneratedById;
                        User = bills.RefundUser;
                        UserGroup[UserId] = UserGroup[UserId] || [];
                    }
                    let info = {
                        'CardRefundAmount': RefundAmount,
                        'UserId': UserId,
                        'UserName': User
                    };
                    UserGroup[UserId].push(info);
                }
            }
        } else if (req.Data.UserId === 0) {
            let opcardrefundamountInstance: any = await this.FindAll({
                attributes: ['RefundAmount', 'RefundGeneratedById'],
                where: {
                    RefundDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                    RefundGeneratedById: { '$gt': req.Data.UserId },
                    EncounterTypeId: { '$or': { '$eq': null, '$in': [1, 2, 4] } },
                    PaymentTypeId: { '$in': [5, 6] },
                    FacilityId: req.Data.FacilityId,
                    RefundStatusId: 1
                },
                include: [UserGroupJoin]
            });
            if (opcardrefundamountInstance) {
                let groupbills = _.groupBy(opcardrefundamountInstance, 'RefundGeneratedById');
                for (let i in groupbills) {
                    let groupedBills = groupbills[i];
                    let RefundAmount: number = 0;
                    let UserId: number = 0;
                    let User: string = '';
                    for (let i = 0; i < groupedBills.length; i++) {
                        let bills: any = groupedBills[i];
                        RefundAmount += bills.RefundAmount;
                        UserId = bills.RefundGeneratedById;
                        User = bills.RefundUser;
                        UserGroup[UserId] = UserGroup[UserId] || [];
                    }
                    let info = {
                        'CardRefundAmount': RefundAmount,
                        'UserId': UserId,
                        'UserName': User
                    };
                    UserGroup[UserId].push(info);
                }
            }
        }
        if (req.Data.UserId > 0) {
            let opotherrefundamountInstance: any = await this.FindAll({
                attributes: ['RefundAmount', 'RefundGeneratedById'],
                where: {
                    RefundDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                    RefundGeneratedById: { '$eq': req.Data.UserId },
                    EncounterTypeId: { '$or': { '$eq': null, '$in': [1, 2, 4] } },
                    PaymentTypeId: { '$notIn': [1, 5, 6, 10, 11] },
                    FacilityId: req.Data.FacilityId,
                    RefundStatusId: 1
                },
                include: [UserGroupJoin]
            });
            if (opotherrefundamountInstance) {
                let groupbills = _.groupBy(opotherrefundamountInstance, 'RefundGeneratedById');
                for (let i in groupbills) {
                    let groupedBills = groupbills[i];
                    let RefundAmount: number = 0;
                    let UserId: number = 0;
                    let User: string = '';
                    for (let i = 0; i < groupedBills.length; i++) {
                        let bills: any = groupedBills[i];
                        RefundAmount += bills.RefundAmount;
                        UserId = bills.RefundGeneratedById;
                        User = bills.RefundUser;
                        UserGroup[UserId] = UserGroup[UserId] || [];
                    }
                    let info = {
                        'OtherRefundAmount': RefundAmount,
                        'UserId': UserId,
                        'UserName': User
                    };
                    UserGroup[UserId].push(info);
                }
            }
        } else if (req.Data.UserId === 0) {
            let opotherrefundamountInstance: any = await this.FindAll({
                attributes: ['RefundAmount', 'RefundGeneratedById'],
                where: {
                    RefundDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                    RefundGeneratedById: { '$gt': req.Data.UserId },
                    EncounterTypeId: { '$or': { '$eq': null, '$in': [1, 2, 4] } },
                    PaymentTypeId: { '$notIn': [1, 5, 6, 10, 11] },
                    FacilityId: req.Data.FacilityId,
                    RefundStatusId: 1
                },
                include: [UserGroupJoin]
            });
            if (opotherrefundamountInstance) {
                let groupbills = _.groupBy(opotherrefundamountInstance, 'RefundGeneratedById');
                for (let i in groupbills) {
                    let groupedBills = groupbills[i];
                    let RefundAmount: number = 0;
                    let UserId: number = 0;
                    let User: string = '';
                    for (let i = 0; i < groupedBills.length; i++) {
                        let bills: any = groupedBills[i];
                        RefundAmount += bills.RefundAmount;
                        UserId = bills.RefundGeneratedById;
                        User = bills.RefundUser;
                        UserGroup[UserId] = UserGroup[UserId] || [];
                    }
                    let info = {
                        'OtherRefundAmount': RefundAmount,
                        'UserId': UserId,
                        'UserName': User
                    };
                    UserGroup[UserId].push(info);
                }
            }
        }
        if (req.Data.UserId > 0) {
            let opNetBankingrefundamountInstance: any = await this.FindAll({
                attributes: ['RefundAmount', 'RefundGeneratedById'],
                where: {
                    RefundDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                    RefundGeneratedById: { '$eq': req.Data.UserId },
                    EncounterTypeId: { '$or': { '$eq': null, '$in': [1, 2, 4] } },
                    PaymentTypeId: 10,
                    FacilityId: req.Data.FacilityId,
                    RefundStatusId: 1
                },
                include: [UserGroupJoin]
            });
            if (opNetBankingrefundamountInstance) {
                let groupbills = _.groupBy(opNetBankingrefundamountInstance, 'RefundGeneratedById');
                for (let i in groupbills) {
                    let groupedBills = groupbills[i];
                    let RefundAmount: number = 0;
                    let UserId: number = 0;
                    let User: string = '';
                    for (let i = 0; i < groupedBills.length; i++) {
                        let bills: any = groupedBills[i];
                        RefundAmount += bills.RefundAmount;
                        UserId = bills.RefundGeneratedById;
                        User = bills.RefundUser;
                        UserGroup[UserId] = UserGroup[UserId] || [];
                    }
                    let info = {
                        'NetBankingRefundAmount': RefundAmount,
                        'UserId': UserId,
                        'UserName': User
                    };
                    UserGroup[UserId].push(info);
                }
            }
        } else if (req.Data.UserId === 0) {
            let opNetBankingrefundamountInstance: any = await this.FindAll({
                attributes: ['RefundAmount', 'RefundGeneratedById'],
                where: {
                    RefundDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                    RefundGeneratedById: { '$gt': req.Data.UserId },
                    EncounterTypeId: { '$or': { '$eq': null, '$in': [1, 2, 4] } },
                    PaymentTypeId: 10,
                    FacilityId: req.Data.FacilityId,
                    RefundStatusId: 1
                },
                include: [UserGroupJoin]
            });
            if (opNetBankingrefundamountInstance) {
                let groupbills = _.groupBy(opNetBankingrefundamountInstance, 'RefundGeneratedById');
                for (let i in groupbills) {
                    let groupedBills = groupbills[i];
                    let RefundAmount: number = 0;
                    let UserId: number = 0;
                    let User: string = '';
                    for (let i = 0; i < groupedBills.length; i++) {
                        let bills: any = groupedBills[i];
                        RefundAmount += bills.RefundAmount;
                        UserId = bills.RefundGeneratedById;
                        User = bills.RefundUser;
                        UserGroup[UserId] = UserGroup[UserId] || [];
                    }
                    let info = {
                        'NetBankingRefundAmount': RefundAmount,
                        'UserId': UserId,
                        'UserName': User
                    };
                    UserGroup[UserId].push(info);
                }
            }
        }
        if (req.Data.UserId > 0) {
            let opUPIrefundamountInstance: any = await this.FindAll({
                attributes: ['RefundAmount', 'RefundGeneratedById'],
                where: {
                    RefundDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                    RefundGeneratedById: { '$eq': req.Data.UserId },
                    EncounterTypeId: { '$or': { '$eq': null, '$in': [1, 2, 4] } },
                    PaymentTypeId: 11,
                    FacilityId: req.Data.FacilityId,
                    RefundStatusId: 1
                },
                include: [UserGroupJoin]
            });
            if (opUPIrefundamountInstance) {
                let groupbills = _.groupBy(opUPIrefundamountInstance, 'RefundGeneratedById');
                for (let i in groupbills) {
                    let groupedBills = groupbills[i];
                    let RefundAmount: number = 0;
                    let UserId: number = 0;
                    let User: string = '';
                    for (let i = 0; i < groupedBills.length; i++) {
                        let bills: any = groupedBills[i];
                        RefundAmount += bills.RefundAmount;
                        UserId = bills.RefundGeneratedById;
                        User = bills.RefundUser;
                        UserGroup[UserId] = UserGroup[UserId] || [];
                    }
                    let info = {
                        'UPIRefundAmount': RefundAmount,
                        'UserId': UserId,
                        'UserName': User
                    };
                    UserGroup[UserId].push(info);
                }
            }
        } else if (req.Data.UserId === 0) {
            let opUPIrefundamountInstance: any = await this.FindAll({
                attributes: ['RefundAmount', 'RefundGeneratedById'],
                where: {
                    RefundDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                    RefundGeneratedById: { '$gt': req.Data.UserId },
                    EncounterTypeId: { '$or': { '$eq': null, '$in': [1, 2, 4] } },
                    PaymentTypeId: 11,
                    FacilityId: req.Data.FacilityId,
                    RefundStatusId: 1
                },
                include: [UserGroupJoin]
            });
            if (opUPIrefundamountInstance) {
                let groupbills = _.groupBy(opUPIrefundamountInstance, 'RefundGeneratedById');
                for (let i in groupbills) {
                    let groupedBills = groupbills[i];
                    let RefundAmount: number = 0;
                    let UserId: number = 0;
                    let User: string = '';
                    for (let i = 0; i < groupedBills.length; i++) {
                        let bills: any = groupedBills[i];
                        RefundAmount += bills.RefundAmount;
                        UserId = bills.RefundGeneratedById;
                        User = bills.RefundUser;
                        UserGroup[UserId] = UserGroup[UserId] || [];
                    }
                    let info = {
                        'UPIRefundAmount': RefundAmount,
                        'UserId': UserId,
                        'UserName': User
                    };
                    UserGroup[UserId].push(info);
                }
            }
        }
        return UserGroup;
    }


    public async OPBillingRefundDetails(req: BaseRequest): Promise<any> {
        let UserGroup: { [id: number]: any[] } = {};
        let UserGroupJoin: any = {
            model: this.Models.User, as: 'RefundUser',
            attributes: ['FirstName', 'LastName'],
            // where: {
            //     UserTypeId: 1,
            // },
            required: true,
            include: [
                this.GetReference('Title')
            ]
        };
        if (req.Data.UserId > 0) {
            let oprefundamountInstance: any = await this.FindAll({
                attributes: ['RefundAmount', 'RefundGeneratedById'],
                where: {
                    RefundDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                    RefundGeneratedById: { '$eq': req.Data.UserId },
                    EncounterTypeId: { '$or': { '$eq': null, '$in': [1, 4] } },
                    FacilityId: req.Data.FacilityId,
                    RefundStatusId: 1
                },
                include: [UserGroupJoin]
            });
            if (oprefundamountInstance) {
                let groupbills = _.groupBy(oprefundamountInstance, 'RefundGeneratedById');
                for (let i in groupbills) {
                    let groupedBills = groupbills[i];
                    let RefundAmount: number = 0;
                    let UserId: number = 0;
                    let User: string = '';
                    for (let i = 0; i < groupedBills.length; i++) {
                        let bills: any = groupedBills[i];
                        RefundAmount += bills.RefundAmount;
                        UserId = bills.RefundGeneratedById;
                        User = bills.RefundUser;
                        UserGroup[UserId] = UserGroup[UserId] || [];
                    }
                    let info = {
                        'NetRefundAmount': RefundAmount,
                        'UserId': UserId,
                        'UserName': User
                    };
                    UserGroup[UserId].push(info);
                }
            }
        } else if (req.Data.UserId === 0) {
            let oprefundamountInstance: any = await this.FindAll({
                attributes: ['RefundAmount', 'RefundGeneratedById'],
                where: {
                    RefundDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                    RefundGeneratedById: { '$gt': req.Data.UserId },
                    EncounterTypeId: { '$or': { '$eq': null, '$in': [1, 4] } },
                    FacilityId: req.Data.FacilityId,
                    RefundStatusId: 1
                },
                include: [UserGroupJoin]
            });
            if (oprefundamountInstance) {
                let groupbills = _.groupBy(oprefundamountInstance, 'RefundGeneratedById');
                for (let i in groupbills) {
                    let groupedBills = groupbills[i];
                    let RefundAmount: number = 0;
                    let UserId: number = 0;
                    let User: string = '';
                    for (let i = 0; i < groupedBills.length; i++) {
                        let bills: any = groupedBills[i];
                        RefundAmount += bills.RefundAmount;
                        UserId = bills.RefundGeneratedById;
                        User = bills.RefundUser;
                        UserGroup[UserId] = UserGroup[UserId] || [];
                    }
                    let info = {
                        'NetRefundAmount': RefundAmount,
                        'UserId': UserId,
                        'UserName': User
                    };
                    UserGroup[UserId].push(info);
                }
            }
        }
        if (req.Data.UserId > 0) {
            let opcashrefundamountInstance: any = await this.FindAll({
                attributes: ['RefundAmount', 'RefundGeneratedById'],
                where: {
                    RefundDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                    RefundGeneratedById: { '$eq': req.Data.UserId },
                    EncounterTypeId: { '$or': { '$eq': null, '$in': [1, 4] } },
                    PaymentTypeId: 1,
                    FacilityId: req.Data.FacilityId,
                    RefundStatusId: 1
                },
                include: [UserGroupJoin]
            });
            if (opcashrefundamountInstance) {
                let groupbills = _.groupBy(opcashrefundamountInstance, 'RefundGeneratedById');
                for (let i in groupbills) {
                    let groupedBills = groupbills[i];
                    let RefundAmount: number = 0;
                    let UserId: number = 0;
                    let User: string = '';
                    for (let i = 0; i < groupedBills.length; i++) {
                        let bills: any = groupedBills[i];
                        RefundAmount += bills.RefundAmount;
                        UserId = bills.RefundGeneratedById;
                        User = bills.RefundUser;
                        UserGroup[UserId] = UserGroup[UserId] || [];
                    }
                    let info = {
                        'CashRefundAmount': RefundAmount,
                        'UserId': UserId,
                        'UserName': User
                    };
                    UserGroup[UserId].push(info);
                }
            }
        } else if (req.Data.UserId === 0) {
            let opcashrefundamountInstance: any = await this.FindAll({
                attributes: ['RefundAmount', 'RefundGeneratedById'],
                where: {
                    RefundDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                    RefundGeneratedById: { '$gt': req.Data.UserId },
                    EncounterTypeId: { '$or': { '$eq': null, '$in': [1, 4] } },
                    PaymentTypeId: 1,
                    FacilityId: req.Data.FacilityId,
                    RefundStatusId: 1
                },
                include: [UserGroupJoin]
            });
            if (opcashrefundamountInstance) {
                let groupbills = _.groupBy(opcashrefundamountInstance, 'RefundGeneratedById');
                for (let i in groupbills) {
                    let groupedBills = groupbills[i];
                    let RefundAmount: number = 0;
                    let UserId: number = 0;
                    let User: string = '';
                    for (let i = 0; i < groupedBills.length; i++) {
                        let bills: any = groupedBills[i];
                        RefundAmount += bills.RefundAmount;
                        UserId = bills.RefundGeneratedById;
                        User = bills.RefundUser;
                        UserGroup[UserId] = UserGroup[UserId] || [];
                    }
                    let info = {
                        'CashRefundAmount': RefundAmount,
                        'UserId': UserId,
                        'UserName': User
                    };
                    UserGroup[UserId].push(info);
                }
            }
        }
        if (req.Data.UserId > 0) {
            let opcardrefundamountInstance: any = await this.FindAll({
                attributes: ['RefundAmount', 'RefundGeneratedById'],
                where: {
                    RefundDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                    RefundGeneratedById: { '$eq': req.Data.UserId },
                    EncounterTypeId: { '$or': { '$eq': null, '$in': [1, 4] } },
                    PaymentTypeId: { '$in': [5, 6] },
                    FacilityId: req.Data.FacilityId,
                    RefundStatusId: 1
                },
                include: [UserGroupJoin]
            });
            if (opcardrefundamountInstance) {
                let groupbills = _.groupBy(opcardrefundamountInstance, 'RefundGeneratedById');
                for (let i in groupbills) {
                    let groupedBills = groupbills[i];
                    let RefundAmount: number = 0;
                    let UserId: number = 0;
                    let User: string = '';
                    for (let i = 0; i < groupedBills.length; i++) {
                        let bills: any = groupedBills[i];
                        RefundAmount += bills.RefundAmount;
                        UserId = bills.RefundGeneratedById;
                        User = bills.RefundUser;
                        UserGroup[UserId] = UserGroup[UserId] || [];
                    }
                    let info = {
                        'CardRefundAmount': RefundAmount,
                        'UserId': UserId,
                        'UserName': User
                    };
                    UserGroup[UserId].push(info);
                }
            }
        } else if (req.Data.UserId === 0) {
            let opcardrefundamountInstance: any = await this.FindAll({
                attributes: ['RefundAmount', 'RefundGeneratedById'],
                where: {
                    RefundDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                    RefundGeneratedById: { '$gt': req.Data.UserId },
                    EncounterTypeId: { '$or': { '$eq': null, '$in': [1, 4] } },
                    PaymentTypeId: { '$in': [5, 6] },
                    FacilityId: req.Data.FacilityId,
                    RefundStatusId: 1
                },
                include: [UserGroupJoin]
            });
            if (opcardrefundamountInstance) {
                let groupbills = _.groupBy(opcardrefundamountInstance, 'RefundGeneratedById');
                for (let i in groupbills) {
                    let groupedBills = groupbills[i];
                    let RefundAmount: number = 0;
                    let UserId: number = 0;
                    let User: string = '';
                    for (let i = 0; i < groupedBills.length; i++) {
                        let bills: any = groupedBills[i];
                        RefundAmount += bills.RefundAmount;
                        UserId = bills.RefundGeneratedById;
                        User = bills.RefundUser;
                        UserGroup[UserId] = UserGroup[UserId] || [];
                    }
                    let info = {
                        'CardRefundAmount': RefundAmount,
                        'UserId': UserId,
                        'UserName': User
                    };
                    UserGroup[UserId].push(info);
                }
            }
        }
        if (req.Data.UserId > 0) {
            let opotherrefundamountInstance: any = await this.FindAll({
                attributes: ['RefundAmount', 'RefundGeneratedById'],
                where: {
                    RefundDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                    RefundGeneratedById: { '$eq': req.Data.UserId },
                    EncounterTypeId: { '$or': { '$eq': null, '$in': [1, 4] } },
                    PaymentTypeId: { '$notIn': [1, 5, 6] },
                    FacilityId: req.Data.FacilityId,
                    RefundStatusId: 1
                },
                include: [UserGroupJoin]
            });
            if (opotherrefundamountInstance) {
                let groupbills = _.groupBy(opotherrefundamountInstance, 'RefundGeneratedById');
                for (let i in groupbills) {
                    let groupedBills = groupbills[i];
                    let RefundAmount: number = 0;
                    let UserId: number = 0;
                    let User: string = '';
                    for (let i = 0; i < groupedBills.length; i++) {
                        let bills: any = groupedBills[i];
                        RefundAmount += bills.RefundAmount;
                        UserId = bills.RefundGeneratedById;
                        User = bills.RefundUser;
                        UserGroup[UserId] = UserGroup[UserId] || [];
                    }
                    let info = {
                        'OtherRefundAmount': RefundAmount,
                        'UserId': UserId,
                        'UserName': User
                    };
                    UserGroup[UserId].push(info);
                }
            }
        } else if (req.Data.UserId === 0) {
            let opotherrefundamountInstance: any = await this.FindAll({
                attributes: ['RefundAmount', 'RefundGeneratedById'],
                where: {
                    RefundDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                    RefundGeneratedById: { '$gt': req.Data.UserId },
                    EncounterTypeId: { '$or': { '$eq': null, '$in': [1, 4] } },
                    PaymentTypeId: { '$notIn': [1, 5, 6] },
                    FacilityId: req.Data.FacilityId,
                    RefundStatusId: 1
                },
                include: [UserGroupJoin]
            });
            if (opotherrefundamountInstance) {
                let groupbills = _.groupBy(opotherrefundamountInstance, 'RefundGeneratedById');
                for (let i in groupbills) {
                    let groupedBills = groupbills[i];
                    let RefundAmount: number = 0;
                    let UserId: number = 0;
                    let User: string = '';
                    for (let i = 0; i < groupedBills.length; i++) {
                        let bills: any = groupedBills[i];
                        RefundAmount += bills.RefundAmount;
                        UserId = bills.RefundGeneratedById;
                        User = bills.RefundUser;
                        UserGroup[UserId] = UserGroup[UserId] || [];
                    }
                    let info = {
                        'OtherRefundAmount': RefundAmount,
                        'UserId': UserId,
                        'UserName': User
                    };
                    UserGroup[UserId].push(info);
                }
            }
        }
        return UserGroup;
    }
    public async IPBillingRefundDetails(req: BaseRequest): Promise<any> {
        let UserGroup: { [id: number]: any[] } = {};
        let UserGroupJoin: any = {
            model: this.Models.User, as: 'RefundUser',
            attributes: ['FirstName', 'LastName'],
            // where: {
            //     UserTypeId: 1,
            // },
            required: true,
            include: [
                this.GetReference('Title')
            ]
        };
        if (req.Data.UserId > 0) {
            let oprefundamountInstance: any = await this.FindAll({
                attributes: ['RefundAmount', 'RefundGeneratedById'],
                where: {
                    RefundDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                    RefundGeneratedById: { '$eq': req.Data.UserId },
                    EncounterTypeId: { '$or': { '$eq': null, '$in': [2] } },
                    FacilityId: req.Data.FacilityId,
                    RefundStatusId: 1
                },
                include: [UserGroupJoin]
            });
            if (oprefundamountInstance) {
                let groupbills = _.groupBy(oprefundamountInstance, 'RefundGeneratedById');
                for (let i in groupbills) {
                    let groupedBills = groupbills[i];
                    let RefundAmount: number = 0;
                    let UserId: number = 0;
                    let User: string = '';
                    for (let i = 0; i < groupedBills.length; i++) {
                        let bills: any = groupedBills[i];
                        RefundAmount += bills.RefundAmount;
                        UserId = bills.RefundGeneratedById;
                        User = bills.RefundUser;
                        UserGroup[UserId] = UserGroup[UserId] || [];
                    }
                    let info = {
                        'NetRefundAmount': RefundAmount,
                        'UserId': UserId,
                        'UserName': User
                    };
                    UserGroup[UserId].push(info);
                }
            }
        } else if (req.Data.UserId === 0) {
            let oprefundamountInstance: any = await this.FindAll({
                attributes: ['RefundAmount', 'RefundGeneratedById'],
                where: {
                    RefundDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                    RefundGeneratedById: { '$gt': 0 },
                    EncounterTypeId: { '$or': { '$eq': null, '$in': [2] } },
                    FacilityId: req.Data.FacilityId,
                    RefundStatusId: 1
                },
                include: [UserGroupJoin]
            });
            if (oprefundamountInstance) {
                let groupbills = _.groupBy(oprefundamountInstance, 'RefundGeneratedById');
                for (let i in groupbills) {
                    let groupedBills = groupbills[i];
                    let RefundAmount: number = 0;
                    let UserId: number = 0;
                    let User: string = '';
                    for (let i = 0; i < groupedBills.length; i++) {
                        let bills: any = groupedBills[i];
                        RefundAmount += bills.RefundAmount;
                        UserId = bills.RefundGeneratedById;
                        User = bills.RefundUser;
                        UserGroup[UserId] = UserGroup[UserId] || [];
                    }
                    let info = {
                        'NetRefundAmount': RefundAmount,
                        'UserId': UserId,
                        'UserName': User
                    };
                    UserGroup[UserId].push(info);
                }
            }
        }
        if (req.Data.UserId > 0) {
            let opcashrefundamountInstance: any = await this.FindAll({
                attributes: ['RefundAmount', 'RefundGeneratedById'],
                where: {
                    RefundDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                    RefundGeneratedById: { '$eq': req.Data.UserId },
                    EncounterTypeId: { '$or': { '$eq': null, '$in': [2] } },
                    PaymentTypeId: 1,
                    FacilityId: req.Data.FacilityId,
                    RefundStatusId: 1
                },
                include: [UserGroupJoin]
            });
            if (opcashrefundamountInstance) {
                let groupbills = _.groupBy(opcashrefundamountInstance, 'RefundGeneratedById');
                for (let i in groupbills) {
                    let groupedBills = groupbills[i];
                    let RefundAmount: number = 0;
                    let UserId: number = 0;
                    let User: string = '';
                    for (let i = 0; i < groupedBills.length; i++) {
                        let bills: any = groupedBills[i];
                        RefundAmount += bills.RefundAmount;
                        UserId = bills.RefundGeneratedById;
                        User = bills.RefundUser;
                        UserGroup[UserId] = UserGroup[UserId] || [];
                    }
                    let info = {
                        'CashRefundAmount': RefundAmount,
                        'UserId': UserId,
                        'UserName': User
                    };
                    UserGroup[UserId].push(info);
                }
            }
        } else if (req.Data.UserId === 0) {
            let opcashrefundamountInstance: any = await this.FindAll({
                attributes: ['RefundAmount', 'RefundGeneratedById'],
                where: {
                    RefundDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                    RefundGeneratedById: { '$gt': 0 },
                    EncounterTypeId: { '$or': { '$eq': null, '$in': [2] } },
                    PaymentTypeId: 1,
                    FacilityId: req.Data.FacilityId,
                    RefundStatusId: 1
                },
                include: [UserGroupJoin]
            });
            if (opcashrefundamountInstance) {
                let groupbills = _.groupBy(opcashrefundamountInstance, 'RefundGeneratedById');
                for (let i in groupbills) {
                    let groupedBills = groupbills[i];
                    let RefundAmount: number = 0;
                    let UserId: number = 0;
                    let User: string = '';
                    for (let i = 0; i < groupedBills.length; i++) {
                        let bills: any = groupedBills[i];
                        RefundAmount += bills.RefundAmount;
                        UserId = bills.RefundGeneratedById;
                        User = bills.RefundUser;
                        UserGroup[UserId] = UserGroup[UserId] || [];
                    }
                    let info = {
                        'CashRefundAmount': RefundAmount,
                        'UserId': UserId,
                        'UserName': User
                    };
                    UserGroup[UserId].push(info);
                }
            }
        }
        if (req.Data.UserId > 0) {
            let opcardrefundamountInstance: any = await this.FindAll({
                attributes: ['RefundAmount', 'RefundGeneratedById'],
                where: {
                    RefundDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                    RefundGeneratedById: { '$eq': req.Data.UserId },
                    EncounterTypeId: { '$or': { '$eq': null, '$in': [2] } },
                    PaymentTypeId: { '$in': [5, 6] },
                    FacilityId: req.Data.FacilityId,
                    RefundStatusId: 1
                },
                include: [UserGroupJoin]
            });
            if (opcardrefundamountInstance) {
                let groupbills = _.groupBy(opcardrefundamountInstance, 'RefundGeneratedById');
                for (let i in groupbills) {
                    let groupedBills = groupbills[i];
                    let RefundAmount: number = 0;
                    let UserId: number = 0;
                    let User: string = '';
                    for (let i = 0; i < groupedBills.length; i++) {
                        let bills: any = groupedBills[i];
                        RefundAmount += bills.RefundAmount;
                        UserId = bills.RefundGeneratedById;
                        User = bills.RefundUser;
                        UserGroup[UserId] = UserGroup[UserId] || [];
                    }
                    let info = {
                        'CardRefundAmount': RefundAmount,
                        'UserId': UserId,
                        'UserName': User
                    };
                    UserGroup[UserId].push(info);
                }
            }
        } else if (req.Data.UserId === 0) {
            let opcardrefundamountInstance: any = await this.FindAll({
                attributes: ['RefundAmount', 'RefundGeneratedById'],
                where: {
                    RefundDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                    RefundGeneratedById: { '$gt': 0 },
                    EncounterTypeId: { '$or': { '$eq': null, '$in': [2] } },
                    PaymentTypeId: { '$in': [5, 6] },
                    FacilityId: req.Data.FacilityId,
                    RefundStatusId: 1
                },
                include: [UserGroupJoin]
            });
            if (opcardrefundamountInstance) {
                let groupbills = _.groupBy(opcardrefundamountInstance, 'RefundGeneratedById');
                for (let i in groupbills) {
                    let groupedBills = groupbills[i];
                    let RefundAmount: number = 0;
                    let UserId: number = 0;
                    let User: string = '';
                    for (let i = 0; i < groupedBills.length; i++) {
                        let bills: any = groupedBills[i];
                        RefundAmount += bills.RefundAmount;
                        UserId = bills.RefundGeneratedById;
                        User = bills.RefundUser;
                        UserGroup[UserId] = UserGroup[UserId] || [];
                    }
                    let info = {
                        'CardRefundAmount': RefundAmount,
                        'UserId': UserId,
                        'UserName': User
                    };
                    UserGroup[UserId].push(info);
                }
            }
        }
        if (req.Data.UserId > 0) {
            let opotherrefundamountInstance: any = await this.FindAll({
                attributes: ['RefundAmount', 'RefundGeneratedById'],
                where: {
                    RefundDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                    RefundGeneratedById: { '$eq': req.Data.UserId },
                    EncounterTypeId: { '$or': { '$eq': null, '$in': [2] } },
                    PaymentTypeId: { '$notIn': [1, 5, 6, 10, 11] },
                    FacilityId: req.Data.FacilityId,
                    RefundStatusId: 1
                },
                include: [UserGroupJoin]
            });
            if (opotherrefundamountInstance) {
                let groupbills = _.groupBy(opotherrefundamountInstance, 'RefundGeneratedById');
                for (let i in groupbills) {
                    let groupedBills = groupbills[i];
                    let RefundAmount: number = 0;
                    let UserId: number = 0;
                    let User: string = '';
                    for (let i = 0; i < groupedBills.length; i++) {
                        let bills: any = groupedBills[i];
                        RefundAmount += bills.RefundAmount;
                        UserId = bills.RefundGeneratedById;
                        User = bills.RefundUser;
                        UserGroup[UserId] = UserGroup[UserId] || [];
                    }
                    let info = {
                        'OtherRefundAmount': RefundAmount,
                        'UserId': UserId,
                        'UserName': User
                    };
                    UserGroup[UserId].push(info);
                }
            }
        } else if (req.Data.UserId === 0) {
            let opotherrefundamountInstance: any = await this.FindAll({
                attributes: ['RefundAmount', 'RefundGeneratedById'],
                where: {
                    RefundDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                    RefundGeneratedById: { '$gt': 0 },
                    EncounterTypeId: { '$or': { '$eq': null, '$in': [2] } },
                    PaymentTypeId: { '$notIn': [1, 5, 6, 10, 11] },
                    FacilityId: req.Data.FacilityId,
                    RefundStatusId: 1
                },
                include: [UserGroupJoin]
            });
            if (opotherrefundamountInstance) {
                let groupbills = _.groupBy(opotherrefundamountInstance, 'RefundGeneratedById');
                for (let i in groupbills) {
                    let groupedBills = groupbills[i];
                    let RefundAmount: number = 0;
                    let UserId: number = 0;
                    let User: string = '';
                    for (let i = 0; i < groupedBills.length; i++) {
                        let bills: any = groupedBills[i];
                        RefundAmount += bills.RefundAmount;
                        UserId = bills.RefundGeneratedById;
                        User = bills.RefundUser;
                        UserGroup[UserId] = UserGroup[UserId] || [];
                    }
                    let info = {
                        'OtherRefundAmount': RefundAmount,
                        'UserId': UserId,
                        'UserName': User
                    };
                    UserGroup[UserId].push(info);
                }
            }
        }
        if (req.Data.UserId > 0) {
            let opNetBankingrefundamountInstance: any = await this.FindAll({
                attributes: ['RefundAmount', 'RefundGeneratedById'],
                where: {
                    RefundDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                    RefundGeneratedById: { '$eq': req.Data.UserId },
                    EncounterTypeId: { '$or': { '$eq': null, '$in': [2] } },
                    PaymentTypeId: 10,
                    FacilityId: req.Data.FacilityId,
                    RefundStatusId: 1
                },
                include: [UserGroupJoin]
            });
            if (opNetBankingrefundamountInstance) {
                let groupbills = _.groupBy(opNetBankingrefundamountInstance, 'RefundGeneratedById');
                for (let i in groupbills) {
                    let groupedBills = groupbills[i];
                    let RefundAmount: number = 0;
                    let UserId: number = 0;
                    let User: string = '';
                    for (let i = 0; i < groupedBills.length; i++) {
                        let bills: any = groupedBills[i];
                        RefundAmount += bills.RefundAmount;
                        UserId = bills.RefundGeneratedById;
                        User = bills.RefundUser;
                        UserGroup[UserId] = UserGroup[UserId] || [];
                    }
                    let info = {
                        'NetBankingRefundAmount': RefundAmount,
                        'UserId': UserId,
                        'UserName': User
                    };
                    UserGroup[UserId].push(info);
                }
            }
        } else if (req.Data.UserId === 0) {
            let opNetBankingrefundamountInstance: any = await this.FindAll({
                attributes: ['RefundAmount', 'RefundGeneratedById'],
                where: {
                    RefundDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                    RefundGeneratedById: { '$gt': 0 },
                    EncounterTypeId: { '$or': { '$eq': null, '$in': [2] } },
                    PaymentTypeId: 10,
                    FacilityId: req.Data.FacilityId,
                    RefundStatusId: 1
                },
                include: [UserGroupJoin]
            });
            if (opNetBankingrefundamountInstance) {
                let groupbills = _.groupBy(opNetBankingrefundamountInstance, 'RefundGeneratedById');
                for (let i in groupbills) {
                    let groupedBills = groupbills[i];
                    let RefundAmount: number = 0;
                    let UserId: number = 0;
                    let User: string = '';
                    for (let i = 0; i < groupedBills.length; i++) {
                        let bills: any = groupedBills[i];
                        RefundAmount += bills.RefundAmount;
                        UserId = bills.RefundGeneratedById;
                        User = bills.RefundUser;
                        UserGroup[UserId] = UserGroup[UserId] || [];
                    }
                    let info = {
                        'NetBankingRefundAmount': RefundAmount,
                        'UserId': UserId,
                        'UserName': User
                    };
                    UserGroup[UserId].push(info);
                }
            }
        }
        if (req.Data.UserId > 0) {
            let opUPIrefundamountInstance: any = await this.FindAll({
                attributes: ['RefundAmount', 'RefundGeneratedById'],
                where: {
                    RefundDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                    RefundGeneratedById: { '$eq': req.Data.UserId },
                    EncounterTypeId: { '$or': { '$eq': null, '$in': [2] } },
                    PaymentTypeId: 11,
                    FacilityId: req.Data.FacilityId,
                    RefundStatusId: 1
                },
                include: [UserGroupJoin]
            });
            if (opUPIrefundamountInstance) {
                let groupbills = _.groupBy(opUPIrefundamountInstance, 'RefundGeneratedById');
                for (let i in groupbills) {
                    let groupedBills = groupbills[i];
                    let RefundAmount: number = 0;
                    let UserId: number = 0;
                    let User: string = '';
                    for (let i = 0; i < groupedBills.length; i++) {
                        let bills: any = groupedBills[i];
                        RefundAmount += bills.RefundAmount;
                        UserId = bills.RefundGeneratedById;
                        User = bills.RefundUser;
                        UserGroup[UserId] = UserGroup[UserId] || [];
                    }
                    let info = {
                        'UPIRefundAmount': RefundAmount,
                        'UserId': UserId,
                        'UserName': User
                    };
                    UserGroup[UserId].push(info);
                }
            }
        } else if (req.Data.UserId === 0) {
            let opUPIrefundamountInstance: any = await this.FindAll({
                attributes: ['RefundAmount', 'RefundGeneratedById'],
                where: {
                    RefundDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                    RefundGeneratedById: { '$gt': 0 },
                    EncounterTypeId: { '$or': { '$eq': null, '$in': [2] } },
                    PaymentTypeId: 11,
                    FacilityId: req.Data.FacilityId,
                    RefundStatusId: 1
                },
                include: [UserGroupJoin]
            });
            if (opUPIrefundamountInstance) {
                let groupbills = _.groupBy(opUPIrefundamountInstance, 'RefundGeneratedById');
                for (let i in groupbills) {
                    let groupedBills = groupbills[i];
                    let RefundAmount: number = 0;
                    let UserId: number = 0;
                    let User: string = '';
                    for (let i = 0; i < groupedBills.length; i++) {
                        let bills: any = groupedBills[i];
                        RefundAmount += bills.RefundAmount;
                        UserId = bills.RefundGeneratedById;
                        User = bills.RefundUser;
                        UserGroup[UserId] = UserGroup[UserId] || [];
                    }
                    let info = {
                        'UPIRefundAmount': RefundAmount,
                        'UserId': UserId,
                        'UserName': User
                    };
                    UserGroup[UserId].push(info);
                }
            }
        }
        return UserGroup;
    }
    public async OPRefundCollection(req: BaseRequest): Promise<any> {
        let OPBillResult: any = {};
        OPBillResult['DisplayOrder'] = 3;

        let opbillamountInstance: any = await this.Find({
            attributes: [
                [this.Dal.fn('SUM', this.Dal.col('RefundAmount')), 'TotalRefundAmount'],
            ],
            where: {
                RefundDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                EncounterTypeId: { '$or': { '$eq': null, '$in': [1, 4] } },
                FacilityId: req.Data.FacilityId,
                RefundStatusId: 1
            }
        });
        if (opbillamountInstance) {
            let bill: any = this.GetAttribute(opbillamountInstance);
            OPBillResult['RefundAmount'] = bill['TotalRefundAmount'];
        }

        let opbillamountcashInstance: any = await this.Find({
            attributes: [
                [this.Dal.fn('SUM', this.Dal.col('RefundAmount')), 'TotalRefundAmount'],
            ],
            where: {
                RefundDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                EncounterTypeId: { '$or': { '$eq': null, '$in': [1, 4] } },
                FacilityId: req.Data.FacilityId,
                RefundStatusId: 1,
                PaymentTypeId: 1,
            }
        });
        if (opbillamountcashInstance) {
            let bill: any = this.GetAttribute(opbillamountcashInstance);
            OPBillResult['CashAmount'] = bill['TotalRefundAmount'];
        }

        let opbillamountcardInstance: any = await this.Find({
            attributes: [
                [this.Dal.fn('SUM', this.Dal.col('RefundAmount')), 'TotalRefundAmount'],
            ],
            where: {
                RefundDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                EncounterTypeId: { '$or': { '$eq': null, '$in': [1, 4] } },
                FacilityId: req.Data.FacilityId,
                RefundStatusId: 1,
                PaymentTypeId: { '$in': [5, 6] }
            }
        });
        if (opbillamountcardInstance) {
            let bill: any = this.GetAttribute(opbillamountcardInstance);
            OPBillResult['CardAmount'] = bill['TotalRefundAmount'];
        }
        let opbillamountupiInstance: any = await this.Find({
            attributes: [
                [this.Dal.fn('SUM', this.Dal.col('RefundAmount')), 'TotalRefundAmount'],
            ],
            where: {
                RefundDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                EncounterTypeId: { '$or': { '$eq': null, '$in': [1, 4] } },
                FacilityId: req.Data.FacilityId,
                RefundStatusId: 1,
                PaymentTypeId: 11,
            }
        });
        if (opbillamountupiInstance) {
            let bill: any = this.GetAttribute(opbillamountupiInstance);
            OPBillResult['UPIAmount'] = bill['TotalRefundAmount'];
        }

        let opbillamountotherInstance: any = await this.Find({
            attributes: [
                [this.Dal.fn('SUM', this.Dal.col('RefundAmount')), 'TotalRefundAmount'],
            ],
            where: {
                RefundDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                EncounterTypeId: { '$or': { '$eq': null, '$in': [1, 4] } },
                FacilityId: req.Data.FacilityId,
                RefundStatusId: 1,
                PaymentTypeId: { '$notIn': [1, 5, 6, 11] }
            }
        });
        if (opbillamountotherInstance) {
            let bill: any = this.GetAttribute(opbillamountotherInstance);
            OPBillResult['OtherAmount'] = bill['TotalRefundAmount'];
        }

        return OPBillResult;
    }
    public async IPRefundCollection(req: BaseRequest): Promise<any> {
        let OPBillResult: any = {};
        OPBillResult['DisplayOrder'] = 6;

        let opbillamountInstance: any = await this.Find({
            attributes: [
                [this.Dal.fn('SUM', this.Dal.col('RefundAmount')), 'TotalRefundAmount'],
            ],
            where: {
                RefundDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                EncounterTypeId: { '$or': { '$eq': null, '$in': [2] } },
                FacilityId: req.Data.FacilityId,
                RefundStatusId: 1
            }
        });
        if (opbillamountInstance) {
            let bill: any = this.GetAttribute(opbillamountInstance);
            OPBillResult['RefundAmount'] = bill['TotalRefundAmount'];
        }

        let opbillamountcashInstance: any = await this.Find({
            attributes: [
                [this.Dal.fn('SUM', this.Dal.col('RefundAmount')), 'TotalRefundAmount'],
            ],
            where: {
                RefundDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                EncounterTypeId: { '$or': { '$eq': null, '$in': [2] } },
                FacilityId: req.Data.FacilityId,
                RefundStatusId: 1,
                PaymentTypeId: 1,
            }
        });
        if (opbillamountcashInstance) {
            let bill: any = this.GetAttribute(opbillamountcashInstance);
            OPBillResult['CashAmount'] = bill['TotalRefundAmount'];
        }

        let opbillamountcardInstance: any = await this.Find({
            attributes: [
                [this.Dal.fn('SUM', this.Dal.col('RefundAmount')), 'TotalRefundAmount'],
            ],
            where: {
                RefundDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                EncounterTypeId: { '$or': { '$eq': null, '$in': [2] } },
                FacilityId: req.Data.FacilityId,
                RefundStatusId: 1,
                PaymentTypeId: { '$in': [5, 6] }
            }
        });
        if (opbillamountcardInstance) {
            let bill: any = this.GetAttribute(opbillamountcardInstance);
            OPBillResult['CardAmount'] = bill['TotalRefundAmount'];
        }
        let opbillamountupiInstance: any = await this.Find({
            attributes: [
                [this.Dal.fn('SUM', this.Dal.col('RefundAmount')), 'TotalRefundAmount'],
            ],
            where: {
                RefundDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                EncounterTypeId: { '$or': { '$eq': null, '$in': [2] } },
                FacilityId: req.Data.FacilityId,
                RefundStatusId: 1,
                PaymentTypeId: 11,
            }
        });
        if (opbillamountupiInstance) {
            let bill: any = this.GetAttribute(opbillamountupiInstance);
            OPBillResult['UPIAmount'] = bill['TotalRefundAmount'];
        }
        let opbillamountotherInstance: any = await this.Find({
            attributes: [
                [this.Dal.fn('SUM', this.Dal.col('RefundAmount')), 'TotalRefundAmount'],
            ],
            where: {
                RefundDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                EncounterTypeId: { '$or': { '$eq': null, '$in': [2] } },
                FacilityId: req.Data.FacilityId,
                RefundStatusId: 1,
                PaymentTypeId: { '$notIn': [1, 5, 6, 11] }
            }
        });
        if (opbillamountotherInstance) {
            let bill: any = this.GetAttribute(opbillamountotherInstance);
            OPBillResult['OtherAmount'] = bill['TotalRefundAmount'];
        }

        return OPBillResult;
    }
    public async PharmacyRefundCollection(req: BaseRequest): Promise<any> {
        let OPBillResult: any = {};
        OPBillResult['DisplayOrder'] = 9;

        let opbillamountInstance: any = await this.Find({
            attributes: [
                [this.Dal.fn('SUM', this.Dal.col('RefundAmount')), 'TotalRefundAmount'],
            ],
            where: {
                RefundDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                // EncounterTypeId: { '$or': { '$eq': null, '$in': [2] } },
                FacilityId: req.Data.FacilityId,
                RefundStatusId: 1,
                RefundTypeId: 4,
                PatientReturnId: { '$gt': 0 },
            }
        });
        if (opbillamountInstance) {
            let bill: any = this.GetAttribute(opbillamountInstance);
            OPBillResult['RefundAmount'] = bill['TotalRefundAmount'];
        }

        let opbillamountcashInstance: any = await this.Find({
            attributes: [
                [this.Dal.fn('SUM', this.Dal.col('RefundAmount')), 'TotalRefundAmount'],
            ],
            where: {
                RefundDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                // EncounterTypeId: { '$or': { '$eq': null, '$in': [2] } },
                FacilityId: req.Data.FacilityId,
                RefundStatusId: 1,
                RefundTypeId: 4,
                PaymentTypeId: 1,
                PatientReturnId: { '$gt': 0 },
            }
        });
        if (opbillamountcashInstance) {
            let bill: any = this.GetAttribute(opbillamountcashInstance);
            OPBillResult['CashAmount'] = bill['TotalRefundAmount'];
        }

        let opbillamountcardInstance: any = await this.Find({
            attributes: [
                [this.Dal.fn('SUM', this.Dal.col('RefundAmount')), 'TotalRefundAmount'],
            ],
            where: {
                RefundDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                // EncounterTypeId: { '$or': { '$eq': null, '$in': [2] } },
                FacilityId: req.Data.FacilityId,
                RefundStatusId: 1,
                RefundTypeId: 4,
                PaymentTypeId: { '$in': [5, 6] },
                PatientReturnId: { '$gt': 0 },
            }
        });
        if (opbillamountcardInstance) {
            let bill: any = this.GetAttribute(opbillamountcardInstance);
            OPBillResult['CardAmount'] = bill['TotalRefundAmount'];
        }
        let opbillamountupiInstance: any = await this.Find({
            attributes: [
                [this.Dal.fn('SUM', this.Dal.col('RefundAmount')), 'TotalRefundAmount'],
            ],
            where: {
                RefundDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                // EncounterTypeId: { '$or': { '$eq': null, '$in': [2] } },
                FacilityId: req.Data.FacilityId,
                RefundStatusId: 1,
                RefundTypeId: 4,
                PaymentTypeId: 11,
                PatientReturnId: { '$gt': 0 },
            }
        });
        if (opbillamountupiInstance) {
            let bill: any = this.GetAttribute(opbillamountupiInstance);
            OPBillResult['UPIAmount'] = bill['TotalRefundAmount'];
        }
        let opbillamountotherInstance: any = await this.Find({
            attributes: [
                [this.Dal.fn('SUM', this.Dal.col('RefundAmount')), 'TotalRefundAmount'],
            ],
            where: {
                RefundDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                EncounterTypeId: { '$or': { '$eq': null, '$in': [2] } },
                FacilityId: req.Data.FacilityId,
                RefundStatusId: 1,
                RefundTypeId: 4,
                PaymentTypeId: { '$notIn': [1, 5, 6, 11] },
                PatientReturnId: { '$gt': 0 },
            }
        });
        if (opbillamountotherInstance) {
            let bill: any = this.GetAttribute(opbillamountotherInstance);
            OPBillResult['OtherAmount'] = bill['TotalRefundAmount'];
        }

        return OPBillResult;
    }

    public async OPUserRefundDetails(req: BaseRequest): Promise<any> {
        let UserGroup: { [id: number]: any[] } = {};
        let UserGroupJoin: any = {
            model: this.Models.User, as: 'RefundUser',
            attributes: ['FirstName', 'LastName'],
            // where: {
            //     UserTypeId: 1,
            // },
            required: true,
            include: [
                this.GetReference('Title')
            ]
        };
        // if (req.Data.UserId > 0) {
        //     let oprefundamountInstance: any = await this.FindAll({
        //         attributes: ['RefundAmount', 'RefundGeneratedById'],
        //         where: {
        //             RefundDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
        //             RefundGeneratedById: { '$eq': req.Data.UserId },
        //             EncounterTypeId: { '$or': { '$eq': null, '$in': [1,4] } },
        //             FacilityId: req.Data.FacilityId,
        //             RefundStatusId: 1
        //         },
        //         include: [UserGroupJoin]
        //     });
        //     if (oprefundamountInstance) {
        //         let groupbills = _.groupBy(oprefundamountInstance, 'RefundGeneratedById');
        //         for (let i in groupbills) {
        //             let groupedBills = groupbills[i];
        //             let RefundAmount: number = 0;
        //             let UserId: number = 0;
        //             let User: string = '';
        //             for (let i = 0; i < groupedBills.length; i++) {
        //                 let bills: any = groupedBills[i];
        //                 RefundAmount += bills.RefundAmount;
        //                 UserId = bills.RefundGeneratedById;
        //                 User = bills.RefundUser;
        //                 UserGroup[UserId] = UserGroup[UserId] || [];
        //             }
        //             let info = {
        //                 'NetRefundAmount': RefundAmount,
        //                 'UserId': UserId,
        //                 'UserName': User
        //             };
        //             UserGroup[UserId].push(info);
        //         }
        //     }
        // } else if (req.Data.UserId === 0) {
        //     let oprefundamountInstance: any = await this.FindAll({
        //         attributes: ['RefundAmount', 'RefundGeneratedById'],
        //         where: {
        //             RefundDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
        //             RefundGeneratedById: { '$gt': req.Data.UserId },
        //             EncounterTypeId: { '$or': { '$eq': null, '$in': [1,4] } },
        //             FacilityId: req.Data.FacilityId,
        //             RefundStatusId: 1
        //         },
        //         include: [UserGroupJoin]
        //     });
        //     if (oprefundamountInstance) {
        //         let groupbills = _.groupBy(oprefundamountInstance, 'RefundGeneratedById');
        //         for (let i in groupbills) {
        //             let groupedBills = groupbills[i];
        //             let RefundAmount: number = 0;
        //             let UserId: number = 0;
        //             let User: string = '';
        //             for (let i = 0; i < groupedBills.length; i++) {
        //                 let bills: any = groupedBills[i];
        //                 RefundAmount += bills.RefundAmount;
        //                 UserId = bills.RefundGeneratedById;
        //                 User = bills.RefundUser;
        //                 UserGroup[UserId] = UserGroup[UserId] || [];
        //             }
        //             let info = {
        //                 'NetRefundAmount': RefundAmount,
        //                 'UserId': UserId,
        //                 'UserName': User
        //             };
        //             UserGroup[UserId].push(info);
        //         }
        //     }
        // }
        if (req.Data.UserId > 0) {
            let opcashrefundamountInstance: any = await this.FindAll({
                attributes: ['RefundAmount', 'RefundGeneratedById'],
                where: {
                    RefundDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                    RefundGeneratedById: { '$eq': req.Data.UserId },
                    EncounterTypeId: { '$or': { '$eq': null, '$in': [1, 4] } },
                    PaymentTypeId: 1,
                    FacilityId: req.Data.FacilityId,
                    RefundStatusId: 1
                },
                include: [UserGroupJoin]
            });
            if (opcashrefundamountInstance) {
                let groupbills = _.groupBy(opcashrefundamountInstance, 'RefundGeneratedById');
                for (let i in groupbills) {
                    let groupedBills = groupbills[i];
                    let RefundAmount: number = 0;
                    let UserId: number = 0;
                    let User: string = '';
                    for (let i = 0; i < groupedBills.length; i++) {
                        let bills: any = groupedBills[i];
                        RefundAmount += bills.RefundAmount;
                        UserId = bills.RefundGeneratedById;
                        User = bills.RefundUser;
                        UserGroup[UserId] = UserGroup[UserId] || [];
                    }
                    let info = {
                        'OPCashRefundAmount': RefundAmount,
                        'UserId': UserId,
                        'UserName': User
                    };
                    UserGroup[UserId].push(info);
                }
            }
        } else if (req.Data.UserId === 0) {
            let opcashrefundamountInstance: any = await this.FindAll({
                attributes: ['RefundAmount', 'RefundGeneratedById'],
                where: {
                    RefundDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                    RefundGeneratedById: { '$gt': req.Data.UserId },
                    EncounterTypeId: { '$or': { '$eq': null, '$in': [1, 4] } },
                    PaymentTypeId: 1,
                    FacilityId: req.Data.FacilityId,
                    RefundStatusId: 1
                },
                include: [UserGroupJoin]
            });
            if (opcashrefundamountInstance) {
                let groupbills = _.groupBy(opcashrefundamountInstance, 'RefundGeneratedById');
                for (let i in groupbills) {
                    let groupedBills = groupbills[i];
                    let RefundAmount: number = 0;
                    let UserId: number = 0;
                    let User: string = '';
                    for (let i = 0; i < groupedBills.length; i++) {
                        let bills: any = groupedBills[i];
                        RefundAmount += bills.RefundAmount;
                        UserId = bills.RefundGeneratedById;
                        User = bills.RefundUser;
                        UserGroup[UserId] = UserGroup[UserId] || [];
                    }
                    let info = {
                        'OPCashRefundAmount': RefundAmount,
                        'UserId': UserId,
                        'UserName': User
                    };
                    UserGroup[UserId].push(info);
                }
            }
        }
        if (req.Data.UserId > 0) {
            let opotherrefundamountInstance: any = await this.FindAll({
                attributes: ['RefundAmount', 'RefundGeneratedById'],
                where: {
                    RefundDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                    RefundGeneratedById: { '$eq': req.Data.UserId },
                    EncounterTypeId: { '$or': { '$eq': null, '$in': [1, 4] } },
                    PaymentTypeId: { '$notIn': [1] },
                    FacilityId: req.Data.FacilityId,
                    RefundStatusId: 1
                },
                include: [UserGroupJoin]
            });
            if (opotherrefundamountInstance) {
                let groupbills = _.groupBy(opotherrefundamountInstance, 'RefundGeneratedById');
                for (let i in groupbills) {
                    let groupedBills = groupbills[i];
                    let RefundAmount: number = 0;
                    let UserId: number = 0;
                    let User: string = '';
                    for (let i = 0; i < groupedBills.length; i++) {
                        let bills: any = groupedBills[i];
                        RefundAmount += bills.RefundAmount;
                        UserId = bills.RefundGeneratedById;
                        User = bills.RefundUser;
                        UserGroup[UserId] = UserGroup[UserId] || [];
                    }
                    let info = {
                        'OPOtherRefundAmount': RefundAmount,
                        'UserId': UserId,
                        'UserName': User
                    };
                    UserGroup[UserId].push(info);
                }
            }
        } else if (req.Data.UserId === 0) {
            let opotherrefundamountInstance: any = await this.FindAll({
                attributes: ['RefundAmount', 'RefundGeneratedById'],
                where: {
                    RefundDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                    RefundGeneratedById: { '$gt': req.Data.UserId },
                    EncounterTypeId: { '$or': { '$eq': null, '$in': [1, 4] } },
                    PaymentTypeId: { '$notIn': [1] },
                    FacilityId: req.Data.FacilityId,
                    RefundStatusId: 1
                },
                include: [UserGroupJoin]
            });
            if (opotherrefundamountInstance) {
                let groupbills = _.groupBy(opotherrefundamountInstance, 'RefundGeneratedById');
                for (let i in groupbills) {
                    let groupedBills = groupbills[i];
                    let RefundAmount: number = 0;
                    let UserId: number = 0;
                    let User: string = '';
                    for (let i = 0; i < groupedBills.length; i++) {
                        let bills: any = groupedBills[i];
                        RefundAmount += bills.RefundAmount;
                        UserId = bills.RefundGeneratedById;
                        User = bills.RefundUser;
                        UserGroup[UserId] = UserGroup[UserId] || [];
                    }
                    let info = {
                        'OPOtherRefundAmount': RefundAmount,
                        'UserId': UserId,
                        'UserName': User
                    };
                    UserGroup[UserId].push(info);
                }
            }
        }
        return UserGroup;
    }
    public async IPUserRefundDetails(req: BaseRequest): Promise<any> {
        let UserGroup: { [id: number]: any[] } = {};
        let UserGroupJoin: any = {
            model: this.Models.User, as: 'RefundUser',
            attributes: ['FirstName', 'LastName'],
            // where: {
            //     UserTypeId: 1,
            // },
            required: true,
            include: [
                this.GetReference('Title')
            ]
        };
        // if (req.Data.UserId > 0) {
        //     let oprefundamountInstance: any = await this.FindAll({
        //         attributes: ['RefundAmount', 'RefundGeneratedById'],
        //         where: {
        //             RefundDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
        //             RefundGeneratedById: { '$eq': req.Data.UserId },
        //             EncounterTypeId: { '$or': { '$eq': null, '$in': [1,4] } },
        //             FacilityId: req.Data.FacilityId,
        //             RefundStatusId: 1
        //         },
        //         include: [UserGroupJoin]
        //     });
        //     if (oprefundamountInstance) {
        //         let groupbills = _.groupBy(oprefundamountInstance, 'RefundGeneratedById');
        //         for (let i in groupbills) {
        //             let groupedBills = groupbills[i];
        //             let RefundAmount: number = 0;
        //             let UserId: number = 0;
        //             let User: string = '';
        //             for (let i = 0; i < groupedBills.length; i++) {
        //                 let bills: any = groupedBills[i];
        //                 RefundAmount += bills.RefundAmount;
        //                 UserId = bills.RefundGeneratedById;
        //                 User = bills.RefundUser;
        //                 UserGroup[UserId] = UserGroup[UserId] || [];
        //             }
        //             let info = {
        //                 'NetRefundAmount': RefundAmount,
        //                 'UserId': UserId,
        //                 'UserName': User
        //             };
        //             UserGroup[UserId].push(info);
        //         }
        //     }
        // } else if (req.Data.UserId === 0) {
        //     let oprefundamountInstance: any = await this.FindAll({
        //         attributes: ['RefundAmount', 'RefundGeneratedById'],
        //         where: {
        //             RefundDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
        //             RefundGeneratedById: { '$gt': req.Data.UserId },
        //             EncounterTypeId: { '$or': { '$eq': null, '$in': [1,4] } },
        //             FacilityId: req.Data.FacilityId,
        //             RefundStatusId: 1
        //         },
        //         include: [UserGroupJoin]
        //     });
        //     if (oprefundamountInstance) {
        //         let groupbills = _.groupBy(oprefundamountInstance, 'RefundGeneratedById');
        //         for (let i in groupbills) {
        //             let groupedBills = groupbills[i];
        //             let RefundAmount: number = 0;
        //             let UserId: number = 0;
        //             let User: string = '';
        //             for (let i = 0; i < groupedBills.length; i++) {
        //                 let bills: any = groupedBills[i];
        //                 RefundAmount += bills.RefundAmount;
        //                 UserId = bills.RefundGeneratedById;
        //                 User = bills.RefundUser;
        //                 UserGroup[UserId] = UserGroup[UserId] || [];
        //             }
        //             let info = {
        //                 'NetRefundAmount': RefundAmount,
        //                 'UserId': UserId,
        //                 'UserName': User
        //             };
        //             UserGroup[UserId].push(info);
        //         }
        //     }
        // }
        if (req.Data.UserId > 0) {
            let ipcashrefundamountInstance: any = await this.FindAll({
                attributes: ['RefundAmount', 'RefundGeneratedById'],
                where: {
                    RefundDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                    RefundGeneratedById: { '$eq': req.Data.UserId },
                    EncounterTypeId: { '$or': { '$eq': null, '$in': [2] } },
                    PaymentTypeId: 1,
                    FacilityId: req.Data.FacilityId,
                    RefundStatusId: 1
                },
                include: [UserGroupJoin]
            });
            if (ipcashrefundamountInstance) {
                let groupbills = _.groupBy(ipcashrefundamountInstance, 'RefundGeneratedById');
                for (let i in groupbills) {
                    let groupedBills = groupbills[i];
                    let RefundAmount: number = 0;
                    let UserId: number = 0;
                    let User: string = '';
                    for (let i = 0; i < groupedBills.length; i++) {
                        let bills: any = groupedBills[i];
                        RefundAmount += bills.RefundAmount;
                        UserId = bills.RefundGeneratedById;
                        User = bills.RefundUser;
                        UserGroup[UserId] = UserGroup[UserId] || [];
                    }
                    let info = {
                        'IPCashRefundAmount': RefundAmount,
                        'UserId': UserId,
                        'UserName': User
                    };
                    UserGroup[UserId].push(info);
                }
            }
        } else if (req.Data.UserId === 0) {
            let ipcashrefundamountInstance: any = await this.FindAll({
                attributes: ['RefundAmount', 'RefundGeneratedById'],
                where: {
                    RefundDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                    RefundGeneratedById: { '$gt': req.Data.UserId },
                    EncounterTypeId: { '$or': { '$eq': null, '$in': [2] } },
                    PaymentTypeId: 1,
                    FacilityId: req.Data.FacilityId,
                    RefundStatusId: 1
                },
                include: [UserGroupJoin]
            });
            if (ipcashrefundamountInstance) {
                let groupbills = _.groupBy(ipcashrefundamountInstance, 'RefundGeneratedById');
                for (let i in groupbills) {
                    let groupedBills = groupbills[i];
                    let RefundAmount: number = 0;
                    let UserId: number = 0;
                    let User: string = '';
                    for (let i = 0; i < groupedBills.length; i++) {
                        let bills: any = groupedBills[i];
                        RefundAmount += bills.RefundAmount;
                        UserId = bills.RefundGeneratedById;
                        User = bills.RefundUser;
                        UserGroup[UserId] = UserGroup[UserId] || [];
                    }
                    let info = {
                        'IPCashRefundAmount': RefundAmount,
                        'UserId': UserId,
                        'UserName': User
                    };
                    UserGroup[UserId].push(info);
                }
            }
        }
        if (req.Data.UserId > 0) {
            let ipotherrefundamountInstance: any = await this.FindAll({
                attributes: ['RefundAmount', 'RefundGeneratedById'],
                where: {
                    RefundDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                    RefundGeneratedById: { '$eq': req.Data.UserId },
                    EncounterTypeId: { '$or': { '$eq': null, '$in': [2] } },
                    PaymentTypeId: { '$notIn': [1] },
                    FacilityId: req.Data.FacilityId,
                    RefundStatusId: 1
                },
                include: [UserGroupJoin]
            });
            if (ipotherrefundamountInstance) {
                let groupbills = _.groupBy(ipotherrefundamountInstance, 'RefundGeneratedById');
                for (let i in groupbills) {
                    let groupedBills = groupbills[i];
                    let RefundAmount: number = 0;
                    let UserId: number = 0;
                    let User: string = '';
                    for (let i = 0; i < groupedBills.length; i++) {
                        let bills: any = groupedBills[i];
                        RefundAmount += bills.RefundAmount;
                        UserId = bills.RefundGeneratedById;
                        User = bills.RefundUser;
                        UserGroup[UserId] = UserGroup[UserId] || [];
                    }
                    let info = {
                        'IPOtherRefundAmount': RefundAmount,
                        'UserId': UserId,
                        'UserName': User
                    };
                    UserGroup[UserId].push(info);
                }
            }
        } else if (req.Data.UserId === 0) {
            let ipotherrefundamountInstance: any = await this.FindAll({
                attributes: ['RefundAmount', 'RefundGeneratedById'],
                where: {
                    RefundDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                    RefundGeneratedById: { '$gt': req.Data.UserId },
                    EncounterTypeId: { '$or': { '$eq': null, '$in': [2] } },
                    PaymentTypeId: { '$notIn': [1] },
                    FacilityId: req.Data.FacilityId,
                    RefundStatusId: 1
                },
                include: [UserGroupJoin]
            });
            if (ipotherrefundamountInstance) {
                let groupbills = _.groupBy(ipotherrefundamountInstance, 'RefundGeneratedById');
                for (let i in groupbills) {
                    let groupedBills = groupbills[i];
                    let RefundAmount: number = 0;
                    let UserId: number = 0;
                    let User: string = '';
                    for (let i = 0; i < groupedBills.length; i++) {
                        let bills: any = groupedBills[i];
                        RefundAmount += bills.RefundAmount;
                        UserId = bills.RefundGeneratedById;
                        User = bills.RefundUser;
                        UserGroup[UserId] = UserGroup[UserId] || [];
                    }
                    let info = {
                        'IPOtherRefundAmount': RefundAmount,
                        'UserId': UserId,
                        'UserName': User
                    };
                    UserGroup[UserId].push(info);
                }
            }
        }
        return UserGroup;
    }
    public async OverallRefundDetails(req: BaseRequest): Promise<any> {
        let UserGroup: { [id: number]: any[] } = {};
        let UserGroupJoin: any = {
            model: this.Models.User, as: 'RefundUser',
            attributes: ['FirstName', 'LastName'],
            // where: {
            //     UserTypeId: 1,
            // },
            required: true,
            include: [
                this.GetReference('Title')
            ]
        };
        if (req.Data.UserId > 0) {
            let oprefundamountInstance: any = await this.FindAll({
                attributes: ['RefundAmount', 'RefundGeneratedById'],
                where: {
                    RefundDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                    RefundGeneratedById: { '$eq': req.Data.UserId },
                    // EncounterTypeId: { '$or': { '$eq': null, '$in': [1,2] } },
                    FacilityId: req.Data.FacilityId,
                    RefundStatusId: 1
                },
                include: [UserGroupJoin]
            });
            if (oprefundamountInstance) {
                let groupbills = _.groupBy(oprefundamountInstance, 'RefundGeneratedById');
                for (let i in groupbills) {
                    let groupedBills = groupbills[i];
                    let RefundAmount: number = 0;
                    let UserId: number = 0;
                    let User: string = '';
                    for (let i = 0; i < groupedBills.length; i++) {
                        let bills: any = groupedBills[i];
                        RefundAmount += bills.RefundAmount;
                        UserId = bills.RefundGeneratedById;
                        User = bills.RefundUser;
                        UserGroup[UserId] = UserGroup[UserId] || [];
                    }
                    let info = {
                        'NetRefundAmount': RefundAmount,
                        'UserId': UserId,
                        'UserName': User
                    };
                    UserGroup[UserId].push(info);
                }
            }
        } else if (req.Data.UserId === 0) {
            let oprefundamountInstance: any = await this.FindAll({
                attributes: ['RefundAmount', 'RefundGeneratedById'],
                where: {
                    RefundDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                    RefundGeneratedById: { '$gt': req.Data.UserId },
                    // EncounterTypeId: { '$or': { '$eq': null, '$in': [1] } },
                    FacilityId: req.Data.FacilityId,
                    RefundStatusId: 1
                },
                include: [UserGroupJoin]
            });
            if (oprefundamountInstance) {
                let groupbills = _.groupBy(oprefundamountInstance, 'RefundGeneratedById');
                for (let i in groupbills) {
                    let groupedBills = groupbills[i];
                    let RefundAmount: number = 0;
                    let UserId: number = 0;
                    let User: string = '';
                    for (let i = 0; i < groupedBills.length; i++) {
                        let bills: any = groupedBills[i];
                        RefundAmount += bills.RefundAmount;
                        UserId = bills.RefundGeneratedById;
                        User = bills.RefundUser;
                        UserGroup[UserId] = UserGroup[UserId] || [];
                    }
                    let info = {
                        'NetRefundAmount': RefundAmount,
                        'UserId': UserId,
                        'UserName': User
                    };
                    UserGroup[UserId].push(info);
                }
            }
        }
        if (req.Data.UserId > 0) {
            let opcashrefundamountInstance: any = await this.FindAll({
                attributes: ['RefundAmount', 'RefundGeneratedById'],
                where: {
                    RefundDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                    RefundGeneratedById: { '$eq': req.Data.UserId },
                    // EncounterTypeId: { '$or': { '$eq': null, '$in': [1] } },
                    PaymentTypeId: 1,
                    FacilityId: req.Data.FacilityId,
                    RefundStatusId: 1
                },
                include: [UserGroupJoin]
            });
            if (opcashrefundamountInstance) {
                let groupbills = _.groupBy(opcashrefundamountInstance, 'RefundGeneratedById');
                for (let i in groupbills) {
                    let groupedBills = groupbills[i];
                    let RefundAmount: number = 0;
                    let UserId: number = 0;
                    let User: string = '';
                    for (let i = 0; i < groupedBills.length; i++) {
                        let bills: any = groupedBills[i];
                        RefundAmount += bills.RefundAmount;
                        UserId = bills.RefundGeneratedById;
                        User = bills.RefundUser;
                        UserGroup[UserId] = UserGroup[UserId] || [];
                    }
                    let info = {
                        'CashRefundAmount': RefundAmount,
                        'UserId': UserId,
                        'UserName': User
                    };
                    UserGroup[UserId].push(info);
                }
            }
        } else if (req.Data.UserId === 0) {
            let opcashrefundamountInstance: any = await this.FindAll({
                attributes: ['RefundAmount', 'RefundGeneratedById'],
                where: {
                    RefundDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                    RefundGeneratedById: { '$gt': req.Data.UserId },
                    // EncounterTypeId: { '$or': { '$eq': null, '$in': [1] } },
                    PaymentTypeId: 1,
                    FacilityId: req.Data.FacilityId,
                    RefundStatusId: 1
                },
                include: [UserGroupJoin]
            });
            if (opcashrefundamountInstance) {
                let groupbills = _.groupBy(opcashrefundamountInstance, 'RefundGeneratedById');
                for (let i in groupbills) {
                    let groupedBills = groupbills[i];
                    let RefundAmount: number = 0;
                    let UserId: number = 0;
                    let User: string = '';
                    for (let i = 0; i < groupedBills.length; i++) {
                        let bills: any = groupedBills[i];
                        RefundAmount += bills.RefundAmount;
                        UserId = bills.RefundGeneratedById;
                        User = bills.RefundUser;
                        UserGroup[UserId] = UserGroup[UserId] || [];
                    }
                    let info = {
                        'CashRefundAmount': RefundAmount,
                        'UserId': UserId,
                        'UserName': User
                    };
                    UserGroup[UserId].push(info);
                }
            }
        }
        if (req.Data.UserId > 0) {
            let opcardrefundamountInstance: any = await this.FindAll({
                attributes: ['RefundAmount', 'RefundGeneratedById'],
                where: {
                    RefundDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                    RefundGeneratedById: { '$eq': req.Data.UserId },
                    // EncounterTypeId: { '$or': { '$eq': null, '$in': [1] } },
                    PaymentTypeId: { '$in': [5, 6] },
                    FacilityId: req.Data.FacilityId,
                    RefundStatusId: 1
                },
                include: [UserGroupJoin]
            });
            if (opcardrefundamountInstance) {
                let groupbills = _.groupBy(opcardrefundamountInstance, 'RefundGeneratedById');
                for (let i in groupbills) {
                    let groupedBills = groupbills[i];
                    let RefundAmount: number = 0;
                    let UserId: number = 0;
                    let User: string = '';
                    for (let i = 0; i < groupedBills.length; i++) {
                        let bills: any = groupedBills[i];
                        RefundAmount += bills.RefundAmount;
                        UserId = bills.RefundGeneratedById;
                        User = bills.RefundUser;
                        UserGroup[UserId] = UserGroup[UserId] || [];
                    }
                    let info = {
                        'CardRefundAmount': RefundAmount,
                        'UserId': UserId,
                        'UserName': User
                    };
                    UserGroup[UserId].push(info);
                }
            }
        } else if (req.Data.UserId === 0) {
            let opcardrefundamountInstance: any = await this.FindAll({
                attributes: ['RefundAmount', 'RefundGeneratedById'],
                where: {
                    RefundDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                    RefundGeneratedById: { '$gt': req.Data.UserId },
                    // EncounterTypeId: { '$or': { '$eq': null, '$in': [1] } },
                    PaymentTypeId: { '$in': [5, 6] },
                    FacilityId: req.Data.FacilityId,
                    RefundStatusId: 1
                },
                include: [UserGroupJoin]
            });
            if (opcardrefundamountInstance) {
                let groupbills = _.groupBy(opcardrefundamountInstance, 'RefundGeneratedById');
                for (let i in groupbills) {
                    let groupedBills = groupbills[i];
                    let RefundAmount: number = 0;
                    let UserId: number = 0;
                    let User: string = '';
                    for (let i = 0; i < groupedBills.length; i++) {
                        let bills: any = groupedBills[i];
                        RefundAmount += bills.RefundAmount;
                        UserId = bills.RefundGeneratedById;
                        User = bills.RefundUser;
                        UserGroup[UserId] = UserGroup[UserId] || [];
                    }
                    let info = {
                        'CardRefundAmount': RefundAmount,
                        'UserId': UserId,
                        'UserName': User
                    };
                    UserGroup[UserId].push(info);
                }
            }
        }
        if (req.Data.UserId > 0) {
            let opotherrefundamountInstance: any = await this.FindAll({
                attributes: ['RefundAmount', 'RefundGeneratedById'],
                where: {
                    RefundDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                    RefundGeneratedById: { '$eq': req.Data.UserId },
                    // EncounterTypeId: { '$or': { '$eq': null, '$in': [1] } },
                    PaymentTypeId: { '$notIn': [1, 5, 6] },
                    FacilityId: req.Data.FacilityId,
                    RefundStatusId: 1
                },
                include: [UserGroupJoin]
            });
            if (opotherrefundamountInstance) {
                let groupbills = _.groupBy(opotherrefundamountInstance, 'RefundGeneratedById');
                for (let i in groupbills) {
                    let groupedBills = groupbills[i];
                    let RefundAmount: number = 0;
                    let UserId: number = 0;
                    let User: string = '';
                    for (let i = 0; i < groupedBills.length; i++) {
                        let bills: any = groupedBills[i];
                        RefundAmount += bills.RefundAmount;
                        UserId = bills.RefundGeneratedById;
                        User = bills.RefundUser;
                        UserGroup[UserId] = UserGroup[UserId] || [];
                    }
                    let info = {
                        'OtherRefundAmount': RefundAmount,
                        'UserId': UserId,
                        'UserName': User
                    };
                    UserGroup[UserId].push(info);
                }
            }
        } else if (req.Data.UserId === 0) {
            let opotherrefundamountInstance: any = await this.FindAll({
                attributes: ['RefundAmount', 'RefundGeneratedById'],
                where: {
                    RefundDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                    RefundGeneratedById: { '$gt': req.Data.UserId },
                    // EncounterTypeId: { '$or': { '$eq': null, '$in': [1] } },
                    PaymentTypeId: { '$notIn': [1, 5, 6] },
                    FacilityId: req.Data.FacilityId,
                    RefundStatusId: 1
                },
                include: [UserGroupJoin]
            });
            if (opotherrefundamountInstance) {
                let groupbills = _.groupBy(opotherrefundamountInstance, 'RefundGeneratedById');
                for (let i in groupbills) {
                    let groupedBills = groupbills[i];
                    let RefundAmount: number = 0;
                    let UserId: number = 0;
                    let User: string = '';
                    for (let i = 0; i < groupedBills.length; i++) {
                        let bills: any = groupedBills[i];
                        RefundAmount += bills.RefundAmount;
                        UserId = bills.RefundGeneratedById;
                        User = bills.RefundUser;
                        UserGroup[UserId] = UserGroup[UserId] || [];
                    }
                    let info = {
                        'OtherRefundAmount': RefundAmount,
                        'UserId': UserId,
                        'UserName': User
                    };
                    UserGroup[UserId].push(info);
                }
            }
        }
        return UserGroup;
    }

    public async PrintRefundReport(apiReq?: ApiRequest<PatientRefundFilters>): Promise<any> {
        let data = await this.GetPatientRefund(apiReq);
        let PatientRefund = data.Data;
        let FromDate = apiReq.Data.FromDate;
        let ToDate = apiReq.Data.ToDate;
        let FacilityName = apiReq.Data.FacilityName;
        let UserName = apiReq.Data.UserName;
        let PaymentType = apiReq.Data.PaymentType;
        let PatientRefundData = data.Data[0];
        let TotalRefAmt: number = 0;
        for (let idx in PatientRefund) {
            let item = PatientRefund[idx];
            TotalRefAmt += item.RefundAmount;
        }
        let facilityPreferenceBO = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(PatientRefundData.FacilityId);
        let info = {
            PatientRefund: PatientRefund,
            Preferences: printPreferencesData,
            FromDate: FromDate,
            ToDate: ToDate,
            FacilityName: FacilityName,
            UserName: UserName,
            PaymentType: PaymentType,
            TotalRefAmt: TotalRefAmt
        };
        let pdfOption: any = null;
        let key = 'refundreport';
        pdfOption = {
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
            base: 'file://' + join(__dirname, '/../../Templates/')
        };
        return await Report.Generate(key, { header: {}, body: info }, null, pdfOption);
    }
    public async PrintIPRefundReport(apiReq?: ApiRequest<PatientRefundFilters>): Promise<any> {
        let data = await this.GetPatientRefund(apiReq);
        let PatientRefund = data.Data;
        let FromDate = apiReq.Data.FromDate;
        let ToDate = apiReq.Data.ToDate;
        let FacilityName = apiReq.Data.FacilityName;
        let UserName = apiReq.Data.UserName;
        let PaymentType = apiReq.Data.PaymentType;
        let PatientRefundData = data.Data[0];
        let TotalRefAmt: number = 0;
        for (let idx in PatientRefund) {
            let item = PatientRefund[idx];
            TotalRefAmt += item.RefundAmount;
        }
        let facilityPreferenceBO = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(PatientRefundData.FacilityId);

        let info = {
            PatientRefund: PatientRefund,
            Preferences: printPreferencesData,
            FromDate: FromDate,
            ToDate: ToDate,
            FacilityName: FacilityName,
            UserName: UserName,
            PaymentType: PaymentType,
            TotalRefAmt: TotalRefAmt,
        };
        let pdfOption: any = null;
        let key = 'iprefundreport';
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
            base: 'file://' + join(__dirname, '/../../Templates/')
        };
        return await Report.Generate(key, { header: {}, body: info }, null, pdfOption);
    }
    public async PrintPatientRefund(req: BaseRequest): Promise<FileInfo> {
        let flags = {
            header: (req.Data.withHeader) ? req.Data.withHeader : 0,
            woheader: (req.Data.withoutHeader) ? req.Data.withoutHeader : 0
        };
        let apiReq = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [{ Key: PatientRefundFilters.Id, Value: req.Id }]
        };
        let data = await this.GetPatientRefund(apiReq);
        let PatientRefund: any = data.Data[0];
        let patientBo = BoFactory.GetBo(regbo.PatientBo, this.Request);
        let patientData: any;
        if (PatientRefund.PatientId) {
            patientData = await patientBo.GetPatientById({ Id: PatientRefund.PatientId });
        }
        let encounterData: any;
        let encInfo: any;
        if (PatientRefund.EncounterId) {
            let encReq = {
                Id: 0,
                PageContext: { PageSize: -1, PageNumber: 1 },
                Params: [{ Key: EncounterFilters.Id, Value: PatientRefund.EncounterId }]
            };
            let encounterBo = BoFactory.GetBo(encbo.EncounterBo, this.Request);
            encounterData = await encounterBo.GetEncounters(encReq);
            encInfo = encounterData.Data[0];
        }
        let facilityPreferenceBO = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(PatientRefund.FacilityId);
        let QrInfo: any;
        let PatName: '';
        let FacInfo: '';
        if (patientData) {
            if (patientData.Title) {
                PatName = patientData.Title.Description;
            }
            if (patientData.FirstName) {
                PatName += ' ' + patientData.FirstName;
            }
            if (patientData.LastName) {
                PatName += ' ' + patientData.LastName;
            }
        }
        if (PatientRefund.Facility) {
            FacInfo = PatientRefund.Facility.FacilityName;
        }
        if (PatientRefund.Facility.AddressLine1) {
            FacInfo += ', ' + PatientRefund.Facility.AddressLine1;
        }
        if (PatientRefund.Facility.Mobile) {
            FacInfo += ',Phone: ' + PatientRefund.Facility.Mobile;
        }
        if (PatientRefund.Facility.Email) {
            FacInfo += ',Email: ' + PatientRefund.Facility.Email;
        }
        if (PatientRefund.Facility.GstNumber) {
            FacInfo += ',GSTIN No: ' + PatientRefund.Facility.GstNumber;
        }

        QrInfo = PatientRefund.RefundIdentifier + ' , ' + PatientRefund.RefundAmount + ' , ' +
            PatientRefund.RefundDateTime + ' , ' + PatName + ' , ' + FacInfo;
        let info: any = {
            Title: '',
            Patient: patientData,
            PatientRefund: PatientRefund,
            Encounter: encInfo,
            Preferences: printPreferencesData,
            QrInfo: QrInfo,
            Flags: flags
        };
        if (PatientRefund.RefundStatusId === 3) {
            info.Title = 'Cancelled By';
        }
        if (PatientRefund.RefundStatusId === 1) {
            info.Title = 'Authorized Signature';
        }
        // return await Report.Generate('refund', { header: {}, body: info });
        let Watermark = '';
        let PrintTypeId: number;
        if (info.PatientRefund.RefundStatusId === 3) {
            Watermark = 'CANCELLED';
            PrintTypeId = 2;
        }
        let pdfOption: any = null;
        let key = 'refund';
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
    public async PrintPharmacyRefundReport(apiReq?: ApiRequest<PatientRefundFilters>): Promise<any> {
        let data = await this.GetPatientRefund(apiReq);
        let PatientRefund = data.Data;
        let FromDate = apiReq.Data.FromDate;
        let ToDate = apiReq.Data.ToDate;
        let FacilityName = apiReq.Data.FacilityName;
        let UserName = apiReq.Data.UserName;
        let PaymentType = apiReq.Data.PaymentType;
        let PatientRefundData = data.Data[0];
        let TotalCash: number = 0;
        let TotalCard: number = 0;
        let TotalCheque: number = 0;
        let TotalSales: number = 0;
        for (let idx in PatientRefund) {
            let item = PatientRefund[idx];
            if (item.RefundTypeId === 4) {
                if (item.PaymentTypeId === 1 && item.RefundStatusId === 1) {
                    let Cash = item.RefundAmount;
                    TotalCash += Cash;
                    TotalSales += Cash;
                } else if ((item.PaymentTypeId === 5 || item.PaymentTypeId === 6) && item.RefundStatusId === 1) {
                    let Card = item.RefundAmount;
                    TotalCard += Card;
                    TotalSales += Card;
                } else if ((item.PaymentTypeId === 2 || item.PaymentTypeId === 3 || item.PaymentTypeId === 4)
                    && item.RefundStatusId === 1) {
                    let Cheque = item.RefundAmount;
                    TotalCheque += Cheque;
                    TotalSales += Cheque;
                }
            }
        }
        let facilityPreferenceBO = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(PatientRefundData.FacilityId);
        let info = {
            PatientRefund: PatientRefund,
            Preferences: printPreferencesData,
            FromDate: FromDate,
            ToDate: ToDate,
            FacilityName: FacilityName,
            UserName: UserName,
            PaymentType: PaymentType,
            TotalCash: TotalCash,
            TotalCard: TotalCard,
            TotalCheque: TotalCheque,
            TotalSales: TotalSales
        };
        let pdfOption: any = null;
        let key = 'pharmacyrefundreport';
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
            base: 'file://' + join(__dirname, '/../../Templates/')
        };
        return await Report.Generate(key, { header: {}, body: info }, null, pdfOption);
    }

    public GetModel(): SStatic.Model<PatientRefundInstance, PatientRefundAttributes> {
        return this.Models.PatientRefund;
    }

    public async GetFacilityInfoDashBoard(req: BaseRequest): Promise<any> {
        let result: any = [];
        result.push({ Key: 'Refund', Value: await this.OPRefundDetails(req) });
        return result;
    }
    public async GetFacilityCollectionDashBoard(req: BaseRequest): Promise<any> {
        let result: any = [];
        result.push({ Key: 'OP Refund', Value: await this.OPBillRefundDetails(req) });
        result.push({ Key: 'IP Refund', Value: await this.IPBillRefundDetails(req) });
        return result;
    }

    public async OPBillRefundDetails(req: BaseRequest): Promise<any> {
        let OPBillResult: any = {};
        OPBillResult['DisplayOrder'] = 3;
        let opbillamountInstance: any = await this.Find({
            attributes: [
                [this.Dal.fn('SUM', this.Dal.col('RefundAmount')), 'TotalAmountPaid'],
            ],
            where: {
                RefundDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                RefundStatusId: 1,
                PharmacyReturnId: { '$or': { '$eq': null, '$lte': 0 } },
                EncounterTypeId: { '$in': [1, 4] },
                FacilityId: req.Data.FacilityId
            }
        });
        if (opbillamountInstance) {
            let bill: any = this.GetAttribute(opbillamountInstance);
            OPBillResult['BillAmount'] = bill['TotalAmountPaid'];
        }

        let opbillamountcashInstance: any = await this.Find({
            attributes: [
                [this.Dal.fn('SUM', this.Dal.col('RefundAmount')), 'TotalAmountPaid'],
            ],
            where: {
                RefundDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                RefundStatusId: 1,
                PharmacyReturnId: { '$or': { '$eq': null, '$lte': 0 } },
                EncounterTypeId: { '$in': [1, 4] },
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
                [this.Dal.fn('SUM', this.Dal.col('RefundAmount')), 'TotalAmountPaid'],
            ],
            where: {
                RefundDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                RefundStatusId: 1,
                PharmacyReturnId: { '$or': { '$eq': null, '$lte': 0 } },
                EncounterTypeId: { '$in': [1, 4] },
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
                [this.Dal.fn('SUM', this.Dal.col('RefundAmount')), 'TotalAmountPaid'],
            ],
            where: {
                RefundDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                RefundStatusId: 1,
                PharmacyReturnId: { '$or': { '$eq': null, '$lte': 0 } },
                EncounterTypeId: { '$in': [1, 4] },
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
                [this.Dal.fn('SUM', this.Dal.col('RefundAmount')), 'TotalAmountPaid'],
            ],
            where: {
                RefundDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                RefundStatusId: 1,
                PharmacyReturnId: { '$or': { '$eq': null, '$lte': 0 } },
                EncounterTypeId: { '$in': [1, 4] },
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
    public async IPBillRefundDetails(req: BaseRequest): Promise<any> {
        let OPBillResult: any = {};
        OPBillResult['DisplayOrder'] = 9;
        let opbillamountInstance: any = await this.Find({
            attributes: [
                [this.Dal.fn('SUM', this.Dal.col('RefundAmount')), 'TotalAmountPaid'],
            ],
            where: {
                RefundDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                RefundStatusId: 1,
                PharmacyReturnId: { '$or': { '$eq': null, '$lte': 0 } },
                EncounterTypeId: 2,
                FacilityId: req.Data.FacilityId
            }
        });
        if (opbillamountInstance) {
            let bill: any = this.GetAttribute(opbillamountInstance);
            OPBillResult['BillAmount'] = bill['TotalAmountPaid'];
        }

        let opbillamountcashInstance: any = await this.Find({
            attributes: [
                [this.Dal.fn('SUM', this.Dal.col('RefundAmount')), 'TotalAmountPaid'],
            ],
            where: {
                RefundDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                RefundStatusId: 1,
                PharmacyReturnId: { '$or': { '$eq': null, '$lte': 0 } },
                EncounterTypeId: 2,
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
                [this.Dal.fn('SUM', this.Dal.col('RefundAmount')), 'TotalAmountPaid'],
            ],
            where: {
                RefundDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                RefundStatusId: 1,
                PharmacyReturnId: { '$or': { '$eq': null, '$lte': 0 } },
                EncounterTypeId: 2,
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
                [this.Dal.fn('SUM', this.Dal.col('RefundAmount')), 'TotalAmountPaid'],
            ],
            where: {
                RefundDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                RefundStatusId: 1,
                PharmacyReturnId: { '$or': { '$eq': null, '$lte': 0 } },
                EncounterTypeId: 2,
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
                [this.Dal.fn('SUM', this.Dal.col('RefundAmount')), 'TotalAmountPaid'],
            ],
            where: {
                RefundDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                RefundStatusId: 1,
                PharmacyReturnId: { '$or': { '$eq': null, '$lte': 0 } },
                EncounterTypeId: 2,
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

    public async OPRefundDetails(req: BaseRequest): Promise<any> {
        let OPBillResult: any = {};
        OPBillResult['DisplayOrder'] = 4;
        let opbillamountInstance: any = await this.Find({
            attributes: [
                [this.Dal.fn('SUM', this.Dal.col('RefundAmount')), 'TotalAmountPaid'],
            ],
            where: {
                RefundDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                RefundStatusId: 1,
                PharmacyReturnId: { '$or': { '$eq': null, '$lte': 0 } },
                FacilityId: req.Data.FacilityId
            }
        });
        if (opbillamountInstance) {
            let bill: any = this.GetAttribute(opbillamountInstance);
            OPBillResult['BillAmount'] = bill['TotalAmountPaid'];
        }

        let opbillamountcashInstance: any = await this.Find({
            attributes: [
                [this.Dal.fn('SUM', this.Dal.col('RefundAmount')), 'TotalAmountPaid'],
            ],
            where: {
                RefundDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                RefundStatusId: 1,
                PharmacyReturnId: { '$or': { '$eq': null, '$lte': 0 } },
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
                [this.Dal.fn('SUM', this.Dal.col('RefundAmount')), 'TotalAmountPaid'],
            ],
            where: {
                RefundDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                RefundStatusId: 1,
                PharmacyReturnId: { '$or': { '$eq': null, '$lte': 0 } },
                FacilityId: req.Data.FacilityId,
                PaymentTypeId: { '$in': [5, 6] }
            }
        });
        if (opbillamountcardInstance) {
            let bill: any = this.GetAttribute(opbillamountcardInstance);
            OPBillResult['CardAmount'] = bill['TotalAmountPaid'];
        }

        let opbillamountotherInstance: any = await this.Find({

            attributes: [
                [this.Dal.fn('SUM', this.Dal.col('RefundAmount')), 'TotalAmountPaid'],
            ],
            where: {
                RefundDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                RefundStatusId: 1,
                PharmacyReturnId: { '$or': { '$eq': null, '$lte': 0 } },
                FacilityId: req.Data.FacilityId,
                PaymentTypeId: { '$in': [2] }
            }
        });
        if (opbillamountotherInstance) {
            let bill: any = this.GetAttribute(opbillamountotherInstance);
            OPBillResult['OtherAmount'] = bill['TotalAmountPaid'];
        }

        return OPBillResult;
    }
    public async GetPharmacyReturnCollections(req: BaseRequest): Promise<any> {
        let result: any = [];
        result.push({ Key: 'OP Return', Value: await this.OPReturnCollectionDetails(req) });
        result.push({ Key: 'IP Return-cash', Value: await this.IPReturnCollectionDetails(req) });
        result.push({ Key: 'Direct Return', Value: await this.DirectReturnCollectionDetails(req) });
        // result.push({ Key: 'Staff Return', Value: await this.StaffReturnCollectionDetails(req) });
        return result;
    }
    public async OPReturnCollectionDetails(req: BaseRequest): Promise<any> {
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
        let opbillamountInstance: any = await this.Find({
            attributes: [
                [this.Dal.fn('SUM', this.Dal.col('RefundAmount')), 'TotalAmountPaid'],
            ],
            where: {
                RefundDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                RefundStatusId: 1,
                // PharmacyReturnId: { '$or': { '$eq': null, '$lte': 0 } },
                // EncounterTypeId: { '$in': [1, 4] },
                FacilityId: req.Data.FacilityId,
                StoreMasterId: storeId,

            },
            include: [EncJoin]
        });
        if (opbillamountInstance) {
            let bill: any = this.GetAttribute(opbillamountInstance);
            OPBillResult['BillAmount'] = bill['TotalAmountPaid'];
        }

        let opbillamountcashInstance: any = await this.Find({
            attributes: [
                [this.Dal.fn('SUM', this.Dal.col('RefundAmount')), 'TotalAmountPaid'],
            ],
            where: {
                RefundDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                RefundStatusId: 1,
                // PharmacyReturnId: { '$or': { '$eq': null, '$lte': 0 } },
                // EncounterTypeId: { '$in': [1, 4] },
                FacilityId: req.Data.FacilityId,
                PaymentTypeId: 1,
                StoreMasterId: storeId,
            },
            include: [EncJoin]
        });
        if (opbillamountcashInstance) {
            let bill: any = this.GetAttribute(opbillamountcashInstance);
            OPBillResult['CashAmount'] = bill['TotalAmountPaid'];
        }

        let opbillamountcardInstance: any = await this.Find({
            attributes: [
                [this.Dal.fn('SUM', this.Dal.col('RefundAmount')), 'TotalAmountPaid'],
            ],
            where: {
                RefundDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                RefundStatusId: 1,
                // PharmacyReturnId: { '$or': { '$eq': null, '$lte': 0 } },
                // EncounterTypeId: { '$in': [1, 4] },
                FacilityId: req.Data.FacilityId,
                PaymentTypeId: { '$in': [5, 6] },
                StoreMasterId: storeId,
            },
            include: [EncJoin]
        });
        if (opbillamountcardInstance) {
            let bill: any = this.GetAttribute(opbillamountcardInstance);
            OPBillResult['CardAmount'] = bill['TotalAmountPaid'];
        }

        let opbillamountotherInstance: any = await this.Find({

            attributes: [
                [this.Dal.fn('SUM', this.Dal.col('RefundAmount')), 'TotalAmountPaid'],
            ],
            where: {
                RefundDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                RefundStatusId: 1,
                // PharmacyReturnId: { '$or': { '$eq': null, '$lte': 0 } },
                // EncounterTypeId: { '$in': [1, 4] },
                FacilityId: req.Data.FacilityId,
                PaymentTypeId: { '$notIn': [1, 5, 6, 11] },
                StoreMasterId: storeId,
            },
            include: [EncJoin]
        });
        if (opbillamountotherInstance) {
            let bill: any = this.GetAttribute(opbillamountotherInstance);
            OPBillResult['OtherAmount'] = bill['TotalAmountPaid'];
        }
        let opbillamountupiInstance: any = await this.Find({

            attributes: [
                [this.Dal.fn('SUM', this.Dal.col('RefundAmount')), 'TotalAmountPaid'],
            ],
            where: {
                RefundDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                RefundStatusId: 1,
                // PharmacyReturnId: { '$or': { '$eq': null, '$lte': 0 } },
                // EncounterTypeId: { '$in': [1, 4] },
                FacilityId: req.Data.FacilityId,
                PaymentTypeId: 11,
                StoreMasterId: storeId,
            },
            include: [EncJoin]
        });
        if (opbillamountupiInstance) {
            let bill: any = this.GetAttribute(opbillamountupiInstance);
            OPBillResult['UPIAmount'] = bill['TotalAmountPaid'];
        }
        return OPBillResult;
    }
    public async IPReturnCollectionDetails(req: BaseRequest): Promise<any> {
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
        let opbillamountInstance: any = await this.Find({
            attributes: [
                [this.Dal.fn('SUM', this.Dal.col('RefundAmount')), 'TotalAmountPaid'],
            ],
            where: {
                RefundDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                RefundStatusId: 1,
                // PharmacyReturnId: { '$or': { '$eq': null, '$lte': 0 } },
                // EncounterTypeId: { '$in': [1, 4] },
                FacilityId: req.Data.FacilityId,
                StoreMasterId: storeId,

            },
            include: [EncJoin]
        });
        if (opbillamountInstance) {
            let bill: any = this.GetAttribute(opbillamountInstance);
            OPBillResult['BillAmount'] = bill['TotalAmountPaid'];
        }

        let opbillamountcashInstance: any = await this.Find({
            attributes: [
                [this.Dal.fn('SUM', this.Dal.col('RefundAmount')), 'TotalAmountPaid'],
            ],
            where: {
                RefundDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                RefundStatusId: 1,
                // PharmacyReturnId: { '$or': { '$eq': null, '$lte': 0 } },
                // EncounterTypeId: { '$in': [1, 4] },
                FacilityId: req.Data.FacilityId,
                PaymentTypeId: 1,
                StoreMasterId: storeId,

            },
            include: [EncJoin]
        });
        if (opbillamountcashInstance) {
            let bill: any = this.GetAttribute(opbillamountcashInstance);
            OPBillResult['CashAmount'] = bill['TotalAmountPaid'];
        }

        let opbillamountcardInstance: any = await this.Find({
            attributes: [
                [this.Dal.fn('SUM', this.Dal.col('RefundAmount')), 'TotalAmountPaid'],
            ],
            where: {
                RefundDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                RefundStatusId: 1,
                // PharmacyReturnId: { '$or': { '$eq': null, '$lte': 0 } },
                // EncounterTypeId: { '$in': [1, 4] },
                FacilityId: req.Data.FacilityId,
                PaymentTypeId: { '$in': [5, 6] },
                StoreMasterId: storeId,

            },
            include: [EncJoin]
        });
        if (opbillamountcardInstance) {
            let bill: any = this.GetAttribute(opbillamountcardInstance);
            OPBillResult['CardAmount'] = bill['TotalAmountPaid'];
        }

        let opbillamountotherInstance: any = await this.Find({

            attributes: [
                [this.Dal.fn('SUM', this.Dal.col('RefundAmount')), 'TotalAmountPaid'],
            ],
            where: {
                RefundDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                RefundStatusId: 1,
                // PharmacyReturnId: { '$or': { '$eq': null, '$lte': 0 } },
                // EncounterTypeId: { '$in': [1, 4] },
                FacilityId: req.Data.FacilityId,
                PaymentTypeId: { '$notIn': [1, 5, 6, 11] },
                StoreMasterId: storeId,

            },
            include: [EncJoin]
        });
        if (opbillamountotherInstance) {
            let bill: any = this.GetAttribute(opbillamountotherInstance);
            OPBillResult['OtherAmount'] = bill['TotalAmountPaid'];
        }
        let opbillamountupiInstance: any = await this.Find({

            attributes: [
                [this.Dal.fn('SUM', this.Dal.col('RefundAmount')), 'TotalAmountPaid'],
            ],
            where: {
                RefundDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                RefundStatusId: 1,
                // PharmacyReturnId: { '$or': { '$eq': null, '$lte': 0 } },
                // EncounterTypeId: { '$in': [1, 4] },
                FacilityId: req.Data.FacilityId,
                PaymentTypeId: 11,
                StoreMasterId: storeId,

            },
            include: [EncJoin]
        });
        if (opbillamountupiInstance) {
            let bill: any = this.GetAttribute(opbillamountupiInstance);
            OPBillResult['UPIAmount'] = bill['TotalAmountPaid'];
        }
        return OPBillResult;
    }
    public async DirectReturnCollectionDetails(req: BaseRequest): Promise<any> {
        let OPBillResult: any = {};
        OPBillResult['DisplayOrder'] = 3;

        let PatientReturnJoin: any = {
            model: this.Models.PatientReturns,
            attributes: ['Id', 'ReturnTypeId'],
            required: true,
            where: {
                ReturnTypeId: 4,
            },
        };
        let storeId: any;
        if (req.Data.StoreMasterId > 0) {
            storeId = req.Data.StoreMasterId;
        } else {
            storeId = { '$gt': 0 };
        }
        let opbillamountInstance: any = await this.Find({
            attributes: [
                [this.Dal.fn('SUM', this.Dal.col('RefundAmount')), 'TotalAmountPaid'],
            ],
            where: {
                RefundDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                RefundStatusId: 1,
                // PharmacyReturnId: { '$or': { '$eq': null, '$lte': 0 } },
                // EncounterTypeId: { '$in': [1, 4] },
                FacilityId: req.Data.FacilityId,
                StoreMasterId: storeId,
            },
            include: [PatientReturnJoin]

        });
        if (opbillamountInstance) {
            let bill: any = this.GetAttribute(opbillamountInstance);
            OPBillResult['BillAmount'] = bill['TotalAmountPaid'];
        }

        let opbillamountcashInstance: any = await this.Find({
            attributes: [
                [this.Dal.fn('SUM', this.Dal.col('RefundAmount')), 'TotalAmountPaid'],
            ],
            where: {
                RefundDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                RefundStatusId: 1,
                // PharmacyReturnId: { '$or': { '$eq': null, '$lte': 0 } },
                // EncounterTypeId: { '$in': [1, 4] },
                FacilityId: req.Data.FacilityId,
                PaymentTypeId: 1,
                StoreMasterId: storeId,

            },
            include: [PatientReturnJoin]
        });
        if (opbillamountcashInstance) {
            let bill: any = this.GetAttribute(opbillamountcashInstance);
            OPBillResult['CashAmount'] = bill['TotalAmountPaid'];
        }

        let opbillamountcardInstance: any = await this.Find({
            attributes: [
                [this.Dal.fn('SUM', this.Dal.col('RefundAmount')), 'TotalAmountPaid'],
            ],
            where: {
                RefundDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                RefundStatusId: 1,
                // PharmacyReturnId: { '$or': { '$eq': null, '$lte': 0 } },
                // EncounterTypeId: { '$in': [1, 4] },
                FacilityId: req.Data.FacilityId,
                PaymentTypeId: { '$in': [5, 6] },
                StoreMasterId: storeId,

            },
            include: [PatientReturnJoin]
        });
        if (opbillamountcardInstance) {
            let bill: any = this.GetAttribute(opbillamountcardInstance);
            OPBillResult['CardAmount'] = bill['TotalAmountPaid'];
        }

        let opbillamountotherInstance: any = await this.Find({

            attributes: [
                [this.Dal.fn('SUM', this.Dal.col('RefundAmount')), 'TotalAmountPaid'],
            ],
            where: {
                RefundDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                RefundStatusId: 1,
                // PharmacyReturnId: { '$or': { '$eq': null, '$lte': 0 } },
                // EncounterTypeId: { '$in': [1, 4] },
                FacilityId: req.Data.FacilityId,
                PaymentTypeId: { '$notIn': [1, 5, 6, 11] },
                StoreMasterId: storeId,

            },
            include: [PatientReturnJoin]
        });
        if (opbillamountotherInstance) {
            let bill: any = this.GetAttribute(opbillamountotherInstance);
            OPBillResult['OtherAmount'] = bill['TotalAmountPaid'];
        }
        let opbillamountupiInstance: any = await this.Find({

            attributes: [
                [this.Dal.fn('SUM', this.Dal.col('RefundAmount')), 'TotalAmountPaid'],
            ],
            where: {
                RefundDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                RefundStatusId: 1,
                // PharmacyReturnId: { '$or': { '$eq': null, '$lte': 0 } },
                // EncounterTypeId: { '$in': [1, 4] },
                FacilityId: req.Data.FacilityId,
                PaymentTypeId: 11,
                StoreMasterId: storeId,

            },
            include: [PatientReturnJoin]
        });
        if (opbillamountupiInstance) {
            let bill: any = this.GetAttribute(opbillamountupiInstance);
            OPBillResult['UPIAmount'] = bill['TotalAmountPaid'];
        }
        return OPBillResult;
    }
}
