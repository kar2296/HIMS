import {BaseService, BoFactory } from '../../Base/Index';
import { PurchaseRequestBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request, FileInfo } from '../../../Core/Index';
import { PurchaseRequestAttributes } from '../Model/Interface/Index';
import { PurchaseRequestFilters } from '../Common/Filters.e';

export class PurchaseRequestService extends BaseService {
    private PurchaseRequestBo: PurchaseRequestBo;
    constructor(req?: Request) {
        super(req);
        this.PurchaseRequestBo = BoFactory.GetBo(PurchaseRequestBo, this.Request);
    }

    public async AddPurchaseRequest(req: BaseRequest): Promise<number> {
        return await this.PurchaseRequestBo.AddPurchaseRequest(req);
    }

    public async UpdatePurchaseRequest(req: BaseRequest): Promise<boolean> {
        return await this.PurchaseRequestBo.UpdatePurchaseRequest(req);
    }

    public async GetPurchaseRequestById(req: BaseRequest): Promise<PurchaseRequestAttributes> {
        return await this.PurchaseRequestBo.GetPurchaseRequestById(req);
    }

    public async GetPurchaseRequests(apiReq?: ApiRequest<PurchaseRequestFilters>): Promise<ApiResponse<PurchaseRequestAttributes[]>> {
        return await this.PurchaseRequestBo.GetPurchaseRequests(apiReq);
    }

    public async DeletePurchaseRequest(req: BaseRequest): Promise<Boolean> {
        return await this.PurchaseRequestBo.DeletePurchaseRequest(req);
    }
    public async PrintPurchaseRequest(req: BaseRequest): Promise<FileInfo> {
        return await this.PurchaseRequestBo.PrintPurchaseRequest(req);
    }
}
