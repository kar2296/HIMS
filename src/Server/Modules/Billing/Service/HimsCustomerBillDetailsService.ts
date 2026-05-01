import { BaseService, BoFactory } from '../../Base/Index';
import { CustomerBillDetailsBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { CustomerBillDetailsAttributes } from '../Model/Interface/Index';
import { CustomerBillDetailsFilters } from '../Common/Filters.e';

export class CustomerBillDetailsService extends BaseService {
    private CustomerBillDetailsBo: CustomerBillDetailsBo;
    constructor(req?: Request) {
        super(req);
        this.CustomerBillDetailsBo = BoFactory.GetBo(CustomerBillDetailsBo, this.Request);
    }

    public async AddCustomerBillDetails(req: BaseRequest): Promise<number> {
        return await this.CustomerBillDetailsBo.AddCustomerBillDetails(req);
    }

    public async UpdateCustomerBillDetails(req: BaseRequest): Promise<boolean> {
        return await this.CustomerBillDetailsBo.UpdateCustomerBillDetails(req);
    }

    public async GetCustomerBillDetailsById(req: BaseRequest): Promise<CustomerBillDetailsAttributes> {
        return await this.CustomerBillDetailsBo.GetCustomerBillDetailsById(req);
    }

    public async GetCustomerBillDetails(apiReq?: ApiRequest<CustomerBillDetailsFilters>):
        Promise<ApiResponse<CustomerBillDetailsAttributes[]>> {
        return await this.CustomerBillDetailsBo.GetCustomerBillDetails(apiReq);
    }

    public async DeleteCustomerBillDetails(req: BaseRequest): Promise<Boolean> {
        return await this.CustomerBillDetailsBo.DeleteCustomerBillDetails(req);
    }
}
