import { BaseService, BoFactory } from '../../Base/Index';
import { PatientEmarDetailsBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { PatientEmarDetailsAttributes } from '../Model/Interface/Index';
import { PatientEmarDetailsFilters } from '../Common/Filters.e';

export class PatientEmarDetailsService extends BaseService {
    private PatientEmarDetailsBo: PatientEmarDetailsBo;
    constructor(req?: Request) {
        super(req);
        this.PatientEmarDetailsBo = BoFactory.GetBo(PatientEmarDetailsBo, this.Request);
    }

    public async AddPatientEmarDetails(req: BaseRequest): Promise<number> {
        return await this.PatientEmarDetailsBo.AddPatientEmarDetails(req);
    }

    public async UpdatePatientEmarDetails(req: BaseRequest): Promise<boolean> {
        return await this.PatientEmarDetailsBo.UpdatePatientEmarDetails(req);
    }

    public async GetPatientEmarDetailsById(req: BaseRequest): Promise<PatientEmarDetailsAttributes> {
        return await this.PatientEmarDetailsBo.GetPatientEmarDetailsById(req);
    }

    public async GetPatientEmarDetailss(apiReq?: ApiRequest<PatientEmarDetailsFilters>):
        Promise<ApiResponse<PatientEmarDetailsAttributes[]>> {
        return await this.PatientEmarDetailsBo.GetPatientEmarDetailss(apiReq);
    }

    public async DeletePatientEmarDetails(req: BaseRequest): Promise<Boolean> {
        return await this.PatientEmarDetailsBo.DeletePatientEmarDetails(req);
    }
}
