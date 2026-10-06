import { BaseService, BoFactory } from '../../Base/Index';
import { HsnMasterBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { HsnMasterAttributes } from '../Model/Interface/Index';
import { HsnMasterFilters } from '../Common/Filters.e';

export class HsnMasterService extends BaseService {
    private HsnMasterBo: HsnMasterBo;
    constructor(req?: Request) {
        super(req);
        this.HsnMasterBo = BoFactory.GetBo(HsnMasterBo, this.Request);
    }

    public async AddHsnMaster(req: BaseRequest): Promise<number> {
        return await this.HsnMasterBo.AddHsnMaster(req);
    }

    public async UpdateHsnMaster(req: BaseRequest): Promise<boolean> {
        return await this.HsnMasterBo.UpdateHsnMaster(req);
    }

    public async GetHsnMasterById(req: BaseRequest): Promise<HsnMasterAttributes> {
        return await this.HsnMasterBo.GetHsnMasterById(req);
    }

    public async GetHsnMasters(apiReq?: ApiRequest<HsnMasterFilters>): Promise<ApiResponse<HsnMasterAttributes[]>> {
        return await this.HsnMasterBo.GetHsnMasters(apiReq);
    }

    public async DeleteHsnMaster(req: BaseRequest): Promise<Boolean> {
        return await this.HsnMasterBo.DeleteHsnMaster(req);
    }
}
