import {BaseService, BoFactory } from '../../Base/Index';
import { UserDefaultServiceBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { UserDefaultServiceAttributes } from '../Model/Interface/Index';
import { UserDefaultServiceFilters } from '../Common/Filters.e';

export class UserDefaultServiceService extends BaseService {
    private UserDefaultServiceBo: UserDefaultServiceBo;
    constructor(req?: Request) {
        super(req);
        this.UserDefaultServiceBo = BoFactory.GetBo(UserDefaultServiceBo, this.Request);
    }

    public async AddUserDefaultService(req: BaseRequest): Promise<number> {
        return await this.UserDefaultServiceBo.AddUserDefaultService(req);
    }

    public async UpdateUserDefaultService(req: BaseRequest): Promise<boolean> {
        return await this.UserDefaultServiceBo.UpdateUserDefaultService(req);
    }

    public async ManageUserDefaultService(req: BaseRequest): Promise<boolean> {
        return await this.UserDefaultServiceBo.ManageUserDefaultService(req);
    }

    public async GetUserDefaultServiceById(req: BaseRequest): Promise<UserDefaultServiceAttributes> {
        return await this.UserDefaultServiceBo.GetUserDefaultServiceById(req);
    }

    public async GetUserDefaultServices(apiReq?: ApiRequest<UserDefaultServiceFilters>):
        Promise<ApiResponse<UserDefaultServiceAttributes[]>> {
        return await this.UserDefaultServiceBo.GetUserDefaultServices(apiReq);
    }

    public async GetDoctorDefaultServices(req: BaseRequest): Promise<any[]> {
        return await this.UserDefaultServiceBo.GetDoctorDefaultServices(req);
    }



    public async DeleteUserDefaultService(req: BaseRequest): Promise<Boolean> {
        return await this.UserDefaultServiceBo.DeleteUserDefaultService(req);
    }
}
