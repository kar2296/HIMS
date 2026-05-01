import { BaseService, BoFactory } from '../../Base/Index';
import { StockAdjustmentDetailBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { StockAdjustmentDetailAttributes } from '../Model/Interface/Index';
import { StockAdjustmentDetailFilters } from '../Common/Filters.e';

export class StockAdjustmentDetailService extends BaseService {
    private StockAdjustmentDetailBo: StockAdjustmentDetailBo;
    constructor(req?: Request) {
        super(req);
        this.StockAdjustmentDetailBo = BoFactory.GetBo(StockAdjustmentDetailBo, this.Request);
    }

    public async AddStockAdjustmentDetail(req: BaseRequest): Promise<number> {
        return await this.StockAdjustmentDetailBo.AddStockAdjustmentDetail(req);
    }

    public async UpdateStockAdjustmentDetail(req: BaseRequest): Promise<boolean> {
        return await this.StockAdjustmentDetailBo.UpdateStockAdjustmentDetail(req);
    }

    public async GetStockAdjustmentDetailById(req: BaseRequest): Promise<StockAdjustmentDetailAttributes> {
        return await this.StockAdjustmentDetailBo.GetStockAdjustmentDetailById(req);
    }

    public async GetStockAdjustmentDetails(apiReq?: ApiRequest<StockAdjustmentDetailFilters>):
        Promise<ApiResponse<StockAdjustmentDetailAttributes[]>> {
        return await this.StockAdjustmentDetailBo.GetStockAdjustmentDetails(apiReq);
    }

    public async DeleteStockAdjustmentDetail(req: BaseRequest): Promise<Boolean> {
        return await this.StockAdjustmentDetailBo.DeleteStockAdjustmentDetail(req);
    }
    public async PrintStockAdjustmentReport(apiReq?: ApiRequest<StockAdjustmentDetailFilters>): Promise<any> {
        return await this.StockAdjustmentDetailBo.PrintStockAdjustmentReport(apiReq);
    }
}
