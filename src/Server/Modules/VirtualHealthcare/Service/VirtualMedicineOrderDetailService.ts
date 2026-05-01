import { BaseService, BoFactory } from '../../Base/Index';
import { VirtualMedicineOrderDetailBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { VirtualMedicineOrderDetailAttributes } from '../Model/Interface/Index';
import { VirtualMedicineOrderDetailFilters } from '../Common/Filters.e';

export class VirtualMedicineOrderDetailService extends BaseService {
    private VirtualMedicineOrderDetailBo: VirtualMedicineOrderDetailBo;
    constructor(req?: Request) {
        super(req);
        this.VirtualMedicineOrderDetailBo = BoFactory.GetBo(VirtualMedicineOrderDetailBo, this.Request);
    }

    public async AddVirtualMedicineOrderDetail(req: BaseRequest): Promise<number> {
        return await this.VirtualMedicineOrderDetailBo.AddVirtualMedicineOrderDetail(req);
    }

    public async UpdateVirtualMedicineOrderDetail(req: BaseRequest): Promise<boolean> {
        return await this.VirtualMedicineOrderDetailBo.UpdateVirtualMedicineOrderDetail(req);
    }

    public async GetVirtualMedicineOrderDetailById(req: BaseRequest): Promise<VirtualMedicineOrderDetailAttributes> {
        return await this.VirtualMedicineOrderDetailBo.GetVirtualMedicineOrderDetailById(req);
    }

    public async GetVirtualMedicineOrderDetails(apiReq?: ApiRequest<VirtualMedicineOrderDetailFilters>):
        Promise<ApiResponse<VirtualMedicineOrderDetailAttributes[]>> {
        return await this.VirtualMedicineOrderDetailBo.GetVirtualMedicineOrderDetails(apiReq);
    }

    public async DeleteVirtualMedicineOrderDetail(req: BaseRequest): Promise<Boolean> {
        return await this.VirtualMedicineOrderDetailBo.DeleteVirtualMedicineOrderDetail(req);
    }
}
