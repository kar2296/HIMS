import { BaseService, BoFactory } from '../../Base/Index';
import { DoctorDashboardBo } from '../Business/Index';
import { BaseRequest } from '../../../Common/Index';
import { Request } from '../../../Core/Index';

export class DoctorDashboardService extends BaseService {
    private DoctorDashboardBo: DoctorDashboardBo;
    constructor(req?: Request) {
        super(req);
        this.DoctorDashboardBo = BoFactory.GetBo(DoctorDashboardBo, this.Request);
    }

    public async GetDashboardOptions(req: BaseRequest): Promise<any> {
        return await this.DoctorDashboardBo.GetDashboardOptions(req);
    }
}
