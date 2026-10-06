import * as SStatic from 'sequelize';
import { Op } from 'sequelize'; // Add this import for operators
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { Paginator, ApiRequest } from '../../../Common/Index';
import { UserCategoryMapInstance, UserCategoryMapAttributes } from '../Model/Interface/Index';
import { UserCategoryMapFilters } from '../Common/Filters.e';

export class UserCategoryMapBo extends BaseBo<UserCategoryMapInstance, UserCategoryMapAttributes> {

    public async GetUserCategoryMaps(apiReq?: ApiRequest<UserCategoryMapFilters>): Promise<Array<UserCategoryMapAttributes>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        include.push({ model: this.Models.VirtualCategory, required: false });
        apiReq.Params.forEach((param) => {
            switch (param.Key) {
                case UserCategoryMapFilters.UserId:
                    where['UserId'] = param.Value;
                    break;
                default:
                    throw 'Not Implemented';
            }
        });
        let pg: Paginator = new Paginator(apiReq.PageContext);
        let result = await this.FindAll({
            where: where,
            include: include,
            attributes: apiReq.Attributes,
            limit: pg.Limit, offset: pg.Offset
        });
        return this.GetAttributes(result);
    }
    public GetModel(): SStatic.Model<UserCategoryMapInstance, UserCategoryMapAttributes> {
        return this.Models.UserCategoryMap;
    }
}
