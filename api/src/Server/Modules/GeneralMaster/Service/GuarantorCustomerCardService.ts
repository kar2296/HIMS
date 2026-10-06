import { BaseService, BoFactory } from '../../Base/Index';
import { GuarantorCustomerCardBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { GuarantorCustomerCardAttributes } from '../Model/Interface/Index';
import { GuarantorCustomerCardFilters } from '../Common/Filters.e';

export class GuarantorCustomerCardService extends BaseService {
    private GuarantorCustomerCardBo: GuarantorCustomerCardBo;
    constructor(req?: Request) {
        super(req);
        this.GuarantorCustomerCardBo = BoFactory.GetBo(GuarantorCustomerCardBo, this.Request);
    }

    public async AddGuarantorCustomerCard(req: BaseRequest): Promise<number> {
        return await this.GuarantorCustomerCardBo.AddGuarantorCustomerCard(req);
    }

    public async UpdateGuarantorCustomerCard(req: BaseRequest): Promise<boolean> {
        return await this.GuarantorCustomerCardBo.UpdateGuarantorCustomerCard(req);
    }

    public async GetGuarantorCustomerCardById(req: BaseRequest): Promise<GuarantorCustomerCardAttributes> {
        return await this.GuarantorCustomerCardBo.GetGuarantorCustomerCardById(req);
    }

    public async GetGuarantorCustomerCards(apiReq?: ApiRequest<GuarantorCustomerCardFilters>):
        Promise<ApiResponse<GuarantorCustomerCardAttributes[]>> {
        return await this.GuarantorCustomerCardBo.GetGuarantorCustomerCards(apiReq);
    }

    public async DeleteGuarantorCustomerCard(req: BaseRequest): Promise<Boolean> {
        return await this.GuarantorCustomerCardBo.DeleteGuarantorCustomerCard(req);
    }
}
