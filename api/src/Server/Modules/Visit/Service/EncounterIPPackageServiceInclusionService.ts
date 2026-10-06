import { BaseService, BoFactory } from '../../Base/Index';
import { EncounterIPPackageServiceInclusionBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { EncounterIPPackageServiceInclusionAttributes } from '../Model/Interface/Index';
import { EncounterIPPackageServiceInclusionFilters } from '../Common/Filters.e';

export class EncounterIPPackageServiceInclusionService extends BaseService {
    private EncounterIPPackageServiceInclusionBo: EncounterIPPackageServiceInclusionBo;
    constructor(req?: Request) {
        super(req);
        this.EncounterIPPackageServiceInclusionBo = BoFactory.GetBo(EncounterIPPackageServiceInclusionBo, this.Request);
    }

    public async AddEncounterIPPackageServiceInclusion(req: BaseRequest): Promise<number> {
        return await this.EncounterIPPackageServiceInclusionBo.AddEncounterIPPackageServiceInclusion(req);
    }

    public async UpdateEncounterIPPackageServiceInclusion(req: BaseRequest): Promise<boolean> {
        return await this.EncounterIPPackageServiceInclusionBo.UpdateEncounterIPPackageServiceInclusion(req);
    }

    public async GetEncounterIPPackageServiceInclusionById(req: BaseRequest): Promise<EncounterIPPackageServiceInclusionAttributes> {
        return await this.EncounterIPPackageServiceInclusionBo.GetEncounterIPPackageServiceInclusionById(req);
    }

    public async GetEncounterIPPackageServiceInclusions(apiReq?: ApiRequest<EncounterIPPackageServiceInclusionFilters>):
        Promise<ApiResponse<EncounterIPPackageServiceInclusionAttributes[]>> {
        return await this.EncounterIPPackageServiceInclusionBo.GetEncounterIPPackageServiceInclusions(apiReq);
    }

    public async GetMinEncounterIPPackageServiceInclusions(apiReq?: ApiRequest<EncounterIPPackageServiceInclusionFilters>):
        Promise<ApiResponse<EncounterIPPackageServiceInclusionAttributes[]>> {
        return await this.EncounterIPPackageServiceInclusionBo.GetMinEncounterIPPackageServiceInclusions(apiReq);
    }
    public async DeleteEncounterIPPackageServiceInclusion(req: BaseRequest): Promise<Boolean> {
        return await this.EncounterIPPackageServiceInclusionBo.DeleteEncounterIPPackageServiceInclusion(req);
    }
}
