import { BaseService, BoFactory } from '../../Base/Index';
import { B2BCustomerMasterBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { B2BCustomerMasterAttributes } from '../Model/Interface/Index';
import { B2BCustomerMasterFilters } from '../Common/Filters.e';

export class B2BCustomerMasterService extends BaseService {
    private B2BCustomerMasterBo: B2BCustomerMasterBo;
    constructor(req?: Request) {
        super(req);
        this.B2BCustomerMasterBo = BoFactory.GetBo(B2BCustomerMasterBo, this.Request);
    }

    public async AddB2BCustomerMaster(req: BaseRequest): Promise<number> {
        return await this.B2BCustomerMasterBo.AddB2BCustomerMaster(req);
    }

    public async UpdateB2BCustomerMaster(req: BaseRequest): Promise<boolean> {
        return await this.B2BCustomerMasterBo.UpdateB2BCustomerMaster(req);
    }

    public async GetB2BCustomerMasterById(req: BaseRequest): Promise<B2BCustomerMasterAttributes> {
        return await this.B2BCustomerMasterBo.GetB2BCustomerMasterById(req);
    }

    public async GetB2BCustomerMasterss(apiReq?:
        ApiRequest<B2BCustomerMasterFilters>):
        Promise<ApiResponse<B2BCustomerMasterAttributes[]>> {
        return await this.B2BCustomerMasterBo.GetB2BCustomerMasterss(apiReq);
    }

    public async DeleteB2BCustomerMaster(req: BaseRequest): Promise<Boolean> {
        return await this.B2BCustomerMasterBo.DeleteB2BCustomerMaster(req);
    }
}
