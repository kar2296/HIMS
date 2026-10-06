import { BaseService, BoFactory } from '../../Base/Index';
import { EncounterIPPackageServiceNonMedicalBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { EncounterIPPackageServiceNonMedicalAttributes } from '../Model/Interface/Index';
import { EncounterIPPackageServiceNonMedicalFilters } from '../Common/Filters.e';

export class EncounterIPPackageServiceNonMedicalService extends BaseService {
    private EncounterIPPackageServiceNonMedicalBo: EncounterIPPackageServiceNonMedicalBo;
    constructor(req?: Request) {
        super(req);
        this.EncounterIPPackageServiceNonMedicalBo = BoFactory.GetBo(EncounterIPPackageServiceNonMedicalBo, this.Request);
    }

    public async AddEncounterIPPackageServiceNonMedical(req: BaseRequest): Promise<number> {
        return await this.EncounterIPPackageServiceNonMedicalBo.AddEncounterIPPackageServiceNonMedical(req);
    }

    public async UpdateEncounterIPPackageServiceNonMedical(req: BaseRequest): Promise<boolean> {
        return await this.EncounterIPPackageServiceNonMedicalBo.UpdateEncounterIPPackageServiceNonMedical(req);
    }

    public async GetEncounterIPPackageServiceNonMedicalById(req: BaseRequest):
        Promise<EncounterIPPackageServiceNonMedicalAttributes> {
        return await this.EncounterIPPackageServiceNonMedicalBo.GetEncounterIPPackageServiceNonMedicalById(req);
    }

    public async GetEncounterIPPackageServiceNonMedicals(apiReq?: ApiRequest<EncounterIPPackageServiceNonMedicalFilters>):
        Promise<ApiResponse<EncounterIPPackageServiceNonMedicalAttributes[]>> {
        return await this.EncounterIPPackageServiceNonMedicalBo.GetEncounterIPPackageServiceNonMedicals(apiReq);
    }

    public async DeleteEncounterIPPackageServiceNonMedical(req: BaseRequest): Promise<Boolean> {
        return await this.EncounterIPPackageServiceNonMedicalBo.DeleteEncounterIPPackageServiceNonMedical(req);
    }
}
