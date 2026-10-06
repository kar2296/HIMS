import { BaseService, BoFactory } from '../../Base/Index';
import { RevenueBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { RevenueAttributes } from '../Model/Interface/Index';
import { RevenueFilters } from '../Common/Filters.e';

export class RevenueService extends BaseService {
    private RevenueBo: RevenueBo;
    constructor(req?: Request) {
        super(req);
        this.RevenueBo = BoFactory.GetBo(RevenueBo, this.Request);
    }
    public async AddRevenue(req: BaseRequest): Promise<number> {
        return await this.RevenueBo.AddRevenue(req);
    }
    public async UpdateRevenue(req: BaseRequest): Promise<boolean> {
        return await this.RevenueBo.UpdateRevenue(req);
    }
    public async GetRevenueById(req: BaseRequest): Promise<RevenueAttributes> {
        return await this.RevenueBo.GetRevenueById(req);
    }
    public async GetRevenues(apiReq?: ApiRequest<RevenueFilters>): Promise<ApiResponse<RevenueAttributes[]>> {
        return await this.RevenueBo.GetRevenues(apiReq);
    }
    public async DeleteRevenue(req: BaseRequest): Promise<Boolean> {
        return await this.RevenueBo.DeleteRevenue(req);
    }
}
