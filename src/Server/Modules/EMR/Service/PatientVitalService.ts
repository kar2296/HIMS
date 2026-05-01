import { BaseService, BoFactory } from '../../Base/Index';
import { PatientVitalBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request, FileInfo } from '../../../Core/Index';
import { PatientVitalAttributes } from '../Model/Interface/Index';
import { PatientVitalFilters } from '../Common/Filters.e';

export class PatientVitalService extends BaseService {
    private PatientVitalBo: PatientVitalBo;
    constructor(req?: Request) {
        super(req);
        this.PatientVitalBo = BoFactory.GetBo(PatientVitalBo, this.Request);
    }

    public async AddPatientVital(req: BaseRequest): Promise<number> {
        return await this.PatientVitalBo.AddPatientVital(req);
    }

    public async UpdatePatientVital(req: BaseRequest): Promise<boolean> {
        return await this.PatientVitalBo.UpdatePatientVital(req);
    }

    public async GetPatientVitalById(req: BaseRequest): Promise<PatientVitalAttributes> {
        return await this.PatientVitalBo.GetPatientVitalById(req);
    }

    public async ManagePatientVitals(req: BaseRequest): Promise<boolean> {
        return await this.PatientVitalBo.ManagePatientVitals(req);
    }

    public async GetPatientVitals(apiReq?: ApiRequest<PatientVitalFilters>): Promise<ApiResponse<PatientVitalAttributes[]>> {
        return await this.PatientVitalBo.GetPatientVitals(apiReq);
    }

    public async DeletePatientVital(req: BaseRequest): Promise<Boolean> {
        return await this.PatientVitalBo.DeletePatientVital(req);
    }
    public async PrintPatientVital(req: BaseRequest): Promise<FileInfo> {
        return await this.PatientVitalBo.PrintPatientVital(req);
    }
    public async PrintPatientVitalWithoutHeader(req: BaseRequest): Promise<FileInfo> {
        return await this.PatientVitalBo.PrintPatientVitalWithoutHeader(req);
    }
}
