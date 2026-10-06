import * as SStatic  from 'sequelize';
import {BaseBo, IOptionProvider} from '../../Base/Index';
import {WhereOptions} from '../../../Core/Index';
import {Paginator, BaseRequest, ApiRequest, ISearchEnums} from '../../../Common/Index';
import { TeamInstance, TeamAttributes} from '../Model/Interface/Index';

export class TeamBo extends BaseBo<TeamInstance, TeamAttributes> implements IOptionProvider {
    public async AddTeam(req: BaseRequest): Promise<number> {
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateTeam(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetTeamById(req: BaseRequest): Promise<TeamAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetTeams(apiReq?: ApiRequest<ISearchEnums>): Promise<Array<TeamAttributes>> {
        let where: WhereOptions<any>= {};
        apiReq.Params.forEach((param) => {
            switch (param.Key) {
                case ISearchEnums.Id:
                    where['Id'] = param.Value;
                    break;
                case ISearchEnums.Name:
                    where['Name'] = param.Value;
                    break;
                default:
                    throw 'Not Implemented';
            }
        });
        let pg: Paginator = new Paginator(apiReq.PageContext);
        let result = await this.FindAll({ where: where, limit: pg.Limit, offset: pg.Offset, attributes: apiReq.Attributes });
        return this.GetAttributes(result);
    }

    public async DeleteTeam(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<TeamInstance, TeamAttributes> {
        return this.Models.Team;
    }

    public async GetOptions(key: string, apiReq?: ApiRequest<ISearchEnums>): Promise<any> {
        apiReq.Attributes = apiReq.Attributes || ['Id', ['TeamName', 'Text']];
        let val = await this.GetTeams(apiReq);
        return { [key]: val };
    }

}
