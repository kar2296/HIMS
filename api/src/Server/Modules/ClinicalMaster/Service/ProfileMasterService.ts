import {BaseService, BoFactory } from '../../Base/Index';
import { ProfileMasterBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { ProfileMasterAttributes } from '../Model/Interface/Index';
import { ProfileMasterFilters } from '../Common/Filters.e';

export class ProfileMasterService extends BaseService {
    private ProfileMasterBo: ProfileMasterBo;
    constructor(req?: Request) {
        super(req);
        this.ProfileMasterBo = BoFactory.GetBo(ProfileMasterBo, this.Request);
    }

    public async AddProfileMaster(req: BaseRequest): Promise<number> {
        return await this.ProfileMasterBo.AddProfileMaster(req);
    }

    public async UpdateProfileMaster(req: BaseRequest): Promise<boolean> {
        return await this.ProfileMasterBo.UpdateProfileMaster(req);
    }

    public async GetProfileMasterById(req: BaseRequest): Promise<ProfileMasterAttributes> {
        return await this.ProfileMasterBo.GetProfileMasterById(req);
    }

    public async GetProfileMasters(apiReq?: ApiRequest<ProfileMasterFilters>): Promise<ApiResponse<ProfileMasterAttributes[]>> {
        return await this.ProfileMasterBo.GetProfileMasters(apiReq);
    }

    public async DeleteProfileMaster(req: BaseRequest): Promise<Boolean> {
        return await this.ProfileMasterBo.DeleteProfileMaster(req);
    }

    public async UpdatePrintConfig(req: BaseRequest): Promise<Boolean> {
        return await this.ProfileMasterBo.UpdatePrintConfig(req);
    }
}
