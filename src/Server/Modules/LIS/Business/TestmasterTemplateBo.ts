import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest } from '../../../Common/Index';
import { TestmasterTemplateInstance, TestmasterTemplateAttributes } from '../Model/Interface/Index';
import { TestmasterTemplateFilters } from '../Common/Filters.e';

export class TestmasterTemplateBo extends BaseBo<TestmasterTemplateInstance, TestmasterTemplateAttributes>  {
    public async AddTestmasterTemplate(req: BaseRequest): Promise<number> {
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateTestmasterTemplate(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetTestmasterTemplateById(req: BaseRequest): Promise<TestmasterTemplateAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetTestmasterTemplates(apiReq?: ApiRequest<TestmasterTemplateFilters>):
        Promise<ApiResponse<TestmasterTemplateAttributes[]>> {
        let where: WhereOptions<any>= {};
        let include: Array<IncludeOptions> = [];
        apiReq.Params.forEach((param) => {
            switch (param.Key) {
                case TestmasterTemplateFilters.Id:
                    where['Id'] = param.Value;
                    break;
                case TestmasterTemplateFilters.TestMasterId:
                    where['TestMasterId'] = param.Value;
                    break;
                default:
                    throw 'Not Implemented';
            }
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeleteTestmasterTemplate(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<TestmasterTemplateInstance, TestmasterTemplateAttributes> {
        return this.Models.TestmasterTemplate;
    }

}
