import {BaseService, BoFactory } from '../../Base/Index';
import { UserPreferenceBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { UserPreferenceAttributes } from '../Model/Interface/Index';
import { UserPreferenceFilters } from '../Common/Filters.e';

export class UserPreferenceService extends BaseService {
    private UserPreferenceBo: UserPreferenceBo;
    constructor(req?: Request) {
        super(req);
        this.UserPreferenceBo = BoFactory.GetBo(UserPreferenceBo, this.Request);
    }

    public async AddUserPreference(req: BaseRequest): Promise<number> {
        return await this.UserPreferenceBo.AddUserPreference(req);
    }

    public async UpdateUserPreference(req: BaseRequest): Promise<boolean> {
        return await this.UserPreferenceBo.UpdateUserPreference(req);
    }

    public async GetUserPreferenceById(req: BaseRequest): Promise<UserPreferenceAttributes> {
        return await this.UserPreferenceBo.GetUserPreferenceById(req);
    }

    public async GetUserPreferences(apiReq?: ApiRequest<UserPreferenceFilters>): Promise<ApiResponse<UserPreferenceAttributes[]>> {
        return await this.UserPreferenceBo.GetUserPreferences(apiReq);
    }

    public async DeleteUserPreference(req: BaseRequest): Promise<Boolean> {
        return await this.UserPreferenceBo.DeleteUserPreference(req);
    }
}
