import { BaseService, BoFactory } from '../../Base/Index';
import { PatientBillPackageSummaryBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { PatientBillPackageSummaryAttributes } from '../Model/Interface/Index';
import { PatientBillPackageSummaryFilters } from '../Common/Filters.e';

export class PatientBillPackageSummaryService extends BaseService {
    private PatientBillPackageSummaryBo: PatientBillPackageSummaryBo;
    constructor(req?: Request) {
        super(req);
        this.PatientBillPackageSummaryBo = BoFactory.GetBo(PatientBillPackageSummaryBo, this.Request);
    }

    public async AddPatientBillPackageSummary(req: BaseRequest): Promise<number> {
        return await this.PatientBillPackageSummaryBo.AddPatientBillPackageSummary(req);
    }

    public async UpdatePatientBillPackageSummary(req: BaseRequest): Promise<boolean> {
        return await this.PatientBillPackageSummaryBo.UpdatePatientBillPackageSummary(req);
    }

    public async GetPatientBillPackageSummaryById(req: BaseRequest): Promise<PatientBillPackageSummaryAttributes> {
        return await this.PatientBillPackageSummaryBo.GetPatientBillPackageSummaryById(req);
    }

    public async GetPatientBillPackageSummarys(apiReq?: ApiRequest<PatientBillPackageSummaryFilters>):
        Promise<ApiResponse<PatientBillPackageSummaryAttributes[]>> {
        return await this.PatientBillPackageSummaryBo.GetPatientBillPackageSummarys(apiReq);
    }

    public async DeletePatientBillPackageSummary(req: BaseRequest): Promise<Boolean> {
        return await this.PatientBillPackageSummaryBo.DeletePatientBillPackageSummary(req);
    }

    public async GetPatientBillPackageSummaryDetails(req: BaseRequest): Promise<any> {
        return await this.PatientBillPackageSummaryBo.GetPatientBillPackageSummaryDetails(req);
    }

    public async PrintPatientBillPackageSummary(req: BaseRequest): Promise<any> {
        return await this.PatientBillPackageSummaryBo.PrintPatientBillPackageSummary(req);
    }
}
