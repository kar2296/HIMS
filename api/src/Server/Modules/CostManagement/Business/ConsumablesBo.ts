import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest } from '../../../Common/Index';
import { ConsumablesInstance, ConsumablesAttributes } from '../Model/Interface/Index';
import { ConsumablesFilters } from '../Common/Filters.e';

export class ConsumablesBo extends BaseBo<ConsumablesInstance, ConsumablesAttributes>  {
    public async AddConsumables(req: BaseRequest): Promise<number> {
        this.HandleActiveState(req.Data);
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateConsumables(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetConsumablesById(req: BaseRequest): Promise<ConsumablesAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetConsumabless(apiReq?: ApiRequest<ConsumablesFilters>): Promise<ApiResponse<ConsumablesAttributes[]>> {
        let where: WhereOptions<any>= {};
        let include: Array<IncludeOptions> = [];
        include.push(this.GetReference('CostType'));
        apiReq.Params.forEach((param) => {
            switch (param.Key) {
                case ConsumablesFilters.Id:
                    where['Id'] = param.Value;
                    break;
                case ConsumablesFilters.CostDetailId:
                    where['CostDetailId'] = param.Value;
                    break;
				case ConsumablesFilters.FacilityId:
                    where['FacilityId'] = param.Value;
                    break;
                default:
                    throw 'Not Implemented';
            }
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeleteConsumables(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<ConsumablesInstance, ConsumablesAttributes> {
        return this.Models.Consumables;
    }

}
