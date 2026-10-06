import {BaseService, BoFactory } from '../../Base/Index';
import { PatientDeathBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { PatientDeathAttributes } from '../Model/Interface/Index';
import { PatientDeathFilters } from '../Common/Filters.e';

export class PatientDeathService extends BaseService {
    private PatientDeathBo: PatientDeathBo;
    constructor(req?: Request) {
        super(req);
        this.PatientDeathBo = BoFactory.GetBo(PatientDeathBo, this.Request);
    }

    public async AddPatientDeath(req: BaseRequest): Promise<number> {
        return await this.PatientDeathBo.AddPatientDeath(req);
    }

    public async UpdatePatientDeath(req: BaseRequest): Promise<boolean> {
        return await this.PatientDeathBo.UpdatePatientDeath(req);
    }

    public async GetPatientDeathById(req: BaseRequest): Promise<PatientDeathAttributes> {
        return await this.PatientDeathBo.GetPatientDeathById(req);
    }

    public async GetPatientDeaths(apiReq?: ApiRequest<PatientDeathFilters>):
     Promise<ApiResponse<PatientDeathAttributes[]>> {
        return await this.PatientDeathBo.GetPatientDeaths(apiReq);
    }

    public async DeletePatientDeath(req: BaseRequest): Promise<Boolean> {
        return await this.PatientDeathBo.DeletePatientDeath(req);
    }
}
