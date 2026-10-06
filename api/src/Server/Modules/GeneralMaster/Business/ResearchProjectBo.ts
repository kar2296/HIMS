import * as SStatic from 'sequelize';
import { BaseBo, IOptionProvider } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { BaseRequest, ApiRequest, ApiResponse } from '../../../Common/Index';
import { ResearchProjectInstance, ResearchProjectAttributes } from '../Model/Interface/Index';
import { ResearchProjectFilters } from '../Common/Filters.e';

export class ResearchProjectBo extends BaseBo<ResearchProjectInstance, ResearchProjectAttributes> implements IOptionProvider {
    public async AddResearchProject(req: BaseRequest): Promise<number> {
        this.HandleActiveState(req.Data);
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateResearchProject(req: BaseRequest): Promise<boolean> {
        this.HandleActiveState(req.Data);
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetResearchProjectById(req: BaseRequest): Promise<ResearchProjectAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetResearchProjects(apiReq?: ApiRequest<ResearchProjectFilters>): Promise<ApiResponse<ResearchProjectAttributes[]>> {
        let where: WhereOptions<any>= {};
        let include: Array<IncludeOptions> = [];
        include.push({ model: this.Models.Facility, attributes: ['FacilityName'], required: false });
        include.push(this.GetReference('ProjectType'));
        include.push(this.GetReference('ActiveStatus'));
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case ResearchProjectFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case ResearchProjectFilters.Name:
                        where['ProjectName'] = { '$like': (param.Value || '') + '%' };
                        break;
                    case ResearchProjectFilters.Facility:
                        where['FacilityId'] = param.Value;
                        break;
                    case ResearchProjectFilters.ProjectType:
                        where['ProjectTypeId'] = param.Value;
                        break;
                    case ResearchProjectFilters.ActiveStatus:
                        where['ActiveStatusId'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeleteResearchProject(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public async GetOptions(key: string, apiReq?: ApiRequest<ResearchProjectFilters>): Promise<any> {
        apiReq.Attributes = apiReq.Attributes || ['Id', ['ProjectName', 'Text'], 'ProjectName', 'ProjectCode', 'ProjectTypeId'];
        let val = await this.GetResearchProjects(apiReq);
        return { [key]: val.Data };
    }

    public GetModel(): SStatic.Model<ResearchProjectInstance, ResearchProjectAttributes> {
        return this.Models.ResearchProject;
    }
}
