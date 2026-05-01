import * as SStatic from 'sequelize';
import { BaseBo, BoFactory } from '../../Base/Index';
import { WhereOptions, IncludeOptions, FileInfo, Report } from '../../../Core/Index';
import { BaseRequest, ApiRequest, ApiResponse } from '../../../Common/Index';
import { InsurancePaymentInstance, InsurancePaymentAttributes } from '../Model/Interface/Index';
import { InsurancePaymentFilters } from '../Common/Filters.e';
import { SequenceKeys } from '../../General/Common/Sequence.s';
import * as billingBo from '../Business/Index';
import * as guaBo from '../../GeneralMaster/Business/Index';
import { GuarantorFilters } from '../../GeneralMaster/Common/Filters.e';
import * as Userbo from '../../SystemSettings/Business/Index';
import { join } from 'path';


export class InsurancePaymentBo extends BaseBo<InsurancePaymentInstance, InsurancePaymentAttributes> {
    public async AddInsurancePayment(req: BaseRequest): Promise<number> {
        // if (req.Data.InsurancePaymentStatusId === 3)
        // req.Data.PaymentIdentifier = await Sequence.Next(SequenceKeys.InsurancePaymentIdentifier);

        let result = await this.Save(req.Data);
        if (req.Data.InsurancePaymentStatusId === 3) {
            let InsurancePaymentId = result.dataValues.Id;
            this.deferSequenceKey(InsurancePaymentId, 'PaymentIdentifier',
                this.getFacilitySequenceIdentifier(SequenceKeys.InsurancePaymentIdentifier,
                    (req.Data.FacilityId ? req.Data.FacilityId : -1)
                ));
        }
        let InsuranceDetailsBo = BoFactory.GetBo(billingBo.InsurancePaymentDetailsBo, this.Request);
        await InsuranceDetailsBo.ManageInsurancePaymentDetails(result.dataValues.Id, req.Data.Details);
        return result.dataValues.Id;
    }

    public async UpdateInsurancePayment(req: BaseRequest): Promise<boolean> {
        // if (req.Data.InsurancePaymentStatusId === 3)
        //     req.Data.PaymentIdentifier = await Sequence.Next(SequenceKeys.InsurancePaymentIdentifier);
        let result = await this.Update(req.Data);
        if (req.Data.InsurancePaymentStatusId === 3) {
            let InsurancePaymentId = req.Data.Id;
            this.deferSequenceKey(InsurancePaymentId, 'PaymentIdentifier',
                this.getFacilitySequenceIdentifier(SequenceKeys.InsurancePaymentIdentifier,
                    (req.Data.FacilityId ? req.Data.FacilityId : -1)
                ));
        }
        let InsuranceDetailsBo = BoFactory.GetBo(billingBo.InsurancePaymentDetailsBo, this.Request);
        await InsuranceDetailsBo.ManageInsurancePaymentDetails(req.Data.Id, req.Data.Details);
        return result;
    }

    public async GetInsurancePaymentById(req: BaseRequest): Promise<InsurancePaymentAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetInsurancePayments(apiReq?: ApiRequest<InsurancePaymentFilters>): Promise<ApiResponse<InsurancePaymentAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        include.push({
            model: this.Models.InsurancePaymentDetails,
            required: false,
            include: [{
                model: this.Models.Patient, attributes: ['FirstName', 'LastName', 'MRN', 'Age', 'Mobile',
                    'MRNTypeId', 'DOB', 'TitleId', 'GenderId', 'AddressLine1',
                    'AddressLine2', 'Pincode', 'Area', 'City', 'State', 'Country'],
                required: false,
                include: [this.GetReference('Title'), this.GetReference('Gender')]
            },
            {
                model: this.Models.PatientBills,
                required: false,
                attributes: ['Id', 'BillNumber', 'BillDateTime', 'BillAmount', 'IsPaidFully',
                    'OutStandingAmount', 'PaidAmount', 'CreditVocher']
            }]
        });
        include.push({
            model: this.Models.User, as: 'ApprovedUser', attributes: ['FirstName', 'LastName'], required: false,
            include: [this.GetReference('Title')]
        });
        include.push(this.GetReference('GuarantorType'));
        include.push({
            model: this.Models.Guarantor, attributes: ['GuarantorName'],
            required: false

        });

        include.push(this.GetReference('InsurancePaymentStatus'));
        include.push(this.GetReference('PaymentType'));
        include.push(this.GetReference('Bank'));

        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case InsurancePaymentFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case InsurancePaymentFilters.PaymentIdentifier:
                        where['PaymentIdentifier'] = param.Value;
                        break;
                    case InsurancePaymentFilters.FacilityId:
                        where['FacilityId'] = param.Value;
                        break;
                    case InsurancePaymentFilters.InsurancePaymentStatusId:
                        where['InsurancePaymentStatusId'] = param.Value;
                        break;
                    case InsurancePaymentFilters.GuarantorTypeId:
                        where['GuarantorTypeId'] = param.Value;
                        break;
                    case InsurancePaymentFilters.GuarantorId:
                        where['GuarantorId'] = param.Value;
                        break;
                    case InsurancePaymentFilters.PaymentDate:
                        where['PaymentDate'] = { '$between': param.Value || '' };
                        break;
                    case InsurancePaymentFilters.FromDate:
                        where['PaymentDate'] = where['PaymentDate'] || {};
                        (where['PaymentDate'] as any)['$gte'] = param.Value;
                        break;
                    case InsurancePaymentFilters.ToDate:
                        where['PaymentDate'] = where['PaymentDate'] || {};
                        (where['PaymentDate'] as any)['$lte'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeleteInsurancePayment(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }
    public async PrintInsurancePayments(req: BaseRequest): Promise<FileInfo> {
        let apiReq = {
            Id: 0,
            PageContext: { PageSize: 50, PageNumber: 1 },
            Params: [{ Key: InsurancePaymentFilters.Id, Value: req.Id }]
        };
        let data = await this.GetInsurancePayments(apiReq);
        let InsurancePayments: any = data.Data[0];
        let GuarantorBo = BoFactory.GetBo(guaBo.GuarantorBo, this.Request);
        let guaReq = {
            Id: 0,
            PageContext: { PageSize: 50, PageNumber: 1 },
            Params: [{ Key: GuarantorFilters.Id, Value: InsurancePayments.GuarantorId }]
        };
        let guarantorData = await GuarantorBo.GetGuarantors(guaReq);
        let facilityPreferenceBO = BoFactory.GetBo(Userbo.FacilityPreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(InsurancePayments.FacilityId);

        let info = {
            InsurancePayment: InsurancePayments,
            Guarantor: guarantorData.Data[0],
            //PaidAmount: InsurancePayments.ReceivedAmount + InsurancePayments.TDSAmount + InsurancePayments.Disallowed,
            PaidAmount: InsurancePayments.ReceivedAmount,
            Preferences: printPreferencesData
        };
        let pdfOption: any = null;
        let key = 'claimreceipt';
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
    public async PrintInsuranceReceiptReport(apiReq?: ApiRequest<InsurancePaymentFilters>): Promise<any> {
        let data = await this.GetInsurancePayments(apiReq);
        let InsuranceReceipt = data.Data;
        let FromDate = apiReq.Data.FromDate;
        let ToDate = apiReq.Data.ToDate;
        let FacilityName = apiReq.Data.FacilityName;
        let GuarantorName = apiReq.Data.GuarantorName;
        let GuarantorType = apiReq.Data.GuarantorType;
        let InsuranceReceiptData = data.Data[0];
        let TotalRecAmt: number = 0;
        let TotalTDS: number = 0;
        let TotalDisallowance: number = 0;
        for (let idx in InsuranceReceipt) {
            let item = InsuranceReceipt[idx];
            TotalRecAmt += item.ReceivedAmount;
            TotalTDS += item.TDSAmount;
            TotalDisallowance += item.Disallowed;
        }
        let facilityPreferenceBO = BoFactory.GetBo(Userbo.FacilityPreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(InsuranceReceiptData.FacilityId);
        let info = {
            InsuranceReceipt: InsuranceReceipt,
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
        let key = 'insurancereceiptreport';
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
    public GetModel(): SStatic.Model<InsurancePaymentInstance, InsurancePaymentAttributes> {
        return this.Models.InsurancePayment;
    }
}
