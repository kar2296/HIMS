import * as SStatic from 'sequelize';
import { Op } from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { BaseRequest, ApiRequest, ApiResponse } from '../../../Common/Index';
import { TaskManagementInstance, TaskManagementAttributes } from '../Model/Interface/Index';
import { TaskManagementFilters } from '../Common/Filters.e';
export class TaskManagementBo extends BaseBo<TaskManagementInstance, TaskManagementAttributes> {
    public async AddTaskManagement(req: BaseRequest): Promise<number> {
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }
    public async UpdateTaskManagement(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data);
        return result;
    }
    public async GetMaxId(req: BaseRequest): Promise<number> {
        let MaxId = 0;
        let maxidInstance: any = await this.Find({
            attributes: [
                [this.Dal.fn('MAX', this.Dal.col('TaskManagementId')), 'TaskManagementId'],
            ],
            where: {
                Status: 1,
            }
        });
        if (maxidInstance) {
            let task: any = this.GetAttribute(maxidInstance);
            let lastTaskManagementId = task['TaskManagementId'];
            if (lastTaskManagementId) MaxId = lastTaskManagementId;
        }
        return ++MaxId;
    }
    public async GetTaskManagementById(req: BaseRequest): Promise<TaskManagementAttributes> {
        let include: Array<IncludeOptions> = [];
        let result = await this.GetById(req.Id, { include: include });
        return this.GetAttribute(result);
    }
    public async GetTaskManagements(apiReq?: ApiRequest<TaskManagementFilters>): Promise<ApiResponse<TaskManagementAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        include.push(this.GetReference('TaskType'));
        include.push(this.GetReference('Priority'));
        include.push(this.GetReference('TaskStatus'));
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName'], as: 'AssignedToUser', required: false,
            include: [this.GetReference('Title')]
        });
        include.push({
            model: this.Models.Patient,
            attributes: ['PatientId', 'FirstName', 'TitleId', 'LastName', 'MRN'],required: false,
            include: [this.GetReference('Title')]
        });
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName'], as: 'AssignedFromUser', required: false,
            include: [this.GetReference('Title')]
        });
        let order: Array<any> = [];
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case TaskManagementFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case TaskManagementFilters.TaskTypeId:
                        where['TaskTypeId'] = param.Value;
                        break;
                    case TaskManagementFilters.TaskStatusId:
                        where['TaskStatusId'] = param.Value;
                        break;
                    case TaskManagementFilters.PriorityId:
                        where['PriorityId'] = param.Value;
                        break;
                    case TaskManagementFilters.TaskNo:
                        where['TaskNo'] = { [Op.like]: '%' + (param.Value || '') + '%' };
                        break;
                    case TaskManagementFilters.TaskDate:
                        where['TaskDate'] = { [Op.between]: param.Value || '' };
                        break;
                    case TaskManagementFilters.From:
                        where['TaskDate'] = where['TaskDate'] || {};
                        (where['TaskDate'] as any)[Op.gte] = param.Value;
                        break;
                    case TaskManagementFilters.To:
                        where['TaskDate'] = where['TaskDate'] || {};
                        (where['TaskDate'] as any)[Op.lte] = param.Value;
                        break;
                    case TaskManagementFilters.AssignedFrom:
                        where['AssignedFrom'] = param.Value;
                        break;
                    case TaskManagementFilters.AssignedTo:
                        where['AssignedTo'] = param.Value;
                        break;
                    case TaskManagementFilters.PatientId:
                        where['PatientId'] = param.Value;
                        break;
                    case TaskManagementFilters.EncounterId:
                        where['EncounterId'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        order.push(['UpdatedAt', 'DESC']);
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes, order: order });
    }
    public async DeleteTaskManagement(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }
    public GetModel(): SStatic.Model<TaskManagementInstance, TaskManagementAttributes> {
        return this.Models.TaskManagement;
    }
}
