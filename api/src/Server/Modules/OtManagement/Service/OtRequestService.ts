import { BaseService, BoFactory } from '../../Base/Index';
import { OtRequestBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { OtRequestAttributes } from '../Model/Interface/Index';
import { OtRequestFilters } from '../Common/Filters.e';

export class OtRequestService extends BaseService {
    private OtRequestBo: OtRequestBo;
    constructor(req?: Request) {
        super(req);
        this.OtRequestBo = BoFactory.GetBo(OtRequestBo, this.Request);
    }

    public async AddOtRequest(req: BaseRequest): Promise<number> {
        return await this.OtRequestBo.AddOtRequest(req);
    }

    public async UpdateOtRequest(req: BaseRequest): Promise<boolean> {
        return await this.OtRequestBo.UpdateOtRequest(req);
    }

    public async GetOtRequestById(req: BaseRequest): Promise<OtRequestAttributes> {
        return await this.OtRequestBo.GetOtRequestById(req);
    }

    public async GetOtRequests(apiReq?: ApiRequest<OtRequestFilters>): Promise<ApiResponse<OtRequestAttributes[]>> {
        return await this.OtRequestBo.GetOtRequests(apiReq);
    }

    public async DeleteOtRequest(req: BaseRequest): Promise<Boolean> {
        return await this.OtRequestBo.DeleteOtRequest(req);
    }
}
