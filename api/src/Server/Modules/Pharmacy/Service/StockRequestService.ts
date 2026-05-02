import { BaseService, BoFactory } from '../../Base/Index';
import { StockRequestBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request, FileInfo } from '../../../Core/Index';
import { StockRequestAttributes } from '../Model/Interface/Index';
import { StockRequestFilters } from '../Common/Filters.e';

export class StockRequestService extends BaseService {
    private StockRequestBo: StockRequestBo;
    constructor(req?: Request) {
        super(req);
        this.StockRequestBo = BoFactory.GetBo(StockRequestBo, this.Request);
    }

    public async AddStockRequest(req: BaseRequest): Promise<number> {
        return await this.StockRequestBo.AddStockRequest(req);
    }

    public async AddExcelStockRequest(req: BaseRequest): Promise<any> {
        return await this.StockRequestBo.AddExcelStockRequest(req);
    }

    public async UpdateStockRequest(req: BaseRequest): Promise<boolean> {
        return await this.StockRequestBo.UpdateStockRequest(req);
    }

    public async CompleteStockRequest(req: BaseRequest): Promise<boolean> {
        return await this.StockRequestBo.CompleteStockRequest(req);
    }

    public async GetStockRequestById(req: BaseRequest): Promise<StockRequestAttributes> {
        return await this.StockRequestBo.GetStockRequestById(req);
    }

    public async GetStockRequestByIdWithoutDetails(req: BaseRequest): Promise<StockRequestAttributes> {
        return await this.StockRequestBo.GetStockRequestByIdWithoutDetails(req);
    }

    public async GetStockRequests(apiReq?: ApiRequest<StockRequestFilters>): Promise<ApiResponse<StockRequestAttributes[]>> {
        return await this.StockRequestBo.GetStockRequests(apiReq);
    }

    public async DeleteStockRequest(req: BaseRequest): Promise<Boolean> {
        return await this.StockRequestBo.DeleteStockRequest(req);
    }
    public async PrintStockRequest(req: BaseRequest): Promise<FileInfo> {
        return await this.StockRequestBo.PrintStockRequest(req);
    }
    public async PrintStockReqBeforeTransfer(req: BaseRequest): Promise<FileInfo> {
        return await this.StockRequestBo.PrintStockReqBeforeTransfer(req);
    }
    public async PrintStockIndentReport(apiReq?: ApiRequest<StockRequestFilters>): Promise<any> {
        return await this.StockRequestBo.PrintStockIndentReport(apiReq);
    }

}
