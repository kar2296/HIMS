import {BaseService, BoFactory } from '../../Base/Index';
import { PatientDiagnosisBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { PatientDiagnosisAttributes } from '../Model/Interface/Index';
import { PatientDiagnosisFilters } from '../Common/Filters.e';

export class PatientDiagnosisService extends BaseService {
    private PatientDiagnosisBo: PatientDiagnosisBo;
    constructor(req?: Request) {
        super(req);
        this.PatientDiagnosisBo = BoFactory.GetBo(PatientDiagnosisBo, this.Request);
    }

    public async AddPatientDiagnosis(req: BaseRequest): Promise<number> {
        return await this.PatientDiagnosisBo.AddPatientDiagnosis(req);
    }

    public async UpdatePatientDiagnosis(req: BaseRequest): Promise<boolean> {
        return await this.PatientDiagnosisBo.UpdatePatientDiagnosis(req);
    }

    public async GetPatientDiagnosisById(req: BaseRequest): Promise<PatientDiagnosisAttributes> {
        return await this.PatientDiagnosisBo.GetPatientDiagnosisById(req);
    }

    public async ManagePatientDiagnosiss(req: BaseRequest): Promise<boolean> {
        return await this.PatientDiagnosisBo.ManagePatientDiagnosiss(req);
    }

    public async GetPatientDiagnosiss(apiReq?: ApiRequest<PatientDiagnosisFilters>): Promise<ApiResponse<PatientDiagnosisAttributes[]>> {
        return await this.PatientDiagnosisBo.GetPatientDiagnosiss(apiReq);
    }

    public async DeletePatientDiagnosis(req: BaseRequest): Promise<Boolean> {
        return await this.PatientDiagnosisBo.DeletePatientDiagnosis(req);
    }
}
