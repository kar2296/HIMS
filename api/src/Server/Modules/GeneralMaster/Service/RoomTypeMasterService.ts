import { BaseService, BoFactory } from '../../Base/Index';
import { RoomTypeMasterBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { RoomTypeMasterAttributes } from '../Model/Interface/Index';
import {RoomTypeMasterFilters} from '../Common/Filters.e';

export class RoomTypeMasterService extends BaseService {
    private RoomTypeMasterBo: RoomTypeMasterBo;
    constructor(req?: Request) {
        super(req);
        this.RoomTypeMasterBo = BoFactory.GetBo(RoomTypeMasterBo, this.Request);
    }

    public async AddRoomTypeMaster(req: BaseRequest): Promise<number> {
        return await this.RoomTypeMasterBo.AddRoomTypeMaster(req);
    }

    public async UpdateRoomTypeMaster(req: BaseRequest): Promise<boolean> {
        return await this.RoomTypeMasterBo.UpdateRoomTypeMaster(req);
    }

    public async GetRoomTypeMasterById(req: BaseRequest): Promise<RoomTypeMasterAttributes> {
        return await this.RoomTypeMasterBo.GetRoomTypeMasterById(req);
    }

    public async GetRoomTypeMasters(apiReq?: ApiRequest<RoomTypeMasterFilters>): Promise<ApiResponse<RoomTypeMasterAttributes[]>> {
        return await this.RoomTypeMasterBo.GetRoomTypeMasters(apiReq);
    }

    public async DeleteRoomTypeMaster(req: BaseRequest): Promise<Boolean> {
        return await this.RoomTypeMasterBo.DeleteRoomTypeMaster(req);
    }
}
