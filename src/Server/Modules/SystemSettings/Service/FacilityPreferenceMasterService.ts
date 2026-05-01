import { BaseService, BoFactory } from '../../Base/Index';
import { FacilityPreferenceMasterBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { FacilityPreferenceMasterAttributes } from '../Model/Interface/Index';
import { FacilityPreferenceMasterFilters } from '../Common/Filters.e';

export class FacilityPreferenceMasterService extends BaseService {
    private FacilityPreferenceMasterBo: FacilityPreferenceMasterBo;
    constructor(req?: Request) {
        super(req);
        this.FacilityPreferenceMasterBo = BoFactory.GetBo(FacilityPreferenceMasterBo, this.Request);
    }

    public async AddFacilityPreferenceMaster(req: BaseRequest): Promise<number> {
        return await this.FacilityPreferenceMasterBo.AddFacilityPreferenceMaster(req);
    }

    public async UpdateFacilityPreferenceMaster(req: BaseRequest): Promise<boolean> {
        return await this.FacilityPreferenceMasterBo.UpdateFacilityPreferenceMaster(req);
    }

    public async GetFacilityPreferenceMasterById(req: BaseRequest): Promise<FacilityPreferenceMasterAttributes> {
        return await this.FacilityPreferenceMasterBo.GetFacilityPreferenceMasterById(req);
    }

    public async GetFacilityPreferenceMasters(apiReq?: ApiRequest<FacilityPreferenceMasterFilters>):
        Promise<ApiResponse<FacilityPreferenceMasterAttributes[]>> {
        return await this.FacilityPreferenceMasterBo.GetFacilityPreferenceMasters(apiReq);
    }

    public async DeleteFacilityPreferenceMaster(req: BaseRequest): Promise<Boolean> {
        return await this.FacilityPreferenceMasterBo.DeleteFacilityPreferenceMaster(req);
    }
}
