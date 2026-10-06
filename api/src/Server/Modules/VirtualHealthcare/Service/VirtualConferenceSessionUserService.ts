import { BaseService, BoFactory } from '../../Base/Index';
import { VirtualConferenceSessionBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { VirtualConferenceSessionAttributes } from '../Model/Interface/Index';
import { VirtualConferenceSessionFilters } from '../Common/Filters.e';

export class VirtualConferenceSessionService extends BaseService {
    private VirtualConferenceSessionBo: VirtualConferenceSessionBo;
    constructor(req?: Request) {
        super(req);
        this.VirtualConferenceSessionBo = BoFactory.GetBo(VirtualConferenceSessionBo, this.Request);
    }

    public async AddVirtualConferenceSession(req: BaseRequest): Promise<number> {
        return await this.VirtualConferenceSessionBo.AddVirtualConferenceSession(req);
    }

    public async UpdateVirtualConferenceSession(req: BaseRequest): Promise<boolean> {
        return await this.VirtualConferenceSessionBo.UpdateVirtualConferenceSession(req);
    }

    public async GetVirtualConferenceSessionById(req: BaseRequest): Promise<VirtualConferenceSessionAttributes> {
        return await this.VirtualConferenceSessionBo.GetVirtualConferenceSessionById(req);
    }

    public async GetVirtualConferenceSessions(apiReq?: ApiRequest<VirtualConferenceSessionFilters>):
        Promise<ApiResponse<VirtualConferenceSessionAttributes[]>> {
        return await this.VirtualConferenceSessionBo.GetVirtualConferenceSessions(apiReq);
    }

    public async DeleteVirtualConferenceSession(req: BaseRequest): Promise<Boolean> {
        return await this.VirtualConferenceSessionBo.DeleteVirtualConferenceSession(req);
    }
}
