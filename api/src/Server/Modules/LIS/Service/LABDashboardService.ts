import { BaseService, BoFactory } from '../../Base/Index';
import { LABDashboardBo } from '../Business/Index';
import { BaseRequest } from '../../../Common/Index';
import { Request } from '../../../Core/Index';

export class LABDashboardService extends BaseService {
    private LABDashboardBo: LABDashboardBo;
    constructor(req?: Request) {
        super(req);
        this.LABDashboardBo = BoFactory.GetBo(LABDashboardBo, this.Request);
    }

    public async GetLABDashboardOptions(req: BaseRequest): Promise<any> {
        return await this.LABDashboardBo.GetLABDashboardOptions(req);
    }
}
