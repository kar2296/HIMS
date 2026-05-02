import {BaseService, BoFactory } from '../../Base/Index';
import { WorkOrderObservationBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { WorkOrderObservationAttributes } from '../Model/Interface/Index';
import { WorkOrderObservationFilters } from '../Common/Filters.e';

export class WorkOrderObservationService extends BaseService {
    private WorkOrderObservationBo: WorkOrderObservationBo;
    constructor(req?: Request) {
        super(req);
        this.WorkOrderObservationBo = BoFactory.GetBo(WorkOrderObservationBo, this.Request);
    }

    public async AddWorkOrderObservation(req: BaseRequest): Promise<number> {
        return await this.WorkOrderObservationBo.AddWorkOrderObservation(req);
    }

    public async UpdateWorkOrderObservation(req: BaseRequest): Promise<boolean> {
        return await this.WorkOrderObservationBo.UpdateWorkOrderObservation(req);
    }

    public async GetWorkOrderObservationById(req: BaseRequest): Promise<WorkOrderObservationAttributes> {
        return await this.WorkOrderObservationBo.GetWorkOrderObservationById(req);
    }

    public async GetWorkOrderObservations(apiReq?: ApiRequest<WorkOrderObservationFilters>):
     Promise<ApiResponse<WorkOrderObservationAttributes[]>> {
        return await this.WorkOrderObservationBo.GetWorkOrderObservations(apiReq);
    }

    public async DeleteWorkOrderObservation(req: BaseRequest): Promise<Boolean> {
        return await this.WorkOrderObservationBo.DeleteWorkOrderObservation(req);
    }
}
