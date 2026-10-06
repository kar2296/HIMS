import { BaseService, BoFactory } from '../../Base/Index';
import { AssetTransferBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { AssetTransferAttributes } from '../Model/Interface/Index';
import { AssetTransferFilters } from '../Common/Filters.e';

export class AssetTransferService extends BaseService {
    private AssetTransferBo: AssetTransferBo;
    constructor(req?: Request) {
        super(req);
        this.AssetTransferBo = BoFactory.GetBo(AssetTransferBo, this.Request);
    }

    public async AddAssetTransfer(req: BaseRequest): Promise<number> {
        return await this.AssetTransferBo.AddAssetTransfer(req);
    }

    public async UpdateAssetTransfer(req: BaseRequest): Promise<boolean> {
        return await this.AssetTransferBo.UpdateAssetTransfer(req);
    }

    public async GetAssetTransferById(req: BaseRequest): Promise<AssetTransferAttributes> {
        return await this.AssetTransferBo.GetAssetTransferById(req);
    }

    public async GetAssetTransfers(apiReq?: ApiRequest<AssetTransferFilters>): Promise<ApiResponse<AssetTransferAttributes[]>> {
        return await this.AssetTransferBo.GetAssetTransfers(apiReq);
    }

    public async DeleteAssetTransfer(req: BaseRequest): Promise<Boolean> {
        return await this.AssetTransferBo.DeleteAssetTransfer(req);
    }
    public async PrintAssetTransferReport(apiReq?: ApiRequest<AssetTransferFilters>): Promise<any> {
        return await this.AssetTransferBo.PrintAssetTransferReport(apiReq);
    }
    public async PrintAssetMovementReport(apiReq?: ApiRequest<AssetTransferFilters>): Promise<any> {
        return await this.AssetTransferBo.PrintAssetMovementReport(apiReq);
    }
}
