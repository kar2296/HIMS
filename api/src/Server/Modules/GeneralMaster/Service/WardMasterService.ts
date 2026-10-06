import { BaseService, BoFactory } from '../../Base/Index';
import { WardMasterBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { WardMasterAttributes } from '../Model/Interface/Index';
import { WardMasterFilters, WardUserMapFilters } from '../Common/Filters.e';

export class WardMasterService extends BaseService {
    private WardMasterBo: WardMasterBo;
    constructor(req?: Request) {
        super(req);
        this.WardMasterBo = BoFactory.GetBo(WardMasterBo, this.Request);
    }

    public async AddWardMaster(req: BaseRequest): Promise<number> {
        return await this.WardMasterBo.AddWardMaster(req);
    }

    public async UpdateWardMaster(req: BaseRequest): Promise<boolean> {
        return await this.WardMasterBo.UpdateWardMaster(req);
    }

    public async GetWardMasterById(req: BaseRequest): Promise<WardMasterAttributes> {
        return await this.WardMasterBo.GetWardMasterById(req);
    }

    public async GetWardMasters(apiReq?: ApiRequest<WardMasterFilters>): Promise<ApiResponse<WardMasterAttributes[]>> {
        return await this.WardMasterBo.GetWardMasters(apiReq);
    }

    public async GetWardBeds(apiReq?: ApiRequest<WardUserMapFilters>): Promise<ApiResponse<any>> {
        return await this.WardMasterBo.GetWardBeds(apiReq);
    }

    public async DeleteWardMaster(req: BaseRequest): Promise<Boolean> {
        return await this.WardMasterBo.DeleteWardMaster(req);
    }

    public async GetWardInfoDashBoard(req: BaseRequest): Promise<any> {
        return await this.WardMasterBo.GetWardInfoDashBoard(req);
    }
    public async PrintIPOccupanyWardReport(apiReq?: ApiRequest<WardMasterFilters>): Promise<any> {
        return await this.WardMasterBo.PrintIPOccupanyWardReport(apiReq);
    }
}
