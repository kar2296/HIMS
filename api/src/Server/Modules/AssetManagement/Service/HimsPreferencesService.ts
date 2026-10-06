import {BaseService, BoFactory } from '../../Base/Index';
import { PreferencesBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { PreferencesAttributes } from '../Model/Interface/Index';
import { PreferencesFilters } from '../Common/Filters.e';

export class PreferencesService extends BaseService {
    private PreferencesBo: PreferencesBo;
    constructor(req?: Request) {
        super(req);
        this.PreferencesBo = BoFactory.GetBo(PreferencesBo, this.Request);
    }

    public async AddPreferences(req: BaseRequest): Promise<number> {
        return await this.PreferencesBo.AddPreferences(req);
    }

    public async UpdatePreferences(req: BaseRequest): Promise<boolean> {
        return await this.PreferencesBo.UpdatePreferences(req);
    }

    public async GetPreferencesById(req: BaseRequest): Promise<PreferencesAttributes> {
        return await this.PreferencesBo.GetPreferencesById(req);
    }

    public async GetPreferencess(apiReq?: ApiRequest<PreferencesFilters>): Promise<ApiResponse<PreferencesAttributes[]>> {
        return await this.PreferencesBo.GetPreferencess(apiReq);
    }

    public async DeletePreferences(req: BaseRequest): Promise<Boolean> {
        return await this.PreferencesBo.DeletePreferences(req);
    }
}

