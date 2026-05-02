import { BaseService, BoFactory } from '../../Base/Index';
import { OrderStatusBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { OrderStatusAttributes } from '../Model/Interface/Index';
import { OrderStatusFilters } from '../Common/Filters.e';

export class OrderStatusService extends BaseService {
    private OrderStatusBo: OrderStatusBo;
    constructor(req?: Request) {
        super(req);
        this.OrderStatusBo = BoFactory.GetBo(OrderStatusBo, this.Request);
    }

    public async AddOrderStatus(req: BaseRequest): Promise<number> {
        return await this.OrderStatusBo.AddOrderStatus(req);
    }

    public async UpdateOrderStatus(req: BaseRequest): Promise<boolean> {
        return await this.OrderStatusBo.UpdateOrderStatus(req);
    }

    public async GetOrderStatusById(req: BaseRequest): Promise<OrderStatusAttributes> {
        return await this.OrderStatusBo.GetOrderStatusById(req);
    }

    public async GetOrderStatuss(apiReq?: ApiRequest<OrderStatusFilters>): Promise<ApiResponse<OrderStatusAttributes[]>> {
        return await this.OrderStatusBo.GetOrderStatuss(apiReq);
    }

    public async DeleteOrderStatus(req: BaseRequest): Promise<Boolean> {
        return await this.OrderStatusBo.DeleteOrderStatus(req);
    }
}
