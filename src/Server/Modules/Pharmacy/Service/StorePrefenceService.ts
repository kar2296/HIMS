import { BaseService, BoFactory } from '../../Base/Index';
import { StorePreferenceBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { StorePreferenceAttributes } from '../Model/Interface/Index';
import { StorePreferenceFilters } from '../Common/Filters.e';

export class StorePreferenceService extends BaseService {
    private StorePreferenceBo: StorePreferenceBo;
    constructor(req?: Request) {
        super(req);
        this.StorePreferenceBo = BoFactory.GetBo(StorePreferenceBo, this.Request);
    }

    public async AddStorePreference(req: BaseRequest): Promise<number> {
        return await this.StorePreferenceBo.AddStorePreference(req);
    }

    public async UpdateStorePreference(req: BaseRequest): Promise<boolean> {
        return await this.StorePreferenceBo.UpdateStorePreference(req);
    }

    public async ManageStorePreferences(req: BaseRequest): Promise<boolean> {
        return await this.StorePreferenceBo.ManageStorePreferences(req);
    }

    public async GetStorePreferenceById(req: BaseRequest): Promise<StorePreferenceAttributes> {
        return await this.StorePreferenceBo.GetStorePreferenceById(req);
    }

    public async GetStorePreferences(apiReq?: ApiRequest<StorePreferenceFilters>)
        : Promise<ApiResponse<StorePreferenceAttributes[]>> {
        return await this.StorePreferenceBo.GetStorePreferences(apiReq);
    }

    public async OPCanCancelFromBillSettings(req: BaseRequest): Promise<boolean> {
        return await this.StorePreferenceBo.OPCanCancelFromBillSettings(req);
    }

    public async IPCanCancelFromBillSettings(req: BaseRequest): Promise<boolean> {
        return await this.StorePreferenceBo.IPCanCancelFromBillSettings(req);
    }

    public async ReceiptCancelFromBillSettings(req: BaseRequest): Promise<boolean> {
        return await this.StorePreferenceBo.ReceiptCancelFromBillSettings(req);
    }

    public async RefundCancelFromBillSettings(req: BaseRequest): Promise<boolean> {
        return await this.StorePreferenceBo.RefundCancelFromBillSettings(req);
    }

    public async DeleteStorePreference(req: BaseRequest): Promise<Boolean> {
        return await this.StorePreferenceBo.DeleteStorePreference(req);
    }
}
