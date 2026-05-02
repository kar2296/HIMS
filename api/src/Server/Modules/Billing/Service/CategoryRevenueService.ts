import { BaseService, BoFactory } from '../../Base/Index';
import { CategoryRevenueBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { CategoryRevenueAttributes } from '../Model/Interface/Index';
import { CategoryRevenueFilters } from '../Common/Filters.e';

export class CategoryRevenueService extends BaseService {
    private CategoryRevenueBo: CategoryRevenueBo;
    constructor(req?: Request) {
        super(req);
        this.CategoryRevenueBo = BoFactory.GetBo(CategoryRevenueBo, this.Request);
    }
    public async AddCategoryRevenue(req: BaseRequest): Promise<number> {
        return await this.CategoryRevenueBo.AddCategoryRevenue(req);
    }
    public async UpdateCategoryRevenue(req: BaseRequest): Promise<boolean> {
        return await this.CategoryRevenueBo.UpdateCategoryRevenue(req);
    }
    public async GetCategoryRevenueById(req: BaseRequest): Promise<CategoryRevenueAttributes> {
        return await this.CategoryRevenueBo.GetCategoryRevenueById(req);
    }
    public async GetCategoryRevenues(apiReq?: ApiRequest<CategoryRevenueFilters>): Promise<ApiResponse<CategoryRevenueAttributes[]>> {
        return await this.CategoryRevenueBo.GetCategoryRevenues(apiReq);
    }
    public async DeleteCategoryRevenue(req: BaseRequest): Promise<Boolean> {
        return await this.CategoryRevenueBo.DeleteCategoryRevenue(req);
    }
}
