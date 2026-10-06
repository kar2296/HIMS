import {BaseService, BoFactory} from '../../Base/Index';
import { TeamBo} from '../Business/Index';
import {ApiRequest, BaseRequest, ISearchEnums} from '../../../Common/Index';
import {Request} from '../../../Core/Index';
import { TeamAttributes} from '../Model/Interface/Index';

export class TeamService extends BaseService {
    private TeamBo: TeamBo;
    constructor(req?: Request) {
        super(req);
        this.TeamBo = BoFactory.GetBo(TeamBo, this.Request);
    }

    public async AddTeam(req: BaseRequest): Promise<number> {
        return await this.TeamBo.AddTeam(req);
    }

    public async UpdateTeam(req: BaseRequest): Promise<boolean> {
        return await this.TeamBo.UpdateTeam(req);
    }

    public async GetTeamById(req: BaseRequest): Promise<TeamAttributes> {
        return await this.TeamBo.GetTeamById(req);
    }

    public async GetTeams(apiReq?: ApiRequest<ISearchEnums>): Promise<Array<TeamAttributes>> {
        return await this.TeamBo.GetTeams(apiReq);
    }

    public async DeleteTeam(req: BaseRequest): Promise<Boolean> {
        return await this.TeamBo.DeleteTeam(req);
    }
}
