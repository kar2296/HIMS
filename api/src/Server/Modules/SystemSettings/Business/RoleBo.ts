import * as SStatic from 'sequelize';
import { BaseBo, IOptionProvider, MapBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { BaseRequest, ApiRequest, ISearchEnums, ApiResponse } from '../../../Common/Index';
import { RoleInstance, RoleAttributes } from '../Model/Interface/Index';
import { RoleFilters } from '../Common/Filters.e';

export class RoleBo extends BaseBo<RoleInstance, RoleAttributes> implements IOptionProvider {
    public async AddRole(req: BaseRequest): Promise<number> {
        this.HandleActiveState(req.Data);
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateRole(req: BaseRequest): Promise<boolean> {
        this.HandleActiveState(req.Data);
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetRoleById(req: BaseRequest): Promise<RoleAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetRoles(apiReq?: ApiRequest<RoleFilters>): Promise<ApiResponse<RoleAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        include.push(this.GetReference('ActiveStatus'));
        include.push({ model: this.Models.Facility, as: 'Facility', required: false });
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case RoleFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case RoleFilters.Name:
                        where['RoleName'] = { '$like': (param.Value || '') + '%' };
                        break;
                    case RoleFilters.RoleCode:
                        where['RoleCode'] = { '$like': (param.Value || '') + '%' };
                        break;
                    case RoleFilters.ActiveStatus:
                        where['ActiveStatusId'] = param.Value;
                        break;
                    case RoleFilters.FacilityId:
                        where['FacilityId'] = param.Value;
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

    public async DeleteRole(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<RoleInstance, RoleAttributes> {
        return this.Models.Role;
    }

    public async GetOptions(key: string, apiReq?: ApiRequest<RoleFilters>): Promise<any> {
        apiReq.Attributes = apiReq.Attributes || ['Id', ['RoleName', 'Text'], 'RoleCode', 'Description'];
        let val = await this.GetRoles(apiReq);
        return { [key]: val.Data };
    }

    public async MapFacilities(req: BaseRequest) {
        let mapbo = new MapBo(this.Models.RoleFacilityMap as any, 'RoleId', 'FacilityId', this.Request);
        return await mapbo.Manage(req.Data);
    }

    public async GetFacilities(apiReq?: ApiRequest<ISearchEnums>) {
        let mapbo = new MapBo(this.Models.RoleFacilityMap as any, 'RoleId', 'FacilityId', this.Request);
        return await mapbo.GetMaps(apiReq);
    }

    public async MapMobileConfigs(req: BaseRequest) {
        let mapbo = new MapBo(this.Models.RoleMobileConfigMap as any, 'RoleId', 'MobileConfigId', this.Request);
        return await mapbo.Manage(req.Data);
    }

    public async GetRoleMobileConfigMap(apiReq?: ApiRequest<ISearchEnums>) {
        let mapbo = new MapBo(this.Models.RoleMobileConfigMap as any, 'RoleId', 'MobileConfigId', this.Request);
        return await mapbo.GetMaps(apiReq);
    }

    public async MapControls(req: BaseRequest) {
        let mapbo = new MapBo(this.Models.RoleControlMap as any, 'RoleId', 'ControlId', this.Request);
        return await mapbo.Manage(req.Data);
    }

    public async GetControls(apiReq?: ApiRequest<ISearchEnums>) {
        let mapbo = new MapBo(this.Models.RoleControlMap as any, 'RoleId', 'ControlId', this.Request);
        return await mapbo.GetMaps(apiReq);
    }
}
