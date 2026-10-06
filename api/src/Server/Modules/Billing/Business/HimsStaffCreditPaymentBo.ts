import * as SStatic from 'sequelize';
import { BaseBo, BoFactory } from '../../Base/Index';
import { WhereOptions, IncludeOptions, FileInfo, Report } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest } from '../../../Common/Index';
import { StaffCreditPaymentInstance, StaffCreditPaymentAttributes } from '../Model/Interface/Index';
import { StaffCreditPaymentFilters } from '../Common/Filters.e';
import { SequenceKeys } from '../../General/Common/Sequence.s';
import * as billingbo from '../../Billing/Business/Index';
import { join } from 'path';
import * as Userbo from '../../SystemSettings/Business/Index';
import * as patBo from '../../Registration/Business/Index';

export class StaffCreditPaymentBo extends BaseBo<StaffCreditPaymentInstance,
    StaffCreditPaymentAttributes> {
    public async AddStaffCreditPayment(req: BaseRequest): Promise<number> {
        let result = await this.Save(req.Data.Header);
        if (result) {
            let creditpaymentid = result.dataValues.Id;
            let StaffCreditPaymentIdentifier: any = null;
            if (req.Data.Header.StaffCreditPaymentStatusId === 2) {
                StaffCreditPaymentIdentifier = this.getSequenceIdentifier(SequenceKeys.StaffCreditPaymentId);
            }
            if (StaffCreditPaymentIdentifier) {
                this.deferSequenceKey(creditpaymentid, 'StaffCreditPaymentIdentifier', StaffCreditPaymentIdentifier);
            }
            if (req.Data.Header.StaffId > 0) {
                let userbo = BoFactory.GetBo(Userbo.UserBo, this.Request);
                let PatBO = BoFactory.GetBo(patBo.PatientBo, this.Request);
                let PatientInfo = await PatBO.GetPatientById({ Id: req.Data.Header.StaffId });
                let UserInfo = await userbo.GetUserById({ Id: PatientInfo.UserId });
                let paymentRequest: any = {
                    Data: {
                        Id: UserInfo.Id,
                        BillAmount: req.Data.Header.TotBillAmount,
                        PaidAmount: req.Data.Header.UserpayAmount,
                        OutStandingAmount: (req.Data.Header.TotBillAmount) - (req.Data.Header.UserpayAmount),

                    }
                };
                await userbo.UpdateUserStaffBills(paymentRequest);
            }

            let PaymentDetailbo = BoFactory.GetBo(billingbo.StaffCreditPaymentDetailsBo, this.Request);
            await PaymentDetailbo.ManageStaffCreditPaymentDetails(result.dataValues.Id, req.Data.Details);


        }
        return result.dataValues.Id;
    }
    // public async AddStaffCreditPayment(req: BaseRequest): Promise<number> {
    //     this.HandleActiveState(req.Data);
    //     let result = await this.Save(req.Data.Header);
    //     let detailBO = BoFactory.GetBo(billingbo.StaffCreditPaymentDetailsBo, this.Request);
    //     let StaffCreditPaymentId = result.dataValues.Id;
    //     await detailBO.ManageStaffCreditPaymentDetails(StaffCreditPaymentId, req.Data.Details);
    //     return StaffCreditPaymentId;
    // }

    public async UpdateStaffCreditPayment(req: BaseRequest): Promise<boolean> {
        this.HandleActiveState(req.Data);
        let generatecreditpyment = 0;
        if (req.Data.PaymentStatusId === 2 || req.Data.PaymentStatusId === 3) {
            req.Data.StaffCreditPaymentIdentifier = null; //await Sequence.Next(SequenceKeys.StaffCreditPayment);
            generatecreditpyment = 1;
        }
        let result = await this.Update(req.Data);
        if (generatecreditpyment === 1) {
            this.deferSequenceKey(req.Data.Id, 'StaffCreditPaymentIdentifier',
                this.getSequenceIdentifier(SequenceKeys.StaffCreditPaymentId));
        }
        let PaymentDetailbo = BoFactory.GetBo(billingbo.StaffCreditPaymentDetailsBo, this.Request);
        await PaymentDetailbo.ManageStaffCreditPaymentDetails(req.Data.Header.Id, req.Data.Details);
        return result;
    }

    public async GetStaffCreditPaymentById(req: BaseRequest): Promise<StaffCreditPaymentAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetStaffCreditPayments(apiReq?: ApiRequest<StaffCreditPaymentFilters>):
        Promise<ApiResponse<StaffCreditPaymentAttributes[]>> {
        let where: WhereOptions<any> = {};
        let order: Array<any> = [];
        let include: Array<IncludeOptions> = [];
        include.push(this.GetReference('PaymentType'));
        include.push(this.GetReference('StaffCreditPaymentStatus'));
        // include.push({
        //     model: this.Models.Facility, attributes: ['FacilityName'], required: false,
        // });
        include.push({
            model: this.Models.StaffCreditPaymentDetails, required: false,
        });
        include.push({
            model: this.Models.User, as: 'CreatedUser', attributes: ['FirstName', 'LastName'], required: false,
            include: [
                this.GetReference('Title')
            ]
        });

        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case StaffCreditPaymentFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case StaffCreditPaymentFilters.StaffCreditPaymentIdentifier:
                        where['StaffCreditPaymentIdentifier'] = { '$like': (param.Value || '') + '%' };
                        break;
                    case StaffCreditPaymentFilters.StaffCreditPaymentDate:
                        where['StaffCreditPaymentDate'] = { '$between': param.Value || '' };
                        break;
                    case StaffCreditPaymentFilters.FromDate:
                        where['StaffCreditPaymentDate'] = where['StaffCreditPaymentDate'] || {};
                        (where['StaffCreditPaymentDate'] as any)['$gte'] = param.Value;
                        break;
                    case StaffCreditPaymentFilters.ToDate:
                        where['StaffCreditPaymentDate'] = where['StaffCreditPaymentDate'] || {};
                        (where['StaffCreditPaymentDate'] as any)['$lte'] = param.Value;
                        break;
                    case StaffCreditPaymentFilters.StaffCreditPaymentStatusId:
                        where['StaffCreditPaymentStatusId'] = param.Value;
                        break;
                    case StaffCreditPaymentFilters.MRN:
                        patientQryJoin['where'] = {
                            '$or': [
                                { 'MRN': { '$like': '%' + (param.Value || '') + '%' } },
                                { 'FirstName': { '$like': '%' + (param.Value || '') + '%' } },
                                { 'LastName': { '$like': '%' + (param.Value || '') + '%' } }
                            ]
                        };
                        break;
                    default:
                        throw ('Not Implemented');
                }
            }
        });
        let patientQryJoin: any = {
            model: this.Models.Patient, attributes: ['TitleId', 'FirstName', 'LastName', 'MRN', 'Age', 'Mobile', 'MRNTypeId'],
            required: false,
            include: [
                this.GetReference('Title')
            ]
        };
        order.push(['UpdatedAt', 'DESC']);
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes, order: order });
    }

    public async DeleteStaffCreditPayment(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }
    public async PrintStaffCreditPayment(req: BaseRequest): Promise<FileInfo> {
        let apiReq = {
            Id: 0,
            PageContext: { PageSize: 50, PageNumber: 1 },
            Params: [{ Key: StaffCreditPaymentFilters.Id, Value: req.Id }]
        };
        let data = await this.GetStaffCreditPayments(apiReq);
        let StaffCreditPayments: any = data.Data[0];
        let facilityPreferenceBO = BoFactory.GetBo(Userbo.FacilityPreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(StaffCreditPayments.FacilityId);
        let info = {
            StaffCreditPayment: StaffCreditPayments,
            Preferences: printPreferencesData
        };
        return await Report.Generate('StaffCreditPayment', { header: {}, body: info });
    }
    public async PrintStaffCreditPaymentReport(apiReq?: ApiRequest<StaffCreditPaymentFilters>): Promise<any> {
        let data = await this.GetStaffCreditPayments(apiReq);
        let StaffCreditPayment = data.Data;
        let FromDate = apiReq.Data.FromDate;
        let ToDate = apiReq.Data.ToDate;
        let DoctorName = apiReq.Data.DoctorName;
        let StaffCreditPaymentData = data.Data[0];
        let TotalVoucherAmount: number = 0;
        // let TotalTDSAmount: number = 0;
        let TotalPaidAmount: number = 0;
        // for (let idx in StaffCreditPayment) {
        //     let item = StaffCreditPayment[idx];
        //     TotalVoucherAmount += item.DcotorInvoiceAmount;
        //     // TotalTDSAmount += item.TDSAmount;
        //     TotalPaidAmount += item.DcotorPaymentAmount;
        // }
        let facilityPreferenceBO = BoFactory.GetBo(Userbo.FacilityPreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(StaffCreditPaymentData.FacilityId);
        let info = {
            StaffCreditPayment: StaffCreditPayment,
            Preferences: printPreferencesData,
            FromDate: FromDate,
            ToDate: ToDate,
            DoctorName: DoctorName,
            TotalVoucherAmount: TotalVoucherAmount,
            // TotalTDSAmount: TotalTDSAmount,
            TotalPaidAmount: TotalPaidAmount

        };
        let pdfOption: any = null;
        let key = 'StaffCreditPaymentreport';
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


    public GetModel(): SStatic.Model<StaffCreditPaymentInstance, StaffCreditPaymentAttributes> {
        return this.Models.StaffCreditPayment;
    }
}
