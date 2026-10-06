import { BaseService, BoFactory } from '../../Base/Index';
import { AssetAuditDetailBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { AssetAuditDetailAttributes } from '../Model/Interface/Index';
import { AssetAuditDetailFilters } from '../Common/Filters.e';

export class AssetAuditDetailService extends BaseService {
    private AssetAuditDetailBo: AssetAuditDetailBo;
    constructor(req?: Request) {
        super(req);
        this.AssetAuditDetailBo = BoFactory.GetBo(AssetAuditDetailBo, this.Request);
    }

    public async AddAssetAuditDetail(req: BaseRequest): Promise<number> {
        return await this.AssetAuditDetailBo.AddAssetAuditDetail(req);
    }

    public async UpdateAssetAuditDetail(req: BaseRequest): Promise<boolean> {
        return await this.AssetAuditDetailBo.UpdateAssetAuditDetail(req);
    }

    public async GetAssetAuditDetailById(req: BaseRequest): Promise<AssetAuditDetailAttributes> {
        return await this.AssetAuditDetailBo.GetAssetAuditDetailById(req);
    }

    public async GetAssetAuditDetails(apiReq?: ApiRequest<AssetAuditDetailFilters>): Promise<ApiResponse<AssetAuditDetailAttributes[]>> {
        return await this.AssetAuditDetailBo.GetAssetAuditDetails(apiReq);
    }

    public async DeleteAssetAuditDetail(req: BaseRequest): Promise<Boolean> {
        return await this.AssetAuditDetailBo.DeleteAssetAuditDetail(req);
    }
    public async PrintAssetAudit(apiReq?: ApiRequest<AssetAuditDetailFilters>): Promise<any> {
        return await this.AssetAuditDetailBo.PrintAssetAudit(apiReq);
    }
    public async PrintAssetAuditReport(apiReq?: ApiRequest<AssetAuditDetailFilters>): Promise<any> {
        return await this.AssetAuditDetailBo.PrintAssetAuditReport(apiReq);
    }
    public async PrintAssetReconcileReport(apiReq?: ApiRequest<AssetAuditDetailFilters>): Promise<any> {
        return await this.AssetAuditDetailBo.PrintAssetReconcileReport(apiReq);
    }
}
