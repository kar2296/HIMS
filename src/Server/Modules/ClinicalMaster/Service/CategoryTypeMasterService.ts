import {BaseService, BoFactory } from '../../Base/Index';
import { CategoryTypeMasterBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { CategoryTypeMasterAttributes } from '../Model/Interface/Index';
import { CategoryTypeMasterFilters } from '../Common/Filters.e';

export class CategoryTypeMasterService extends BaseService {
    private CategoryTypeMasterBo: CategoryTypeMasterBo;
    constructor(req?: Request) {
        super(req);
        this.CategoryTypeMasterBo = BoFactory.GetBo(CategoryTypeMasterBo, this.Request);
    }

    public async AddCategoryTypeMaster(req: BaseRequest): Promise<number> {
        return await this.CategoryTypeMasterBo.AddCategoryTypeMaster(req);
    }

    public async UpdateCategoryTypeMaster(req: BaseRequest): Promise<boolean> {
        return await this.CategoryTypeMasterBo.UpdateCategoryTypeMaster(req);
    }

    public async GetCategoryTypeMasterById(req: BaseRequest): Promise<CategoryTypeMasterAttributes> {
        return await this.CategoryTypeMasterBo.GetCategoryTypeMasterById(req);
    }

    public async GetCategoryTypeMasters(apiReq?: ApiRequest<CategoryTypeMasterFilters>):
     Promise<ApiResponse<CategoryTypeMasterAttributes[]>> {
        return await this.CategoryTypeMasterBo.GetCategoryTypeMasters(apiReq);
    }

    public async DeleteCategoryTypeMaster(req: BaseRequest): Promise<Boolean> {
        return await this.CategoryTypeMasterBo.DeleteCategoryTypeMaster(req);
    }
}
