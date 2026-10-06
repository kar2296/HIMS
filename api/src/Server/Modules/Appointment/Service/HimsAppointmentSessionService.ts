import {BaseService, BoFactory} from '../../Base/Index';
import { AppointmentSessionBo} from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import {Request} from '../../../Core/Index';
import { AppointmentSessionAttributes} from '../Model/Interface/Index';
import { AppointmentSessionFilters } from '../Common/Filters.e';

export class AppointmentSessionService extends BaseService {
    private AppointmentSessionBo: AppointmentSessionBo;
    constructor(req?: Request) {
        super(req);
        this.AppointmentSessionBo = BoFactory.GetBo(AppointmentSessionBo, this.Request);
    }

    public async AddAppointmentSession(req: BaseRequest): Promise<number> {
        return await this.AppointmentSessionBo.AddAppointmentSession(req);
    }

    public async UpdateAppointmentSession(req: BaseRequest): Promise<boolean> {
        return await this.AppointmentSessionBo.UpdateAppointmentSession(req);
    }

    public async GetAppointmentSessionById(req: BaseRequest): Promise<AppointmentSessionAttributes> {
        return await this.AppointmentSessionBo.GetAppointmentSessionById(req);
    }

    public async GetAppointmentSessions(apiReq?: ApiRequest<AppointmentSessionFilters>):
     Promise<ApiResponse<AppointmentSessionAttributes[]>> {
        return await this.AppointmentSessionBo.GetAppointmentSessions(apiReq);
    }

    public async DeleteAppointmentSession(req: BaseRequest): Promise<Boolean> {
        return await this.AppointmentSessionBo.DeleteAppointmentSession(req);
    }
}
