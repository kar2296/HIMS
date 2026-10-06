import { BaseService, BoFactory } from '../../Base/Index';
import { StockRequestDetailBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { StockRequestDetailAttributes } from '../Model/Interface/Index';
import { StockRequestDetailFilters } from '../Common/Filters.e';

export class StockRequestDetailService extends BaseService {
    private StockRequestDetailBo: StockRequestDetailBo;
    constructor(req?: Request) {
        super(req);
        this.StockRequestDetailBo = BoFactory.GetBo(StockRequestDetailBo, this.Request);
    }

    public async AddStockRequestDetail(req: BaseRequest): Promise<number> {
        return await this.StockRequestDetailBo.AddStockRequestDetail(req);
    }

    public async UpdateStockRequestDetail(req: BaseRequest): Promise<boolean> {
        return await this.StockRequestDetailBo.UpdateStockRequestDetail(req);
    }

    public async GetStockRequestDetailById(req: BaseRequest): Promise<StockRequestDetailAttributes> {
        return await this.StockRequestDetailBo.GetStockRequestDetailById(req);
    }

    public async GetStockRequestDetails(apiReq?: ApiRequest<StockRequestDetailFilters>):
        Promise<ApiResponse<StockRequestDetailAttributes[]>> {
        return await this.StockRequestDetailBo.GetStockRequestDetails(apiReq);
    }

    public async DeleteStockRequestDetail(req: BaseRequest): Promise<Boolean> {
        return await this.StockRequestDetailBo.DeleteStockRequestDetail(req);
    }
}
