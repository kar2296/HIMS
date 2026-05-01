import { BaseService, BoFactory } from '../../Base/Index';
import { VendorPaymentDetailsBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { VendorPaymentDetailsAttributes } from '../Model/Interface/Index';
import { VendorPaymentDetailsFilters } from '../Common/Filters.e';

export class VendorPaymentDetailsService extends BaseService {
    private VendorPaymentDetailsBo: VendorPaymentDetailsBo;
    constructor(req?: Request) {
        super(req);
        this.VendorPaymentDetailsBo = BoFactory.GetBo(VendorPaymentDetailsBo, this.Request);
    }

    public async AddVendorPaymentDetails(req: BaseRequest): Promise<number> {
        return await this.VendorPaymentDetailsBo.AddVendorPaymentDetails(req);
    }

    public async UpdateVendorPaymentDetails(req: BaseRequest): Promise<boolean> {
        return await this.VendorPaymentDetailsBo.UpdateVendorPaymentDetails(req);
    }

    public async GetVendorPaymentDetailsById(req: BaseRequest): Promise<VendorPaymentDetailsAttributes> {
        return await this.VendorPaymentDetailsBo.GetVendorPaymentDetailsById(req);
    }

    public async GetVendorPaymentDetails(apiReq?: ApiRequest<VendorPaymentDetailsFilters>):
        Promise<ApiResponse<VendorPaymentDetailsAttributes[]>> {
        return await this.VendorPaymentDetailsBo.GetVendorPaymentDetails(apiReq);
    }

    public async DeleteVendorPaymentDetails(req: BaseRequest): Promise<Boolean> {
        return await this.VendorPaymentDetailsBo.DeleteVendorPaymentDetails(req);
    }
}
