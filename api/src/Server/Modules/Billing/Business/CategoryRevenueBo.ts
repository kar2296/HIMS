import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { BaseRequest, ApiRequest, ApiResponse } from '../../../Common/Index';
import { CategoryRevenueInstance, CategoryRevenueAttributes } from '../Model/Interface/Index';
import { CategoryRevenueFilters } from '../Common/Filters.e';

export class CategoryRevenueBo extends BaseBo<CategoryRevenueInstance, CategoryRevenueAttributes> {
    public async AddCategoryRevenue(req: BaseRequest): Promise<number> {
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateCategoryRevenue(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetCategoryRevenueById(req: BaseRequest): Promise<CategoryRevenueAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetCategoryRevenues(apiReq?: ApiRequest<CategoryRevenueFilters>): Promise<ApiResponse<CategoryRevenueAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        let order: Array<any> = [];
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case CategoryRevenueFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case CategoryRevenueFilters.RevenueDate:
                        where['RevenueDate'] = param.Value;
                        break;
                    case CategoryRevenueFilters.FromDate:
                        where['RevenueDate'] = where['RevenueDate'] || {};
                        (where['RevenueDate'] as any)['$gte'] = param.Value;
                        break;
                    case CategoryRevenueFilters.ToDate:
                        where['RevenueDate'] = where['RevenueDate'] || {};
                        (where['RevenueDate'] as any)['$lte'] = param.Value;
                        break;
                    case CategoryRevenueFilters.FacilityId:
                        where['FacilityId'] = param.Value;
                        break;
                    case CategoryRevenueFilters.RevType:
                        where['RevType'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        order.push(['UpdatedAt', 'ASC']);
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes, order: order });
    }

    public async DeleteCategoryRevenue(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<CategoryRevenueInstance, CategoryRevenueAttributes> {
        return this.Models.CategoryRevenue;
    }
}
