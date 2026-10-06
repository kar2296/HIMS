import { BaseService, BoFactory } from '../../Base/Index';
import { StaffCreditPaymentDetailsBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { StaffCreditPaymentDetailsAttributes } from '../Model/Interface/Index';
import { StaffCreditPaymentDetailsFilters } from '../Common/Filters.e';

export class StaffCreditPaymentDetailsService extends BaseService {
    private StaffCreditPaymentDetailsBo: StaffCreditPaymentDetailsBo;
    constructor(req?: Request) {
        super(req);
        this.StaffCreditPaymentDetailsBo = BoFactory.GetBo(StaffCreditPaymentDetailsBo, this.Request);
    }

    public async AddStaffCreditPaymentDetails(req: BaseRequest): Promise<number> {
        return await this.StaffCreditPaymentDetailsBo.AddStaffCreditPaymentDetails(req);
    }

    public async UpdateStaffCreditPaymentDetails(req: BaseRequest): Promise<boolean> {
        return await this.StaffCreditPaymentDetailsBo.UpdateStaffCreditPaymentDetails(req);
    }

    public async GetStaffCreditPaymentDetailsById(req: BaseRequest): Promise<StaffCreditPaymentDetailsAttributes> {
        return await this.StaffCreditPaymentDetailsBo.GetStaffCreditPaymentDetailsById(req);
    }

    public async GetStaffCreditPaymentDetails(apiReq?: ApiRequest<StaffCreditPaymentDetailsFilters>):
        Promise<ApiResponse<StaffCreditPaymentDetailsAttributes[]>> {
        return await this.StaffCreditPaymentDetailsBo.GetStaffCreditPaymentDetails(apiReq);
    }

    public async DeleteStaffCreditPaymentDetails(req: BaseRequest): Promise<Boolean> {
        return await this.StaffCreditPaymentDetailsBo.DeleteStaffCreditPaymentDetails(req);
    }
}
