import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions, Report } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest } from '../../../Common/Index';
import { PatientPaymentAdjustmentsInstance, PatientPaymentAdjustmentsAttributes } from '../Model/Interface/Index';
//import { Sequence, SequenceKeys } from '../../General/Common/Sequence.s';
import { PatientPaymentAdjustmentsFilters } from '../Common/Filters.e';
import { BoFactory } from '../../Base/Business/Index';
import * as billingbo from '../../Billing/Business/Index';
import * as userbo from '../../SystemSettings/Business/Index';
import { join } from 'path';
import * as _ from 'lodash';

export class PatientPaymentAdjustmentsBo extends BaseBo<PatientPaymentAdjustmentsInstance, PatientPaymentAdjustmentsAttributes>  {
    public async AddPatientPaymentAdjustments(req: BaseRequest): Promise<number> {
        return 0;
    }

    public async UpdatePatientPaymentAdjustments(req: BaseRequest): Promise<boolean> {
        return true;
    }

    public async ManagePatientPaymentAdjustments(PatientBillId: number, details: PatientPaymentAdjustmentsAttributes[]):
        Promise<boolean> {
        details = details || [];
        await Promise.all(details.map((DetailItem): Promise<void> => {
            return (async (detail): Promise<void> => {
                detail.Id = detail.Id || 0;
                detail.PatientBillId = PatientBillId;
                detail.AdjustedDateTime = new Date();
                if (detail.Id === 0) {
                    await this.Save(detail);

                    if (detail.ParentReceiptId > 0) {
                        let PaymentDetailBO = BoFactory.GetBo(billingbo.PatientPaymentDetailsBo, this.Request);
                        let AdvanceReceipt = await PaymentDetailBO.GetPatientPaymentDetailsById({ Id: detail.ParentReceiptId });
                        AdvanceReceipt.AmountAdjusted = AdvanceReceipt.AmountAdjusted + detail.AdvanceAdjusted;
                        await PaymentDetailBO.Update(AdvanceReceipt);
                    }
                }
            })(DetailItem);
        }));
        return true;
    }

    public async GetPatientPaymentAdjustmentsById(req: BaseRequest): Promise<PatientPaymentAdjustmentsAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetPatientPaymentAdjustments(apiReq?: ApiRequest<PatientPaymentAdjustmentsFilters>):
        Promise<ApiResponse<PatientPaymentAdjustmentsAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        let patientWhere: WhereOptions<any> = {};
        let isReqPatientSearch: boolean = false;
        // include.push({
        //     model: this.Models.User, attributes: ['FirstName', 'LastName'], required: false,
        //     include: [this.GetReference('Title')]
        // });
        // include.push({
        //     model: this.Models.User, attributes: ['FirstName', 'LastName'], as: 'CreatedUser', required: false,
        //     include: [
        //         this.GetReference('Title')
        //     ]
        // });
        include.push({
            model: this.Models.Department, attributes: ['DepartmentName'], required: false,
        });
        include.push({
            model: this.Models.PatientPaymentDetails, as: 'AdvanceDetail', required: false,
        });
        include.push({
            model: this.Models.PatientPaymentDetails, as: 'BillingDetail', required: false,
        });
        include.push({
            model: this.Models.PatientBills, required: false,
        });
        include.push({ model: this.Models.Encounter, attributes: ['VisitIdentifier'], required: false });
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case PatientPaymentAdjustmentsFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case PatientPaymentAdjustmentsFilters.PaymentAdjustNumber:
                        where['PaymentAdjustNumber'] = param.Value;
                        break;
                    case PatientPaymentAdjustmentsFilters.OnlyPID:
                        where['PatientId'] = param.Value;
                        break;
                    case PatientPaymentAdjustmentsFilters.AdjustedDateTime:
                        where['AdjustedDateTime'] = { '$between': param.Value };
                        break;
                    case PatientPaymentAdjustmentsFilters.FirstName:
                        (patientWhere as any)['$or'] = [{ 'FirstName': { '$like': '%' + (param.Value || '') + '%' } },
                        { 'LastName': { '$like': '%' + (param.Value || '') + '%' } },
                        { 'MRN': { '$like': '%' + (param.Value || '') + '%' } }];
                        isReqPatientSearch = true;
                        break;
                    case PatientPaymentAdjustmentsFilters.LastName:
                        (patientWhere as any)['$or'] = [{ 'FirstName': { '$like': '%' + (param.Value || '') + '%' } },
                        { 'LastName': { '$like': '%' + (param.Value || '') + '%' } },
                        { 'MRN': { '$like': '%' + (param.Value || '') + '%' } }];
                        isReqPatientSearch = true;
                        break;
                    case PatientPaymentAdjustmentsFilters.PatientNameMRN:
                        (patientWhere as any)['$or'] = [{ 'FirstName': { '$like': '%' + (param.Value || '') + '%' } },
                        { 'LastName': { '$like': '%' + (param.Value || '') + '%' } },
                        { 'MRN': { '$like': '%' + (param.Value || '') + '%' } }];
                        isReqPatientSearch = true;
                        break;
                    case PatientPaymentAdjustmentsFilters.PatientBillId:
                        where['PatientBillId'] = param.Value;
                        break;
                    case PatientPaymentAdjustmentsFilters.EncounterId:
                        where['EncounterId'] = param.Value;
                        break;
                    case PatientPaymentAdjustmentsFilters.EncounterTypeId:
                        where['EncounterTypeId'] = param.Value;
                        break;
                    case PatientPaymentAdjustmentsFilters.BillTypeId:
                        where['BillTypeId'] = param.Value;
                        break;
                    case PatientPaymentAdjustmentsFilters.From:
                        where['AdjustedDateTime'] = where['AdjustedDateTime'] || {};
                        (where['AdjustedDateTime'] as any)['$gte'] = param.Value;
                        break;
                    case PatientPaymentAdjustmentsFilters.To:
                        where['AdjustedDateTime'] = where['AdjustedDateTime'] || {};
                        (where['AdjustedDateTime'] as any)['$lte'] = param.Value;
                        break;
                    case PatientPaymentAdjustmentsFilters.FacilityId:
                        where['FacilityId'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        include.push({
            model: this.Models.Patient,
            attributes: ['Id', 'TitleId', 'FirstName', 'MiddleName', 'LastName', 'MRN', 'Age', 'GenderId'],
            required: isReqPatientSearch,
            where: patientWhere,
            include: [this.GetReference('Title'), this.GetReference('Gender')]
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeletePatientPaymentAdjustments(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<PatientPaymentAdjustmentsInstance, PatientPaymentAdjustmentsAttributes> {
        return this.Models.PatientPaymentAdjustments;
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
    public async PrintPatientFundAdjustmentReport(apiReq?: ApiRequest<PatientPaymentAdjustmentsFilters>): Promise<any> {
        let data = await this.GetPatientPaymentAdjustments(apiReq);
        let FromDate = apiReq.Data.FromDate;
        let ToDate = apiReq.Data.ToDate;
        let FacilityName = apiReq.Data.FacilityName;
        let DoctorName = apiReq.Data.DoctorName;
        let GuarantorName = apiReq.Data.GuarantorName;
        let DepartmentName = apiReq.Data.DepartmentName;
        let AdvanceFundDetailsData = data.Data[0];
        let AllDetailInfo: any = [];
        let TransDetails: any;
        let GrpData: any;
        let GroupedBatchData = _.groupBy(data.Data, 'ParentReceiptId');


        for (let idx in GroupedBatchData) {
            TransDetails = { AdvInfoRecDate: '', RecNumber: '', AdvanceAmount: '', AdjustDetails: [] };
            GrpData = GroupedBatchData[idx];
            for (let gdx in GrpData) {
                let billInfo = {
                    TransactionNum: '',
                    TransDate: '',
                    BillDate: '',
                    AdjustedAmount: 0,
                    BalanceAmt: 0,
                };
                TransDetails.AdvInfoRecDate = GrpData[0].AdvanceDetail.ReceiptDateTime;
                TransDetails.RecNumber = GrpData[0].AdvanceDetail.ReceiptNumber;
                TransDetails.AdvanceAmount = GrpData[0].AdvanceDetail.AmountPaid;
                let adjData = GrpData[gdx];
                billInfo.TransactionNum = adjData.PatientBill.BillNumber;
                billInfo.TransDate = adjData.BillingDetail.ReceiptDateTime;
                billInfo.BillDate = adjData.PatientBill.BillDateTime;
                billInfo.AdjustedAmount = adjData.AdvanceAdjusted;
                billInfo.BalanceAmt = adjData.BalanceAdvance;
                TransDetails.AdjustDetails.push(billInfo);
            }
            AllDetailInfo.push(TransDetails);
        }
        let facilityPreferenceBO = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(AdvanceFundDetailsData.FacilityId);
        let info = {
            AllDetailInfo: AllDetailInfo,
            Preferences: printPreferencesData,
            FromDate: FromDate,
            ToDate: ToDate,
            FacilityName: FacilityName,
            DoctorName: DoctorName,
            GuarantorName: GuarantorName,
            DepartmentName: DepartmentName

        };
        let pdfOption: any = null;
        let key = 'patientfundadjustmentreport';
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
}
