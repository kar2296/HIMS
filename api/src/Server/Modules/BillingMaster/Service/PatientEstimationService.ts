import { BaseService, BoFactory } from '../../Base/Index';
import { PatientEstimationBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request,FileInfo } from '../../../Core/Index';
import { PatientEstimationAttributes } from '../Model/Interface/Index';
import { PatientEstimationFilters } from '../Common/Filters.e';

export class PatientEstimationService extends BaseService {
    private PatientEstimationBo: PatientEstimationBo;
    constructor(req?: Request) {
        super(req);
        this.PatientEstimationBo = BoFactory.GetBo(PatientEstimationBo, this.Request);
    }

    public async AddPatientEstimation(req: BaseRequest): Promise<number> {
        return await this.PatientEstimationBo.AddPatientEstimation(req);
    }

    public async UpdatePatientEstimation(req: BaseRequest): Promise<boolean> {
        return await this.PatientEstimationBo.UpdatePatientEstimation(req);
    }

    public async GetPatientEstimationById(req: BaseRequest): Promise<PatientEstimationAttributes> {
        return await this.PatientEstimationBo.GetPatientEstimationById(req);
    }
    public async GetPatientEstimation(apiReq?: ApiRequest<PatientEstimationFilters>): Promise<ApiResponse<PatientEstimationAttributes[]>> {
        return await this.PatientEstimationBo.GetPatientEstimation(apiReq);
    }

    public async DeletePatientEstimation(req: BaseRequest): Promise<Boolean> {
        return await this.PatientEstimationBo.DeletePatientEstimation(req);
    }
    public async PrintPatientEstimation(req: BaseRequest): Promise<FileInfo> {
        return await this.PatientEstimationBo.PrintPatientEstimation(req);
    }
    public async PrintPatientEstimationwithoutheader(req: BaseRequest): Promise<FileInfo> {
        return await this.PatientEstimationBo.PrintPatientEstimationwithoutheader(req);
    }
}
