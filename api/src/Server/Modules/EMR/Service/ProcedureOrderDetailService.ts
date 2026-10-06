import { BaseService, BoFactory } from '../../Base/Index';
import { ProcedureOrderDetailBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { ProcedureOrderDetailAttributes } from '../Model/Interface/Index';
import { ProcedureOrderDetailFilters } from '../Common/Filters.e';

export class ProcedureOrderDetailService extends BaseService {
    private ProcedureOrderDetailBo: ProcedureOrderDetailBo;
    constructor(req?: Request) {
        super(req);
        this.ProcedureOrderDetailBo = BoFactory.GetBo(ProcedureOrderDetailBo, this.Request);
    }

    public async AddProcedureOrderDetail(req: BaseRequest): Promise<number> {
        return await this.ProcedureOrderDetailBo.AddProcedureOrderDetail(req);
    }

    public async UpdateProcedureOrderDetail(req: BaseRequest): Promise<boolean> {
        return await this.ProcedureOrderDetailBo.UpdateProcedureOrderDetail(req);
    }

    public async GetProcedureOrderDetailById(req: BaseRequest): Promise<ProcedureOrderDetailAttributes> {
        return await this.ProcedureOrderDetailBo.GetProcedureOrderDetailById(req);
    }

    public async GetProcedureOrderDetails(apiReq?: ApiRequest<ProcedureOrderDetailFilters>):
        Promise<ApiResponse<ProcedureOrderDetailAttributes[]>> {
        return await this.ProcedureOrderDetailBo.GetProcedureOrderDetails(apiReq);
    }

    public async DeleteProcedureOrderDetail(req: BaseRequest): Promise<Boolean> {
        return await this.ProcedureOrderDetailBo.DeleteProcedureOrderDetail(req);
    }
}
