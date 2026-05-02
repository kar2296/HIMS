import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest } from '../../../Common/Index';
import { EventTemplateInstance, EventTemplateAttributes } from '../Model/Interface/Index';
import { EventTemplateFilters } from '../Common/Filters.e';

export class EventTemplateBo extends BaseBo<EventTemplateInstance, EventTemplateAttributes>  {
    public async AddEventTemplate(req: BaseRequest): Promise<number> {
        this.HandleActiveState(req.Data);
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateEventTemplate(req: BaseRequest): Promise<boolean> {
        this.HandleActiveState(req.Data);
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetEventTemplateById(req: BaseRequest): Promise<EventTemplateAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetEventTemplates(apiReq?: ApiRequest<EventTemplateFilters>): Promise<ApiResponse<EventTemplateAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        include.push({ model: this.Models.Facility, attributes: ['FacilityName'], required: false });
        include.push(this.GetReference('EventType'));
        include.push(this.GetReference('ActiveStatus'));
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case EventTemplateFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case EventTemplateFilters.FacilityId:
                        where['FacilityId'] = param.Value;
                        break;
                    case EventTemplateFilters.EventTypeId:
                        where['EventTypeId'] = param.Value;
                        break;
                    case EventTemplateFilters.ModuleName:
                        where['ModuleName'] = param.Value;
                        break;
                    case EventTemplateFilters.TemplateKey:
                        where['TemplateKey'] = param.Value;
                        break;
                    case EventTemplateFilters.IsActive:
                        where['IsActive'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async GetTemplateInfo(moduleName: string, templateKey: string, eventType: number): Promise<EventTemplateAttributes> {
        let apiReq = {
            Id: 0,
            PageContext: { PageNumber: 1, PageSize: 1 },
            Params: [
                { Key: EventTemplateFilters.ModuleName, Value: moduleName },
                { Key: EventTemplateFilters.TemplateKey, Value: templateKey },
                { Key: EventTemplateFilters.EventTypeId, Value: eventType },
                { Key: EventTemplateFilters.IsActive, Value: true }
            ]
        };
        let res = await this.GetEventTemplates(apiReq);
        return res.Data[0];
    }

    public async DeleteEventTemplate(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<EventTemplateInstance, EventTemplateAttributes> {
        return this.Models.EventTemplate;
    }

}
