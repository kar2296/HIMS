import { BaseService, BoFactory } from '../../Base/Index';
import { StockEntryBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request, FileInfo } from '../../../Core/Index';
import { StockEntryAttributes } from '../Model/Interface/Index';
import { StockEntryFilters } from '../Common/Filters.e';

export class StockEntryService extends BaseService {
    private StockEntryBo: StockEntryBo;
    constructor(req?: Request) {
        super(req);
        this.StockEntryBo = BoFactory.GetBo(StockEntryBo, this.Request);
    }

    public async AddStockEntry(req: BaseRequest): Promise<number> {
        return await this.StockEntryBo.AddStockEntry(req);
    }

    public async UpdateStockEntry(req: BaseRequest): Promise<boolean> {
        return await this.StockEntryBo.UpdateStockEntry(req);
    }

    public async GetStockEntryById(req: BaseRequest): Promise<StockEntryAttributes> {
        return await this.StockEntryBo.GetStockEntryById(req);
    }

    public async GetStockEntrys(apiReq?: ApiRequest<StockEntryFilters>): Promise<ApiResponse<StockEntryAttributes[]>> {
        return await this.StockEntryBo.GetStockEntrys(apiReq);
    }

    public async GetToDayStockEntrys(apiReq?: ApiRequest<StockEntryFilters>): Promise<ApiResponse<StockEntryAttributes[]>> {
        return await this.StockEntryBo.GetToDayStockEntrys(apiReq);
    }

    public async DeleteStockEntry(req: BaseRequest): Promise<Boolean> {
        return await this.StockEntryBo.DeleteStockEntry(req);
    }
    public async PrintStockEntry(req: BaseRequest): Promise<FileInfo> {
        return await this.StockEntryBo.PrintStockEntry(req);
    }
    public async PrintOpeningStockReport(apiReq?: ApiRequest<StockEntryFilters>): Promise<any> {
        return await this.StockEntryBo.PrintOpeningStockReport(apiReq);
    }
}
