import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest } from '../../../Common/Index';
import { BudgetDetailInstance, BudgetDetailAttributes } from '../Model/Interface/Index';
import { BudgetDetailFilters } from '../Common/Filters.e';

export class BudgetDetailBo extends BaseBo<BudgetDetailInstance, BudgetDetailAttributes>  {
    public async AddBudgetDetail(req: BaseRequest): Promise<number> {
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateBudgetDetail(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data);
        return result;
    }

    // public async ManageBudgetDetails(BudgetId: number, details: BudgetDetailAttributes[]): Promise<boolean> {
    //     details = details || [];
    //     let promises: Array<any> = [];
    //     details.forEach(detail => {
    //         detail.Id = detail.Id || 0;
    //         detail.BudgetId = BudgetId;
    //         if (detail.Status === 2 && detail.Id !== 0) {
    //             promises.push(this.MarkAsDelete(detail.Id));
    //         } else if (detail.Id === 0) {
    //             promises.push(this.Save(detail));
    //         } else if (detail.Id > 0) {
    //             promises.push(this.Update(detail));
    //         }
    //     });
    //     await Promise.all(promises);
    //     return true;
    // }
    public async ManageBudgetDetails(BudgetId: number, details: BudgetDetailAttributes[]): Promise<boolean> {
        details = details || [];
        await Promise.all(details.map((DetailItem): Promise<void> => {
            return (async (Detail): Promise<void> => {
                let detail: any = Detail;
                detail.Id = detail.Id || 0;
                detail.BudgetId = BudgetId;
                if (detail.Status === 2 && detail.Id !== 0) {
                    await this.MarkAsDelete(detail.Id);
                } else if (detail.Id === 0) {
                    let savedDetails = await this.Save(detail);
                    detail.Id = savedDetails.dataValues.Id;
                } else if (detail.Id > 0) {
                    await this.Update(detail);
                }
            })(DetailItem);
        }));
        return true;
    }
    public async GetBudgetDetailById(req: BaseRequest): Promise<BudgetDetailAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetBudgetDetails(apiReq?: ApiRequest<BudgetDetailFilters>):
        Promise<ApiResponse<BudgetDetailAttributes[]>> {
        let where: WhereOptions<any>= {};
        let include: Array<IncludeOptions> = [];
        // include.push({ model: this.Models.UomMaster, as: 'PurchaseUom', required: false });
        // include.push({ model: this.Models.UomMaster, as: 'BaseUom', required: false });
        // include.push({ model: this.Models.GstMaster, as: 'GstMaster', required: false });
        // include.push({ model: this.Models.GstMaster, as: 'InGstMaster', required: false });
        // include.push({ model: this.Models.GstMaster, as: 'CGstMaster', required: false });
        // include.push({ model: this.Models.GstMaster, as: 'SGstMaster', required: false });
        // include.push({ model: this.Models.VendorMaster, as: 'VendorMaster', required: false });
        // include.push({ model: this.Models.StoreMaster, as: 'FromStore', required: false });
        // include.push({ model: this.Models.StoreMaster, as: 'ToStore', required: false });
        // include.push({ model: this.Models.ItemVendorMap, attributes: ['MaxQty', 'MinQty'], as: 'VendorItem', required: false });
        // include.push({ model: this.Models.PurchaseRequest, as: 'PurchaseRequest', required: false });
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case BudgetDetailFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case BudgetDetailFilters.BudgetId:
                        where['BudgetId'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeleteBudgetDetail(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<BudgetDetailInstance, BudgetDetailAttributes> {
        return this.Models.BudgetDetail;
    }
    /*
    public async GetOptions(key: string, apiReq?: ApiRequest<PurchaseRequestDetailFilters>): Promise<any> {
        apiReq.Attributes = apiReq.Attributes || ['Id', 'ItemId', 'ItemCode', ['ItemName', 'Text'], 'ItemName'];
        let val = await this.GetPurchaseRequestDetails(apiReq);
        return { [key]: val.Data };
    }
    */
}
