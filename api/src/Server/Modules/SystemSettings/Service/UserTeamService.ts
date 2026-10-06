import { BaseService, BoFactory } from '../../Base/Index';
import { UserTeamBo } from '../Business/Index';
import { ApiRequest, BaseRequest } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { UserTeamAttributes } from '../Model/Interface/Index';
import { UserTeamFilters } from '../Common/Filters.e';

export class UserTeamService extends BaseService {
    private UserTeamBo: UserTeamBo;
    constructor(req?: Request) {
        super(req);
        this.UserTeamBo = BoFactory.GetBo(UserTeamBo, this.Request);
    }

    public async AddUserTeam(req: BaseRequest): Promise<number> {
        return await this.UserTeamBo.AddUserTeam(req);
    }

    public async UpdateUserTeam(req: BaseRequest): Promise<boolean> {
        return await this.UserTeamBo.UpdateUserTeam(req);
    }

    public async GetUserTeamById(req: BaseRequest): Promise<UserTeamAttributes> {
        return await this.UserTeamBo.GetUserTeamById(req);
    }

    public async ManageUserTeams(req: BaseRequest): Promise<boolean> {
        return await this.UserTeamBo.ManageUserTeams(req);
    }

    public async GetUserTeams(apiReq?: ApiRequest<UserTeamFilters>): Promise<Array<UserTeamAttributes>> {
        return await this.UserTeamBo.GetUserTeams(apiReq);
    }

    public async DeleteUserTeam(req: BaseRequest): Promise<Boolean> {
        return await this.UserTeamBo.DeleteUserTeam(req);
    }
}
