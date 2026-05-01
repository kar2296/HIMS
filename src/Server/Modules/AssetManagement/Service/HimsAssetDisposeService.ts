import {BaseService, BoFactory } from '../../Base/Index';
import { AssetDisposeBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { AssetDisposeAttributes } from '../Model/Interface/Index';
import { AssetDisposeFilters } from '../Common/Filters.e';

export class AssetDisposeService extends BaseService {
    private AssetDisposeBo: AssetDisposeBo;
    constructor(req?: Request) {
        super(req);
        this.AssetDisposeBo = BoFactory.GetBo(AssetDisposeBo, this.Request);
    }

    public async AddAssetDispose(req: BaseRequest): Promise<number> {
        return await this.AssetDisposeBo.AddAssetDispose(req);
    }

    public async UpdateAssetDispose(req: BaseRequest): Promise<boolean> {
        return await this.AssetDisposeBo.UpdateAssetDispose(req);
    }

    public async GetAssetDisposeById(req: BaseRequest): Promise<AssetDisposeAttributes> {
        return await this.AssetDisposeBo.GetAssetDisposeById(req);
    }

    public async GetAssetDisposes(apiReq?: ApiRequest<AssetDisposeFilters>): Promise<ApiResponse<AssetDisposeAttributes[]>> {
        return await this.AssetDisposeBo.GetAssetDisposes(apiReq);
    }

    public async ManageAssetDispose(req: BaseRequest): Promise<boolean> {
        return await this.AssetDisposeBo.ManageAssetDispose(req);
    }

    public async DeleteAssetDispose(req: BaseRequest): Promise<Boolean> {
        return await this.AssetDisposeBo.DeleteAssetDispose(req);
    }
}

