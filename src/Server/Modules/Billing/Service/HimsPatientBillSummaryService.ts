import { BaseService, BoFactory } from '../../Base/Index';
import { PatientBillSummaryBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request,FileInfo } from '../../../Core/Index';
import { PatientBillSummaryAttributes } from '../Model/Interface/Index';
import { PatientBillSummaryFilters } from '../Common/Filters.e';

export class PatientBillSummaryService extends BaseService {
    private PatientBillSummaryBo: PatientBillSummaryBo;
    constructor(req?: Request) {
        super(req);
        this.PatientBillSummaryBo = BoFactory.GetBo(PatientBillSummaryBo, this.Request);
    }

    public async AddPatientBillSummary(req: BaseRequest): Promise<number> {
        return await this.PatientBillSummaryBo.AddPatientBillSummary(req);
    }

    // public async UpdatePatientBillSummary(req: BaseRequest): Promise<boolean> {
    //     return await this.PatientBillSummaryBo.UpdatePatientBillSummary(req);
    // }

    public async UpdatePatientBillSummary(req: BaseRequest): Promise<any> {
        return await this.PatientBillSummaryBo.UpdatePatientBillSummary(req);
    }

    public async UpdateBillSummary(req: BaseRequest): Promise<boolean> {
        return await this.PatientBillSummaryBo.UpdateBillSummary(req);
    }

    public async GetPatientBillSummaryById(req: BaseRequest): Promise<PatientBillSummaryAttributes> {
        return await this.PatientBillSummaryBo.GetPatientBillSummaryById(req);
    }

    public async GetPatientBillSummarys(apiReq?: ApiRequest<PatientBillSummaryFilters>)
        : Promise<ApiResponse<PatientBillSummaryAttributes[]>> {
        return await this.PatientBillSummaryBo.GetPatientBillSummarys(apiReq);
    }

    public async GetPatientBillSummaryDetails(req: BaseRequest): Promise<any> {
        return await this.PatientBillSummaryBo.GetPatientBillSummaryDetails(req);
    }

    public async DeletePatientBillSummary(req: BaseRequest): Promise<Boolean> {
        return await this.PatientBillSummaryBo.DeletePatientBillSummary(req);
    }
      public async PrintPatientBillSummary(req: BaseRequest): Promise<FileInfo> {
        return await this.PatientBillSummaryBo.PrintPatientBillSummary(req);
    }
}
