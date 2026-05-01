import {BaseService, BoFactory } from '../../Base/Index';
import { PatientSurgeryAdviceBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { PatientSurgeryAdviceAttributes } from '../Model/Interface/Index';
import { PatientSurgeryAdviceFilters } from '../Common/Filters.e';

export class PatientSurgeryAdviceService extends BaseService {
    private PatientSurgeryAdviceBo: PatientSurgeryAdviceBo;
    constructor(req?: Request) {
        super(req);
        this.PatientSurgeryAdviceBo = BoFactory.GetBo(PatientSurgeryAdviceBo, this.Request);
    }

    public async AddPatientSurgeryAdvice(req: BaseRequest): Promise<number> {
        return await this.PatientSurgeryAdviceBo.AddPatientSurgeryAdvice(req);
    }

    public async UpdatePatientSurgeryAdvice(req: BaseRequest): Promise<boolean> {
        return await this.PatientSurgeryAdviceBo.UpdatePatientSurgeryAdvice(req);
    }

    public async GetPatientSurgeryAdviceById(req: BaseRequest): Promise<PatientSurgeryAdviceAttributes> {
        return await this.PatientSurgeryAdviceBo.GetPatientSurgeryAdviceById(req);
    }

    public async ManagePatientSurgeryAdvices(req: BaseRequest): Promise<boolean> {
        return await this.PatientSurgeryAdviceBo.ManagePatientSurgeryAdvices(req);
    }

    public async GetPatientSurgeryAdvices(apiReq?: ApiRequest<PatientSurgeryAdviceFilters>):
                Promise<ApiResponse<PatientSurgeryAdviceAttributes[]>> {
        return await this.PatientSurgeryAdviceBo.GetPatientSurgeryAdvices(apiReq);
    }

    public async DeletePatientSurgeryAdvice(req: BaseRequest): Promise<Boolean> {
        return await this.PatientSurgeryAdviceBo.DeletePatientSurgeryAdvice(req);
    }
}
