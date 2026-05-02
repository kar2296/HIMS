import { BaseService, BoFactory } from '../../Base/Index';
import { PatientFeedbackDetailsBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { PatientFeedbackDetailsAttributes } from '../Model/Interface/Index';
import { PatientFeedbackDetailsFilters } from '../Common/Filters.e';

export class PatientFeedbackDetailsService extends BaseService {
    private PatientFeedbackDetailsBo: PatientFeedbackDetailsBo;
    constructor(req?: Request) {
        super(req);
        this.PatientFeedbackDetailsBo = BoFactory.GetBo(PatientFeedbackDetailsBo, this.Request);
    }

    public async AddPatientFeedbackDetails(req: BaseRequest): Promise<number> {
        return await this.PatientFeedbackDetailsBo.AddPatientFeedbackDetails(req);
    }

    public async UpdatePatientFeedbackDetails(req: BaseRequest): Promise<boolean> {
        return await this.PatientFeedbackDetailsBo.UpdatePatientFeedbackDetails(req);
    }

    public async ManagePatientFeedbackDetails(req: BaseRequest): Promise<PatientFeedbackDetailsAttributes> {
        return await this.PatientFeedbackDetailsBo.GetPatientFeedbackDetailsById(req);
    }

    public async GetPatientFeedbackDetailsById(req: BaseRequest): Promise<PatientFeedbackDetailsAttributes> {
        return await this.PatientFeedbackDetailsBo.GetPatientFeedbackDetailsById(req);
    }

    public async GetPatientFeedbackDetails(apiReq?: ApiRequest<PatientFeedbackDetailsFilters>
    ): Promise<ApiResponse<PatientFeedbackDetailsAttributes[]>> {
        return await this.PatientFeedbackDetailsBo.GetPatientFeedbackDetails(apiReq);
    }

    public async GetPatientFeedbackSummary(apiReq?: ApiRequest<PatientFeedbackDetailsFilters>
    ): Promise<ApiResponse<PatientFeedbackDetailsAttributes[]>> {
        return await this.PatientFeedbackDetailsBo.GetPatientFeedbackSummary(apiReq);
    }
    public async PrintPatientFeedbacksummaryforop(apiReq?: ApiRequest<PatientFeedbackDetailsFilters>): Promise<any> {
        return await this.PatientFeedbackDetailsBo.PrintPatientFeedbacksummaryforop(apiReq);
    }
    public async PrintPatientFeedbacksummaryforip(apiReq?: ApiRequest<PatientFeedbackDetailsFilters>): Promise<any> {
        return await this.PatientFeedbackDetailsBo.PrintPatientFeedbacksummaryforip(apiReq);
    }
    public async DeletePatientFeedbackDetails(req: BaseRequest): Promise<Boolean> {
        return await this.PatientFeedbackDetailsBo.DeletePatientFeedbackDetails(req);
    }
}
