import {BaseService, BoFactory} from '../../Base/Index';
import { PatientDietPlanBo} from '../Business/Index';
import {ApiRequest, BaseRequest, ApiResponse} from '../../../Common/Index';
import {Request} from '../../../Core/Index';
import { PatientDietPlanAttributes} from '../Model/Interface/Index';
import { PatientDietPlanFilters } from '../Common/Filters.e';

export class PatientDietPlanService extends BaseService {
    private PatientDietPlanBo: PatientDietPlanBo;
    constructor(req?: Request) {
        super(req);
        this.PatientDietPlanBo = BoFactory.GetBo(PatientDietPlanBo, this.Request);
    }

    public async AddPatientDietPlan(req: BaseRequest): Promise<number> {
        return await this.PatientDietPlanBo.AddPatientDietPlan(req);
    }

    public async UpdatePatientDietPlan(req: BaseRequest): Promise<boolean> {
        return await this.PatientDietPlanBo.UpdatePatientDietPlan(req);
    }

    public async GetPatientDietPlanById(req: BaseRequest): Promise<PatientDietPlanAttributes> {
        return await this.PatientDietPlanBo.GetPatientDietPlanById(req);
    }

    public async GetPatientDietPlans(apiReq?: ApiRequest<PatientDietPlanFilters>): Promise<ApiResponse<PatientDietPlanAttributes[]>> {
        return await this.PatientDietPlanBo.GetPatientDietPlans(apiReq);
    }

    public async DeletePatientDietPlan(req: BaseRequest): Promise<Boolean> {
        return await this.PatientDietPlanBo.DeletePatientDietPlan(req);
    }
}
