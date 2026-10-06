import {BaseService, BoFactory } from '../../Base/Index';
import { WorkOrderSampleDetailBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { WorkOrderSampleDetailAttributes } from '../Model/Interface/Index';
import { WorkOrderSampleDetailFilters } from '../Common/Filters.e';

export class WorkOrderSampleDetailService extends BaseService {
    private WorkOrderSampleDetailBo: WorkOrderSampleDetailBo;
    constructor(req?: Request) {
        super(req);
        this.WorkOrderSampleDetailBo = BoFactory.GetBo(WorkOrderSampleDetailBo, this.Request);
    }

    public async AddWorkOrderSampleDetail(req: BaseRequest): Promise<number> {
        return await this.WorkOrderSampleDetailBo.AddWorkOrderSampleDetail(req);
    }

    public async UpdateWorkOrderSampleDetail(req: BaseRequest): Promise<boolean> {
        return await this.WorkOrderSampleDetailBo.UpdateWorkOrderSampleDetail(req);
    }

    public async GetWorkOrderSampleDetailById(req: BaseRequest): Promise<WorkOrderSampleDetailAttributes> {
        return await this.WorkOrderSampleDetailBo.GetWorkOrderSampleDetailById(req);
    }

    public async GetWorkOrderSampleDetails(apiReq?: ApiRequest<WorkOrderSampleDetailFilters>):
     Promise<ApiResponse<WorkOrderSampleDetailAttributes[]>> {
        return await this.WorkOrderSampleDetailBo.GetWorkOrderSampleDetails(apiReq);
    }

    public async DeleteWorkOrderSampleDetail(req: BaseRequest): Promise<Boolean> {
        return await this.WorkOrderSampleDetailBo.DeleteWorkOrderSampleDetail(req);
    }
}
