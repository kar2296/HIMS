import { BaseService, BoFactory } from '../../Base/Index';
import { VirtualOrderDetailBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { VirtualOrderDetailAttributes } from '../Model/Interface/Index';
import { VirtualOrderDetailFilters } from '../Common/Filters.e';

export class VirtualOrderDetailService extends BaseService {
    private VirtualOrderDetailBo: VirtualOrderDetailBo;
    constructor(req?: Request) {
        super(req);
        this.VirtualOrderDetailBo = BoFactory.GetBo(VirtualOrderDetailBo, this.Request);
    }

    public async AddVirtualOrderDetail(req: BaseRequest): Promise<number> {
        return await this.VirtualOrderDetailBo.AddVirtualOrderDetail(req);
    }

    public async UpdateVirtualOrderDetail(req: BaseRequest): Promise<boolean> {
        return await this.VirtualOrderDetailBo.UpdateVirtualOrderDetail(req);
    }

    public async GetVirtualOrderDetailById(req: BaseRequest): Promise<VirtualOrderDetailAttributes> {
        return await this.VirtualOrderDetailBo.GetVirtualOrderDetailById(req);
    }

    public async GetVirtualOrderDetails(apiReq?: ApiRequest<VirtualOrderDetailFilters>):
        Promise<ApiResponse<VirtualOrderDetailAttributes[]>> {
        return await this.VirtualOrderDetailBo.GetVirtualOrderDetails(apiReq);
    }

    public async DeleteVirtualOrderDetail(req: BaseRequest): Promise<Boolean> {
        return await this.VirtualOrderDetailBo.DeleteVirtualOrderDetail(req);
    }
}
