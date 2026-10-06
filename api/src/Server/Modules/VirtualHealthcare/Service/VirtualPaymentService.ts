import { BaseService, BoFactory } from '../../Base/Index';
import { VirtualPaymentBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { VirtualPaymentAttributes } from '../Model/Interface/Index';
import { VirtualPaymentFilters } from '../Common/Filters.e';

export class VirtualPaymentService extends BaseService {
    private VirtualPaymentBo: VirtualPaymentBo;
    constructor(req?: Request) {
        super(req);
        this.VirtualPaymentBo = BoFactory.GetBo(VirtualPaymentBo, this.Request);
    }

    public async AddVirtualPayment(req: BaseRequest): Promise<number> {
        return await this.VirtualPaymentBo.AddVirtualPayment(req);
    }

    public async UpdateVirtualPayment(req: BaseRequest): Promise<boolean> {
        return await this.VirtualPaymentBo.UpdateVirtualPayment(req);
    }

    public async GetVirtualPaymentById(req: BaseRequest): Promise<VirtualPaymentAttributes> {
        return await this.VirtualPaymentBo.GetVirtualPaymentById(req);
    }

    public async GetVirtualPayments(apiReq?: ApiRequest<VirtualPaymentFilters>):
        Promise<ApiResponse<VirtualPaymentAttributes[]>> {
        return await this.VirtualPaymentBo.GetVirtualPayments(apiReq);
    }

    public async DeleteVirtualPayment(req: BaseRequest): Promise<Boolean> {
        return await this.VirtualPaymentBo.DeleteVirtualPayment(req);
    }
}
