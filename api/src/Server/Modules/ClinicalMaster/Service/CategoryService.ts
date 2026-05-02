import { BaseService, BoFactory } from '../../Base/Index';
import { CategoryBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { CategoryAttributes } from '../Model/Interface/Index';
import { CategoryFilters } from '../Common/Filters.e';

export class CategoryService extends BaseService {
    private CategoryBo: CategoryBo;
    constructor(req?: Request) {
        super(req);
        this.CategoryBo = BoFactory.GetBo(CategoryBo, this.Request);
    }

    public async ImportCategories(req: BaseRequest): Promise<number> {
        return await this.CategoryBo.ImportCategories(req);
    }

    public async AddCategory(req: BaseRequest): Promise<number> {
        return await this.CategoryBo.AddCategory(req);
    }

    public async UpdateCategory(req: BaseRequest): Promise<boolean> {
        return await this.CategoryBo.UpdateCategory(req);
    }

    public async GetCategoryById(req: BaseRequest): Promise<CategoryAttributes> {
        return await this.CategoryBo.GetCategoryById(req);
    }

    public async GetCategoriesByType(req: BaseRequest): Promise<CategoryAttributes> {
        return await this.CategoryBo.GetCategoriesByType(req);
    }

    public async GetCategorys(apiReq?: ApiRequest<CategoryFilters>): Promise<ApiResponse<CategoryAttributes[]>> {
        return await this.CategoryBo.GetCategorys(apiReq);
    }

    public async GetCategorysWithoutConcept(apiReq?: ApiRequest<CategoryFilters>): Promise<ApiResponse<CategoryAttributes[]>> {
        return await this.CategoryBo.GetCategorysWithoutConcept(apiReq);
    }

    public async DeleteCategory(req: BaseRequest): Promise<Boolean> {
        return await this.CategoryBo.DeleteCategory(req);
    }
}
