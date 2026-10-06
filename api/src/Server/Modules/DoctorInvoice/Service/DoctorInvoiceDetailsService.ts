import { BaseService, BoFactory } from '../../Base/Index';
import { DoctorInvoiceDetailsBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { DoctorInvoiceDetailsAttributes } from '../Model/Interface/Index';
import { DoctorInvoiceDetailsFilters } from '../Common/Filters.e';

export class DoctorInvoiceDetailsService extends BaseService {
    private DoctorInvoiceDetailsBo: DoctorInvoiceDetailsBo;
    constructor(req?: Request) {
        super(req);
        this.DoctorInvoiceDetailsBo = BoFactory.GetBo(DoctorInvoiceDetailsBo, this.Request);
    }

    public async AddDoctorInvoiceDetails(req: BaseRequest): Promise<number> {
        return await this.DoctorInvoiceDetailsBo.AddDoctorInvoiceDetails(req);
    }

    public async UpdateDoctorInvoiceDetails(req: BaseRequest): Promise<boolean> {
        return await this.DoctorInvoiceDetailsBo.UpdateDoctorInvoiceDetails(req);
    }

    public async GetDoctorInvoiceDetailsById(req: BaseRequest): Promise<DoctorInvoiceDetailsAttributes> {
        return await this.DoctorInvoiceDetailsBo.GetDoctorInvoiceDetailsById(req);
    }

    public async GetDoctorInvoiceDetails(apiReq?: ApiRequest<DoctorInvoiceDetailsFilters>):
        Promise<ApiResponse<DoctorInvoiceDetailsAttributes[]>> {
        return await this.DoctorInvoiceDetailsBo.GetDoctorInvoiceDetails(apiReq);
    }

    public async DeleteDoctorInvoiceDetails(req: BaseRequest): Promise<Boolean> {
        return await this.DoctorInvoiceDetailsBo.DeleteDoctorInvoiceDetails(req);
    }
}
