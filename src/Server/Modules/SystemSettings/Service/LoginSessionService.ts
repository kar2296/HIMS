import {BaseService, BoFactory } from '../../Base/Index';
import { LoginSessionBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { LoginSessionAttributes } from '../Model/Interface/Index';
import { LoginSessionFilters } from '../Common/Filters.e';

export class LoginSessionService extends BaseService {
    private LoginSessionBo: LoginSessionBo;
    constructor(req?: Request) {
        super(req);
        this.LoginSessionBo = BoFactory.GetBo(LoginSessionBo, this.Request);
    }

    public async AddLoginSession(req: BaseRequest): Promise<number> {
        return await this.LoginSessionBo.AddLoginSession(req);
    }

    public async checkExistingLoginSession(req: BaseRequest): Promise<number> {
        return await this.LoginSessionBo.checkExistingLoginSession(req);
    }

    public async KeepAlive(req: BaseRequest): Promise<boolean> {
        return await this.LoginSessionBo.KeepAlive(req);
    }

    public async GetLicenseDetails(req: BaseRequest): Promise<any> {
        return await this.LoginSessionBo.GetLicenseDetails(req);
    }

    public async GetLoginSessionById(req: BaseRequest): Promise<LoginSessionAttributes> {
        return await this.LoginSessionBo.GetLoginSessionById(req);
    }

    public async GetLoginSessions(apiReq?: ApiRequest<LoginSessionFilters>): Promise<ApiResponse<LoginSessionAttributes[]>> {
        return await this.LoginSessionBo.GetLoginSessions(apiReq);
    }

    public async DeleteLoginSession(req: BaseRequest): Promise<Boolean> {
        return await this.LoginSessionBo.DeleteLoginSession(req);
    }
}
