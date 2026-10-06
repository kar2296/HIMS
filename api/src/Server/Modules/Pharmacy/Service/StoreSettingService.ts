import { BaseService, BoFactory } from '../../Base/Index';
import { StoreSettingBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { StoreSettingAttributes } from '../Model/Interface/Index';
import { StoreSettingFilters } from '../Common/Filters.e';

export class StoreSettingService extends BaseService {
    private StoreSettingBo: StoreSettingBo;
    constructor(req?: Request) {
        super(req);
        this.StoreSettingBo = BoFactory.GetBo(StoreSettingBo, this.Request);
    }

    public async AddStoreSetting(req: BaseRequest): Promise<number> {
        return await this.StoreSettingBo.AddStoreSetting(req);
    }

    public async UpdateStoreSetting(req: BaseRequest): Promise<boolean> {
        return await this.StoreSettingBo.UpdateStoreSetting(req);
    }

    public async GetStoreSettingById(req: BaseRequest): Promise<StoreSettingAttributes> {
        return await this.StoreSettingBo.GetStoreSettingById(req);
    }

    public async GetStoreSettings(apiReq?: ApiRequest<StoreSettingFilters>): Promise<ApiResponse<StoreSettingAttributes[]>> {
        return await this.StoreSettingBo.GetStoreSettings(apiReq);
    }

    public async DeleteStoreSetting(req: BaseRequest): Promise<Boolean> {
        return await this.StoreSettingBo.DeleteStoreSetting(req);
    }
}
