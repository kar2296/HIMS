import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions, FileInfo } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest } from '../../../Common/Index';
import {
    OPModifyPatPaymentDetailsInstance,
    OPModifyPatPaymentDetailsAttributes
} from '../Model/Interface/Index';
import { PatientPaymentDetailsFilters, PatientBillsFilters } from '../Common/Filters.e';
import { EncounterFilters } from '../../Visit/Common/Filters.e';
import { BoFactory } from '../../Base/Business/Index';
import * as regbo from '../../Registration/Business/Index';
import * as userbo from '../../SystemSettings/Business/Index';
import * as generalBO from '../../General/Business/Index';
import * as billingbo from '../../Billing/Business/Index';
import * as encbo from '../../Visit/Business/Index';

export class OPModifyPatPaymentDetailsBo extends BaseBo<OPModifyPatPaymentDetailsInstance, OPModifyPatPaymentDetailsAttributes>  {
    public async AddPatientPaymentDetails(req: BaseRequest): Promise<number> {
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async ManagePatientPaymentDetails(PatientBillId: number, details: OPModifyPatPaymentDetailsAttributes[]):
        Promise<boolean> {
        details = details || [];
        await Promise.all(details.map((DetailItem): Promise<void> => {
            return (async (detail): Promise<void> => {
                detail.Id = detail.Id || 0;
                detail.PatientBillId = PatientBillId;
                detail.ReceiptDateTime = new Date();
                if (detail.Status === 2 && detail.Id !== 0) {
                    await this.MarkAsDelete(detail.Id);
                } else if (detail.Id === 0) {
                    let result = await this.Save(detail);
                    detail.Id = result.dataValues.Id;
                } else if (detail.Id > 0) { // Copy from original bill
                    let result = await this.Save(detail);
                    detail.Id = result.dataValues.Id;
                }
            })(DetailItem);
        }));
        return true;
    }

    public async GetPatientPaymentDetailsById(req: BaseRequest): Promise<OPModifyPatPaymentDetailsAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetPatientPaymentDetails(apiReq?: ApiRequest<PatientPaymentDetailsFilters>):
        Promise<ApiResponse<OPModifyPatPaymentDetailsAttributes[]>> {
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
            model: this.Models.User, attributes: ['FirstName', 'LastName', 'UserName'], as: 'CreatedUser', required: false,
            include: [
                this.GetReference('Title')
            ]
        });
        include.push({
            model: this.Models.Department, attributes: ['DepartmentName', 'DepartmentCode'], required: false,
        });
        include.push(this.GetReference('PaymentType'));
        include.push({ model: this.Models.Encounter, attributes: ['VisitIdentifier'], required: false });
        include.push(this.GetReference('ReceiptStatus'));
        include.push(this.GetReference('CardType'));
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
                        where['CreatedBy'] = param.Value;
                        break;
                    case PatientPaymentDetailsFilters.CanIncludeBill:
                        include.push({
                            model: this.Models.OPModifyPatBills,
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
            model: this.Models.OPModifyPatBills,
            required: isReqPatientBillSearch,
            where: patientBillWhere,
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async PrintPatientPaymentDetails(req: BaseRequest): Promise<FileInfo> {
        let apiReq = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [{ Key: PatientPaymentDetailsFilters.Id, Value: req.Id }]
        };
        let data = await this.GetPatientPaymentDetails(apiReq);
        let PatientPaymentDetails = data.Data[0];
        let patientBo = BoFactory.GetBo(regbo.PatientBo, this.Request);
        let encReq = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [{ Key: EncounterFilters.Id, Value: PatientPaymentDetails.EncounterId }]
        };
        let encounterBo = BoFactory.GetBo(encbo.EncounterBo, this.Request);
        let encounterData = await encounterBo.GetEncounters(encReq);
        let patientData = await patientBo.GetPatientById({ Id: PatientPaymentDetails.PatientId });
        let facilityPreferenceBO = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(PatientPaymentDetails.FacilityId);
        let info = {
            Title: '',
            Patient: patientData,
            PatientPaymentDetails: PatientPaymentDetails,
            PatientBills: {},
            Encounter: encounterData.Data[0],
            Preferences: printPreferencesData
        };
        if (PatientPaymentDetails.ReceiptTypeId === 3) {
            info.Title = 'Due Receipt';
        } if (PatientPaymentDetails.ReceiptTypeId === 1) {
            info.Title = 'Advance Receipt';
        }
        let key = 'advance';
        if (PatientPaymentDetails.ReceiptTypeId === 2) {
            let scrReq = {
                Id: 0,
                PageContext: { PageSize: 50, PageNumber: 1 },
                Params: [{ Key: PatientBillsFilters.Id, Value: PatientPaymentDetails.PatientBillId }]
            };
            let PatientBillsBo = BoFactory.GetBo(billingbo.PatientBillsBo, this.Request);
            let PatientBillsData = await PatientBillsBo.GetPatientBills(scrReq);
            let BillData = PatientBillsData.Data[0];
            info.PatientBills = BillData;
            key = 'receipt';
        }
        let Watermark = 'DUPLICATE';
        let PrintTypeId: number;
        if (info.PatientPaymentDetails.ReceiptStatusId === 3) {
            Watermark = 'CANCELLED';
            PrintTypeId = 2;
        }
        let ephBO = BoFactory.GetBo(generalBO.EntityPrintHistoryBo, this.Request);
        return await ephBO.PrintReport(key
            , { header: {}, body: info }
            , {
                ObjectId: req.Id
                , ObjectTypeId: 4
                , Reason: req.Data ? req.Data.Reason : null
                , Watermark: Watermark
                , PrintTypeId: PrintTypeId
            });
    }

    public GetModel(): SStatic.Model<OPModifyPatPaymentDetailsInstance, OPModifyPatPaymentDetailsAttributes> {
        return this.Models.OPModifyPatPaymentDetails;
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

    public async GetFacilityInfoDashBoard(req: BaseRequest): Promise<any> {
        let result: any = [];
        result.push({ Key: 'OP Bill', Value: await this.OPBillPaymentDetails(req) });
        result.push({ Key: 'IP Bill Self', Value: await this.IPSelfPaymentDetails(req) });
        result.push({ Key: 'IP Bill Insurance', Value: await this.IPInsurancePaymentDetails(req) });
        result.push({ Key: 'OP Pharmacy', Value: await this.OPPharmacyPaymentDetails(req) });
        result.push({ Key: 'OP Pharmacy Due Col.', Value: await this.OPConsolidatePayDetails(req) });
        return result;
    }

    public async GetSystemDatetime(req: BaseRequest): Promise<Date> {
        return new Date();
    }

    private async OPBillPaymentDetails(req: BaseRequest): Promise<any> {
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
                EncounterTypeId: { '$or': { '$eq': null, '$in': [1, 4] } },
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
                EncounterTypeId: { '$or': { '$eq': null, '$in': [1, 4] } },
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
                PaymentTypeId: { '$in': [3, 4, 2] }
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
        let GuarantorId_ = 1000;
        let CurrentFacilityId = req.Data.FacilityId;
        if (!CurrentFacilityId) CurrentFacilityId = 1;
        GuarantorId_ = 1000 * CurrentFacilityId;
        let PatientGuarantorJoin = {
            model: this.Models.PatientGuarantor,
            attributes: ['Id'],
            required: true,
            where: {
                GuarantorId: GuarantorId_
            }
        };
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
                ReceiptStatusId: 1
            },
            include: [PatientGuarantorJoin]
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
                ReceiptStatusId: 1
            },
            include: [PatientGuarantorJoin]
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
                ReceiptStatusId: 1
            },
            include: [PatientGuarantorJoin]
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
                PaymentTypeId: { '$in': [3, 4, 2] },
                ReceiptStatusId: 1
            },
            include: [PatientGuarantorJoin]
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
        let GuarantorId_ = 1000;
        let CurrentFacilityId = req.Data.FacilityId;
        if (!CurrentFacilityId) CurrentFacilityId = 1;
        GuarantorId_ = 1000 * CurrentFacilityId;
        let PatientGuarantorJoin = {
            model: this.Models.PatientGuarantor,
            attributes: ['Id'],
            required: true,
            where: {
                GuarantorId: { '$ne': GuarantorId_ }
            }
        };
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
                ReceiptStatusId: 1
            },
            include: [PatientGuarantorJoin]
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
                ReceiptStatusId: 1
            },
            include: [PatientGuarantorJoin]
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
                ReceiptStatusId: 1
            },
            include: [PatientGuarantorJoin]
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
                PaymentTypeId: { '$in': [3, 4, 2] },
                ReceiptStatusId: 1
            },
            include: [PatientGuarantorJoin]
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
            model: this.Models.OPModifyPatBills,
            attributes: ['Id'],
            required: true,
            where: {
                BillTypeId: 4,
                BillDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate }
            }
        };

        let opbillamountInstance: any = await this.Find({
            attributes: [
                [this.Dal.fn('SUM', this.Dal.col('AmountPaid')), 'TotalAmountPaid'],
            ],
            where: {
                ReceiptDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                ReceiptTypeId: { '$in': [1, 2] },
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
                ReceiptTypeId: { '$in': [1, 2] },
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
                PaymentTypeId: { '$in': [3, 4, 2] }
            },
            include: [PatientBillJoin]
        });
        if (opbillamountotherInstance) {
            let bill: any = this.GetAttribute(opbillamountotherInstance);
            OPBillResult['OtherAmount'] = bill['TotalAmountPaid'];
        }

        return OPBillResult;
    }

    private async OPConsolidatePayDetails(req: BaseRequest): Promise<any> {
        let OPBillResult: any = {};
        OPBillResult['DisplayOrder'] = 20;
        let PatientBillJoin: any = {
            model: this.Models.OPModifyPatBills,
            attributes: ['Id'],
            required: true,
            where: {
                BillTypeId: 4,
                BillDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate }
            }
        };

        let ConsolidateBillAmtPaid = 0;
        let DueBillAmtPaid = 0;

        let opbillamountInstance: any = await this.Find({
            attributes: [
                [this.Dal.fn('SUM', this.Dal.col('AmountPaid')), 'TotalAmountPaid'],
            ],
            where: {
                ReceiptDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                ReceiptTypeId: { '$in': [1, 2] },
                ReceiptStatusId: 1,
                IsConsolidatePay: 1,
                FacilityId: req.Data.FacilityId
            },
            include: [PatientBillJoin]
        });
        if (opbillamountInstance) {
            let bill: any = this.GetAttribute(opbillamountInstance);
            ConsolidateBillAmtPaid = bill['TotalAmountPaid'];
        }

        let opduebillamountInstance: any = await this.Find({
            attributes: [
                [this.Dal.fn('SUM', this.Dal.col('AmountPaid')), 'TotalAmountPaid'],
            ],
            where: {
                ReceiptDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                ReceiptTypeId: { '$in': [3] },
                ReceiptStatusId: 1,
                FacilityId: req.Data.FacilityId
            },
            include: [PatientBillJoin]
        });
        if (opduebillamountInstance) {
            let bill: any = this.GetAttribute(opduebillamountInstance);
            DueBillAmtPaid = bill['TotalAmountPaid'];
        }

        OPBillResult['BillAmount'] = ConsolidateBillAmtPaid + DueBillAmtPaid;


        let ConsolCashBillAmtPaid = 0;
        let DueCashBillAmtPaid = 0;

        let opbillamountcashInstance: any = await this.Find({
            attributes: [
                [this.Dal.fn('SUM', this.Dal.col('AmountPaid')), 'TotalAmountPaid'],
            ],
            where: {
                ReceiptDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                ReceiptStatusId: 1,
                FacilityId: req.Data.FacilityId,
                ReceiptTypeId: { '$in': [1, 2] },
                PaymentTypeId: 1,
                IsConsolidatePay: 1
            },
            include: [PatientBillJoin]
        });
        if (opbillamountcashInstance) {
            let bill: any = this.GetAttribute(opbillamountcashInstance);
            ConsolCashBillAmtPaid = bill['TotalAmountPaid'];
        }

        let opbilldueamountcashInstance: any = await this.Find({
            attributes: [
                [this.Dal.fn('SUM', this.Dal.col('AmountPaid')), 'TotalAmountPaid'],
            ],
            where: {
                ReceiptDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                ReceiptStatusId: 1,
                FacilityId: req.Data.FacilityId,
                ReceiptTypeId: { '$in': [3] },
                PaymentTypeId: 1,
                // IsConsolidatePay: 1
            },
            include: [PatientBillJoin]
        });
        if (opbilldueamountcashInstance) {
            let bill: any = this.GetAttribute(opbilldueamountcashInstance);
            DueCashBillAmtPaid = bill['TotalAmountPaid'];
        }

        OPBillResult['CashAmount'] = ConsolCashBillAmtPaid + DueCashBillAmtPaid;

        let ConsolCardBillAmtPaid = 0;
        let DueCardBillAmtPaid = 0;


        let opbillamountcardInstance: any = await this.Find({
            attributes: [
                [this.Dal.fn('SUM', this.Dal.col('AmountPaid')), 'TotalAmountPaid'],
            ],
            where: {
                ReceiptDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                ReceiptStatusId: 1,
                FacilityId: req.Data.FacilityId,
                ReceiptTypeId: { '$in': [1, 2] },
                PaymentTypeId: { '$in': [5, 6] },
                IsConsolidatePay: 1
            },
            include: [PatientBillJoin]
        });
        if (opbillamountcardInstance) {
            let bill: any = this.GetAttribute(opbillamountcardInstance);
            ConsolCardBillAmtPaid = bill['TotalAmountPaid'];
        }

        let opbilldueamountcardInstance: any = await this.Find({
            attributes: [
                [this.Dal.fn('SUM', this.Dal.col('AmountPaid')), 'TotalAmountPaid'],
            ],
            where: {
                ReceiptDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                ReceiptStatusId: 1,
                FacilityId: req.Data.FacilityId,
                ReceiptTypeId: { '$in': [3] },
                PaymentTypeId: { '$in': [5, 6] },

            },
            include: [PatientBillJoin]
        });
        if (opbilldueamountcardInstance) {
            let bill: any = this.GetAttribute(opbilldueamountcardInstance);
            DueCardBillAmtPaid = bill['TotalAmountPaid'];
        }

        OPBillResult['CardAmount'] = ConsolCardBillAmtPaid + DueCardBillAmtPaid;

        let ConsolOtherBillAmtPaid = 0;
        let DueOtherBillAmtPaid = 0;

        let opbillamountotherInstance: any = await this.Find({
            attributes: [
                [this.Dal.fn('SUM', this.Dal.col('AmountPaid')), 'TotalAmountPaid'],
            ],
            where: {
                ReceiptDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                ReceiptStatusId: 1,
                FacilityId: req.Data.FacilityId,
                ReceiptTypeId: { '$in': [1, 2] },
                PaymentTypeId: { '$in': [3, 4, 2] },
                IsConsolidatePay: 1
            },
            include: [PatientBillJoin]
        });
        if (opbillamountotherInstance) {
            let bill: any = this.GetAttribute(opbillamountotherInstance);
            ConsolOtherBillAmtPaid = bill['TotalAmountPaid'];
        }

        let opbilldueamountotherInstance: any = await this.Find({
            attributes: [
                [this.Dal.fn('SUM', this.Dal.col('AmountPaid')), 'TotalAmountPaid'],
            ],
            where: {
                ReceiptDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                ReceiptStatusId: 1,
                FacilityId: req.Data.FacilityId,
                ReceiptTypeId: { '$in': [3] },
                PaymentTypeId: { '$in': [3, 4, 2] },
                IsConsolidatePay: 1
            },
            include: [PatientBillJoin]
        });
        if (opbilldueamountotherInstance) {
            let bill: any = this.GetAttribute(opbilldueamountotherInstance);
            DueOtherBillAmtPaid = bill['TotalAmountPaid'];
        }

        OPBillResult['OtherAmount'] = ConsolOtherBillAmtPaid + DueOtherBillAmtPaid;

        return OPBillResult;
    }

}
