import { BaseService, BoFactory } from '../../Base/Index';
import { StoreUserMapBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { StoreUserMapAttributes } from '../Model/Interface/Index';
import { StoreUserMapFilters } from '../Common/Filters.e';

export class StoreUserMapService extends BaseService {
    private StoreUserMapBo: StoreUserMapBo;
    constructor(req?: Request) {
        super(req);
        this.StoreUserMapBo = BoFactory.GetBo(StoreUserMapBo, this.Request);
    }

    public async AddStoreUserMap(req: BaseRequest): Promise<number> {
        return await this.StoreUserMapBo.AddStoreUserMap(req);
    }

    public async UpdateStoreUserMap(req: BaseRequest): Promise<boolean> {
        return await this.StoreUserMapBo.UpdateStoreUserMap(req);
    }

    public async GetStoreUserMapById(req: BaseRequest): Promise<StoreUserMapAttributes> {
        return await this.StoreUserMapBo.GetStoreUserMapById(req);
    }

    public async GetStoreUserMaps(apiReq?: ApiRequest<StoreUserMapFilters>): Promise<ApiResponse<StoreUserMapAttributes[]>> {
        return await this.StoreUserMapBo.GetStoreUserMaps(apiReq);
    }

    public async DeleteStoreUserMap(req: BaseRequest): Promise<Boolean> {
        return await this.StoreUserMapBo.DeleteStoreUserMap(req);
    }
}
