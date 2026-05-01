import {BaseService, BoFactory } from '../../Base/Index';
import { PatientGeneralHistoryBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { PatientGeneralHistoryAttributes } from '../Model/Interface/Index';
import { PatientGeneralHistoryFilters } from '../Common/Filters.e';

export class PatientGeneralHistoryService extends BaseService {
    private PatientGeneralHistoryBo: PatientGeneralHistoryBo;
    constructor(req?: Request) {
        super(req);
        this.PatientGeneralHistoryBo = BoFactory.GetBo(PatientGeneralHistoryBo, this.Request);
    }

    public async AddPatientGeneralHistory(req: BaseRequest): Promise<number> {
        return await this.PatientGeneralHistoryBo.AddPatientGeneralHistory(req);
    }

    public async UpdatePatientGeneralHistory(req: BaseRequest): Promise<boolean> {
        return await this.PatientGeneralHistoryBo.UpdatePatientGeneralHistory(req);
    }

    public async GetPatientGeneralHistoryById(req: BaseRequest): Promise<PatientGeneralHistoryAttributes> {
        return await this.PatientGeneralHistoryBo.GetPatientGeneralHistoryById(req);
    }

    public async ManagePatientGeneralHistorys(req: BaseRequest): Promise<boolean> {
        return await this.PatientGeneralHistoryBo.ManagePatientGeneralHistorys(req);
    }

    public async GetPatientGeneralHistorys(apiReq?: ApiRequest<PatientGeneralHistoryFilters>):
                Promise<ApiResponse<PatientGeneralHistoryAttributes[]>> {
        return await this.PatientGeneralHistoryBo.GetPatientGeneralHistorys(apiReq);
    }

    public async DeletePatientGeneralHistory(req: BaseRequest): Promise<Boolean> {
        return await this.PatientGeneralHistoryBo.DeletePatientGeneralHistory(req);
    }
}
