import { BaseService, BoFactory } from '../../Base/Index';
import { CustomerMasterBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { CustomerMasterAttributes } from '../Model/Interface/Index';
import { CustomerMasterFilters } from '../Common/Filters.e';
import { CustomerContactAttributes } from '../Model/Interface/Index';
import { CustomerContactFilters } from '../Common/Filters.e';

export class CustomerMasterService extends BaseService {
    private CustomerMasterBo: CustomerMasterBo;
    constructor(req?: Request) {
        super(req);
        this.CustomerMasterBo = BoFactory.GetBo(CustomerMasterBo, this.Request);
    }

    public async AddCustomerMaster(req: BaseRequest): Promise<number> {
        return await this.CustomerMasterBo.AddCustomerMaster(req);
    }

    public async UpdateCustomerMaster(req: BaseRequest): Promise<boolean> {
        return await this.CustomerMasterBo.UpdateCustomerMaster(req);
    }

    public async GetCustomerMasterById(req: BaseRequest): Promise<CustomerMasterAttributes> {
        return await this.CustomerMasterBo.GetCustomerMasterById(req);
    }

    public async GetCustomerMasters(apiReq?: ApiRequest<CustomerMasterFilters>): Promise<ApiResponse<CustomerMasterAttributes[]>> {
        return await this.CustomerMasterBo.GetCustomerMasters(apiReq);
    }

    public async DeleteCustomerMaster(req: BaseRequest): Promise<Boolean> {
        return await this.CustomerMasterBo.DeleteCustomerMaster(req);
    }

    public async AddCustomerContact(req: BaseRequest): Promise<number> {
        return await this.CustomerMasterBo.AddCustomerContact(req);
    }

    public async UpdateCustomerContact(req: BaseRequest): Promise<boolean> {
        return await this.CustomerMasterBo.UpdateCustomerContact(req);
    }

    public async GetCustomerContactById(req: BaseRequest): Promise<CustomerContactAttributes> {
        return await this.CustomerMasterBo.GetCustomerContactById(req);
    }

    public async GetCustomerContacts(apiReq?: ApiRequest<CustomerContactFilters>): Promise<ApiResponse<CustomerContactAttributes[]>> {
        return await this.CustomerMasterBo.GetCustomerContacts(apiReq);
    }

    public async DeleteCustomerContact(req: BaseRequest): Promise<Boolean> {
        return await this.CustomerMasterBo.DeleteCustomerContact(req);
    }
}
