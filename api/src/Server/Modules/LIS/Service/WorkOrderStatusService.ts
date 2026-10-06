import {BaseService, BoFactory } from '../../Base/Index';
import { WorkOrderStatusBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ISearchEnums, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { WorkOrderStatusAttributes } from '../Model/Interface/Index';

export class WorkOrderStatusService extends BaseService {
    private WorkOrderStatusBo: WorkOrderStatusBo;
    constructor(req?: Request) {
        super(req);
        this.WorkOrderStatusBo = BoFactory.GetBo(WorkOrderStatusBo, this.Request);
    }

    public async AddWorkOrderStatus(req: BaseRequest): Promise<number> {
        return await this.WorkOrderStatusBo.AddWorkOrderStatus(req);
    }

    public async UpdateWorkOrderStatus(req: BaseRequest): Promise<boolean> {
        return await this.WorkOrderStatusBo.UpdateWorkOrderStatus(req);
    }

    public async GetWorkOrderStatusById(req: BaseRequest): Promise<WorkOrderStatusAttributes> {
        return await this.WorkOrderStatusBo.GetWorkOrderStatusById(req);
    }

    public async GetWorkOrderStatuss(apiReq?: ApiRequest<ISearchEnums>): Promise<ApiResponse<WorkOrderStatusAttributes[]>> {
        return await this.WorkOrderStatusBo.GetWorkOrderStatuss(apiReq);
    }

    public async DeleteWorkOrderStatus(req: BaseRequest): Promise<Boolean> {
        return await this.WorkOrderStatusBo.DeleteWorkOrderStatus(req);
    }
}
