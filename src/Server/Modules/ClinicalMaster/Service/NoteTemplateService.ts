import {BaseService, BoFactory} from '../../Base/Index';
import { NoteTemplateBo} from '../Business/Index';
import {ApiRequest, BaseRequest, ApiResponse} from '../../../Common/Index';
import {Request} from '../../../Core/Index';
import { NoteTemplateAttributes} from '../Model/Interface/Index';
import { NoteTemplateFilters } from '../Common/Filters.e';

export class NoteTemplateService extends BaseService {
    private NoteTemplateBo: NoteTemplateBo;
    constructor(req?: Request) {
        super(req);
        this.NoteTemplateBo = BoFactory.GetBo(NoteTemplateBo, this.Request);
    }

    public async AddNoteTemplate(req: BaseRequest): Promise<number> {
        return await this.NoteTemplateBo.AddNoteTemplate(req);
    }

    public async UpdateNoteTemplate(req: BaseRequest): Promise<boolean> {
        return await this.NoteTemplateBo.UpdateNoteTemplate(req);
    }

    public async GetNoteTemplateById(req: BaseRequest): Promise<NoteTemplateAttributes> {
        return await this.NoteTemplateBo.GetNoteTemplateById(req);
    }

    public async GetNoteTemplates(apiReq?: ApiRequest<NoteTemplateFilters>): Promise<ApiResponse<NoteTemplateAttributes[]>> {
        return await this.NoteTemplateBo.GetNoteTemplates(apiReq);
    }

    public async DeleteNoteTemplate(req: BaseRequest): Promise<Boolean> {
        return await this.NoteTemplateBo.DeleteNoteTemplate(req);
    }
}
