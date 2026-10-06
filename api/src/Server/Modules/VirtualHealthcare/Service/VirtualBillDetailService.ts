import { BaseService, BoFactory } from '../../Base/Index';
import { VirtualBillDetailBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { VirtualBillDetailAttributes } from '../Model/Interface/Index';
import { VirtualBillDetailFilters } from '../Common/Filters.e';

export class VirtualBillDetailService extends BaseService {
    private VirtualBillDetailBo: VirtualBillDetailBo;
    constructor(req?: Request) {
        super(req);
        this.VirtualBillDetailBo = BoFactory.GetBo(VirtualBillDetailBo, this.Request);
    }

    public async AddVirtualBillDetail(req: BaseRequest): Promise<number> {
        return await this.VirtualBillDetailBo.AddVirtualBillDetail(req);
    }

    public async UpdateVirtualBillDetail(req: BaseRequest): Promise<boolean> {
        return await this.VirtualBillDetailBo.UpdateVirtualBillDetail(req);
    }

    public async GetVirtualBillDetailById(req: BaseRequest): Promise<VirtualBillDetailAttributes> {
        return await this.VirtualBillDetailBo.GetVirtualBillDetailById(req);
    }

    public async GetVirtualBillDetails(apiReq?: ApiRequest<VirtualBillDetailFilters>):
        Promise<ApiResponse<VirtualBillDetailAttributes[]>> {
        return await this.VirtualBillDetailBo.GetVirtualBillDetails(apiReq);
    }

    public async DeleteVirtualBillDetail(req: BaseRequest): Promise<Boolean> {
        return await this.VirtualBillDetailBo.DeleteVirtualBillDetail(req);
    }
}
