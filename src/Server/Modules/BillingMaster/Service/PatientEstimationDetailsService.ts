import { BaseService, BoFactory } from '../../Base/Index';
import { PatientEstimationDetailsBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { PatientEstimationDetailsAttributes } from '../Model/Interface/Index';
import { PatientEstimationDetailsFilters } from '../Common/Filters.e';

export class PatientEstimationDetailsService extends BaseService {
    private PatientEstimationDetailsBo: PatientEstimationDetailsBo;
    constructor(req?: Request) {
        super(req);
        this.PatientEstimationDetailsBo = BoFactory.GetBo(PatientEstimationDetailsBo, this.Request);
    }

    public async AddPatientEstimationDetails(req: BaseRequest): Promise<number> {
        return await this.PatientEstimationDetailsBo.AddPatientEstimationDetails(req);
    }

    public async UpdatePatientEstimationDetails(req: BaseRequest): Promise<boolean> {
        return await this.PatientEstimationDetailsBo.UpdatePatientEstimationDetails(req);
    }

    public async GetPatientEstimationDetailsById(req: BaseRequest): Promise<PatientEstimationDetailsAttributes> {
        return await this.PatientEstimationDetailsBo.GetPatientEstimationDetailsById(req);
    }

    public async GetPatientEstimationDetails(apiReq?: ApiRequest<PatientEstimationDetailsFilters>):
        Promise<ApiResponse<PatientEstimationDetailsAttributes[]>> {
        return await this.PatientEstimationDetailsBo.GetPatientEstimationDetails(apiReq);
    }
    public async DeletePatientEstimationDetails(req: BaseRequest): Promise<Boolean> {
        return await this.PatientEstimationDetailsBo.DeletePatientEstimationDetails(req);
    }

}
