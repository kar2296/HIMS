import { BaseService, BoFactory } from '../../Base/Index';
import { GuarantorCustomerCardDeductableBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { GuarantorCustomerCardDeductableAttributes } from '../Model/Interface/Index';
import { GuarantorCustomerCardDeductableFilters } from '../Common/Filters.e';

export class GuarantorCustomerCardDeductableService extends BaseService {
    private GuarantorCustomerCardDeductableBo: GuarantorCustomerCardDeductableBo;
    constructor(req?: Request) {
        super(req);
        this.GuarantorCustomerCardDeductableBo = BoFactory.GetBo(GuarantorCustomerCardDeductableBo, this.Request);
    }

    public async AddGuarantorCustomerCardDeductable(req: BaseRequest): Promise<number> {
        return await this.GuarantorCustomerCardDeductableBo.AddGuarantorCustomerCardDeductable(req);
    }

    public async UpdateGuarantorCustomerCardDeductable(req: BaseRequest): Promise<boolean> {
        return await this.GuarantorCustomerCardDeductableBo.UpdateGuarantorCustomerCardDeductable(req);
    }

    public async GetGuarantorCustomerCardDeductableById(req: BaseRequest): Promise<GuarantorCustomerCardDeductableAttributes> {
        return await this.GuarantorCustomerCardDeductableBo.GetGuarantorCustomerCardDeductableById(req);
    }

    public async GetGuarantorCustomerCardDeductables(
        apiReq?: ApiRequest<GuarantorCustomerCardDeductableFilters>): Promise<ApiResponse<GuarantorCustomerCardDeductableAttributes[]>> {
        return await this.GuarantorCustomerCardDeductableBo.GetGuarantorCustomerCardDeductables(apiReq);
    }

    public async DeleteGuarantorCustomerCardDeductable(req: BaseRequest): Promise<Boolean> {
        return await this.GuarantorCustomerCardDeductableBo.DeleteGuarantorCustomerCardDeductable(req);
    }
}
