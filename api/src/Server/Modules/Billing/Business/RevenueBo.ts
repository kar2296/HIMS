import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { BaseRequest, ApiRequest, ApiResponse } from '../../../Common/Index';
import { RevenueInstance, RevenueAttributes } from '../Model/Interface/Index';
import { RevenueFilters } from '../Common/Filters.e';

export class RevenueBo extends BaseBo<RevenueInstance, RevenueAttributes> {
    public async AddRevenue(req: BaseRequest): Promise<number> {
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateRevenue(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetRevenueById(req: BaseRequest): Promise<RevenueAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetRevenues(apiReq?: ApiRequest<RevenueFilters>): Promise<ApiResponse<RevenueAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        let order: Array<any> = [];
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case RevenueFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case RevenueFilters.FacilityId:
                        where['FacilityId'] = param.Value;
                        break;
                    case RevenueFilters.RevenueDate:
                        where['RevenueDate'] = param.Value;
                        break;
                    case RevenueFilters.FromDate:
                        where['RevenueDate'] = where['RevenueDate'] || {};
                        (where['RevenueDate'] as any)['$gte'] = param.Value;
                        break;
                    case RevenueFilters.ToDate:
                        where['RevenueDate'] = where['RevenueDate'] || {};
                        (where['RevenueDate'] as any)['$lte'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        order.push(['UpdatedAt', 'ASC']);
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes, order: order });
    }

    public async DeleteRevenue(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<RevenueInstance, RevenueAttributes> {
        return this.Models.Revenue;
    }
}
