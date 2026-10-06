import { BaseService, BoFactory } from '../../Base/Index';
import { PatientRheumatologyBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { PatientRheumatologyAttributes } from '../Model/Interface/Index';
import { PatientRheumatologyFilters } from '../Common/Filters.e';

export class PatientRheumatologyService extends BaseService {
    private PatientRheumatologyBo: PatientRheumatologyBo;
    constructor(req?: Request) {
        super(req);
        this.PatientRheumatologyBo = BoFactory.GetBo(PatientRheumatologyBo, this.Request);
    }

    public async AddPatientRheumatology(req: BaseRequest): Promise<number> {
        return await this.PatientRheumatologyBo.AddPatientRheumatology(req);
    }

    public async UpdatePatientRheumatology(req: BaseRequest): Promise<boolean> {
        return await this.PatientRheumatologyBo.UpdatePatientRheumatology(req);
    }

    public async GetPatientRheumatologyById(req: BaseRequest): Promise<PatientRheumatologyAttributes> {
        return await this.PatientRheumatologyBo.GetPatientRheumatologyById(req);
    }

    public async GetPatientRheumatologys(apiReq?: ApiRequest<PatientRheumatologyFilters>):
        Promise<ApiResponse<PatientRheumatologyAttributes[]>> {
        return await this.PatientRheumatologyBo.GetPatientRheumatologys(apiReq);
    }

    public async DeletePatientRheumatology(req: BaseRequest): Promise<Boolean> {
        return await this.PatientRheumatologyBo.DeletePatientRheumatology(req);
    }
}
