import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { Paginator, BaseRequest, ApiRequest } from '../../../Common/Index';
import { ProcedureTemplateInstance, ProcedureTemplateAttributes } from '../Model/Interface/Index';
import { ProcedureTemplateFilters } from '../Common/Filters.e';

export class ProcedureTemplateBo extends BaseBo<ProcedureTemplateInstance, ProcedureTemplateAttributes> {
    public async AddProcedureTemplate(req: BaseRequest): Promise<number> {
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateProcedureTemplate(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetProcedureTemplateById(req: BaseRequest): Promise<ProcedureTemplateAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetProcedureTemplates(apiReq?: ApiRequest<ProcedureTemplateFilters>): Promise<Array<ProcedureTemplateAttributes>> {
        let where: WhereOptions<any>= {};
        let include: Array<IncludeOptions> = [];
        include.push(this.GetReference('ProcedureTemplateType'));
        include.push(this.GetReference('ProcedureTemplateGroup'));
        include.push(this.GetReference('ProcedureTemplateCategory'));
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case ProcedureTemplateFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case ProcedureTemplateFilters.Name:
                        where['Name'] = param.Value;
                        break;
                    case ProcedureTemplateFilters.ProcedureId:
                        where['ProcedureId'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
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

    public async DeleteProcedureTemplate(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<ProcedureTemplateInstance, ProcedureTemplateAttributes> {
        return this.Models.ProcedureTemplate;
    }
}
