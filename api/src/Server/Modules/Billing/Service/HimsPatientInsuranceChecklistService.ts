import { BaseService, BoFactory } from '../../Base/Index';
import { PatientInsuranceChecklistBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { PatientInsuranceChecklistAttributes } from '../Model/Interface/Index';
import { PatientInsuranceChecklistFilters } from '../Common/Filters.e';

export class PatientInsuranceChecklistService extends BaseService {
    private PatientInsuranceChecklistBo: PatientInsuranceChecklistBo;
    constructor(req?: Request) {
        super(req);
        this.PatientInsuranceChecklistBo = BoFactory.GetBo(PatientInsuranceChecklistBo, this.Request);
    }

    public async AddPatientInsuranceChecklist(req: BaseRequest): Promise<number> {
        return await this.PatientInsuranceChecklistBo.AddPatientInsuranceChecklist(req);
    }

    public async UpdatePatientInsuranceChecklist(req: BaseRequest): Promise<boolean> {
        return await this.PatientInsuranceChecklistBo.UpdatePatientInsuranceChecklist(req);
    }

    public async ManagePatientInsuranceChecklist(req: BaseRequest): Promise<boolean> {
        return await this.PatientInsuranceChecklistBo.ManagePatientInsuranceChecklist(req);
    }

    public async GetPatientInsuranceChecklistById(req: BaseRequest): Promise<PatientInsuranceChecklistAttributes> {
        return await this.PatientInsuranceChecklistBo.GetPatientInsuranceChecklistById(req);
    }

    public async GetPatientInsuranceChecklists(apiReq?: ApiRequest<PatientInsuranceChecklistFilters>):
        Promise<ApiResponse<PatientInsuranceChecklistAttributes[]>> {
        return await this.PatientInsuranceChecklistBo.GetPatientInsuranceChecklists(apiReq);
    }
    public async DeletePatientInsuranceChecklist(req: BaseRequest): Promise<Boolean> {
        return await this.PatientInsuranceChecklistBo.DeletePatientInsuranceChecklist(req);
    }
}
