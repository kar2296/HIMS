import {BaseService, BoFactory } from '../../Base/Index';
import { OrderTypeBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ISearchEnums, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { OrderTypeAttributes } from '../Model/Interface/Index';

export class OrderTypeService extends BaseService {
    private OrderTypeBo: OrderTypeBo;
    constructor(req?: Request) {
        super(req);
        this.OrderTypeBo = BoFactory.GetBo(OrderTypeBo, this.Request);
    }

    public async AddOrderType(req: BaseRequest): Promise<number> {
        return await this.OrderTypeBo.AddOrderType(req);
    }

    public async UpdateOrderType(req: BaseRequest): Promise<boolean> {
        return await this.OrderTypeBo.UpdateOrderType(req);
    }

    public async GetOrderTypeById(req: BaseRequest): Promise<OrderTypeAttributes> {
        return await this.OrderTypeBo.GetOrderTypeById(req);
    }

    public async GetOrderTypes(apiReq?: ApiRequest<ISearchEnums>): Promise<ApiResponse<OrderTypeAttributes[]>> {
        return await this.OrderTypeBo.GetOrderTypes(apiReq);
    }

    public async DeleteOrderType(req: BaseRequest): Promise<Boolean> {
        return await this.OrderTypeBo.DeleteOrderType(req);
    }
}
