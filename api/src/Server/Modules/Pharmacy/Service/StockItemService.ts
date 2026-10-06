import { BaseService, BoFactory } from '../../Base/Index';
import { StockItemBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { StockItemAttributes } from '../Model/Interface/Index';
import { StockItemFilters } from '../Common/Filters.e';

export class StockItemService extends BaseService {
    private StockItemBo: StockItemBo;
    constructor(req?: Request) {
        super(req);
        this.StockItemBo = BoFactory.GetBo(StockItemBo, this.Request);
    }

    public async AddStockItem(req: BaseRequest): Promise<number> {
        return await this.StockItemBo.AddStockItem(req);
    }

    public async UpdateStockItem(req: BaseRequest): Promise<boolean> {
        return await this.StockItemBo.UpdateStockItem(req);
    }

    public async GetStockItemById(req: BaseRequest): Promise<StockItemAttributes> {
        return await this.StockItemBo.GetStockItemById(req);
    }

    public async GetStockItems(apiReq?: ApiRequest<StockItemFilters>): Promise<ApiResponse<StockItemAttributes[]>> {
        return await this.StockItemBo.GetStockItems(apiReq);
    }

    public async GetStockItemsforPR(apiReq?: ApiRequest<StockItemFilters>): Promise<ApiResponse<StockItemAttributes[]>> {
        return await this.StockItemBo.GetStockItemsforPR(apiReq);
    }

    public async GetToDayStockItems(apiReq?: ApiRequest<StockItemFilters>): Promise<ApiResponse<StockItemAttributes[]>> {
        return await this.StockItemBo.GetToDayStockItems(apiReq);
    }

    public async GetStockItemsForSale(apiReq?: ApiRequest<StockItemFilters>): Promise<ApiResponse<StockItemAttributes[]>> {
        return await this.StockItemBo.GetStockItemsForSale(apiReq);
    }

    public async DeleteStockItem(req: BaseRequest): Promise<Boolean> {
        return await this.StockItemBo.DeleteStockItem(req);
    }
}
