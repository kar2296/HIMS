import {BaseService, BoFactory } from '../../Base/Index';
import { FacilitySettingBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { FacilitySettingAttributes } from '../Model/Interface/Index';
import { FacilitySettingFilters } from '../Common/Filters.e';

export class FacilitySettingService extends BaseService {
    private FacilitySettingBo: FacilitySettingBo;
    constructor(req?: Request) {
        super(req);
        this.FacilitySettingBo = BoFactory.GetBo(FacilitySettingBo, this.Request);
    }

    public async AddFacilitySetting(req: BaseRequest): Promise<number> {
        return await this.FacilitySettingBo.AddFacilitySetting(req);
    }

    public async UpdateFacilitySetting(req: BaseRequest): Promise<boolean> {
        return await this.FacilitySettingBo.UpdateFacilitySetting(req);
    }

    public async GetFacilitySettingById(req: BaseRequest): Promise<FacilitySettingAttributes> {
        return await this.FacilitySettingBo.GetFacilitySettingById(req);
    }

    public async GetFacilitySettings(apiReq?: ApiRequest<FacilitySettingFilters>): Promise<ApiResponse<FacilitySettingAttributes[]>> {
        return await this.FacilitySettingBo.GetFacilitySettings(apiReq);
    }

    public async DeleteFacilitySetting(req: BaseRequest): Promise<Boolean> {
        return await this.FacilitySettingBo.DeleteFacilitySetting(req);
    }
}
