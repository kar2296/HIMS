import * as SStatic from 'sequelize';
import { BaseBo, IOptionProvider } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { BaseRequest, ApiRequest, ApiResponse } from '../../../Common/Index';
import { CarePathAssessmentInstance, CarePathAssessmentAttributes } from '../Model/Interface/Index';
import { CarePathAssessmentFilters } from '../Common/Filters.e';

export class CarePathAssessmentBo extends BaseBo<CarePathAssessmentInstance, CarePathAssessmentAttributes> implements IOptionProvider {
    public async AddCarePathAssessment(req: BaseRequest): Promise<number> {
        this.HandleActiveState(req.Data);
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateCarePathAssessment(req: BaseRequest): Promise<boolean> {
        this.HandleActiveState(req.Data);
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetCarePathAssessmentById(req: BaseRequest): Promise<CarePathAssessmentAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetCarePathAssessments(apiReq?: ApiRequest<CarePathAssessmentFilters>):
        Promise<ApiResponse<CarePathAssessmentAttributes[]>> {
        let where: WhereOptions<any>= {};
        let include: Array<IncludeOptions> = [];
        include.push({ model: this.Models.Assessment, attributes: ['AssessmentName'], required: false });
        include.push(this.GetReference('ActiveStatus'));
        include.push(this.GetReference('AssessmentType'));
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case CarePathAssessmentFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case CarePathAssessmentFilters.CarePathId:
                        where['CarePathId'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeleteCarePathAssessment(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public async GetOptions(key: string, apiReq?: ApiRequest<CarePathAssessmentFilters>): Promise<any> {
        apiReq.Attributes = apiReq.Attributes || ['Id'];
        let val = await this.GetCarePathAssessments(apiReq);
        return { [key]: val.Data };
    }

    public GetModel(): SStatic.Model<CarePathAssessmentInstance, CarePathAssessmentAttributes> {
        return this.Models.CarePathAssessment;
    }
}
