import * as SStatic  from 'sequelize';
import {BaseBo} from '../../Base/Index';
import {WhereOptions, IncludeOptions} from '../../../Core/Index';
import {Paginator, BaseRequest, ApiRequest} from '../../../Common/Index';
import { ResearchProjectMemberInstance, ResearchProjectMemberAttributes} from '../Model/Interface/Index';
import { ResearchProjectMemberFilters } from '../Common/Filters.e';

export class ResearchProjectMemberBo extends BaseBo<ResearchProjectMemberInstance, ResearchProjectMemberAttributes> {
    public async AddResearchProjectMember(req: BaseRequest): Promise<number> {
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateResearchProjectMember(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetResearchProjectMemberById(req: BaseRequest): Promise<ResearchProjectMemberAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetResearchProjectMembers(apiReq?: ApiRequest<ResearchProjectMemberFilters>):
                                            Promise<Array<ResearchProjectMemberAttributes>> {
        let where: WhereOptions<any>= {};
        let include: Array<IncludeOptions> = [];
        include.push({ model: this.Models.User, attributes: ['FirstName'], required: false });
        apiReq.Params.forEach((param) => {
            switch (param.Key) {
                case ResearchProjectMemberFilters.Id:
                    where['Id'] = param.Value;
                    break;
                case ResearchProjectMemberFilters.Name:
                    where['Name'] = param.Value;
                    break;
                case ResearchProjectMemberFilters.ResearchProjectId:
                    where['ResearchProjectId'] = param.Value;
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

    public async DeleteResearchProjectMember(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<ResearchProjectMemberInstance, ResearchProjectMemberAttributes> {
        return this.Models.ResearchProjectMember;
    }
}
