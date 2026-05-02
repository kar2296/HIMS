import { BaseService, BoFactory } from '../../Base/Index';
import { StockConsumptionBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request, FileInfo } from '../../../Core/Index';
import { StockConsumptionAttributes } from '../Model/Interface/Index';
import { StockConsumptionFilters } from '../Common/Filters.e';

export class StockConsumptionService extends BaseService {
    private StockConsumptionBo: StockConsumptionBo;
    constructor(req?: Request) {
        super(req);
        this.StockConsumptionBo = BoFactory.GetBo(StockConsumptionBo, this.Request);
    }

    public async AddStockConsumption(req: BaseRequest): Promise<number> {
        return await this.StockConsumptionBo.AddStockConsumption(req);
    }

    public async UpdateStockConsumption(req: BaseRequest): Promise<boolean> {
        return await this.StockConsumptionBo.UpdateStockConsumption(req);
    }

    public async GetStockConsumptionById(req: BaseRequest): Promise<StockConsumptionAttributes> {
        return await this.StockConsumptionBo.GetStockConsumptionById(req);
    }

    public async GetStockConsumptions(apiReq?: ApiRequest<StockConsumptionFilters>): Promise<ApiResponse<StockConsumptionAttributes[]>> {
        return await this.StockConsumptionBo.GetStockConsumptions(apiReq);
    }

    public async DeleteStockConsumption(req: BaseRequest): Promise<Boolean> {
        return await this.StockConsumptionBo.DeleteStockConsumption(req);
    }
    public async PrintStockConsumption(req: BaseRequest): Promise<FileInfo> {
        return await this.StockConsumptionBo.PrintStockConsumption(req);
    }
}
