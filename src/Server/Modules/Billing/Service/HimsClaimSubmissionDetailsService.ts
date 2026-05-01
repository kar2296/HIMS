import { BaseService, BoFactory } from '../../Base/Index';
import { ClaimSubmissionDetailsBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { FileInfo, Request } from '../../../Core/Index';
import { ClaimSubmissionDetailsAttributes } from '../Model/Interface/Index';
import { ClaimSubmissionDetailsFilters } from '../Common/Filters.e';

export class ClaimSubmissionDetailsService extends BaseService {
    private ClaimSubmissionDetailsBo: ClaimSubmissionDetailsBo;
    constructor(req?: Request) {
        super(req);
        this.ClaimSubmissionDetailsBo = BoFactory.GetBo(ClaimSubmissionDetailsBo, this.Request);
    }

    public async AddClaimSubmissionDetails(req: BaseRequest): Promise<number> {
        return await this.ClaimSubmissionDetailsBo.AddClaimSubmissionDetails(req);
    }

    public async UpdateClaimSubmissionDetails(req: BaseRequest): Promise<boolean> {
        return await this.ClaimSubmissionDetailsBo.UpdateClaimSubmissionDetails(req);
    }

    public async GetClaimSubmissionDetailsById(req: BaseRequest): Promise<ClaimSubmissionDetailsAttributes> {
        return await this.ClaimSubmissionDetailsBo.GetClaimSubmissionDetailsById(req);
    }

    public async GetClaimSubmissionDetails(apiReq?: ApiRequest<ClaimSubmissionDetailsFilters>):
        Promise<ApiResponse<ClaimSubmissionDetailsAttributes[]>> {
        return await this.ClaimSubmissionDetailsBo.GetClaimSubmissionDetails(apiReq);
    }
    public async PrintGetClaimSubmission(req: BaseRequest): Promise<FileInfo> {
        return await this.ClaimSubmissionDetailsBo.PrintGetClaimSubmission(req);
    }
    public async DeleteClaimSubmissionDetails(req: BaseRequest): Promise<Boolean> {
        return await this.ClaimSubmissionDetailsBo.DeleteClaimSubmissionDetails(req);
    }
}
