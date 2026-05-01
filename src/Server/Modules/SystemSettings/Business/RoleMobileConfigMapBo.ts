import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest } from '../../../Common/Index';
import { RoleMobileConfigMapInstance, RoleMobileConfigMapAttributes } from '../Model/Interface/Index';
import { RoleMobileConfigMapFilters } from '../Common/Filters.e';

export class RoleMobileConfigMapBo extends BaseBo<RoleMobileConfigMapInstance, RoleMobileConfigMapAttributes>  {
    public async AddRoleMobileConfigMap(req: BaseRequest): Promise<number> {
        let result = await this.Save(req.Data);
        return result.dataValues.MobileConfigId;
    }

    public async UpdateRoleMobileConfigMap(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetRoleMobileConfigMapById(req: BaseRequest): Promise<RoleMobileConfigMapAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetRoleMobileConfigMaps(apiReq?: ApiRequest<RoleMobileConfigMapFilters>):
        Promise<ApiResponse<RoleMobileConfigMapAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case RoleMobileConfigMapFilters.MobileConfigId:
                        where['MobileConfigId'] = param.Value;
                        break;
                    case RoleMobileConfigMapFilters.RoleId:
                        where['RoleId'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeleteRoleMobileConfigMap(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<RoleMobileConfigMapInstance, RoleMobileConfigMapAttributes> {
        return this.Models.RoleMobileConfigMap;
    }

}
