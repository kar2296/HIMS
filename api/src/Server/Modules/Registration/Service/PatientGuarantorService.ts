import {BaseService, BoFactory} from '../../Base/Index';
import { PatientGuarantorBo} from '../Business/Index';
import {ApiRequest, BaseRequest, ApiResponse} from '../../../Common/Index';
import {Request} from '../../../Core/Index';
import { PatientGuarantorAttributes} from '../Model/Interface/Index';
import { PatientGuarantorFilters } from '../Common/Filters.e';

export class PatientGuarantorService extends BaseService {
    private PatientGuarantorBo: PatientGuarantorBo;
    constructor(req?: Request) {
        super(req);
        this.PatientGuarantorBo = BoFactory.GetBo(PatientGuarantorBo, this.Request);
    }

    public async AddPatientGuarantor(req: BaseRequest): Promise<number> {
        return await this.PatientGuarantorBo.AddPatientGuarantor(req);
    }

    public async UpdatePatientGuarantor(req: BaseRequest): Promise<boolean> {
        return await this.PatientGuarantorBo.UpdatePatientGuarantor(req);
    }

    public async GetPatientGuarantorById(req: BaseRequest): Promise<PatientGuarantorAttributes> {
        return await this.PatientGuarantorBo.GetPatientGuarantorById(req);
    }

    public async GetPatientGuarantors(apiReq?: ApiRequest<PatientGuarantorFilters>): Promise<ApiResponse<PatientGuarantorAttributes[]>> {
        return await this.PatientGuarantorBo.GetPatientGuarantors(apiReq);
    }

    public async DeletePatientGuarantor(req: BaseRequest): Promise<Boolean> {
        return await this.PatientGuarantorBo.DeletePatientGuarantor(req);
    }
}
