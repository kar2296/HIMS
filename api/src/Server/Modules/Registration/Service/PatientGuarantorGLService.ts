import {BaseService, BoFactory } from '../../Base/Index';
import { PatientGuarantorGLBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { PatientGuarantorGLAttributes } from '../Model/Interface/Index';
import { PatientGuarantorGLFilters } from '../Common/Filters.e';

export class PatientGuarantorGLService extends BaseService {
    private PatientGuarantorGLBo: PatientGuarantorGLBo;
    constructor(req?: Request) {
        super(req);
        this.PatientGuarantorGLBo = BoFactory.GetBo(PatientGuarantorGLBo, this.Request);
    }

    public async AddPatientGuarantorGL(req: BaseRequest): Promise<number> {
        return await this.PatientGuarantorGLBo.AddPatientGuarantorGL(req);
    }

    public async UpdatePatientGuarantorGL(req: BaseRequest): Promise<boolean> {
        return await this.PatientGuarantorGLBo.UpdatePatientGuarantorGL(req);
    }

    public async GetPatientGuarantorGLById(req: BaseRequest): Promise<PatientGuarantorGLAttributes> {
        return await this.PatientGuarantorGLBo.GetPatientGuarantorGLById(req);
    }

    public async GetPatientGuarantorGLs(apiReq?: ApiRequest<PatientGuarantorGLFilters>):
    Promise<ApiResponse<PatientGuarantorGLAttributes[]>> {
        return await this.PatientGuarantorGLBo.GetPatientGuarantorGLs(apiReq);
    }

    public async DeletePatientGuarantorGL(req: BaseRequest): Promise<Boolean> {
        return await this.PatientGuarantorGLBo.DeletePatientGuarantorGL(req);
    }
}
