import * as SStatic from 'sequelize';
import { BaseBo, IOptionProvider, } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { BaseRequest, ApiRequest, ApiResponse } from '../../../Common/Index';
import { CostDetailInstance, CostDetailAttributes } from '../Model/Interface/Index';
import { CostDetailFilters } from '../Common/Filters.e';

export class CostDetailBo extends BaseBo<CostDetailInstance, CostDetailAttributes> implements IOptionProvider {
    public async AddCostDetail(req: BaseRequest): Promise<number> {
        this.HandleActiveState(req.Data);
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateCostDetail(req: BaseRequest): Promise<boolean> {
        this.HandleActiveState(req.Data);
        let result = await this.Update(req.Data);
        return result;
    }
    public async GetCostDetailById(req: BaseRequest): Promise<CostDetailAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetCostDetails(apiReq?: ApiRequest<CostDetailFilters>): Promise<ApiResponse<CostDetailAttributes[]>> {
        let where: WhereOptions<any>= {};
        let include: Array<IncludeOptions> = [];
        let order: Array<any> = [];
        let attributes: any = {};
        attributes['include'] = [];
        include.push({ model: this.Models.Department, attributes: ['DepartmentName'], required: false });
        include.push(this.GetReference('ActiveStatus'));
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case CostDetailFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case CostDetailFilters.DepartmentId:
                        where['DepartmentId'] = param.Value;
                        break;
                    case CostDetailFilters.ActiveStatus:
                        where['ActiveStatusId'] = param.Value;
                        break;
                    case CostDetailFilters.FacilityId:
                        where['FacilityId'] = param.Value;
                        break;
                    case CostDetailFilters.ItemName:
                        where['ItemName'] = { '$like': (param.Value || '') + '%' };
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        order.push(['CreatedAt', 'DESC']);
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes, order: order });
    }

    public async DeleteCostDetail(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public async GetOptions(key: string, apiReq?: ApiRequest<CostDetailFilters>): Promise<any> {
        // apiReq.Attributes = apiReq.Attributes || ['Id', ['AllergyName', 'Text'], 'AllergyName', 'AllergyTypeId', 'Description'];
        let val = await this.GetCostDetails(apiReq);
        return { [key]: val.Data };
    }

    public GetModel(): SStatic.Model<CostDetailInstance, CostDetailAttributes> {
        return this.Models.CostDetail;
    }
}
