import { BaseService, BoFactory } from '../../Base/Index';
import { ItemStoreMapBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { ItemStoreMapAttributes } from '../Model/Interface/Index';
import { ItemStoreFilters } from '../Common/Filters.e';

export class ItemStoreMapService extends BaseService {
    private ItemStoreMapBo: ItemStoreMapBo;
    constructor(req?: Request) {
        super(req);
        this.ItemStoreMapBo = BoFactory.GetBo(ItemStoreMapBo, this.Request);
    }

    public async AddItemStoreMap(req: BaseRequest): Promise<number> {
        return await this.ItemStoreMapBo.AddItemStoreMap(req);
    }

    public async UpdateItemStoreMap(req: BaseRequest): Promise<boolean> {
        return await this.ItemStoreMapBo.UpdateItemStoreMap(req);
    }

    public async GetItemStoreMapById(req: BaseRequest): Promise<ItemStoreMapAttributes> {
        return await this.ItemStoreMapBo.GetItemStoreMapById(req);
    }

    public async GetItemStoreMaps(apiReq?: ApiRequest<ItemStoreFilters>): Promise<ApiResponse<ItemStoreMapAttributes[]>> {
        return await this.ItemStoreMapBo.GetItemStoreMaps(apiReq);
    }

    public async GetItemsForStockTransfer(apiReq?: ApiRequest<ItemStoreFilters>): Promise<ApiResponse<ItemStoreMapAttributes[]>> {
        return await this.ItemStoreMapBo.GetItemsForStockTransfer(apiReq);
    }

    public async DeleteItemStoreMap(req: BaseRequest): Promise<Boolean> {
        return await this.ItemStoreMapBo.DeleteItemStoreMap(req);
    }
    public async PrintRackDetailsbyStore(apiReq?: ApiRequest<ItemStoreFilters>): Promise<any> {
        return await this.ItemStoreMapBo.PrintRackDetailsbyStore(apiReq);
    }
    public async PrintItemReorderList(apiReq?: ApiRequest<ItemStoreFilters>): Promise<any> {
        return await this.ItemStoreMapBo.PrintItemReorderList(apiReq);
    }
    public async PrintItemROLSetupReport(apiReq?: ApiRequest<ItemStoreFilters>): Promise<any> {
        return await this.ItemStoreMapBo.PrintItemROLSetupReport(apiReq);
    }
}
