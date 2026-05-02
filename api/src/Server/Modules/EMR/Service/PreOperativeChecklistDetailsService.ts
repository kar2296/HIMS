import { BaseService, BoFactory } from '../../Base/Index';
import { PreOperativeChecklistDetailsBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { PreOperativeChecklistDetailsAttributes } from '../Model/Interface/Index';
import { PreOperativeChecklistDetailsFilters } from '../Common/Filters.e';

export class PreOperativeChecklistDetailsService extends BaseService {
    private PreOperativeChecklistDetailsBo: PreOperativeChecklistDetailsBo;
    constructor(req?: Request) {
        super(req);
        this.PreOperativeChecklistDetailsBo = BoFactory.GetBo(PreOperativeChecklistDetailsBo, this.Request);
    }

    public async AddPreOperativeChecklistDetails(req: BaseRequest): Promise<number> {
        return await this.PreOperativeChecklistDetailsBo.AddPreOperativeChecklistDetails(req);
    }

    public async UpdatePreOperativeChecklistDetails(req: BaseRequest): Promise<boolean> {
        return await this.PreOperativeChecklistDetailsBo.UpdatePreOperativeChecklistDetails(req);
    }

    public async ManagePreOperativeChecklistDetails(req: BaseRequest): Promise<PreOperativeChecklistDetailsAttributes> {
        return await this.PreOperativeChecklistDetailsBo.GetPreOperativeChecklistDetailsById(req);
    }
    public async GetPreOperativeChecklistDetailsById(req: BaseRequest): Promise<PreOperativeChecklistDetailsAttributes> {
        return await this.PreOperativeChecklistDetailsBo.GetPreOperativeChecklistDetailsById(req);
    }
    public async GetPreOperativeChecklistDetails(apiReq?: ApiRequest<PreOperativeChecklistDetailsFilters>
    ): Promise<ApiResponse<PreOperativeChecklistDetailsAttributes[]>> {
        return await this.PreOperativeChecklistDetailsBo.GetPreOperativeChecklistDetails(apiReq);
    }
    public async DeletePreOperativeChecklistDetails(req: BaseRequest): Promise<Boolean> {
        return await this.PreOperativeChecklistDetailsBo.DeletePreOperativeChecklistDetails(req);
    }
}
