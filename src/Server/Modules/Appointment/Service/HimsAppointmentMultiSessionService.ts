import {BaseService, BoFactory} from '../../Base/Index';
import { AppointmentMultiSessionBo} from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common';
import {Request} from '../../../Core/Index';
import { AppointmentMultiSessionAttributes} from '../Model/Interface/Index';
import { AppointmentMultiSessionFilters } from '../Common/Filters.e';

export class AppointmentMultiSessionService extends BaseService {
    private AppointmentMultiSessionBo: AppointmentMultiSessionBo;
    constructor(req?: Request) {
        super(req);
        this.AppointmentMultiSessionBo = BoFactory.GetBo(AppointmentMultiSessionBo, this.Request);
    }

    public async AddAppointmentMultiSession(req: BaseRequest): Promise<number> {
        return await this.AppointmentMultiSessionBo.AddAppointmentMultiSession(req);
    }

    public async UpdateAppointmentMultiSession(req: BaseRequest): Promise<boolean> {
        return await this.AppointmentMultiSessionBo.UpdateAppointmentMultiSession(req);
    }

    public async GetAppointmentMultiSessionById(req: BaseRequest): Promise<AppointmentMultiSessionAttributes> {
        return await this.AppointmentMultiSessionBo.GetAppointmentMultiSessionById(req);
    }

    public async GetAppointmentMultiSessions(apiReq?: ApiRequest<AppointmentMultiSessionFilters>):
     Promise<ApiResponse<AppointmentMultiSessionAttributes[]>> {
        return await this.AppointmentMultiSessionBo.GetAppointmentMultiSessions(apiReq);
    }

    public async DeleteAppointmentMultiSession(req: BaseRequest): Promise<Boolean> {
        return await this.AppointmentMultiSessionBo.DeleteAppointmentMultiSession(req);
    }
}
