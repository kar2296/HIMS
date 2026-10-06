import { BaseService, BoFactory } from '../../Base/Index';
import { StockSerialItemBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { StockSerialItemAttributes } from '../Model/Interface/Index';
import { StockSerialItemFilters } from '../Common/Filters.e';

export class StockSerialItemService extends BaseService {
    private StockSerialItemBo: StockSerialItemBo;
    constructor(req?: Request) {
        super(req);
        this.StockSerialItemBo = BoFactory.GetBo(StockSerialItemBo, this.Request);
    }

    public async AddStockSerialItem(req: BaseRequest): Promise<number> {
        return await this.StockSerialItemBo.AddStockSerialItem(req);
    }

    public async UpdateStockSerialItem(req: BaseRequest): Promise<boolean> {
        return await this.StockSerialItemBo.UpdateStockSerialItem(req);
    }

    public async UpdateBarcodeStockItem(req: BaseRequest): Promise<boolean> {
        return await this.StockSerialItemBo.UpdateBarcodeStockItem(req);
    }

    public async UpdateStockSerialItems(req: BaseRequest): Promise<number> {
        return await this.StockSerialItemBo.UpdateStockSerialItems(req);
    }

    public async GetStockSerialItemById(req: BaseRequest): Promise<StockSerialItemAttributes> {
        return await this.StockSerialItemBo.GetStockSerialItemById(req);
    }

    public async GetStockSerialItems(apiReq?: ApiRequest<StockSerialItemFilters>):
        Promise<ApiResponse<StockSerialItemAttributes[]>> {
        return await this.StockSerialItemBo.GetStockSerialItems(apiReq);
    }

    public async GetValueStockSerialItems(apiReq?: ApiRequest<StockSerialItemFilters>):
        Promise<ApiResponse<StockSerialItemAttributes[]>> {
        return await this.StockSerialItemBo.GetValueStockSerialItems(apiReq);
    }

    public async GetStockSummaryByProductGst(apiReq?: ApiRequest<StockSerialItemFilters>):
        Promise<ApiResponse<StockSerialItemAttributes[]>> {
        return await this.StockSerialItemBo.GetStockSummaryByProductGst(apiReq);
    }

    public async GetStockSerialItemsforNonMovements(apiReq?: ApiRequest<StockSerialItemFilters>):
        Promise<ApiResponse<StockSerialItemAttributes[]>> {
        return await this.StockSerialItemBo.GetStockSerialItemsforNonMovements(apiReq);
    }

    public async GetExpiredSerialItems(apiReq?: ApiRequest<StockSerialItemFilters>):
        Promise<ApiResponse<StockSerialItemAttributes[]>> {
        return await this.StockSerialItemBo.GetExpiredSerialItems(apiReq);
    }

    public async DeleteStockSerialItem(req: BaseRequest): Promise<Boolean> {
        return await this.StockSerialItemBo.DeleteStockSerialItem(req);
    }
    public async PrintMedicineExpiryReport(apiReq?: ApiRequest<StockSerialItemFilters>): Promise<any> {
        return await this.StockSerialItemBo.PrintMedicineExpiryReport(apiReq);
    }
    public async PrintMedicineExpiredReport(apiReq?: ApiRequest<StockSerialItemFilters>): Promise<any> {
        return await this.StockSerialItemBo.PrintMedicineExpiredReport(apiReq);
    }
    public async PrintStockStatusReport(apiReq?: ApiRequest<StockSerialItemFilters>): Promise<any> {
        return await this.StockSerialItemBo.PrintStockStatusReport(apiReq);
    }
    public async PrintStockStatusGeneralReport(apiReq?: ApiRequest<StockSerialItemFilters>): Promise<any> {
        return await this.StockSerialItemBo.PrintStockStatusGeneralReport(apiReq);
    }
    public async PrintStockStatusBatchReport(apiReq?: ApiRequest<StockSerialItemFilters>): Promise<any> {
        return await this.StockSerialItemBo.PrintStockStatusBatchReport(apiReq);
    }
    public async PrintGeneralStockStatusBatchReport(apiReq?: ApiRequest<StockSerialItemFilters>): Promise<any> {
        return await this.StockSerialItemBo.PrintGeneralStockStatusBatchReport(apiReq);
    }
    public async PrintStockStatusProductSummaryReport(apiReq?: ApiRequest<StockSerialItemFilters>): Promise<any> {
        return await this.StockSerialItemBo.PrintStockStatusProductSummaryReport(apiReq);
    }
    public async PrintPharmacyStockReport(apiReq?: ApiRequest<StockSerialItemFilters>): Promise<any> {
        return await this.StockSerialItemBo.PrintPharmacyStockReport(apiReq);
    }
    public async PrintStockSummaryByProductGst(apiReq?: ApiRequest<StockSerialItemFilters>): Promise<any> {
        return await this.StockSerialItemBo.PrintStockSummaryByProductGst(apiReq);
    }
    public async PrintStockNonMovementReport(apiReq?: ApiRequest<StockSerialItemFilters>): Promise<any> {
        return await this.StockSerialItemBo.PrintStockNonMovementReport(apiReq);
    }
}
