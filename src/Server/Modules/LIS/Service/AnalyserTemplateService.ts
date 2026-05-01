import {BaseService, BoFactory} from '../../Base/Index';
import { AnalyserTemplateBo} from '../Business/Index';
import {ApiRequest, BaseRequest, ApiResponse} from '../../../Common/Index';
import {Request} from '../../../Core/Index';
import { AnalyserTemplateAttributes} from '../Model/Interface/Index';
import { AnalyserTemplateFilters } from '../Common/Filters.e';

export class AnalyserTemplateService extends BaseService {
    private AnalyserTemplateBo: AnalyserTemplateBo;
    constructor(req?: Request) {
        super(req);
        this.AnalyserTemplateBo = BoFactory.GetBo(AnalyserTemplateBo, this.Request);
    }

    public async AddAnalyserTemplate(req: BaseRequest): Promise<number> {
        return await this.AnalyserTemplateBo.AddAnalyserTemplate(req);
    }

    public async UpdateAnalyserTemplate(req: BaseRequest): Promise<boolean> {
        return await this.AnalyserTemplateBo.UpdateAnalyserTemplate(req);
    }

    public async GetAnalyserTemplateById(req: BaseRequest): Promise<AnalyserTemplateAttributes> {
        return await this.AnalyserTemplateBo.GetAnalyserTemplateById(req);
    }

    public async GetAnalyserTemplates(apiReq?: ApiRequest<AnalyserTemplateFilters>): Promise<ApiResponse<AnalyserTemplateAttributes[]>> {
        return await this.AnalyserTemplateBo.GetAnalyserTemplates(apiReq);
    }

    public async DeleteAnalyserTemplate(req: BaseRequest): Promise<Boolean> {
        return await this.AnalyserTemplateBo.DeleteAnalyserTemplate(req);
    }
}
