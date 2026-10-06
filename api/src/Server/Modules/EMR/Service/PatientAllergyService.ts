import {BaseService, BoFactory } from '../../Base/Index';
import { PatientAllergyBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { PatientAllergyAttributes } from '../Model/Interface/Index';
import { PatientAllergyFilters } from '../Common/Filters.e';

export class PatientAllergyService extends BaseService {
    private PatientAllergyBo: PatientAllergyBo;
    constructor(req?: Request) {
        super(req);
        this.PatientAllergyBo = BoFactory.GetBo(PatientAllergyBo, this.Request);
    }

    public async AddPatientAllergy(req: BaseRequest): Promise<number> {
        return await this.PatientAllergyBo.AddPatientAllergy(req);
    }

    public async UpdatePatientAllergy(req: BaseRequest): Promise<boolean> {
        return await this.PatientAllergyBo.UpdatePatientAllergy(req);
    }

    public async ManagePatientAllergys(req: BaseRequest): Promise<boolean> {
        return await this.PatientAllergyBo.ManagePatientAllergys(req);
    }

    public async GetPatientAllergyById(req: BaseRequest): Promise<PatientAllergyAttributes> {
        return await this.PatientAllergyBo.GetPatientAllergyById(req);
    }

    public async GetPatientAllergys(apiReq?: ApiRequest<PatientAllergyFilters>): Promise<ApiResponse<PatientAllergyAttributes[]>> {
        return await this.PatientAllergyBo.GetPatientAllergys(apiReq);
    }

    public async DeletePatientAllergy(req: BaseRequest): Promise<Boolean> {
        return await this.PatientAllergyBo.DeletePatientAllergy(req);
    }
}
