import { BaseService, BoFactory } from '../../Base/Index';
import { RoleBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ISearchEnums, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import {
    RoleAttributes, RoleFacilityMapAttributes,
    RoleControlMapAttributes, RoleMobileConfigMapAttributes
} from '../Model/Interface/Index';
import { RoleFilters } from '../Common/Filters.e';

export class RoleService extends BaseService {
    private RoleBo: RoleBo;
    constructor(req?: Request) {
        super(req);
        this.RoleBo = BoFactory.GetBo(RoleBo, this.Request);
    }

    public async AddRole(req: BaseRequest): Promise<number> {
        return await this.RoleBo.AddRole(req);
    }

    public async UpdateRole(req: BaseRequest): Promise<boolean> {
        return await this.RoleBo.UpdateRole(req);
    }

    public async GetRoleById(req: BaseRequest): Promise<RoleAttributes> {
        return await this.RoleBo.GetRoleById(req);
    }

    public async GetRoles(apiReq?: ApiRequest<RoleFilters>): Promise<ApiResponse<RoleAttributes[]>> {
        return await this.RoleBo.GetRoles(apiReq);
    }

    public async DeleteRole(req: BaseRequest): Promise<Boolean> {
        return await this.RoleBo.DeleteRole(req);
    }

    public async MapFacilities(req: BaseRequest): Promise<Boolean> {
        return await this.RoleBo.MapFacilities(req);
    }

    public async GetFacilities(apiReq?: ApiRequest<ISearchEnums>): Promise<Array<RoleFacilityMapAttributes>> {
        const result = await this.RoleBo.GetFacilities(apiReq);
        return result as Array<RoleFacilityMapAttributes>;
    }

    public async MapMobileConfigs(req: BaseRequest): Promise<Boolean> {
        return await this.RoleBo.MapMobileConfigs(req);
    }

    public async GetRoleMobileConfigMap(apiReq?: ApiRequest<ISearchEnums>): Promise<Array<RoleMobileConfigMapAttributes>> {
        const result = await this.RoleBo.GetRoleMobileConfigMap(apiReq);
        return result as Array<RoleMobileConfigMapAttributes>;
    }

    public async MapControls(req: BaseRequest): Promise<Boolean> {
        return await this.RoleBo.MapControls(req);
    }

    public async GetControls(apiReq?: ApiRequest<ISearchEnums>): Promise<Array<RoleControlMapAttributes>> {
        const result = await this.RoleBo.GetControls(apiReq);
        return result as Array<RoleControlMapAttributes>;
    }
}
