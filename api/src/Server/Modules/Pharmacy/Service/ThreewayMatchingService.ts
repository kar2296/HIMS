import { BaseService, BoFactory } from '../../Base/Index';
import { ThreewayMatchingBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { ThreewayMatchingAttributes } from '../Model/Interface/Index';
import { ThreewayMatchingFilters } from '../Common/Filters.e';

export class ThreewayMatchingService extends BaseService {
    private ThreewayMatchingBo: ThreewayMatchingBo;
    constructor(req?: Request) {
        super(req);
        this.ThreewayMatchingBo = BoFactory.GetBo(ThreewayMatchingBo, this.Request);
    }

    public async AddThreewayMatching(req: BaseRequest): Promise<number> {
        return await this.ThreewayMatchingBo.AddThreewayMatching(req);
    }

    public async UpdateThreewayMatching(req: BaseRequest): Promise<boolean> {
        return await this.ThreewayMatchingBo.UpdateThreewayMatching(req);
    }

    public async GetThreewayMatchingById(req: BaseRequest): Promise<ThreewayMatchingAttributes> {
        return await this.ThreewayMatchingBo.GetThreewayMatchingById(req);
    }

    public async GetThreewayMatching(apiReq?: ApiRequest<ThreewayMatchingFilters>): Promise<ApiResponse<ThreewayMatchingAttributes[]>> {
        return await this.ThreewayMatchingBo.GetThreewayMatching(apiReq);
    }

    public async DeleteThreewayMatching(req: BaseRequest): Promise<Boolean> {
        return await this.ThreewayMatchingBo.DeleteThreewayMatching(req);
    }
}
