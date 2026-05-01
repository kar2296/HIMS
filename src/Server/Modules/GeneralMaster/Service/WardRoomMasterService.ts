import { BaseService, BoFactory } from '../../Base/Index';
import { WardRoomMasterBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request, Response  } from '../../../Core/Index';
import { WardRoomMasterAttributes } from '../Model/Interface/Index';
import { WardRoomMasterFilters } from '../Common/Filters.e';

export class WardRoomMasterService extends BaseService {
    private WardRoomMasterBo: WardRoomMasterBo;
    constructor(req?: Request) {
        super(req);
        this.WardRoomMasterBo = BoFactory.GetBo(WardRoomMasterBo, this.Request);
    }

    public async AddWardRoomMaster(req: BaseRequest): Promise<number> {
        return await this.WardRoomMasterBo.AddWardRoomMaster(req);
    }

    public async UpdateWardRoomMaster(req: BaseRequest): Promise<boolean> {
        return await this.WardRoomMasterBo.UpdateWardRoomMaster(req);
    }
   public async GetRoomLogo(req: BaseRequest): Promise<WardRoomMasterAttributes> {
        return await this.WardRoomMasterBo.GetRoomLogo(req);
    }
	  public async GetRoomFile(req: BaseRequest, res: Response): Promise<any> {
        return await this.WardRoomMasterBo.GetRoomFile(req, res);
    }
    public async GetWardRoomMasterById(req: BaseRequest): Promise<WardRoomMasterAttributes> {
        return await this.WardRoomMasterBo.GetWardRoomMasterById(req);
    }

    public async GetWardRoomMasters(apiReq?: ApiRequest<WardRoomMasterFilters>): Promise<ApiResponse<WardRoomMasterAttributes[]>> {
        return await this.WardRoomMasterBo.GetWardRoomMasters(apiReq);
    }

    public async DeleteWardRoomMaster(req: BaseRequest): Promise<Boolean> {
        return await this.WardRoomMasterBo.DeleteWardRoomMaster(req);
    }
}
