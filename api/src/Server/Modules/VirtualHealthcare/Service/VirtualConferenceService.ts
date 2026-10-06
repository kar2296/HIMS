import { BaseService, BoFactory } from '../../Base/Index';
import { VirtualConferenceBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { VirtualConferenceAttributes } from '../Model/Interface/Index';
import { VirtualConferenceFilters } from '../Common/Filters.e';

export class VirtualConferenceService extends BaseService {
    private VirtualConferenceBo: VirtualConferenceBo;
    constructor(req?: Request) {
        super(req);
        this.VirtualConferenceBo = BoFactory.GetBo(VirtualConferenceBo, this.Request);
    }

    public async AddVirtualConference(req: BaseRequest): Promise<number> {
        return await this.VirtualConferenceBo.AddVirtualConference(req);
    }

    public async UpdateVirtualConference(req: BaseRequest): Promise<boolean> {
        return await this.VirtualConferenceBo.UpdateVirtualConference(req);
    }

    public async GetVirtualConferenceById(req: BaseRequest): Promise<VirtualConferenceAttributes> {
        return await this.VirtualConferenceBo.GetVirtualConferenceById(req);
    }

    public async GetVirtualConferences(apiReq?: ApiRequest<VirtualConferenceFilters>): Promise<ApiResponse<VirtualConferenceAttributes[]>> {
        return await this.VirtualConferenceBo.GetVirtualConferences(apiReq);
    }

    public async DeleteVirtualConference(req: BaseRequest): Promise<Boolean> {
        return await this.VirtualConferenceBo.DeleteVirtualConference(req);
    }

    public async CreateRoom(req: BaseRequest): Promise<any> {
        return await this.VirtualConferenceBo.createRoom(req);
    }

    public async GetModeratorJoinUrl(req: BaseRequest): Promise<any> {
        return await this.VirtualConferenceBo.getModeratorJoinUrl(req);
    }

    public async GetAttendeeJoinUrl(req: BaseRequest): Promise<any> {
        return await this.VirtualConferenceBo.getAttendeeJoinUrl(req);
    }
}
