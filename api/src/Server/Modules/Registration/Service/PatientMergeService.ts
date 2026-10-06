import { BaseService, BoFactory } from '../../Base/Index';
import { PatientMergeBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { PatientMergeAttributes } from '../Model/Interface/Index';
import { PatientMergeFilters } from '../Common/Filters.e';

export class PatientMergeService extends BaseService {
    private PatientMergeBo: PatientMergeBo;
    constructor(req?: Request) {
        super(req);
        this.PatientMergeBo = BoFactory.GetBo(PatientMergeBo, this.Request);
    }

    public async AddPatientMerge(req: BaseRequest): Promise<number> {
        return await this.PatientMergeBo.AddPatientMerge(req);
    }

    public async UpdatePatientMerge(req: BaseRequest): Promise<boolean> {
        return await this.PatientMergeBo.UpdatePatientMerge(req);
    }

    public async GetPatientMergeProfilePic(req: BaseRequest): Promise<PatientMergeAttributes> {
        return await this.PatientMergeBo.GetPatientMergeProfilePic(req);
    }

    public async GetPatientMergeById(req: BaseRequest): Promise<PatientMergeAttributes> {
        return await this.PatientMergeBo.GetPatientMergeById(req);
    }

    public async GetPatientMerge(apiReq?: ApiRequest<PatientMergeFilters>): Promise<ApiResponse<PatientMergeAttributes[]>> {
        return await this.PatientMergeBo.GetPatientMerge(apiReq);
    }

    public async DeletePatientMerge(req: BaseRequest): Promise<Boolean> {
        return await this.PatientMergeBo.DeletePatientMerge(req);
    }

    public async ManagePatientMerge(req: BaseRequest): Promise<boolean> {
        return await this.PatientMergeBo.ManagePatientMerge(req);
    }

    public async ManagePatientUnMerge(req: BaseRequest): Promise<boolean> {
        return await this.PatientMergeBo.ManagePatientUnMerge(req);
    }

}
