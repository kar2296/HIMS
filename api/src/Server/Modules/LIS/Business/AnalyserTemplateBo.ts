import * as SStatic from 'sequelize';
import { BaseBo, IOptionProvider } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { BaseRequest, ApiRequest, ApiResponse } from '../../../Common/Index';
import { AnalyserTemplateInstance, AnalyserTemplateAttributes } from '../Model/Interface/Index';
import { AnalyserTemplateFilters } from '../Common/Filters.e';

export class AnalyserTemplateBo extends BaseBo<AnalyserTemplateInstance, AnalyserTemplateAttributes> implements IOptionProvider {
    public async AddAnalyserTemplate(req: BaseRequest): Promise<number> {
        this.HandleActiveState(req.Data);
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateAnalyserTemplate(req: BaseRequest): Promise<boolean> {
        this.HandleActiveState(req.Data);
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetAnalyserTemplateById(req: BaseRequest): Promise<AnalyserTemplateAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetAnalyserTemplates(apiReq?: ApiRequest<AnalyserTemplateFilters>): Promise<ApiResponse<AnalyserTemplateAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        include.push(this.GetReference('Gender'));
        include.push(this.GetReference('AnalyserTemplateType'));
        include.push(this.GetReference('ActiveStatus'));
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case AnalyserTemplateFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case AnalyserTemplateFilters.GenderId:
                        where['GenderId'] = param.Value;
                        break;
                    case AnalyserTemplateFilters.ActiveStatusId:
                        where['ActiveStatusId'] = param.Value;
                        break;
                    case AnalyserTemplateFilters.AnalyserTemplateTypeId:
                        where['AnalyserTemplateTypeId'] = param.Value;
                        break;
                    case AnalyserTemplateFilters.AnalyteId:
                        where['AnalyteId'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeleteAnalyserTemplate(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public async GetOptions(key: string, apiReq?: ApiRequest<AnalyserTemplateFilters>): Promise<any> {
        // apiReq.Attributes = apiReq.Attributes || ['Id', ['AllergyName', 'Text'], 'AllergyName', 'AllergyTypeId', 'Description'];
        let val = await this.GetAnalyserTemplates(apiReq);
        return { [key]: val.Data };
    }

    public GetModel(): SStatic.Model<AnalyserTemplateInstance, AnalyserTemplateAttributes> {
        return this.Models.AnalyserTemplate;
    }
}
