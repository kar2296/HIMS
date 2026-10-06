import * as SStatic from 'sequelize';
import { BaseBo, BoFactory } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest } from '../../../Common/Index';
import { PatientCreditNoteDetailsFilters } from '../Common/Filters.e';
import { PatientCreditNoteDetailsInstance, PatientCreditNoteDetailsAttributes } from '../Model/Interface/Index';
import * as billingBO from '../../Billing/Business/Index';

export class PatientCreditNoteDetailsBo extends BaseBo<PatientCreditNoteDetailsInstance, PatientCreditNoteDetailsAttributes>  {
    public async AddPatientCreditNoteDetails(req: BaseRequest): Promise<number> {
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdatePatientCreditNoteDetails(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data);
        return result;
    }

    public async ManagePatientCreditNoteDetails(PatientCreditNoteId: number, details: PatientCreditNoteDetailsAttributes[])
        : Promise<boolean> {
        details = details || [];
        await Promise.all(details.map((DetailItem): Promise<void> => {
            return (async (detail): Promise<void> => {
                detail.Id = 0;
                // detail.Id = detail.Id || 0;
                detail.PatientCreditNoteId = PatientCreditNoteId;
                if (detail.Status === 2 && detail.Id !== 0) {
                    await this.MarkAsDelete(detail.Id);
                } else if (detail.Id === 0) {
                    await this.Save(detail);
                } else if (detail.Id > 0) {
                    await this.Update(detail);
                }
            })(DetailItem);
        }));
        return true;
    }

    public async ManagePatientBills(req: number): Promise<boolean> {
        let PatientCreditNoteId: number = req;
        let ApiReq = {
            Id: 0,
            PageContext: { PageSize: 100, PageNumber: 1 },
            Params: [{ Key: PatientCreditNoteDetailsFilters.PatientCreditNoteId, Value: PatientCreditNoteId }]
        };
        let CNDetails = await this.GetPatientCreditNoteDetails(ApiReq);
        console.log('*********CNDetails*********', CNDetails);
        let BillBo = BoFactory.GetBo(billingBO.PatientBillsBo, this.Request);
        let BillDetailBo = BoFactory.GetBo(billingBO.PatientBillDetailsBo, this.Request);
        let CreditNoteBo = BoFactory.GetBo(billingBO.PatientCreditNoteBo, this.Request);
        let CreditNote = await CreditNoteBo.GetPatientCreditNoteById({ Id: PatientCreditNoteId });
        let CNAmount: number = 0;
        await Promise.all(CNDetails.Data.map((DetailItem): Promise<void> => {
            return (async (detail): Promise<void> => {
                let BillDetails = await BillDetailBo.GetPatientBillDetailsById({ Id: detail.PatientBillDetailId });
                CNAmount += isNaN(parseFloat(detail.CreditNoteAmount.toString())) ? 0 : parseFloat(detail.CreditNoteAmount.toString());
                BillDetails.CNAmount += parseFloat(detail.CreditNoteAmount.toString());
                await BillDetailBo.Update(BillDetails);
            })(DetailItem);
        }));
        let Bill = await BillBo.GetPatientBillsById({ Id: CreditNote.PatientBillId });
        Bill.CNAmount += CNAmount;
        Bill.RefundAmount += CNAmount;
        await BillBo.Update(Bill);
        return true;
    }

    public async GetPatientCreditNoteDetailsById(req: BaseRequest): Promise<PatientCreditNoteDetailsAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    // public async GetPatientCreditNoteDetails(apiReq?: ApiRequest<ISearchEnums>)
    // : Promise<ApiResponse<PatientCreditNoteDetailsAttributes[]>> {
    public async GetPatientCreditNoteDetails(apiReq?: ApiRequest<PatientCreditNoteDetailsFilters>):
        Promise<ApiResponse<PatientCreditNoteDetailsAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        include.push({ model: this.Models.ServiceItem, attributes: ['ItemCode'], required: false });
        include.push(this.GetReference('CreditNoteType'));
        apiReq.Params.forEach((param) => {
            switch (param.Key) {
                case PatientCreditNoteDetailsFilters.Id:
                    where['Id'] = param.Value;
                    break;
                case PatientCreditNoteDetailsFilters.Name:
                    where['Name'] = param.Value;
                    break;
                case PatientCreditNoteDetailsFilters.CreditNoteType:
                    where['CreditNoteTypeId'] = param.Value;
                    break;
                case PatientCreditNoteDetailsFilters.PatientCreditNoteId:
                    where['PatientCreditNoteId'] = param.Value;
                    break;
                default:
                    throw 'Not Implemented';
            }
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeletePatientCreditNoteDetails(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<PatientCreditNoteDetailsInstance, PatientCreditNoteDetailsAttributes> {
        return this.Models.PatientCreditNoteDetails;
    }

}
