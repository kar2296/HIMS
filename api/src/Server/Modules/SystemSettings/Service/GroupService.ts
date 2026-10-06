import {BaseService, BoFactory} from '../../Base/Index';
import { GroupBo} from '../Business/Index';
import {ApiRequest, BaseRequest, ISearchEnums, ApiResponse} from '../../../Common/Index';
import {Request} from '../../../Core/Index';
import { GroupAttributes, GroupFacilityMapAttributes, GroupRoleMapAttributes} from '../Model/Interface/Index';
import { GroupFilters } from '../Common/Filters.e';

export class GroupService extends BaseService {
    private GroupBo: GroupBo;
    constructor(req?: Request) {
        super(req);
        this.GroupBo = BoFactory.GetBo(GroupBo, this.Request);
    }

    public async AddGroup(req: BaseRequest): Promise<number> {
        return await this.GroupBo.AddGroup(req);
    }

    public async UpdateGroup(req: BaseRequest): Promise<boolean> {
        return await this.GroupBo.UpdateGroup(req);
    }

    public async GetGroupById(req: BaseRequest): Promise<GroupAttributes> {
        return await this.GroupBo.GetGroupById(req);
    }

    public async GetGroups(apiReq?: ApiRequest<GroupFilters>): Promise<ApiResponse<GroupAttributes[]>> {
        return await this.GroupBo.GetGroups(apiReq);
    }

    public async DeleteGroup(req: BaseRequest): Promise<Boolean> {
        return await this.GroupBo.DeleteGroup(req);
    }

    public async MapFacilities(req: BaseRequest): Promise<Boolean> {
        return await this.GroupBo.MapFacilities(req);
    }

    public async GetFacilities(apiReq?: ApiRequest<ISearchEnums>): Promise<Array<GroupFacilityMapAttributes>> {
        const result = await this.GroupBo.GetFacilities(apiReq);
        return result as Array<GroupFacilityMapAttributes>;
    }

    public async MapRoles(req: BaseRequest): Promise<Boolean> {
        return await this.GroupBo.MapRoles(req);
    }

    public async GetRoles(apiReq?: ApiRequest<ISearchEnums>): Promise<Array<GroupRoleMapAttributes>> {
        const result = await this.GroupBo.GetRoles(apiReq);
        return result as Array<GroupRoleMapAttributes>;
    }
}
