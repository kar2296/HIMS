import { BaseService, BoFactory } from '../../Base/Index';
import { WardRoomBedMasterBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { WardRoomBedMasterAttributes } from '../Model/Interface/Index';
import { WardRoomBedMasterFilters, BedStatusFilters } from '../Common/Filters.e';

export class WardRoomBedMasterService extends BaseService {
    private WardRoomBedMasterBo: WardRoomBedMasterBo;
    constructor(req?: Request) {
        super(req);
        this.WardRoomBedMasterBo = BoFactory.GetBo(WardRoomBedMasterBo, this.Request);
    }

    public async AddWardRoomBedMaster(req: BaseRequest): Promise<number> {
        return await this.WardRoomBedMasterBo.AddWardRoomBedMaster(req);
    }

    public async UpdateWardRoomBedMaster(req: BaseRequest): Promise<boolean> {
        return await this.WardRoomBedMasterBo.UpdateWardRoomBedMaster(req);
    }

    public async GetWardRoomBedMasterById(req: BaseRequest): Promise<WardRoomBedMasterAttributes> {
        return await this.WardRoomBedMasterBo.GetWardRoomBedMasterById(req);
    }

    public async GetWardRoomBedMasters(apiReq?: ApiRequest<WardRoomBedMasterFilters>): Promise<ApiResponse<WardRoomBedMasterAttributes[]>> {
        return await this.WardRoomBedMasterBo.GetWardRoomBedMasters(apiReq);
    }

    public async DeleteWardRoomBedMaster(req: BaseRequest): Promise<Boolean> {
        return await this.WardRoomBedMasterBo.DeleteWardRoomBedMaster(req);
    }

    public async GetBedStatusList(apiReq: ApiRequest<BedStatusFilters>): Promise<any> {
        return await this.WardRoomBedMasterBo.GetBedStatusList(apiReq);
    }
    public async PrintWardRoomBedMasters(apiReq?: ApiRequest<WardRoomBedMasterFilters>): Promise<any> {
        return await this.WardRoomBedMasterBo.PrintWardRoomBedMasters(apiReq);
    }
    public async PrintAvailableBedMasters(apiReq?: ApiRequest<WardRoomBedMasterFilters>): Promise<any> {
        return await this.WardRoomBedMasterBo.PrintAvailableBedMasters(apiReq);
    }
    public async PrintCovidStatisticsReport(apiReq?: ApiRequest<WardRoomBedMasterFilters>): Promise<any> {
        return await this.WardRoomBedMasterBo.PrintCovidStatisticsReport(apiReq);
    }
}
