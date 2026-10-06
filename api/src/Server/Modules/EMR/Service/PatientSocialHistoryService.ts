import {BaseService, BoFactory } from '../../Base/Index';
import { PatientSocialHistoryBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { PatientSocialHistoryAttributes } from '../Model/Interface/Index';
import { PatientSocialHistoryFilters } from '../Common/Filters.e';

export class PatientSocialHistoryService extends BaseService {
    private PatientSocialHistoryBo: PatientSocialHistoryBo;
    constructor(req?: Request) {
        super(req);
        this.PatientSocialHistoryBo = BoFactory.GetBo(PatientSocialHistoryBo, this.Request);
    }

    public async AddPatientSocialHistory(req: BaseRequest): Promise<number> {
        return await this.PatientSocialHistoryBo.AddPatientSocialHistory(req);
    }

    public async UpdatePatientSocialHistory(req: BaseRequest): Promise<boolean> {
        return await this.PatientSocialHistoryBo.UpdatePatientSocialHistory(req);
    }

    public async GetPatientSocialHistoryById(req: BaseRequest): Promise<PatientSocialHistoryAttributes> {
        return await this.PatientSocialHistoryBo.GetPatientSocialHistoryById(req);
    }

    public async ManagePatientSocialHistorys(req: BaseRequest): Promise<boolean> {
        return await this.PatientSocialHistoryBo.ManagePatientSocialHistorys(req);
    }

    public async GetPatientSocialHistorys(apiReq?: ApiRequest<PatientSocialHistoryFilters>):
                Promise<ApiResponse<PatientSocialHistoryAttributes[]>> {
        return await this.PatientSocialHistoryBo.GetPatientSocialHistorys(apiReq);
    }

    public async DeletePatientSocialHistory(req: BaseRequest): Promise<Boolean> {
        return await this.PatientSocialHistoryBo.DeletePatientSocialHistory(req);
    }
}
