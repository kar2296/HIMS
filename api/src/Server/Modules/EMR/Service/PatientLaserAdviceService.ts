import {BaseService, BoFactory } from '../../Base/Index';
import { PatientLaserAdviceBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { PatientLaserAdviceAttributes } from '../Model/Interface/Index';
import { PatientLaserAdviceFilters } from '../Common/Filters.e';

export class PatientLaserAdviceService extends BaseService {
    private PatientLaserAdviceBo: PatientLaserAdviceBo;
    constructor(req?: Request) {
        super(req);
        this.PatientLaserAdviceBo = BoFactory.GetBo(PatientLaserAdviceBo, this.Request);
    }

    public async AddPatientLaserAdvice(req: BaseRequest): Promise<number> {
        return await this.PatientLaserAdviceBo.AddPatientLaserAdvice(req);
    }

    public async UpdatePatientLaserAdvice(req: BaseRequest): Promise<boolean> {
        return await this.PatientLaserAdviceBo.UpdatePatientLaserAdvice(req);
    }

    public async GetPatientLaserAdviceById(req: BaseRequest): Promise<PatientLaserAdviceAttributes> {
        return await this.PatientLaserAdviceBo.GetPatientLaserAdviceById(req);
    }

    public async ManagePatientLaserAdvices(req: BaseRequest): Promise<boolean> {
        return await this.PatientLaserAdviceBo.ManagePatientLaserAdvices(req);
    }

    public async GetPatientLaserAdvices(apiReq?: ApiRequest<PatientLaserAdviceFilters>):
                Promise<ApiResponse<PatientLaserAdviceAttributes[]>> {
        return await this.PatientLaserAdviceBo.GetPatientLaserAdvices(apiReq);
    }

    public async DeletePatientLaserAdvice(req: BaseRequest): Promise<Boolean> {
        return await this.PatientLaserAdviceBo.DeletePatientLaserAdvice(req);
    }
}
