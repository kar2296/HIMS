import { BaseService, BoFactory } from '../../Base/Index';
import { OPDDashboardBo } from '../Business/Index';
import { BaseRequest } from '../../../Common/Index';
import { Request } from '../../../Core/Index';

export class OPDDashboardService extends BaseService {
    private OPDDashboardBo: OPDDashboardBo;
    constructor(req?: Request) {
        super(req);
        this.OPDDashboardBo = BoFactory.GetBo(OPDDashboardBo, this.Request);
    }

    public async GetOPDDashboardOptions(req: BaseRequest): Promise<any> {
        return await this.OPDDashboardBo.GetOPDDashboardOptions(req);
    }
}
