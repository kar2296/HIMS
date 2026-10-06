import { BaseService, BoFactory } from '../../Base/Index';
import { OPModifyPatPaymentDetailsBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request, FileInfo } from '../../../Core/Index';
import { PatientPaymentDetailsAttributes } from '../Model/Interface/Index';
import { PatientPaymentDetailsFilters } from '../Common/Filters.e';

export class OPModifyPatPaymentDetailsService extends BaseService {
    private OPModifyPatPaymentDetailsBo: OPModifyPatPaymentDetailsBo;
    constructor(req?: Request) {
        super(req);
        this.OPModifyPatPaymentDetailsBo = BoFactory.GetBo(OPModifyPatPaymentDetailsBo, this.Request);
    }

    public async AddPatientPaymentDetails(req: BaseRequest): Promise<number> {
        return await this.OPModifyPatPaymentDetailsBo.AddPatientPaymentDetails(req);
    }

    public async GetPatientPaymentDetailsById(req: BaseRequest): Promise<PatientPaymentDetailsAttributes> {
        return await this.OPModifyPatPaymentDetailsBo.GetPatientPaymentDetailsById(req);
    }

    public async GetPatientPaymentDetails(apiReq?: ApiRequest<PatientPaymentDetailsFilters>):
        Promise<ApiResponse<PatientPaymentDetailsAttributes[]>> {
        return await this.OPModifyPatPaymentDetailsBo.GetPatientPaymentDetails(apiReq);
    }

    public async PrintPatientPaymentDetails(req: BaseRequest): Promise<FileInfo> {
        return await this.OPModifyPatPaymentDetailsBo.PrintPatientPaymentDetails(req);
    }
    public async DMPrintPatientPaymentDetails(req: BaseRequest): Promise<any> {
        return await this.OPModifyPatPaymentDetailsBo.DMPrintPatientPaymentDetails(req);
    }

    public async GetSystemDatetime(req: BaseRequest): Promise<Date> {
        return await this.OPModifyPatPaymentDetailsBo.GetSystemDatetime(req);
    }


}
