import {BaseService, BoFactory } from '../../Base/Index';
import { PatientSampledetailsBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ISearchEnums, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { PatientSampledetailsAttributes } from '../Model/Interface/Index';

export class PatientSampledetailsService extends BaseService {
    private PatientSampledetailsBo: PatientSampledetailsBo;
    constructor(req?: Request) {
        super(req);
        this.PatientSampledetailsBo = BoFactory.GetBo(PatientSampledetailsBo, this.Request);
    }

    public async AddPatientSampledetails(req: BaseRequest): Promise<number> {
        return await this.PatientSampledetailsBo.AddPatientSampledetails(req);
    }

    public async UpdatePatientSampledetails(req: BaseRequest): Promise<boolean> {
        return await this.PatientSampledetailsBo.UpdatePatientSampledetails(req);
    }

    public async GetPatientSampledetailsById(req: BaseRequest): Promise<PatientSampledetailsAttributes> {
        return await this.PatientSampledetailsBo.GetPatientSampledetailsById(req);
    }

    public async GetPatientSampledetailss(apiReq?: ApiRequest<ISearchEnums>): Promise<ApiResponse<PatientSampledetailsAttributes[]>> {
        return await this.PatientSampledetailsBo.GetPatientSampledetailss(apiReq);
    }

    public async DeletePatientSampledetails(req: BaseRequest): Promise<Boolean> {
        return await this.PatientSampledetailsBo.DeletePatientSampledetails(req);
    }
}
