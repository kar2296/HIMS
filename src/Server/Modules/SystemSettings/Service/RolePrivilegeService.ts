import {BaseService, BoFactory } from '../../Base/Index';
import { RolePrivilegeBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { RolePrivilegeAttributes } from '../Model/Interface/Index';
import { RolePrivilegeFilters } from '../Common/Filters.e';

export class RolePrivilegeService extends BaseService {
    private RolePrivilegeBo: RolePrivilegeBo;
    constructor(req?: Request) {
        super(req);
        this.RolePrivilegeBo = BoFactory.GetBo(RolePrivilegeBo, this.Request);
    }

    public async AddRolePrivilege(req: BaseRequest): Promise<number> {
        return await this.RolePrivilegeBo.AddRolePrivilege(req);
    }

    public async UpdateRolePrivilege(req: BaseRequest): Promise<boolean> {
        return await this.RolePrivilegeBo.UpdateRolePrivilege(req);
    }

    public async ManageRolePrivilege(req: BaseRequest): Promise<boolean> {
        return await this.RolePrivilegeBo.ManageRolePrivilege(req);
    }

    public async GetRolePrivilegeById(req: BaseRequest): Promise<RolePrivilegeAttributes> {
        return await this.RolePrivilegeBo.GetRolePrivilegeById(req);
    }

    public async GetRolePrivileges(apiReq?: ApiRequest<RolePrivilegeFilters>): Promise<ApiResponse<RolePrivilegeAttributes[]>> {
        return await this.RolePrivilegeBo.GetRolePrivileges(apiReq);
    }

    public async DeleteRolePrivilege(req: BaseRequest): Promise<Boolean> {
        return await this.RolePrivilegeBo.DeleteRolePrivilege(req);
    }
}
