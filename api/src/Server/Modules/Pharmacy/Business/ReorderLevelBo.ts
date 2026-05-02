import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { BaseRequest, ApiRequest, ApiResponse } from '../../../Common/Index';
import { ReorderLevelInstance, ReorderLevelAttributes } from '../Model/Interface/Index';
import { ReorderLevelFilters } from '../Common/Filters.e';

export class ReorderLevelBo extends BaseBo<ReorderLevelInstance, ReorderLevelAttributes> {
    public async AddReorderLevel(req: BaseRequest): Promise<number> {
        this.HandleActiveState(req.Data);
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateReorderLevel(req: BaseRequest): Promise<boolean> {
        this.HandleActiveState(req.Data);
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetReorderLevelById(req: BaseRequest): Promise<ReorderLevelAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetReorderLevels(apiReq?: ApiRequest<ReorderLevelFilters>): Promise<ApiResponse<ReorderLevelAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case ReorderLevelFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case ReorderLevelFilters.StoreMasterId:
                        where['StoreMasterId'] = param.Value;
                        break;
                    case ReorderLevelFilters.ProductTypeId:
                        where['ProductTypeId'] = param.Value;
                        break;
                    case ReorderLevelFilters.ItemMasterId:
                        where['ItemMasterId'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        return await this.FindAndCountAll(apiReq, {
            where: where,
            include: include,
            attributes: apiReq.Attributes
        });
    }

    public async DeleteReorderLevel(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<ReorderLevelInstance, ReorderLevelAttributes> {
        return this.Models.ReorderLevel;
    }
}
