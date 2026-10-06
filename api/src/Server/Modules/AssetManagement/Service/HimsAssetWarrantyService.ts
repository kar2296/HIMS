import { BaseService, BoFactory } from '../../Base/Index';
import { AssetWarrantyBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { AssetWarrantyAttributes } from '../Model/Interface/Index';
import { AssetWarrantyFilters } from '../Common/Filters.e';

export class AssetWarrantyService extends BaseService {
    private AssetWarrantyBo: AssetWarrantyBo;
    constructor(req?: Request) {
        super(req);
        this.AssetWarrantyBo = BoFactory.GetBo(AssetWarrantyBo, this.Request);
    }

    public async AddAssetWarranty(req: BaseRequest): Promise<number> {
        return await this.AssetWarrantyBo.AddAssetWarranty(req);
    }

    public async UpdateAssetWarranty(req: BaseRequest): Promise<boolean> {
        return await this.AssetWarrantyBo.UpdateAssetWarranty(req);
    }

    public async GetAssetWarrantyById(req: BaseRequest): Promise<AssetWarrantyAttributes> {
        return await this.AssetWarrantyBo.GetAssetWarrantyById(req);
    }

    public async GetAssetWarranties(apiReq?: ApiRequest<AssetWarrantyFilters>): Promise<ApiResponse<AssetWarrantyAttributes[]>> {
        return await this.AssetWarrantyBo.GetAssetWarranties(apiReq);
    }

    public async DeleteAssetWarranty(req: BaseRequest): Promise<Boolean> {
        return await this.AssetWarrantyBo.DeleteAssetWarranty(req);
    }
    public async PrintAssetWarranty(apiReq?: ApiRequest<AssetWarrantyFilters>): Promise<any> {
        return await this.AssetWarrantyBo.PrintAssetWarranty(apiReq);
    }
    public async PrintAssetwarrantyexpiredReport(apiReq?: ApiRequest<AssetWarrantyFilters>): Promise<any> {
        return await this.AssetWarrantyBo.PrintAssetwarrantyexpiredReport(apiReq);
    }
    public async PrintAssetwarrantyexpiryReport(apiReq?: ApiRequest<AssetWarrantyFilters>): Promise<any> {
        return await this.AssetWarrantyBo.PrintAssetwarrantyexpiryReport(apiReq);
    }
}
