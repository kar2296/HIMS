import { BaseService, BoFactory } from '../../Base/Index';
import { VirtualMedicineOrderBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { VirtualMedicineOrderAttributes } from '../Model/Interface/Index';
import { VirtualMedicineOrderFilters } from '../Common/Filters.e';

export class VirtualMedicineOrderService extends BaseService {
    private VirtualMedicineOrderBo: VirtualMedicineOrderBo;
    constructor(req?: Request) {
        super(req);
        this.VirtualMedicineOrderBo = BoFactory.GetBo(VirtualMedicineOrderBo, this.Request);
    }

    public async AddVirtualMedicineOrder(req: BaseRequest): Promise<number> {
        return await this.VirtualMedicineOrderBo.AddVirtualMedicineOrder(req);
    }

    public async UpdateVirtualMedicineOrder(req: BaseRequest): Promise<boolean> {
        return await this.VirtualMedicineOrderBo.UpdateVirtualMedicineOrder(req);
    }

    public async UpdateVirtualMedicineOrderDelivery(req: BaseRequest): Promise<boolean> {
        return await this.VirtualMedicineOrderBo.UpdateVirtualMedicineOrderDelivery(req);
    }

    // public async GetAttachmentFile(apiReq?:
    //     ApiRequest<VirtualMedicineOrderFilters>): Promise<ApiResponse<VirtualMedicineOrderAttributes[]>> {
    //     return await this.VirtualMedicineOrderBo.GetAttachmentFile(apiReq);
    // }

    public async GetVirtualMedicineOrderById(req: BaseRequest): Promise<VirtualMedicineOrderAttributes> {
        return await this.VirtualMedicineOrderBo.GetVirtualMedicineOrderById(req);
    }
    public async GetDrugSummary(req: BaseRequest): Promise<VirtualMedicineOrderAttributes> {
        return await this.VirtualMedicineOrderBo.GetDrugSummary(req);
    }

    // public async GetInvoiceAttachmentFile(apiReq?:
    //     ApiRequest<VirtualMedicineOrderFilters>): Promise<ApiResponse<VirtualMedicineOrderAttributes[]>> {
    //     return await this.VirtualMedicineOrderBo.GetInvoiceAttachmentFile(apiReq);
    // }

    // public async GetAttachmentFile(req: BaseRequest, res : Response): Promise<any> {
    //     return await this.VirtualMedicineOrderBo.GetAttachmentFile(req, res);
    // }

    public async GetAttachmentFile(req: BaseRequest): Promise<VirtualMedicineOrderAttributes> {
        return await this.VirtualMedicineOrderBo.GetAttachmentFile(req);
    }

    // public async GetInvoiceAttachmentFile(req: BaseRequest, res : Response): Promise<any> {
    //     return await this.VirtualMedicineOrderBo.GetInvoiceAttachmentFile(req, res);
    // }

    public async GetVirtualMedicineOrders(apiReq?: ApiRequest<VirtualMedicineOrderFilters>):
        Promise<ApiResponse<VirtualMedicineOrderAttributes[]>> {
        return await this.VirtualMedicineOrderBo.GetVirtualMedicineOrders(apiReq);
    }


    public async DeleteVirtualMedicineOrder(req: BaseRequest): Promise<Boolean> {
        return await this.VirtualMedicineOrderBo.DeleteVirtualMedicineOrder(req);
    }
    public async PrintDrugSummaryReport(apiReq?: ApiRequest<VirtualMedicineOrderFilters>): Promise<any> {
        return await this.VirtualMedicineOrderBo.PrintDrugSummaryReport(apiReq);
    }
}
