import {BaseService, BoFactory } from '../../Base/Index';
import { AERegistrationBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { AERegistrationAttributes } from '../Model/Interface/Index';
import { AERegistrationFilters } from '../Common/Filters.e';

export class AERegistrationService extends BaseService {
    private AERegistrationBo: AERegistrationBo;
    constructor(req?: Request) {
        super(req);
        this.AERegistrationBo = BoFactory.GetBo(AERegistrationBo, this.Request);
    }

    public async AddAERegistration(req: BaseRequest): Promise<number> {
        return await this.AERegistrationBo.AddAERegistration(req);
    }

    public async UpdateAERegistration(req: BaseRequest): Promise<boolean> {
        return await this.AERegistrationBo.UpdateAERegistration(req);
    }

    public async GetAERegistrationById(req: BaseRequest): Promise<AERegistrationAttributes> {
        return await this.AERegistrationBo.GetAERegistrationById(req);
    }

    public async GetAERegistrations(apiReq?: ApiRequest<AERegistrationFilters>):
     Promise<ApiResponse<AERegistrationAttributes[]>> {
        return await this.AERegistrationBo.GetAERegistrations(apiReq);
    }

    public async DeleteAERegistration(req: BaseRequest): Promise<Boolean> {
        return await this.AERegistrationBo.DeleteAERegistration(req);
    }
}
