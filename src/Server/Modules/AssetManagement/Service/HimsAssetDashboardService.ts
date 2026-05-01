import { BaseService, BoFactory } from '../../Base/Index';
import { AssetDashboardBo } from '../Business/Index';
import { BaseRequest } from '../../../Common/Index';
import { Request } from '../../../Core/Index';

export class AssetDashboardService extends BaseService {
    private AssetDashboardBo: AssetDashboardBo;
    constructor(req?: Request) {
        super(req);
        this.AssetDashboardBo = BoFactory.GetBo(AssetDashboardBo, this.Request);
    }

    public async GetAssetDashboardOptions(req: BaseRequest): Promise<any> {
        return await this.AssetDashboardBo.GetAssetDashboardOptions(req);
    }
}
