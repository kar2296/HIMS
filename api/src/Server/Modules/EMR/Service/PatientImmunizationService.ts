import {BaseService, BoFactory } from '../../Base/Index';
import { PatientImmunizationBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { PatientImmunizationAttributes } from '../Model/Interface/Index';
import { PatientImmunizationFilters } from '../Common/Filters.e';

export class PatientImmunizationService extends BaseService {
    private PatientImmunizationBo: PatientImmunizationBo;
    constructor(req?: Request) {
        super(req);
        this.PatientImmunizationBo = BoFactory.GetBo(PatientImmunizationBo, this.Request);
    }

    public async AddPatientImmunization(req: BaseRequest): Promise<number> {
        return await this.PatientImmunizationBo.AddPatientImmunization(req);
    }

    public async UpdatePatientImmunization(req: BaseRequest): Promise<boolean> {
        return await this.PatientImmunizationBo.UpdatePatientImmunization(req);
    }

    public async GetPatientImmunizationById(req: BaseRequest): Promise<PatientImmunizationAttributes> {
        return await this.PatientImmunizationBo.GetPatientImmunizationById(req);
    }

    public async ManagePatientImmunizations(req: BaseRequest): Promise<boolean> {
        return await this.PatientImmunizationBo.ManagePatientImmunizations(req);
    }

    public async GetPatientImmunizations(apiReq?: ApiRequest<PatientImmunizationFilters>):
            Promise<ApiResponse<PatientImmunizationAttributes[]>> {
        return await this.PatientImmunizationBo.GetPatientImmunizations(apiReq);
    }

    public async DeletePatientImmunization(req: BaseRequest): Promise<Boolean> {
        return await this.PatientImmunizationBo.DeletePatientImmunization(req);
    }
}
