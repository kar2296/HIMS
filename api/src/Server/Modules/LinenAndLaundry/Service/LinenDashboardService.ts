import { BaseService, BoFactory } from '../../Base/Index';
import { LinenDashboardBo } from '../Business/Index';
import { BaseRequest } from '../../../Common/Index';
import { Request } from '../../../Core/Index';

export class LinenDashboardService extends BaseService {
    private LinenDashboardBo: LinenDashboardBo;
    constructor(req?: Request) {
        super(req);
        this.LinenDashboardBo = BoFactory.GetBo(LinenDashboardBo, this.Request);
    }

    public async GetLinenDashboardOptions(req: BaseRequest): Promise<any> {
        return await this.LinenDashboardBo.GetLinenDashboardOptions(req);
    }
}
