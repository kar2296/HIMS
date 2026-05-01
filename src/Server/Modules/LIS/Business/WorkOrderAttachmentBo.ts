import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest } from '../../../Common/Index';
import { WorkOrderAttachmentInstance, WorkOrderAttachmentAttributes } from '../Model/Interface/Index';
import { WorkOrderAttachmentFilters } from '../Common/Filters.e';

export class WorkOrderAttachmentBo extends BaseBo<WorkOrderAttachmentInstance, WorkOrderAttachmentAttributes>  {
    public async AddWorkOrderAttachment(req: BaseRequest): Promise<number> {
        let file = this.Request.file;
        if (file) {
            req.Data.FilePath = file.path;
        }
        //Handling for json 'null' value while save user with file upload
        for (var idx in req.Data) {
            var strValue = req.Data[idx];
            if (strValue === 'null') {
                req.Data[idx] = null;
            }
        }
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateWorkOrderAttachment(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetWorkOrderAttachmentById(req: BaseRequest): Promise<WorkOrderAttachmentAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetWorkOrderAttachments(apiReq?: ApiRequest<WorkOrderAttachmentFilters>):
        Promise<ApiResponse<WorkOrderAttachmentAttributes[]>> {
        let where: WhereOptions<any>= {};
        let include: Array<IncludeOptions> = [];
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case WorkOrderAttachmentFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case WorkOrderAttachmentFilters.Name:
                        where['Name'] = param.Value;
                        break;
                    case WorkOrderAttachmentFilters.PatientId:
                        where['PatientId'] = param.Value;
                        break;
                    case WorkOrderAttachmentFilters.WorkOrderId:
                        where['WorkOrderId'] = param.Value;
                        break;
                    case WorkOrderAttachmentFilters.WorkOrderDetailId:
                        where['WorkOrderDetailId'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeleteWorkOrderAttachment(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<WorkOrderAttachmentInstance, WorkOrderAttachmentAttributes> {
        return this.Models.WorkOrderAttachment;
    }

}
