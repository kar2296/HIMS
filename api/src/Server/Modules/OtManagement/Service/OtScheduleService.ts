import { BaseService, BoFactory } from '../../Base/Index';
import { OtScheduleBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { OtScheduleAttributes } from '../Model/Interface/Index';
import { OtScheduleFilters } from '../Common/Filters.e';

export class OtScheduleService extends BaseService {
    private OtScheduleBo: OtScheduleBo;
    constructor(req?: Request) {
        super(req);
        this.OtScheduleBo = BoFactory.GetBo(OtScheduleBo, this.Request);
    }

    public async AddOtSchedule(req: BaseRequest): Promise<number> {
        return await this.OtScheduleBo.AddOtSchedule(req);
    }

    public async UpdateOtSchedule(req: BaseRequest): Promise<boolean> {
        return await this.OtScheduleBo.UpdateOtSchedule(req);
    }

    public async GetOtScheduleById(req: BaseRequest): Promise<OtScheduleAttributes> {
        return await this.OtScheduleBo.GetOtScheduleById(req);
    }

    public async GetCathlabScheduleById(req: BaseRequest): Promise<OtScheduleAttributes> {
        return await this.OtScheduleBo.GetCathlabScheduleById(req);
    }

    public async GetOtSchedules(apiReq?: ApiRequest<OtScheduleFilters>): Promise<ApiResponse<OtScheduleAttributes[]>> {
        return await this.OtScheduleBo.GetOtSchedules(apiReq);
    }

    public async GetCathlabSchedule(apiReq?: ApiRequest<OtScheduleFilters>): Promise<ApiResponse<OtScheduleAttributes[]>> {
        return await this.OtScheduleBo.GetCathlabSchedule(apiReq);
    }

    public async DeleteOtSchedule(req: BaseRequest): Promise<Boolean> {
        return await this.OtScheduleBo.DeleteOtSchedule(req);
    }

    public async PrintOtSchedule(apiReq?: ApiRequest<OtScheduleFilters>): Promise<any> {
        return await this.OtScheduleBo.PrintOtSchedule(apiReq);
    }

    public async PrintOtSchedulereport(apiReq?: ApiRequest<OtScheduleFilters>): Promise<any> {
        return await this.OtScheduleBo.PrintOtSchedulereport(apiReq);
    }

}
