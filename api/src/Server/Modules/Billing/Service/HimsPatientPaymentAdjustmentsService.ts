import { BaseService, BoFactory } from '../../Base/Index';
import { PatientPaymentAdjustmentsBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { PatientPaymentAdjustmentsAttributes } from '../Model/Interface/Index';
import { PatientPaymentAdjustmentsFilters } from '../Common/Filters.e';

export class PatientPaymentAdjustmentsService extends BaseService {
    private PatientPaymentAdjustmentsBo: PatientPaymentAdjustmentsBo;
    constructor(req?: Request) {
        super(req);
        this.PatientPaymentAdjustmentsBo = BoFactory.GetBo(PatientPaymentAdjustmentsBo, this.Request);
    }

    public async AddPatientPaymentAdjustments(req: BaseRequest): Promise<number> {
        return await this.PatientPaymentAdjustmentsBo.AddPatientPaymentAdjustments(req);
    }

    public async UpdatePatientPaymentAdjustments(req: BaseRequest): Promise<boolean> {
        return await this.PatientPaymentAdjustmentsBo.UpdatePatientPaymentAdjustments(req);
    }

    public async GetPatientPaymentAdjustmentsById(req: BaseRequest): Promise<PatientPaymentAdjustmentsAttributes> {
        return await this.PatientPaymentAdjustmentsBo.GetPatientPaymentAdjustmentsById(req);
    }

    public async GetPatientPaymentAdjustments(apiReq?: ApiRequest<PatientPaymentAdjustmentsFilters>):
        Promise<ApiResponse<PatientPaymentAdjustmentsAttributes[]>> {
        return await this.PatientPaymentAdjustmentsBo.GetPatientPaymentAdjustments(apiReq);
    }

    public async DeletePatientPaymentAdjustments(req: BaseRequest): Promise<Boolean> {
        return await this.PatientPaymentAdjustmentsBo.DeletePatientPaymentAdjustments(req);
    }

    public async PrintPatientFundAdjustmentReport(apiReq?: ApiRequest<PatientPaymentAdjustmentsFilters>): Promise<any> {
        return await this.PatientPaymentAdjustmentsBo.PrintPatientFundAdjustmentReport(apiReq);
    }
}
