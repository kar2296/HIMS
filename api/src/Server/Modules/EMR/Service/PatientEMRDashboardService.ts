import { BaseService, BoFactory } from '../../Base/Index';
import { PatientEMRDashboardBo } from '../Business/Index';
import { BaseRequest } from '../../../Common/Index';
import { Request } from '../../../Core/Index';

export class PatientEMRDashboardService extends BaseService {
    private PatientEMRDashboardBo: PatientEMRDashboardBo;
    constructor(req?: Request) {
        super(req);
        this.PatientEMRDashboardBo = BoFactory.GetBo(PatientEMRDashboardBo, this.Request);
    }

    public async GetPatientEMRDashboardOptions(req: BaseRequest): Promise<any> {
        return await this.PatientEMRDashboardBo.GetPatientEMRDashboardOptions(req);
    }
}
