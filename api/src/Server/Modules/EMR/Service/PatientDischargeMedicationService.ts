import { BaseService, BoFactory } from '../../Base/Index';
import { PatientDischargeMedicationBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { PatientDischargeMedicationAttributes } from '../Model/Interface/Index';
import { PatientDischargeMedicationFilters } from '../Common/Filters.e';

export class PatientDischargeMedicationService extends BaseService {
    private PatientDischargeMedicationBo: PatientDischargeMedicationBo;
    constructor(req?: Request) {
        super(req);
        this.PatientDischargeMedicationBo = BoFactory.GetBo(PatientDischargeMedicationBo, this.Request);
    }

    public async AddPatientDischargeMedication(req: BaseRequest): Promise<number> {
        return await this.PatientDischargeMedicationBo.AddPatientDischargeMedication(req);
    }

    public async UpdatePatientDischargeMedication(req: BaseRequest): Promise<boolean> {
        return await this.PatientDischargeMedicationBo.UpdatePatientDischargeMedication(req);
    }
    public async ManagePatientDischargeMedication(req: BaseRequest): Promise<boolean> {
        return await this.PatientDischargeMedicationBo.ManagePatientDischargeMedication(req);
    }
    public async GetPatientDischargeMedicationById(req: BaseRequest): Promise<PatientDischargeMedicationAttributes> {
        return await this.PatientDischargeMedicationBo.GetPatientDischargeMedicationById(req);
    }

    public async GetPatientDischargeMedications(apiReq?: ApiRequest<PatientDischargeMedicationFilters>):
        Promise<ApiResponse<PatientDischargeMedicationAttributes[]>> {
        return await this.PatientDischargeMedicationBo.GetPatientDischargeMedications(apiReq);
    }

    public async DeletePatientDischargeMedication(req: BaseRequest): Promise<Boolean> {
        return await this.PatientDischargeMedicationBo.DeletePatientDischargeMedication(req);
    }
}
