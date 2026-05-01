import { BaseService, BoFactory } from '../../Base/Index';
import { ClaimCoveringletterBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request, FileInfo } from '../../../Core/Index';
import { ClaimCoveringletterAttributes } from '../Model/Interface/Index';
import { ClaimCoveringletterFilters } from '../Common/Filters.e';

export class ClaimCoveringletterService extends BaseService {
    private ClaimCoveringletterBo: ClaimCoveringletterBo;
    constructor(req?: Request) {
        super(req);
        this.ClaimCoveringletterBo = BoFactory.GetBo(ClaimCoveringletterBo, this.Request);
    }

    public async AddClaimCoveringletter(req: BaseRequest): Promise<number> {
        return await this.ClaimCoveringletterBo.AddClaimCoveringletter(req);
    }

    public async UpdateClaimCoveringletter(req: BaseRequest): Promise<boolean> {
        return await this.ClaimCoveringletterBo.UpdateClaimCoveringletter(req);
    }

    public async GetClaimCoveringletterById(req: BaseRequest): Promise<ClaimCoveringletterAttributes> {
        return await this.ClaimCoveringletterBo.GetClaimCoveringletterById(req);
    }

    public async GetClaimCoveringletters(apiReq?: ApiRequest<ClaimCoveringletterFilters>):
        Promise<ApiResponse<ClaimCoveringletterAttributes[]>> {
        return await this.ClaimCoveringletterBo.GetClaimCoveringletters(apiReq);
    }
    public async DeleteClaimCoveringletter(req: BaseRequest): Promise<Boolean> {
        return await this.ClaimCoveringletterBo.DeleteClaimCoveringletter(req);
    }
    public async PrintClaimCoveringletter(req: BaseRequest): Promise<FileInfo> {
        return await this.ClaimCoveringletterBo.PrintClaimCoveringletter(req);
    }
}
