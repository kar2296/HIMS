import { BaseService, BoFactory } from '../../Base/Index';
import { PurchaseReturnBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request, FileInfo } from '../../../Core/Index';
import { PurchaseReturnAttributes } from '../Model/Interface/Index';
import { PurchaseReturnFilters } from '../Common/Filters.e';

export class PurchaseReturnService extends BaseService {
    private PurchaseReturnBo: PurchaseReturnBo;
    constructor(req?: Request) {
        super(req);
        this.PurchaseReturnBo = BoFactory.GetBo(PurchaseReturnBo, this.Request);
    }

    public async AddPurchaseReturn(req: BaseRequest): Promise<number> {
        return await this.PurchaseReturnBo.AddPurchaseReturn(req);
    }

    public async UpdatePurchaseReturn(req: BaseRequest): Promise<boolean> {
        return await this.PurchaseReturnBo.UpdatePurchaseReturn(req);
    }

    public async ManagePurchaseReturnTallyApprove(req: BaseRequest): Promise<boolean> {
        return await this.PurchaseReturnBo.ManagePurchaseReturnTallyApprove(req);
    }

    public async GetPurchaseReturnById(req: BaseRequest): Promise<PurchaseReturnAttributes> {
        return await this.PurchaseReturnBo.GetPurchaseReturnById(req);
    }

    public async GetPurchaseReturns(apiReq?: ApiRequest<PurchaseReturnFilters>): Promise<ApiResponse<PurchaseReturnAttributes[]>> {
        return await this.PurchaseReturnBo.GetPurchaseReturns(apiReq);
    }

    public async DeletePurchaseReturn(req: BaseRequest): Promise<Boolean> {
        return await this.PurchaseReturnBo.DeletePurchaseReturn(req);
    }
    public async PrintPurchaseReturn(req: BaseRequest): Promise<FileInfo> {
        return await this.PurchaseReturnBo.PrintPurchaseReturn(req);
    }
    public async PrintPurchaseReturnList(apiReq?: ApiRequest<PurchaseReturnFilters>): Promise<any> {
        return await this.PurchaseReturnBo.PrintPurchaseReturnList(apiReq);
    }
    public async PrintPurchaseReturnReport(apiReq?: ApiRequest<PurchaseReturnFilters>): Promise<any> {
        return await this.PurchaseReturnBo.PrintPurchaseReturnReport(apiReq);
    }
}
