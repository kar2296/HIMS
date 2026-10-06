import { BaseService, BoFactory } from '../../Base/Index';
import { PatientDispenseDetailsBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { PatientDispenseDetailsAttributes } from '../Model/Interface/Index';
import { PatientDispenseDetailFilters } from '../Common/Filters.e';

export class PatientDispenseDetailsService extends BaseService {
    private PatientDispenseDetailsBo: PatientDispenseDetailsBo;
    constructor(req?: Request) {
        super(req);
        this.PatientDispenseDetailsBo = BoFactory.GetBo(PatientDispenseDetailsBo, this.Request);
    }

    public async AddPatientDispenseDetails(req: BaseRequest): Promise<number> {
        return await this.PatientDispenseDetailsBo.AddPatientDispenseDetails(req);
    }

    public async UpdatePatientDispenseDetails(req: BaseRequest): Promise<boolean> {
        return await this.PatientDispenseDetailsBo.UpdatePatientDispenseDetails(req);
    }

    public async GetPatientDispenseDetailsById(req: BaseRequest): Promise<PatientDispenseDetailsAttributes> {
        return await this.PatientDispenseDetailsBo.GetPatientDispenseDetailsById(req);
    }

    public async GetPatientDispenseDetails(apiReq?: ApiRequest<PatientDispenseDetailFilters>):
        Promise<ApiResponse<PatientDispenseDetailsAttributes[]>> {
        return await this.PatientDispenseDetailsBo.GetPatientDispenseDetails(apiReq);
    }

    public async DeletePatientDispenseDetails(req: BaseRequest): Promise<Boolean> {
        return await this.PatientDispenseDetailsBo.DeletePatientDispenseDetails(req);
    }
    public async PrintPatientIPDispensesDetailsReport(apiReq?: ApiRequest<PatientDispenseDetailFilters>): Promise<any> {
        return await this.PatientDispenseDetailsBo.PrintPatientIPDispensesDetailsReport(apiReq);
    }
}
