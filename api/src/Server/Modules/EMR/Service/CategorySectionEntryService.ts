import { BaseService, BoFactory } from '../../Base/Index';
import { CategorySectionEntryBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { CategorySectionEntryAttributes } from '../Model/Interface/Index';
import { CategorySectionEntryFilters } from '../Common/Filters.e';

export class CategorySectionEntryService extends BaseService {
    private CategorySectionEntryBo: CategorySectionEntryBo;
    constructor(req?: Request) {
        super(req);
        this.CategorySectionEntryBo = BoFactory.GetBo(CategorySectionEntryBo, this.Request);
    }

    public async AddCategorySectionEntry(req: BaseRequest): Promise<number> {
        return await this.CategorySectionEntryBo.AddCategorySectionEntry(req);
    }

    public async UpdateCategorySectionEntry(req: BaseRequest): Promise<boolean> {
        return await this.CategorySectionEntryBo.UpdateCategorySectionEntry(req);
    }

    public async ManageCategorySectionEntries(req: BaseRequest): Promise<boolean> {
        return await this.CategorySectionEntryBo.ManageCategorySectionEntries(req);
    }

    public async GetCategorySectionEntryById(req: BaseRequest): Promise<CategorySectionEntryAttributes> {
        return await this.CategorySectionEntryBo.GetCategorySectionEntryById(req);
    }

    public async GetCategorySectionEntrys(apiReq?: ApiRequest<CategorySectionEntryFilters>):
        Promise<ApiResponse<CategorySectionEntryAttributes[]>> {
        return await this.CategorySectionEntryBo.GetCategorySectionEntrys(apiReq);
    }

    public async GetCategorySectionEntrysForReview(req: BaseRequest):
        Promise<ApiResponse<CategorySectionEntryAttributes[]>> {
        return await this.CategorySectionEntryBo.GetCategorySectionEntrysForReview(req);
    }

    public async DeleteCategorySectionEntryGroup(req: BaseRequest): Promise<Boolean> {
        return await this.CategorySectionEntryBo.DeleteCategorySectionEntryGroup(req);
    }

    public async DeleteCategorySectionEntry(req: BaseRequest): Promise<Boolean> {
        return await this.CategorySectionEntryBo.DeleteCategorySectionEntry(req);
    }
}
