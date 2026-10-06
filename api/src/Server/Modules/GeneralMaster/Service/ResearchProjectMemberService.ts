import {BaseService, BoFactory} from '../../Base/Index';
import { ResearchProjectMemberBo} from '../Business/Index';
import {ApiRequest, BaseRequest} from '../../../Common/Index';
import {Request} from '../../../Core/Index';
import { ResearchProjectMemberAttributes} from '../Model/Interface/Index';
import { ResearchProjectMemberFilters } from '../Common/Filters.e';

export class ResearchProjectMemberService extends BaseService {
    private ResearchProjectMemberBo: ResearchProjectMemberBo;
    constructor(req?: Request) {
        super(req);
        this.ResearchProjectMemberBo = BoFactory.GetBo(ResearchProjectMemberBo, this.Request);
    }

    public async AddResearchProjectMember(req: BaseRequest): Promise<number> {
        return await this.ResearchProjectMemberBo.AddResearchProjectMember(req);
    }

    public async UpdateResearchProjectMember(req: BaseRequest): Promise<boolean> {
        return await this.ResearchProjectMemberBo.UpdateResearchProjectMember(req);
    }

    public async GetResearchProjectMemberById(req: BaseRequest): Promise<ResearchProjectMemberAttributes> {
        return await this.ResearchProjectMemberBo.GetResearchProjectMemberById(req);
    }

    public async GetResearchProjectMembers(apiReq?: ApiRequest<ResearchProjectMemberFilters>):
                                                Promise<Array<ResearchProjectMemberAttributes>> {
        return await this.ResearchProjectMemberBo.GetResearchProjectMembers(apiReq);
    }

    public async DeleteResearchProjectMember(req: BaseRequest): Promise<Boolean> {
        return await this.ResearchProjectMemberBo.DeleteResearchProjectMember(req);
    }
}
