import { BaseService, BoFactory } from '../../Base/Index';
import { PatientAdmissionLogBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { PatientAdmissionLogAttributes } from '../Model/Interface/Index';
import { PatientAdmissionLogFilters } from '../Common/Filters.e';

export class PatientAdmissionLogService extends BaseService {
    private PatientAdmissionLogBo: PatientAdmissionLogBo;
    constructor(req?: Request) {
        super(req);
        this.PatientAdmissionLogBo = BoFactory.GetBo(PatientAdmissionLogBo, this.Request);
    }

    public async AddPatientAdmissionLog(req: BaseRequest): Promise<number> {
        return await this.PatientAdmissionLogBo.AddPatientAdmissionLog(req);
    }

    public async UpdatePatientAdmissionLog(req: BaseRequest): Promise<boolean> {
        return await this.PatientAdmissionLogBo.UpdatePatientAdmissionLog(req);
    }

    public async GetPatientAdmissionLogById(req: BaseRequest): Promise<PatientAdmissionLogAttributes> {
        return await this.PatientAdmissionLogBo.GetPatientAdmissionLogById(req);
    }

    public async GetPatientAdmissionLogs(apiReq?: ApiRequest<PatientAdmissionLogFilters>):
    Promise<ApiResponse<PatientAdmissionLogAttributes[]>> {
        return await this.PatientAdmissionLogBo.GetPatientAdmissionLogs(apiReq);
    }

    public async DeletePatientAdmissionLog(req: BaseRequest): Promise<Boolean> {
        return await this.PatientAdmissionLogBo.DeletePatientAdmissionLog(req);
    }
}
