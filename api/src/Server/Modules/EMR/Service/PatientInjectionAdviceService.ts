import {BaseService, BoFactory } from '../../Base/Index';
import { PatientInjectionAdviceBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { PatientInjectionAdviceAttributes } from '../Model/Interface/Index';
import { PatientInjectionAdviceFilters } from '../Common/Filters.e';

export class PatientInjectionAdviceService extends BaseService {
    private PatientInjectionAdviceBo: PatientInjectionAdviceBo;
    constructor(req?: Request) {
        super(req);
        this.PatientInjectionAdviceBo = BoFactory.GetBo(PatientInjectionAdviceBo, this.Request);
    }

    public async AddPatientInjectionAdvice(req: BaseRequest): Promise<number> {
        return await this.PatientInjectionAdviceBo.AddPatientInjectionAdvice(req);
    }

    public async UpdatePatientInjectionAdvice(req: BaseRequest): Promise<boolean> {
        return await this.PatientInjectionAdviceBo.UpdatePatientInjectionAdvice(req);
    }

    public async GetPatientInjectionAdviceById(req: BaseRequest): Promise<PatientInjectionAdviceAttributes> {
        return await this.PatientInjectionAdviceBo.GetPatientInjectionAdviceById(req);
    }

    public async ManagePatientInjectionAdvices(req: BaseRequest): Promise<boolean> {
        return await this.PatientInjectionAdviceBo.ManagePatientInjectionAdvices(req);
    }

    public async GetPatientInjectionAdvices(apiReq?: ApiRequest<PatientInjectionAdviceFilters>):
                Promise<ApiResponse<PatientInjectionAdviceAttributes[]>> {
        return await this.PatientInjectionAdviceBo.GetPatientInjectionAdvices(apiReq);
    }

    public async DeletePatientInjectionAdvice(req: BaseRequest): Promise<Boolean> {
        return await this.PatientInjectionAdviceBo.DeletePatientInjectionAdvice(req);
    }
}
