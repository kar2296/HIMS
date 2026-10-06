import { BaseService, BoFactory } from '../../Base/Index';
import { DietDashboardBo } from '../Business/Index';
import { BaseRequest } from '../../../Common/Index';
import { Request } from '../../../Core/Index';

export class DietDashboardService extends BaseService {
    private DietDashboardBo: DietDashboardBo;
    constructor(req?: Request) {
        super(req);
        this.DietDashboardBo = BoFactory.GetBo(DietDashboardBo, this.Request);
    }

    public async GetDietDashboardOptions(req: BaseRequest): Promise<any> {
        return await this.DietDashboardBo.GetDietDashboardOptions(req);
    }
}
