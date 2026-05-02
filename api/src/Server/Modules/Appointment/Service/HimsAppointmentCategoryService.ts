import {BaseService, BoFactory} from '../../Base/Index';
import { AppointmentCategoryBo} from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common';
import {Request} from '../../../Core/Index';
import { AppointmentCategoryAttributes} from '../Model/Interface/Index';
import { AppointmentCategoryFilters } from '../Common/Filters.e';

export class AppointmentCategoryService extends BaseService {
    private AppointmentCategoryBo: AppointmentCategoryBo;
    constructor(req?: Request) {
        super(req);
        this.AppointmentCategoryBo = BoFactory.GetBo(AppointmentCategoryBo, this.Request);
    }

    public async AddAppointmentCategory(req: BaseRequest): Promise<number> {
        return await this.AppointmentCategoryBo.AddAppointmentCategory(req);
    }

    public async UpdateAppointmentCategory(req: BaseRequest): Promise<boolean> {
        return await this.AppointmentCategoryBo.UpdateAppointmentCategory(req);
    }

    public async GetAppointmentCategoryById(req: BaseRequest): Promise<AppointmentCategoryAttributes> {
        return await this.AppointmentCategoryBo.GetAppointmentCategoryById(req);
    }

    public async GetAppointmentCategorys(apiReq?: ApiRequest<AppointmentCategoryFilters>):
     Promise<ApiResponse<AppointmentCategoryAttributes[]>> {
        return await this.AppointmentCategoryBo.GetAppointmentCategorys(apiReq);
    }

    public async DeleteAppointmentCategory(req: BaseRequest): Promise<Boolean> {
        return await this.AppointmentCategoryBo.DeleteAppointmentCategory(req);
    }
}
