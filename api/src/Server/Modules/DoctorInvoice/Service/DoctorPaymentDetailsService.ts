import { BaseService, BoFactory } from '../../Base/Index';
import { DoctorPaymentDetailsBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { DoctorPaymentDetailsAttributes } from '../Model/Interface/Index';
import { DoctorPaymentDetailsFilters } from '../Common/Filters.e';

export class DoctorPaymentDetailsService extends BaseService {
    private DoctorPaymentDetailsBo: DoctorPaymentDetailsBo;
    constructor(req?: Request) {
        super(req);
        this.DoctorPaymentDetailsBo = BoFactory.GetBo(DoctorPaymentDetailsBo, this.Request);
    }

    public async AddDoctorPaymentDetails(req: BaseRequest): Promise<number> {
        return await this.DoctorPaymentDetailsBo.AddDoctorPaymentDetails(req);
    }

    public async UpdateDoctorPaymentDetails(req: BaseRequest): Promise<boolean> {
        return await this.DoctorPaymentDetailsBo.UpdateDoctorPaymentDetails(req);
    }

    public async GetDoctorPaymentDetailsById(req: BaseRequest): Promise<DoctorPaymentDetailsAttributes> {
        return await this.DoctorPaymentDetailsBo.GetDoctorPaymentDetailsById(req);
    }

    public async GetDoctorPaymentDetails(apiReq?: ApiRequest<DoctorPaymentDetailsFilters>):
        Promise<ApiResponse<DoctorPaymentDetailsAttributes[]>> {
        return await this.DoctorPaymentDetailsBo.GetDoctorPaymentDetails(apiReq);
    }

    public async DeleteDoctorPaymentDetails(req: BaseRequest): Promise<Boolean> {
        return await this.DoctorPaymentDetailsBo.DeleteDoctorPaymentDetails(req);
    }
}
