import {BaseService, BoFactory } from '../../Base/Index';
import { ItemContractMapBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { ItemContractMapAttributes } from '../Model/Interface/Index';
import { ItemContractMapFilters } from '../Common/Filters.e';

export class ItemContractMapService extends BaseService {
    private ItemContractMapBo: ItemContractMapBo;
    constructor(req?: Request) {
        super(req);
        this.ItemContractMapBo = BoFactory.GetBo(ItemContractMapBo, this.Request);
    }

    public async AddItemContractMap(req: BaseRequest): Promise<number> {
        return await this.ItemContractMapBo.AddItemContractMap(req);
    }

    public async UpdateItemContractMap(req: BaseRequest): Promise<boolean> {
        return await this.ItemContractMapBo.UpdateItemContractMap(req);
    }

    public async GetItemContractMapById(req: BaseRequest): Promise<ItemContractMapAttributes> {
        return await this.ItemContractMapBo.GetItemContractMapById(req);
    }

    public async GetItemContractMaps(apiReq?: ApiRequest<ItemContractMapFilters>): Promise<ApiResponse<ItemContractMapAttributes[]>> {
        return await this.ItemContractMapBo.GetItemContractMaps(apiReq);
    }

    public async DeleteItemContractMap(req: BaseRequest): Promise<Boolean> {
        return await this.ItemContractMapBo.DeleteItemContractMap(req);
    }
}

