import * as SStatic  from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest } from '../../../Common/Index';
import { WorkOrderObservationInstance, WorkOrderObservationAttributes } from '../Model/Interface/Index';
import { WorkOrderObservationFilters } from '../Common/Filters.e';

export class WorkOrderObservationBo extends BaseBo<WorkOrderObservationInstance, WorkOrderObservationAttributes>  {
    public async AddWorkOrderObservation(req: BaseRequest): Promise<number> {
        req.Data.ObservationDate = new Date();
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateWorkOrderObservation(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetWorkOrderObservationById(req: BaseRequest): Promise<WorkOrderObservationAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetWorkOrderObservations(apiReq?: ApiRequest<WorkOrderObservationFilters>):
     Promise<ApiResponse<WorkOrderObservationAttributes[]>> {
        let where: WhereOptions<any>= {};
        let include: Array<IncludeOptions> = [];
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case WorkOrderObservationFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case WorkOrderObservationFilters.PatientId:
                        where['PatientId'] = param.Value;
                        break;
                    case WorkOrderObservationFilters.WorkOrderId:
                        where['WorkOrderId'] = param.Value;
                        break;
                    case WorkOrderObservationFilters.WorkOrderDetailId:
                        where['WorkOrderDetailId'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeleteWorkOrderObservation(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<WorkOrderObservationInstance, WorkOrderObservationAttributes> {
        return this.Models.WorkOrderObservation;
    }

}
