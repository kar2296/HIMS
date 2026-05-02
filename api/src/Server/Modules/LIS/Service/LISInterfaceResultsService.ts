import { BaseService, BoFactory } from '../../Base/Index';
import { LISInterfaceResultsBo } from '../Business/Index';
import { BaseRequest, ApiRequest, ApiResponse } from '../../../Common/Index';
import { LISInterfaceResultAttributes } from '../Model/Interface/Index';
import { LISInterfaceResultsFilters } from '../Common/Filters.e';
import { Request } from '../../../Core/Index';

export class LISInterfaceResultsService extends BaseService {
    private LISInterfaceResultsBo: LISInterfaceResultsBo;
    constructor(req?: Request) {
        super(req);
        this.LISInterfaceResultsBo = BoFactory.GetBo(LISInterfaceResultsBo, this.Request);
    }

    public async AddLISResult(req: BaseRequest): Promise<any> {
        return await this.LISInterfaceResultsBo.AddLISResult(req);
    }

    public async UpdateLISResult(req: BaseRequest): Promise<any> {
        return await this.LISInterfaceResultsBo.UpdateLISResult(req);
    }

    public async GetLISResultsById(req: BaseRequest): Promise<any> {
        return await this.LISInterfaceResultsBo.GetLISResultsById(req);
    }

    public async GetLISResults(apiReq?: ApiRequest<LISInterfaceResultsFilters>):
        Promise<ApiResponse<LISInterfaceResultAttributes[]>> {
        return await this.LISInterfaceResultsBo.GetLISResults(apiReq);
    }

    public async GetLISResultsWithoutGroup(apiReq?: ApiRequest<LISInterfaceResultsFilters>):
        Promise<ApiResponse<LISInterfaceResultAttributes[]>> {
        return await this.LISInterfaceResultsBo.GetLISResultsWithoutGroup(apiReq);
    }

    public async DeleteLISResults(req: BaseRequest): Promise<any> {
        return await this.LISInterfaceResultsBo.DeleteLISResults(req);
    }

}
