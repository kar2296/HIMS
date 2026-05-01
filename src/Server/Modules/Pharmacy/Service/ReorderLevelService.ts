import { BaseService, BoFactory } from '../../Base/Index';
import { ReorderLevelBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { ReorderLevelAttributes } from '../Model/Interface/Index';
import { ReorderLevelFilters } from '../Common/Filters.e';

export class ReorderLevelService extends BaseService {
    private ReorderLevelBo: ReorderLevelBo;
    constructor(req?: Request) {
        super(req);
        this.ReorderLevelBo = BoFactory.GetBo(ReorderLevelBo, this.Request);
    }

    public async AddReorderLevel(req: BaseRequest): Promise<number> {
        return await this.ReorderLevelBo.AddReorderLevel(req);
    }

    public async UpdateReorderLevel(req: BaseRequest): Promise<boolean> {
        return await this.ReorderLevelBo.UpdateReorderLevel(req);
    }

    public async GetReorderLevelById(req: BaseRequest): Promise<ReorderLevelAttributes> {
        return await this.ReorderLevelBo.GetReorderLevelById(req);
    }

    public async GetReorderLevels(apiReq?: ApiRequest<ReorderLevelFilters>): Promise<ApiResponse<ReorderLevelAttributes[]>> {
        return await this.ReorderLevelBo.GetReorderLevels(apiReq);
    }

    public async DeleteReorderLevel(req: BaseRequest): Promise<Boolean> {
        return await this.ReorderLevelBo.DeleteReorderLevel(req);
    }
}
