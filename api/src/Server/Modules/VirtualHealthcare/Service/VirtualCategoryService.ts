import { BaseService, BoFactory } from '../../Base/Index';
import { VirtualCategoryBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { VirtualCategoryAttributes } from '../Model/Interface/Index';
import { VirtualCategoryFilters } from '../Common/Filters.e';

export class VirtualCategoryService extends BaseService {
    private VirtualCategoryBo: VirtualCategoryBo;
    constructor(req?: Request) {
        super(req);
        this.VirtualCategoryBo = BoFactory.GetBo(VirtualCategoryBo, this.Request);
    }

    public async AddVirtualCategory(req: BaseRequest): Promise<number> {
        return await this.VirtualCategoryBo.AddVirtualCategory(req);
    }

    public async UpdateVirtualCategory(req: BaseRequest): Promise<boolean> {
        return await this.VirtualCategoryBo.UpdateVirtualCategory(req);
    }

    public async GetVirtualCategoryById(req: BaseRequest): Promise<VirtualCategoryAttributes> {
        return await this.VirtualCategoryBo.GetVirtualCategoryById(req);
    }

    public async GetVirtualCategorys(apiReq?: ApiRequest<VirtualCategoryFilters>): Promise<ApiResponse<VirtualCategoryAttributes[]>> {
        return await this.VirtualCategoryBo.GetVirtualCategorys(apiReq);
    }

    public async GetVirtualCategoryImage(apiReq?: ApiRequest<VirtualCategoryFilters>): Promise<ApiResponse<VirtualCategoryAttributes[]>> {
        return await this.VirtualCategoryBo.GetVirtualCategoryImage(apiReq);
    }

    public async DeleteVirtualCategory(req: BaseRequest): Promise<Boolean> {
        return await this.VirtualCategoryBo.DeleteVirtualCategory(req);
    }
}
