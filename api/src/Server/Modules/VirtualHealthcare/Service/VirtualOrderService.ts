import { BaseService, BoFactory } from '../../Base/Index';
import { VirtualOrderBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { VirtualOrderAttributes } from '../Model/Interface/Index';
import { VirtualOrderFilters } from '../Common/Filters.e';

export class VirtualOrderService extends BaseService {
    private VirtualOrderBo: VirtualOrderBo;
    constructor(req?: Request) {
        super(req);
        this.VirtualOrderBo = BoFactory.GetBo(VirtualOrderBo, this.Request);
    }

    public async AddVirtualOrder(req: BaseRequest): Promise<number> {
        return await this.VirtualOrderBo.AddVirtualOrder(req);
    }
    public async UpdateVirtualOrderPaymentgateway(req: BaseRequest): Promise<number> {
        return await this.VirtualOrderBo.UpdateVirtualOrderPaymentgateway(req);
    }
    // public async UpdateVaccineCard(req: BaseRequest): Promise<number> {
    //     return await this.VirtualOrderBo.UpdateVaccineCard(req);
    // }
    public async UpdateVirtualOrder(req: BaseRequest): Promise<boolean> {
        return await this.VirtualOrderBo.UpdateVirtualOrder(req);
    }
    public async UpdateRescheduleVirtualOrder(req: BaseRequest): Promise<boolean> {
        return await this.VirtualOrderBo.UpdateRescheduleVirtualOrder(req);
    }
    // public async UpdateRescheduleDiagnosticOrder(req: BaseRequest): Promise<boolean> {
    //     return await this.VirtualOrderBo.UpdateRescheduleDiagnosticOrder(req);
    // }
    public async AddDoctorConsultVirtualOrder(req: BaseRequest): Promise<number> {
        return await this.VirtualOrderBo.AddDoctorConsultVirtualOrder(req);
    }
    // public async AddVaccineCardOrder(req: BaseRequest): Promise<number> {
    //     return await this.VirtualOrderBo.AddVaccineCardOrder(req);
    // }
    public async ConfirmVirtualOrder(req: BaseRequest): Promise<boolean> {
        return await this.VirtualOrderBo.ConfirmVirtualOrder(req);
    }

    public async AssignVirtualOrder(req: BaseRequest): Promise<boolean> {
        return await this.VirtualOrderBo.AssignVirtualOrder(req);

    }
    public async GetVaccineCardPic(req: BaseRequest): Promise<VirtualOrderAttributes> {
        return await this.VirtualOrderBo.GetVaccineCardPic(req);
    }
    // public async GetAttachmentFile(req: BaseRequest): Promise<VirtualOrderAttributes> {
    //     return await this.VirtualOrderBo.GetAttachmentFile(req);
    // }

    // public async UpdateVirtualLabOrder(req: BaseRequest): Promise<boolean> {
    //     return await this.VirtualOrderBo.UpdateVirtualLabOrder(req);
    // }

    public async GetVirtualOrderById(req: BaseRequest): Promise<VirtualOrderAttributes> {
        return await this.VirtualOrderBo.GetVirtualOrderById(req);
    }

    public async GetVirtualOrders(apiReq?: ApiRequest<VirtualOrderFilters>):
        Promise<ApiResponse<VirtualOrderAttributes[]>> {
        return await this.VirtualOrderBo.GetVirtualOrders(apiReq);
    }

    public async DeleteVirtualOrder(req: BaseRequest): Promise<Boolean> {
        return await this.VirtualOrderBo.DeleteVirtualOrder(req);
    }
    public async PrintVirtualAppoinmentReport(apiReq?: ApiRequest<VirtualOrderFilters>): Promise<any> {
        return await this.VirtualOrderBo.PrintVirtualAppoinmentReport(apiReq);
    }
    public async PrintCancelAppoinmentReport(apiReq?: ApiRequest<VirtualOrderFilters>): Promise<any> {
        return await this.VirtualOrderBo.PrintCancelAppoinmentReport(apiReq);
    }
    public async PrintLabOnlinePaymentReport(apiReq?: ApiRequest<VirtualOrderFilters>): Promise<any> {
        return await this.VirtualOrderBo.PrintLabOnlinePaymentReport(apiReq);
    }
    public async PrintOnlinePaymentDetailsReport(apiReq?: ApiRequest<VirtualOrderFilters>): Promise<any> {
        return await this.VirtualOrderBo.PrintOnlinePaymentDetailsReport(apiReq);
    }
    public async PrintOnlinePaymentSummaryReport(apiReq?: ApiRequest<VirtualOrderFilters>): Promise<any> {
        return await this.VirtualOrderBo.PrintOnlinePaymentSummaryReport(apiReq);
    }
}
