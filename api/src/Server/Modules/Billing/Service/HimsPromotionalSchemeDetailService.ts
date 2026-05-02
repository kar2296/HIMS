import { BaseService, BoFactory } from '../../Base/Index';
import { PromotionalSchemeDetailBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { PromotionalSchemeDetailAttributes } from '../Model/Interface/Index';
import { PromotionalSchemeDetailFilters } from '../Common/Filters.e';

export class PromotionalSchemeDetailService extends BaseService {
    private PromotionalSchemeDetailBo: PromotionalSchemeDetailBo;
    constructor(req?: Request) {
        super(req);
        this.PromotionalSchemeDetailBo = BoFactory.GetBo(PromotionalSchemeDetailBo, this.Request);
    }

    public async AddPromotionalSchemeDetail(req: BaseRequest): Promise<number> {
        return await this.PromotionalSchemeDetailBo.AddPromotionalSchemeDetail(req);
    }

    public async UpdatePromotionalSchemeDetail(req: BaseRequest): Promise<boolean> {
        return await this.PromotionalSchemeDetailBo.UpdatePromotionalSchemeDetail(req);
    }

    public async GetPromotionalSchemeDetailById(req: BaseRequest): Promise<PromotionalSchemeDetailAttributes> {
        return await this.PromotionalSchemeDetailBo.GetPromotionalSchemeDetailById(req);
    }

    public async GetPromotionalSchemeDetails(
        apiReq?: ApiRequest<PromotionalSchemeDetailFilters>): Promise<ApiResponse<PromotionalSchemeDetailAttributes[]>> {
        return await this.PromotionalSchemeDetailBo.GetPromotionalSchemeDetails(apiReq);
    }

    public async DeletePromotionalSchemeDetail(req: BaseRequest): Promise<Boolean> {
        return await this.PromotionalSchemeDetailBo.DeletePromotionalSchemeDetail(req);
    }
}
