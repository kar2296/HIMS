import { BaseService, BoFactory } from '../../Base/Index';
import { PatientCriticalOrderBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { PatientCriticalOrderAttributes } from '../Model/Interface/Index';
import { PatientCriticalOrderFilters } from '../Common/Filters.e';

export class PatientCriticalOrderService extends BaseService {
    private PatientCriticalOrderBo: PatientCriticalOrderBo;
    constructor(req?: Request) {
        super(req);
        this.PatientCriticalOrderBo = BoFactory.GetBo(PatientCriticalOrderBo, this.Request);
    }

    public async AddPatientCriticalOrder(req: BaseRequest): Promise<number> {
        return await this.PatientCriticalOrderBo.AddPatientCriticalOrder(req);
    }

    public async UpdatePatientCriticalOrder(req: BaseRequest): Promise<boolean> {
        return await this.PatientCriticalOrderBo.UpdatePatientCriticalOrder(req);
    }

    public async GetPatientCriticalOrderById(req: BaseRequest): Promise<PatientCriticalOrderAttributes> {
        return await this.PatientCriticalOrderBo.GetPatientCriticalOrderById(req);
    }

    public async GetPatientCriticalOrders(apiReq?: ApiRequest<PatientCriticalOrderFilters>):
        Promise<ApiResponse<PatientCriticalOrderAttributes[]>> {
        return await this.PatientCriticalOrderBo.GetPatientCriticalOrders(apiReq);
    }

    public async DeletePatientCriticalOrder(req: BaseRequest): Promise<Boolean> {
        return await this.PatientCriticalOrderBo.DeletePatientCriticalOrder(req);
    }
    public async PrintPatientCriticalOrderReport(apiReq?: ApiRequest<PatientCriticalOrderFilters>): Promise<any> {
        return await this.PatientCriticalOrderBo.PrintPatientCriticalOrderReport(apiReq);
    }
}
