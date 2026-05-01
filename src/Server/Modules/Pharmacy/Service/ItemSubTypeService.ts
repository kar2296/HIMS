import { BaseService, BoFactory } from '../../Base/Index';
import { ItemSubTypeBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { ItemSubTypeAttributes } from '../Model/Interface/Index';
import { ItemSubTypeFilters } from '../Common/Filters.e';

export class ItemSubTypeService extends BaseService {
    private ItemSubTypeBo: ItemSubTypeBo;
    constructor(req?: Request) {
        super(req);
        this.ItemSubTypeBo = BoFactory.GetBo(ItemSubTypeBo, this.Request);
    }

    public async AddItemSubType(req: BaseRequest): Promise<number> {
        return await this.ItemSubTypeBo.AddItemSubType(req);
    }

    public async UpdateItemSubType(req: BaseRequest): Promise<boolean> {
        return await this.ItemSubTypeBo.UpdateItemSubType(req);
    }

    public async GetItemSubTypeById(req: BaseRequest): Promise<ItemSubTypeAttributes> {
        return await this.ItemSubTypeBo.GetItemSubTypeById(req);
    }

    public async GetItemSubTypes(apiReq?: ApiRequest<ItemSubTypeFilters>): Promise<ApiResponse<ItemSubTypeAttributes[]>> {
        return await this.ItemSubTypeBo.GetItemSubTypes(apiReq);
    }

    public async DeleteItemSubType(req: BaseRequest): Promise<Boolean> {
        return await this.ItemSubTypeBo.DeleteItemSubType(req);
    }
}
