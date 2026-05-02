import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { Paginator, BaseRequest, ApiRequest } from '../../../Common/Index';
import { UserTeamInstance, UserTeamAttributes } from '../Model/Interface/Index';
import { UserTeamFilters } from '../Common/Filters.e';

export class UserTeamBo extends BaseBo<UserTeamInstance, UserTeamAttributes> {
    public async AddUserTeam(req: BaseRequest): Promise<number> {
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateUserTeam(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetUserTeamById(req: BaseRequest): Promise<UserTeamAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }
    public async ManageUserTeams(req: BaseRequest): Promise<boolean> {
        let list: UserTeamAttributes[] = req.Data || [];
        let promises: Array<any> = [];
        list.forEach(item => {
            item.Id = item.Id || 0;
            if (item.Status === 2 && item.Id !== 0) {
                promises.push(this.MarkAsDelete(item.Id));
            } else if (item.Id === 0) {
                promises.push(this.Save(item));
            } else if (item.Id > 0) {
                promises.push(this.Update(item));
            }
        });
        await Promise.all(promises);
        return true;
    }
    public async GetUserTeams(apiReq?: ApiRequest<UserTeamFilters>): Promise<Array<UserTeamAttributes>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        // include.push({ model: this.Models.Team, attributes: ['TeamName'], required: false });
        include.push(this.GetReference('Team'));
        apiReq.Params.forEach((param) => {
            switch (param.Key) {
                case UserTeamFilters.Id:
                    where['Id'] = param.Value;
                    break;
                case UserTeamFilters.Name:
                    where['Name'] = param.Value;
                    break;
                case UserTeamFilters.UserId:
                    where['UserId'] = param.Value;
                    break;
                case UserTeamFilters.IsDefault:
                    where['IsDefault'] = param.Value;
                    break;
                case UserTeamFilters.TeamId:
                    where['TeamId'] = param.Value;
                    break;
                default:
                    throw 'Not Implemented';
            }
        });
        let pg: Paginator = new Paginator(apiReq.PageContext);
        let result = await this.FindAll({
            where: where,
            include: include,
            attributes: apiReq.Attributes,
            limit: pg.Limit, offset: pg.Offset
        });
        return this.GetAttributes(result);
    }

    public async DeleteUserTeam(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<UserTeamInstance, UserTeamAttributes> {
        return this.Models.UserTeam;
    }
}
