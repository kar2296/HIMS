import { BaseService, BoFactory } from '../../Base/Index';
import { StockTransferDetailBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { StockTransferDetailAttributes } from '../Model/Interface/Index';
import { StockTransferDetailFilters } from '../Common/Filters.e';

export class StockTransferDetailService extends BaseService {
    private StockTransferDetailBo: StockTransferDetailBo;
    constructor(req?: Request) {
        super(req);
        this.StockTransferDetailBo = BoFactory.GetBo(StockTransferDetailBo, this.Request);
    }

    public async AddStockTransferDetail(req: BaseRequest): Promise<number> {
        return await this.StockTransferDetailBo.AddStockTransferDetail(req);
    }

    public async UpdateStockTransferDetail(req: BaseRequest): Promise<boolean> {
        return await this.StockTransferDetailBo.UpdateStockTransferDetail(req);
    }

    public async GetStockTransferDetailById(req: BaseRequest): Promise<StockTransferDetailAttributes> {
        return await this.StockTransferDetailBo.GetStockTransferDetailById(req);
    }

    public async GetStockTransferDetails(apiReq?: ApiRequest<StockTransferDetailFilters>):
        Promise<ApiResponse<StockTransferDetailAttributes[]>> {
        return await this.StockTransferDetailBo.GetStockTransferDetails(apiReq);
    }

    public async DeleteStockTransferDetail(req: BaseRequest): Promise<Boolean> {
        return await this.StockTransferDetailBo.DeleteStockTransferDetail(req);
    }

    public async PrintStockIssueVocherReport(apiReq?: ApiRequest<StockTransferDetailFilters>): Promise<any> {
        return await this.StockTransferDetailBo.PrintStockIssueVocherReport(apiReq);
    }
    public async PrintStockTransistReport(apiReq?: ApiRequest<StockTransferDetailFilters>): Promise<any> {
        return await this.StockTransferDetailBo.PrintStockTransistReport(apiReq);
    }
}
