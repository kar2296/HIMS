import { BaseService, BoFactory } from '../../Base/Index';
import { ItemWantedListBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { ItemWantedListAttributes } from '../Model/Interface/Index';
import { ItemWantedListFilters } from '../Common/Filters.e';

export class ItemWantedListService extends BaseService {
    private ItemWantedListBo: ItemWantedListBo;
    constructor(req?: Request) {
        super(req);
        this.ItemWantedListBo = BoFactory.GetBo(ItemWantedListBo, this.Request);
    }

    public async AddItemWantedList(req: BaseRequest): Promise<number> {
        return await this.ItemWantedListBo.AddItemWantedList(req);
    }

    public async UpdateItemWantedList(req: BaseRequest): Promise<boolean> {
        return await this.ItemWantedListBo.UpdateItemWantedList(req);
    }

    public async GetItemWantedListById(req: BaseRequest): Promise<ItemWantedListAttributes> {
        return await this.ItemWantedListBo.GetItemWantedListById(req);
    }

    public async GetItemWantedLists(apiReq?: ApiRequest<ItemWantedListFilters>): Promise<ApiResponse<ItemWantedListAttributes[]>> {
        return await this.ItemWantedListBo.GetItemWantedLists(apiReq);
    }

    public async DeleteItemWantedList(req: BaseRequest): Promise<Boolean> {
        return await this.ItemWantedListBo.DeleteItemWantedList(req);
    }
    public async PrintItemWantedReport(apiReq?: ApiRequest<ItemWantedListFilters>): Promise<any> {
        return await this.ItemWantedListBo.PrintItemWantedReport(apiReq);
    }
}
