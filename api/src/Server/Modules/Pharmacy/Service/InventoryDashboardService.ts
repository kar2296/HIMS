import { BaseService, BoFactory } from '../../Base/Index';
import { InventoryDashboardBo } from '../Business/Index';
import { BaseRequest } from '../../../Common/Index';
import { Request } from '../../../Core/Index';

export class InventoryDashboardService extends BaseService {
    private InventoryDashboardBo: InventoryDashboardBo;
    constructor(req?: Request) {
        super(req);
        this.InventoryDashboardBo = BoFactory.GetBo(InventoryDashboardBo, this.Request);
    }

    public async GetInventoryDashboardOptions(req: BaseRequest): Promise<any> {
        return await this.InventoryDashboardBo.GetInventoryDashboardOptions(req);
    }
}
