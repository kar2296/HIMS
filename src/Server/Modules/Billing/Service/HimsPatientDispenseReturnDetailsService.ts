import { BaseService, BoFactory } from '../../Base/Index';
import { PatientDispenseReturnDetailsBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { PatientDispenseReturnDetailsAttributes } from '../Model/Interface/Index';
import { PatientDispenseReturnDetailFilters } from '../Common/Filters.e';

export class PatientDispenseReturnDetailsService extends BaseService {
    private PatientDispenseReturnDetailsBo: PatientDispenseReturnDetailsBo;
    constructor(req?: Request) {
        super(req);
        this.PatientDispenseReturnDetailsBo = BoFactory.GetBo(PatientDispenseReturnDetailsBo, this.Request);
    }

    public async AddPatientDispenseReturnDetails(req: BaseRequest): Promise<number> {
        return await this.PatientDispenseReturnDetailsBo.AddPatientDispenseReturnDetails(req);
    }

    public async UpdatePatientDispenseReturnDetails(req: BaseRequest): Promise<boolean> {
        return await this.PatientDispenseReturnDetailsBo.UpdatePatientDispenseReturnDetails(req);
    }

    public async GetPatientDispenseReturnDetailsById(req: BaseRequest): Promise<PatientDispenseReturnDetailsAttributes> {
        return await this.PatientDispenseReturnDetailsBo.GetPatientDispenseReturnDetailsById(req);
    }

    public async GetPatientDispenseReturnDetails(apiReq?: ApiRequest<PatientDispenseReturnDetailFilters>):
        Promise<ApiResponse<PatientDispenseReturnDetailsAttributes[]>> {
        return await this.PatientDispenseReturnDetailsBo.GetPatientDispenseReturnDetails(apiReq);
    }

    public async DeletePatientDispenseReturnDetails(req: BaseRequest): Promise<Boolean> {
        return await this.PatientDispenseReturnDetailsBo.DeletePatientDispenseReturnDetails(req);
    }
}
