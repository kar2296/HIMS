import { BaseService, BoFactory } from '../../Base/Index';
import { ReferralFeedbackBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request, FileInfo } from '../../../Core/Index';
import { ReferralFeedbackAttributes } from '../Model/Interface/Index';
import { ReferralFeedbackFilters } from '../Common/Filters.e';

export class ReferralFeedbackService extends BaseService {
    private ReferralFeedbackBo: ReferralFeedbackBo;
    constructor(req?: Request) {
        super(req);
        this.ReferralFeedbackBo = BoFactory.GetBo(ReferralFeedbackBo, this.Request);
    }

    public async AddReferralFeedback(req: BaseRequest): Promise<number> {
        return await this.ReferralFeedbackBo.AddReferralFeedback(req);
    }

    public async UpdateReferralFeedback(req: BaseRequest): Promise<boolean> {
        return await this.ReferralFeedbackBo.UpdateReferralFeedback(req);
    }

    public async GetReferralFeedbackById(req: BaseRequest): Promise<ReferralFeedbackAttributes> {
        return await this.ReferralFeedbackBo.GetReferralFeedbackById(req);
    }

    public async GetReferralFeedbacks(apiReq?: ApiRequest<ReferralFeedbackFilters>):
        Promise<ApiResponse<ReferralFeedbackAttributes[]>> {
        return await this.ReferralFeedbackBo.GetReferralFeedbacks(apiReq);
    }

    public async DeleteReferralFeedback(req: BaseRequest): Promise<Boolean> {
        return await this.ReferralFeedbackBo.DeleteReferralFeedback(req);
    }
    public async PrintReferralFeedback(req: BaseRequest): Promise<FileInfo> {
        return await this.ReferralFeedbackBo.PrintReferralFeedback(req);
    }
}
