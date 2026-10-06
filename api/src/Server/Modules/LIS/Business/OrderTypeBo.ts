import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest, ISearchEnums } from '../../../Common/Index';
import { OrderTypeInstance, OrderTypeAttributes } from '../Model/Interface/Index';
//import { OrderTypeFilters } from '../Common/Filters.e';

export class OrderTypeBo extends BaseBo<OrderTypeInstance, OrderTypeAttributes>  {
    public async AddOrderType(req: BaseRequest): Promise<number> {
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateOrderType(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetOrderTypeById(req: BaseRequest): Promise<OrderTypeAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetOrderTypes(apiReq?: ApiRequest<ISearchEnums>): Promise<ApiResponse<OrderTypeAttributes[]>> {
        let where: WhereOptions<any>= {};
        let include: Array<IncludeOptions> = [];
        apiReq.Params.forEach((param) => {
            switch (param.Key) {
                case ISearchEnums.Id:
                    where['Id'] = param.Value;
                    break;
                case ISearchEnums.Name:
                    where['Name'] = param.Value;
                    break;
                default:
                    throw 'Not Implemented';
            }
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeleteOrderType(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<OrderTypeInstance, OrderTypeAttributes> {
        return this.Models.OrderType;
    }

    public async GetOptions(key: string, apiReq?: ApiRequest<ISearchEnums>): Promise<any> {
        apiReq.Attributes = apiReq.Attributes || ['Id', ['DisplayName', 'Text'], ['Ordertypee', 'NText'] ];
        let val = await this.GetOrderTypes(apiReq);
        return { [key]: val.Data };
    }

}
