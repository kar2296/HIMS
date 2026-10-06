import { BaseService, BoFactory } from '../../Base/Index';
import { AssetMaintananceBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { AssetMaintananceAttributes } from '../Model/Interface/Index';
import { AssetMaintananceFilters } from '../Common/Filters.e';

export class AssetMaintananceService extends BaseService {
    private AssetMaintananceBo: AssetMaintananceBo;
    constructor(req?: Request) {
        super(req);
        this.AssetMaintananceBo = BoFactory.GetBo(AssetMaintananceBo, this.Request);
    }

    public async AddAssetMaintanance(req: BaseRequest): Promise<number> {
        return await this.AssetMaintananceBo.AddAssetMaintanance(req);
    }

    public async UpdateAssetMaintanance(req: BaseRequest): Promise<boolean> {
        return await this.AssetMaintananceBo.UpdateAssetMaintanance(req);
    }
    public async ManageAssetMaintanances(req: BaseRequest): Promise<boolean> {
        return await this.AssetMaintananceBo.ManageAssetMaintanances(req);
    }

    public async GetAssetMaintananceById(req: BaseRequest): Promise<AssetMaintananceAttributes> {
        return await this.AssetMaintananceBo.GetAssetMaintananceById(req);
    }

    public async GetAssetMaintanances(apiReq?: ApiRequest<AssetMaintananceFilters>): Promise<ApiResponse<AssetMaintananceAttributes[]>> {
        return await this.AssetMaintananceBo.GetAssetMaintanances(apiReq);
    }

    public async DeleteAssetMaintanance(req: BaseRequest): Promise<Boolean> {
        return await this.AssetMaintananceBo.DeleteAssetMaintanance(req);
    }
    public async PrintAssetmaintenanceReport(apiReq?: ApiRequest<AssetMaintananceFilters>): Promise<any> {
        return await this.AssetMaintananceBo.PrintAssetmaintenanceReport(apiReq);
    }
}
