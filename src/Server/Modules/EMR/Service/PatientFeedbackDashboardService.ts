import { BaseService, BoFactory } from '../../Base/Index';
import { PatientFeedbackDashboardBo } from '../Business/Index';
import { BaseRequest } from '../../../Common/Index';
import { Request } from '../../../Core/Index';

export class PatientFeedbackDashboardService extends BaseService {
    private PatientFeedbackDashboardBo: PatientFeedbackDashboardBo;
    constructor(req?: Request) {
        super(req);
        this.PatientFeedbackDashboardBo = BoFactory.GetBo(PatientFeedbackDashboardBo, this.Request);
    }

    public async GetPatientFeedbackDashboardOptions(req: BaseRequest): Promise<any> {
        return await this.PatientFeedbackDashboardBo.GetPatientFeedbackDashboardOptions(req);
    }
}
