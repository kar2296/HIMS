import { BaseService, BoFactory } from '../../Base/Index';
import { ItemSubCategoryBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { ItemSubCategoryAttributes } from '../Model/Interface/Index';
import { ItemSubCategoryFilters } from '../Common/Filters.e';

export class ItemSubCategoryService extends BaseService {
    private ItemSubCategoryBo: ItemSubCategoryBo;
    constructor(req?: Request) {
        super(req);
        this.ItemSubCategoryBo = BoFactory.GetBo(ItemSubCategoryBo, this.Request);
    }

    public async AddItemSubCategory(req: BaseRequest): Promise<number> {
        return await this.ItemSubCategoryBo.AddItemSubCategory(req);
    }

    public async UpdateItemSubCategory(req: BaseRequest): Promise<boolean> {
        return await this.ItemSubCategoryBo.UpdateItemSubCategory(req);
    }

    public async GetItemSubCategoryById(req: BaseRequest): Promise<ItemSubCategoryAttributes> {
        return await this.ItemSubCategoryBo.GetItemSubCategoryById(req);
    }

    public async GetItemSubCategorys(apiReq?: ApiRequest<ItemSubCategoryFilters>): Promise<ApiResponse<ItemSubCategoryAttributes[]>> {
        return await this.ItemSubCategoryBo.GetItemSubCategorys(apiReq);
    }

    public async DeleteItemSubCategory(req: BaseRequest): Promise<Boolean> {
        return await this.ItemSubCategoryBo.DeleteItemSubCategory(req);
    }
}
