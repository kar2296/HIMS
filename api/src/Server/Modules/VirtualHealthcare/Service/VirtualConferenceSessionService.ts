import { BaseService, BoFactory } from '../../Base/Index';
import { VirtualConferenceSessionUserBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { VirtualConferenceSessionUserAttributes } from '../Model/Interface/Index';
import { VirtualConferenceSessionUserFilters } from '../Common/Filters.e';

export class VirtualConferenceSessionUserService extends BaseService {
    private VirtualConferenceSessionUserBo: VirtualConferenceSessionUserBo;
    constructor(req?: Request) {
        super(req);
        this.VirtualConferenceSessionUserBo = BoFactory.GetBo(VirtualConferenceSessionUserBo, this.Request);
    }

    public async AddVirtualConferenceSessionUser(req: BaseRequest): Promise<number> {
        return await this.VirtualConferenceSessionUserBo.AddVirtualConferenceSessionUser(req);
    }

    public async UpdateVirtualConferenceSessionUser(req: BaseRequest): Promise<boolean> {
        return await this.VirtualConferenceSessionUserBo.UpdateVirtualConferenceSessionUser(req);
    }

    public async GetVirtualConferenceSessionUserById(req: BaseRequest): Promise<VirtualConferenceSessionUserAttributes> {
        return await this.VirtualConferenceSessionUserBo.GetVirtualConferenceSessionUserById(req);
    }

    public async GetVirtualConferenceSessionUsers(apiReq?: ApiRequest<VirtualConferenceSessionUserFilters>):
        Promise<ApiResponse<VirtualConferenceSessionUserAttributes[]>> {
        return await this.VirtualConferenceSessionUserBo.GetVirtualConferenceSessionUsers(apiReq);
    }

    public async DeleteVirtualConferenceSessionUser(req: BaseRequest): Promise<Boolean> {
        return await this.VirtualConferenceSessionUserBo.DeleteVirtualConferenceSessionUser(req);
    }
}
