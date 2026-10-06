import { BaseService, BoFactory } from '../../Base/Index';
import { PatientEmarBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { PatientEmarAttributes } from '../Model/Interface/Index';
import { PatientEmarFilters } from '../Common/Filters.e';

export class PatientEmarService extends BaseService {
    private PatientEmarBo: PatientEmarBo;
    constructor(req?: Request) {
        super(req);
        this.PatientEmarBo = BoFactory.GetBo(PatientEmarBo, this.Request);
    }

    public async AddPatientEmar(req: BaseRequest): Promise<number> {
        return await this.PatientEmarBo.AddPatientEmar(req);
    }

    public async UpdatePatientEmar(req: BaseRequest): Promise<boolean> {
        return await this.PatientEmarBo.UpdatePatientEmar(req);
    }

    public async GetPatientEmarById(req: BaseRequest): Promise<PatientEmarAttributes> {
        return await this.PatientEmarBo.GetPatientEmarById(req);
    }

    public async GetPatientEmars(apiReq?: ApiRequest<PatientEmarFilters>): Promise<ApiResponse<PatientEmarAttributes[]>> {
        return await this.PatientEmarBo.GetPatientEmars(apiReq);
    }

    public async DeletePatientEmar(req: BaseRequest): Promise<Boolean> {
        return await this.PatientEmarBo.DeletePatientEmar(req);
    }

}
