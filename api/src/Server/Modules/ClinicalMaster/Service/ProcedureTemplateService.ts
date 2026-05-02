import {BaseService, BoFactory} from '../../Base/Index';
import { ProcedureTemplateBo} from '../Business/Index';
import {ApiRequest, BaseRequest} from '../../../Common/Index';
import {Request} from '../../../Core/Index';
import { ProcedureTemplateAttributes} from '../Model/Interface/Index';
import { ProcedureTemplateFilters } from '../Common/Filters.e';

export class ProcedureTemplateService extends BaseService {
    private ProcedureTemplateBo: ProcedureTemplateBo;
    constructor(req?: Request) {
        super(req);
        this.ProcedureTemplateBo = BoFactory.GetBo(ProcedureTemplateBo, this.Request);
    }

    public async AddProcedureTemplate(req: BaseRequest): Promise<number> {
        return await this.ProcedureTemplateBo.AddProcedureTemplate(req);
    }

    public async UpdateProcedureTemplate(req: BaseRequest): Promise<boolean> {
        return await this.ProcedureTemplateBo.UpdateProcedureTemplate(req);
    }

    public async GetProcedureTemplateById(req: BaseRequest): Promise<ProcedureTemplateAttributes> {
        return await this.ProcedureTemplateBo.GetProcedureTemplateById(req);
    }

    public async GetProcedureTemplates(apiReq?: ApiRequest<ProcedureTemplateFilters>): Promise<Array<ProcedureTemplateAttributes>> {
        return await this.ProcedureTemplateBo.GetProcedureTemplates(apiReq);
    }

    public async DeleteProcedureTemplate(req: BaseRequest): Promise<Boolean> {
        return await this.ProcedureTemplateBo.DeleteProcedureTemplate(req);
    }
}
