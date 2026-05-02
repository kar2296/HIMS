import * as SStatic from 'sequelize';
import { BaseBo, BoFactory } from '../../Base/Index';
import { WhereOptions, IncludeOptions, Report } from '../../../Core/Index';
import { BaseRequest, ApiRequest, ApiResponse } from '../../../Common/Index';
import {
    InsurancePaymentDetailsInstance, InsurancePaymentDetailsAttributes
} from '../Model/Interface/Index';
import { InsurancePaymentDetailsFilters } from '../Common/Filters.e';
import * as billBo from '../Business/Index';
import * as Userbo from '../../SystemSettings/Business/Index';
import { join } from 'path';
import * as _ from 'lodash';

export class InsurancePaymentDetailsBo extends BaseBo<InsurancePaymentDetailsInstance, InsurancePaymentDetailsAttributes> {
    public async AddInsurancePaymentDetails(req: BaseRequest): Promise<number> {
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateInsurancePaymentDetails(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data);
        return result;
    }

    public async ManageInsurancePaymentDetails(InsurancePaymentId: number, details: InsurancePaymentDetailsAttributes[]) {
        let patientBillsBo = BoFactory.GetBo(billBo.PatientBillsBo, this.Request);
        let patientPaymentBo = BoFactory.GetBo(billBo.PatientPaymentDetailsBo, this.Request);
        let InsurancePaymentBo = BoFactory.GetBo(billBo.InsurancePaymentBo, this.Request);
        let InsurancePaymentInfo = await InsurancePaymentBo.GetInsurancePaymentById({ Id: InsurancePaymentId });
        details = details || [];
        await Promise.all(details.map((DetailItem): Promise<void> => {
            return (async (detail): Promise<void> => {
                detail.Id = detail.Id || 0;
                detail.InsurancePaymentId = InsurancePaymentId;
                if (detail.Status === 2 && detail.Id !== 0) {
                    await this.MarkAsDelete(detail.Id);
                } else if (detail.Id === 0) {
                    await this.Save(detail);
                } else if (detail.Id > 0) {
                    await this.Update(detail);
                }
                if (detail.PatientBillId > 0) {
                    let PatientBillInfo = await patientBillsBo.GetPatientBillsById({ Id: detail.PatientBillId });
                    //uncommented on 30/5/2024 -- jothi
                    // let totalReceivedAmount: number = 0;
                    // PatientBillInfo.PaidAmount = PatientBillInfo.PaidAmount !== null ? PatientBillInfo.PaidAmount : 0;
                    // PatientBillInfo.TDSAmount = PatientBillInfo.TDSAmount !== null ? PatientBillInfo.TDSAmount : 0;
                    // PatientBillInfo.Disallowed = PatientBillInfo.Disallowed !== null ? PatientBillInfo.Disallowed : 0;
                    // totalReceivedAmount = parseFloat(detail.ReceivedAmount.toString())
                    //     + parseFloat(detail.TDSAmount.toString())
                    //     + parseFloat(detail.Disallowed.toString());
                    // if (totalReceivedAmount === PatientBillInfo.OutStandingAmount) {
                    //     PatientBillInfo.IsPaidFully = true;
                    //     PatientBillInfo.OutStandingAmount = 0;
                    // } else {
                    //     PatientBillInfo.OutStandingAmount = parseFloat(PatientBillInfo.OutStandingAmount.toString())
                    //         - parseFloat(totalReceivedAmount.toString());
                    // }
                    // PatientBillInfo.PaidAmount = parseFloat(PatientBillInfo.PaidAmount.toString())
                    //     + parseFloat(totalReceivedAmount.toString());
                    // PatientBillInfo.TDSAmount = parseFloat(PatientBillInfo.TDSAmount.toString())
                    //     + parseFloat(detail.TDSAmount.toString());
                    // PatientBillInfo.Disallowed = parseFloat(PatientBillInfo.Disallowed.toString())
                    //     + parseFloat(detail.Disallowed.toString());

                    // await patientBillsBo.Update(PatientBillInfo);
//End jothi
                    let paymentRequest: any = {
                        Data: {
                            Id: 0,
                            DoctorId: PatientBillInfo.DoctorId,
                            EncounterId: PatientBillInfo.EncounterId,
                            EncounterTypeId: PatientBillInfo.EncounterTypeId,
                            GuarantorId: PatientBillInfo.GuarantorId,
                            GuarantorTypeId: PatientBillInfo.GuarantorTypeId,
                            GurantorName: PatientBillInfo.GuarantorName,
                            FacilityId: PatientBillInfo.FacilityId,
                            PatientBillId: PatientBillInfo.Id,
                            PatientId: PatientBillInfo.PatientId,
                            PatientName: PatientBillInfo.PatientName,
                            PaymentStatusId: 1,
                            ReceiptApprovedById: detail.CreatedBy,
                            ReceiptDateTime: new Date(),
                            ReceiptStatusId: 1,
                            ReceiptTypeId: 3,
                            AmountPaid: detail.ReceivedAmount,
                            Disallowance: detail.Disallowed,
                            TDSAmount: detail.TDSAmount,
                            AgreementDiscountAmt: detail.AgreementDiscountAmt,
                            PaymentTypeId: InsurancePaymentInfo.PaymentTypeId,
                            BankId: InsurancePaymentInfo.BankId,
                            CardTypeId: InsurancePaymentInfo.CardTypeId,
                            CardNumber: InsurancePaymentInfo.CardNumber,
                            CardExpiryDate: InsurancePaymentInfo.CardExpiryDate,
                            CardHolderName: InsurancePaymentInfo.CardHolderName,
                            TerminalNoId: InsurancePaymentInfo.TerminalNoId,
                            ChequeNo: InsurancePaymentInfo.ChequeNo,
                            ChequeDate: InsurancePaymentInfo.ChequeDate,
                            CollectedOn: InsurancePaymentInfo.CollectedOn,
                            DDNumber: InsurancePaymentInfo.DDNumber,
                            DDDate: InsurancePaymentInfo.DDDate,
                            WireTransferId: InsurancePaymentInfo.WireTransferId,
                            WireTransferDate: InsurancePaymentInfo.WireTransferDate,
                            IsClaimReceipt: true,
                            ReferenceNumber: InsurancePaymentInfo.ReferenceNumber,
                            AuthorizedCode: InsurancePaymentInfo.AuthorizedCode
                        }
                    };
                    await patientPaymentBo.AddPatientPaymentDetails(paymentRequest);
                }
            })(DetailItem);
        }));
        return true;
    }

    public async GetInsurancePaymentDetailsById(req: BaseRequest): Promise<InsurancePaymentDetailsAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetInsurancePaymentDetails(apiReq?: ApiRequest<InsurancePaymentDetailsFilters>):
        Promise<ApiResponse<InsurancePaymentDetailsAttributes[]>> {
        let where: WhereOptions<any> = {};
        let isReqPaymentsearch: boolean = false;
        let paymentWhere: WhereOptions<any> = {};
        let billWhere: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        include.push({
            model: this.Models.Patient,
            attributes: ['Id', 'TitleId', 'FirstName', 'MiddleName', 'LastName', 'MRN', 'Age', 'GenderId'
                , 'AddressLine1', 'AddressLine2', 'City', 'mobile', 'Email'],
            required: false,
            include: [this.GetReference('Title'), this.GetReference('Gender')]
        });
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case InsurancePaymentDetailsFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case InsurancePaymentDetailsFilters.FacilityId:
                        where['FacilityId'] = param.Value;
                        break;
                    case InsurancePaymentDetailsFilters.InsurancePaymentId:
                        where['InsurancePaymentId'] = param.Value;
                        break;
                    case InsurancePaymentDetailsFilters.PatientBillId:
                        billWhere['PatientBillId'] = param.Value;
                        break;
                    case InsurancePaymentDetailsFilters.PaymentDate:
                        paymentWhere['PaymentDate'] = { '$between': param.Value };
                        isReqPaymentsearch = true;
                        break;
                    case InsurancePaymentDetailsFilters.FromDate:
                        paymentWhere['PaymentDate'] = paymentWhere['PaymentDate'] || {};
                        (paymentWhere['PaymentDate'] as any)['$gte'] = param.Value;
                        isReqPaymentsearch = true;
                        break;
                    case InsurancePaymentDetailsFilters.ToDate:
                        paymentWhere['PaymentDate'] = paymentWhere['PaymentDate'] || {};
                        (paymentWhere['PaymentDate'] as any)['$lte'] = param.Value;
                        isReqPaymentsearch = true;
                        break;
                    case InsurancePaymentDetailsFilters.InsurancePaymentStatusId:
                        paymentWhere['InsurancePaymentStatusId'] = param.Value;
                        isReqPaymentsearch = true;
                        break;
                    case InsurancePaymentDetailsFilters.GuarantorTypeId:
                        paymentWhere['GuarantorTypeId'] = param.Value;
                        isReqPaymentsearch = true;
                        break;
                    case InsurancePaymentDetailsFilters.GuarantorId:
                        paymentWhere['GuarantorId'] = param.Value;
                        isReqPaymentsearch = true;
                        break;
                    case InsurancePaymentDetailsFilters.TDSAmount:
                        where['TDSAmount'] = { '$gt': '0' };
                        break;
                    case InsurancePaymentDetailsFilters.Disallowed:
                        where['Disallowed'] = { '$gt': '0' };
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        include.push({
            model: this.Models.InsurancePayment,
            required: isReqPaymentsearch,
            where: paymentWhere,
            include: [this.GetReference('GuarantorType')]
        });
        include.push({
            model: this.Models.PatientBills,
            required: false,
            where: billWhere,
            //include: [this.GetReference('GuarantorType')]
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }
    public async GetInsuranceDisallowance(req: BaseRequest): Promise<any> {
        let result: any = [];
        result.push({ Key: 1, Value: await this.OPDisallowance(req) });
        result.push({ Key: 2, Value: await this.IPDisallowance(req) });
        return result;
    }
    public async OPDisallowance(req: BaseRequest): Promise<any> {
        let GuarantorGroup: { [id: number]: any[] } = {};
        let PatientBillJoin: any = {
            model: this.Models.PatientBills,
            attributes: ['Id'],
            required: true,
            where: {
                BillTypeId: { '$in': [1, 5] },
            }
        };
        let InsurancePaymentJoin: any = {
            model: this.Models.InsurancePayment,
            required: true,
            where: {
                InsurancePaymentStatusId: 3,
                PaymentDate: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                FacilityId: req.Data.FacilityId,
            }
        };

        let OPInstance: any = await this.FindAll({
            attributes: ['Disallowed'],
            where: {
                Disallowed: { '$gt': '0' },
            },
            include: [InsurancePaymentJoin, PatientBillJoin]
        });
        if (OPInstance) {
            let groupbills = _.groupBy(OPInstance, 'InsurancePayment.GuarantorId');
            for (let i in groupbills) {
                let groupedBills = groupbills[i];
                let OpAmount: number = 0;
                let GuarantorId: number = 0;
                let GuarantorName: string = '';
                let GuarantorType: string = '';
                for (let i = 0; i < groupedBills.length; i++) {
                    let bills: any = groupedBills[i];
                    OpAmount += bills.Disallowed;
                    GuarantorId = bills.InsurancePayment.GuarantorId;
                    GuarantorName = bills.InsurancePayment.GuarantorName;
                    // GuarantorType = bills.GuarantorType.Description;
                    GuarantorGroup[GuarantorId] = GuarantorGroup[GuarantorId] || [];
                }
                let info = {
                    'OpAmount': OpAmount,
                    'GuarantorId': GuarantorId,
                    'GuarantorType': GuarantorType,
                    'GuarantorName': GuarantorName,
                };
                GuarantorGroup[GuarantorId].push(info);
            }
        }
        return GuarantorGroup;
    }
    public async IPDisallowance(req: BaseRequest): Promise<any> {
        let GuarantorGroup: { [id: number]: any[] } = {};
        let PatientBillJoin: any = {
            model: this.Models.PatientBills,
            attributes: ['Id'],
            required: true,
            where: {
                BillTypeId: 2,
            }
        };
        let InsurancePaymentJoin: any = {
            model: this.Models.InsurancePayment,
            required: true,
            where: {
                InsurancePaymentStatusId: 3,
                PaymentDate: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                FacilityId: req.Data.FacilityId,
            }
        };

        let IPInstance: any = await this.FindAll({
            attributes: ['Disallowed'],
            where: {
                Disallowed: { '$gt': '0' },
            },
            include: [InsurancePaymentJoin, PatientBillJoin]
        });
        if (IPInstance) {
            let groupbills = _.groupBy(IPInstance, 'InsurancePayment.GuarantorId');
            for (let i in groupbills) {
                let groupedBills = groupbills[i];
                let IpAmount: number = 0;
                let GuarantorId: number = 0;
                let GuarantorName: string = '';
                let GuarantorType: string = '';
                for (let i = 0; i < groupedBills.length; i++) {
                    let bills: any = groupedBills[i];
                    IpAmount += bills.Disallowed;
                    GuarantorId = bills.InsurancePayment.GuarantorId;
                    GuarantorName = bills.InsurancePayment.GuarantorName;
                    // GuarantorType = bills.GuarantorType.Description;
                    GuarantorGroup[GuarantorId] = GuarantorGroup[GuarantorId] || [];
                }
                let info = {
                    'IpAmount': IpAmount,
                    'GuarantorId': GuarantorId,
                    'GuarantorType': GuarantorType,
                    'GuarantorName': GuarantorName,
                };
                GuarantorGroup[GuarantorId].push(info);
            }
        }
        return GuarantorGroup;
    }

    public async DeleteInsurancePaymentDetails(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }
    public async PrintInsurancedetailswithpatient(apiReq?: ApiRequest<InsurancePaymentDetailsFilters>): Promise<any> {
        let data = await this.GetInsurancePaymentDetails(apiReq);
        let InsuranceDetails = data.Data;
        let FromDate = apiReq.Data.FromDate;
        let ToDate = apiReq.Data.ToDate;
        let FacilityName = apiReq.Data.FacilityName;
        let FacilityId = apiReq.Data.FacilityId;
        let GuarantorName = apiReq.Data.GuarantorName;
        let GuarantorType = apiReq.Data.GuarantorType;
        let TotalRecAmt: number = 0;
        let TotalTDS: number = 0;
        let TotalDisallowance: number = 0;
        for (let idx in InsuranceDetails) {
            let item = InsuranceDetails[idx];
            TotalRecAmt += item.ReceivedAmount;
            TotalTDS += item.TDSAmount;
            TotalDisallowance += item.Disallowed;
        }
        let facilityPreferenceBO = BoFactory.GetBo(Userbo.FacilityPreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(FacilityId);
        let info = {
            InsuranceDetails: InsuranceDetails,
            Preferences: printPreferencesData,
            FromDate: FromDate,
            ToDate: ToDate,
            FacilityName: FacilityName,
            GuarantorName: GuarantorName,
            GuarantorType: GuarantorType,
            TotalRecAmt: TotalRecAmt,
            TotalTDS: TotalTDS,
            TotalDisallowance: TotalDisallowance

        };
        let pdfOption: any = null;
        let key = 'insurancepaymentdetailswithpatient';
        pdfOption = {
            format: 'A4',
            orientation: 'Portrait',
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
    public async PrintInsurancetdsreport(apiReq?: ApiRequest<InsurancePaymentDetailsFilters>): Promise<any> {
        let data = await this.GetInsurancePaymentDetails(apiReq);
        let InsuranceDetails = data.Data;
        let FromDate = apiReq.Data.FromDate;
        let ToDate = apiReq.Data.ToDate;
        let FacilityName = apiReq.Data.FacilityName;
        let FacilityId = apiReq.Data.FacilityId;
        let GuarantorName = apiReq.Data.GuarantorName;
        let GuarantorType = apiReq.Data.GuarantorType;
        let TotalRecAmt: number = 0;
        let TotalTDS: number = 0;
        let TotalDisallowance: number = 0;
        for (let idx in InsuranceDetails) {
            let item = InsuranceDetails[idx];
            TotalRecAmt += item.ReceivedAmount;
            TotalTDS += item.TDSAmount;
            TotalDisallowance += item.Disallowed;
        }
        let facilityPreferenceBO = BoFactory.GetBo(Userbo.FacilityPreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(FacilityId);
        let info = {
            InsuranceDetails: InsuranceDetails,
            Preferences: printPreferencesData,
            FromDate: FromDate,
            ToDate: ToDate,
            FacilityName: FacilityName,
            GuarantorName: GuarantorName,
            GuarantorType: GuarantorType,
            TotalRecAmt: TotalRecAmt,
            TotalTDS: TotalTDS,
            TotalDisallowance: TotalDisallowance

        };
        let pdfOption: any = null;
        let key = 'insurancetdsreport';
        pdfOption = {
            format: 'A4',
            orientation: 'Portrait',
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
    public async PrintInsurancedisallowancereport(apiReq?: ApiRequest<InsurancePaymentDetailsFilters>): Promise<any> {
        let data = await this.GetInsurancePaymentDetails(apiReq);
        let InsuranceDetails = data.Data;
        let FromDate = apiReq.Data.FromDate;
        let ToDate = apiReq.Data.ToDate;
        let FacilityName = apiReq.Data.FacilityName;
        let FacilityId = apiReq.Data.FacilityId;
        let GuarantorName = apiReq.Data.GuarantorName;
        let GuarantorType = apiReq.Data.GuarantorType;
        let TotalRecAmt: number = 0;
        let TotalTDS: number = 0;
        let TotalDisallowance: number = 0;
        for (let idx in InsuranceDetails) {
            let item = InsuranceDetails[idx];
            TotalRecAmt += item.ReceivedAmount;
            TotalTDS += item.TDSAmount;
            TotalDisallowance += item.Disallowed;
        }
        let facilityPreferenceBO = BoFactory.GetBo(Userbo.FacilityPreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(FacilityId);
        let info = {
            InsuranceDetails: InsuranceDetails,
            Preferences: printPreferencesData,
            FromDate: FromDate,
            ToDate: ToDate,
            FacilityName: FacilityName,
            GuarantorName: GuarantorName,
            GuarantorType: GuarantorType,
            TotalRecAmt: TotalRecAmt,
            TotalTDS: TotalTDS,
            TotalDisallowance: TotalDisallowance

        };
        let pdfOption: any = null;
        let key = 'insurancedisallowancereport';
        pdfOption = {
            format: 'A4',
            orientation: 'Portrait',
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
    public GetModel(): SStatic.Model<InsurancePaymentDetailsInstance, InsurancePaymentDetailsAttributes> {
        return this.Models.InsurancePaymentDetails;
    }
}
