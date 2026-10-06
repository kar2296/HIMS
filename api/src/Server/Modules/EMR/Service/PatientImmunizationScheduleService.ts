import {BaseService, BoFactory } from '../../Base/Index';
import { PatientImmunizationScheduleBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { PatientImmunizationScheduleAttributes } from '../Model/Interface/Index';
import { PatientImmunizationScheduleFilters } from '../Common/Filters.e';

export class PatientImmunizationScheduleService extends BaseService {
    private PatientImmunizationScheduleBo: PatientImmunizationScheduleBo;
    constructor(req?: Request) {
        super(req);
        this.PatientImmunizationScheduleBo = BoFactory.GetBo(PatientImmunizationScheduleBo, this.Request);
    }

    public async AddPatientImmunizationSchedule(req: BaseRequest): Promise<number> {
        return await this.PatientImmunizationScheduleBo.AddPatientImmunizationSchedule(req);
    }

    public async UpdatePatientImmunizationSchedule(req: BaseRequest): Promise<boolean> {
        return await this.PatientImmunizationScheduleBo.UpdatePatientImmunizationSchedule(req);
    }

    public async GetPatientImmunizationScheduleById(req: BaseRequest): Promise<PatientImmunizationScheduleAttributes> {
        return await this.PatientImmunizationScheduleBo.GetPatientImmunizationScheduleById(req);
    }

    public async GetPatientImmunizationSchedules(apiReq?: ApiRequest<PatientImmunizationScheduleFilters>):
     Promise<ApiResponse<PatientImmunizationScheduleAttributes[]>> {
        return await this.PatientImmunizationScheduleBo.GetPatientImmunizationSchedules(apiReq);
    }

    public async DeletePatientImmunizationSchedule(req: BaseRequest): Promise<Boolean> {
        return await this.PatientImmunizationScheduleBo.DeletePatientImmunizationSchedule(req);
    }
}
