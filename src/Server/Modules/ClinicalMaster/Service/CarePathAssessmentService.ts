import { BaseService, BoFactory } from '../../Base/Index';
import { CarePathAssessmentBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { CarePathAssessmentAttributes } from '../Model/Interface/Index';
import { CarePathAssessmentFilters } from '../Common/Filters.e';

export class CarePathAssessmentService extends BaseService {
    private CarePathAssessmentBo: CarePathAssessmentBo;
    constructor(req?: Request) {
        super(req);
        this.CarePathAssessmentBo = BoFactory.GetBo(CarePathAssessmentBo, this.Request);
    }

    public async AddCarePathAssessment(req: BaseRequest): Promise<number> {
        return await this.CarePathAssessmentBo.AddCarePathAssessment(req);
    }

    public async UpdateCarePathAssessment(req: BaseRequest): Promise<boolean> {
        return await this.CarePathAssessmentBo.UpdateCarePathAssessment(req);
    }

    public async GetCarePathAssessmentById(req: BaseRequest): Promise<CarePathAssessmentAttributes> {
        return await this.CarePathAssessmentBo.GetCarePathAssessmentById(req);
    }

    public async GetCarePathAssessments(apiReq?: ApiRequest<CarePathAssessmentFilters>):
        Promise<ApiResponse<CarePathAssessmentAttributes[]>> {
        return await this.CarePathAssessmentBo.GetCarePathAssessments(apiReq);
    }

    public async DeleteCarePathAssessment(req: BaseRequest): Promise<Boolean> {
        return await this.CarePathAssessmentBo.DeleteCarePathAssessment(req);
    }
}
