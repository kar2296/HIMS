import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest } from '../../../Common/Index';
import { OrderStatusInstance, OrderStatusAttributes } from '../Model/Interface/Index';
import { OrderStatusFilters } from '../Common/Filters.e';

export class OrderStatusBo extends BaseBo<OrderStatusInstance, OrderStatusAttributes>  {
    public async AddOrderStatus(req: BaseRequest): Promise<number> {
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateOrderStatus(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetOrderStatusById(req: BaseRequest): Promise<OrderStatusAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetOrderStatuss(apiReq?: ApiRequest<OrderStatusFilters>): Promise<ApiResponse<OrderStatusAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case OrderStatusFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case OrderStatusFilters.Name:
                        where['Name'] = param.Value;
                        break;
                    case OrderStatusFilters.IsDietStatus:
                        where['IsDietStatus'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeleteOrderStatus(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<OrderStatusInstance, OrderStatusAttributes> {
        return this.Models.OrderStatus;
    }

    public async GetOptions(key: string, apiReq?: ApiRequest<OrderStatusFilters>): Promise<any> {
        apiReq.Attributes = apiReq.Attributes || ['Id', ['DisplayName', 'Text'], ['Orderstatuse', 'NText']];
        let val = await this.GetOrderStatuss(apiReq);
        return { [key]: val.Data };
    }

}
