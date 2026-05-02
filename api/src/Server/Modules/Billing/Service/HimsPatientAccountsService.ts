import { BaseService, BoFactory } from '../../Base/Index';
import { PatientAccountsBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { PatientAccountsAttributes } from '../Model/Interface/Index';
import { PatientAccountsFilters } from '../Common/Filters.e';

export class PatientAccountsService extends BaseService {
    private PatientAccountsBo: PatientAccountsBo;
    constructor(req?: Request) {
        super(req);
        this.PatientAccountsBo = BoFactory.GetBo(PatientAccountsBo, this.Request);
    }

    public async AddPatientAccounts(req: BaseRequest): Promise<number> {
        return await this.PatientAccountsBo.AddPatientAccounts(req);
    }

    public async UpdatePatientAccounts(req: BaseRequest): Promise<boolean> {
        return await this.PatientAccountsBo.UpdatePatientAccounts(req);
    }

    public async GetPatientAccountsById(req: BaseRequest): Promise<PatientAccountsAttributes> {
        return await this.PatientAccountsBo.GetPatientAccountsById(req);
    }

    public async GetPatientAccounts(apiReq?: ApiRequest<PatientAccountsFilters>): Promise<ApiResponse<PatientAccountsAttributes[]>> {
        return await this.PatientAccountsBo.GetPatientAccounts(apiReq);
    }

    public async DeletePatientAccounts(req: BaseRequest): Promise<Boolean> {
        return await this.PatientAccountsBo.DeletePatientAccounts(req);
    }
}
