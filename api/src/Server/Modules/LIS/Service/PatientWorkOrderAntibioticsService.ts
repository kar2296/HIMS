import { BaseService, BoFactory } from '../../Base/Index';
import { PatientWorkOrderAntibioticsBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { PatientWorkOrderAntibioticsAttributes } from '../Model/Interface/Index';
import { PatientWorkOrderAntibioticsFilters } from '../Common/Filters.e';

export class PatientWorkOrderAntibioticsService extends BaseService {
    private PatientWorkOrderAntibioticsBo: PatientWorkOrderAntibioticsBo;
    constructor(req?: Request) {
        super(req);
        this.PatientWorkOrderAntibioticsBo = BoFactory.GetBo(PatientWorkOrderAntibioticsBo, this.Request);
    }

    public async AddPatientWorkOrderAntibiotics(req: BaseRequest): Promise<number> {
        return await this.PatientWorkOrderAntibioticsBo.AddPatientWorkOrderAntibiotics(req);
    }

    public async UpdatePatientWorkOrderAntibiotics(req: BaseRequest): Promise<boolean> {
        return await this.PatientWorkOrderAntibioticsBo.UpdatePatientWorkOrderAntibiotics(req);
    }

    public async ManagePatientWorkOrderAntibiotics(req: BaseRequest): Promise<boolean> {
        return await this.PatientWorkOrderAntibioticsBo.ManagePatientWorkOrderAntibiotics(req);
    }

    public async GetPatientWorkOrderAntibioticsById(req: BaseRequest): Promise<PatientWorkOrderAntibioticsAttributes> {
        return await this.PatientWorkOrderAntibioticsBo.GetPatientWorkOrderAntibioticsById(req);
    }

    public async GetPatientWorkOrderAntibioticss(apiReq?: ApiRequest<PatientWorkOrderAntibioticsFilters>):
        Promise<ApiResponse<PatientWorkOrderAntibioticsAttributes[]>> {
        return await this.PatientWorkOrderAntibioticsBo.GetPatientWorkOrderAntibioticss(apiReq);
    }

    public async DeletePatientWorkOrderAntibiotics(req: BaseRequest): Promise<Boolean> {
        return await this.PatientWorkOrderAntibioticsBo.DeletePatientWorkOrderAntibiotics(req);
    }
}
