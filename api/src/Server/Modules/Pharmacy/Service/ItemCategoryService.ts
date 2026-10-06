import { BaseService, BoFactory } from '../../Base/Index';
import { ItemCategoryBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { ItemCategoryAttributes } from '../Model/Interface/Index';
import { ItemCategoryFilters } from '../Common/Filters.e';

export class ItemCategoryService extends BaseService {
    private ItemCategoryBo: ItemCategoryBo;
    constructor(req?: Request) {
        super(req);
        this.ItemCategoryBo = BoFactory.GetBo(ItemCategoryBo, this.Request);
    }

    public async AddItemCategory(req: BaseRequest): Promise<number> {
        return await this.ItemCategoryBo.AddItemCategory(req);
    }

    public async UpdateItemCategory(req: BaseRequest): Promise<boolean> {
        return await this.ItemCategoryBo.UpdateItemCategory(req);
    }

    public async GetItemCategoryById(req: BaseRequest): Promise<ItemCategoryAttributes> {
        return await this.ItemCategoryBo.GetItemCategoryById(req);
    }

    public async GetItemCategorys(apiReq?: ApiRequest<ItemCategoryFilters>): Promise<ApiResponse<ItemCategoryAttributes[]>> {
        return await this.ItemCategoryBo.GetItemCategorys(apiReq);
    }

    public async DeleteItemCategory(req: BaseRequest): Promise<Boolean> {
        return await this.ItemCategoryBo.DeleteItemCategory(req);
    }
}
