import { BaseService, BoFactory } from '../../Base/Index';
import { PatientBillSplitDetailsBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { PatientBillSplitDetailsAttributes } from '../Model/Interface/Index';
import { PatientBillSplitDetailsFilters } from '../Common/Filters.e';

export class PatientBillSplitDetailsService extends BaseService {
    private PatientBillSplitDetailsBo: PatientBillSplitDetailsBo;
    constructor(req?: Request) {
        super(req);
        this.PatientBillSplitDetailsBo = BoFactory.GetBo(PatientBillSplitDetailsBo, this.Request);
    }

    public async AddPatientBillSplitDetails(req: BaseRequest): Promise<number> {
        return await this.PatientBillSplitDetailsBo.AddPatientBillSplitDetails(req);
    }

    public async UpdatePatientBillSplitDetails(req: BaseRequest): Promise<boolean> {
        return await this.PatientBillSplitDetailsBo.UpdatePatientBillSplitDetails(req);
    }

    public async GetPatientBillSplitDetailsById(req: BaseRequest): Promise<PatientBillSplitDetailsAttributes> {
        return await this.PatientBillSplitDetailsBo.GetPatientBillSplitDetailsById(req);
    }

    public async GetPatientBillSplitDetails(apiReq?: ApiRequest<PatientBillSplitDetailsFilters>)
        : Promise<ApiResponse<PatientBillSplitDetailsAttributes[]>> {
        return await this.PatientBillSplitDetailsBo.GetPatientBillSplitDetails(apiReq);
    }

    public async DeletePatientBillSplitDetails(req: BaseRequest): Promise<Boolean> {
        return await this.PatientBillSplitDetailsBo.DeletePatientBillSplitDetails(req);
    }
}
