import { BaseService, BoFactory } from '../../Base/Index';
import { StockMovementBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { StockMovementAttributes } from '../Model/Interface/Index';
import { StockMovementFilters } from '../Common/Filters.e';

export class StockMovementService extends BaseService {
    private StockMovementBo: StockMovementBo;
    constructor(req?: Request) {
        super(req);
        this.StockMovementBo = BoFactory.GetBo(StockMovementBo, this.Request);
    }

    public async AddStockMovement(req: BaseRequest): Promise<number> {
        return await this.StockMovementBo.AddStockMovement(req);
    }

    public async UpdateStockMovement(req: BaseRequest): Promise<boolean> {
        return await this.StockMovementBo.UpdateStockMovement(req);
    }

    public async GetStockMovementById(req: BaseRequest): Promise<StockMovementAttributes> {
        return await this.StockMovementBo.GetStockMovementById(req);
    }

    public async GetStockMovements(apiReq?: ApiRequest<StockMovementFilters>): Promise<ApiResponse<StockMovementAttributes[]>> {
        return await this.StockMovementBo.GetStockMovements(apiReq);
    }

    public async GetStockDailyMovements(apiReq?: ApiRequest<StockMovementFilters>): Promise<ApiResponse<StockMovementAttributes[]>> {
        return await this.StockMovementBo.GetStockDailyMovements(apiReq);
    }

    public async DeleteStockMovement(req: BaseRequest): Promise<Boolean> {
        return await this.StockMovementBo.DeleteStockMovement(req);
    }
    public async PrintStockMovementReport(apiReq?: ApiRequest<StockMovementFilters>): Promise<any> {
        return await this.StockMovementBo.PrintStockMovementReport(apiReq);
    }
    public async PrintDailyStockMovement(apiReq?: ApiRequest<StockMovementFilters>): Promise<any> {
        return await this.StockMovementBo.PrintDailyStockMovement(apiReq);
    }
}
