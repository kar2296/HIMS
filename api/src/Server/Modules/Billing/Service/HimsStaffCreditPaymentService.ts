import { BaseService, BoFactory } from '../../Base/Index';
import { StaffCreditPaymentBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request,FileInfo } from '../../../Core/Index';
import { StaffCreditPaymentAttributes } from '../Model/Interface/Index';
import { StaffCreditPaymentFilters } from '../Common/Filters.e';

export class StaffCreditPaymentService extends BaseService {
    private StaffCreditPaymentBo: StaffCreditPaymentBo;
    constructor(req?: Request) {
        super(req);
        this.StaffCreditPaymentBo = BoFactory.GetBo(StaffCreditPaymentBo, this.Request);
    }

    public async AddStaffCreditPayment(req: BaseRequest): Promise<number> {
        return await this.StaffCreditPaymentBo.AddStaffCreditPayment(req);
    }

    public async UpdateStaffCreditPayment(req: BaseRequest): Promise<boolean> {
        return await this.StaffCreditPaymentBo.UpdateStaffCreditPayment(req);
    }

    public async GetStaffCreditPaymentById(req: BaseRequest): Promise<StaffCreditPaymentAttributes> {
        return await this.StaffCreditPaymentBo.GetStaffCreditPaymentById(req);
    }

    public async GetStaffCreditPayments(apiReq?: ApiRequest<StaffCreditPaymentFilters>):
        Promise<ApiResponse<StaffCreditPaymentAttributes[]>> {
        return await this.StaffCreditPaymentBo.GetStaffCreditPayments(apiReq);
    }

    public async DeleteStaffCreditPayment(req: BaseRequest): Promise<Boolean> {
        return await this.StaffCreditPaymentBo.DeleteStaffCreditPayment(req);
    }
    public async PrintStaffCreditPayment(req: BaseRequest): Promise<FileInfo> {
        return await this.StaffCreditPaymentBo.PrintStaffCreditPayment(req);
    }
    public async PrintStaffCreditPaymentReport(apiReq?: ApiRequest<StaffCreditPaymentFilters>): Promise<any> {
        return await this.StaffCreditPaymentBo.PrintStaffCreditPaymentReport(apiReq);
    }
}
