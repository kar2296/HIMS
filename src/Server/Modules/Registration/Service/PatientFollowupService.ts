import { BaseService, BoFactory } from '../../Base/Index';
import { PatientFollowupBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { PatientFollowupAttributes } from '../Model/Interface/Index';
import { PatientFollowupFilters } from '../Common/Filters.e';

export class PatientFollowupService extends BaseService {
    private PatientFollowupBo: PatientFollowupBo;
    constructor(req?: Request) {
        super(req);
        this.PatientFollowupBo = BoFactory.GetBo(PatientFollowupBo, this.Request);
    }

    public async AddPatientFollowup(req: BaseRequest): Promise<number> {
        return await this.PatientFollowupBo.AddPatientFollowup(req);
    }

    public async UpdatePatientFollowup(req: BaseRequest): Promise<boolean> {
        return await this.PatientFollowupBo.UpdatePatientFollowup(req);
    }

    public async ManagePatientFollowups(req: BaseRequest): Promise<boolean> {
        return await this.PatientFollowupBo.ManagePatientFollowups(req);
    }

    public async GetPatientFollowupById(req: BaseRequest): Promise<PatientFollowupAttributes> {
        return await this.PatientFollowupBo.GetPatientFollowupById(req);
    }

    public async GetPatientFollowups(apiReq?: ApiRequest<PatientFollowupFilters>):
        Promise<ApiResponse<PatientFollowupAttributes[]>> {
        return await this.PatientFollowupBo.GetPatientFollowups(apiReq);
    }

    public async DeletePatientFollowup(req: BaseRequest): Promise<Boolean> {
        return await this.PatientFollowupBo.DeletePatientFollowup(req);
    }
}
