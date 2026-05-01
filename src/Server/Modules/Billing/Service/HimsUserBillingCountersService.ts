import { BaseService, BoFactory } from '../../Base/Index';
import { UserBillingCountersBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request, FileInfo } from '../../../Core/Index';
import { UserBillingCountersAttributes } from '../Model/Interface/Index';
import { UserBillingCountersFilters } from '../Common/Filters.e';

export class UserBillingCountersService extends BaseService {
    private UserBillingCountersBo: UserBillingCountersBo;
    constructor(req?: Request) {
        super(req);
        this.UserBillingCountersBo = BoFactory.GetBo(UserBillingCountersBo, this.Request);
    }

    public async AddUserBillingCounters(req: BaseRequest): Promise<number> {
        return await this.UserBillingCountersBo.AddUserBillingCounters(req);
    }

    public async UpdateUserBillingCounters(req: BaseRequest): Promise<boolean> {
        return await this.UserBillingCountersBo.UpdateUserBillingCounters(req);
    }

    public async GetUserBillingCountersById(req: BaseRequest): Promise<UserBillingCountersAttributes> {
        return await this.UserBillingCountersBo.GetUserBillingCountersById(req);
    }

    public async GetUserBillingCounters(apiReq?: ApiRequest<UserBillingCountersFilters>):
        Promise<ApiResponse<UserBillingCountersAttributes[]>> {
        return await this.UserBillingCountersBo.GetUserBillingCounters(apiReq);
    }

    public async GetUserBillingCounterWithoutDenominations(apiReq?: ApiRequest<UserBillingCountersFilters>):
        Promise<ApiResponse<UserBillingCountersAttributes[]>> {
        return await this.UserBillingCountersBo.GetUserBillingCounterWithoutDenominations(apiReq);
    }

    public async GetBillingCounters(apiReq?: ApiRequest<UserBillingCountersFilters>):
        Promise<ApiResponse<UserBillingCountersAttributes[]>> {
        return await this.UserBillingCountersBo.GetBillingCounters(apiReq);
    }

    public async PrintUpdateUserBillingCounters(req: BaseRequest): Promise<FileInfo> {
        return await this.UserBillingCountersBo.PrintUpdateUserBillingCounters(req);
    }
}
