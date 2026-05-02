import { BaseService, BoFactory } from '../../Base/Index';
import { IPPackageServiceExclusionBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { IPPackageServiceExclusionAttributes } from '../Model/Interface/Index';
import { IPPackageServiceExclusionFilters } from '../Common/Filters.e';

export class IPPackageServiceExclusionService extends BaseService {
    private IPPackageServiceExclusionBo: IPPackageServiceExclusionBo;
    constructor(req?: Request) {
        super(req);
        this.IPPackageServiceExclusionBo = BoFactory.GetBo(IPPackageServiceExclusionBo, this.Request);
    }

    public async AddIPPackageServiceExclusion(req: BaseRequest): Promise<number> {
        return await this.IPPackageServiceExclusionBo.AddIPPackageServiceExclusion(req);
    }

    public async UpdateIPPackageServiceExclusion(req: BaseRequest): Promise<boolean> {
        return await this.IPPackageServiceExclusionBo.UpdateIPPackageServiceExclusion(req);
    }

    public async GetIPPackageServiceExclusionById(req: BaseRequest):
        Promise<IPPackageServiceExclusionAttributes> {
        return await this.IPPackageServiceExclusionBo.GetIPPackageServiceExclusionById(req);
    }

    public async GetIPPackageServiceExclusions(apiReq?: ApiRequest<IPPackageServiceExclusionFilters>):
        Promise<ApiResponse<IPPackageServiceExclusionAttributes[]>> {
        return await this.IPPackageServiceExclusionBo.GetIPPackageServiceExclusions(apiReq);
    }

    public async DeleteIPPackageServiceExclusion(req: BaseRequest): Promise<Boolean> {
        return await this.IPPackageServiceExclusionBo.DeleteIPPackageServiceExclusion(req);
    }
}
