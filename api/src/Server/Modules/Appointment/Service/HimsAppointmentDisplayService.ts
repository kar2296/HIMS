import { BaseService, BoFactory } from '../../Base/Index';
import { AppointmentDisplayBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common';
import { Request } from '../../../Core/Index';
import { AppointmentDisplayAttributes } from '../Model/Interface/Index';
import { AppointmentDisplayFilters } from '../Common/Filters.e';

export class AppointmentDisplayService extends BaseService {
    private AppointmentDisplayBo: AppointmentDisplayBo;
    constructor(req?: Request) {
        super(req);
        this.AppointmentDisplayBo = BoFactory.GetBo(AppointmentDisplayBo, this.Request);
    }

    public async AddAppointmentDisplay(req: BaseRequest): Promise<number> {
        return await this.AppointmentDisplayBo.AddAppointmentDisplay(req);
    }

    public async UpdateAppointmentDisplay(req: BaseRequest): Promise<boolean> {
        return await this.AppointmentDisplayBo.UpdateAppointmentDisplay(req);
    }

    public async GetAppointmentDisplayById(req: BaseRequest): Promise<AppointmentDisplayAttributes> {
        return await this.AppointmentDisplayBo.GetAppointmentDisplayById(req);
    }
    public async GetListofTokens(apiReq?: ApiRequest<AppointmentDisplayFilters>): Promise<number[]> {
        return await this.AppointmentDisplayBo.GetListofTokens(apiReq);
    }

    public async GetAppointmentDisplays(apiReq?: ApiRequest<AppointmentDisplayFilters>):
        Promise<ApiResponse<AppointmentDisplayAttributes[]>> {
        return await this.AppointmentDisplayBo.GetAppointmentDisplays(apiReq);
    }

    public async DeleteAppointmentDisplay(req: BaseRequest): Promise<Boolean> {
        return await this.AppointmentDisplayBo.DeleteAppointmentDisplay(req);
    }
}
