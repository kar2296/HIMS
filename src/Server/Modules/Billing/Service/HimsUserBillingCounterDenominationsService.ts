import { BaseService, BoFactory } from '../../Base/Index';
import { UserBillingCounterDenominationsBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { UserBillingCounterDenominationsAttributes } from '../Model/Interface/Index';
import { UserBillingCounterDenominationsFilters } from '../Common/Filters.e';

export class UserBillingCounterDenominationsService extends BaseService {
    private UserBillingCounterDenominationsBo: UserBillingCounterDenominationsBo;
    constructor(req?: Request) {
        super(req);
        this.UserBillingCounterDenominationsBo = BoFactory.GetBo(UserBillingCounterDenominationsBo, this.Request);
    }

    public async AddUserBillingCounterDenominations(req: BaseRequest): Promise<number> {
        return await this.UserBillingCounterDenominationsBo.AddUserBillingCounterDenominations(req);
    }

    public async UpdateUserBillingCounterDenominations(req: BaseRequest): Promise<boolean> {
        return await this.UserBillingCounterDenominationsBo.UpdateUserBillingCounterDenominations(req);
    }

    public async GetUserBillingCounterDenominationsById(req: BaseRequest): Promise<UserBillingCounterDenominationsAttributes> {
        return await this.UserBillingCounterDenominationsBo.GetUserBillingCounterDenominationsById(req);
    }

    public async GetUserBillingCounterDenominations(apiReq?: ApiRequest<UserBillingCounterDenominationsFilters>):
        Promise<ApiResponse<UserBillingCounterDenominationsAttributes[]>> {
        return await this.UserBillingCounterDenominationsBo.GetUserBillingCounterDenominations(apiReq);
    }

    public async DeleteUserBillingCounterDenominations(req: BaseRequest): Promise<Boolean> {
        return await this.UserBillingCounterDenominationsBo.DeleteUserBillingCounterDenominations(req);
    }
}
