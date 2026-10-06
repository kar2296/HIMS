import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { BaseRequest, ApiRequest, ApiResponse } from '../../../Common/Index';
import { OPStatisticsInstance, OPStatisticsAttributes } from '../Model/Interface/Index';
import { OPStatisticsFilters } from '../Common/Filters.e';

export class OPStatisticsBo extends BaseBo<OPStatisticsInstance, OPStatisticsAttributes> {
    public async AddOPStatistics(req: BaseRequest): Promise<number> {
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateOPStatistics(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetOPStatisticsById(req: BaseRequest): Promise<OPStatisticsAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetOPStatisticss(apiReq?: ApiRequest<OPStatisticsFilters>): Promise<ApiResponse<OPStatisticsAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        let order: Array<any> = [];
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case OPStatisticsFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case OPStatisticsFilters.VisitDate:
                        where['VisitDate'] = param.Value;
                        break;
                    case OPStatisticsFilters.FromDate:
                        where['VisitDate'] = where['VisitDate'] || {};
                        (where['VisitDate'] as any)['$gte'] = param.Value;
                        break;
                    case OPStatisticsFilters.ToDate:
                        where['VisitDate'] = where['VisitDate'] || {};
                        (where['VisitDate'] as any)['$lte'] = param.Value;
                        break;
                    case OPStatisticsFilters.FacilityId:
                        where['FacilityId'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        order.push(['UpdatedAt', 'ASC']);
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes, order: order });
    }

    public async DeleteOPStatistics(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<OPStatisticsInstance, OPStatisticsAttributes> {
        return this.Models.OPStatistics;
    }
}
