import { BaseService, BoFactory } from '../../Base/Index';
import { WorkOrderAttachmentBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { WorkOrderAttachmentAttributes } from '../Model/Interface/Index';
import { WorkOrderAttachmentFilters } from '../Common/Filters.e';

export class WorkOrderAttachmentService extends BaseService {
    private WorkOrderAttachmentBo: WorkOrderAttachmentBo;
    constructor(req?: Request) {
        super(req);
        this.WorkOrderAttachmentBo = BoFactory.GetBo(WorkOrderAttachmentBo, this.Request);
    }

    public async AddWorkOrderAttachment(req: BaseRequest): Promise<number> {
        return await this.WorkOrderAttachmentBo.AddWorkOrderAttachment(req);
    }

    public async UpdateWorkOrderAttachment(req: BaseRequest): Promise<boolean> {
        return await this.WorkOrderAttachmentBo.UpdateWorkOrderAttachment(req);
    }

    public async GetWorkOrderAttachmentById(req: BaseRequest): Promise<WorkOrderAttachmentAttributes> {
        return await this.WorkOrderAttachmentBo.GetWorkOrderAttachmentById(req);
    }

    public async GetWorkOrderAttachments(apiReq?: ApiRequest<WorkOrderAttachmentFilters>):
        Promise<ApiResponse<WorkOrderAttachmentAttributes[]>> {
        return await this.WorkOrderAttachmentBo.GetWorkOrderAttachments(apiReq);
    }

    public async DeleteWorkOrderAttachment(req: BaseRequest): Promise<Boolean> {
        return await this.WorkOrderAttachmentBo.DeleteWorkOrderAttachment(req);
    }
}
