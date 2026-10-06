import { BaseService, BoFactory } from '../../Base/Index';
import { PurchaseOrderBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request, FileInfo } from '../../../Core/Index';
import { PurchaseOrderAttributes } from '../Model/Interface/Index';
import { PurchaseOrderFilters } from '../Common/Filters.e';

export class PurchaseOrderService extends BaseService {
    private PurchaseOrderBo: PurchaseOrderBo;
    constructor(req?: Request) {
        super(req);
        this.PurchaseOrderBo = BoFactory.GetBo(PurchaseOrderBo, this.Request);
    }

    public async AddPurchaseOrder(req: BaseRequest): Promise<number> {
        return await this.PurchaseOrderBo.AddPurchaseOrder(req);
    }

    public async UpdatePurchaseOrder(req: BaseRequest): Promise<boolean> {
        return await this.PurchaseOrderBo.UpdatePurchaseOrder(req);
    }

    public async UploadAttachment(req: BaseRequest): Promise<boolean> {
        return await this.PurchaseOrderBo.UploadAttachment(req);
    }

    public async GetViewAttachment(apiReq?: ApiRequest<PurchaseOrderFilters>):
        Promise<ApiResponse<PurchaseOrderAttributes[]>> {
        return await this.PurchaseOrderBo.GetViewAttachment(apiReq);
    }

    public async GetPurchaseOrderById(req: BaseRequest): Promise<PurchaseOrderAttributes> {
        return await this.PurchaseOrderBo.GetPurchaseOrderById(req);
    }

    public async GetPurchaseOrderByIdWithoutDetails(req: BaseRequest): Promise<PurchaseOrderAttributes> {
        return await this.PurchaseOrderBo.GetPurchaseOrderByIdWithoutDetails(req);
    }

    public async GetPurchaseOrders(apiReq?: ApiRequest<PurchaseOrderFilters>): Promise<ApiResponse<PurchaseOrderAttributes[]>> {
        return await this.PurchaseOrderBo.GetPurchaseOrders(apiReq);
    }

    public async GetPurchaseOrderList(apiReq?: ApiRequest<PurchaseOrderFilters>): Promise<ApiResponse<PurchaseOrderAttributes[]>> {
        return await this.PurchaseOrderBo.GetPurchaseOrderList(apiReq);
    }

    public async GetSelectedPurchaseOrder(apiReq?: ApiRequest<PurchaseOrderFilters>): Promise<ApiResponse<PurchaseOrderAttributes[]>> {
        return await this.PurchaseOrderBo.GetSelectedPurchaseOrder(apiReq);
    }

    public async GetItemFile(req: BaseRequest, res: Response): Promise<any> {
        return await this.PurchaseOrderBo.GetItemFile(req, res);
    }

    public async DeletePurchaseOrder(req: BaseRequest): Promise<Boolean> {
        return await this.PurchaseOrderBo.DeletePurchaseOrder(req);
    }

    public async PrintPurchaseOrder(req: BaseRequest): Promise<FileInfo> {
        return await this.PurchaseOrderBo.PrintPurchaseOrder(req);
    }
    public async PrintPurchaseOrderReport(apiReq?: ApiRequest<PurchaseOrderFilters>): Promise<any> {
        return await this.PurchaseOrderBo.PrintPurchaseOrderReport(apiReq);
    }

    public async PrintPurchaseOrderList(apiReq?: ApiRequest<PurchaseOrderFilters>): Promise<any> {
        return await this.PurchaseOrderBo.PrintPurchaseOrderList(apiReq);
    }
    public async DMPrintPurchaseOrder(req: BaseRequest): Promise<any> {
        return await this.PurchaseOrderBo.DMPrintPurchaseOrder(req);
    }
}
