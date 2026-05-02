import { BaseService, BoFactory } from '../../Base/Index';
import { OtDashboardBo } from '../Business/Index';
import { BaseRequest } from '../../../Common/Index';
import { Request } from '../../../Core/Index';

export class OtDashboardService extends BaseService {
    private OtDashboardBo: OtDashboardBo;
    constructor(req?: Request) {
        super(req);
        this.OtDashboardBo = BoFactory.GetBo(OtDashboardBo, this.Request);
    }

    public async GetOtDashboardOptions(req: BaseRequest): Promise<any> {
        return await this.OtDashboardBo.GetOtDashboardOptions(req);
    }
}
