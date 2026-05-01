import {BaseService, BoFactory } from '../../Base/Index';
import { PatientSurgicalBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { PatientSurgicalAttributes } from '../Model/Interface/Index';
import { PatientSurgicalFilters } from '../Common/Filters.e';

export class PatientSurgicalService extends BaseService {
    private PatientSurgicalBo: PatientSurgicalBo;
    constructor(req?: Request) {
        super(req);
        this.PatientSurgicalBo = BoFactory.GetBo(PatientSurgicalBo, this.Request);
    }

    public async AddPatientSurgical(req: BaseRequest): Promise<number> {
        return await this.PatientSurgicalBo.AddPatientSurgical(req);
    }

    public async UpdatePatientSurgical(req: BaseRequest): Promise<boolean> {
        return await this.PatientSurgicalBo.UpdatePatientSurgical(req);
    }

    public async GetPatientSurgicalById(req: BaseRequest): Promise<PatientSurgicalAttributes> {
        return await this.PatientSurgicalBo.GetPatientSurgicalById(req);
    }

    public async ManagePatientSurgicals(req: BaseRequest): Promise<boolean> {
        return await this.PatientSurgicalBo.ManagePatientSurgicals(req);
    }

    public async GetPatientSurgicals(apiReq?: ApiRequest<PatientSurgicalFilters>): Promise<ApiResponse<PatientSurgicalAttributes[]>> {
        return await this.PatientSurgicalBo.GetPatientSurgicals(apiReq);
    }

    public async DeletePatientSurgical(req: BaseRequest): Promise<Boolean> {
        return await this.PatientSurgicalBo.DeletePatientSurgical(req);
    }
}
