import {BaseService, BoFactory } from '../../Base/Index';
import { AppointmentRequestBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { AppointmentRequestAttributes } from '../Model/Interface/Index';
import { AppointmentRequestFilters } from '../Common/Filters.e';

export class AppointmentRequestService extends BaseService {
    private AppointmentRequestBo: AppointmentRequestBo;
    constructor(req?: Request) {
        super(req);
        this.AppointmentRequestBo = BoFactory.GetBo(AppointmentRequestBo, this.Request);
    }

    public async AddAppointmentRequest(req: BaseRequest): Promise<number> {
        return await this.AppointmentRequestBo.AddAppointmentRequest(req);
    }

    public async UpdateAppointmentRequest(req: BaseRequest): Promise<boolean> {
        return await this.AppointmentRequestBo.UpdateAppointmentRequest(req);
    }

    public async ManageAppointmentRequest(req: BaseRequest): Promise<boolean> {
        return await this.AppointmentRequestBo.ManageAppointmentRequest(req);
    }

    public async GetAppointmentRequestById(req: BaseRequest): Promise<AppointmentRequestAttributes> {
        return await this.AppointmentRequestBo.GetAppointmentRequestById(req);
    }

    public async GetAppointmentRequests(apiReq?: ApiRequest<AppointmentRequestFilters>):
     Promise<ApiResponse<AppointmentRequestAttributes[]>> {
        return await this.AppointmentRequestBo.GetAppointmentRequests(apiReq);
    }

    public async DeleteAppointmentRequest(req: BaseRequest): Promise<Boolean> {
        return await this.AppointmentRequestBo.DeleteAppointmentRequest(req);
    }

    public async UpdateAppointmentRequestStatus(req: BaseRequest): Promise<boolean> {
        return await this.AppointmentRequestBo.UpdateAppointmentRequestStatus(req);
    }

    public async UpdateAppointmentId(req: BaseRequest): Promise<boolean> {
        return await this.AppointmentRequestBo.UpdateAppointmentId(req);
    }
}
