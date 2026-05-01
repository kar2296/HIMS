import { BaseService, BoFactory } from '../../Base/Index';
import { ClaimSubmissionBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { FileInfo, Request } from '../../../Core/Index';
import { ClaimSubmissionAttributes } from '../Model/Interface/Index';
import { ClaimSubmissionFilters } from '../Common/Filters.e';


export class ClaimSubmissionService extends BaseService {
    private ClaimSubmissionBo: ClaimSubmissionBo;
    constructor(req?: Request) {
        super(req);
        this.ClaimSubmissionBo = BoFactory.GetBo(ClaimSubmissionBo, this.Request);
    }

    public async AddClaimSubmission(req: BaseRequest): Promise<number> {
        return await this.ClaimSubmissionBo.AddClaimSubmission(req);
    }

    public async UpdateClaimSubmission(req: BaseRequest): Promise<boolean> {
        return await this.ClaimSubmissionBo.UpdateClaimSubmission(req);
    }

    public async GetClaimSubmissionById(req: BaseRequest): Promise<ClaimSubmissionAttributes> {
        return await this.ClaimSubmissionBo.GetClaimSubmissionById(req);
    }

    public async GetClaimSubmissions(apiReq?: ApiRequest<ClaimSubmissionFilters>):
        Promise<ApiResponse<ClaimSubmissionAttributes[]>> {
        return await this.ClaimSubmissionBo.GetClaimSubmissions(apiReq);
    }
    public async PrintClaimSubmission(req: BaseRequest): Promise<FileInfo> {
        return await this.ClaimSubmissionBo.PrintClaimSubmission(req);
    }

    public async DeleteClaimSubmission(req: BaseRequest): Promise<Boolean> {
        return await this.ClaimSubmissionBo.DeleteClaimSubmission(req);
    }
}
