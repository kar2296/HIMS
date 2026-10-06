import { BaseService, BoFactory } from '../../Base/Index';
import { StockEntryDetailBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { StockEntryDetailAttributes } from '../Model/Interface/Index';
import { StockEntryDetailFilters } from '../Common/Filters.e';

export class StockEntryDetailService extends BaseService {
    private StockEntryDetailBo: StockEntryDetailBo;
    constructor(req?: Request) {
        super(req);
        this.StockEntryDetailBo = BoFactory.GetBo(StockEntryDetailBo, this.Request);
    }

    public async AddStockEntryDetail(req: BaseRequest): Promise<number> {
        return await this.StockEntryDetailBo.AddStockEntryDetail(req);
    }

    public async UpdateStockEntryDetail(req: BaseRequest): Promise<boolean> {
        return await this.StockEntryDetailBo.UpdateStockEntryDetail(req);
    }

    public async GetStockEntryDetailById(req: BaseRequest): Promise<StockEntryDetailAttributes> {
        return await this.StockEntryDetailBo.GetStockEntryDetailById(req);
    }

    public async GetStockEntryDetails(apiReq?: ApiRequest<StockEntryDetailFilters>):
        Promise<ApiResponse<StockEntryDetailAttributes[]>> {
        return await this.StockEntryDetailBo.GetStockEntryDetails(apiReq);
    }

    public async DeleteStockEntryDetail(req: BaseRequest): Promise<Boolean> {
        return await this.StockEntryDetailBo.DeleteStockEntryDetail(req);
    }
}
