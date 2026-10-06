import { BaseService, BoFactory } from '../../Base/Index';
import { OpticalStockItemBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { OpticalStockItemAttributes } from '../Model/Interface/Index';
import { OpticalStockItemFilters } from '../Common/Filters.e';

export class OpticalStockItemService extends BaseService {
    private OpticalStockItemBo: OpticalStockItemBo;
    constructor(req?: Request) {
        super(req);
        this.OpticalStockItemBo = BoFactory.GetBo(OpticalStockItemBo, this.Request);
    }

    public async AddOpticalStockItem(req: BaseRequest): Promise<number> {
        return await this.OpticalStockItemBo.AddOpticalStockItem(req);
    }

    public async UpdateOpticalStockItem(req: BaseRequest): Promise<boolean> {
        return await this.OpticalStockItemBo.UpdateOpticalStockItem(req);
    }

    public async GetOpticalStockItemById(req: BaseRequest): Promise<OpticalStockItemAttributes> {
        return await this.OpticalStockItemBo.GetOpticalStockItemById(req);
    }

    public async GetOpticalStockItems(apiReq?: ApiRequest<OpticalStockItemFilters>): Promise<ApiResponse<OpticalStockItemAttributes[]>> {
        return await this.OpticalStockItemBo.GetOpticalStockItems(apiReq);
    }

    public async GetOpticalStoreItems(apiReq?: ApiRequest<OpticalStockItemFilters>): Promise<ApiResponse<OpticalStockItemAttributes[]>> {
        return await this.OpticalStockItemBo.GetOpticalStoreItems(apiReq);
    }

    public async DeleteOpticalStockItem(req: BaseRequest): Promise<Boolean> {
        return await this.OpticalStockItemBo.DeleteOpticalStockItem(req);
    }
}
