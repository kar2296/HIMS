import { BaseService, BoFactory } from '../../Base/Index';
import { StockConsumptionDetailBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { StockConsumptionDetailAttributes } from '../Model/Interface/Index';
import { StockConsumptionDetailFilters } from '../Common/Filters.e';

export class StockConsumptionDetailService extends BaseService {
    private StockConsumptionDetailBo: StockConsumptionDetailBo;
    constructor(req?: Request) {
        super(req);
        this.StockConsumptionDetailBo = BoFactory.GetBo(StockConsumptionDetailBo, this.Request);
    }

    public async AddStockConsumptionDetail(req: BaseRequest): Promise<number> {
        return await this.StockConsumptionDetailBo.AddStockConsumptionDetail(req);
    }

    public async UpdateStockConsumptionDetail(req: BaseRequest): Promise<boolean> {
        return await this.StockConsumptionDetailBo.UpdateStockConsumptionDetail(req);
    }

    public async GetStockConsumptionDetailById(req: BaseRequest): Promise<StockConsumptionDetailAttributes> {
        return await this.StockConsumptionDetailBo.GetStockConsumptionDetailById(req);
    }

    public async GetStockConsumptionDetails(apiReq?: ApiRequest<StockConsumptionDetailFilters>):
        Promise<ApiResponse<StockConsumptionDetailAttributes[]>> {
        return await this.StockConsumptionDetailBo.GetStockConsumptionDetails(apiReq);
    }

    public async DeleteStockConsumptionDetail(req: BaseRequest): Promise<Boolean> {
        return await this.StockConsumptionDetailBo.DeleteStockConsumptionDetail(req);
    }
    public async PrintStockConsumptionReport(apiReq?: ApiRequest<StockConsumptionDetailFilters>): Promise<any> {
        return await this.StockConsumptionDetailBo.PrintStockConsumptionReport(apiReq);
    }
}
