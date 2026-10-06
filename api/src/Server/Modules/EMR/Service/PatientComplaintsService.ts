import {BaseService, BoFactory } from '../../Base/Index';
import { PatientComplaintsBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { PatientComplaintsAttributes } from '../Model/Interface/Index';
import { PatientComplaintsFilters } from '../Common/Filters.e';

export class PatientComplaintsService extends BaseService {
    private PatientComplaintsBo: PatientComplaintsBo;
    constructor(req?: Request) {
        super(req);
        this.PatientComplaintsBo = BoFactory.GetBo(PatientComplaintsBo, this.Request);
    }

    public async AddPatientComplaints(req: BaseRequest): Promise<number> {
        return await this.PatientComplaintsBo.AddPatientComplaints(req);
    }

    public async UpdatePatientComplaints(req: BaseRequest): Promise<boolean> {
        return await this.PatientComplaintsBo.UpdatePatientComplaints(req);
    }

    public async GetPatientComplaintsById(req: BaseRequest): Promise<PatientComplaintsAttributes> {
        return await this.PatientComplaintsBo.GetPatientComplaintsById(req);
    }

    public async ManagePatientComplaintss(req: BaseRequest): Promise<boolean> {
        return await this.PatientComplaintsBo.ManagePatientComplaintss(req);
    }

    public async GetPatientComplaintss(apiReq?: ApiRequest<PatientComplaintsFilters>):
                Promise<ApiResponse<PatientComplaintsAttributes[]>> {
        return await this.PatientComplaintsBo.GetPatientComplaintss(apiReq);
    }

    public async DeletePatientComplaints(req: BaseRequest): Promise<Boolean> {
        return await this.PatientComplaintsBo.DeletePatientComplaints(req);
    }
}
