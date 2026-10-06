import { BaseService, BoFactory } from '../../Base/Index';
import { AssessmentBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { AssessmentAttributes } from '../Model/Interface/Index';
import { AssessmentFilters } from '../Common/Filters.e';

export class AssessmentService extends BaseService {
    private AssessmentBo: AssessmentBo;
    constructor(req?: Request) {
        super(req);
        this.AssessmentBo = BoFactory.GetBo(AssessmentBo, this.Request);
    }

    public async AddAssessment(req: BaseRequest): Promise<number> {
        return await this.AssessmentBo.AddAssessment(req);
    }

    public async UpdateAssessment(req: BaseRequest): Promise<boolean> {
        return await this.AssessmentBo.UpdateAssessment(req);
    }

    public async GetAssessmentById(req: BaseRequest): Promise<AssessmentAttributes> {
        return await this.AssessmentBo.GetAssessmentById(req);
    }

    public async GetAssessments(apiReq?: ApiRequest<AssessmentFilters>): Promise<ApiResponse<AssessmentAttributes[]>> {
        return await this.AssessmentBo.GetAssessments(apiReq);
    }

    public async DeleteAssessment(req: BaseRequest): Promise<Boolean> {
        return await this.AssessmentBo.DeleteAssessment(req);
    }
}
