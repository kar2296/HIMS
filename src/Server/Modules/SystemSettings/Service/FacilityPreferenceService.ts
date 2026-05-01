import { BaseService, BoFactory } from '../../Base/Index';
import { FacilityPreferenceBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { FacilityPreferenceAttributes } from '../Model/Interface/Index';
import { FacilityPreferenceFilters } from '../Common/Filters.e';

export class FacilityPreferenceService extends BaseService {
    private FacilityPreferenceBo: FacilityPreferenceBo;
    constructor(req?: Request) {
        super(req);
        this.FacilityPreferenceBo = BoFactory.GetBo(FacilityPreferenceBo, this.Request);
    }

    public async AddFacilityPreference(req: BaseRequest): Promise<number> {
        return await this.FacilityPreferenceBo.AddFacilityPreference(req);
    }

    public async UpdateFacilityPreference(req: BaseRequest): Promise<boolean> {
        return await this.FacilityPreferenceBo.UpdateFacilityPreference(req);
    }

    public async ManageFacilityPreferences(req: BaseRequest): Promise<boolean> {
        return await this.FacilityPreferenceBo.ManageFacilityPreferences(req);
    }

    public async GetFacilityPreferenceById(req: BaseRequest): Promise<FacilityPreferenceAttributes> {
        return await this.FacilityPreferenceBo.GetFacilityPreferenceById(req);
    }

    public async GetFacilityPreferences(apiReq?: ApiRequest<FacilityPreferenceFilters>)
        : Promise<ApiResponse<FacilityPreferenceAttributes[]>> {
        return await this.FacilityPreferenceBo.GetFacilityPreferences(apiReq);
    }

    public async OPCanCancelFromBillSettings(req: BaseRequest): Promise<boolean> {
        return await this.FacilityPreferenceBo.OPCanCancelFromBillSettings(req);
    }

    public async IPCanCancelFromBillSettings(req: BaseRequest): Promise<boolean> {
        return await this.FacilityPreferenceBo.IPCanCancelFromBillSettings(req);
    }

    public async ReceiptCancelFromBillSettings(req: BaseRequest): Promise<boolean> {
        return await this.FacilityPreferenceBo.ReceiptCancelFromBillSettings(req);
    }

    public async RefundCancelFromBillSettings(req: BaseRequest): Promise<boolean> {
        return await this.FacilityPreferenceBo.RefundCancelFromBillSettings(req);
    }

    public async DeleteFacilityPreference(req: BaseRequest): Promise<Boolean> {
        return await this.FacilityPreferenceBo.DeleteFacilityPreference(req);
    }
}
