import {BaseService, BoFactory } from '../../Base/Index';
import { LocalWellCustomerOrderBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { LocalWellCustomerOrderAttributes } from '../Model/Interface/Index';
import { LocalWellCustomerOrderFilters } from '../Common/Filters.e';

export class LocalWellCustomerOrderService extends BaseService {
    private LocalWellCustomerOrderBo: LocalWellCustomerOrderBo;
    constructor(req?: Request) {
        super(req);
        this.LocalWellCustomerOrderBo = BoFactory.GetBo(LocalWellCustomerOrderBo, this.Request);
    }

    public async AddLocalWellCustomerOrder(req: BaseRequest): Promise<number> {
        return await this.LocalWellCustomerOrderBo.AddLocalWellCustomerOrder(req);
    }

    public async UpdateLocalWellCustomerOrder(req: BaseRequest): Promise<boolean> {
        return await this.LocalWellCustomerOrderBo.UpdateLocalWellCustomerOrder(req);
    }

    public async SearchMedicine(req: BaseRequest): Promise<any> {
        return await this.LocalWellCustomerOrderBo.SearchMedicine(req);
    }

    public async AddCustomerOrder(req: BaseRequest): Promise<any> {
        return await this.LocalWellCustomerOrderBo.AddCustomerOrder(req);
    }

    public async GetOrderStatus(req: BaseRequest): Promise<boolean> {
        return await this.LocalWellCustomerOrderBo.GetOrderStatus(req);
    }

    public async GetLocalWellCustomerOrderById(req: BaseRequest): Promise<LocalWellCustomerOrderAttributes> {
        return await this.LocalWellCustomerOrderBo.GetLocalWellCustomerOrderById(req);
    }

    public async GetLocalWellCustomerOrders(apiReq?: ApiRequest<LocalWellCustomerOrderFilters>):
     Promise<ApiResponse<LocalWellCustomerOrderAttributes[]>> {
        return await this.LocalWellCustomerOrderBo.GetLocalWellCustomerOrders(apiReq);
    }

    public async DeleteLocalWellCustomerOrder(req: BaseRequest): Promise<Boolean> {
        return await this.LocalWellCustomerOrderBo.DeleteLocalWellCustomerOrder(req);
    }
}
