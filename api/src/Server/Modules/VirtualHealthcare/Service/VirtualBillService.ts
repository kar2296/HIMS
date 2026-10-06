import { BaseService, BoFactory } from '../../Base/Index';
import { VirtualBillBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { VirtualBillAttributes } from '../Model/Interface/Index';
import { VirtualBillFilters } from '../Common/Filters.e';

export class VirtualBillService extends BaseService {
    private VirtualBillBo: VirtualBillBo;
    constructor(req?: Request) {
        super(req);
        this.VirtualBillBo = BoFactory.GetBo(VirtualBillBo, this.Request);
    }

    public async AddVirtualBill(req: BaseRequest): Promise<number> {
        return await this.VirtualBillBo.AddVirtualBill(req);
    }

    public async UpdateVirtualBill(req: BaseRequest): Promise<boolean> {
        return await this.VirtualBillBo.UpdateVirtualBill(req);
    }

    public async GetVirtualBillById(req: BaseRequest): Promise<VirtualBillAttributes> {
        return await this.VirtualBillBo.GetVirtualBillById(req);
    }

    public async GetVirtualBills(apiReq?: ApiRequest<VirtualBillFilters>):
        Promise<ApiResponse<VirtualBillAttributes[]>> {
        return await this.VirtualBillBo.GetVirtualBills(apiReq);
    }

    public async DeleteVirtualBill(req: BaseRequest): Promise<Boolean> {
        return await this.VirtualBillBo.DeleteVirtualBill(req);
    }
}
