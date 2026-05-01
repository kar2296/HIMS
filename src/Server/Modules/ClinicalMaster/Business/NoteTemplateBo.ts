import * as SStatic from 'sequelize';
import { BaseBo, IOptionProvider } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { BaseRequest, ApiRequest, ApiResponse } from '../../../Common/Index';
import { NoteTemplateInstance, NoteTemplateAttributes } from '../Model/Interface/Index';
import { NoteTemplateFilters } from '../Common/Filters.e';

export class NoteTemplateBo extends BaseBo<NoteTemplateInstance, NoteTemplateAttributes> implements IOptionProvider {
    public async AddNoteTemplate(req: BaseRequest): Promise<number> {
        this.HandleActiveState(req.Data);
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateNoteTemplate(req: BaseRequest): Promise<boolean> {
        this.HandleActiveState(req.Data);
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetNoteTemplateById(req: BaseRequest): Promise<NoteTemplateAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetNoteTemplates(apiReq?: ApiRequest<NoteTemplateFilters>): Promise<ApiResponse<NoteTemplateAttributes[]>> {
        let where: WhereOptions<any>= {};
        let include: Array<IncludeOptions> = [];
        include.push(this.GetReference('ActiveStatus'));
        include.push(this.GetReference('NoteType'));
        include.push({ model: this.Models.Department, attributes: ['DepartmentName'], required: false });
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case NoteTemplateFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case NoteTemplateFilters.NoteType:
                        where['NoteTypeId'] = param.Value;
                        break;
                    case NoteTemplateFilters.Code:
                        (where as any)['$or'] = [{ 'Code': { '$like': '%' + (param.Value || '') + '%' } },
                        { 'TemplateName': { '$like': '%' + (param.Value || '') + '%' } }];
                        break;
                    case NoteTemplateFilters.Department:
                        where['DepartmentId'] = param.Value;
                        break;
                    case NoteTemplateFilters.ActiveStatus:
                        where['ActiveStatusId'] = param.Value;
                        break;
                    case NoteTemplateFilters.SubDepartmentId:
                        where['SubDepartmentId'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeleteNoteTemplate(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public async GetOptions(key: string, apiReq?: ApiRequest<NoteTemplateFilters>): Promise<any> {
        apiReq.Attributes = apiReq.Attributes || ['Id', ['TemplateName', 'Text'], 'TemplateName', 'Code', 'DepartmentId',
        'FacilityId', 'NoteTypeId'];
        let val = await this.GetNoteTemplates(apiReq);
        return { [key]: val.Data };
    }

    public GetModel(): SStatic.Model<NoteTemplateInstance, NoteTemplateAttributes> {
        return this.Models.NoteTemplate;
    }
}
