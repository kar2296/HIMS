import { BaseService, BoFactory } from '../../Base/Index';
import { TreatmentPlanBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request/*, FileInfo */ } from '../../../Core/Index';
import { TreatmentPlanAttributes } from '../Model/Interface/Index';
import { TreatmentPlanFilters } from '../Common/Filters.e';

export class TreatmentPlanService extends BaseService {
    private TreatmentPlanBo: TreatmentPlanBo;
    constructor(req?: Request) {
        super(req);
        this.TreatmentPlanBo = BoFactory.GetBo(TreatmentPlanBo, this.Request);
    }

    public async AddTreatmentPlan(req: BaseRequest): Promise<number> {
        return await this.TreatmentPlanBo.AddTreatmentPlan(req);
    }

    public async UpdateTreatmentPlan(req: BaseRequest): Promise<boolean> {
        return await this.TreatmentPlanBo.UpdateTreatmentPlan(req);
    }

    public async UpdateTreatmentPlanBillInfo(req: BaseRequest): Promise<boolean> {
        return await this.TreatmentPlanBo.UpdateTreatmentPlanBillInfo(req);
    }

    public async GetTreatmentPlanById(req: BaseRequest): Promise<TreatmentPlanAttributes> {
        return await this.TreatmentPlanBo.GetTreatmentPlanById(req);
    }

    public async GetTreatmentPlans(apiReq?: ApiRequest<TreatmentPlanFilters>):
        Promise<ApiResponse<TreatmentPlanAttributes[]>> {
        return await this.TreatmentPlanBo.GetTreatmentPlans(apiReq);
    }

    public async DeleteTreatmentPlan(req: BaseRequest): Promise<Boolean> {
        return await this.TreatmentPlanBo.DeleteTreatmentPlan(req);
    }

}
