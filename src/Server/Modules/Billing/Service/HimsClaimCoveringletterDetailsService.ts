import { BaseService, BoFactory } from '../../Base/Index';
import { ClaimCoveringletterDetailsBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { ClaimCoveringletterDetailsAttributes } from '../Model/Interface/Index';
import { ClaimCoveringletterDetailsFilters } from '../Common/Filters.e';

export class ClaimCoveringletterDetailsService extends BaseService {
    private ClaimCoveringletterDetailsBo: ClaimCoveringletterDetailsBo;
    constructor(req?: Request) {
        super(req);
        this.ClaimCoveringletterDetailsBo = BoFactory.GetBo(ClaimCoveringletterDetailsBo, this.Request);
    }

    public async AddClaimCoveringletterDetails(req: BaseRequest): Promise<number> {
        return await this.ClaimCoveringletterDetailsBo.AddClaimCoveringletterDetails(req);
    }

    public async UpdateClaimCoveringletterDetails(req: BaseRequest): Promise<boolean> {
        return await this.ClaimCoveringletterDetailsBo.UpdateClaimCoveringletterDetails(req);
    }

    public async GetClaimCoveringletterDetailsById(req: BaseRequest): Promise<ClaimCoveringletterDetailsAttributes> {
        return await this.ClaimCoveringletterDetailsBo.GetClaimCoveringletterDetailsById(req);
    }

    public async GetClaimCoveringletterDetails(apiReq?: ApiRequest<ClaimCoveringletterDetailsFilters>):
        Promise<ApiResponse<ClaimCoveringletterDetailsAttributes[]>> {
        return await this.ClaimCoveringletterDetailsBo.GetClaimCoveringletterDetails(apiReq);
    }
    public async DeleteClaimCoveringletterDetails(req: BaseRequest): Promise<Boolean> {
        return await this.ClaimCoveringletterDetailsBo.DeleteClaimCoveringletterDetails(req);
    }
}
