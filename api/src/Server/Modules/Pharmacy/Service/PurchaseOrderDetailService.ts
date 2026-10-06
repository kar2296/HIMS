import { BaseService, BoFactory } from '../../Base/Index';
import { PurchaseOrderDetailBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { PurchaseOrderDetailAttributes } from '../Model/Interface/Index';
import { PurchaseOrderDetailFilters } from '../Common/Filters.e';

export class PurchaseOrderDetailService extends BaseService {
    private PurchaseOrderDetailBo: PurchaseOrderDetailBo;
    constructor(req?: Request) {
        super(req);
        this.PurchaseOrderDetailBo = BoFactory.GetBo(PurchaseOrderDetailBo, this.Request);
    }

    public async AddPurchaseOrderDetail(req: BaseRequest): Promise<number> {
        return await this.PurchaseOrderDetailBo.AddPurchaseOrderDetail(req);
    }

    public async UpdatePurchaseOrderDetail(req: BaseRequest): Promise<boolean> {
        return await this.PurchaseOrderDetailBo.UpdatePurchaseOrderDetail(req);
    }

    public async GetPurchaseOrderDetailById(req: BaseRequest): Promise<PurchaseOrderDetailAttributes> {
        return await this.PurchaseOrderDetailBo.GetPurchaseOrderDetailById(req);
    }

    public async GetPurchaseOrderDetails(apiReq?: ApiRequest<PurchaseOrderDetailFilters>):
        Promise<ApiResponse<PurchaseOrderDetailAttributes[]>> {
        return await this.PurchaseOrderDetailBo.GetPurchaseOrderDetails(apiReq);
    }
    public async PrintPendingPOReport(apiReq?: ApiRequest<PurchaseOrderDetailFilters>): Promise<any> {
        return await this.PurchaseOrderDetailBo.PrintPendingPOReport(apiReq);
    }

    public async DeletePurchaseOrderDetail(req: BaseRequest): Promise<Boolean> {
        return await this.PurchaseOrderDetailBo.DeletePurchaseOrderDetail(req);
    }
    public async PrintPurchaseOrderDetailReport(apiReq?: ApiRequest<PurchaseOrderDetailFilters>): Promise<any> {
        return await this.PurchaseOrderDetailBo.PrintPurchaseOrderDetailReport(apiReq);
    }
}
