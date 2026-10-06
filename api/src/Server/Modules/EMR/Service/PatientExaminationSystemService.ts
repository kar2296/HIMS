import {BaseService, BoFactory } from '../../Base/Index';
import { PatientExaminationSystemBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { PatientExaminationSystemAttributes } from '../Model/Interface/Index';
import { PatientExaminationSystemFilters } from '../Common/Filters.e';

export class PatientExaminationSystemService extends BaseService {
    private PatientExaminationSystemBo: PatientExaminationSystemBo;
    constructor(req?: Request) {
        super(req);
        this.PatientExaminationSystemBo = BoFactory.GetBo(PatientExaminationSystemBo, this.Request);
    }

    public async AddPatientExaminationSystem(req: BaseRequest): Promise<number> {
        return await this.PatientExaminationSystemBo.AddPatientExaminationSystem(req);
    }

    public async UpdatePatientExaminationSystem(req: BaseRequest): Promise<boolean> {
        return await this.PatientExaminationSystemBo.UpdatePatientExaminationSystem(req);
    }

    public async GetPatientExaminationSystemById(req: BaseRequest): Promise<PatientExaminationSystemAttributes> {
        return await this.PatientExaminationSystemBo.GetPatientExaminationSystemById(req);
    }

    public async ManagePatientExaminationSystems(req: BaseRequest): Promise<boolean> {
        return await this.PatientExaminationSystemBo.ManagePatientExaminationSystems(req);
    }

    public async GetPatientExaminationSystems(apiReq?: ApiRequest<PatientExaminationSystemFilters>):
                Promise<ApiResponse<PatientExaminationSystemAttributes[]>> {
        return await this.PatientExaminationSystemBo.GetPatientExaminationSystems(apiReq);
    }

    public async DeletePatientExaminationSystem(req: BaseRequest): Promise<Boolean> {
        return await this.PatientExaminationSystemBo.DeletePatientExaminationSystem(req);
    }
}
