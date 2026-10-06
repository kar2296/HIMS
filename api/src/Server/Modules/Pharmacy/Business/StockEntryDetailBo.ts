import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest } from '../../../Common/Index';
import { StockEntryDetailInstance, StockEntryDetailAttributes } from '../Model/Interface/Index';
import { StockEntryDetailFilters } from '../Common/Filters.e';

export class StockEntryDetailBo extends BaseBo<StockEntryDetailInstance, StockEntryDetailAttributes>  {
    public async AddStockEntryDetail(req: BaseRequest): Promise<number> {
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateStockEntryDetail(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data);
        return result;
    }

    /*
    public async ManageStockEntryDetails(StockEntryId: number, details: StockEntryDetailAttributes[]): Promise<boolean> {
        details = details || [];
        let promises: Array<any> = [];
        details.forEach(detail => {
            detail.Id = detail.Id || 0;
            detail.StockEntryId = StockEntryId;
            if (detail.Status === 2 && detail.Id !== 0) {
                promises.push(this.MarkAsDelete(detail.Id));
            } else if (detail.Id === 0) {
                promises.push(this.Save(detail));
            } else if (detail.Id > 0) {
                promises.push(this.Update(detail));
            }
        });
        await Promise.all(promises);
        return true;
    }
    */

    public async ManageStockEntryDetails(StockEntryId: number, request: any, details: StockEntryDetailAttributes[]): Promise<boolean> {
        details = details || [];
        await Promise.all(details.map((DetailItem): Promise<void> => {
            return (async (detail): Promise<void> => {
                detail.Id = detail.Id || 0;
                detail.StockEntryId = StockEntryId;
                if (detail.Status === 2 && detail.Id !== 0) {
                    await this.MarkAsDelete(detail.Id);
                } else if (detail.Status === 1 && detail.Id === 0) {
                    //await this.Save(detail);
                    let result = await this.Save(detail);
                    detail.Id = result.dataValues.Id;
                    /*
                    if (request.Header.StockEntryStatusId === 2) {
                        let stockitemBO = BoFactory.GetBo(bo.StockItemBo, this.Request);
                        await stockitemBO.ManageOpeningStockItem(StockEntryId, request, detail);
                    }
                    */
                } else if (detail.Status === 1 && detail.Id > 0) {
                    await this.Update(detail);
                    /*
                    if (request.Header.StockEntryStatusId === 2) {
                        let stockitemBO = BoFactory.GetBo(bo.StockItemBo, this.Request);
                        await stockitemBO.ManageOpeningStockItem(StockEntryId, request, detail);
                    }
                    */
                }
            })(DetailItem);
        }));
        return true;
    }

    public async GetStockEntryDetailById(req: BaseRequest): Promise<StockEntryDetailAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetStockEntryDetails(apiReq?: ApiRequest<StockEntryDetailFilters>):
        Promise<ApiResponse<StockEntryDetailAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        include.push({ model: this.Models.UomMaster, as: 'PurchaseUom', required: false });
        include.push({ model: this.Models.UomMaster, as: 'BaseUom', required: false });
        include.push({ model: this.Models.StockEntry, as: 'StockEntry', required: false });
        include.push({
            model: this.Models.ItemMaster, attributes: ['ItemCode', 'ItemName', 'ProductRegNo'],
            as: 'ItemMaster', required: false
        });
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case StockEntryDetailFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case StockEntryDetailFilters.StockEntryId:
                        where['StockEntryId'] = param.Value;
                        break;
                    case StockEntryDetailFilters.ItemMasterId:
                        where['ItemMasterId'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeleteStockEntryDetail(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<StockEntryDetailInstance, StockEntryDetailAttributes> {
        return this.Models.StockEntryDetail;
    }

}
