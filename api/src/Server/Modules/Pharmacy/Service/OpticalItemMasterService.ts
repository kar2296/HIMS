import { BaseService, BoFactory } from '../../Base/Index';
import { OpticalItemMasterBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { OpticalItemMasterAttributes } from '../Model/Interface/Index';
import { OpticalItemMasterFilters } from '../Common/Filters.e';

export class OpticalItemMasterService extends BaseService {
    private OpticalItemMasterBo: OpticalItemMasterBo;
    constructor(req?: Request) {
        super(req);
        this.OpticalItemMasterBo = BoFactory.GetBo(OpticalItemMasterBo, this.Request);
    }

    public async AddOpticalItemMaster(req: BaseRequest): Promise<number> {
        return await this.OpticalItemMasterBo.AddOpticalItemMaster(req);
    }

    public async UpdateOpticalItemMaster(req: BaseRequest): Promise<boolean> {
        return await this.OpticalItemMasterBo.UpdateOpticalItemMaster(req);
    }

    public async GetOpticalItemMasterById(req: BaseRequest): Promise<OpticalItemMasterAttributes> {
        return await this.OpticalItemMasterBo.GetOpticalItemMasterById(req);
    }

    public async GetOpticalItemMasters(apiReq?: ApiRequest<OpticalItemMasterFilters>): Promise<ApiResponse<OpticalItemMasterAttributes[]>> {
        return await this.OpticalItemMasterBo.GetOpticalItemMasters(apiReq);
    }

    public async DeleteOpticalItemMaster(req: BaseRequest): Promise<Boolean> {
        return await this.OpticalItemMasterBo.DeleteOpticalItemMaster(req);
    }
}
