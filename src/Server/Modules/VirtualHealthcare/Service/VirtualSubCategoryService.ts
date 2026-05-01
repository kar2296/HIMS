import { BaseService, BoFactory } from '../../Base/Index';
import { VirtualSubCategoryBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { VirtualSubCategoryAttributes } from '../Model/Interface/Index';
import { VirtualSubCategoryFilters } from '../Common/Filters.e';

export class VirtualSubCategoryService extends BaseService {
    private VirtualSubCategoryBo: VirtualSubCategoryBo;
    constructor(req?: Request) {
        super(req);
        this.VirtualSubCategoryBo = BoFactory.GetBo(VirtualSubCategoryBo, this.Request);
    }

    public async AddVirtualSubCategory(req: BaseRequest): Promise<number> {
        return await this.VirtualSubCategoryBo.AddVirtualSubCategory(req);
    }

    public async UpdateVirtualSubCategory(req: BaseRequest): Promise<boolean> {
        return await this.VirtualSubCategoryBo.UpdateVirtualSubCategory(req);
    }

    public async GetVirtualSubCategoryById(req: BaseRequest): Promise<VirtualSubCategoryAttributes> {
        return await this.VirtualSubCategoryBo.GetVirtualSubCategoryById(req);
    }

    public async GetVirtualSubCategorys(apiReq?: ApiRequest<VirtualSubCategoryFilters>):
        Promise<ApiResponse<VirtualSubCategoryAttributes[]>> {
        return await this.VirtualSubCategoryBo.GetVirtualSubCategorys(apiReq);
    }

    public async GetVirtualSubCategoryImage(apiReq?: ApiRequest<VirtualSubCategoryFilters>):
        Promise<ApiResponse<VirtualSubCategoryFilters[]>> {
        return await this.VirtualSubCategoryBo.GetVirtualSubCategoryImage(apiReq);
    }

    public async DeleteVirtualSubCategory(req: BaseRequest): Promise<Boolean> {
        return await this.VirtualSubCategoryBo.DeleteVirtualSubCategory(req);
    }
}
