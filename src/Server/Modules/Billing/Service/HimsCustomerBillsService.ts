import { BaseService, BoFactory } from '../../Base/Index';
import { CustomerBillsBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request, FileInfo } from '../../../Core/Index';
import { CustomerBillsAttributes } from '../Model/Interface/Index';
import { CustomerBillsFilters } from '../Common/Filters.e';

export class CustomerBillsService extends BaseService {
    private CustomerBillsBo: CustomerBillsBo;
    constructor(req?: Request) {
        super(req);
        this.CustomerBillsBo = BoFactory.GetBo(CustomerBillsBo, this.Request);
    }

    public async AddCustomerBills(req: BaseRequest): Promise<number> {
        return await this.CustomerBillsBo.AddCustomerBills(req);
    }

    public async UpdateCustomerBills(req: BaseRequest): Promise<boolean> {
        return await this.CustomerBillsBo.UpdateCustomerBills(req);
    }

    public async GetCustomerBillsById(req: BaseRequest): Promise<CustomerBillsAttributes> {
        return await this.CustomerBillsBo.GetCustomerBillsById(req);
    }

    public async GetCustomerBills(apiReq?: ApiRequest<CustomerBillsFilters>): Promise<ApiResponse<CustomerBillsAttributes[]>> {
        return await this.CustomerBillsBo.GetCustomerBills(apiReq);
    }

    public async PrintCustomerBills(req: BaseRequest): Promise<FileInfo> {
        return await this.CustomerBillsBo.PrintCustomerBills(req);
    }
}
