import { BaseService, BoFactory } from '../../Base/Index';
import { TaskManagementBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { TaskManagementAttributes } from '../Model/Interface/Index';
import { TaskManagementFilters } from '../Common/Filters.e';

export class TaskManagementService extends BaseService {
    private TaskManagementBo: TaskManagementBo;
    constructor(req?: Request) {
        super(req);
        this.TaskManagementBo = BoFactory.GetBo(TaskManagementBo, this.Request);
    }

    public async AddTaskManagement(req: BaseRequest): Promise<number> {
        return await this.TaskManagementBo.AddTaskManagement(req);
    }

    public async UpdateTaskManagement(req: BaseRequest): Promise<boolean> {
        return await this.TaskManagementBo.UpdateTaskManagement(req);
    }

    public async GetMaxId(req: BaseRequest): Promise<number> {
        return await this.TaskManagementBo.GetMaxId(req);
    }

    public async GetTaskManagementById(req: BaseRequest): Promise<TaskManagementAttributes> {
        return await this.TaskManagementBo.GetTaskManagementById(req);
    }

    public async GetTaskManagements(apiReq?: ApiRequest<TaskManagementFilters>): Promise<ApiResponse<TaskManagementAttributes[]>> {
        return await this.TaskManagementBo.GetTaskManagements(apiReq);
    }

    public async DeleteTaskManagement(req: BaseRequest): Promise<Boolean> {
        return await this.TaskManagementBo.DeleteTaskManagement(req);
    }
}
