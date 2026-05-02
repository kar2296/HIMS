import { BaseService, BoFactory } from '../../Base/Index';
import { UserBillingCounterCancellationsBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { UserBillingCounterCancellationsAttributes } from '../Model/Interface/Index';
import { UserBillingCounterCancellationsFilters } from '../Common/Filters.e';

export class UserBillingCounterCancellationsService extends BaseService {
    private UserBillingCounterCancellationsBo: UserBillingCounterCancellationsBo;
    constructor(req?: Request) {
        super(req);
        this.UserBillingCounterCancellationsBo = BoFactory.GetBo(UserBillingCounterCancellationsBo, this.Request);
    }

    public async AddUserBillingCounterCancellations(req: BaseRequest): Promise<number> {
        return await this.UserBillingCounterCancellationsBo.AddUserBillingCounterCancellations(req);
    }

    public async UpdateUserBillingCounterCancellations(req: BaseRequest): Promise<boolean> {
        return await this.UserBillingCounterCancellationsBo.UpdateUserBillingCounterCancellations(req);
    }

    public async GetUserBillingCounterCancellationsById(req: BaseRequest): Promise<UserBillingCounterCancellationsAttributes> {
        return await this.UserBillingCounterCancellationsBo.GetUserBillingCounterCancellationsById(req);
    }

    public async GetUserBillingCounterCancellations(apiReq?: ApiRequest<UserBillingCounterCancellationsFilters>):
        Promise<ApiResponse<UserBillingCounterCancellationsAttributes[]>> {
        return await this.UserBillingCounterCancellationsBo.GetUserBillingCounterCancellations(apiReq);
    }

    public async DeleteUserBillingCounterCancellations(req: BaseRequest): Promise<Boolean> {
        return await this.UserBillingCounterCancellationsBo.DeleteUserBillingCounterCancellations(req);
    }
}
