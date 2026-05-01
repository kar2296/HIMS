import { BaseService, BoFactory } from '../../Base/Index';
import { StockTransferBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request, FileInfo } from '../../../Core/Index';
import { StockTransferAttributes } from '../Model/Interface/Index';
import { StockTransferFilters } from '../Common/Filters.e';

export class StockTransferService extends BaseService {
    private StockTransferBo: StockTransferBo;
    constructor(req?: Request) {
        super(req);
        this.StockTransferBo = BoFactory.GetBo(StockTransferBo, this.Request);
    }

    public async AddStockTransfer(req: BaseRequest): Promise<number> {
        return await this.StockTransferBo.AddStockTransfer(req);
    }

    public async UpdateStockTransfer(req: BaseRequest): Promise<boolean> {
        return await this.StockTransferBo.UpdateStockTransfer(req);
    }

    public async AcceptStockTransfer(req: BaseRequest): Promise<boolean> {
        return await this.StockTransferBo.AcceptStockTransfer(req);
    }

    public async GetStockTransferById(req: BaseRequest): Promise<StockTransferAttributes> {
        return await this.StockTransferBo.GetStockTransferById(req);
    }

    public async GetStockTransferByIdWithoutDetails(req: BaseRequest): Promise<StockTransferAttributes> {
        return await this.StockTransferBo.GetStockTransferByIdWithoutDetails(req);
    }

    public async GetStockAcceptByIdWithoutDetails(req: BaseRequest): Promise<StockTransferAttributes> {
        return await this.StockTransferBo.GetStockAcceptByIdWithoutDetails(req);
    }

    public async GetStockTransfers(apiReq?: ApiRequest<StockTransferFilters>): Promise<ApiResponse<StockTransferAttributes[]>> {
        return await this.StockTransferBo.GetStockTransfers(apiReq);
    }

    public async DeleteStockTransfer(req: BaseRequest): Promise<Boolean> {
        return await this.StockTransferBo.DeleteStockTransfer(req);
    }

    public async PrintStockTransfer(req: BaseRequest): Promise<FileInfo> {
        return await this.StockTransferBo.PrintStockTransfer(req);
    }
    public async PrintStockAcceptance(req: BaseRequest): Promise<FileInfo> {
        return await this.StockTransferBo.PrintStockAcceptance(req);
    }

    public async DMPrintStockTransfer(req: BaseRequest): Promise<any> {
        return await this.StockTransferBo.DMPrintStockTransfer(req);
    }


}
