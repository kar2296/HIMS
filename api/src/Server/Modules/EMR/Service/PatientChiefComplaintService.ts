import { BaseService, BoFactory } from '../../Base/Index';
import { PatientChiefComplaintBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { PatientChiefComplaintAttributes } from '../Model/Interface/Index';
import { PatientChiefComplaintFilters } from '../Common/Filters.e';

export class PatientChiefComplaintService extends BaseService {
    private PatientChiefComplaintBo: PatientChiefComplaintBo;
    constructor(req?: Request) {
        super(req);
        this.PatientChiefComplaintBo = BoFactory.GetBo(PatientChiefComplaintBo, this.Request);
    }

    public async AddPatientChiefComplaint(req: BaseRequest): Promise<number> {
        return await this.PatientChiefComplaintBo.AddPatientChiefComplaint(req);
    }

    public async UpdatePatientChiefComplaint(req: BaseRequest): Promise<boolean> {
        return await this.PatientChiefComplaintBo.UpdatePatientChiefComplaint(req);
    }

    public async ManagePatientChiefComplaints(req: BaseRequest): Promise<boolean> {
        return await this.PatientChiefComplaintBo.ManagePatientChiefComplaints(req);
    }

    public async GetPatientChiefComplaintById(req: BaseRequest): Promise<PatientChiefComplaintAttributes> {
        return await this.PatientChiefComplaintBo.GetPatientChiefComplaintById(req);
    }

    public async GetPatientChiefComplaints(apiReq?: ApiRequest<PatientChiefComplaintFilters>):
        Promise<ApiResponse<PatientChiefComplaintAttributes[]>> {
        return await this.PatientChiefComplaintBo.GetPatientChiefComplaints(apiReq);
    }

    public async DeletePatientChiefComplaint(req: BaseRequest): Promise<Boolean> {
        return await this.PatientChiefComplaintBo.DeletePatientChiefComplaint(req);
    }
}
