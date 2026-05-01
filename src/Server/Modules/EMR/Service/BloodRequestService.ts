import { BaseService, BoFactory } from '../../Base/Index';
import { BloodRequestBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { BloodRequestAttributes } from '../Model/Interface/Index';
import { BloodRequestFilters } from '../Common/Filters.e';

export class BloodRequestService extends BaseService {
    private BloodRequestBo: BloodRequestBo;
    constructor(req?: Request) {
        super(req);
        this.BloodRequestBo = BoFactory.GetBo(BloodRequestBo, this.Request);
    }

    public async AddBloodRequest(req: BaseRequest): Promise<number> {
        return await this.BloodRequestBo.AddBloodRequest(req);
    }

    public async UpdateBloodRequest(req: BaseRequest): Promise<boolean> {
        return await this.BloodRequestBo.UpdateBloodRequest(req);
    }

    public async GetBloodRequestById(req: BaseRequest): Promise<BloodRequestAttributes> {
        return await this.BloodRequestBo.GetBloodRequestById(req);
    }

    public async GetBloodRequests(apiReq?: ApiRequest<BloodRequestFilters>):
        Promise<ApiResponse<BloodRequestAttributes[]>> {
        return await this.BloodRequestBo.GetBloodRequests(apiReq);
    }

    public async DeleteBloodRequest(req: BaseRequest): Promise<Boolean> {
        return await this.BloodRequestBo.DeleteBloodRequest(req);
    }
}
