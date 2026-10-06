import { BaseService, BoFactory } from '../../Base/Index';
import { PharmacyModifyPatBillDetailsBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request, FileInfo } from '../../../Core/Index';
import { PharmacyModifyPatBillDetailsAttributes } from '../Model/Interface/Index';
import { PatientBillDetailsFilters } from '../Common/Filters.e';

export class PharmacyModifyPatBillDetailsService extends BaseService {
    private PharmacyModifyPatBillDetailsBo: PharmacyModifyPatBillDetailsBo;
    constructor(req?: Request) {
        super(req);
        this.PharmacyModifyPatBillDetailsBo = BoFactory.GetBo(PharmacyModifyPatBillDetailsBo, this.Request);
    }

    public async AddPatientBillDetails(req: BaseRequest): Promise<number> {
        return await this.PharmacyModifyPatBillDetailsBo.AddPatientBillDetails(req);
    }

    public async GetPatientBillDetailsById(req: BaseRequest): Promise<PharmacyModifyPatBillDetailsAttributes> {
        return await this.PharmacyModifyPatBillDetailsBo.GetPatientBillDetailsById(req);
    }

    public async GetPatientInsuranceBillDetails(apiReq?: ApiRequest<PatientBillDetailsFilters>):
        Promise<ApiResponse<PharmacyModifyPatBillDetailsAttributes[]>> {
        return await this.PharmacyModifyPatBillDetailsBo.GetPatientInsuranceBillDetails(apiReq);
    }

    public async GetPatientBillDetails(apiReq?: ApiRequest<PatientBillDetailsFilters>):
        Promise<ApiResponse<PharmacyModifyPatBillDetailsAttributes[]>> {
        return await this.PharmacyModifyPatBillDetailsBo.GetPatientBillDetails(apiReq);
    }

    public async GetPatientPharmacyBillDetails(apiReq?: ApiRequest<PatientBillDetailsFilters>):
        Promise<ApiResponse<PharmacyModifyPatBillDetailsAttributes[]>> {
        return await this.PharmacyModifyPatBillDetailsBo.GetPatientPharmacyBillDetails(apiReq);
    }

    public async GetPatientOTPharmacyBillDetails(apiReq?: ApiRequest<PatientBillDetailsFilters>):
        Promise<ApiResponse<PharmacyModifyPatBillDetailsAttributes[]>> {
        return await this.PharmacyModifyPatBillDetailsBo.GetPatientOTPharmacyBillDetails(apiReq);
    }

    public async GetPreviousOrders(apiReq?: ApiRequest<PatientBillDetailsFilters>):
        Promise<ApiResponse<PharmacyModifyPatBillDetailsAttributes[]>> {
        return await this.PharmacyModifyPatBillDetailsBo.GetPreviousOrders(apiReq);
    }
    public async PrintPatientBillDetails(req: BaseRequest): Promise<FileInfo> {
        return await this.PharmacyModifyPatBillDetailsBo.PrintPatientBillDetails(req);
    }
}
