import { BaseService, BoFactory } from '../../Base/Index';
import { PatientRefundBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request, FileInfo } from '../../../Core/Index';
import { PatientRefundAttributes } from '../Model/Interface/Index';
import { PatientRefundFilters } from '../Common/Filters.e';

export class PatientRefundService extends BaseService {
    private PatientRefundBo: PatientRefundBo;
    constructor(req?: Request) {
        super(req);
        this.PatientRefundBo = BoFactory.GetBo(PatientRefundBo, this.Request);
    }

    public async AddPatientRefund(req: BaseRequest): Promise<number> {
        return await this.PatientRefundBo.AddPatientRefund(req);
    }

    public async UpdatePatientRefund(req: BaseRequest): Promise<boolean> {
        return await this.PatientRefundBo.UpdatePatientRefund(req);
    }

    public async GetPatientRefundById(req: BaseRequest): Promise<PatientRefundAttributes> {
        return await this.PatientRefundBo.GetPatientRefundById(req);
    }

    public async GetPatientRefund(apiReq?: ApiRequest<PatientRefundFilters>): Promise<ApiResponse<PatientRefundAttributes[]>> {
        return await this.PatientRefundBo.GetPatientRefund(apiReq);
    }
    public async GetPharmacyReturnCollections(apiReq?: ApiRequest<PatientRefundFilters>): Promise<ApiResponse<PatientRefundAttributes[]>> {
        return await this.PatientRefundBo.GetPharmacyReturnCollections(apiReq);
    }
    public async DeletePatientRefund(req: BaseRequest): Promise<Boolean> {
        return await this.PatientRefundBo.DeletePatientRefund(req);
    }
    public async PrintPatientRefund(req: BaseRequest): Promise<FileInfo> {
        return await this.PatientRefundBo.PrintPatientRefund(req);
    }
    public async PrintRefundReport(apiReq?: ApiRequest<PatientRefundFilters>): Promise<any> {
        return await this.PatientRefundBo.PrintRefundReport(apiReq);
    }
    public async PrintIPRefundReport(apiReq?: ApiRequest<PatientRefundFilters>): Promise<any> {
        return await this.PatientRefundBo.PrintIPRefundReport(apiReq);
    }
    public async PrintPharmacyRefundReport(apiReq?: ApiRequest<PatientRefundFilters>): Promise<any> {
        return await this.PatientRefundBo.PrintPharmacyRefundReport(apiReq);
    }
}
