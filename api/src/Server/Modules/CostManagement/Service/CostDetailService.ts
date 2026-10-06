import { BaseService, BoFactory } from '../../Base/Index';
import { CostDetailBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { CostDetailAttributes } from '../Model/Interface/Index';
import { CostDetailFilters } from '../Common/Filters.e';

export class CostDetailService extends BaseService {
    private CostDetailBo: CostDetailBo;
    constructor(req?: Request) {
        super(req);
        this.CostDetailBo = BoFactory.GetBo(CostDetailBo, this.Request);
    }
    public async AddCostDetail(req: BaseRequest): Promise<number> {
        return await this.CostDetailBo.AddCostDetail(req);
    }
    public async UpdateCostDetail(req: BaseRequest): Promise<boolean> {
        return await this.CostDetailBo.UpdateCostDetail(req);
    }

    public async GetCostDetailById(req: BaseRequest): Promise<CostDetailAttributes> {
        return await this.CostDetailBo.GetCostDetailById(req);
    }
    public async GetCostDetails(apiReq?: ApiRequest<CostDetailFilters>): Promise<ApiResponse<CostDetailAttributes[]>> {
        return await this.CostDetailBo.GetCostDetails(apiReq);
    }
    public async DeleteCostDetail(req: BaseRequest): Promise<Boolean> {
        return await this.CostDetailBo.DeleteCostDetail(req);
    }
}
