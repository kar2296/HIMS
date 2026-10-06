import { BaseService, BoFactory } from '../../Base/Index';
import { OtScheduleDetailsBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { OtScheduleDetailsAttributes } from '../Model/Interface/Index';
import { OtScheduleDetailsFilters } from '../Common/Filters.e';

export class OtScheduleDetailsService extends BaseService {
    private OtScheduleDetailsBo: OtScheduleDetailsBo;
    constructor(req?: Request) {
        super(req);
        this.OtScheduleDetailsBo = BoFactory.GetBo(OtScheduleDetailsBo, this.Request);
    }

    public async AddOtScheduleDetails(req: BaseRequest): Promise<number> {
        return await this.OtScheduleDetailsBo.AddOtScheduleDetails(req);
    }

    public async UpdateOtScheduleDetails(req: BaseRequest): Promise<boolean> {
        return await this.OtScheduleDetailsBo.UpdateOtScheduleDetails(req);
    }

    public async GetOtScheduleDetailsById(req: BaseRequest): Promise<OtScheduleDetailsAttributes> {
        return await this.OtScheduleDetailsBo.GetOtScheduleDetailsById(req);
    }

    public async GetOtScheduleDetails(apiReq?: ApiRequest<OtScheduleDetailsFilters>): Promise<ApiResponse<OtScheduleDetailsAttributes[]>> {
        return await this.OtScheduleDetailsBo.GetOtScheduleDetails(apiReq);
    }

    // public async DeleteOtScheduleDetails(req: BaseRequest): Promise<Boolean> {
    //     return await this.OtScheduleDetailsBo.DeleteOtScheduleDetails(req);
    // }

    // public async PrintOtScheduleDetails(apiReq?: ApiRequest<OtScheduleDetailsFilters>): Promise<any> {
    //     return await this.OtScheduleDetailsBo.PrintOtScheduleDetails(apiReq);
    // }

    // public async PrintOtScheduleDetailsreport(apiReq?: ApiRequest<OtScheduleDetailsFilters>): Promise<any> {
    //     return await this.OtScheduleDetailsBo.PrintOtScheduleDetailsreport(apiReq);
    // }

}
