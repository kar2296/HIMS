import { BaseService, BoFactory } from '../../Base/Index';
import { IPPackageServiceInclusionBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { IPPackageServiceInclusionAttributes } from '../Model/Interface/Index';
import { IPPackageServiceInclusionFilters } from '../Common/Filters.e';

export class IPPackageServiceInclusionService extends BaseService {
    private IPPackageServiceInclusionBo: IPPackageServiceInclusionBo;
    constructor(req?: Request) {
        super(req);
        this.IPPackageServiceInclusionBo = BoFactory.GetBo(IPPackageServiceInclusionBo, this.Request);
    }

    public async AddIPPackageServiceInclusion(req: BaseRequest): Promise<number> {
        return await this.IPPackageServiceInclusionBo.AddIPPackageServiceInclusion(req);
    }

    public async UpdateIPPackageServiceInclusion(req: BaseRequest): Promise<boolean> {
        return await this.IPPackageServiceInclusionBo.UpdateIPPackageServiceInclusion(req);
    }

    public async GetIPPackageServiceInclusionById(req: BaseRequest): Promise<IPPackageServiceInclusionAttributes> {
        return await this.IPPackageServiceInclusionBo.GetIPPackageServiceInclusionById(req);
    }

    public async GetIPPackageServiceInclusions(apiReq?: ApiRequest<IPPackageServiceInclusionFilters>):
        Promise<ApiResponse<IPPackageServiceInclusionAttributes[]>> {
        return await this.IPPackageServiceInclusionBo.GetIPPackageServiceInclusions(apiReq);
    }

    public async DeleteIPPackageServiceInclusion(req: BaseRequest): Promise<Boolean> {
        return await this.IPPackageServiceInclusionBo.DeleteIPPackageServiceInclusion(req);
    }
}
