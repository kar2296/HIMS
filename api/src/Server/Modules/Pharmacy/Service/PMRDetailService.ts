import { BaseService, BoFactory } from '../../Base/Index';
import { PMRDetailBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { PMRDetailAttributes } from '../Model/Interface/Index';
import { PMRDetailFilters } from '../Common/Filters.e';

export class PMRDetailService extends BaseService {
    private PMRDetailBo: PMRDetailBo;
    constructor(req?: Request) {
        super(req);
        this.PMRDetailBo = BoFactory.GetBo(PMRDetailBo, this.Request);
    }

    public async AddPMRDetail(req: BaseRequest): Promise<number> {
        return await this.PMRDetailBo.AddPMRDetail(req);
    }

    public async UpdatePMRDetail(req: BaseRequest): Promise<boolean> {
        return await this.PMRDetailBo.UpdatePMRDetail(req);
    }

    public async GetPMRDetailById(req: BaseRequest): Promise<PMRDetailAttributes> {
        return await this.PMRDetailBo.GetPMRDetailById(req);
    }

    public async GetPMRDetails(apiReq?: ApiRequest<PMRDetailFilters>):
        Promise<ApiResponse<PMRDetailAttributes[]>> {
        return await this.PMRDetailBo.GetPMRDetails(apiReq);
    }

    public async DeletePMRDetail(req: BaseRequest): Promise<Boolean> {
        return await this.PMRDetailBo.DeletePMRDetail(req);
    }
}
