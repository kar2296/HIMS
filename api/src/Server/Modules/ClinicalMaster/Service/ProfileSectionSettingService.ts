import { BaseService, BoFactory } from '../../Base/Index';
import { ProfileSectionSettingBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { ProfileSectionSettingAttributes } from '../Model/Interface/Index';
import { ProfileSectionSettingFilters } from '../Common/Filters.e';

export class ProfileSectionSettingService extends BaseService {
    private ProfileSectionSettingBo: ProfileSectionSettingBo;
    constructor(req?: Request) {
        super(req);
        this.ProfileSectionSettingBo = BoFactory.GetBo(ProfileSectionSettingBo, this.Request);
    }

    public async GetProfileSectionSettings(apiReq?: ApiRequest<ProfileSectionSettingFilters>): Promise<ApiResponse<ProfileSectionSettingAttributes[]>> {
        return await this.ProfileSectionSettingBo.GetProfileSectionSettings(apiReq);
    }

    public async ManageProfileSectionSettings(req: BaseRequest): Promise<boolean> {
        return await this.ProfileSectionSettingBo.ManageProfileSectionSettings(req);
    }
}
