import { BaseService, BoFactory } from '../../Base/Index';
import { WardRoomServiceMapBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { WardRoomServiceMapAttributes } from '../Model/Interface/Index';
import { WardRoomServiceMapFilters } from '../Common/Filters.e';

export class WardRoomServiceMapService extends BaseService {
    private WardRoomServiceMapBo: WardRoomServiceMapBo;
    constructor(req?: Request) {
        super(req);
        this.WardRoomServiceMapBo = BoFactory.GetBo(WardRoomServiceMapBo, this.Request);
    }

    public async AddWardRoomServiceMap(req: BaseRequest): Promise<number> {
        return await this.WardRoomServiceMapBo.AddWardRoomServiceMap(req);
    }

    public async UpdateWardRoomServiceMap(req: BaseRequest): Promise<boolean> {
        return await this.WardRoomServiceMapBo.UpdateWardRoomServiceMap(req);
    }

    public async GetWardRoomServiceMapById(req: BaseRequest): Promise<WardRoomServiceMapAttributes> {
        return await this.WardRoomServiceMapBo.GetWardRoomServiceMapById(req);
    }

    public async GetWardRoomServiceMaps(apiReq?: ApiRequest<WardRoomServiceMapFilters>):
        Promise<ApiResponse<WardRoomServiceMapAttributes[]>> {
        return await this.WardRoomServiceMapBo.GetWardRoomServiceMaps(apiReq);
    }

    public async GetRoomChargesDetails(req: BaseRequest): Promise<any> {
        return await this.WardRoomServiceMapBo.GetRoomChargesDetails(req);
    }

    public async DeleteWardRoomServiceMap(req: BaseRequest): Promise<Boolean> {
        return await this.WardRoomServiceMapBo.DeleteWardRoomServiceMap(req);
    }
}
