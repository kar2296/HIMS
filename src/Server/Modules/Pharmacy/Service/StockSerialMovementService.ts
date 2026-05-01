import { BaseService, BoFactory } from '../../Base/Index';
import { StockSerialMovementBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { StockSerialMovementAttributes } from '../Model/Interface/Index';
import { StockSerialMovementFilters } from '../Common/Filters.e';

export class StockSerialMovementService extends BaseService {
    private StockSerialMovementBo: StockSerialMovementBo;
    constructor(req?: Request) {
        super(req);
        this.StockSerialMovementBo = BoFactory.GetBo(StockSerialMovementBo, this.Request);
    }

    public async AddStockSerialMovement(req: BaseRequest): Promise<number> {
        return await this.StockSerialMovementBo.AddStockSerialMovement(req);
    }

    public async UpdateStockSerialMovement(req: BaseRequest): Promise<boolean> {
        return await this.StockSerialMovementBo.UpdateStockSerialMovement(req);
    }

    public async GetStockSerialMovementById(req: BaseRequest): Promise<StockSerialMovementAttributes> {
        return await this.StockSerialMovementBo.GetStockSerialMovementById(req);
    }

    public async GetStockSerialMovements(apiReq?: ApiRequest<StockSerialMovementFilters>):
        Promise<ApiResponse<StockSerialMovementAttributes[]>> {
        return await this.StockSerialMovementBo.GetStockSerialMovements(apiReq);
    }

    public async DeleteStockSerialMovement(req: BaseRequest): Promise<Boolean> {
        return await this.StockSerialMovementBo.DeleteStockSerialMovement(req);
    }
}
