import { BaseService, BoFactory } from '../../Base/Index';
import { VendorPaymentBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request, FileInfo } from '../../../Core/Index';
import { VendorPaymentAttributes } from '../Model/Interface/Index';
import { VendorPaymentFilters } from '../Common/Filters.e';

export class VendorPaymentService extends BaseService {
    private VendorPaymentBo: VendorPaymentBo;
    constructor(req?: Request) {
        super(req);
        this.VendorPaymentBo = BoFactory.GetBo(VendorPaymentBo, this.Request);
    }

    public async AddVendorPayment(req: BaseRequest): Promise<number> {
        return await this.VendorPaymentBo.AddVendorPayment(req);
    }

    public async UpdateVendorPayment(req: BaseRequest): Promise<boolean> {
        return await this.VendorPaymentBo.UpdateVendorPayment(req);
    }

    public async GetVendorPaymentById(req: BaseRequest): Promise<VendorPaymentAttributes> {
        return await this.VendorPaymentBo.GetVendorPaymentById(req);
    }
    public async GetSupplierPendingSummary(apiReq?: ApiRequest<VendorPaymentFilters>): Promise<ApiResponse<VendorPaymentAttributes[]>> {
        return await this.VendorPaymentBo.GetSupplierPendingSummary(apiReq);
    }

    public async GetVendorPayments(apiReq?: ApiRequest<VendorPaymentFilters>):
        Promise<ApiResponse<VendorPaymentAttributes[]>> {
        return await this.VendorPaymentBo.GetVendorPayments(apiReq);
    }
    public async PrintVendorPayment(req: BaseRequest): Promise<FileInfo> {
        return await this.VendorPaymentBo.PrintVendorPayment(req);
    }
    public async PrintVendorPaymentReport(apiReq?: ApiRequest<VendorPaymentFilters>): Promise<any> {
        return await this.VendorPaymentBo.PrintVendorPaymentReport(apiReq);
    }

    public async DeleteVendorPayment(req: BaseRequest): Promise<Boolean> {
        return await this.VendorPaymentBo.DeleteVendorPayment(req);
    }
    public async PrintSupplierPendingSummaryReport(apiReq?: ApiRequest<VendorPaymentFilters>): Promise<any> {
        return await this.VendorPaymentBo.PrintSupplierPendingSummaryReport(apiReq);
    }
}
