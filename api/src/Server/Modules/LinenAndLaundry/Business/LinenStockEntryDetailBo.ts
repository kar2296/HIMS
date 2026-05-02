import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest } from '../../../Common/Index';
import { LinenStockEntryDetailInstance, LinenStockEntryDetailAttributes } from '../Model/Interface/Index';
import { LinenStockEntryDetailFilters } from '../Common/Filters.e';

export class LinenStockEntryDetailBo extends BaseBo<LinenStockEntryDetailInstance, LinenStockEntryDetailAttributes>  {
    public async AddLinenStockEntryDetail(req: BaseRequest): Promise<number> {
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateLinenStockEntryDetail(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data);
        return result;
    }

    public async ManageLinenStockEntryDetails
        (LinenStockEntryId: number, details: LinenStockEntryDetailAttributes[]): Promise<boolean> {
        details = details || [];
        await Promise.all(details.map((DetailItem): Promise<void> => {
            return (async (detail): Promise<void> => {
                detail.Id = detail.Id || 0;
                detail.LinenStockEntryId = LinenStockEntryId;
                if (detail.Status === 2 && detail.Id !== 0) {
                    await this.MarkAsDelete(detail.Id);
                } else if (detail.Id === 0) {
                    let result = await this.Save(detail);
                    detail.Id = result.dataValues.Id;
                } else if (detail.Id > 0) {
                    await this.Update(detail);
                }
            })(DetailItem);
        }));
        return true;
    }

    public async GetLinenStockEntryDetailById(req: BaseRequest): Promise<LinenStockEntryDetailAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetLinenStockEntryDetails(apiReq?: ApiRequest<LinenStockEntryDetailFilters>):
        Promise<ApiResponse<LinenStockEntryDetailAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        include.push({ model: this.Models.LinenStockEntry, as: 'LinenStockEntry', required: false });
        include.push({
            model: this.Models.LinenItemMaster, as: 'LinenItemMaster', required: false
        });
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case LinenStockEntryDetailFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case LinenStockEntryDetailFilters.LinenStockEntryId:
                        where['LinenStockEntryId'] = param.Value;
                        break;
                    case LinenStockEntryDetailFilters.LinenItemMasterId:
                        where['LinenItemMasterId'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeleteLinenStockEntryDetail(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<LinenStockEntryDetailInstance, LinenStockEntryDetailAttributes> {
        return this.Models.LinenStockEntryDetail;
    }

}
