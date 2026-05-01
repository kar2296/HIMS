import { BaseService, BoFactory } from '../../Base/Index';
import { ImmunizationScheduleBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { ImmunizationScheduleAttributes } from '../Model/Interface/Index';
import { ImmunizationScheduleFilters } from '../Common/Filters.e';

export class ImmunizationScheduleService extends BaseService {
    private ImmunizationScheduleBo: ImmunizationScheduleBo;
    constructor(req?: Request) {
        super(req);
        this.ImmunizationScheduleBo = BoFactory.GetBo(ImmunizationScheduleBo, this.Request);
    }

    public async AddImmunizationSchedule(req: BaseRequest): Promise<number> {
        return await this.ImmunizationScheduleBo.AddImmunizationSchedule(req);
    }

    public async UpdateImmunizationSchedule(req: BaseRequest): Promise<boolean> {
        return await this.ImmunizationScheduleBo.UpdateImmunizationSchedule(req);
    }

    public async GetImmunizationScheduleById(req: BaseRequest): Promise<ImmunizationScheduleAttributes> {
        return await this.ImmunizationScheduleBo.GetImmunizationScheduleById(req);
    }

    public async GetImmunizationSchedules(apiReq?: ApiRequest<ImmunizationScheduleFilters>)
        : Promise<ApiResponse<ImmunizationScheduleAttributes[]>> {
        return await this.ImmunizationScheduleBo.GetImmunizationSchedules(apiReq);
    }

    public async DeleteImmunizationSchedule(req: BaseRequest): Promise<Boolean> {
        return await this.ImmunizationScheduleBo.DeleteImmunizationSchedule(req);
    }
}
