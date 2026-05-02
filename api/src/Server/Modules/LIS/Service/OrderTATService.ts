import {BaseService, BoFactory } from '../../Base/Index';
import { OrderTATBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { OrderTATAttributes } from '../Model/Interface/Index';
import { OrderTATFilters } from '../Common/Filters.e';

export class OrderTATService extends BaseService {
    private OrderTATBo: OrderTATBo;
    constructor(req?: Request) {
        super(req);
        this.OrderTATBo = BoFactory.GetBo(OrderTATBo, this.Request);
    }

    public async AddOrderTAT(req: BaseRequest): Promise<number> {
        return await this.OrderTATBo.AddOrderTAT(req);
    }

    public async UpdateOrderTAT(req: BaseRequest): Promise<boolean> {
        return await this.OrderTATBo.UpdateOrderTAT(req);
    }

    public async GetOrderTATById(req: BaseRequest): Promise<OrderTATAttributes> {
        return await this.OrderTATBo.GetOrderTATById(req);
    }

    public async GetOrderTATs(apiReq?: ApiRequest<OrderTATFilters>): Promise<ApiResponse<OrderTATAttributes[]>> {
        return await this.OrderTATBo.GetOrderTATs(apiReq);
    }

    public async DeleteOrderTAT(req: BaseRequest): Promise<Boolean> {
        return await this.OrderTATBo.DeleteOrderTAT(req);
    }
    public async PrintOrdertatReport(apiReq?: ApiRequest<OrderTATFilters>): Promise<any> {
        return await this.OrderTATBo.PrintOrdertatReport(apiReq);
    }
    public async PrintRadOrdertatReport(apiReq?: ApiRequest<OrderTATFilters>): Promise<any> {
        return await this.OrderTATBo.PrintRadOrdertatReport(apiReq);
    }
}
