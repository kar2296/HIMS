import { BaseService, BoFactory } from '../../Base/Index';
import { PatientAdviceMedicationBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { PatientAdviceMedicationAttributes } from '../Model/Interface/Index';
import { PatientAdviceMedicationFilters } from '../Common/Filters.e';

export class PatientAdviceMedicationService extends BaseService {
    private PatientAdviceMedicationBo: PatientAdviceMedicationBo;
    constructor(req?: Request) {
        super(req);
        this.PatientAdviceMedicationBo = BoFactory.GetBo(PatientAdviceMedicationBo, this.Request);
    }

    public async AddPatientAdviceMedication(req: BaseRequest): Promise<number> {
        return await this.PatientAdviceMedicationBo.AddPatientAdviceMedication(req);
    }

    public async UpdatePatientAdviceMedication(req: BaseRequest): Promise<boolean> {
        return await this.PatientAdviceMedicationBo.UpdatePatientAdviceMedication(req);
    }

    public async GetPatientAdviceMedicationById(req: BaseRequest): Promise<PatientAdviceMedicationAttributes> {
        return await this.PatientAdviceMedicationBo.GetPatientAdviceMedicationById(req);
    }

    public async ManagePatientAdviceMedications(req: BaseRequest): Promise<boolean> {
        return await this.PatientAdviceMedicationBo.ManagePatientAdviceMedications(req);
    }

    public async GetPatientAdviceMedications(apiReq?: ApiRequest<PatientAdviceMedicationFilters>):
        Promise<ApiResponse<PatientAdviceMedicationAttributes[]>> {
        return await this.PatientAdviceMedicationBo.GetPatientAdviceMedications(apiReq);
    }

    public async DeletePatientAdviceMedication(req: BaseRequest): Promise<Boolean> {
        return await this.PatientAdviceMedicationBo.DeletePatientAdviceMedication(req);
    }
}
