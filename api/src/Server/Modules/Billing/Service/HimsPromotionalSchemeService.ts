import { BaseService, BoFactory } from '../../Base/Index';
import { PromotionalSchemeBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { PromotionalSchemeAttributes } from '../Model/Interface/Index';
import { PromotionalSchemeFilters } from '../Common/Filters.e';

export class PromotionalSchemeService extends BaseService {
    private PromotionalSchemeBo: PromotionalSchemeBo;
    constructor(req?: Request) {
        super(req);
        this.PromotionalSchemeBo = BoFactory.GetBo(PromotionalSchemeBo, this.Request);
    }

    public async AddPromotionalScheme(req: BaseRequest): Promise<number> {
        return await this.PromotionalSchemeBo.AddPromotionalScheme(req);
    }

    public async UpdatePromotionalScheme(req: BaseRequest): Promise<boolean> {
        return await this.PromotionalSchemeBo.UpdatePromotionalScheme(req);
    }

    public async GetPromotionalSchemeById(req: BaseRequest): Promise<PromotionalSchemeAttributes> {
        return await this.PromotionalSchemeBo.GetPromotionalSchemeById(req);
    }

    public async GetPromotionalSchemes(apiReq?: ApiRequest<PromotionalSchemeFilters>):
        Promise<ApiResponse<PromotionalSchemeAttributes[]>> {
        return await this.PromotionalSchemeBo.GetPromotionalSchemes(apiReq);
    }

    public async GetPromotionalSchemesWithoutDetails(apiReq?: ApiRequest<PromotionalSchemeFilters>):
        Promise<ApiResponse<PromotionalSchemeAttributes[]>> {
        return await this.PromotionalSchemeBo.GetPromotionalSchemesWithoutDetails(apiReq);
    }

    public async DeletePromotionalScheme(req: BaseRequest): Promise<Boolean> {
        return await this.PromotionalSchemeBo.DeletePromotionalScheme(req);
    }
}
