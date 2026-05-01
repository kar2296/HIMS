import { BaseService, BoFactory } from '../../Base/Index';
import { PatientCommentBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { PatientCommentAttributes } from '../Model/Interface/Index';
import { PatientCommentFilters } from '../Common/Filters.e';

export class PatientCommentService extends BaseService {
    private PatientCommentBo: PatientCommentBo;
    constructor(req?: Request) {
        super(req);
        this.PatientCommentBo = BoFactory.GetBo(PatientCommentBo, this.Request);
    }

    public async AddPatientComment(req: BaseRequest): Promise<number> {
        return await this.PatientCommentBo.AddPatientComment(req);
    }

    public async UpdatePatientComment(req: BaseRequest): Promise<boolean> {
        return await this.PatientCommentBo.UpdatePatientComment(req);
    }

    public async GetPatientCommentById(req: BaseRequest): Promise<PatientCommentAttributes> {
        return await this.PatientCommentBo.GetPatientCommentById(req);
    }

    public async GetPatientComments(apiReq?: ApiRequest<PatientCommentFilters>): Promise<ApiResponse<PatientCommentAttributes[]>> {
        return await this.PatientCommentBo.GetPatientComments(apiReq);
    }

    public async DeletePatientComment(req: BaseRequest): Promise<Boolean> {
        return await this.PatientCommentBo.DeletePatientComment(req);
    }
}
