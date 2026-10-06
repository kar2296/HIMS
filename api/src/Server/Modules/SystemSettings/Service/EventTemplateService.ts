import {BaseService, BoFactory } from '../../Base/Index';
import { EventTemplateBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { EventTemplateAttributes } from '../Model/Interface/Index';
import { EventTemplateFilters } from '../Common/Filters.e';

export class EventTemplateService extends BaseService {
    private EventTemplateBo: EventTemplateBo;
    constructor(req?: Request) {
        super(req);
        this.EventTemplateBo = BoFactory.GetBo(EventTemplateBo, this.Request);
    }

    public async AddEventTemplate(req: BaseRequest): Promise<number> {
        return await this.EventTemplateBo.AddEventTemplate(req);
    }

    public async UpdateEventTemplate(req: BaseRequest): Promise<boolean> {
        return await this.EventTemplateBo.UpdateEventTemplate(req);
    }

    public async GetEventTemplateById(req: BaseRequest): Promise<EventTemplateAttributes> {
        return await this.EventTemplateBo.GetEventTemplateById(req);
    }

    public async GetEventTemplates(apiReq?: ApiRequest<EventTemplateFilters>): Promise<ApiResponse<EventTemplateAttributes[]>> {
        return await this.EventTemplateBo.GetEventTemplates(apiReq);
    }

    public async DeleteEventTemplate(req: BaseRequest): Promise<Boolean> {
        return await this.EventTemplateBo.DeleteEventTemplate(req);
    }
}
