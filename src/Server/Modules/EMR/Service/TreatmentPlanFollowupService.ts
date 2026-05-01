import { BaseService, BoFactory } from '../../Base/Index';
import { TreatmentPlanFollowupBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { TreatmentPlanFollowupAttributes } from '../Model/Interface/Index';
import { TreatmentPlanFollowupFilters } from '../Common/Filters.e';

export class TreatmentPlanFollowupService extends BaseService {
    private TreatmentPlanFollowupBo: TreatmentPlanFollowupBo;
    constructor(req?: Request) {
        super(req);
        this.TreatmentPlanFollowupBo = BoFactory.GetBo(TreatmentPlanFollowupBo, this.Request);
    }

    public async AddTreatmentPlanFollowup(req: BaseRequest): Promise<number> {
        return await this.TreatmentPlanFollowupBo.AddTreatmentPlanFollowup(req);
    }

    public async UpdateTreatmentPlanFollowup(req: BaseRequest): Promise<boolean> {
        return await this.TreatmentPlanFollowupBo.UpdateTreatmentPlanFollowup(req);
    }

    public async GetTreatmentPlanFollowupById(req: BaseRequest): Promise<TreatmentPlanFollowupAttributes> {
        return await this.TreatmentPlanFollowupBo.GetTreatmentPlanFollowupById(req);
    }

    public async ManageTreatmentPlanFollowups(req: BaseRequest): Promise<boolean> {
        return await this.TreatmentPlanFollowupBo.ManageTreatmentPlanFollowups(req);
    }

    public async GetTreatmentPlanFollowups(apiReq?: ApiRequest<TreatmentPlanFollowupFilters>):
        Promise<ApiResponse<TreatmentPlanFollowupAttributes[]>> {
        return await this.TreatmentPlanFollowupBo.GetTreatmentPlanFollowups(apiReq);
    }

    public async DeleteTreatmentPlanFollowup(req: BaseRequest): Promise<Boolean> {
        return await this.TreatmentPlanFollowupBo.DeleteTreatmentPlanFollowup(req);
    }
}
