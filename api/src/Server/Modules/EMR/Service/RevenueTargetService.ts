import { BaseService, BoFactory } from '../../Base/Index';
import { RevenueTargetBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { RevenueTargetAttributes } from '../Model/Interface/Index';
import { RevenueTargetFilters } from '../Common/Filters.e';

export class RevenueTargetService extends BaseService {
    private RevenueTargetBo: RevenueTargetBo;
    constructor(req?: Request) {
        super(req);
        this.RevenueTargetBo = BoFactory.GetBo(RevenueTargetBo, this.Request);
    }

    public async AddRevenueTarget(req: BaseRequest): Promise<number> {
        return await this.RevenueTargetBo.AddRevenueTarget(req);
    }

    public async UpdateRevenueTarget(req: BaseRequest): Promise<boolean> {
        return await this.RevenueTargetBo.UpdateRevenueTarget(req);
    }

    public async GetRevenueTargetById(req: BaseRequest): Promise<RevenueTargetAttributes> {
        return await this.RevenueTargetBo.GetRevenueTargetById(req);
    }

    public async GetRevenueTargets(apiReq?: ApiRequest<RevenueTargetFilters>):
        Promise<ApiResponse<RevenueTargetAttributes[]>> {
        return await this.RevenueTargetBo.GetRevenueTargets(apiReq);
    }

    public async DeleteRevenueTarget(req: BaseRequest): Promise<Boolean> {
        return await this.RevenueTargetBo.DeleteRevenueTarget(req);
    }
}
