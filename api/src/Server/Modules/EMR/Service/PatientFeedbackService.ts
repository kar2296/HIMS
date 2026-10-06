import {BaseService, BoFactory } from '../../Base/Index';
import { PatientFeedbackBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { PatientFeedbackAttributes } from '../Model/Interface/Index';
import { PatientFeedbackFilters } from '../Common/Filters.e';

export class PatientFeedbackService extends BaseService {
    private PatientFeedbackBo: PatientFeedbackBo;
    constructor(req?: Request) {
        super(req);
        this.PatientFeedbackBo = BoFactory.GetBo(PatientFeedbackBo, this.Request);
    }

    public async AddPatientFeedback(req: BaseRequest): Promise<number> {
        return await this.PatientFeedbackBo.AddPatientFeedback(req);
    }

    public async UpdatePatientFeedback(req: BaseRequest): Promise<boolean> {
        return await this.PatientFeedbackBo.UpdatePatientFeedback(req);
    }
    public async GetFeedbackSignPic(req: BaseRequest): Promise<PatientFeedbackAttributes> {
        return await this.PatientFeedbackBo.GetFeedbackSignPic(req);
    }
    public async GetPatientFeedbackById(req: BaseRequest): Promise<PatientFeedbackAttributes> {
        return await this.PatientFeedbackBo.GetPatientFeedbackById(req);
    }

    public async GetPatientFeedbacks(apiReq?: ApiRequest<PatientFeedbackFilters>): Promise<ApiResponse<PatientFeedbackAttributes[]>> {
        return await this.PatientFeedbackBo.GetPatientFeedbacks(apiReq);
    }

    public async DeletePatientFeedback(req: BaseRequest): Promise<Boolean> {
        return await this.PatientFeedbackBo.DeletePatientFeedback(req);
    }
}
