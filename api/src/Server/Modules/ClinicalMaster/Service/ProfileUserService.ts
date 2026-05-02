import {BaseService, BoFactory } from '../../Base/Index';
import { ProfileUserBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { ProfileUserAttributes } from '../Model/Interface/Index';
import { ProfileUserFilters } from '../Common/Filters.e';

export class ProfileUserService extends BaseService {
    private ProfileUserBo: ProfileUserBo;
    constructor(req?: Request) {
        super(req);
        this.ProfileUserBo = BoFactory.GetBo(ProfileUserBo, this.Request);
    }

    public async AddProfileUser(req: BaseRequest): Promise<number> {
        return await this.ProfileUserBo.AddProfileUser(req);
    }

    public async UpdateProfileUser(req: BaseRequest): Promise<boolean> {
        return await this.ProfileUserBo.UpdateProfileUser(req);
    }

    public async GetProfileUserById(req: BaseRequest): Promise<ProfileUserAttributes> {
        return await this.ProfileUserBo.GetProfileUserById(req);
    }

    public async GetProfileUsers(apiReq?: ApiRequest<ProfileUserFilters>): Promise<ApiResponse<ProfileUserAttributes[]>> {
        return await this.ProfileUserBo.GetProfileUsers(apiReq);
    }

    public async DeleteProfileUser(req: BaseRequest): Promise<Boolean> {
        return await this.ProfileUserBo.DeleteProfileUser(req);
    }
}
