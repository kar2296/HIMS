import { BaseService, BoFactory } from '../../Base/Index';
import { OPModifyPatBillDetailsBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request, FileInfo } from '../../../Core/Index';
import { OPModifyPatBillDetailsAttributes } from '../Model/Interface/Index';
import { PatientBillDetailsFilters } from '../Common/Filters.e';

export class OPModifyPatBillDetailsService extends BaseService {
    private OPModifyPatBillDetailsBo: OPModifyPatBillDetailsBo;
    constructor(req?: Request) {
        super(req);
        this.OPModifyPatBillDetailsBo = BoFactory.GetBo(OPModifyPatBillDetailsBo, this.Request);
    }

    public async AddPatientBillDetails(req: BaseRequest): Promise<number> {
        return await this.OPModifyPatBillDetailsBo.AddPatientBillDetails(req);
    }

    public async GetPatientBillDetailsById(req: BaseRequest): Promise<OPModifyPatBillDetailsAttributes> {
        return await this.OPModifyPatBillDetailsBo.GetPatientBillDetailsById(req);
    }

    public async GetPatientInsuranceBillDetails(apiReq?: ApiRequest<PatientBillDetailsFilters>):
        Promise<ApiResponse<OPModifyPatBillDetailsAttributes[]>> {
        return await this.OPModifyPatBillDetailsBo.GetPatientInsuranceBillDetails(apiReq);
    }

    public async GetPatientBillDetails(apiReq?: ApiRequest<PatientBillDetailsFilters>):
        Promise<ApiResponse<OPModifyPatBillDetailsAttributes[]>> {
        return await this.OPModifyPatBillDetailsBo.GetPatientBillDetails(apiReq);
    }

    public async GetPatientPharmacyBillDetails(apiReq?: ApiRequest<PatientBillDetailsFilters>):
        Promise<ApiResponse<OPModifyPatBillDetailsAttributes[]>> {
        return await this.OPModifyPatBillDetailsBo.GetPatientPharmacyBillDetails(apiReq);
    }

    public async GetPatientOTPharmacyBillDetails(apiReq?: ApiRequest<PatientBillDetailsFilters>):
        Promise<ApiResponse<OPModifyPatBillDetailsAttributes[]>> {
        return await this.OPModifyPatBillDetailsBo.GetPatientOTPharmacyBillDetails(apiReq);
    }

    public async GetPreviousOrders(apiReq?: ApiRequest<PatientBillDetailsFilters>):
        Promise<ApiResponse<OPModifyPatBillDetailsAttributes[]>> {
        return await this.OPModifyPatBillDetailsBo.GetPreviousOrders(apiReq);
    }
    public async PrintPatientBillDetails(req: BaseRequest): Promise<FileInfo> {
        return await this.OPModifyPatBillDetailsBo.PrintPatientBillDetails(req);
    }
}
