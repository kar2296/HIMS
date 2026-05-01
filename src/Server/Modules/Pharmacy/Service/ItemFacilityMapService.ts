import { BaseService, BoFactory } from '../../Base/Index';
import { ItemFacilityMapBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { ItemFacilityMapAttributes } from '../Model/Interface/Index';
import { ItemFacilityFilters } from '../Common/Filters.e';

export class ItemFacilityMapService extends BaseService {
    private ItemFacilityMapBo: ItemFacilityMapBo;
    constructor(req?: Request) {
        super(req);
        this.ItemFacilityMapBo = BoFactory.GetBo(ItemFacilityMapBo, this.Request);
    }

    public async AddItemFacilityMap(req: BaseRequest): Promise<number> {
        return await this.ItemFacilityMapBo.AddItemFacilityMap(req);
    }

    public async UpdateItemFacilityMap(req: BaseRequest): Promise<boolean> {
        return await this.ItemFacilityMapBo.UpdateItemFacilityMap(req);
    }

    public async GetItemFacilityMapById(req: BaseRequest): Promise<ItemFacilityMapAttributes> {
        return await this.ItemFacilityMapBo.GetItemFacilityMapById(req);
    }

    public async GetItemFacilityMaps(apiReq?: ApiRequest<ItemFacilityFilters>): Promise<ApiResponse<ItemFacilityMapAttributes[]>> {
        return await this.ItemFacilityMapBo.GetItemFacilityMaps(apiReq);
    }

    public async GetFacilityMasterItem(apiReq?: ApiRequest<ItemFacilityFilters>): Promise<ApiResponse<ItemFacilityMapAttributes[]>> {
        return await this.ItemFacilityMapBo.GetFacilityMasterItem(apiReq);
    }

    public async DeleteItemFacilityMap(req: BaseRequest): Promise<Boolean> {
        return await this.ItemFacilityMapBo.DeleteItemFacilityMap(req);
    }
}
