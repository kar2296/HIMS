import {BaseService, BoFactory } from '../../Base/Index';
import { PurchaseRequestDetailBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { PurchaseRequestDetailAttributes } from '../Model/Interface/Index';
import { PurchaseRequestDetailFilters } from '../Common/Filters.e';

export class PurchaseRequestDetailService extends BaseService {
    private PurchaseRequestDetailBo: PurchaseRequestDetailBo;
    constructor(req?: Request) {
        super(req);
        this.PurchaseRequestDetailBo = BoFactory.GetBo(PurchaseRequestDetailBo, this.Request);
    }

    public async AddPurchaseRequestDetail(req: BaseRequest): Promise<number> {
        return await this.PurchaseRequestDetailBo.AddPurchaseRequestDetail(req);
    }

    public async UpdatePurchaseRequestDetail(req: BaseRequest): Promise<boolean> {
        return await this.PurchaseRequestDetailBo.UpdatePurchaseRequestDetail(req);
    }

    public async GetPurchaseRequestDetailById(req: BaseRequest): Promise<PurchaseRequestDetailAttributes> {
        return await this.PurchaseRequestDetailBo.GetPurchaseRequestDetailById(req);
    }

    public async GetPurchaseRequestDetails(apiReq?: ApiRequest<PurchaseRequestDetailFilters>):
                    Promise<ApiResponse<PurchaseRequestDetailAttributes[]>> {
        return await this.PurchaseRequestDetailBo.GetPurchaseRequestDetails(apiReq);
    }

    public async DeletePurchaseRequestDetail(req: BaseRequest): Promise<Boolean> {
        return await this.PurchaseRequestDetailBo.DeletePurchaseRequestDetail(req);
    }
}
