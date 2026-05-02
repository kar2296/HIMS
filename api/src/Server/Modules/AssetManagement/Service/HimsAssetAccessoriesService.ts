import { BaseService, BoFactory } from '../../Base/Index';
import { AssetAccessoriesBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { AssetAccessoriesAttributes } from '../Model/Interface/Index';
import { AssetAccessoriesFilters } from '../Common/Filters.e';

export class AssetAccessoriesService extends BaseService {
    private AssetAccessoriesBo: AssetAccessoriesBo;
    constructor(req?: Request) {
        super(req);
        this.AssetAccessoriesBo = BoFactory.GetBo(AssetAccessoriesBo, this.Request);
    }

    public async AddAssetAccessories(req: BaseRequest): Promise<number> {
        return await this.AssetAccessoriesBo.AddAssetAccessories(req);
    }

    public async UpdateAssetAccessories(req: BaseRequest): Promise<boolean> {
        return await this.AssetAccessoriesBo.UpdateAssetAccessories(req);
    }
    public async ManageAssetAccessoriess(req: BaseRequest): Promise<boolean> {
        return await this.AssetAccessoriesBo.ManageAssetAccessoriess(req);
    }

    public async GetAssetAccessoriesById(req: BaseRequest): Promise<AssetAccessoriesAttributes> {
        return await this.AssetAccessoriesBo.GetAssetAccessoriesById(req);
    }

    public async GetAssetAccessoriess(apiReq?: ApiRequest<AssetAccessoriesFilters>): Promise<ApiResponse<AssetAccessoriesAttributes[]>> {
        return await this.AssetAccessoriesBo.GetAssetAccessoriess(apiReq);
    }

    public async DeleteAssetAccessories(req: BaseRequest): Promise<Boolean> {
        return await this.AssetAccessoriesBo.DeleteAssetAccessories(req);
    }
    public async PrintAssetAccessoriesReport(apiReq?: ApiRequest<AssetAccessoriesFilters>): Promise<any> {
        return await this.AssetAccessoriesBo.PrintAssetAccessoriesReport(apiReq);
    }
}
