import {BaseService, BoFactory } from '../../Base/Index';
import { PurchaseReturnDetailBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { PurchaseReturnDetailAttributes } from '../Model/Interface/Index';
import { PurchaseReturnDetailFilters } from '../Common/Filters.e';

export class PurchaseReturnDetailService extends BaseService {
    private PurchaseReturnDetailBo: PurchaseReturnDetailBo;
    constructor(req?: Request) {
        super(req);
        this.PurchaseReturnDetailBo = BoFactory.GetBo(PurchaseReturnDetailBo, this.Request);
    }

    public async AddPurchaseReturnDetail(req: BaseRequest): Promise<number> {
        return await this.PurchaseReturnDetailBo.AddPurchaseReturnDetail(req);
    }

    public async UpdatePurchaseReturnDetail(req: BaseRequest): Promise<boolean> {
        return await this.PurchaseReturnDetailBo.UpdatePurchaseReturnDetail(req);
    }

    public async GetPurchaseReturnDetailById(req: BaseRequest): Promise<PurchaseReturnDetailAttributes> {
        return await this.PurchaseReturnDetailBo.GetPurchaseReturnDetailById(req);
    }

    public async GetPurchaseReturnDetails(apiReq?: ApiRequest<PurchaseReturnDetailFilters>):
                    Promise<ApiResponse<PurchaseReturnDetailAttributes[]>> {
        return await this.PurchaseReturnDetailBo.GetPurchaseReturnDetails(apiReq);
    }
    public async PurchaseReturnGSTDetails(apiReq?: ApiRequest<PurchaseReturnDetailFilters>):
        Promise<ApiResponse<PurchaseReturnDetailAttributes[]>> {
        return await this.PurchaseReturnDetailBo.PurchaseReturnGSTDetails(apiReq);
    }
    public async PrintPurchaseReturnGSTReport(apiReq?: ApiRequest<PurchaseReturnDetailFilters>): Promise<any> {
        return await this.PurchaseReturnDetailBo.PrintPurchaseReturnGSTReport(apiReq);
    }

    public async DeletePurchaseReturnDetail(req: BaseRequest): Promise<Boolean> {
        return await this.PurchaseReturnDetailBo.DeletePurchaseReturnDetail(req);
    }
}
