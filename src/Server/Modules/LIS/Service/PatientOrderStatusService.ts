import { BaseService, BoFactory } from '../../Base/Index';
import { PatientOrderStatusBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { PatientOrderStatusAttributes } from '../Model/Interface/Index';
import { PatientOrderStatusFilters } from '../Common/Filters.e';

export class PatientOrderStatusService extends BaseService {
    private PatientOrderStatusBo: PatientOrderStatusBo;
    constructor(req?: Request) {
        super(req);
        this.PatientOrderStatusBo = BoFactory.GetBo(PatientOrderStatusBo, this.Request);
    }

    public async AddPatientOrderStatus(req: BaseRequest): Promise<number> {
        return await this.PatientOrderStatusBo.AddPatientOrderStatus(req);
    }

    public async UpdatePatientOrderStatus(req: BaseRequest): Promise<boolean> {
        return await this.PatientOrderStatusBo.UpdatePatientOrderStatus(req);
    }

    public async GetPatientOrderStatusById(req: BaseRequest): Promise<PatientOrderStatusAttributes> {
        return await this.PatientOrderStatusBo.GetPatientOrderStatusById(req);
    }

    public async GetPatientOrderStatus(apiReq?: ApiRequest<PatientOrderStatusFilters>):
        Promise<ApiResponse<PatientOrderStatusAttributes[]>> {
        return await this.PatientOrderStatusBo.GetPatientOrderStatus(apiReq);
    }

    public async DeletePatientOrderStatus(req: BaseRequest): Promise<Boolean> {
        return await this.PatientOrderStatusBo.DeletePatientOrderStatus(req);
    }
}
