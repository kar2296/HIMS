import {BaseService, BoFactory} from '../../Base/Index';
import { AssetAuditBo} from '../Business/Index';
import {ApiRequest, BaseRequest, ApiResponse} from '../../../Common/Index';
import {Request} from '../../../Core/Index';
import { AssetAuditAttributes} from '../Model/Interface/Index';
import { AssetAuditFilters } from '../Common/Filters.e';

export class AssetAuditService extends BaseService {
    private AssetAuditBo: AssetAuditBo;
    constructor(req?: Request) {
        super(req);
        this.AssetAuditBo = BoFactory.GetBo(AssetAuditBo, this.Request);
    }

    public async AddAssetAudit(req: BaseRequest): Promise<number> {
        return await this.AssetAuditBo.AddAssetAudit(req);
    }

    public async UpdateAssetAudit(req: BaseRequest): Promise<boolean> {
        return await this.AssetAuditBo.UpdateAssetAudit(req);
    }

    public async GetAssetAuditById(req: BaseRequest): Promise<AssetAuditAttributes> {
        return await this.AssetAuditBo.GetAssetAuditById(req);
    }

    public async GetAssetAudits(apiReq?: ApiRequest<AssetAuditFilters>): Promise<ApiResponse<AssetAuditAttributes[]>> {
        return await this.AssetAuditBo.GetAssetAudits(apiReq);
    }

    public async DeleteAssetAudit(req: BaseRequest): Promise<Boolean> {
        return await this.AssetAuditBo.DeleteAssetAudit(req);
    }
}
