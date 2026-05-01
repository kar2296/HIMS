import { BaseService, BoFactory } from '../../Base/Index';
import { ModifiedPatientPaymentDetailsBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { ModifiedPatientPaymentDetailsAttributes } from '../Model/Interface/Index';
import { ModifiedPatientPaymentDetailsFilters } from '../Common/Filters.e';

export class ModifiedPatientPaymentDetailsService extends BaseService {
    private ModifiedPatientPaymentDetailsBo: ModifiedPatientPaymentDetailsBo;
    constructor(req?: Request) {
        super(req);
        this.ModifiedPatientPaymentDetailsBo = BoFactory.GetBo(ModifiedPatientPaymentDetailsBo, this.Request);
    }

    public async AddModifiedPatientPaymentDetails(req: BaseRequest): Promise<number> {
        return await this.ModifiedPatientPaymentDetailsBo.AddModifiedPatientPaymentDetails(req);
    }

    public async UpdateModifiedPatientPaymentDetails(req: BaseRequest): Promise<boolean> {
        return await this.ModifiedPatientPaymentDetailsBo.UpdateModifiedPatientPaymentDetails(req);
    }

    public async GetModifiedPatientPaymentDetailsById(req: BaseRequest): Promise<ModifiedPatientPaymentDetailsAttributes> {
        return await this.ModifiedPatientPaymentDetailsBo.GetModifiedPatientPaymentDetailsById(req);
    }

    public async GetModifiedPatientPaymentDetails(apiReq?: ApiRequest<ModifiedPatientPaymentDetailsFilters>):
        Promise<ApiResponse<ModifiedPatientPaymentDetailsAttributes[]>> {
        return await this.ModifiedPatientPaymentDetailsBo.GetModifiedPatientPaymentDetails(apiReq);
    }

    public async DeleteModifiedPatientPaymentDetails(req: BaseRequest): Promise<Boolean> {
        return await this.ModifiedPatientPaymentDetailsBo.DeleteModifiedPatientPaymentDetails(req);
    }
}
