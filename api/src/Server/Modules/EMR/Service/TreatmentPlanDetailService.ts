import { BaseService, BoFactory } from '../../Base/Index';
import { TreatmentPlanDetailBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { TreatmentPlanDetailAttributes } from '../Model/Interface/Index';
import { TreatmentPlanDetailFilters } from '../Common/Filters.e';

export class TreatmentPlanDetailService extends BaseService {
    private TreatmentPlanDetailBo: TreatmentPlanDetailBo;
    constructor(req?: Request) {
        super(req);
        this.TreatmentPlanDetailBo = BoFactory.GetBo(TreatmentPlanDetailBo, this.Request);
    }

    public async AddTreatmentPlanDetail(req: BaseRequest): Promise<number> {
        return await this.TreatmentPlanDetailBo.AddTreatmentPlanDetail(req);
    }

    public async UpdateTreatmentPlanDetail(req: BaseRequest): Promise<boolean> {
        return await this.TreatmentPlanDetailBo.UpdateTreatmentPlanDetail(req);
    }

    public async UpdateTreatmentPlanBills(req: BaseRequest): Promise<boolean> {
        return await this.TreatmentPlanDetailBo.UpdateTreatmentPlanBills(req);
    }

    public async UpdateTreatmentPlanBillDetail(req: BaseRequest): Promise<boolean> {
        return await this.TreatmentPlanDetailBo.UpdateTreatmentPlanBillDetail(req);
    }

    public async GetTreatmentPlanDetailById(req: BaseRequest): Promise<TreatmentPlanDetailAttributes> {
        return await this.TreatmentPlanDetailBo.GetTreatmentPlanDetailById(req);
    }

    public async GetTreatmentPlanDetails(apiReq?: ApiRequest<TreatmentPlanDetailFilters>):
        Promise<ApiResponse<TreatmentPlanDetailAttributes[]>> {
        return await this.TreatmentPlanDetailBo.GetTreatmentPlanDetails(apiReq);
    }

    public async DeleteTreatmentPlanDetail(req: BaseRequest): Promise<Boolean> {
        return await this.TreatmentPlanDetailBo.DeleteTreatmentPlanDetail(req);
    }
}
