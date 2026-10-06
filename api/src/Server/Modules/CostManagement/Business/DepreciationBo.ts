import * as SStatic from 'sequelize';
import { BaseBo, IOptionProvider, } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { BaseRequest, ApiRequest, ApiResponse } from '../../../Common/Index';
import { DepreciationInstance, DepreciationAttributes } from '../Model/Interface/Index';
import { DepreciationFilters } from '../Common/Filters.e';

export class DepreciationBo extends BaseBo<DepreciationInstance, DepreciationAttributes> implements IOptionProvider {
    public async AddDepreciation(req: BaseRequest): Promise<number> {
        this.HandleActiveState(req.Data);
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateDepreciation(req: BaseRequest): Promise<boolean> {
        this.HandleActiveState(req.Data);
        let result = await this.Update(req.Data);
        return result;
    }
    public async GetDepreciationById(req: BaseRequest): Promise<DepreciationAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetDepreciations(apiReq?: ApiRequest<DepreciationFilters>): Promise<ApiResponse<DepreciationAttributes[]>> {
        let where: WhereOptions<any>= {};
        let include: Array<IncludeOptions> = [];
        let order: Array<any> = [];
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case DepreciationFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case DepreciationFilters.CostDetailId:
                        where['CostDetailId'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        order.push(['CreatedAt', 'DESC']);
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes, order: order });
    }

    public async DeleteDepreciation(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public async GetOptions(key: string, apiReq?: ApiRequest<DepreciationFilters>): Promise<any> {
        // apiReq.Attributes = apiReq.Attributes || ['Id', ['AllergyName', 'Text'], 'AllergyName', 'AllergyTypeId', 'Description'];
        let val = await this.GetDepreciations(apiReq);
        return { [key]: val.Data };
    }

    public GetModel(): SStatic.Model<DepreciationInstance, DepreciationAttributes> {
        return this.Models.Depreciation;
    }
}
