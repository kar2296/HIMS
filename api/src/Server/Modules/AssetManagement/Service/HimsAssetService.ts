import { BaseService, BoFactory } from '../../Base/Index';
import { AssetBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { AssetAttributes } from '../Model/Interface/Index';
import { AssetFilters } from '../Common/Filters.e';

export class AssetService extends BaseService {
    private AssetBo: AssetBo;
    constructor(req?: Request) {
        super(req);
        this.AssetBo = BoFactory.GetBo(AssetBo, this.Request);
    }
    public async AddAsset(req: BaseRequest): Promise<number> {
        return await this.AssetBo.AddAsset(req);
    }
    public async UpdateAsset(req: BaseRequest): Promise<boolean> {
        return await this.AssetBo.UpdateAsset(req);
    }
    public async GetAssetProfilePic(req: BaseRequest): Promise<AssetAttributes> {
        return await this.AssetBo.GetAssetProfilePic(req);
    }
    public async GetAssetById(req: BaseRequest): Promise<AssetAttributes> {
        return await this.AssetBo.GetAssetById(req);
    }
    public async GetAssets(apiReq?: ApiRequest<AssetFilters>): Promise<ApiResponse<AssetAttributes[]>> {
        return await this.AssetBo.GetAssets(apiReq);
    }
    public async DeleteAsset(req: BaseRequest): Promise<Boolean> {
        return await this.AssetBo.DeleteAsset(req);
    }
    public async PrintAssetDetailReport(apiReq?: ApiRequest<AssetFilters>): Promise<any> {
        return await this.AssetBo.PrintAssetDetailReport(apiReq);
    }
    public async PrintAssetsummarybyDepartmentReport(apiReq?: ApiRequest<AssetFilters>): Promise<any> {
        return await this.AssetBo.PrintAssetsummarybyDepartmentReport(apiReq);
    }
}
