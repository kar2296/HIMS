import { BaseService, BoFactory } from '../../Base/Index';
import { StockAdjustmentBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request, FileInfo } from '../../../Core/Index';
import { StockAdjustmentAttributes } from '../Model/Interface/Index';
import { StockAdjustmentFilters } from '../Common/Filters.e';

export class StockAdjustmentService extends BaseService {
    private StockAdjustmentBo: StockAdjustmentBo;
    constructor(req?: Request) {
        super(req);
        this.StockAdjustmentBo = BoFactory.GetBo(StockAdjustmentBo, this.Request);
    }

    public async AddStockAdjustment(req: BaseRequest): Promise<number> {
        return await this.StockAdjustmentBo.AddStockAdjustment(req);
    }

    public async UpdateStockAdjustment(req: BaseRequest): Promise<boolean> {
        return await this.StockAdjustmentBo.UpdateStockAdjustment(req);
    }

    public async GetStockAdjustmentById(req: BaseRequest): Promise<StockAdjustmentAttributes> {
        return await this.StockAdjustmentBo.GetStockAdjustmentById(req);
    }

    public async GetStockAdjustments(apiReq?: ApiRequest<StockAdjustmentFilters>): Promise<ApiResponse<StockAdjustmentAttributes[]>> {
        return await this.StockAdjustmentBo.GetStockAdjustments(apiReq);
    }

    public async DeleteStockAdjustment(req: BaseRequest): Promise<Boolean> {
        return await this.StockAdjustmentBo.DeleteStockAdjustment(req);
    }
    public async PrintStockAdjustment(req: BaseRequest): Promise<FileInfo> {
        return await this.StockAdjustmentBo.PrintStockAdjustment(req);
    }

}
