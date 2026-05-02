import * as SStatic from 'sequelize';
import { BaseBo, IOptionProvider } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { BaseRequest, ApiRequest, ApiResponse } from '../../../Common/Index';
import { AssessmentInstance, AssessmentAttributes } from '../Model/Interface/Index';
import { AssessmentFilters } from '../Common/Filters.e';

export class AssessmentBo extends BaseBo<AssessmentInstance, AssessmentAttributes> implements IOptionProvider {
    public async AddAssessment(req: BaseRequest): Promise<number> {
        this.HandleActiveState(req.Data);
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateAssessment(req: BaseRequest): Promise<boolean> {
        this.HandleActiveState(req.Data);
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetAssessmentById(req: BaseRequest): Promise<AssessmentAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetAssessments(apiReq?: ApiRequest<AssessmentFilters>): Promise<ApiResponse<AssessmentAttributes[]>> {
        let where: WhereOptions<any>= {};
        let include: Array<IncludeOptions> = [];
        include.push({ model: this.Models.SectionMaster, attributes: ['Name'], required: false });
        include.push({ model: this.Models.Department, attributes: ['DepartmentName'], required: false });
        include.push(this.GetReference('ActiveStatus'));
        include.push(this.GetReference('AssessmentType'));
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case AssessmentFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case AssessmentFilters.Name:
                        (where as any)['$or'] = [{ 'AssessmentName': { '$like': (param.Value || '') + '%' } },
                        { 'Code': { '$like': (param.Value || '') + '%' } }];
                        break;
                    case AssessmentFilters.DepartmentId:
                        where['DepartmentId'] = param.Value;
                        break;
                    case AssessmentFilters.ActiveStatusId:
                        where['ActiveStatusId'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeleteAssessment(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public async GetOptions(key: string, apiReq?: ApiRequest<AssessmentFilters>): Promise<any> {
        apiReq.Attributes = apiReq.Attributes || ['Id',['AssessmentName','Text'],'AssessmentName'];
        let val = await this.GetAssessments(apiReq);
        return { [key]: val.Data };
    }

    public GetModel(): SStatic.Model<AssessmentInstance, AssessmentAttributes> {
        return this.Models.Assessment;
    }
}
