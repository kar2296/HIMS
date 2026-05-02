import {BaseService, BoFactory } from '../../Base/Index';
import { ProcedureServicesBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { ProcedureServicesAttributes } from '../Model/Interface/Index';
import { ProcedureServicesFilters } from '../Common/Filters.e';

export class ProcedureServicesService extends BaseService {
    private ProcedureServicesBo: ProcedureServicesBo;
    constructor(req?: Request) {
        super(req);
        this.ProcedureServicesBo = BoFactory.GetBo(ProcedureServicesBo, this.Request);
    }

    public async AddProcedureServices(req: BaseRequest): Promise<number> {
        return await this.ProcedureServicesBo.AddProcedureServices(req);
    }

    public async UpdateProcedureServices(req: BaseRequest): Promise<boolean> {
        return await this.ProcedureServicesBo.UpdateProcedureServices(req);
    }

    public async ManageProcedureServices(req: BaseRequest): Promise<boolean> {
        return await this.ProcedureServicesBo.ManageProcedureServices(req);
    }

    public async GetProcedureServicesById(req: BaseRequest): Promise<ProcedureServicesAttributes> {
        return await this.ProcedureServicesBo.GetProcedureServicesById(req);
    }

    public async GetProcedureServices(apiReq?: ApiRequest<ProcedureServicesFilters>):
     Promise<ApiResponse<ProcedureServicesAttributes[]>> {
        return await this.ProcedureServicesBo.GetProcedureServices(apiReq);
    }

    public async DeleteProcedureServices(req: BaseRequest): Promise<Boolean> {
        return await this.ProcedureServicesBo.DeleteProcedureServices(req);
    }
}
