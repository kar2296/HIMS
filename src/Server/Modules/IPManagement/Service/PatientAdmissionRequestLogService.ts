import { BaseService, BoFactory } from '../../Base/Index';
import { PatientAdmissionRequestLogBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { PatientAdmissionRequestLogAttributes } from '../Model/Interface/Index';
import { PatientAdmissionRequestLogFilters } from '../Common/Filters.e';

export class PatientAdmissionRequestLogService extends BaseService {
    private PatientAdmissionRequestLogBo: PatientAdmissionRequestLogBo;
    constructor(req?: Request) {
        super(req);
        this.PatientAdmissionRequestLogBo = BoFactory.GetBo(PatientAdmissionRequestLogBo, this.Request);
    }

    public async AddPatientAdmissionRequestLog(req: BaseRequest): Promise<number> {
        return await this.PatientAdmissionRequestLogBo.AddPatientAdmissionRequestLog(req);
    }

    public async UpdatePatientAdmissionRequestLog(req: BaseRequest): Promise<boolean> {
        return await this.PatientAdmissionRequestLogBo.UpdatePatientAdmissionRequestLog(req);
    }

    public async GetPatientAdmissionRequestLogById(req: BaseRequest): Promise<PatientAdmissionRequestLogAttributes> {
        return await this.PatientAdmissionRequestLogBo.GetPatientAdmissionRequestLogById(req);
    }

    public async GetPatientAdmissionRequestLogs(apiReq?: ApiRequest<PatientAdmissionRequestLogFilters>):
    Promise<ApiResponse<PatientAdmissionRequestLogAttributes[]>> {
        return await this.PatientAdmissionRequestLogBo.GetPatientAdmissionRequestLogs(apiReq);
    }

    public async DeletePatientAdmissionRequestLog(req: BaseRequest): Promise<Boolean> {
        return await this.PatientAdmissionRequestLogBo.DeletePatientAdmissionRequestLog(req);
    }
}
