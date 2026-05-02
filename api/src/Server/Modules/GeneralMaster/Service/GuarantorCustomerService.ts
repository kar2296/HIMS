import {BaseService, BoFactory} from '../../Base/Index';
import { GuarantorCustomerBo} from '../Business/Index';
import {ApiRequest, BaseRequest, ApiResponse} from '../../../Common/Index';
import {Request} from '../../../Core/Index';
import { GuarantorCustomerAttributes} from '../Model/Interface/Index';
import { GuarantorCustomerFilters } from '../Common/Filters.e';

export class GuarantorCustomerService extends BaseService {
    private GuarantorCustomerBo: GuarantorCustomerBo;
    constructor(req?: Request) {
        super(req);
        this.GuarantorCustomerBo = BoFactory.GetBo(GuarantorCustomerBo, this.Request);
    }

    public async AddGuarantorCustomer(req: BaseRequest): Promise<number> {
        return await this.GuarantorCustomerBo.AddGuarantorCustomer(req);
    }

    public async UpdateGuarantorCustomer(req: BaseRequest): Promise<boolean> {
        return await this.GuarantorCustomerBo.UpdateGuarantorCustomer(req);
    }

    public async GetGuarantorCustomerById(req: BaseRequest): Promise<GuarantorCustomerAttributes> {
        return await this.GuarantorCustomerBo.GetGuarantorCustomerById(req);
    }

    public async GetGuarantorCustomers(apiReq?: ApiRequest<GuarantorCustomerFilters>): Promise<ApiResponse<GuarantorCustomerAttributes[]>> {
        return await this.GuarantorCustomerBo.GetGuarantorCustomers(apiReq);
    }

    public async DeleteGuarantorCustomer(req: BaseRequest): Promise<Boolean> {
        return await this.GuarantorCustomerBo.DeleteGuarantorCustomer(req);
    }
}
