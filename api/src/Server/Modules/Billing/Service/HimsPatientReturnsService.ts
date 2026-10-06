import { BaseService, BoFactory } from '../../Base/Index';
import { PatientReturnsBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request, FileInfo } from '../../../Core/Index';
import { PatientReturnsAttributes } from '../Model/Interface/Index';
import { PatientReturnsFilters } from '../Common/Filters.e';

export class PatientReturnsService extends BaseService {
    private PatientReturnsBo: PatientReturnsBo;
    constructor(req?: Request) {
        super(req);
        this.PatientReturnsBo = BoFactory.GetBo(PatientReturnsBo, this.Request);
    }

    public async AddPatientReturns(req: BaseRequest): Promise<number> {
        return await this.PatientReturnsBo.AddPatientReturns(req);
    }

    public async UpdatePatientReturns(req: BaseRequest): Promise<boolean> {
        return await this.PatientReturnsBo.UpdatePatientReturns(req);
    }

    public async AddStaffBillReturns(req: BaseRequest): Promise<number> {
        return await this.PatientReturnsBo.AddStaffBillReturns(req);
    }

    public async UpdateStaffBillReturns(req: BaseRequest): Promise<boolean> {
        return await this.PatientReturnsBo.UpdateStaffBillReturns(req);
    }

    public async GetPatientReturnsById(req: BaseRequest): Promise<PatientReturnsAttributes> {
        return await this.PatientReturnsBo.GetPatientReturnsById(req);
    }

    public async GetPatientReturns(apiReq?: ApiRequest<PatientReturnsFilters>): Promise<ApiResponse<PatientReturnsAttributes[]>> {
        return await this.PatientReturnsBo.GetPatientReturns(apiReq);
    }

    public async GetStaffCreditReturns(apiReq?: ApiRequest<PatientReturnsFilters>): Promise<ApiResponse<PatientReturnsAttributes[]>> {
        return await this.PatientReturnsBo.GetStaffCreditReturns(apiReq);
    }

    public async DeletePatientReturns(req: BaseRequest): Promise<Boolean> {
        return await this.PatientReturnsBo.DeletePatientReturns(req);
    }
    public async PrintPatientReturns(req: BaseRequest): Promise<FileInfo> {
        return await this.PatientReturnsBo.PrintPatientReturns(req);
    }
    public async PrintPatientReturns1(req: BaseRequest): Promise<FileInfo> {
        return await this.PatientReturnsBo.PrintPatientReturns1(req);
    }
    public async PrintPatientReturnsReport(apiReq?: ApiRequest<PatientReturnsFilters>): Promise<any> {
        return await this.PatientReturnsBo.PrintPatientReturnsReport(apiReq);
    }
    public async PrintPharmacyReturnReportforOTC(apiReq?: ApiRequest<PatientReturnsFilters>): Promise<any> {
        return await this.PatientReturnsBo.PrintPharmacyReturnReportforOTC(apiReq);
    }
    public async PrintIPPharmacyReturnReport(apiReq?: ApiRequest<PatientReturnsFilters>): Promise<any> {
        return await this.PatientReturnsBo.PrintIPPharmacyReturnReport(apiReq);
    }
    public async PrintStaffCreditReturnReport(apiReq?: ApiRequest<PatientReturnsFilters>): Promise<any> {
        return await this.PatientReturnsBo.PrintStaffCreditReturnReport(apiReq);
    }
    public async PrintIPPatientReturns(req: BaseRequest): Promise<FileInfo> {
        return await this.PatientReturnsBo.PrintIPPatientReturns(req);
    }
    public async PrintDirectPatientReturns(req: BaseRequest): Promise<FileInfo> {
        return await this.PatientReturnsBo.PrintDirectPatientReturns(req);
    }
    public async PrintDMPatientReturns(req: BaseRequest): Promise<any> {
        return await this.PatientReturnsBo.PrintDMPatientReturns(req);
    }
    public async PrintDMIPPatientReturns(req: BaseRequest): Promise<any> {
        return await this.PatientReturnsBo.PrintDMIPPatientReturns(req);
    }
    public async PrintDMDirectPatientReturns(req: BaseRequest): Promise<any> {
        return await this.PatientReturnsBo.PrintDMDirectPatientReturns(req);
    }
}

