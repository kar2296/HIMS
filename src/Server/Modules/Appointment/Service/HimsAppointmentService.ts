import { BaseService, BoFactory } from '../../Base/Index';
import { AppointmentBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common';
import { Request, FileInfo } from '../../../Core/Index';
import { AppointmentAttributes } from '../Model/Interface/Index';
import { AppointmentFilters } from '../Common/Filters.e';

export class AppointmentService extends BaseService {
    private AppointmentBo: AppointmentBo;
    constructor(req?: Request) {
        super(req);
        this.AppointmentBo = BoFactory.GetBo(AppointmentBo, this.Request);
    }

    public async AddAppointment(req: BaseRequest): Promise<number> {
        return await this.AppointmentBo.AddAppointment(req);
    }

    public async UpdateAppointment(req: BaseRequest): Promise<boolean> {
        return await this.AppointmentBo.UpdateAppointment(req);
    }

    public async UpdateAppAppointment(req: BaseRequest): Promise<boolean> {
        return await this.AppointmentBo.UpdateAppAppointment(req);
    }

    public async AddAppointmentFromSession(req: BaseRequest): Promise<number> {
        return await this.AppointmentBo.AddAppointmentFromSession(req);
    }

    public async GetAppointmentById(req: BaseRequest): Promise<AppointmentAttributes> {
        return await this.AppointmentBo.GetAppointmentById(req);
    }

    public async GetAppointments(apiReq?: ApiRequest<AppointmentFilters>): Promise<ApiResponse<AppointmentAttributes[]>> {
        return await this.AppointmentBo.GetAppointments(apiReq);
    }

    public async GetDashboardAppointments(apiReq?: ApiRequest<AppointmentFilters>): Promise<ApiResponse<AppointmentAttributes[]>> {
        return await this.AppointmentBo.GetDashboardAppointments(apiReq);
    }

    public async GetAppointmentswithoutDetail(apiReq?: ApiRequest<AppointmentFilters>): Promise<ApiResponse<AppointmentAttributes[]>> {
        return await this.AppointmentBo.GetAppointmentswithoutDetail(apiReq);
    }

    public async GetAppointmentWithFileLocation(apiReq?: ApiRequest<AppointmentFilters>):
        Promise<ApiResponse<AppointmentAttributes[]>> {
        return await this.AppointmentBo.GetAppointmentWithFileLocation(apiReq);
    }

    public async DeleteAppointment(req: BaseRequest): Promise<Boolean> {
        return await this.AppointmentBo.DeleteAppointment(req);
    }
    public async PrintAppointment(req: BaseRequest): Promise<FileInfo> {
        return await this.AppointmentBo.PrintAppointment(req);
    }
    public async PrintAppointmentScheduleReport(apiReq?: ApiRequest<AppointmentFilters>): Promise<any> {
        return await this.AppointmentBo.PrintAppointmentScheduleReport(apiReq);
    }
    public async PrintAppointmentCancelledReport(apiReq?: ApiRequest<AppointmentFilters>): Promise<any> {
        return await this.AppointmentBo.PrintAppointmentCancelledReport(apiReq);
    }
    public async PrintAppointmentReScheduleReport(apiReq?: ApiRequest<AppointmentFilters>): Promise<any> {
        return await this.AppointmentBo.PrintAppointmentReScheduleReport(apiReq);
    }
    public async PrintAppointmentPatientfromAppReport(apiReq?: ApiRequest<AppointmentFilters>): Promise<any> {
        return await this.AppointmentBo.PrintAppointmentPatientfromAppReport(apiReq);
    }
    public async PrintVideoConsultationPatientList(apiReq?: ApiRequest<AppointmentFilters>): Promise<any> {
        return await this.AppointmentBo.PrintVideoConsultationPatientList(apiReq);
    }
}
