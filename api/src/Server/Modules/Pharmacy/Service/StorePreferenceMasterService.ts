import { BaseService, BoFactory } from '../../Base/Index';
import { StorePreferenceMasterBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { StorePreferenceMasterAttributes } from '../Model/Interface/Index';
import { StorePreferenceMasterFilters } from '../Common/Filters.e';

export class StorePreferenceMasterService extends BaseService {
    private StorePreferenceMasterBo: StorePreferenceMasterBo;
    constructor(req?: Request) {
        super(req);
        this.StorePreferenceMasterBo = BoFactory.GetBo(StorePreferenceMasterBo, this.Request);
    }

    public async AddStorePreferenceMaster(req: BaseRequest): Promise<number> {
        return await this.StorePreferenceMasterBo.AddStorePreferenceMaster(req);
    }

    public async UpdateStorePreferenceMaster(req: BaseRequest): Promise<boolean> {
        return await this.StorePreferenceMasterBo.UpdateStorePreferenceMaster(req);
    }

    public async GetStorePreferenceMasterById(req: BaseRequest): Promise<StorePreferenceMasterAttributes> {
        return await this.StorePreferenceMasterBo.GetStorePreferenceMasterById(req);
    }

    public async GetStorePreferenceMasters(apiReq?: ApiRequest<StorePreferenceMasterFilters>):
        Promise<ApiResponse<StorePreferenceMasterAttributes[]>> {
        return await this.StorePreferenceMasterBo.GetStorePreferenceMasters(apiReq);
    }

    public async DeleteStorePreferenceMaster(req: BaseRequest): Promise<Boolean> {
        return await this.StorePreferenceMasterBo.DeleteStorePreferenceMaster(req);
    }
}
