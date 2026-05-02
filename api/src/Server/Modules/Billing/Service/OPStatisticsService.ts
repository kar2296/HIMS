import { BaseService, BoFactory } from '../../Base/Index';
import { OPStatisticsBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { OPStatisticsAttributes } from '../Model/Interface/Index';
import { OPStatisticsFilters } from '../Common/Filters.e';

export class OPStatisticsService extends BaseService {
    private OPStatisticsBo: OPStatisticsBo;
    constructor(req?: Request) {
        super(req);
        this.OPStatisticsBo = BoFactory.GetBo(OPStatisticsBo, this.Request);
    }
    public async AddOPStatistics(req: BaseRequest): Promise<number> {
        return await this.OPStatisticsBo.AddOPStatistics(req);
    }
    public async UpdateOPStatistics(req: BaseRequest): Promise<boolean> {
        return await this.OPStatisticsBo.UpdateOPStatistics(req);
    }
    public async GetOPStatisticsById(req: BaseRequest): Promise<OPStatisticsAttributes> {
        return await this.OPStatisticsBo.GetOPStatisticsById(req);
    }
    public async GetOPStatisticss(apiReq?: ApiRequest<OPStatisticsFilters>): Promise<ApiResponse<OPStatisticsAttributes[]>> {
        return await this.OPStatisticsBo.GetOPStatisticss(apiReq);
    }
    public async DeleteOPStatistics(req: BaseRequest): Promise<Boolean> {
        return await this.OPStatisticsBo.DeleteOPStatistics(req);
    }
}
