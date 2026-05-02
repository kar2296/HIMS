import { BaseService, BoFactory } from '../../Base/Index';
import { PatientNotifiableDiseaseBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { PatientNotifiableDiseaseAttributes } from '../Model/Interface/Index';
import { PatientNotifiableDiseaseFilters } from '../Common/Filters.e';

export class PatientNotifiableDiseaseService extends BaseService {
    private PatientNotifiableDiseaseBo: PatientNotifiableDiseaseBo;
    constructor(req?: Request) {
        super(req);
        this.PatientNotifiableDiseaseBo = BoFactory.GetBo(PatientNotifiableDiseaseBo, this.Request);
    }

    public async AddPatientNotifiableDisease(req: BaseRequest): Promise<number> {
        return await this.PatientNotifiableDiseaseBo.AddPatientNotifiableDisease(req);
    }

    public async UpdatePatientNotifiableDisease(req: BaseRequest): Promise<boolean> {
        return await this.PatientNotifiableDiseaseBo.UpdatePatientNotifiableDisease(req);
    }

    public async GetPatientNotifiableDiseaseById(req: BaseRequest): Promise<PatientNotifiableDiseaseAttributes> {
        return await this.PatientNotifiableDiseaseBo.GetPatientNotifiableDiseaseById(req);
    }

    public async ManagePatientNotifiableDiseases(req: BaseRequest): Promise<boolean> {
        return await this.PatientNotifiableDiseaseBo.ManagePatientNotifiableDiseases(req);
    }

    public async GetPatientNotifiableDiseases(apiReq?: ApiRequest<PatientNotifiableDiseaseFilters>):
        Promise<ApiResponse<PatientNotifiableDiseaseAttributes[]>> {
        return await this.PatientNotifiableDiseaseBo.GetPatientNotifiableDiseases(apiReq);
    }

    public async DeletePatientNotifiableDisease(req: BaseRequest): Promise<Boolean> {
        return await this.PatientNotifiableDiseaseBo.DeletePatientNotifiableDisease(req);
    }
}
