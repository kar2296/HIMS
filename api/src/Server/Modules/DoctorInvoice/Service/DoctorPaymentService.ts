import { BaseService, BoFactory } from '../../Base/Index';
import { DoctorPaymentBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request,FileInfo } from '../../../Core/Index';
import { DoctorPaymentAttributes } from '../Model/Interface/Index';
import { DoctorPaymentFilters } from '../Common/Filters.e';

export class DoctorPaymentService extends BaseService {
    private DoctorPaymentBo: DoctorPaymentBo;
    constructor(req?: Request) {
        super(req);
        this.DoctorPaymentBo = BoFactory.GetBo(DoctorPaymentBo, this.Request);
    }

    public async AddDoctorPayment(req: BaseRequest): Promise<number> {
        return await this.DoctorPaymentBo.AddDoctorPayment(req);
    }

    public async UpdateDoctorPayment(req: BaseRequest): Promise<boolean> {
        return await this.DoctorPaymentBo.UpdateDoctorPayment(req);
    }

    public async GetDoctorPaymentById(req: BaseRequest): Promise<DoctorPaymentAttributes> {
        return await this.DoctorPaymentBo.GetDoctorPaymentById(req);
    }

    public async GetDoctorPayments(apiReq?: ApiRequest<DoctorPaymentFilters>):
        Promise<ApiResponse<DoctorPaymentAttributes[]>> {
        return await this.DoctorPaymentBo.GetDoctorPayments(apiReq);
    }

    public async DeleteDoctorPayment(req: BaseRequest): Promise<Boolean> {
        return await this.DoctorPaymentBo.DeleteDoctorPayment(req);
    }
    public async PrintDoctorPayment(req: BaseRequest): Promise<FileInfo> {
        return await this.DoctorPaymentBo.PrintDoctorPayment(req);
    }
    public async PrintDoctorPaymentReport(apiReq?: ApiRequest<DoctorPaymentFilters>): Promise<any> {
        return await this.DoctorPaymentBo.PrintDoctorPaymentReport(apiReq);
    }
}
