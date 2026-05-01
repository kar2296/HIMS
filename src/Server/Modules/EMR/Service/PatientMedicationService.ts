import {BaseService, BoFactory } from '../../Base/Index';
import { PatientMedicationBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { PatientMedicationAttributes } from '../Model/Interface/Index';
import { PatientMedicationFilters } from '../Common/Filters.e';

export class PatientMedicationService extends BaseService {
    private PatientMedicationBo: PatientMedicationBo;
    constructor(req?: Request) {
        super(req);
        this.PatientMedicationBo = BoFactory.GetBo(PatientMedicationBo, this.Request);
    }

    public async AddPatientMedication(req: BaseRequest): Promise<number> {
        return await this.PatientMedicationBo.AddPatientMedication(req);
    }

    public async UpdatePatientMedication(req: BaseRequest): Promise<boolean> {
        return await this.PatientMedicationBo.UpdatePatientMedication(req);
    }

    public async GetPatientMedicationById(req: BaseRequest): Promise<PatientMedicationAttributes> {
        return await this.PatientMedicationBo.GetPatientMedicationById(req);
    }

    public async GetPatientMedications(apiReq?: ApiRequest<PatientMedicationFilters>): Promise<ApiResponse<PatientMedicationAttributes[]>> {
        return await this.PatientMedicationBo.GetPatientMedications(apiReq);
    }

    public async DeletePatientMedication(req: BaseRequest): Promise<Boolean> {
        return await this.PatientMedicationBo.DeletePatientMedication(req);
    }
}
