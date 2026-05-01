import { BaseService, BoFactory } from '../../Base/Index';
import { ShoulderAssessmentBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request, FileInfo } from '../../../Core/Index';
import { ShoulderAssessmentAttributes } from '../Model/Interface/Index';
import { ShoulderAssessmentFilters } from '../Common/Filters.e';

export class ShoulderAssessmentService extends BaseService {
    private ShoulderAssessmentBo: ShoulderAssessmentBo;
    constructor(req?: Request) {
        super(req);
        this.ShoulderAssessmentBo = BoFactory.GetBo(ShoulderAssessmentBo, this.Request);
    }

    public async AddShoulderAssessment(req: BaseRequest): Promise<number> {
        return await this.ShoulderAssessmentBo.AddShoulderAssessment(req);
    }

    public async UpdateShoulderAssessment(req: BaseRequest): Promise<boolean> {
        return await this.ShoulderAssessmentBo.UpdateShoulderAssessment(req);
    }

    public async GetShoulderAssessmentById(req: BaseRequest): Promise<ShoulderAssessmentAttributes> {
        return await this.ShoulderAssessmentBo.GetShoulderAssessmentById(req);
    }

    public async GetShoulderAssessments(apiReq?: ApiRequest<ShoulderAssessmentFilters>):
        Promise<ApiResponse<ShoulderAssessmentAttributes[]>> {
        return await this.ShoulderAssessmentBo.GetShoulderAssessments(apiReq);
    }

    public async DeleteShoulderAssessment(req: BaseRequest): Promise<Boolean> {
        return await this.ShoulderAssessmentBo.DeleteShoulderAssessment(req);
    }

    public async PrintOrthoAssessment(req: BaseRequest): Promise<FileInfo> {
        return await this.ShoulderAssessmentBo.PrintOrthoAssessment(req);
    }
}
