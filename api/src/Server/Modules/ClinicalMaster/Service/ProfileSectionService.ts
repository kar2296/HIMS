import {BaseService, BoFactory } from '../../Base/Index';
import { ProfileSectionBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { ProfileSectionAttributes } from '../Model/Interface/Index';
import { ProfileSectionFilters } from '../Common/Filters.e';

export class ProfileSectionService extends BaseService {
    private ProfileSectionBo: ProfileSectionBo;
    constructor(req?: Request) {
        super(req);
        this.ProfileSectionBo = BoFactory.GetBo(ProfileSectionBo, this.Request);
    }

    public async AddProfileSection(req: BaseRequest): Promise<number> {
        return await this.ProfileSectionBo.AddProfileSection(req);
    }

    public async UpdateProfileSection(req: BaseRequest): Promise<boolean> {
        return await this.ProfileSectionBo.UpdateProfileSection(req);
    }

    public async ManageProfileSection(req: BaseRequest): Promise<boolean> {
        return await this.ProfileSectionBo.ManageProfileSection(req);
    }

    public async GetProfileSectionById(req: BaseRequest): Promise<ProfileSectionAttributes> {
        return await this.ProfileSectionBo.GetProfileSectionById(req);
    }

    public async GetProfileSections(apiReq?: ApiRequest<ProfileSectionFilters>): Promise<ApiResponse<ProfileSectionAttributes[]>> {
        return await this.ProfileSectionBo.GetProfileSections(apiReq);
    }

    public async DeleteProfileSection(req: BaseRequest): Promise<Boolean> {
        return await this.ProfileSectionBo.DeleteProfileSection(req);
    }
}
