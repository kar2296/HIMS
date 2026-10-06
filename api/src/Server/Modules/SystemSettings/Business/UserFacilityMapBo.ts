import * as SStatic from 'sequelize';
import { Op } from 'sequelize'; // Important: Add this import for modern Sequelize operators
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { Paginator, ApiRequest } from '../../../Common/Index';
import { UserFacilityMapInstance, UserFacilityMapAttributes } from '../Model/Interface/Index';
import { UserFacilityMapFilters } from '../Common/Filters.e';

export class UserFacilityMapBo extends BaseBo<UserFacilityMapInstance, UserFacilityMapAttributes> {
    public async GetUserFacilityMaps(apiReq?: ApiRequest<UserFacilityMapFilters>): Promise<Array<UserFacilityMapAttributes>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        include.push({ model: this.Models.Facility, required: false });
        include.push({ model: this.Models.User, required: false });
        if (apiReq && apiReq.Params) {
            apiReq.Params.forEach((param) => {
                switch (param.Key) {
                    case UserFacilityMapFilters.UserId:
                        where['UserId'] = param.Value;
                        break;
                    case UserFacilityMapFilters.FacilityId:
                        where['FacilityId'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            });
        }
        let pg: Paginator = new Paginator(apiReq.PageContext);
        let result = await this.FindAll({
            where: where,
            include: include,
            attributes: apiReq.Attributes,
            limit: pg.Limit, offset: pg.Offset
        });
        return this.GetAttributes(result);
    }
    // Fix the search method that was causing the $like error (line 72)
    public async SearchUsers(searchTerm: string): Promise<Array<UserFacilityMapAttributes>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        // Fix: Use modern Sequelize Op.like syntax instead of $like
        include.push({
            model: this.Models.User,
            where: {
                [Op.or]: [
                    { FirstName: { [Op.like]: '%' + searchTerm + '%' } },
                    { LastName: { [Op.like]: '%' + searchTerm + '%' } },
                    { UserName: { [Op.like]: '%' + searchTerm + '%' } }
                ]
            },
            required: true
        });

        let result = await this.FindAll({
            where: where,
            include: include
        });
        return this.GetAttributes(result);
    }
    public GetModel(): SStatic.Model<UserFacilityMapInstance, UserFacilityMapAttributes> {
        return this.Models.UserFacilityMap;
    }
}
