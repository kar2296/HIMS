import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest } from '../../../Common/Index';
import { PatientBillSplitDetailsInstance, PatientBillSplitDetailsAttributes } from '../Model/Interface/Index';
import { PatientBillSplitDetailsFilters } from '../Common/Filters.e';
export class PatientBillSplitDetailsBo extends BaseBo<PatientBillSplitDetailsInstance, PatientBillSplitDetailsAttributes>  {
    public async AddPatientBillSplitDetails(req: BaseRequest): Promise<number> {
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdatePatientBillSplitDetails(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data);
        return result;
    }

    public async DeleteSplitDetails(PatientBillSummaryId: number) {
        let splitApiReq = {
            Id: 0,
            PageContext: { PageSize: 10000, PageNumber: 1 },
            Params: [{ Key: PatientBillSplitDetailsFilters.PatientBillSummaryId, Value: PatientBillSummaryId }]
        };
        let billsplitDetails = await this.GetPatientBillSplitDetails(splitApiReq);
        //Delete the Existing split items for refersh new details
        await Promise.all(billsplitDetails.Data.map((billsplitItem): Promise<void> => {
            return (async (split): Promise<void> => {
                await this.DeleteById(split);
            })(billsplitItem);
        }));
    }

    public async ManagePatientBillSplitDetails(PatientBillSummaryId: number,
        details: PatientBillSplitDetailsAttributes[]):
        Promise<boolean> {
        details = details || [];
        await Promise.all(details.map((detailItem): Promise<void> => {
            return (async (detail): Promise<void> => {

                let splitId = await this.GetExistsBillSplit({
                    where: {
                        PatientBillSummaryId: PatientBillSummaryId,
                        PatientBillId: detail.PatientBillId,
                        PatientBillDetailId: detail.PatientBillDetailId
                    },
                    attributes: ['Id']
                });
                if (splitId === -1) {
                    detail.Id = detail.Id || 0;
                } else {
                    detail.Id = splitId;
                }
                detail.PatientBillSummaryId = PatientBillSummaryId;
                if (detail.Status === 2 && detail.Id !== 0) {
                    await this.MarkAsDelete(detail.Id);
                } else if (detail.Id === 0) {
                    await this.Save(detail);
                } else if (detail.Id > 0) {
                    await this.Update(detail);
                }
            })(detailItem);
        }));
        return true;
    }

    public async ModifiedPatientBillSplitDetails(PatientBillSummaryId: number,
        details: PatientBillSplitDetailsAttributes[]):
        Promise<boolean> {
        details = details || [];
        await Promise.all(details.map((detailItem): Promise<void> => {
            return (async (detail): Promise<void> => {
                detail.Id = detail.Id || 0;
                detail.PatientBillSummaryId = PatientBillSummaryId;
                if (detail.Status === 2 && detail.Id !== 0) {
                    await this.MarkAsDelete(detail.Id);
                } else if (detail.Id === 0) {
                    await this.Save(detail);
                } else if (detail.Id > 0) {
                    await this.Update(detail);
                }
            })(detailItem);
        }));
        return true;
    }

    public async GetExistsBillSplit(foption: SStatic.FindOptions<any>): Promise<number> {
        let billSplitId: number = -1;
        let billSplitInstance: any = await this.Find(foption);
        if (billSplitInstance) {
            let billSplit = this.GetAttribute(billSplitInstance);
            billSplitId = billSplit.Id;
        } return billSplitId;
    }


    public async GetPatientBillSplitDetailsById(req: BaseRequest): Promise<PatientBillSplitDetailsAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetPatientBillSplitDetails(apiReq?: ApiRequest<PatientBillSplitDetailsFilters>):
        Promise<ApiResponse<PatientBillSplitDetailsAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case PatientBillSplitDetailsFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case PatientBillSplitDetailsFilters.EncounterId:
                        where['EncounterId'] = param.Value;
                        break;
                    case PatientBillSplitDetailsFilters.PatientBillId:
                        where['PatientBillId'] = param.Value;
                        break;
                    case PatientBillSplitDetailsFilters.PatientBillSummaryId:
                        where['PatientBillSummaryId'] = param.Value;
                        break;
                    case PatientBillSplitDetailsFilters.IsSupplementary:
                        where['IsSupplementary'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeletePatientBillSplitDetails(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<PatientBillSplitDetailsInstance, PatientBillSplitDetailsAttributes> {
        return this.Models.PatientBillSplitDetails;
    }

}
