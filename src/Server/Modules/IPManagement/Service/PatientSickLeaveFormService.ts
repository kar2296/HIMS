import { BaseService, BoFactory } from '../../Base/Index';
import { PatientSickLeaveFormBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request, FileInfo } from '../../../Core/Index';
import { PatientSickLeaveFormAttributes } from '../Model/Interface/Index';
import { PatientSickLeaveFormFilters } from '../Common/Filters.e';

export class PatientSickLeaveFormService extends BaseService {
    private PatientSickLeaveFormBo: PatientSickLeaveFormBo;
    constructor(req?: Request) {
        super(req);
        this.PatientSickLeaveFormBo = BoFactory.GetBo(PatientSickLeaveFormBo, this.Request);
    }

    public async AddPatientSickLeaveForm(req: BaseRequest): Promise<number> {
        return await this.PatientSickLeaveFormBo.AddPatientSickLeaveForm(req);
    }

    public async UpdatePatientSickLeaveForm(req: BaseRequest): Promise<boolean> {
        return await this.PatientSickLeaveFormBo.UpdatePatientSickLeaveForm(req);
    }

    public async GetPatientSickLeaveFormById(req: BaseRequest): Promise<PatientSickLeaveFormAttributes> {
        return await this.PatientSickLeaveFormBo.GetPatientSickLeaveFormById(req);
    }

    public async GetPatientSickLeaveForm(apiReq?: ApiRequest<PatientSickLeaveFormFilters>):
        Promise<ApiResponse<PatientSickLeaveFormAttributes[]>> {
        return await this.PatientSickLeaveFormBo.GetPatientSickLeaveForm(apiReq);
    }
    public async DeletePatientSickLeaveForm(req: BaseRequest): Promise<Boolean> {
        return await this.PatientSickLeaveFormBo.DeletePatientSickLeaveForm(req);
    }
    public async PrintPatientSickLeaveForm(req: BaseRequest): Promise<FileInfo> {
        return await this.PatientSickLeaveFormBo.PrintPatientSickLeaveForm(req);
    }
}
