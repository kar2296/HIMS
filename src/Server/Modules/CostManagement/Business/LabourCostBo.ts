import * as SStatic from 'sequelize';
import { BaseBo, IOptionProvider } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { BaseRequest, ApiRequest, ApiResponse } from '../../../Common/Index';
import { LabourCostInstance, LabourCostAttributes } from '../Model/Interface/Index';
import { LabourCostFilters } from '../Common/Filters.e';

export class LabourCostBo extends BaseBo<LabourCostInstance, LabourCostAttributes> implements IOptionProvider {
    public async AddLabourCost(req: BaseRequest): Promise<number> {
        this.HandleActiveState(req.Data);
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateLabourCost(req: BaseRequest): Promise<boolean> {
        this.HandleActiveState(req.Data);
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetLabourCostById(req: BaseRequest): Promise<LabourCostAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetLabourCosts(apiReq?: ApiRequest<LabourCostFilters>): Promise<ApiResponse<LabourCostAttributes[]>> {
        let where: WhereOptions<any>= {};
        let include: Array<IncludeOptions> = [];
        include.push(this.GetReference('EmployeeType'));
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName'], as: 'empName', required: false,
            include: [this.GetReference('Title')]
        });
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case LabourCostFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case LabourCostFilters.CostDetailId:
                        where['CostDetailId'] = param.Value;
                        break;
				    case LabourCostFilters.FacilityId:
                        where['FacilityId'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeleteLabourCost(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public async GetOptions(key: string, apiReq?: ApiRequest<LabourCostFilters>): Promise<any> {
        // apiReq.Attributes = apiReq.Attributes || ['Id', ['AllergyName', 'Text'], 'AllergyName', 'AllergyTypeId', 'Description'];
        let val = await this.GetLabourCosts(apiReq);
        return { [key]: val.Data };
    }

    public GetModel(): SStatic.Model<LabourCostInstance, LabourCostAttributes> {
        return this.Models.LabourCost;
    }
}
