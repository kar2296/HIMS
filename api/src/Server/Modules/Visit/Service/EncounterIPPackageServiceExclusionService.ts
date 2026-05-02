import { BaseService, BoFactory } from '../../Base/Index';
import { EncounterIPPackageServiceExclusionBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { EncounterIPPackageServiceExclusionAttributes } from '../Model/Interface/Index';
import { EncounterIPPackageServiceExclusionFilters } from '../Common/Filters.e';

export class EncounterIPPackageServiceExclusionService extends BaseService {
    private EncounterIPPackageServiceExclusionBo: EncounterIPPackageServiceExclusionBo;
    constructor(req?: Request) {
        super(req);
        this.EncounterIPPackageServiceExclusionBo = BoFactory.GetBo(EncounterIPPackageServiceExclusionBo, this.Request);
    }

    public async AddEncounterIPPackageServiceExclusion(req: BaseRequest): Promise<number> {
        return await this.EncounterIPPackageServiceExclusionBo.AddEncounterIPPackageServiceExclusion(req);
    }

    public async UpdateEncounterIPPackageServiceExclusion(req: BaseRequest): Promise<boolean> {
        return await this.EncounterIPPackageServiceExclusionBo.UpdateEncounterIPPackageServiceExclusion(req);
    }

    public async GetEncounterIPPackageServiceExclusionById(req: BaseRequest):
        Promise<EncounterIPPackageServiceExclusionAttributes> {
        return await this.EncounterIPPackageServiceExclusionBo.GetEncounterIPPackageServiceExclusionById(req);
    }

    public async GetEncounterIPPackageServiceExclusions(apiReq?: ApiRequest<EncounterIPPackageServiceExclusionFilters>):
        Promise<ApiResponse<EncounterIPPackageServiceExclusionAttributes[]>> {
        return await this.EncounterIPPackageServiceExclusionBo.GetEncounterIPPackageServiceExclusions(apiReq);
    }

    public async GetMinEncounterIPPackageServiceExclusions(apiReq?: ApiRequest<EncounterIPPackageServiceExclusionFilters>):
        Promise<ApiResponse<EncounterIPPackageServiceExclusionAttributes[]>> {
        return await this.EncounterIPPackageServiceExclusionBo.GetMinEncounterIPPackageServiceExclusions(apiReq);
    }

    public async DeleteEncounterIPPackageServiceExclusion(req: BaseRequest): Promise<Boolean> {
        return await this.EncounterIPPackageServiceExclusionBo.DeleteEncounterIPPackageServiceExclusion(req);
    }
}
