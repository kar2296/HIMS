import { BaseService, BoFactory } from '../../Base/Index';
import { PharmacyModifyPatPaymentDetailsBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request, FileInfo } from '../../../Core/Index';
import { PatientPaymentDetailsAttributes } from '../Model/Interface/Index';
import { PatientPaymentDetailsFilters } from '../Common/Filters.e';

export class PharmacyModifyPatPaymentDetailsService extends BaseService {
    private PharmacyModifyPatPaymentDetailsBo: PharmacyModifyPatPaymentDetailsBo;
    constructor(req?: Request) {
        super(req);
        this.PharmacyModifyPatPaymentDetailsBo = BoFactory.GetBo(PharmacyModifyPatPaymentDetailsBo, this.Request);
    }

    public async AddPatientPaymentDetails(req: BaseRequest): Promise<number> {
        return await this.PharmacyModifyPatPaymentDetailsBo.AddPatientPaymentDetails(req);
    }

    public async GetPatientPaymentDetailsById(req: BaseRequest): Promise<PatientPaymentDetailsAttributes> {
        return await this.PharmacyModifyPatPaymentDetailsBo.GetPatientPaymentDetailsById(req);
    }

    public async GetPatientPaymentDetails(apiReq?: ApiRequest<PatientPaymentDetailsFilters>):
        Promise<ApiResponse<PatientPaymentDetailsAttributes[]>> {
        return await this.PharmacyModifyPatPaymentDetailsBo.GetPatientPaymentDetails(apiReq);
    }

    public async PrintPatientPaymentDetails(req: BaseRequest): Promise<FileInfo> {
        return await this.PharmacyModifyPatPaymentDetailsBo.PrintPatientPaymentDetails(req);
    }
    public async DMPrintPatientPaymentDetails(req: BaseRequest): Promise<any> {
        return await this.PharmacyModifyPatPaymentDetailsBo.DMPrintPatientPaymentDetails(req);
    }

    public async GetSystemDatetime(req: BaseRequest): Promise<Date> {
        return await this.PharmacyModifyPatPaymentDetailsBo.GetSystemDatetime(req);
    }


}
