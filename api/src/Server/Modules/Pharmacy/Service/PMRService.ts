import { BaseService, BoFactory } from '../../Base/Index';
import { PMRBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { PMRAttributes } from '../Model/Interface/Index';
import { PMRFilters } from '../Common/Filters.e';

export class PMRService extends BaseService {
    private PMRBo: PMRBo;
    constructor(req?: Request) {
        super(req);
        this.PMRBo = BoFactory.GetBo(PMRBo, this.Request);
    }

    public async AddPMR(req: BaseRequest): Promise<number> {
        return await this.PMRBo.AddPMR(req);
    }

    public async UpdatePMR(req: BaseRequest): Promise<boolean> {
        return await this.PMRBo.UpdatePMR(req);
    }

    public async GetPMRById(req: BaseRequest): Promise<PMRAttributes> {
        return await this.PMRBo.GetPMRById(req);
    }

    public async GetPMRProcedures(apiReq?: ApiRequest<PMRFilters>):
        Promise<ApiResponse<PMRAttributes[]>> {
        return await this.PMRBo.GetPMRProcedures(apiReq);
    }

    public async GetPMRs(apiReq?: ApiRequest<PMRFilters>):
        Promise<ApiResponse<PMRAttributes[]>> {
        return await this.PMRBo.GetPMRs(apiReq);
    }

    public async GetPMRItems(apiReq?: ApiRequest<PMRFilters>):
        Promise<ApiResponse<PMRAttributes[]>> {
        return await this.PMRBo.GetPMRItems(apiReq);
    }

    public async DeletePMR(req: BaseRequest): Promise<Boolean> {
        return await this.PMRBo.DeletePMR(req);
    }
}
