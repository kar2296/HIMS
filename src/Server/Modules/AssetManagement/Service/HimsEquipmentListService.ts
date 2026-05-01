import { BaseService, BoFactory } from '../../Base/Index';
import { EquipmentListBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { EquipmentListAttributes } from '../Model/Interface/Index';
import { EquipmentListFilters } from '../Common/Filters.e';

export class EquipmentListService extends BaseService {
    private EquipmentListBo: EquipmentListBo;
    constructor(req?: Request) {
        super(req);
        this.EquipmentListBo = BoFactory.GetBo(EquipmentListBo, this.Request);
    }
    public async AddAsset(req: BaseRequest): Promise<number> {
        return await this.EquipmentListBo.AddAsset(req);
    }
    public async UpdateAsset(req: BaseRequest): Promise<boolean> {
        return await this.EquipmentListBo.UpdateAsset(req);
    }
    public async GetAssetProfilePic(req: BaseRequest): Promise<EquipmentListAttributes> {
        return await this.EquipmentListBo.GetAssetProfilePic(req);
    }
    public async GetAssetById(req: BaseRequest): Promise<EquipmentListAttributes> {
        return await this.EquipmentListBo.GetAssetById(req);
    }
    public async GetAssets(apiReq?: ApiRequest<EquipmentListFilters>): Promise<ApiResponse<EquipmentListAttributes[]>> {
        return await this.EquipmentListBo.GetAssets(apiReq);
    }
    public async DeleteAsset(req: BaseRequest): Promise<Boolean> {
        return await this.EquipmentListBo.DeleteAsset(req);
    }
}
