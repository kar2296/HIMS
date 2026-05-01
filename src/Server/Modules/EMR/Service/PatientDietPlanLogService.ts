import { BaseService, BoFactory } from '../../Base/Index';
import { PatientDietPlanLogBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { PatientDietPlanLogAttributes } from '../Model/Interface/Index';
import { PatientDietPlanLogFilters } from '../Common/Filters.e';

export class PatientDietPlanLogService extends BaseService {
    private PatientDietPlanLogBo: PatientDietPlanLogBo;
    constructor(req?: Request) {
        super(req);
        this.PatientDietPlanLogBo = BoFactory.GetBo(PatientDietPlanLogBo, this.Request);
    }

    public async AddPatientDietPlanLog(req: BaseRequest): Promise<number> {
        return await this.PatientDietPlanLogBo.AddPatientDietPlanLog(req);
    }

    public async UpdatePatientDietPlanLog(req: BaseRequest): Promise<boolean> {
        return await this.PatientDietPlanLogBo.UpdatePatientDietPlanLog(req);
    }

    public async GetPatientDietPlanLogById(req: BaseRequest): Promise<PatientDietPlanLogAttributes> {
        return await this.PatientDietPlanLogBo.GetPatientDietPlanLogById(req);
    }

    public async GetPatientDietPlanLogs(apiReq?: ApiRequest<PatientDietPlanLogFilters>):
        Promise<ApiResponse<PatientDietPlanLogAttributes[]>> {
        return await this.PatientDietPlanLogBo.GetPatientDietPlanLogs(apiReq);
    }

    public async DeletePatientDietPlanLog(req: BaseRequest): Promise<Boolean> {
        return await this.PatientDietPlanLogBo.DeletePatientDietPlanLog(req);
    }
}
