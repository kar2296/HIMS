import { BaseService, BoFactory } from '../../Base/Index';
import { OrderFollowupBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { OrderFollowupAttributes } from '../Model/Interface/Index';
import { OrderFollowupFilters } from '../Common/Filters.e';

export class OrderFollowupService extends BaseService {
    private OrderFollowupBo: OrderFollowupBo;
    constructor(req?: Request) {
        super(req);
        this.OrderFollowupBo = BoFactory.GetBo(OrderFollowupBo, this.Request);
    }

    public async AddOrderFollowup(req: BaseRequest): Promise<number> {
        return await this.OrderFollowupBo.AddOrderFollowup(req);
    }

    public async UpdateOrderFollowup(req: BaseRequest): Promise<boolean> {
        return await this.OrderFollowupBo.UpdateOrderFollowup(req);
    }

    public async GetOrderFollowupById(req: BaseRequest): Promise<OrderFollowupAttributes> {
        return await this.OrderFollowupBo.GetOrderFollowupById(req);
    }

    public async ManageOrderFollowups(req: BaseRequest): Promise<boolean> {
        return await this.OrderFollowupBo.ManageOrderFollowups(req);
    }

    public async GetOrderFollowups(apiReq?: ApiRequest<OrderFollowupFilters>):
        Promise<ApiResponse<OrderFollowupAttributes[]>> {
        return await this.OrderFollowupBo.GetOrderFollowups(apiReq);
    }

    public async DeleteOrderFollowup(req: BaseRequest): Promise<Boolean> {
        return await this.OrderFollowupBo.DeleteOrderFollowup(req);
    }
}
