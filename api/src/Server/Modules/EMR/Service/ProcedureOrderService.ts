import { BaseService, BoFactory } from '../../Base/Index';
import { ProcedureOrderBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request/*, FileInfo */ } from '../../../Core/Index';
import { ProcedureOrderAttributes } from '../Model/Interface/Index';
import { ProcedureOrderFilters } from '../Common/Filters.e';

export class ProcedureOrderService extends BaseService {
    private ProcedureOrderBo: ProcedureOrderBo;
    constructor(req?: Request) {
        super(req);
        this.ProcedureOrderBo = BoFactory.GetBo(ProcedureOrderBo, this.Request);
    }

    public async AddProcedureOrder(req: BaseRequest): Promise<number> {
        return await this.ProcedureOrderBo.AddProcedureOrder(req);
    }

    public async UpdateProcedureOrder(req: BaseRequest): Promise<boolean> {
        return await this.ProcedureOrderBo.UpdateProcedureOrder(req);
    }

    public async ManageProcedureOrders(req: BaseRequest): Promise<boolean> {
        return await this.ProcedureOrderBo.ManageProcedureOrders(req);
    }

    public async UpdateProcedureOrderReview(req: BaseRequest): Promise<boolean> {
        return await this.ProcedureOrderBo.UpdateProcedureOrderReview(req);
    }

    public async GetProcedureOrderById(req: BaseRequest): Promise<ProcedureOrderAttributes> {
        return await this.ProcedureOrderBo.GetProcedureOrderById(req);
    }

    public async GetProcedureOrderWithDetailsByBillingId(apiReq?: ApiRequest<ProcedureOrderFilters>):
        Promise<ApiResponse<ProcedureOrderAttributes[]>> {
        return await this.ProcedureOrderBo.GetProcedureOrderWithDetailsByBillingId(apiReq);
    }

    public async GetProcedureOrders(apiReq?: ApiRequest<ProcedureOrderFilters>):
        Promise<ApiResponse<ProcedureOrderAttributes[]>> {
        return await this.ProcedureOrderBo.GetProcedureOrders(apiReq);
    }

    public async GetProcedureOrdersForApproval(apiReq?: ApiRequest<ProcedureOrderFilters>):
        Promise<ApiResponse<ProcedureOrderAttributes[]>> {
        return await this.ProcedureOrderBo.GetProcedureOrdersForApproval(apiReq);
    }

    public async GetProcedureOrderDetailsForApproval(apiReq?: ApiRequest<ProcedureOrderFilters>):
        Promise<ApiResponse<ProcedureOrderAttributes[]>> {
        return await this.ProcedureOrderBo.GetProcedureOrderDetailsForApproval(apiReq);
    }

    public async DeleteProcedureOrder(req: BaseRequest): Promise<Boolean> {
        return await this.ProcedureOrderBo.DeleteProcedureOrder(req);
    }

}
