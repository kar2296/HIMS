import * as SStatic from 'sequelize';
import { BaseBo, IOptionProvider } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { BaseRequest, ApiRequest, ApiResponse } from '../../../Common/Index';
import { PowerCostInstance, PowerCostAttributes } from '../Model/Interface/Index';
import { PowerCostFilters } from '../Common/Filters.e';

export class PowerCostBo extends BaseBo<PowerCostInstance, PowerCostAttributes> implements IOptionProvider {
    public async AddPowerCost(req: BaseRequest): Promise<number> {
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdatePowerCost(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetPowerCostById(req: BaseRequest): Promise<PowerCostAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetPowerCosts(apiReq?: ApiRequest<PowerCostFilters>): Promise<ApiResponse<PowerCostAttributes[]>> {
        let where: WhereOptions<any>= {};
        let include: Array<IncludeOptions> = [];
         include.push(this.GetReference('PowerPhase'));
        include.push(this.GetReference('BatteryBackup'));
         include.push(this.GetReference('Wattage'));
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case PowerCostFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case PowerCostFilters.CostDetailId:
                        where['CostDetailId'] = param.Value;
                        break;
				   case PowerCostFilters.FacilityId:
                        where['FacilityId'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }


    public async DeletePowerCost(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public async GetOptions(key: string, apiReq?: ApiRequest<PowerCostFilters>): Promise<any> {
        apiReq.Attributes = apiReq.Attributes || ['Id', ['AllergyName', 'Text'], 'AllergyName', 'AllergyTypeId', 'Description'];
        let val = await this.GetPowerCosts(apiReq);
        return { [key]: val.Data };
    }

    public GetModel(): SStatic.Model<PowerCostInstance, PowerCostAttributes> {
        return this.Models.PowerCost;
    }
}
