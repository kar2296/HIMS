import { BaseService, BoFactory } from '../../Base/Index';
import { WorkOrderSampleBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { WorkOrderSampleAttributes } from '../Model/Interface/Index';
import { WorkOrderSampleFilters } from '../Common/Filters.e';

export class WorkOrderSampleService extends BaseService {
    private WorkOrderSampleBo: WorkOrderSampleBo;
    constructor(req?: Request) {
        super(req);
        this.WorkOrderSampleBo = BoFactory.GetBo(WorkOrderSampleBo, this.Request);
    }

    public async AddWorkOrderSample(req: BaseRequest): Promise<number> {
        return await this.WorkOrderSampleBo.AddWorkOrderSample(req);
    }

    public async UpdateWorkOrderSample(req: BaseRequest): Promise<boolean> {
        return await this.WorkOrderSampleBo.UpdateWorkOrderSample(req);
    }

    public async GetWorkOrderSampleById(req: BaseRequest): Promise<WorkOrderSampleAttributes> {
        return await this.WorkOrderSampleBo.GetWorkOrderSampleById(req);
    }

    public async GetWorkOrderSamples(apiReq?: ApiRequest<WorkOrderSampleFilters>): Promise<ApiResponse<WorkOrderSampleAttributes[]>> {
        return await this.WorkOrderSampleBo.GetWorkOrderSamples(apiReq);
    }

    public async ManageWorkOrderSample(req: BaseRequest): Promise<Boolean> {
        return await this.WorkOrderSampleBo.ManageWorkOrderSample(req);
    }

    public async ManageWorkOrderSampleByType(req: BaseRequest): Promise<Boolean> {
        return await this.WorkOrderSampleBo.ManageWorkOrderSampleByType(req);
    }

    public async ManageWorkOrderReviewSample(req: BaseRequest): Promise<Boolean> {
        return await this.WorkOrderSampleBo.ManageWorkOrderReviewSample(req);
    }

    public async DeleteWorkOrderSample(req: BaseRequest): Promise<Boolean> {
        return await this.WorkOrderSampleBo.DeleteWorkOrderSample(req);
    }
}
