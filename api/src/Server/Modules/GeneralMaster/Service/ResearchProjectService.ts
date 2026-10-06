import {BaseService, BoFactory} from '../../Base/Index';
import { ResearchProjectBo} from '../Business/Index';
import {ApiRequest, BaseRequest, ApiResponse} from '../../../Common/Index';
import {Request} from '../../../Core/Index';
import { ResearchProjectAttributes} from '../Model/Interface/Index';
import { ResearchProjectFilters } from '../Common/Filters.e';

export class ResearchProjectService extends BaseService {
    private ResearchProjectBo: ResearchProjectBo;
    constructor(req?: Request) {
        super(req);
        this.ResearchProjectBo = BoFactory.GetBo(ResearchProjectBo, this.Request);
    }

    public async AddResearchProject(req: BaseRequest): Promise<number> {
        return await this.ResearchProjectBo.AddResearchProject(req);
    }

    public async UpdateResearchProject(req: BaseRequest): Promise<boolean> {
        return await this.ResearchProjectBo.UpdateResearchProject(req);
    }

    public async GetResearchProjectById(req: BaseRequest): Promise<ResearchProjectAttributes> {
        return await this.ResearchProjectBo.GetResearchProjectById(req);
    }

    public async GetResearchProjects(apiReq?: ApiRequest<ResearchProjectFilters>): Promise<ApiResponse<ResearchProjectAttributes[]>> {
        return await this.ResearchProjectBo.GetResearchProjects(apiReq);
    }

    public async DeleteResearchProject(req: BaseRequest): Promise<Boolean> {
        return await this.ResearchProjectBo.DeleteResearchProject(req);
    }
}
