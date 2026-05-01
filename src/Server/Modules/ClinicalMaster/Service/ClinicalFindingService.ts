import { BaseService, BoFactory } from '../../Base/Index';
import { ClinicalFindingBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { ClinicalFindingAttributes } from '../Model/Interface/Index';
import { ClinicalFindingFilters } from '../Common/Filters.e';

export class ClinicalFindingService extends BaseService {
    private ClinicalFindingBo: ClinicalFindingBo;
    constructor(req?: Request) {
        super(req);
        this.ClinicalFindingBo = BoFactory.GetBo(ClinicalFindingBo, this.Request);
    }

    public async AddClinicalFinding(req: BaseRequest): Promise<number> {
        return await this.ClinicalFindingBo.AddClinicalFinding(req);
    }

    public async UpdateClinicalFinding(req: BaseRequest): Promise<boolean> {
        return await this.ClinicalFindingBo.UpdateClinicalFinding(req);
    }

    public async GetClinicalFindingById(req: BaseRequest): Promise<ClinicalFindingAttributes> {
        return await this.ClinicalFindingBo.GetClinicalFindingById(req);
    }

    public async GetClinicalFindings(apiReq?: ApiRequest<ClinicalFindingFilters>):
        Promise<ApiResponse<ClinicalFindingAttributes[]>> {
        return await this.ClinicalFindingBo.GetClinicalFindings(apiReq);
    }

    public async DeleteClinicalFinding(req: BaseRequest): Promise<Boolean> {
        return await this.ClinicalFindingBo.DeleteClinicalFinding(req);
    }
}
