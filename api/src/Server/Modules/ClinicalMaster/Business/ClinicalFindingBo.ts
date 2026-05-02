import * as SStatic from 'sequelize';
import { BaseBo, IOptionProvider } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { BaseRequest, ApiRequest, ApiResponse } from '../../../Common/Index';
import { ClinicalFindingInstance, ClinicalFindingAttributes } from '../Model/Interface/Index';
import { ClinicalFindingFilters } from '../Common/Filters.e';

export class ClinicalFindingBo extends BaseBo<ClinicalFindingInstance, ClinicalFindingAttributes> implements IOptionProvider {
    public async AddClinicalFinding(req: BaseRequest): Promise<number> {
        this.HandleActiveState(req.Data);
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateClinicalFinding(req: BaseRequest): Promise<boolean> {
        this.HandleActiveState(req.Data);
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetClinicalFindingById(req: BaseRequest): Promise<ClinicalFindingAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetClinicalFindings(apiReq?: ApiRequest<ClinicalFindingFilters>):
        Promise<ApiResponse<ClinicalFindingAttributes[]>> {
        let where: WhereOptions<any> = {};
        let order: Array<any> = [];
        let include: Array<IncludeOptions> = [];
        include.push(this.GetReference('ActiveStatus'));
        include.push(this.GetReference('FindingType'));
        include.push({ model: this.Models.Department, required: false });
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case ClinicalFindingFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case ClinicalFindingFilters.Name:
                        (where as any)['$or'] = [
                            { 'Name': { '$like': (param.Value || '') + '%' } },
                            { 'Code': { '$like': (param.Value || '') + '%' } }
                        ];
                        break;
                    case ClinicalFindingFilters.FindingTypeId:
                        where['FindingTypeId'] = param.Value;
                        break;
                    case ClinicalFindingFilters.DepartmentId:
                        where['DepartmentId'] = param.Value;
                        break;
                    case ClinicalFindingFilters.ActiveStatusId:
                        where['ActiveStatusId'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        order.push(['UpdatedAt', 'DESC']);
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes, order: order });
    }

    public async DeleteClinicalFinding(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }
    public async GetOptions(key: string, apiReq?: ApiRequest<ClinicalFindingFilters>): Promise<any> {
        apiReq.Attributes = apiReq.Attributes || ['Id', ['Name', 'Text'], 'Name'];
        let val = await this.GetClinicalFindings(apiReq);
        return { [key]: val.Data };
    }
    public GetModel(): SStatic.Model<ClinicalFindingInstance, ClinicalFindingAttributes> {
        return this.Models.ClinicalFinding;
    }
}
