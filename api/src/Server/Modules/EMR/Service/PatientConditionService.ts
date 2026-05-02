import {BaseService, BoFactory } from '../../Base/Index';
import { PatientConditionBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { PatientConditionAttributes } from '../Model/Interface/Index';
import { PatientConditionFilters } from '../Common/Filters.e';

export class PatientConditionService extends BaseService {
    private PatientConditionBo: PatientConditionBo;
    constructor(req?: Request) {
        super(req);
        this.PatientConditionBo = BoFactory.GetBo(PatientConditionBo, this.Request);
    }

    public async AddPatientCondition(req: BaseRequest): Promise<number> {
        return await this.PatientConditionBo.AddPatientCondition(req);
    }

    public async UpdatePatientCondition(req: BaseRequest): Promise<boolean> {
        return await this.PatientConditionBo.UpdatePatientCondition(req);
    }

    public async GetPatientConditionById(req: BaseRequest): Promise<PatientConditionAttributes> {
        return await this.PatientConditionBo.GetPatientConditionById(req);
    }

    public async ManagePatientConditions(req: BaseRequest): Promise<boolean> {
        return await this.PatientConditionBo.ManagePatientConditions(req);
    }

    public async GetPatientConditions(apiReq?: ApiRequest<PatientConditionFilters>): Promise<ApiResponse<PatientConditionAttributes[]>> {
        return await this.PatientConditionBo.GetPatientConditions(apiReq);
    }

    public async DeletePatientCondition(req: BaseRequest): Promise<Boolean> {
        return await this.PatientConditionBo.DeletePatientCondition(req);
    }
}
