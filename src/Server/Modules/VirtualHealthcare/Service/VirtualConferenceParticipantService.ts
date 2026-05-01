import { BaseService, BoFactory } from '../../Base/Index';
import { VirtualConferenceParticipantBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { VirtualConferenceParticipantAttributes } from '../Model/Interface/Index';
import { VirtualConferenceParticipantFilters } from '../Common/Filters.e';

export class VirtualConferenceParticipantService extends BaseService {
    private VirtualConferenceParticipantBo: VirtualConferenceParticipantBo;
    constructor(req?: Request) {
        super(req);
        this.VirtualConferenceParticipantBo = BoFactory.GetBo(VirtualConferenceParticipantBo, this.Request);
    }

    public async AddVirtualConferenceParticipant(req: BaseRequest): Promise<number> {
        return await this.VirtualConferenceParticipantBo.AddVirtualConferenceParticipant(req);
    }

    public async UpdateVirtualConferenceParticipant(req: BaseRequest): Promise<boolean> {
        return await this.VirtualConferenceParticipantBo.UpdateVirtualConferenceParticipant(req);
    }

    public async GetVirtualConferenceParticipantById(req: BaseRequest): Promise<VirtualConferenceParticipantAttributes> {
        return await this.VirtualConferenceParticipantBo.GetVirtualConferenceParticipantById(req);
    }

    public async GetVirtualConferenceParticipants(apiReq?: ApiRequest<VirtualConferenceParticipantFilters>):
        Promise<ApiResponse<VirtualConferenceParticipantAttributes[]>> {
        return await this.VirtualConferenceParticipantBo.GetVirtualConferenceParticipants(apiReq);
    }

    public async DeleteVirtualConferenceParticipant(req: BaseRequest): Promise<Boolean> {
        return await this.VirtualConferenceParticipantBo.DeleteVirtualConferenceParticipant(req);
    }
}
