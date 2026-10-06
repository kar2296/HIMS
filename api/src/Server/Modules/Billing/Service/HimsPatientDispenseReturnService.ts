import { BaseService, BoFactory } from '../../Base/Index';
import { PatientDispenseReturnBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request, FileInfo } from '../../../Core/Index';
import { PatientDispenseReturnAttributes } from '../Model/Interface/Index';
import { PatientDispenseReturnFilters } from '../Common/Filters.e';

export class PatientDispenseReturnService extends BaseService {
    private PatientDispenseReturnBo: PatientDispenseReturnBo;
    constructor(req?: Request) {
        super(req);
        this.PatientDispenseReturnBo = BoFactory.GetBo(PatientDispenseReturnBo, this.Request);
    }

    public async AddPatientDispenseReturn(req: BaseRequest): Promise<number> {
        return await this.PatientDispenseReturnBo.AddPatientDispenseReturn(req);
    }

    public async UpdatePatientDispenseReturn(req: BaseRequest): Promise<boolean> {
        return await this.PatientDispenseReturnBo.UpdatePatientDispenseReturn(req);
    }

    public async GetPatientDispenseReturnById(req: BaseRequest): Promise<PatientDispenseReturnAttributes> {
        return await this.PatientDispenseReturnBo.GetPatientDispenseReturnById(req);
    }

    public async GetPatientDispenseReturns(apiReq?: ApiRequest<PatientDispenseReturnFilters>):
        Promise<ApiResponse<PatientDispenseReturnAttributes[]>> {
        return await this.PatientDispenseReturnBo.GetPatientDispenseReturns(apiReq);
    }

    public async DeletePatientDispenseReturn(req: BaseRequest): Promise<Boolean> {
        return await this.PatientDispenseReturnBo.DeletePatientDispenseReturn(req);
    }

    public async PrintPatientDispenseReturn(req: BaseRequest): Promise<FileInfo> {
        return await this.PatientDispenseReturnBo.PrintPatientDispenseReturn(req);
    }
}
