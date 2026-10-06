import { BaseService, BoFactory } from '../../Base/Index';
import { StatisticsBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { StatisticsAttributes } from '../Model/Interface/Index';
import { StatisticsFilters } from '../Common/Filters.e';

export class StatisticsService extends BaseService {
    private StatisticsBo: StatisticsBo;
    constructor(req?: Request) {
        super(req);
        this.StatisticsBo = BoFactory.GetBo(StatisticsBo, this.Request);
    }

    public async AddStatistics(req: BaseRequest): Promise<number> {
        return await this.StatisticsBo.AddStatistics(req);
    }

    public async UpdateStatistics(req: BaseRequest): Promise<boolean> {
        return await this.StatisticsBo.UpdateStatistics(req);
    }

    public async GetStatisticsById(req: BaseRequest): Promise<StatisticsAttributes> {
        return await this.StatisticsBo.GetStatisticsById(req);
    }

    public async GetStatisticss(apiReq?: ApiRequest<StatisticsFilters>): Promise<ApiResponse<StatisticsAttributes[]>> {
        return await this.StatisticsBo.GetStatisticss(apiReq);
    }

    public async DeleteStatistics(req: BaseRequest): Promise<Boolean> {
        return await this.StatisticsBo.DeleteStatistics(req);
    }
}
