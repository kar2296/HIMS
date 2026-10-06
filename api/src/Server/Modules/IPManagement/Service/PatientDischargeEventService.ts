import { BaseService, BoFactory } from '../../Base/Index';
import { PatientDischargeEventBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { PatientDischargeEventAttributes } from '../Model/Interface/Index';
import { PatientDischargeEventFilters } from '../Common/Filters.e';

export class PatientDischargeEventService extends BaseService {
    private PatientDischargeEventBo: PatientDischargeEventBo;
    constructor(req?: Request) {
        super(req);
        this.PatientDischargeEventBo = BoFactory.GetBo(PatientDischargeEventBo, this.Request);
    }

    public async AddPatientDischargeEvent(req: BaseRequest): Promise<number> {
        return await this.PatientDischargeEventBo.AddPatientDischargeEvent(req);
    }

    public async UpdatePatientDischargeEvent(req: BaseRequest): Promise<boolean> {
        return await this.PatientDischargeEventBo.UpdatePatientDischargeEvent(req);
    }

    public async UpdatePatientDischargeEventByDiagnosis(req: BaseRequest): Promise<boolean> {
        return await this.PatientDischargeEventBo.UpdatePatientDischargeEventByDiagnosis(req);
    }

    public async GetPatientDischargeEventById(req: BaseRequest): Promise<PatientDischargeEventAttributes> {
        return await this.PatientDischargeEventBo.GetPatientDischargeEventById(req);
    }
    public async GetPatientDischargeEventByEncounterId(apiReq?: ApiRequest<PatientDischargeEventFilters>): Promise<number> {
        return await this.PatientDischargeEventBo.GetPatientDischargeEventByEncounterId(apiReq);
    }
    public async GetPatientDischargeEvents(apiReq?: ApiRequest<PatientDischargeEventFilters>):
        Promise<ApiResponse<PatientDischargeEventAttributes[]>> {
        return await this.PatientDischargeEventBo.GetPatientDischargeEvents(apiReq);
    }

    public async DeletePatientDischargeEvent(req: BaseRequest): Promise<Boolean> {
        return await this.PatientDischargeEventBo.DeletePatientDischargeEvent(req);
    }
}
